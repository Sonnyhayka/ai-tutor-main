from pydantic import BaseModel, ConfigDict, Field


class VideoGenerationRequest(BaseModel):
    file_id: str | None = Field(None, alias="fileId")
    title: str | None = "AI Tutor Video"
    template_name: str | None = "mc-template.mp4"

    model_config = ConfigDict(validate_by_name=True)


class VideoGenerationResponse(BaseModel):
    video_id: str
    video_url: str
    status: str
