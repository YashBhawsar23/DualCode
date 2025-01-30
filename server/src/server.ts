import express, { Response, Request } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";  // Changed Socket import
import path from "path";
import { fileURLToPath } from "url";
import {
  SocketEvent,
  SocketId,
  type JoinRequestPayload,
  type FileStructure,
  type DirectoryOperationPayload,
  type FileOperationPayload,
  type UpdateFileContentPayload,
  type RenamePayload,
  type MessagePayload,
  type DrawingData
} from "./types/socket";
import { USER_CONNECTION_STATUS, type User } from "./types/user";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});

let userSocketMap: User[] = [];

// Type the return values explicitly
function getUsersInRoom(roomId: string): User[] {
  return userSocketMap.filter((user) => user.roomId === roomId);
}

function getRoomId(socketId: SocketId): string | null {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  return user?.roomId || null;
}

function getUserBySocketId(socketId: SocketId): User | null {
  return userSocketMap.find((user) => user.socketId === socketId) || null;
}

io.on("connection", (socket: Socket) => {  // Added Socket type
  socket.on(SocketEvent.JOIN_REQUEST, (payload: JoinRequestPayload) => {
    const { roomId, username } = payload;
    
    const isUsernameExist = getUsersInRoom(roomId).some(
      (u) => u.username === username
    );
    
    if (isUsernameExist) {
      socket.emit(SocketEvent.USERNAME_EXISTS);
      return;
    }

    const user: User = {
      username,
      roomId,
      status: USER_CONNECTION_STATUS.ONLINE,
      cursorPosition: 0,
      typing: false,
      socketId: socket.id,
      currentFile: null,
    };
    
    userSocketMap.push(user);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user });
    const users = getUsersInRoom(roomId);
    socket.emit(SocketEvent.JOIN_ACCEPTED, { user, users });
  });

  socket.on("disconnecting", () => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
    socket.leave(roomId);
  });

  // File Operations
  socket.on(
    SocketEvent.SYNC_FILE_STRUCTURE,
    (payload: { 
      fileStructure: FileStructure; 
      openFiles: string[]; 
      activeFile: string | null;
      socketId: SocketId;
    }) => {
      io.to(payload.socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
        fileStructure: payload.fileStructure,
        openFiles: payload.openFiles,
        activeFile: payload.activeFile,
      });
    }
  );

  socket.on(
    SocketEvent.DIRECTORY_CREATED,
    (payload: DirectoryOperationPayload) => {
      const roomId = getRoomId(socket.id);
      if (!roomId) return;
      socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, payload);
    }
  );

  // Add similar type annotations for all other handlers:
  // (Shown for one example, apply to all similar handlers)

  socket.on(SocketEvent.FILE_UPDATED, (payload: UpdateFileContentPayload) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, payload);
  });

  // Chat Operations
  socket.on(SocketEvent.SEND_MESSAGE, (payload: MessagePayload) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, payload);
  });

  // Drawing Operations
  socket.on(SocketEvent.DRAWING_UPDATE, (payload: { snapshot: string }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, payload);
  });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});