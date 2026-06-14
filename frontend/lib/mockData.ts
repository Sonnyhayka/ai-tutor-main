import type {
  Course,
  FileResponse,
  FileCreate,
  DriveFile,
  TutorSession,
  ChatMessage,
  UserProfile,
  UserUpdate,
  VideoResponse,
  VideoListResponse,
  VideoGenerationResponse,
  LoginResponse,
} from "./api";

export const DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL;

const DEMO_TOKEN = "demo-access-token";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const nowIso = () => new Date().toISOString();

interface StoredSession {
  id: number;
  title: string | null;
  course_id: number;
  course_name: string;
  created_at: string;
}

interface StoredMessage {
  id: number;
  role: "user" | "assistant";
  message: string;
  tutor_session_id: number;
  tutor_session_title?: string | null;
  created_at: string;
}

interface Store {
  user: UserProfile;
  courses: Course[];
  files: FileResponse[];
  sessions: StoredSession[];
  messages: StoredMessage[];
  videos: VideoResponse[];
  counters: {
    course: number;
    file: number;
    session: number;
    message: number;
    video: number;
  };
}

const seedAssistantReply = [
  "Happy to help! Here's a quick way to think about the **ratio test**.",
  "",
  "## The idea",
  "Given a series with terms `a_n`, look at the limit of `|a_(n+1) / a_n|` as n grows.",
  "",
  "## What the result tells you",
  "- If the limit is **less than 1**, the series *converges absolutely*",
  "- If the limit is **greater than 1**, the series *diverges*",
  "- If the limit equals 1, the test is inconclusive and you try another approach",
  "",
  "Want to work through a specific example together?",
].join("\n");

const createStore = (): Store => {
  const courses: Course[] = [
    {
      id: 1,
      name: "Calculus II",
      description: "Integration techniques, sequences, and infinite series.",
    },
    {
      id: 2,
      name: "Introduction to Psychology",
      description: "Core theories of human behavior and cognition.",
    },
    {
      id: 3,
      name: "Organic Chemistry",
      description: "Reaction mechanisms, stereochemistry, and synthesis.",
    },
  ];

  const files: FileResponse[] = [
    {
      id: 1,
      name: "Integration by Parts.pdf",
      google_drive_id: "demo-drive-101",
      course_name: "Calculus II",
      created_at: "2026-05-02T14:21:00.000Z",
    },
    {
      id: 2,
      name: "Taylor Series Notes.pdf",
      google_drive_id: "demo-drive-102",
      course_name: "Calculus II",
      created_at: "2026-05-04T09:05:00.000Z",
    },
    {
      id: 3,
      name: "Practice Problems Set 3.docx",
      google_drive_id: "demo-drive-103",
      course_name: "Calculus II",
      created_at: "2026-05-09T17:48:00.000Z",
    },
    {
      id: 4,
      name: "Cognitive Biases Overview.pdf",
      google_drive_id: "demo-drive-201",
      course_name: "Introduction to Psychology",
      created_at: "2026-04-28T11:12:00.000Z",
    },
    {
      id: 5,
      name: "Memory and Learning.pptx",
      google_drive_id: "demo-drive-202",
      course_name: "Introduction to Psychology",
      created_at: "2026-05-01T08:33:00.000Z",
    },
    {
      id: 6,
      name: "SN1 vs SN2 Reactions.pdf",
      google_drive_id: "demo-drive-301",
      course_name: "Organic Chemistry",
      created_at: "2026-05-06T19:27:00.000Z",
    },
  ];

  const sessions: StoredSession[] = [
    {
      id: 1,
      title: "Series convergence help",
      course_id: 1,
      course_name: "Calculus II",
      created_at: "2026-05-10T13:00:00.000Z",
    },
  ];

  const messages: StoredMessage[] = [
    {
      id: 1,
      role: "user",
      message: "Can you explain the ratio test for series convergence?",
      tutor_session_id: 1,
      tutor_session_title: "Series convergence help",
      created_at: "2026-05-10T13:00:05.000Z",
    },
    {
      id: 2,
      role: "assistant",
      message: seedAssistantReply,
      tutor_session_id: 1,
      tutor_session_title: "Series convergence help",
      created_at: "2026-05-10T13:00:09.000Z",
    },
  ];

  const videos: VideoResponse[] = [
    {
      id: 1,
      filename: "1_video_Integration_by_Parts.mp4",
      video_url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      created: "2026-05-11T16:40:00.000Z",
    },
    {
      id: 2,
      filename: "1_video_Taylor_Series_Explained.mp4",
      video_url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      created: "2026-05-12T10:15:00.000Z",
    },
  ];

  return {
    user: {
      id: 1,
      email: "demo@aitutor.app",
      first_name: "Demo",
      last_name: "Student",
    },
    courses,
    files,
    sessions,
    messages,
    videos,
    counters: { course: 3, file: 6, session: 1, message: 2, video: 2 },
  };
};

