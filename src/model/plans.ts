import mongoose, { Schema } from "mongoose";

export interface Plans{

    title:string
    price:number
    billed:string
    features:string[]
    offerlabel:string


}

const plansSchema = new Schema<Plans>({

title:{
    type:String,
    required:true
},
price:{
    type:Number,
    required:true
},
billed:{
    type:String,
    required:true
},
features: {
  type: [String],
  required: true
},

offerlabel:{
    type:String,
}

});

 const plansModel = mongoose.model<Plans>("plans",plansSchema)
 export default plansModel