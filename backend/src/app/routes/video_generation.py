from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.video_generation import VideoGenerationRequest, VideoGenerationResponse
from app.services.video_generation import VideoGenerationService

api_router = APIRouter(
    prefix="/video",
    tags=["Video"],
)


@api_router.post("/generate", response_model=VideoGenerationResponse)
async def generate_video(  # noqa: ANN201
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Generate a video with AI voiceover directly from a Google Drive file.

    The Google Drive file ID should be provided in the JSON body as
    `fileId` (camelCase) or `file_id` (snake_case).
    """
    if not request.file_id:
        raise HTTPException(
            status_code=400,
            detail="Missing Google Drive file ID in request body (field `fileId`)",
        )

    try:
        service = VideoGenerationService()

        title = request.title or "lesson"
        video_filename = f"video_{title.replace(' ', '_').lower()}.mp4"

        video_path = await service.create_video(
            fileid=request.file_id,
            userid=current_user.id,  # pyright: ignore[reportArgumentType]
            template_name=request.template_name,  # pyright: ignore[reportArgumentType]
            output_filename=video_filename,
        )

        background_tasks.add_task(service.cleanup_old_videos)

        return VideoGenerationResponse(
            video_id=video_path.stem,
            video_url=service.get_video_url(video_path),
            status="completed",
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Video generation failed: {e}")  # noqa: B904


@api_router.get("/my")
async def list_my_videos(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """List all generated videos for the current user.

    Uses the filename convention where generated videos start with the user's id.
    Returns a JSON object with a `videos` list of metadata entries.
    """
    service = VideoGenerationService()
    userid = getattr(current_user, "id", None)
    if userid is None:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if not isinstance(userid, int):
        try:
            userid = int(userid)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid user id") from None

    videos = service.list_videos_for_user(userid)
    return {"videos": videos}


@api_router.get("/{filename}", response_model=None)
async def serve_video(
    filename: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> FileResponse:
    """Serve generated video files."""
    service = VideoGenerationService()
    safe_name = service.outputs_dir / filename
    video_path = safe_name.resolve()
    outputs_dir = service.outputs_dir.resolve()
    userid = getattr(current_user, "id", None)

    if (
        not isinstance(userid, int)
        or not filename.startswith(f"{userid}_")
        or video_path.parent != outputs_dir
        or not video_path.exists()
    ):
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(path=str(video_path), media_type="video/mp4", filename=filename)


@api_router.get("/templates/list")
async def list_templates() -> dict:
    """List available video templates."""
    service = VideoGenerationService()
    templates = []

    for template_file in service.templates_dir.glob("*.mp4"):
        templates.append(  # noqa: PERF401
            {
                "name": template_file.name,
                "size": template_file.stat().st_size,
                "created": template_file.stat().st_mtime,
            },
        )

    return {"templates": templates}


@api_router.delete("/cleanup")
async def cleanup_videos(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """Manually trigger cleanup of old videos."""
    if current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user id")
    service = VideoGenerationService()
    service.cleanup_old_videos()
    return {"message": "Cleanup completed"}
