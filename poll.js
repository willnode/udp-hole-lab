import dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  });

server.connect('41234', '127.0.0.1', () => {
    setInterval(() => {
        server.send('LIST')
    }, 1000);
})