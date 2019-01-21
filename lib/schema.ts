const Joi = require('joi');

export const keyValue = Joi.object().keys({
  key: Joi.string()
    .trim()
    .required(),
  value: Joi.string()
    .trim()
    .required(),
  oldValue: Joi.string()
});

export const user = Joi.object()
  .keys({
    firstName: Joi.string()
      .trim()
      .required(),
    lastName: Joi.string()
      .trim()
      .required(),
    userName: Joi.string()
      .alphanum()
      .trim()
      .min(3)
      .max(30)
      .required(),
    accessToken: [Joi.string().trim(), Joi.number()],
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    salt: Joi.string()
      .trim()
      .required(),
    hash: Joi.string()
      .trim()
      .required(),
    verified: Joi.boolean().required(),
    isAdmin: Joi.boolean().required(),
    verificationKey: Joi.string()
  })
  .without('password', 'accessToken');
