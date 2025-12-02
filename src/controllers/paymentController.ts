import { Request, Response } from "express";
import { stripe } from "../config/stripe.ts";
import { CheckoutRequestBody } from "../types/paymentTypes.ts";
import userModel from "../model/user.ts";
import Payment from "../model/paymentModel.ts";

const priceMap: Record<string, number> = {
  Starter: 50,
  Pro: 100,
  Enterprise: 150,
};

export const createCheckoutSession = async (
  req: Request<{}, {}, CheckoutRequestBody>,
  res: Response
): Promise<void> => {
  try {
    let { plan } = req.body;
    plan = plan.trim();

    if (!priceMap[plan]) {
      res.status(400).json({ message: "Invalid plan selected", success: false });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata:{
        userId: req.cookies.userId,
        plan,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${plan} Plan` },
            unit_amount: priceMap[plan] * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.status(200).json({
      url: session.url,
      success: true
    });

  } catch (error: any) {
    console.error("Stripe Error (createCheckoutSession):", error);
    res.status(500).json({
      message: error.message || "Something went wrong creating session",
      success: false,
    });
  }
};


export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("reached here at webhook !!!!!")
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    res.status(400).json({ message: `Webhook Error: ${err.message}`, success: false });
    return;  
  }

  if (event.type === "checkout.session.completed") {
    console.log("reached here at webhook")

    const session = event.data.object as any;

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    let user = await userModel.findById(userId);
    console.log("user!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",user);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;  
    }

    if (plan === "Starter") user.token += 3;
    if (plan === "Pro") user.token += 7;
    if (plan === "Enterprise") user.token += 10;

    await user.save();

    await Payment.create({
      userId,
      amount:session.amount_total/100,
      currency:session.currency || "USD",
      planName:plan.toLowerCase(),
      paymentId:session.payment_intent,
      status:"success",
    })

    console.log("payment saved");
  }

  res.json({ received: true, message: "payment received", success: true }); 
};

