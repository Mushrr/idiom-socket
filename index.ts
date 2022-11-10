import Cloud from "./src/Cloud";

const cloud = new Cloud({
    port: 3000
});

cloud.listen(3000);

// 创建一个cloud 并且绑定在 3000 端口