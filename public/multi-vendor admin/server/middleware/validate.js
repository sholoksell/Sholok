const Joi = require("joi");

/**
 * Joi validation middleware factory.
 * Usage: router.post("/", validate(schemas.registerSchema), handler)
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({ field: d.path.join("."), message: d.message })),
      });
    }
    req[source] = value;
    next();
  };
}

const schemas = {
  // ── Auth ───────────────────────────────────────────────
  register: Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).max(60).required(),
    role:     Joi.string().valid("customer", "seller", "admin").default("customer"),
    phone:    Joi.string().allow(""),
    storeName:Joi.string().max(100).allow(""),
  }),
  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  forgotPassword: Joi.object({ email: Joi.string().email().required() }),
  resetPassword:  Joi.object({ password: Joi.string().min(6).max(60).required() }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword:     Joi.string().min(6).max(60).required(),
  }),

  // ── Product ───────────────────────────────────────────
  product: Joi.object({
    name:        Joi.string().min(2).max(200).required(),
    description: Joi.string().allow(""),
    price:       Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0),
    category:    Joi.string(),
    categoryName:Joi.string(),
    images:      Joi.array().items(Joi.string()),
    stock:       Joi.number().min(0).default(0),
    badge:       Joi.string().allow("", "New", "Bestseller", "Limited", "Sale", "Hot", "Trending"),
    isFeatured:  Joi.boolean(),
    isFlashSale: Joi.boolean(),
    seasonalFor: Joi.array().items(Joi.string()),
    tags:        Joi.array().items(Joi.string()),
    variants:    Joi.array(),
  }).unknown(true),

  // ── Order ────────────────────────────────────────────
  placeOrder: Joi.object({
    items: Joi.array().min(1).required(),
    shippingAddress: Joi.object({
      fullName: Joi.string().required(),
      phone:    Joi.string().required(),
      street:   Joi.string().required(),
      city:     Joi.string().required(),
      state:    Joi.string().allow(""),
      zip:      Joi.string().allow(""),
      country:  Joi.string().default("Bangladesh"),
    }).required(),
    paymentMethod: Joi.string().valid("stripe", "sslcommerz", "cod").required(),
    couponCode:    Joi.string().allow(""),
    note:          Joi.string().allow(""),
  }).unknown(true),

  // ── Review ───────────────────────────────────────────
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body:   Joi.string().min(2).max(2000).required(),
    title:  Joi.string().max(120).allow(""),
  }),

  // ── Banner ───────────────────────────────────────────
  banner: Joi.object({
    title:    Joi.string().required(),
    subtitle: Joi.string().allow(""),
    image:    Joi.string().required(),
    mobileImage: Joi.string().allow(""),
    link:     Joi.string().allow(""),
    cta:      Joi.string().allow(""),
    slot:     Joi.string().valid("hero", "promo", "sidebar", "category").default("hero"),
    order:    Joi.number().default(0),
    bgColor:  Joi.string().allow(""),
    textColor:Joi.string().allow(""),
    isActive: Joi.boolean(),
    startsAt: Joi.date(),
    endsAt:   Joi.date(),
  }),
};

module.exports = { validate, schemas, Joi };
