import Joi from "../../node_modules/joi/lib/index";
export const theValidation = Joi.object({
      name: Joi.string().min(3).max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(
          new RegExp(
            "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
          )
        )
        .min(8)
        .messages({
          "string.pattern.base":
            "Password must contain letters, numbers, and symbols",
          "string.min": "Password must be at least 8 characters",
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Password and Confirm Password must match",
          "any.required": "Confirm Password is required",
        }),
    });

    export const loginSchema  = Joi.object({
      email:Joi.string().required().email(),
      password:Joi.string().required().min(8)
    })

    export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),

  newPassword: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
      )
    )
    .min(8)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain letters, numbers, and symbols",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password and Confirm Password must match",
      "any.required": "Confirm Password is required",
    }),
});
