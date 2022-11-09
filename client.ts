import { Manager } from "socket.io-client";

const manager = new Manager("http://localhost:3000");

const socket = manager.socket("/");

socket.on("data", (chunk) => {
    console.log(chunk.toString());
})

socket.on("connect", () => {
    console.log("连接上了");
})



socket.on("player:playerId", (playerId) => {
    console.log("playerId", playerId);

    socket.emit("room:create", {
        roomName: "EVA-OO1",
        playerId: playerId,
        maxPlayer: 10,
    })
    socket.emit("player:join", "EVA-OO1");

    socket.emit("player:chat", {
        to: "EVA-OO1",
        message: "EVA 第一使族"
    })
})

socket.emit("player:rename", "Mushr");

socket.emit("player:chat", {
    to: "EVA-001",
    message: "你好哇"
});

socket.on("player:chat", (...message) => {
    console.log(message);
})


setTimeout(() => {
    socket.emit("player:chat", {
        to: "Cookie",
        message: "你好哇 Cookie"
    });
}, 3000)