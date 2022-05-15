import dgram from 'dgram';

const server = dgram.createSocket('udp4');

const serversMap = {}

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  serversMap[rinfo.address+ ':'+rinfo.port] = true
  if (msg.toString().trim() == 'LIST') {
    server.send(JSON.stringify(serversMap), rinfo.port, rinfo.address)
  }
  if (msg.toString().trim() == 'FEEDME') {
      setInterval(() => {
        server.send('p', rinfo.port, rinfo.address)
      }, 2000)
  }
  console.log(`server got: ${JSON.stringify(msg.toString().trim())} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);

});

server.bind(41234);