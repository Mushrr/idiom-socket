import { randomStr } from 'mushr';
// 资源类型
import Player from "./Player";
import Room from "./Room";

interface ResourceInterface {
    // 资源的唯一标识
    resourceId: string;
    // 资源的类型
    resourceType: "text" | "image" | "json" | "buffer";
    // 资源的内容
    resourceContent: string | Buffer;
    // 资源目的地
    // Player Id
    resourceDestination: Player | string | "all";
    // 资源的创建时间
    createTime: Date;
    // 资源的自定义属性
    [propname: string]: string | number | boolean | object;
}

interface PlayerResourceInterface extends ResourceInterface {
    // 资源的来源
    // Player Id
    resourceSource: Player;
}

interface RoomResourceInterface extends ResourceInterface {
    // 资源的来源
    // Room Id
    resourceSource: Room;
}

export class PlayerResource implements PlayerResourceInterface {
    // 资源的唯一标识
    resourceId: string;
    // 资源的类型
    resourceType: "text" | "image" | "json" | "buffer";
    // 资源的内容
    resourceContent: string | Buffer;
    // 资源目的地
    // Player Id
    resourceDestination: Player | string | "all";
    // 资源的创建时间
    createTime: Date;
    // 资源的自定义属性
    [propname: string]: string | number | boolean | object;

    // 资源的来源
    // Player Id
    resourceSource: Player;

    constructor(resourceType: "text" | "image" | "json" | "buffer", resourceContent: string | Buffer, resourceDestination: Player | string | "all", resourceSource: Player) {
        this.resourceId = randomStr(64);
        this.resourceType = resourceType;
        this.resourceContent = resourceContent;
        this.resourceDestination = resourceDestination;
        this.createTime = new Date();
        this.resourceSource = resourceSource;
    }
}

export class RoomResource implements RoomResourceInterface {
    // 资源的唯一标识
    resourceId: string;
    // 资源的类型
    resourceType: "text" | "image" | "json" | "buffer";
    // 资源的内容
    resourceContent: string | Buffer;
    // 资源目的地
    // Player Id
    resourceDestination: Player | string | "all";
    // 资源的创建时间
    createTime: Date;
    // 资源的自定义属性
    [propname: string]: string | number | boolean | object;

    // 资源的来源
    // Room Id
    resourceSource: Room;

    constructor(resourceType: "text" | "image" | "json" | "buffer", resourceContent: string | Buffer, resourceDestination: Player | string | "all", resourceSource: Room) {
        this.resourceId = randomStr(64);
        this.resourceType = resourceType;
        this.resourceContent = resourceContent;
        this.resourceDestination = resourceDestination;
        this.createTime = new Date();
        this.resourceSource = resourceSource;
    }
}

