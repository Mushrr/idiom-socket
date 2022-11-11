// 用于分享文本文件的房间

import Room from "../Room";
import { PlayerResource, RoomResource } from "../Resource";
import { TextResource } from "./text-resource";
import Player from "../Player";
import Cloud from "../Cloud";
import Archive from "../Archive";
import { playerCheck } from "../message";


export default class TextShareRoom extends Room {
    text: RoomResource;
    archive: Archive;
    autoArchive: boolean;
    
    constructor(roomName: string, maxPlayers: number, key: number | null, master: Player | null, cloud: Cloud, text: RoomResource) {
        super(roomName, maxPlayers, key, master, cloud); // 初始化
        this.text = text;
        this.archive = new Archive(text); // 创建归档实例 
        this.autoArchive = false;
        // 创建一个资源
        // 资源有自己的生命周期
        // 加载 -> 更新之前 -> 更新之后 -> 保存 -> 退出
    }

    handleResource(resource: PlayerResource | RoomResource): void {
        this.resources.push(resource); // 资源加入
        this.emit("resource:init", resource); // 资源加载，资源触发

        // 接受来自客户端的反馈
        this.on("resource:received", (playerCheckMessage: playerCheck) => {
            this.archive.acceptUpdate(playerCheckMessage.playerId, playerCheckMessage.version, this.autoArchive); // 归档接受更新
        })

        // 接受来自用户的更新
        this.on("resource:update", (content) => {
            (this.text as TextResource).update(content); // 更新资源
        })

        
        this.on("master:start", () => {
            (this.text as TextResource).load(); // 资源加载
        })

        this.on("master:autoarchive", () => {
            this.autoArchive = !this.autoArchive;
        })
    }
}

