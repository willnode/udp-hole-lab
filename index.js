import raw from 'raw-socket';
import ipp from 'ip';

var target = '127.0.0.1';

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
    Buffer.from([127, 0x00, 0x00, 0x01]), 4);

// ICMP echo (ping) request
var body = Buffer.from("ping", "ascii");
var ip = Buffer.concat([
    Buffer.from([
        0x45, 0x00, 0x00, 0x3c, 
        0x7c, 0x9b, 0x00, 0x00,
		0x80, 0x01, 0x39, 0x8e,
    ]),
    ipp.toBuffer('127.0.0.1'), 
    ipp.toBuffer(target), 
]);
ip.writeUint16LE(20 + 8 + body.length, 2); // Length
ip.writeUInt8(1, 8); // TTL
ip.writeUInt8(17, 9); // Protocol (UDP)
raw.writeChecksum (ip, 10, raw.createChecksum (ip));

var transport = Buffer.alloc(8);
transport.writeUInt16BE(41234, 0);
transport.writeUInt16BE(52434, 2);
transport.writeUInt16BE(body.length + 8, 4);
raw.writeChecksum (transport, 6, raw.createChecksum (transport));
var buffer = Buffer.concat([ip, transport, body])

console.log([...buffer])

socket.send (buffer, 0, buffer.length, target, function (error, bytes) {
    if (error) {
        console.log (error.toString ());
    } else {
        console.log ("sent " + bytes + " bytes to " + target);
    }
    socket.close();
});
