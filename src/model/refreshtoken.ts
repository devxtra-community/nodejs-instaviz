import mongoose from "mongoose";
export interface Irefreshtoken{
    userId:mongoose.Types.ObjectId;
    tokenhash:string;
    expiresAt:Date;
}

const refreshTokenSchema = new mongoose.Schema<Irefreshtoken>({
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true,
    unique:true

},
tokenhash:{
    type:String,
    required:true
},
expiresAt:{
    type:Date,
    required:true
}

})

const refreshModel = mongoose.model<Irefreshtoken>("refreshToken",refreshTokenSchema)

export default refreshModel