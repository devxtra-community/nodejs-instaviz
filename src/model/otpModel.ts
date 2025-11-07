import mongoose, { Schema } from "mongoose";

interface Otp {
    name: string,
    email: string,
    password: string,
    otp: number,
    createdAt: Date
};

const otpSchema = new Schema<Otp>({
     name: {
        type: String, required: true
    },
    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },
    otp: {
        type: Number, required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    },
    
});

const otpModel = mongoose.model<Otp>('otp', otpSchema);

export default otpModel;