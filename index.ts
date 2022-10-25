import { UDPServer } from "./src/udp-server";


const server = new UDPServer(1234);

server.listen();