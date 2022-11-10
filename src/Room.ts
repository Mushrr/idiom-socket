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

export interface RoomJoinData {
    roomId: string;
    roomName: string;
    key: string | null;
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
    // key
    key: number | null;
    // 是否需要密码
    needKey: boolean;
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

    constructor(roomName: string, maxPlayers: number, key: number | null, master: Player | null, cloud: Cloud) {
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
        if (key) {
            this.key = key;
            this.needKey = true;
        } else {
            this.key = null;
            this.needKey = false;
        }

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

    // utils
    findPlayer(unique: any, by: "playerName" | "socketId" | "playerId") {
        let player: Player | undefined = undefined;
        switch (by) {
            case "playerName":
                player = this.players.find(p => p.playerName === unique);
                break;
            case "socketId":
                player = this.players.find(p => p.socket.id === unique);
                break;
            case "playerId":
                player = this.players.find(p => p.playerId === unique);
                break;
        }
        return player;
    }

    // 等待被重载
    // 特权化处理超级用户
    initMasterPlayer(player: Player) {
        player.socket.on("master:kick", (player) => {
            const currentPlayer = this.findPlayer(player, "playerName");
            currentPlayer?.emit("master:kick", "你已被踢出房间");
            this.removePlayer(player);
        })
        player.socket.on("master:bordcast", (message) => {
            console.log(`[Room] ${this.roomName}:master:bordcast ${message}`);
            this.players.forEach(p => {
                p.socket.emit("master:bordcast", message); // 广播到所有用户
            })
        })
    }

    // 等待被重载
    // 初始化简单用户
    initSimplePlayer(player: Player) {

    }

    // 初始化进入这个房间的用户
    initPlayer(player: Player) {
        if (this.master !== null) {
            // 存在master才会初始化master
            if (player.playerId === this.master.playerId) {
                console.log("[Room] init master player");
                this.initMasterPlayer(player); // 初始化master
            } else {
                this.initSimplePlayer(player); // 初始化simple
            }

        } else {
            this.initSimplePlayer(player); // 初始化simple
        }
    }
}