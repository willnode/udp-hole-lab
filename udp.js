import ipp from 'ip';
import raw from 'raw-socket';

export function buildUdpBuffer(sourceAddr, sourcePort, targetAddr, targetPort, payload) {

    var body = Buffer.from(payload, "utf8");
    var ip = Buffer.alloc(20);
    ip.writeUInt8(0x45, 0); // Version
    ip.writeUInt8(0x00, 1); // IHL
    ip.writeUint16LE(20 + 8 + body.length, 2); // Length
    ip.writeUint16BE(Math.trunc(Math.random() * 0xFFFF), 4); // Identifier
    ip.writeUint16LE(0x0000, 6); // Fragment offset
    ip.writeUInt8(255, 8); // TTL
    ip.writeUInt8(17, 9); // Protocol (UDP)
    ip.writeUInt32LE(raw.htonl(ipp.toLong(sourceAddr)), 12); // Source address
    ip.writeUInt32LE(raw.htonl(ipp.toLong(targetAddr)), 16); // Destination address
    ip.writeUint16LE(0, 10); // Checksum

    var transport = Buffer.alloc(8);
    transport.writeUInt16BE(sourcePort, 0);
    transport.writeUInt16BE(targetPort, 2);
    transport.writeUInt16BE(body.length + 8, 4);
    transport.writeUint16LE(0, 6); // Checksum
    return Buffer.concat([ip, transport, body])
}

function compute_ip_checksum(data) {
    var sum = 0, i = 0, count = 20;
    while (count > 1) {
        sum += data[i++];
        count -= 2;
    }
    if (count > 0) {
        sum += ((data[i]) & raw.htons(0xFF00));
    }
    // a bitwise method of carrying the bits:
    while (sum >> 16) sum = (sum & 0xFFFF) + (sum >> 16);
    return (~sum) & 0xFFFF;
}

/**
 * right now it doesn't work, given
 * 
var sourceAddr = '192.168.43.167';
var sourcePort = 55705;
var targetAddr = '192.168.43.114';
var targetPort = 41234;
var payload = 'Hello worlddddcni';
 * @param {Buffer} pIph 
 * @param {Buffer} udphdrp 
 */
function compute_udp_checksum(pIph, udphdrp) {
    var sum = 0, i = 0;
    var udpLen = udphdrp.readUInt16BE(4); // len
    console.log("udpLen: " + udpLen);


    //add the pseudo header 
    //the source ip
    sum += (pIph.readUInt16LE(12)); // saddr
    sum += (pIph.readUInt16LE(14));
    //the dest ip
    sum += (pIph.readUInt16LE(16));// daddr
    sum += (pIph.readUInt16LE(18));
    //protocol and reserved: 17 & length
    sum += raw.htons(17) + raw.htons(udpLen);

    //add the IP payload
    //printf("add ip payloadn");
    //initialize checksum to 0
    while (udpLen > 1) {
        sum += udphdrp[i++];

        udpLen -= 2;
    }
    //if any bytes left, pad the bytes and add
    if (udpLen > 0) {
        //printf("+++++++++++++++padding: %dn", udpLen);
        sum += (udphdrp[i] & raw.htons(0xFF00));
    }

    //Fold sum to 16 bits: add carrier to result
    //printf("add carriern");
    while (sum >> 16) {
        sum = (sum & 0xffff) + (sum >> 16);
    }

    //printf("one's complementn");
    sum = ~sum;
    //set computation result
    sum = (sum & 0xFFFF) == 0x0000 ? 0xFFFF : sum & 0xFFFF; // check
    if (sum != 0x09A0 && sum != 0xA090) {
        console.log("sum: " + sum.toString(16));
        process.exit()
    }
    return sum;
}
