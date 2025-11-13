import mongoose, { Schema } from "mongoose";

interface Admin {
    email: string,
    password: string
};

const adminSchema = new Schema<Admin>({

    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },

});

const adminModel = mongoose.model<Admin>('admin', adminSchema);

export default adminModel;