// config/mailer.js
const nodemailer = require("nodemailer");

console.log("🚀 MAILER CARGADO");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS existe:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = transporter;