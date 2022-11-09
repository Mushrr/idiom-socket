import { Namespace, Server } from "socket.io";
import { EventEmitter } from 'stream';
import Room from "./Room"
// 单例的云服务,用户可以向云服务发送请求,云会创建一个房间，并将管理权返还给用户

interface CloudInterface extends EventEmitter {
    // 基础信息
    port: number;
    host: string;
    rooms: Room[];
    // 云socket, 接受来自各方的数据，下发到各个ROOM中
    cloudSocket: Server;
    // 云的状态
    /**
     * 将会把云的状态抛出来，方便服务端直接检查
     */
}

interface CloudConfig {
    port: number
}

/**
 * 备注：
 * Server.of("xxxx").on(); 可以监听xxxx namespace下的所有事件
 * Server.of("xxxx").fetchSockets(); // 获取当前 namespace下的所有sockets
 * namespace 通过 socket._nsp 直接获得到一个映射表
 */

class CloudSocket extends Server {

    rooms: Namespace[];

    static initializeCloudSocket(cloudSocket: CloudSocket) {
        // 初始化事件

        cloudSocket.on("new_namespace", (namespace) => {
            cloudSocket.rooms.push(namespace);
            console.log(`new namespace ${namespace.name} created`);
        })

        cloudSocket.on("room:get", () => {

        })

        cloudSocket.on("data", (chunk) => {
            console.log(chunk);
        })

        cloudSocket.of("/room").on("connection", (socket) => {
            socket.on("room:create", (roomName) => {
                console.log("client add a new room", roomName);
                cloudSocket.initializeARoom(roomName);
            })
            
            console.log("发现一个新人加入");
        })
    }

    constructor() {
        super();
        this.rooms = [];
        // 初始化
        CloudSocket.initializeCloudSocket(this); // 初始化当前的socket
    }

    initializeARoom(room: string) {
        this.of(room).on("connection", (socket) => {
            console.log(`${room} 新加入了一个用户`);
        })
    }
}


export default class Cloud extends EventEmitter implements CloudInterface {
    // 基础信息
    port: number;
    host: string;
    rooms: Room[];
    // 云socket, 接受来自各方的数据，下发到各个ROOM中
    cloudSocket: CloudSocket;
    // 云的状态
    constructor(config: CloudConfig) {
        super();
        this.port = config.port;
        this.host = "localhost";
        this.rooms = [];
        this.cloudSocket = new CloudSocket(); // 建立一个socket
    }

    // 监听
    listen(port: number) {
        this.cloudSocket.listen(port);
        console.log("cloud is listening on port " + port);
    }
}