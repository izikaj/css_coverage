const fork = require('child_process').fork;


function cacheProxy(target, port) {
  const child = fork(__dirname + '../../cacheProxyServer');

  child.on('message', (message) => {
    console.log('<<<< FROM CHILD:', message);
  });

  child.send(JSON.stringify({
    type: 'start',
    target,
    port,
  }));

  return function () {
    console.warn('>>>> END!');
    child.send(JSON.stringify({
      type: 'end',
    }));
  }
}

module.exports = cacheProxy;
