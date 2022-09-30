const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, link, name) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: 'noreply@gmail.com',
            to: email,
            subject: subject,
            text: 'Hello,\n Welcome to seeds. Please click on the link to verify your account.\n' +link,
            html:`<h1>Hello, ${name}<h1><br>
            <h2>Welcome to Seeds. Thanks for joining us.</h2>
            <h4>Click <a href = '${link}'>here</a> to confirm your email.</h4>`
        });

    } catch (error) {
        return error;
    }
};
module.exports = sendEmail;
