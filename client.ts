import { UDPClient } from "./src/udp-client";

const client = new UDPClient("127.0.0.1", (Math.floor(Math.random() * 10000)), 1234);

client.listen();