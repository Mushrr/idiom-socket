import { randomStr } from 'mushr';
import { EventEmitter } from "stream";
import Player from "./Player";
import { PlayerResource, RoomResource } from "./Resource";
import Cloud from "./Cloud";
import { Namespace } from 'socket.io';
// 抽象的房间实体

// 继承自事件Emitter，可以监听事件
interface RoomInterface {
    // 房间的唯一标识
    roomId: string; // 将会通过这个id作为namespace来区分各个房间
    // 房间的名称
    roomName: string;
    // 所丛属的云
    cloud: Cloud;
    // 房间的最大人数
    maxPlayers: number;
    // 房间所有者
    master: Player | null;
    // 所有参与人
    players: Player[];
    // 房间的状态
    status: string;
    // 房间的创建时间
    createTime: Date;
    // 房间资源
    resources: (PlayerResource | RoomResource)[];
    // 房间的自定义属性
    [propname: string]: string | number | boolean | object | null;
}


export default class Room extends EventEmitter implements RoomInterface {
    // 房间的唯一标识
    roomId: string; // 将会通过这个id作为namespace来区分各个房间
    // 房间的名称
    roomName: string;
    // 所丛属的云
    cloud: Cloud;
    // 房间的最大人数
    maxPlayers: number;
    // 房间所有者
    master: Player | null;
    // 所有参与人
    players: Player[];
    // 房间的状态
    status: string;
    // 房间的创建时间
    createTime: Date;
    // 房间资源
    resources: (PlayerResource | RoomResource)[];
    // 房间的自定义属性
    [propname: string]: string | number | boolean | object | null;

    constructor(roomName: string, maxPlayers: number, master: Player | null, cloud: Cloud) {
        super(); // 父类构造
        this.roomId = randomStr(64); // 随机一个初始化的房间id
        this.roomName = roomName; // 房间名称
        this.cloud = cloud;
        this.maxPlayers = maxPlayers;
        this.master = master;
        this.players = [];
        this.status = "waiting";
        this.createTime = new Date();
        this.resources = [];

        // 此处借助 cloud 初始化这个房间

        this.cloud.of(this.roomId).on("connection", (socket) => {
            // 连接成功
            console.log(`[Room] ${this.roomId}:${this.roomName} connected`);
            // 把此socket下的用户绑定到这个room中
            this.cloud.players.forEach(player => {
                if (player.socket.id === socket.id) {
                    this.addPlayer(player);
                }
            })
        })

        this.on("player:chat", (player, ...messages) => {
            console.log(`===============================`);
            console.log(`${this.players.length}`);
            for (let message of messages) {
                console.log(`[Room] ${player.playerName} say: ${JSON.stringify(message)}`);
                for (const p of this.players) {
                    if (p.playerName === message.to) {
                        p.socket.emit("player:chat", message.message);
                    }
                }
            }
        })
    }

    /**
     * 开始
     * 终止
     * 资源处理
     * 玩家退出
     * 玩家加入
     * 玩家资源
     * 告知
     * 备份
     */

    // 玩家退出
    removePlayer(player: Player) {
        this.players = this.players.filter(p => p !== player);
        this.emit("player:leave", player); // 玩家退出
    }

    // 玩家加入
    addPlayer(player: Player) {
        this.players.push(player);
        this.emit("player:join", player); // 玩家加入
    }

    // 处理资源
    // handle resource
    handleResource(resource: PlayerResource | RoomResource) {
        this.resources.push(resource);
        this.emit("resource:handle", resource); // 资源加载，资源触发
    }
}