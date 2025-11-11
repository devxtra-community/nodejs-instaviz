import mongoose, { Schema } from "mongoose";

enum Status {
    Active = "active",
    Disabled = "disabled"
};

export interface User {
    googleId?: number
    name?: string,
    picture?: string,
    email: string,
    password?: string,
    token: number,
    status?: Status,
    isDeleted?: boolean,
    place:String,
    phone:Number
};

const userSchema = new Schema<User>({
    googleId: {
        type: String, unique: true, sparse: true
    },
    name: {
        type: String
    },
    picture: {
        type: String
    },
    email: {
        type: String, required: true
    },
    password: {
        type: String, required: false
    },
    token: {
        type: Number,
        default: 3
    },
    place:{
     
        type:String,
        
    },

    phone:{
      type:Number

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