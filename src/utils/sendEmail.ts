import nodemailer from "nodemailer";

export const sendOtp = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "itsteamnextra@gmail.com",
      to: email,
      subject: "Here’s your verification code ",
      text: `
Hey there!

Just confirming it's you. 
Here’s your OTP:

 ${otp}

This code will be valid for the next 10 minutes.

If you didn’t request this, feel free to ignore this email.
– InstaviZ
      `,
    });

    console.log("OTP sent");
  } catch (err) {
    console.log("Error sending OTP:", err);
  }
};
