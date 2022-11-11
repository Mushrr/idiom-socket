##### 房间说明


###### 1. TextShareRoom
> 顾名思义是分享文本的房间
> 服务端
```javascript
const cloud = new Cloud({
    ...config
});

cloud.listen(3000);
```

> master
```javascript
连接

emit("player:rename", "xxxx");
emit("player:whoami", "");
on("player:whoami", () => {});

emit("room:create", () => {
    
})
```

> simple player
```javascript
emit("player:join", {
    ...roomInfo
})

emit("resource:load", (resource) => {
    // load and show
})

emit("resource:update", (content) => {
    // 更新资源
})
```