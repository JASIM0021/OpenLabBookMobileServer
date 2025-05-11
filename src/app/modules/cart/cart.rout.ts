import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/auth';
import { AddToCart } from './cart.controller';
const router = express.Router();

router.post('/add-to-cart', auth(USER_ROLE.patient), AddToCart.addToCart);
router.get('/all-cart', auth(USER_ROLE.patient), AddToCart.getAllCart);
router.post('/remove-cart', auth(USER_ROLE.patient), AddToCart.removeFromcart);
router.post(
  '/remove-all-cart',
  auth(USER_ROLE.patient),
  AddToCart.removeAllCart,
);

export const CartRouter = router;
