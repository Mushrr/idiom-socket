import { Namespace, Server } from "socket.io";
import { EventEmitter } from 'stream';
import Room from "./Room";
import Player from "./Player";
import { randomStr } from "mushr";
import TextShareRoom from "./rooms/text-share-room";
import { TextResource } from "./rooms/text-resource";
// 单例的云服务,用户可以向云服务发送请求,云会创建一个房间，并将管理权返还给用户

interface CloudInterface extends EventEmitter {
    // 基础信息
    config: CloudConfig
    rooms: Room[];
    mainHall: Room | null;
    players: Player[];
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
 * of("xxxxx") 会触发new_namespace 事件
 */

export interface CreateRoomConfig {
    roomName: string,
    maxPlayers: number,
    playerId: string,
    key: number | null,
    needKey: boolean,
    type: "text" | "canvas"
}

export default class Cloud extends Server implements CloudInterface {
    // 基础信息
    config: CloudConfig;
    rooms: Room[];
    mainHall: Room | null;
    players: Player[];
    // 云socket, 接受来自各方的数据，下发到各个ROOM中
    // 云的状态

    static cloudInitialize(cloud: Cloud) {
        // 初始化这个云的监听事件
        cloud.on("new_namespace", (namespace: Namespace) => {
            // 有新的房间创建

            console.log(`[${new Date().toLocaleString()}] - New Room Created: ${namespace.name}`);
        })
        const mainHall = new Room("大厅", 100, null, null, cloud); // 初始化一个大厅
        cloud.mainHall = mainHall; // 房间初始化

        // 在大厅的用户可以创建房间
        mainHall.on("room:create", (config: CreateRoomConfig) => {
            // 创建房间
            // 从cloud 中找到当前主节点
            let master: Player | null = null;
            for (const player of cloud.players) {
                if (player.playerId === config.playerId) {
                    master = player;
                    // 掌权者
                    break;
                }
            }
            if (!master) {
                // 没有找到主节点
                console.error(`[${new Date().toLocaleString()}] - Player ${config.playerId} not found`);
            } else {
                let room: Room;
                switch (config.type) {
                    case "text":
                        const text = new TextResource("", "all", mainHall); // 初始化空文本
                        room = new TextShareRoom(config.roomName, config.maxPlayers, config.key, master, cloud, text); // 只允许使用数字作为密码
                        text.changeRoom(room); // 房间修改
                        cloud.rooms.push(room); // 房间创建完毕
                        break;
                    case "canvas":
                        console.log(`[${new Date().toLocaleString()}] - Canvas Room not supported yet`);
                }
            }
        })

        cloud.on("connection", (socket) => {
            // 云的连接事件
            const randomPlayerName = randomStr(16);
            const player = new Player(randomPlayerName, socket, mainHall); // 大厅中的玩家暂时先随机命个名
            player.socket.emit("player:playerId", player.playerId); // 返回玩家的ID
            cloud.players.push(player); // 玩家加入
            player.switchTo(mainHall); // 切换
        })

        cloud.on("error", (err) => {
            console.error(`[${new Date().toLocaleString()}] - Cloud Error: ${err}`);
        })
    }

    constructor(config: CloudConfig) {
        super();
        this.config = config;
        this.rooms = []; // 这个实体将会在用户创建房间的时候自动封装然后加入到这个里面
        this.players = [];
        this.mainHall = null;
        Cloud.cloudInitialize(this);
    }

    getRoomInfo() {
        console.log(`[${new Date().toLocaleString()}] - Room Info: ${this.rooms.length}`);
        const roomInfo = this.rooms.map((room) => {
            return {
                name: room.roomName,
                id: room.roomId,
                maxPlayers: room.maxPlayers,
                master: (room.master as Player).playerName, // 房主的名字
                type: room.type, // 返回房间类型
            }
        })
        return roomInfo;
    }

    getPlayerInfo() {
        console.log(`[${new Date().toLocaleString()}] - Room Info: ${this.rooms.length}`);
        const playerInfo = this.players.map((player) => {
            return {
                name: player.playerName,
                id: player.playerId
            }
        })
        return playerInfo;
    }

}