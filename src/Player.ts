import { Socket } from "socket.io"
import Room from "./Room"

interface PlayerInterface {
    // 用户的唯一标识
    playerId: string;
    // 用户的名称
    playerName: string;
    // 用户的状态
    status: "connected" | "disconnected" | "tle";
    // 用户的创建时间
    createTime: Date;
    // 用户socket
    socket: Socket; // 方便直接通过房间管理
    // 加入的房间
    currentRoom: Room; 
    // 加入到当前房间里面来
    // 当当前用户socket出现错误，或者断开连接，或者其他状况的时候，可以立即通知ROOM
    // 用户的自定义属性
    [propname: string]: string | number | boolean | object;
}



export default class Player extends PlayerInterface {

}