import raw from 'raw-socket';
import { buildUdpBuffer } from './udp.js';

var sourceAddr = '127.0.0.1';
var sourcePort = 58687;
var targetAddr = '127.0.0.1';
var targetPort = 41234;
var payload = 'LIST';

var socket = raw.createSocket({
    addressFamily: raw.AddressFamily.IPv4,
    protocol: raw.Protocol.UDP,
});

socket.on("close", function () {
    console.log("socket closed");
    process.exit(-1);
});

socket.on("error", function (error) {
    console.log("error: " + error.toString());
    process.exit(-1);
});

// Custom header
socket.setOption(raw.SocketLevel.IPPROTO_IP, raw.SocketOption.IP_HDRINCL,
    Buffer.from([0x00, 0x00, 0x00, 0x01]), 4);

socket.on("message", function (buffer, source) {
    console.log("received " + buffer.length + " bytes from " + source);
    console.log("data: " + buffer.toString("hex"));
});

var buffer = buildUdpBuffer(sourceAddr, sourcePort, targetAddr, targetPort, payload);

socket.send(buffer, 0, buffer.length, targetAddr, function (error, bytes) {
    if (error) {
        console.log(error.toString());
    } else {
        console.log("sent " + bytes + " bytes to " + targetAddr);
    }
});
//socket.close();

