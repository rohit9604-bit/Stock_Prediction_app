import { body } from 'express-validator';

export const signupValidator = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('businessName').trim().notEmpty().isLength({ min: 2, max: 150 }),
  body('phone')
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .matches(/^[0-9+()\-\s]*$/),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
];

export const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
];