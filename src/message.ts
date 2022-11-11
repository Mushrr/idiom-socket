// 有关于message 的所有接口, 类型

export interface playerBasicMessage {
    // 玩家的唯一标识
    playerId: string;
    // 玩家的名称
    playerName: string;
}

export interface playerCheck extends playerBasicMessage {
    check: boolean;
    [propname: string]: any;
}