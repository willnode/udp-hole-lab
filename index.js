import raw from 'raw-socket';
import ipp from 'ip';

var sourceAddr = '127.0.0.1';
var sourcePort = 41234;
var targetAddr = '127.0.0.1';
var targetPort = 61667;
var targetReal = '127.0.0.1';
var payload = 'Hello worlddddcni';

var options = {
    addressFamily: raw.AddressFamily.IPv4,
	protocol: raw.Protocol.UDP,
};

var socket = raw.createSocket (options);

socket.on ("close", function () {
	console.log ("socket closed");
	process.exit (-1);
});

socket.on ("error", function (error) {
	console.log ("error: " + error.toString ());
	process.exit (-1);
});

socket.on ("message", function (buffer, source) {
	console.log ("received " + buffer.length + " bytes from " + source);
	console.log ("data: " + buffer.toString ("hex"));
});

// Custom header
socket.setOption (raw.SocketLevel.IPPROTO_IP, raw.SocketOption.IP_HDRINCL,
    Buffer.from([0x00, 0x00, 0x00, 0x01]), 4);

// ICMP echo (ping) request
var body = Buffer.from(payload, "utf8");
var ip = Buffer.concat([
    Buffer.from([
        0x45, 0x00, 0x00, 0x3c, 
        0x7c, 0x9b, 0x00, 0x00,
		0x80, 0x01, 0x39, 0x8e,
    ]),
    Buffer.alloc(8),
]);
ip.writeUint16LE(20 + 8 + body.length, 2); // Length
ip.writeUInt8(255, 8); // TTL
ip.writeUInt8(17, 9); // Protocol (UDP)
raw.writeChecksum (ip, 10, raw.createChecksum (ip));
ip.writeUInt32LE(raw.htonl(ipp.toLong(sourceAddr)), 12); // Source address
ip.writeUInt32LE(raw.htonl(ipp.toLong(targetAddr)), 16); // Destination address

var transport = Buffer.alloc(8);
transport.writeUInt16BE(sourcePort, 0);
transport.writeUInt16BE(targetPort, 2);
transport.writeUInt16BE(body.length + 8, 4);
raw.writeChecksum (transport, 6, raw.createChecksum (transport));
var buffer = Buffer.concat([ip, transport, body])

console.log([...buffer])

socket.send (buffer, 0, buffer.length, targetReal, function (error, bytes) {
    if (error) {
        console.log (error.toString ());
    } else {
        console.log ("sent " + bytes + " bytes to " + targetReal);
    }
    socket.close();
});
