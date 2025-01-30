// src/types/socket.ts
import type { Socket } from "socket.io";

// ================== Event Payload Interfaces ==================
interface JoinRequestPayload {
  roomId: string;
  username: string;
}

interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileStructure[];
}

interface DirectoryOperationPayload {
  parentDirId: string;
  newDirectory: FileStructure;
}

interface FileOperationPayload {
  parentDirId: string;
  newFile: FileStructure;
}

interface UpdateFileContentPayload {
  fileId: string;
  newContent: string;
}

interface RenamePayload {
  dirId: string;
  newName: string;
}

interface MessagePayload {
  message: string;
  sender: string;
  timestamp: number;
}

interface DrawingData {
  x: number;
  y: number;
  color: string;
  tool: 'pen' | 'eraser';
}

// ================== Core Types ==================
type SocketId = string;

enum SocketEvent {
  JOIN_REQUEST = "join-request",
  JOIN_ACCEPTED = "join-accepted",
  USER_JOINED = "user-joined",
  USER_DISCONNECTED = "user-disconnected",
  SYNC_FILE_STRUCTURE = "sync-file-structure",
  DIRECTORY_CREATED = "directory-created",
  DIRECTORY_UPDATED = "directory-updated",
  DIRECTORY_RENAMED = "directory-renamed",
  DIRECTORY_DELETED = "directory-deleted",
  FILE_CREATED = "file-created",
  FILE_UPDATED = "file-updated",
  FILE_RENAMED = "file-renamed",
  FILE_DELETED = "file-deleted",
  USER_OFFLINE = "offline",
  USER_ONLINE = "online",
  SEND_MESSAGE = "send-message",
  RECEIVE_MESSAGE = "receive-message",
  TYPING_START = "typing-start",
  TYPING_PAUSE = "typing-pause",
  USERNAME_EXISTS = "username-exists",
  REQUEST_DRAWING = "request-drawing",
  SYNC_DRAWING = "sync-drawing",
  DRAWING_UPDATE = "drawing-update",
}

interface SocketContext {
  socket: Socket;
}

// Export all types
export {
  SocketEvent,
  SocketContext,
  SocketId,
  JoinRequestPayload,
  FileStructure,
  DirectoryOperationPayload,
  FileOperationPayload,
  UpdateFileContentPayload,
  RenamePayload,
  MessagePayload,
  DrawingData
};