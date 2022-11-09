import { Server } from "socket.io";
import { EventEmitter } from 'stream';
import Room from "./Room"
// 单例的云服务,用户可以向云服务发送请求,云会创建一个房间，并将管理权返还给用户

interface CloudInterface extends EventEmitter {
    // 基础信息
    port: number;
    host: string;
    rooms: Room[];
    // 云socket, 接受来自各方的数据，下发到各个ROOM中
    cloudSocket: Server;
}


export default class Cloud implements CloudInterface {

}