import nodemailer from 'nodemailer'
export const sendOtp = async(email:string,otp:number) =>{
    try{
        let sendMail = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"shanu.work.org@gmail.com",
            pass:".,/$#@nu.,/$#@nu"
        }
    }) 

    const info = await sendMail.sendMail({
        from:"shanuvr.work.org@gmail.com",
        to:email,
        subject:"your OTP for InstaViz",
        text:`your otp is ${otp}`
    })
    console.log("opt sentttt");

    }catch(err){
        console.log("eroor woeked");
        console.log("error sending email",err)
        
    }
    
}
