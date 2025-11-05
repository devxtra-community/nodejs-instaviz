import mongoose, { Schema } from "mongoose";

enum Status {
    Active = "active",
    Disabled = "disabled"
};

 export interface User {
    googleId: number,
    name: string,
    email: string,
    password: string,
    token: number,
    status: Status,
    isDeleted: boolean
};

const userSchema = new Schema<User>({

    googleId: {
        type: Number
    },
    name: {
        type: String, required: true
    },
    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },
    token: {
        type: Number
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.Active,
    },
    isDeleted: {
        type: Boolean, default: false
    },

});

const userModel = mongoose.model<User>("user", userSchema);

export default userModel;