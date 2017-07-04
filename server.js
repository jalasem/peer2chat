const express = require('express'),
    secure = require('express-force-https'),
    app = express(),
    path = require('path'),
    ExpressPeerServer = require('peer').ExpressPeerServer;

app.set('port', (process.env.PORT || 4000));
app.use(secure);
app.use(express.static('public'));

app.get('*', function (req, res) {
    const index = path.join(__dirname, 'public', 'index.html');
    res.sendFile(index);
    // return res.redirect(['https://', host].join(''));
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