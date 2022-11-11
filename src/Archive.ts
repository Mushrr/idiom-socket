import { randomStr } from 'mushr';
// 归档类
import { RoomResource } from "./Resource"

// 当更新的适合需要维护一个更新状态
// 确认用户是否接收到了更新
// 生成一个随机的版本号
// 用户确定这个版本号之后，在更新完毕之后反馈这个消息
// 服务端接收到之后，将此版本号标记为已经更新

class Archive {
    version: string;
    content: RoomResource;
    playerCheck: Map<string, boolean>;
    history: (string | Buffer)[];
    record: number;

    constructor(content: RoomResource) {
        this.version = randomStr(64);
        this.content = content;
        this.playerCheck = new Map<string, boolean>(); // 初始化
        this.history = new Array();
        this.record = 0;

        for (let player of content.resourceSource.players) {
            this.playerCheck.set(player.playerId, false);
        }
    }

    /**
     * 重置所有人的状态
     */
    resetPlayerCheck() {
        for (let player of this.content.resourceSource.players) {
            this.playerCheck.set(player.playerId, false);
        }
    }

    /**
     * 检查当前玩家是否都已经确认了，如果都确认了，那么可以归档，并且生成新版本号
     * @returns {boolean | string} 是否所有玩家都已经确认, 如果是则返回版本号
     */
    archive() {
        let update = true;
        for (let [playerId, check] of this.playerCheck) {
            if (!check) {
                update = false;
                break;
            }
        }
        if (update) {
            this.history.push(Buffer.from(this.content.resourceContent)); // 拷贝一份放在历史档案中
            this.version = randomStr(64); // 生成一个新的版本号
            this.resetPlayerCheck();
            console.log(`[Archive] update! Archive a new version ${this.version}`);
            return this.version; // 返回新版本号
        } else {
            return false; // 不允许更新
        }
    }

    /**
     * 玩家确认更新
     * @param {string} playerId 玩家ID
     * @param {string} version 版本号
     */
    acceptUpdate(playerId: string, version: string, autoArchive: boolean) {
        if (version === this.version) {
            this.playerCheck.set(playerId, true);
            this.record += 1;
            // 只有当自动更新打开 适合才会自动归档
            if (this.record === this.content.resourceSource.players.length && autoArchive) {
                this.record = 0;
                return this.archive(); // 如果发现确认的人数超过了上线，那么就会触发更新
            }
        } else {
            console.log(`[Archive] Player ${playerId} try to accept a wrong version ${version}`);
        }
    }
}


export default Archive