const store = createStore();

const setDemoToken = (email: string) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("access_token", DEMO_TOKEN);
  localStorage.setItem("token_type", "bearer");
  localStorage.setItem("email", email);
};

const courseNameFor = (courseId: number) =>
  store.courses.find((course) => course.id === courseId)?.name ?? "Class";

const buildTutorReply = (question: string, courseName: string) =>
  [
    `Good question about *${courseName}*. Let's break down **"${question.trim()}"** step by step.`,
    "",
    "## How to approach it",
    "- Restate the problem in your own words",
    "- Identify the core concept it is testing",
    "- Work through a simpler version first",
    "- Verify your answer against an edge case",
    "",
    "In a connected environment I would pull context from your uploaded documents to tailor this further. Want a worked example next?",
  ].join("\n");

export const mockLogin = async (email: string): Promise<LoginResponse> => {
  await delay(250);
  store.user = { id: 1, email, first_name: null, last_name: null };
  return { access_token: DEMO_TOKEN, token_type: "bearer" };
};

export const mockRegister = async (
  email: string,
  firstName: string,
  lastName: string
): Promise<{ redirect_url?: string }> => {
  await delay(300);
  store.user = {
    id: 1,
    email,
    first_name: firstName,
    last_name: lastName,
  };
  setDemoToken(email);
  return {};
};

export const mockGetCurrentUser = async (): Promise<UserProfile> => {
  await delay(150);
  return { ...store.user };
};

export const mockUpdateUserProfile = async (
  data: UserUpdate
): Promise<UserProfile> => {
  await delay(200);
  store.user = {
    ...store.user,
    first_name: data.first_name ?? store.user.first_name,
    last_name: data.last_name ?? store.user.last_name,
  };
  return { ...store.user };
};

export const mockGetCourses = async (): Promise<Course[]> => {
  await delay(200);
  return store.courses.map((course) => ({ ...course }));
};

