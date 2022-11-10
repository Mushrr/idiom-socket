import { io } from "socket.io-client"; 

const socket = io("http://localhost:3000");

socket.emit("player:rename", "EVA-001");

socket.emit("room:get");

socket.on("room:error", (err) => {
    console.error(err);
})
socket.on("room:get", (data) => {
    console.log(data);
    
    socket.emit("player:join", {
        roomId: data[0].id,
        key: 123456
    })
})

socket.on("master:bordcast", (message) => {
    console.log(message);
})