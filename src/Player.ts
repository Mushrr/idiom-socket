import { EventEmitter } from 'stream';
import { PlayerResource, RoomResource } from "./Resource";
import { randomStr } from "mushr";
import { Socket } from "socket.io"
import Room, { RoomJoinData } from "./Room"
import { CreateRoomConfig } from './Cloud';

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

    static clearPlayerSocket(player: Player) {
        // 清除当前用户的所有事件
        player.socket.removeAllListeners();
    }

    // 玩家socket的初始化，对待玩家的事件进行监听
    static initPlayerSocket(player: Player, room: Room) {
        // 基础生命状态
        player.socket.on("error", (err) => {
            console.error(`[ROOM: ${room.roomName}]Player ${player.playerName} socket error ${err}`);
        })
        player.socket.on("disconnected", () => {
            // 玩家退出
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} disconnected`);
            room.cloud.emit("player:disconnected", player); // 通知云已经有玩家退出了
            player.exit();
        })
        player.socket.on("ping", () => {
            // 玩家ping
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} ping`);
        })
        player.socket.on("reconnect_attempt", (attempt) => {
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} reconnect attempt ${attempt}`);
        })
        player.socket.on("reconnect_error", (err) => {
            console.error(`[ROOM: ${room.roomName}]Player ${player.playerName} reconnect error ${err}`);
        })
        player.socket.on("reconnect_failed", () => {
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} reconnect failed`);
        })


        // 特殊事件
        player.socket.on("player:exit", () => {
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} exit`);
            room.cloud.emit("player:exit", player); // 通知云已经有玩家退出了
            player.exit();
        })
        // 重命名, 必须要求加入的用户重命名!
        player.socket.on("player:rename", (name) => {
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} rename ${name}`);
            player.playerName = name;
            room.emit("player:rename", player, name); // 用户重命名
        })
        player.socket.on("player:whoami", () => {
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} whoami`);
            player.socket.emit("player:whoami", {
                playerId: player.playerId,
                playerName: player.playerName
            });
        })
        // 加入事件
        player.socket.on("player:join", (roomJoinData: RoomJoinData) => {
            let change = false;
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} is trying to join ${roomJoinData.roomName}`);
            player.currentRoom.cloud.rooms.forEach(room => {
                // 如果验证通过才能加入
                if (room.roomId === roomJoinData.roomId && room.key === roomJoinData.key) {
                    change = true;
                    player.switchTo(room); //  用户切换房间
                    player.socket.emit("player:join", {
                        roomId: room.roomId,
                        roomName: room.roomName,
                        roomKey: room.key,
                        roomStatus: room.status,
                    });
                }
            })
            if (!change) {
                // 房间级别的错误
                player.socket.emit("room:error", `${roomJoinData.roomId} room not found or key error!!!`, roomJoinData);
                // 返回错误信息
            }
        })

        player.socket.on("room:getuser", ({playerId}) => {
            // 连接成功
            const allPlayers = player.currentRoom.players.map(p => ({
                playerName: p.playerName,
                playerId: p.playerId,
            }));

            for (let p of player.currentRoom.players) {
                if (p.playerId === playerId) {
                    p.socket.emit("room:getuser", {
                        allPlayers
                    })
                    break;
                }
            }
        })

        

        // 用户可以直接获取房间信息
        player.socket.on("room:get", () => {
            player.socket.emit("room:get", player.currentRoom.cloud.getRoomInfo());
        })

        // 用户可以直接创建房间
        player.socket.on("room:create", (config: CreateRoomConfig) => {
            console.log(`[ROOM: ${room.roomName}]Player ${player.playerName} is trying to create room ${config.roomName}`);
            room.emit("room:create", config);
        })

        // 使用房间添加对用户行为的监听
        

        room.initPlayer(player);
    }

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
        Player.initPlayerSocket(this, currentRoom); // 初始化一下当前用户的事件
    }

    // 资源从buffer中生成
    // 生成的资源将会直接抛给ROOM，ROOM将会管理这个资源的
    // createResource(type: "player" | "room", resource: Buffer, callback: (err: Error, data: any) => void): PlayerResource | RoomResource {
    //     // 依据服务端接收到的buffer，如果前面标志位是一个资源标志的话，就会丢入到这个里生成一个资源实体.
    //     // TODO 生成资源，返回
        
    //     console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} create resource ${type}`);
    // }
    // 用户状态改变
    changeStatus(status: "connected" | "disconnected" | "tle" | "restrict" | "unknown") {
        this.status = status;
        console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} status changed to ${status}`);
    }

    switchTo(room: Room) {
        // 用户切换房间
        this.socket.leave(this.currentRoom.roomName);
        this.socket.join(room.roomName);
        this.currentRoom = room;

        Player.clearPlayerSocket(this); // 清除当前用户的事件
        Player.initPlayerSocket(this, room); // 初始化一下当前用户的事件
        room.addPlayer(this); // 加入
        console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} switch to ${room.roomName}`);
    }

    // userNameChange
    // 退出
    exit() {
        // 用户退出房间
        this.currentRoom.removePlayer(this);
        this.switchTo(this.currentRoom.cloud.mainHall!);
        console.log(`[ROOM: ${this.currentRoom.roomName}]Player ${this.playerName} has quit the room`);
    }
}