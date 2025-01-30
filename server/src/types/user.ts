/**
 * Represents a user's connection status
 */
import { SocketId } from "./socket";
enum USER_CONNECTION_STATUS {
	/** User is currently offline */
	OFFLINE = "offline",
	/** User is currently online and active */
	ONLINE = "online",
  }
  
  /**
   * Represents a connected user in the system
   */
  interface User {
	/** Unique username identifier */
	username: string;
	/** Room ID where the user is connected */
	roomId: string;
	/** Current connection status */
	status: USER_CONNECTION_STATUS;
	/** Last recorded cursor position in the editor */
	cursorPosition: number;
	/** Whether the user is currently typing */
	typing: boolean;
	/** Currently active file (if any) */
	currentFile: string | null;
	/** Unique socket connection ID */
	socketId: SocketId;
  }
  
  export { USER_CONNECTION_STATUS, User };