const nodemailer = require("nodemailer");

// Create the 'Transporter' (Your Mail Server)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com", // Replace with your email
        pass: "your-app-password"    // NOT your Gmail password, but an 'App Password'
    }
});

const sendOTPEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: '"Ausdauer Security" <your-email@gmail.com>',
        to: toEmail,
        subject: "Security Reset: Your OTP Code",
        html: `
            <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white; border-radius: 10px;">
                <h2>Security Verification</h2>
                <p>You requested a password change. Use the code below:</p>
                <h1 style="color: #8b5cf6; letter-spacing: 5px;">${otp}</h1>
                <p>This code expires in 5 minutes.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;