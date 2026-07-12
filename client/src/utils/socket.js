import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Create the socket but don't auto-connect; let the app control connect/disconnect
const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

export default socket;
