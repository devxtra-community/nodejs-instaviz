import mongoose, { Schema } from "mongoose";

interface Admin {
    email: string,
    password: string,
    role : string,
    refreshToken?: string; 
};

const adminSchema = new Schema<Admin>({

    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },
    role :{
        type : String , default : "admin"
    },
     refreshToken: { type: String, default: null }

});

const adminModel = mongoose.model<Admin>('admin', adminSchema);

export default adminModel;