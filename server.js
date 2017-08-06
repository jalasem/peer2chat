const express = require('express'),
    secure = require('express-force-https'),
    nodemailer = require("nodemailer"),
    app = express(),
    path = require('path'),
    smtpTransport = require("nodemailer-smtp-transport"),
    bodyParser = require("body-parser"),
    ExpressPeerServer = require('peer').ExpressPeerServer;

app.set('port', (process.env.PORT || 4000));
app.use(secure);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', function (req, res) {
    const index = path.join(__dirname, 'public', 'index.html');
    res.sendFile(index);
    // return res.redirect(['https://', host].join(''));
});

app.post("/api/invite", (req, res) => {
    let friendName = req.body.toName;
    let friendEmail = req.body.toEmail;
    let message = req.body.message;
    let fromName = req.body.fromName;
    let fromEmail = req.body.fromEmail;
    let subject = `${fromName} will like to chat with you on Peer2chat`;

    let transporter = nodemailer.createTransport({
        // service: "gmail",
        // port: 465,
        // auth: {
        //     user: 'ajalaabdulsamii@gmail.com',
        //     pass: '35353672'
        // },

        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'ohotu@coloured.com.ng',
            pass: 'Flower10@@'
        }
    });

    let mailOptions = {
        subject,
        to: friendEmail,
        from: `Peer2Chat <ohotu@coloured.com.ng>`,
        replyTo: fromEmail,
        html: `
                <h3>Hi ${friendName}!</h3>
                <h4>${fromName} will like to chat with you on Peer2Chat </h4>
                <h4>Message:</h4>
                <blockquote><q>${message}</q></blockquote>
                <a href="https://peer2chat.herokuapp.com" style="border-radius: 3px; font-size:15px; color: white; border: 1px purple solid; text-decoration:none;padding:14px 7px 14px 7px;width: 210px; max-width:210px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;margin:6px auto 4rem;;display:block;background-color:purple;text-align:center">Click here to Chat</a>
                <h4>
                Happy Chatting! <br>
                Peer2Chat
                </h4>
            `
    };

    try {
        transporter.sendMail(mailOptions, (error, response) => {
            if (error) {
                console.log("error:\n", error, "\n");
                res.send('there was an error inviting your friend');
            } else {
                console.log("email sent:\n", response);
                res.send("email sent");
            }
        });
    } catch (error) {
        console.log(error);
    }
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
// const clientID =
// "502580489866-gnamnlfu51a8sak7fq3d3trivrehteg9.apps.googleusercontent.com",
// clientSecret = "MEappyThcqiZTw7yR5ik2rFH";