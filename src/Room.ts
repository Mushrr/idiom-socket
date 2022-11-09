import { EventEmitter } from "stream";
import Player from "./Player";
import { PlayerResource, RoomResource } from "./Resource";
import Cloud from "./Cloud";
// 抽象的房间实体

// 继承自事件Emitter，可以监听事件
interface RoomInterface extends EventEmitter {
    // 房间的唯一标识
    roomId: string; // 将会通过这个id作为namespace来区分各个房间
    // 房间的名称
    roomName: string;
    // 所丛属的云
    cloud: Cloud;
    // 房间的最大人数
    maxPlayers: number;
    // 房间所有者
    master: Player;
    // 所有参与人
    players: Player[];
    // 房间的状态
    status: string;
    // 房间的创建时间
    createTime: Date;
    // 房间资源
    resources: ( PlayerResource | RoomResource)[];
    // 房间的自定义属性
    [propname: string]: string | number | boolean | object;
}


export default class Room implements RoomInterface {

}