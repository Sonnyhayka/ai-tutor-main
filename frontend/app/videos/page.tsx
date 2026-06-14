"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  listMyVideos,
  generateVideo,
  ApiError,
  clearAuthTokens,
  getFilesForCourse,
  getCourses,
} from "@/lib/api";
import { Play } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";


type Video = {
  filename: string;
  url: string;
  created: string;
};

type FileResponse = {
  id: number;
  name: string;
  google_drive_id?: string | null;
  course_name: string;
  created_at: string;
};

const VideosPage = () => {
  const router = useRouter();
  const { isDark } = useDarkMode();

  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const resp = await listMyVideos();
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const mapped = (resp.videos || []).map((v) => {
          const url = v.video_url || "";
          const fullUrl = url.startsWith("http")
            ? url
            : `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
          return {
            filename: v.filename,
            url: fullUrl,
            created: v.created,
          };
        });
        setVideos(mapped);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load videos";
        setError(msg);
        if (err instanceof ApiError && err.status === 401) {
          clearAuthTokens();
          router.push("/login");
        }
      } finally {
        setIsLoadingVideos(false);
      }
    };

    loadVideos();
  }, [router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await getCourses();

        if (coursesData.length > 0) {
          const allFiles = await Promise.all(
            coursesData.map((course) => getFilesForCourse(course.id))
          );
          setFiles(allFiles.flat());
        }
      } catch (err) {
        console.error("Failed to load courses/files:", err);
      }
    };

    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedFileId) {
      setError("Please select a file to generate a video.");
      return;
    }
    try {
      setIsGenerating(true);
      setError(null);
      const selectedFile = files.find(
        (f) => f.id.toString() === selectedFileId
      );

      if (!selectedFile?.google_drive_id) {
        setError("Selected file does not have a valid Google Drive ID.");
        setIsGenerating(false);
        return;
      }

      const title = searchQuery.trim() || "Generated Video";
      await generateVideo({ file_id: selectedFile.google_drive_id, title });

      const resp = await listMyVideos();
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const mapped = (resp.videos || []).map((v) => {
        const url = v.video_url || "";
        const fullUrl = url.startsWith("http")
          ? url
          : `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
        return {
          filename: v.filename,
          url: fullUrl,
          created: v.created,
        };
      });
      setVideos(mapped);
      setSelectedFileId(null);
      setSearchQuery("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate video";
      setError(msg);
      if (err instanceof ApiError && err.status === 401) {
        clearAuthTokens();
        router.push("/login");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen p-8 ${
      isDark ? "bg-gray-800" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Generated Videos
          </h1>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Visual explanations generated from your source materials.
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDark
              ? "bg-red-900/30 border border-red-600 text-red-300"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {error}
          </div>
        )}

        <div className={`mb-8 p-6 border rounded-lg ${
          isDark
            ? "bg-gray-700 border-gray-600"
            : "bg-white border-gray-200"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>Generate New Video</h2>
          <div className="flex gap-4 flex-wrap">
            <select
              value={selectedFileId || ""}
              onChange={(e) => setSelectedFileId(e.target.value || null)}
              className={`flex-1 min-w-[200px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-600 border-gray-500 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              disabled={isGenerating}
            >
              <option value="">Select a file...</option>
              {files.map((file) => (
                <option key={file.id} value={file.id.toString()}>
                  {file.name} ({file.course_name})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Video title (optional)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 min-w-[200px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              disabled={isGenerating}
            />

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFileId}
              className="px-6"
            >
              {isGenerating ? "Generating..." : "Generate Video"}
            </Button>
          </div>
        </div>

        {isLoadingVideos ? (
          <div className="flex items-center justify-center py-20">
            <div className={isDark ? "text-gray-400" : "text-gray-600"}>
              Loading videos...
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className={`mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                No videos generated yet
              </p>
              <p className={`text-sm ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                Select a file and generate your first video!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const cleanTitle = video.filename
                .replace(/^\d+_video_/, "")
                .replace(/\.mp4$/, "")
                .replaceAll("_", " ")
                .replace(/^([a-f0-9]{32})$/i, "Generated Video")
                .trim();

              return (
                <div
                  key={video.url}
                  className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className={`relative aspect-video ${
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  }`}>
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 rounded-full p-4">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className={`font-semibold text-base line-clamp-2 leading-snug mb-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {cleanTitle}
                    </h3>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(video.url, "_blank")}
                      className={`w-full ${
                        isDark
                          ? "border-gray-600 text-gray-200 hover:bg-gray-600"
                          : ""
                      }`}
                    >
                      View Full Screen
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
