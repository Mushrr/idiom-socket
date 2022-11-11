import Cloud from "./src/Cloud";

const cloud = new Cloud({
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

cloud.listen(3000);

// 创建一个cloud 并且绑定在 3000 端口