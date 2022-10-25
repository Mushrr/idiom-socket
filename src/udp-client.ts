import { createSocket, Socket } from "node:dgram";

interface UDPClientInterface {
    ip: string,
    port: number,
    targetport: number,
    socket: Socket | null
}

export class UDPClient implements UDPClientInterface {
    ip: string
    port: number
    targetport: number
    socket: Socket | null

    constructor(ip: string, port: number, targetport: number) {
        this.ip = ip;
        this.port = port;
        this.targetport = targetport;
        this.socket = null;
    }
    
    listen() {
        this.socket = createSocket({ type: "udp4", });
        this.socket.on("message", (msg) => {
            console.log(msg.toString());
        })
        process.stdin.on("data", (buffer) => {
            this.socket?.send(buffer, this.targetport, this.ip);
        })
    }
}