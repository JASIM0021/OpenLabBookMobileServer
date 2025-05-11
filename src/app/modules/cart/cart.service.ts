import { ObjectId } from 'mongoose';
import { TUser } from '../User/user.interface';
import { Cart } from './cart.model';
import { Organization } from '../Organization/organization.model';

const addTocart = async (user: TUser, medicalTests: any, res: any) => {
  console.log('medicalTests', medicalTests);
  const cart = await Cart.findOne({ user: user._id as any });

  //  const isOrganizationExists = await Organization.findById(
  //     payload.organization,
  //   );

  console.log('cart', cart);
  let med = {
    ...medicalTests,
    appointmentTiming: medicalTests?.organizationTiming,
  };

  if (!cart) {
    // If no cart exists, create a new one
    const newCart = new Cart({ user: user._id, medicalTests: [med] });
    await newCart.save();
    return newCart;
  }

  const existingTest = cart.medicalTests.find(
    item => item.testCode === medicalTests.testCode,
  );

  console.log('Jasim ORGTIMING', medicalTests?.organizationTiming);
  if (!existingTest) {
    console.log('Jasim ORGTIMING', medicalTests?.organizationTiming);
    let med = {
      ...medicalTests,
      appointmentTiming: medicalTests?.organizationTiming,
    };

    cart.medicalTests.push(med); // Add the new medical test to the cart
    await cart.save(); // Save the updated cart
  }

  return cart;
};

const getCartItems = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'medicalTests.organization',
    select: '-organizationTiming -organization -medicalTests', // Exclude both fields
    strictPopulate: false,
  });

  console.log('cart', cart);

  const price =
    cart?.medicalTests.reduce(
      (total, item) => total + item.mrp * (item.quantity || 1),
      0,
    ) || 0;
  const discountedPriceTemp =
    cart?.medicalTests.reduce(
      (total, item) => total + item.discountedPrice * (item.quantity || 1),
      0,
    ) || 0;
  const discountedPrice = price - discountedPriceTemp;
  const totalPrice = price - discountedPrice;
  if (cart) {
    return {
      cartItems: cart.medicalTests,
      price,
      discountedPrice: discountedPrice,
      totalPrice,
    };
  }
  return {
    cartItems: [],
    price: 0,
    discountedPrice: 0,
    totalPrice: 0,
  };
};

const deleteFromCart = async (userId: string, testId: string) => {
  const cart = await Cart.findOne({ user: userId });

  console.log('cart', cart);
  console.log('testId', testId);
  if (cart) {
    // Update the medicalTests array by filtering out the test to be deleted
    cart.medicalTests = cart.medicalTests.filter(
      item => item.testCode !== testId,
    );

    console.log('updatecart', cart.medicalTests);
    await cart.save(); // Save the updated cart to the database
    return cart;
  }
  return null; // Return null if cart does not exist
};

const delleteAllCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.medicalTests = []; // Clear all medical tests
    await cart.save(); // Save the updated cart
    return cart;
  }

  return null; // Return null if cart does not exist
};

export const CartService = {
  addTocart,
  getCartItems,
  deleteFromCart,
  delleteAllCart,
};
