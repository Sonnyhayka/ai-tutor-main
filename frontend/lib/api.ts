import {
  DEMO_MODE,
  mockLogin,
  mockRegister,
  mockGetCurrentUser,
  mockUpdateUserProfile,
  mockGetCourses,
  mockGetCourseById,
  mockCreateCourse,
  mockUpdateCourse,
  mockDeleteCourse,
  mockGetFilesForCourse,
  mockGetAllFiles,
  mockCreateFile,
  mockDeleteFile,
  mockSearchDrive,
  mockGetTutorSessionsByCourse,
  mockCreateTutorSession,
  mockGetTutorSessionMessages,
  mockSendMessage,
  mockListMyVideos,
  mockGenerateVideo,
} from "./mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Course = {
  id: number;
  name: string;
  description: string;
};

export type FileResponse = {
  id: number;
  name: string;
  google_drive_id?: string | null;
  course_name: string;
  created_at: string;
};

export type FileCreate = {
  name: string;
  google_drive_id: string;
  course_id: number;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
};

export type TutorSession = {
  id: number;
  title: string | null;
  course_name: string;
  created_at: string;
};

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  message: string;
  tutor_session_title?: string | null;
  created_at: string;
};

export type UserProfile = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type UserUpdate = {
  first_name?: string;
  last_name?: string;
};

export type VideoResponse = {
  id: number;
  filename: string;
  video_url: string;
  created: string;
};

export type VideoListResponse = {
  videos: VideoResponse[];
};

export type VideoGenerationResponse = {
  id: number;
  filename: string;
  status: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const getStoredAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("email");
    localStorage.removeItem("token_type");
    localStorage.removeItem("google_drive_setup_complete");
  }
};

const buildAuthHeaders = (headers?: HeadersInit) => {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const merged = new Headers(headers);
  merged.set("Authorization", `Bearer ${token}`);
  merged.set("Accept", "application/json");
  return merged;
};

const handleResponse = async <T>(response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail && Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err: { msg: string }) => err.msg).join(", ");
      } else if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      }
    } catch (err) {
      console.error("Failed to parse error response", err);
    }
    throw new ApiError(errorMessage, response.status);
  }
  return response.json() as Promise<T>;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  if (DEMO_MODE) {
    return mockLogin(email);
  }
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/api/v1/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = data.message || data.detail || "Login failed";
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  if (DEMO_MODE) {
    return mockRegister(email, firstName, lastName);
  }
  try {
    const response = await fetch(`${API_URL}/api/v1/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = data.message || data.detail || "Registration failed";
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const getCourses = async (): Promise<Course[]> => {
  if (DEMO_MODE) {
    return mockGetCourses();
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/courses/`, {
    method: "GET",
    headers,
  });

  return handleResponse<Course[]>(response);
};

