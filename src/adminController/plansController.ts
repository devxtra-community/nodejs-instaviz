import { Request, Response } from "express";
import plansModel from "../model/plans"
import { title } from "process";




export const addplan = async (req: Request, res: Response) => {
  const { title, price, billed, features, offerlabel } = req.body;

  try {
    const planadd = await plansModel.create({title,price,billed,features,offerlabel,});

    res.status(200).json({message: "Plan added successfully",success: true,plan: planadd,});
  } catch (err) {console.log(err);res.status(500).json({message: "Failed to add plan",success: false,err,
    });
  }
};


export const showplan = async (req: Request, res: Response) => {
  try {
    const getplan = await plansModel.find();

    res.status(200).json({
      message: "Plans loaded successfully",
      success: true,
      plans: getplan,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load plans",
      success: false,
      err,
    });
  }
};


export const updateplan = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const planupdate = await plansModel.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        price: req.body.price,
        billed: req.body.billed,
        features: req.body.features,
        offerlabel: req.body.offerlabel,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Plan updated successfully",
      success: true,
      updatedplan: planupdate,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update plan",
      success: false,
      err,
    });
  }
};


export const deleteplan = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const plandelete = await plansModel.findByIdAndDelete(id);

    if (!plandelete) {
      return res.status(404).json({
        message: "Plan not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Plan deleted successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to delete plan",
      success: false,
      err,
    });
  }
};
