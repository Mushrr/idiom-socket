import { Manager } from "socket.io-client";

const manager = new Manager("http://localhost:3000");

const socket = manager.socket("/");

socket.emit("player:rename", "Cookie");

socket.emit("player:join", "EVA-OO1");

socket.emit("player:chat", {
    to: "Mushr",
    message: "你好哇Mushr"
})


socket.on("player:chat", (message) => {
    console.log(message);
})