export const mockGetCourseById = async (courseId: number): Promise<Course> => {
  await delay(150);
  const course = store.courses.find((item) => item.id === courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  return { ...course };
};

export const mockCreateCourse = async (input: {
  name: string;
  description?: string;
}): Promise<Course> => {
  await delay(250);
  store.counters.course += 1;
  const course: Course = {
    id: store.counters.course,
    name: input.name,
    description: input.description ?? "",
  };
  store.courses.push(course);
  return { ...course };
};

export const mockUpdateCourse = async (
  courseId: number,
  input: { name: string; description?: string }
): Promise<Course> => {
  await delay(200);
  const course = store.courses.find((item) => item.id === courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  course.name = input.name;
  if (input.description !== undefined) {
    course.description = input.description;
  }
  return { ...course };
};

export const mockDeleteCourse = async (courseId: number): Promise<void> => {
  await delay(200);
  const name = courseNameFor(courseId);
  store.courses = store.courses.filter((item) => item.id !== courseId);
  store.files = store.files.filter((file) => file.course_name !== name);
  store.sessions = store.sessions.filter(
    (session) => session.course_id !== courseId
  );
};

export const mockGetFilesForCourse = async (
  courseId: number
): Promise<FileResponse[]> => {
  await delay(150);
  const name = courseNameFor(courseId);
  return store.files
    .filter((file) => file.course_name === name)
    .map((file) => ({ ...file }));
};

export const mockGetAllFiles = async (): Promise<FileResponse[]> => {
  await delay(150);
  return store.files.map((file) => ({ ...file }));
};

export const mockCreateFile = async (
  payload: FileCreate
): Promise<FileResponse> => {
  await delay(200);
  store.counters.file += 1;
  const file: FileResponse = {
    id: store.counters.file,
    name: payload.name,
    google_drive_id: payload.google_drive_id,
    course_name: courseNameFor(payload.course_id),
    created_at: nowIso(),
  };
  store.files.push(file);
  return { ...file };
};

export const mockDeleteFile = async (fileId: number): Promise<void> => {
  await delay(150);
  store.files = store.files.filter((file) => file.id !== fileId);
};

export const mockSearchDrive = async (query?: string): Promise<DriveFile[]> => {
  await delay(400);
  const results: DriveFile[] = [
    {
      id: "demo-drive-501",
      name: "Lecture 12 - Power Series.pdf",
      mimeType: "application/pdf",
      modifiedTime: "2026-05-08T15:00:00.000Z",
    },
    {
      id: "demo-drive-502",
      name: "Exam 2 Study Guide.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      modifiedTime: "2026-05-09T12:30:00.000Z",
    },
    {
      id: "demo-drive-503",
      name: "Homework Solutions.pdf",
      mimeType: "application/pdf",
      modifiedTime: "2026-05-10T09:10:00.000Z",
    },
    {
      id: "demo-drive-504",
      name: "Lab Report Template.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      modifiedTime: "2026-05-07T18:45:00.000Z",
    },
  ];
  if (!query) {
    return results;
  }
  const lowered = query.toLowerCase();
  const filtered = results.filter((item) =>
    item.name.toLowerCase().includes(lowered)
  );
  return filtered.length > 0 ? filtered : results;
};

export const mockGetTutorSessionsByCourse = async (
  courseId: number
): Promise<TutorSession[]> => {
  await delay(150);
  return store.sessions
    .filter((session) => session.course_id === courseId)
    .map((session) => ({
      id: session.id,
      title: session.title,
      course_name: session.course_name,
      created_at: session.created_at,
    }));
};

export const mockCreateTutorSession = async (payload: {
  course_id: number;
  title?: string | null;
}): Promise<TutorSession> => {
  await delay(200);
  store.counters.session += 1;
  const session: StoredSession = {
    id: store.counters.session,
    title: payload.title ?? "New Session",
    course_id: payload.course_id,
    course_name: courseNameFor(payload.course_id),
    created_at: nowIso(),
  };
  store.sessions.push(session);
  return {
    id: session.id,
    title: session.title,
    course_name: session.course_name,
    created_at: session.created_at,
  };
};

export const mockGetTutorSessionMessages = async (
  tutorSessionId: number
): Promise<ChatMessage[]> => {
  await delay(150);
  return store.messages
    .filter((message) => message.tutor_session_id === tutorSessionId)
    .map((message) => ({
      id: message.id,
      role: message.role,
      message: message.message,
      tutor_session_title: message.tutor_session_title,
      created_at: message.created_at,
    }));
};

export const mockSendMessage = async (payload: {
  tutor_session_id: number;
  message: string;
}): Promise<ChatMessage> => {
  await delay(700);
  const session = store.sessions.find(
    (item) => item.id === payload.tutor_session_id
  );
  store.counters.message += 1;
  const userMessage: StoredMessage = {
    id: store.counters.message,
    role: "user",
    message: payload.message,
    tutor_session_id: payload.tutor_session_id,
    tutor_session_title: session?.title,
    created_at: nowIso(),
  };
  store.messages.push(userMessage);

  store.counters.message += 1;
  const assistantMessage: StoredMessage = {
    id: store.counters.message,
    role: "assistant",
    message: buildTutorReply(
      payload.message,
      session?.course_name ?? "this class"
    ),
    tutor_session_id: payload.tutor_session_id,
    tutor_session_title: session?.title,
    created_at: nowIso(),
  };
  store.messages.push(assistantMessage);

  return {
    id: assistantMessage.id,
    role: assistantMessage.role,
    message: assistantMessage.message,
    tutor_session_title: assistantMessage.tutor_session_title,
    created_at: assistantMessage.created_at,
  };
};

export const mockListMyVideos = async (): Promise<VideoListResponse> => {
  await delay(250);
  return { videos: store.videos.map((video) => ({ ...video })) };
};

export const mockGenerateVideo = async (payload: {
  file_id: string;
  title: string;
  template_name?: string;
}): Promise<VideoGenerationResponse> => {
  await delay(900);
  store.counters.video += 1;
  const safeTitle = (payload.title || "Generated Video")
    .trim()
    .replace(/\s+/g, "_");
  const video: VideoResponse = {
    id: store.counters.video,
    filename: `1_video_${safeTitle}.mp4`,
    video_url:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    created: nowIso(),
  };
  store.videos.unshift(video);
  return { id: video.id, filename: video.filename, status: "completed" };
};
