import { Request, Response } from "express";
import { stripe } from "../config/stripe.ts";
import { CheckoutRequestBody } from "../types/paymentTypes.ts";
import userModel from "../model/user.ts";
import { token } from "morgan";

const priceMap: Record<string, number> = {
  Starter: 15,
  Pro: 29,
  Enterprise: 59,
};

export const createCheckoutSession = async (
  req: Request<{}, {}, CheckoutRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { plan } = req.body;

    if (!priceMap[plan]) {
      res
        .status(400)
        .json({ message: "Invalid plan selected", success: false });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
    console.log("plan that user take:", plan,"!plan");
    let user = await userModel.findById(req.cookies.userId);

    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    if (plan === 'Starter') {
      user.token = (user.token ?? 0) + 3;
      await user.save();
    }
    if (plan === 'Pro') {
      user.token = (user.token ?? 0) + 7;
      await user.save();
    }

    if (plan === 'Enterprise') {
      user.token = (user.token ?? 0) + 10;
      await user.save();
    }
    res
      .status(200)
      .json({ url: session.url, message: "checkout created", success: true });
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
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    res
      .status(400)
      .json({ message: `Webhook Error: ${err.message}`, success: false });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    console.log("Payment successful:", session);
  }

  res.json({ received: true, message: "payment received", success: true });
};
