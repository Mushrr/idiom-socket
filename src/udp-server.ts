import { createSocket, RemoteInfo, Socket } from "node:dgram";

interface customer {
    ip: string,
    port: number,
}

interface UDPServerInterface {
    port: number,
    customers: customer[]
}

export class UDPServer implements UDPServerInterface {
    port: number
    customers: customer[]
    socket: Socket | null

    constructor(port: number) {
        this.port = port;
        this.customers = [];
        this.socket = null; // 动态的绑定
    }

    addCustomer(rinfo: RemoteInfo) {
        for (const customer of this.customers) {
            if (customer.ip === rinfo.address && customer.port === rinfo.port) {
                return false;
            }
        }

        this.customers.push({
            ip: rinfo.address,
            port: rinfo.port
        })
        return true;
    }

    boardCast(message: Buffer, rinfo: RemoteInfo) {
        for (const customer of this.customers) {
            if (customer.ip !== rinfo.address || customer.port !== rinfo.port) {
                this.socket?.send(message, customer.port, customer.ip); // 转发数据 
            }
        }
    }

    listen() {
        this.socket = createSocket({
            type: "udp4",
        })
        this.socket.on("message", (message, rinfo) => {
            const msg = message.toString();
            console.log(`[${rinfo.address}:${rinfo.port} ${rinfo.size}] - ${msg}`);
            this.addCustomer(rinfo);
            this.boardCast(message, rinfo);
        })

        this.socket.bind(this.port);
    }
}