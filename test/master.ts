import { io, Socket } from "socket.io-client";
const socket = io("http://localhost:3000");


socket.emit("player:rename", "master");

function call(socket: Socket, event: string, callback: (...args: any[]) => any[] | void, ...args: any[]) {
    socket.emit(event, ...args);
    socket.on(event, callback);
}

call(socket, "player:whoami", (res) => {
    console.log(res);
    
    const { playerId } = res;

    socket.emit("room:create", {
        roomName: "test",
        key: 123456,
        maxPlayer: 10,
        playerId: playerId
    })

    socket.emit("room:get");
    socket.on("room:get", (rooms) => {
        for (const room of rooms) {
            if (room.name === "test") {
                socket.emit("player:join", {
                    roomId: room.id,
                    key: 123456
                })
            }
        }
    });
    setInterval(() => {
        socket.emit("master:bordcast", "hello I am master of this room!!!");
    }, 1000)
})


