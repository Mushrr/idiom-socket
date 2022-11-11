import { RoomResource } from "../Resource";
import Room from "../Room";
import TextShareRoom from "./text-share-room";
import Player from "../Player";

export class TextResource extends RoomResource {

    constructor(resourceContent: string, resourceDestination: Player | string | "all", resourceSource: Room) {
        super("text", resourceContent, resourceDestination, resourceSource);

        // 初始化资源
        resourceSource.handleResource(this); // 资源移交给房间处理
    }

    // 改变房间
    changeRoom(room: Room) {
        this.resourceSource = room;
    }

    load() {
        for (let player of this.resourceSource.players) {
            if (this.resourceDestination === "all" || this.resourceDestination === player) {
                // 资源发送给各个用户
                player.socket.emit("resource:load",
                    this,
                    (this.resourceSource as TextShareRoom).archive.version
                );
            }
        }
    }
    beforeUpdate() {
        
    }

    update(content: Buffer) {
        this.resourceContent = content;
        this.load(); // 继续发往各个用户
    }

    afterUpdate() {

    }
}
