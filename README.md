# 版本说明

## Usage

- server

```javascript
git clone https://github.com/Mushrr/idiom-socket

cd idiom-socket

npm install
npm run start
```

- client

```javascript
git clone https://github.com/Mushrr/online-share

cd online-share

npm install
npm run dev
// 点击提示链接即可
```

## v0.1.1 版本说明

当前新增功能

- [X] Docker支持

## v0.1.0 版本说明

当前新增功能

- [X] 进房间输入密码
- [X] 房间人数约束

预览图
> 密码房间
![password_room](./screenshots/screen_shots_2.gif)

## v0.0.2 版本说明

当前版本支持功能

- [X] 文本房间数据交换
- [X] 管理员权限实现
- [X] 获取房间内人员信息
- [X] [一个用于测试的客户端](https://github.com/Mushrr/online-share)

预览图:
> 单个房间内共享
![single_room](./screenshots/single_room.gif)
> 多个房间内共享
![multi_room](./screenshots/multi_room.gif)

## V0.0.1 版本声明

当前版本下支持的功能

- [X] 房间创建，密码设置
- [X] 房间管理员特权
- [X] 主大厅获取房间信息
- [X] 获取当前用户信息

预览图：
> 一个服务端，维护连接
> 一个客户端`master`，用创建房间并且设置密码为 `123456`
> 一个客户端`client1`, 用于获取房间信息之后连接测试房间，并且接收到来自`master`的广播消息

![1_without_resource_only_terminal](./screenshots/v0.0.1_without_resource_only_terminal.gif)
