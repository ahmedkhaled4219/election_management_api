import nodemailer from 'nodemailer';

export const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Voting',
        text: `Your OTP for voting is ${otp}`
    };

    await transporter.sendMail(mailOptions);
};
