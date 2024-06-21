import nodemailer from 'nodemailer';

export const sendForgetPasswordEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS 
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Error sending email.');
    }
};
