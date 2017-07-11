const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

let transporter = nodemailer.createTransport(smtpTransport({
  service: "gmail",
  auth: {
    user: 'ajalaabdulsamii@gmail.com',
    pass: '35353672'
  }
}));

var mailOptions = {
  from: "Peer2Chat Dev Team <ajalaabdulsamii@gmail.com>",
  to: "abdulsamii@codesquad.co",
  replyTo: "test@test.com",
  subject: "Tester Testing invite you to Peer2chat",
  // text: "Hi there, Tester Testing invite you to join him at Peer2chat",
  html: `
    <h3>Hi there!</h3>
    <h4>Tester Testing will like to chat with you on Peer2Chat </h4>
    <h4>He said:</h4>
    <blockquote><q>Join me</q></blockquote>
      <a href="https://peer2chat.herokuapp.com" style="border-radius: 3px; font-size:15px; color: white; border: 1px purple solid; text-decoration:none;padding:14px 7px 14px 7px;width: 210px; max-width:210px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;margin:6px auto 4rem;;display:block;background-color:purple;text-align:center">Join him now</a>
    <h4>
      Enjoy Chatting! <br>
      The Peer2Chat Dev Team
    </h4>`
};

transporter.sendMail(mailOptions, (err, res) => {
  if (err) {
    console.log("error:\n", err, "\n");
  } else {
    console.log("email sent:\n", res);
  }
});