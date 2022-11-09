import { Manager } from "socket.io-client";

const manager = new Manager("http://localhost:3000");

const socket = manager.socket("/room");

socket.on("connect", () => {
    // 连接上了
    socket.emit("room:create", "xxx-xxxxx-xxx-xxxx");

})

socket.on("data", (chunk) => {
    console.log(chunk.toString());
})