import nodemailer from "nodemailer";
export const sendOtp = async (email: string, otp: string) => {
  console.log("reached here at send otp");

  try {
    let sendMail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await sendMail.sendMail({
      from: "shanuvr.work.org@gmail.com",
      to: email,
      subject: "from you 2000 years ago",
      text: `your otp is ${otp}`,
    });
    console.log("opt sentttt");
  } catch (err) {
    console.log("eroor woeked");
    console.log("error sending email", err);
  }
};
