
var express = require('express');
var app = express();
var path = require('path');
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.set('port', (process.env.PORT || 3030));

app.use(express.static('public'));

app.get('/', function (req, res) {
  const index = path.join(__dirname, 'public', 'index.html');
  res.sendFile(index);
});

var server = app.listen(app.get('port'), () => {
    console.log(`Peer server up and running on port ${app.get('port')}`);
});

var options = {
    debug: false,
    timeout: 86400,
    ip_limit: 86400,
    concurrent_limit: 86400,
    proxy_read_timeout: 86400,
    proxy_send_timeout: 86400
};

app.use('/peerjs', ExpressPeerServer(server, options));