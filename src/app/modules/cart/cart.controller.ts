import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CartService } from './cart.service';
import { TUser } from '../User/user.interface';

const addToCart = catchAsync(async (req, res) => {
  const user = req.userInfo as TUser; // Assuming userInfo contains user details

  // const user = req.user;

  const { medicalTests } = req.body;
  console.log('req.body;', req.body);
  console.log('medicalTestscall', medicalTests);
  const result = await CartService.addTocart(user, medicalTests, res);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest is added to cart successfully',
    data: result,
  });
});

const getAllCart = catchAsync(async (req, res) => {
  const user = req.userInfo as TUser;
  const result = await CartService.getCartItems(user?._id as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest fetch successfully successfully',
    data: result,
  });
});

const removeFromcart = catchAsync(async (req, res) => {
  const user = req.userInfo as TUser;
  const result = await CartService.deleteFromCart(
    user?._id as any,
    req?.body.testCode,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest delete  successfully',
    data: result,
  });
});

const removeAllCart = catchAsync(async (req, res) => {
  const user = req.userInfo as TUser;
  const result = await CartService.delleteAllCart(user?._id as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest delete  successfully',
    data: result,
  });
});

export const AddToCart = {
  addToCart,
  getAllCart,
  removeFromcart,
  removeAllCart,
};