export const createCourse = async (course: {
  name: string;
  description?: string;
}): Promise<Course> => {
  if (DEMO_MODE) {
    return mockCreateCourse(course);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/courses/`, {
    method: "POST",
    headers,
    body: JSON.stringify(course),
  });

  return handleResponse<Course>(response);
};

export const updateCourse = async (
  courseId: number,
  course: { name: string; description?: string }
): Promise<Course> => {
  if (DEMO_MODE) {
    return mockUpdateCourse(courseId, course);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/courses/${courseId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(course),
  });

  return handleResponse<Course>(response);
};

export const deleteCourse = async (courseId: number): Promise<void> => {
  if (DEMO_MODE) {
    return mockDeleteCourse(courseId);
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/courses/${courseId}`, {
    method: "DELETE",
    headers,
  });

  await handleResponse<void>(response);
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  if (DEMO_MODE) {
    return mockGetCurrentUser();
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/user/me`, {
    method: "GET",
    headers,
  });

  return handleResponse<UserProfile>(response);
};

export const updateUserProfile = async (data: UserUpdate): Promise<UserProfile> => {
  if (DEMO_MODE) {
    return mockUpdateUserProfile(data);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/user/me`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse<UserProfile>(response);
};

export const getCourseById = async (courseId: number): Promise<Course> => {
  if (DEMO_MODE) {
    return mockGetCourseById(courseId);
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/courses/${courseId}`, {
    method: "GET",
    headers,
  });

  return handleResponse<Course>(response);
};

export const getFilesForCourse = async (
  courseId: number
): Promise<FileResponse[]> => {
  if (DEMO_MODE) {
    return mockGetFilesForCourse(courseId);
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/files/course/${courseId}`, {
    method: "GET",
    headers,
  });

  return handleResponse<FileResponse[]>(response);
};

export const getAllFiles = async (): Promise<FileResponse[]> => {
  if (DEMO_MODE) {
    return mockGetAllFiles();
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/files/`, {
    method: "GET",
    headers,
  });

  return handleResponse<FileResponse[]>(response);
};

export const createFile = async (
  payload: FileCreate
): Promise<FileResponse> => {
  if (DEMO_MODE) {
    return mockCreateFile(payload);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/files/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return handleResponse<FileResponse>(response);
};

export const deleteFile = async (fileId: number): Promise<void> => {
  if (DEMO_MODE) {
    return mockDeleteFile(fileId);
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/files/${fileId}`, {
    method: "DELETE",
    headers,
  });

  return handleResponse<void>(response);
};

export const searchDrive = async (query?: string): Promise<DriveFile[]> => {
  if (DEMO_MODE) {
    return mockSearchDrive(query);
  }
  const headers = buildAuthHeaders();
  const url = new URL(`${API_URL}/api/v1/drive/search/`);
  if (query) {
    url.searchParams.append("query", query);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  return handleResponse<DriveFile[]>(response);
};

export const getTutorSessionsByCourse = async (
  courseId: number
): Promise<TutorSession[]> => {
  if (DEMO_MODE) {
    return mockGetTutorSessionsByCourse(courseId);
  }
  const headers = buildAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/v1/courses/${courseId}/tutor-sessions`,
    {
      method: "GET",
      headers,
    }
  );

  return handleResponse<TutorSession[]>(response);
};

export const createTutorSession = async (payload: {
  course_id: number;
  title?: string | null;
}): Promise<TutorSession> => {
  if (DEMO_MODE) {
    return mockCreateTutorSession(payload);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/tutor-session/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      course_id: payload.course_id,
      title: payload.title ?? "New Session",
    }),
  });

  return handleResponse<TutorSession>(response);
};

export const getTutorSessionMessages = async (
  tutorSessionId: number
): Promise<ChatMessage[]> => {
  if (DEMO_MODE) {
    return mockGetTutorSessionMessages(tutorSessionId);
  }
  const headers = buildAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/v1/tutor-session/${tutorSessionId}/messages`,
    {
      method: "GET",
      headers,
    }
  );

  return handleResponse<ChatMessage[]>(response);
};

export const sendMessage = async (payload: {
  tutor_session_id: number;
  message: string;
}): Promise<ChatMessage> => {
  if (DEMO_MODE) {
    return mockSendMessage(payload);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/chat-messages/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      tutor_session_id: payload.tutor_session_id,
      message: payload.message,
      role: "user",
    }),
  });

  return handleResponse<ChatMessage>(response);
};

export const storeAuthTokens = (tokens: {
  access_token: string;
  token_type?: string;
  email?: string;
}) => {
  localStorage.setItem("access_token", tokens.access_token);
  if (tokens.token_type) {
    localStorage.setItem("token_type", tokens.token_type);
  }
  if (tokens.email) {
    localStorage.setItem("email", tokens.email);
  }
};

export const listMyVideos = async (): Promise<VideoListResponse> => {
  if (DEMO_MODE) {
    return mockListMyVideos();
  }
  const headers = buildAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/video/my`, {
    method: "GET",
    headers,
  });

  return handleResponse<VideoListResponse>(response);
};

export const generateVideo = async (payload: {
  file_id: string;
  title: string;
  template_name?: string;
}): Promise<VideoGenerationResponse> => {
  if (DEMO_MODE) {
    return mockGenerateVideo(payload);
  }
  const headers = buildAuthHeaders({ "Content-Type": "application/json" });
  const response = await fetch(`${API_URL}/api/v1/video/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return handleResponse<VideoGenerationResponse>(response);
};
