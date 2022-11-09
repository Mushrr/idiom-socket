import { EventEmitter } from 'stream';
import { PlayerResource, RoomResource } from "./Resource";
import { randomStr } from "mushr";
import { Socket } from "socket.io"
import Room from "./Room"

interface PlayerInterface {
    // 用户的唯一标识
    playerId: string;
    // 用户的名称
    playerName: string;
    // 用户的状态
    status: "connected" | "disconnected" | "restrict" | "tle" | "unknown";
    // 用户的创建时间
    createTime: Date;
    // 用户socket
    socket: Socket; // 方便直接通过房间管理
    // 加入的房间
    currentRoom: Room;
    // 加入到当前房间里面来
    // 当当前用户socket出现错误，或者断开连接，或者其他状况的时候，可以立即通知ROOM
    // 用户的自定义属性
    [propname: string]: object | string | number | boolean | undefined;
}



export default class Player extends EventEmitter implements PlayerInterface {
    // 用户的唯一标识
    playerId: string;
    // 用户的名称
    playerName: string;
    // 用户的状态
    status: "connected" | "disconnected" | "tle" | "restrict" | "unknown";
    // 用户的创建时间
    createTime: Date;
    // 用户socket
    socket: Socket; // 方便直接通过房间管理
    // 加入的房间
    currentRoom: Room;
    // 加入到当前房间里面来
    // 当当前用户socket出现错误，或者断开连接，或者其他状况的时候，可以立即通知ROOM
    // 用户的自定义属性
    [propname: string]: object | string | number | boolean | undefined;
    constructor(playerName: string, socket: Socket, currentRoom: Room) {
        super(); // 允许在player 上添加事件以触发响应的响应
        this.playerId = randomStr(32);
        this.playerName = playerName;
        this.status = "unknown";
        this.createTime = new Date();
        this.currentRoom = currentRoom;
        // socket 连接，方便服务端接受来自客户端的消息，也方便服务端返回消息.
        // 客户端write 服务端on("data") 接受
        // 客户端on("data") 服务端write 发送
        this.socket = socket; 
    }

    // 资源从buffer中生成
    // 生成的资源将会直接抛给ROOM，ROOM将会管理这个资源的
    createResource(type: "player" | "room", resource: Buffer, callback: (err: Error, data: any) => void): PlayerResource | RoomResource {
        // 依据服务端接收到的buffer，如果前面标志位是一个资源标志的话，就会丢入到这个里生成一个资源实体.
        // TODO 生成资源，返回

        console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} create resource ${type}`);
    }
    // 用户状态改变
    changeStatus(status: "connected" | "disconnected" | "tle" | "restrict" | "unknown") {
        this.status = status;
        console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} status changed to ${status}`);
    }
    // 退出
    exit() {
        // 用户退出房间
        this.currentRoom.removePlayer(this);
        console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} has quit the room`);
    }
}