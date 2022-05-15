import dgram from 'dgram';
import raw from 'raw-socket';
import { buildUdpBuffer } from './udp.js';

var socket = raw.createSocket({
    addressFamily: raw.AddressFamily.IPv4,
    protocol: raw.Protocol.UDP,
});

socket.on("error", function (error) {
    console.log("error: " + error.toString());
    process.exit(-1);
});

// Custom header
socket.setOption(raw.SocketLevel.IPPROTO_IP, raw.SocketOption.IP_HDRINCL,
    Buffer.from([0x00, 0x00, 0x00, 0x01]), 4);

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  });

var sourceAddr = '127.0.0.1';
var sourcePort = 58687;
var targetAddr = '127.0.0.1';
var targetPort = 41234;

server.connect(sourcePort, sourceAddr, () => {
    console.log('connected to server', server.remoteAddress());

    
    var buffer = buildUdpBuffer(sourceAddr, sourcePort, targetAddr, targetPort, "LIST");

    socket.send(buffer, 0, buffer.length, targetAddr, function (error, bytes) {
        if (error) {
            console.log(error.toString());
        } else {
            console.log("sent " + bytes + " bytes to " + targetAddr);
        }
    });

    setInterval(() => {

        var buffer = buildUdpBuffer(sourceAddr, sourcePort, targetAddr, targetPort, "p");

        socket.send(buffer, 0, buffer.length, targetAddr, function (error, bytes) {
            if (error) {
                console.log(error.toString());
            } else {
                console.log("sent " + bytes + " bytes to " + targetAddr);
            }
        });

    }, 1000);
})