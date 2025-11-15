import { Request, Response } from "express";
import plansModel from "../model/plans"
import { title } from "process";


//add plan
export const addplan = async (req: Request, res: Response) => {
    const {title,price,billed,features,offerlabel} = req.body
    try{
      const planadd = await plansModel.create({
       title,price,billed,features,offerlabel
      })
      res.status(200).json({message:"plans added successfully",success:true,plan:planadd})
    }

    catch(err){

   console.log(err);
   res.status(500).json({message:"add plan was field",success:false,err})
   
    }
}

//get plan 
export const showplan = async(req:Request,res:Response)=>{
    try{
    const getplan  =   await plansModel.find()
    res.status(200).json({message:"plan showed successfully",plans:getplan,success:true})
    }
    catch(err){
      res.json(500).json({message:"plan not showed correctly",success:false,err})
    }
}

//update plan
export const updateplan = async(req:Request,res:Response)=>{
    const {id} = req.params
    try{
    const planupdate = await plansModel.findByIdAndUpdate(id,{
        title:req.body.title,
        price:req.body.price,
        billed:req.body.billed,
        features:req.body.features,
        offerlabel:req.body.offerlabel
    },{new:true})
    res.status(200).json({message:"plans updated successfully",success:true,updatedplan:planupdate})
    }
    catch(err){
   res.status(500).json({message:"plans not updated successfully",success:false,err})
    }
}

//delete plan
export const deleteplan =  async(req:Request,res:Response)=>{
    const {id} = req.params
    try{ 
      const plandelete = await plansModel.findByIdAndDelete(id)
      res.status(500).json({message:"plans deleted",success:true})
    }
    catch(err){
     console.log(err);
     res.status(500).json({message:"plans not deleted",success:false})
     
    }
}