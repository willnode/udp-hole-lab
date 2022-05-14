import dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  });

server.connect('41234', '192.168.43.167', () => {
    console.log('connected to server', server.remoteAddress());
    server.send('LIST')
    setInterval(() => {
        server.send('p')
    }, 1000);
})