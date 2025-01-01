const nodemailer = require("nodemailer");

const from = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: from,
    pass: pass,
  },
});



// async..await is not allowed in global scope, must use a wrapper
async function sendOtp(user, otp) {

  if(user){
    if(user.email){
      let body = `
        <hr>
        <h2 style="color: #0d6efd; font-size: 25px">Ramdev furniture</h2>
        <hr>
        <br>
        <br>
        <body style="text-align: center;">
        <h3>Verify email by this OTP</h3>
        <h1 style="color: #0d6efd; font-size: 30px">${otp}</h1>
        </body>`;

        
      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"Ramdev Furniture" <${from}>`, // sender address
        to: user.email, // list of receivers
        subject: "Ramdev Furniture", // Subject line
        text: "",
        html: body,
      });

    }else{
      req.flash("error", "Wrong Request!, for email verify");
      return res.redirect("/");
    }
  }else{
    req.flash("error", "Wrong Request!, for email verify");
    return res.redirect("/");
  };
}

module.exports = sendOtp;