import { createSlice } from '@reduxjs/toolkit';

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

const appliedCouponFromStorage = localStorage.getItem('appliedCoupon')
  ? JSON.parse(localStorage.getItem('appliedCoupon'))
  : null;

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
    paymentMethod: 'PayPal',
    appliedCoupon: appliedCouponFromStorage,
  },
  reducers: {
    addToCart: (state, action) => {
      let item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      // Recalculate price if wholesale tiers exist
      if (item.wholesaleTiers && item.wholesaleTiers.length > 0) {
        const sortedTiers = [...item.wholesaleTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        let activePrice = item.basePrice || item.price;
        for (let tier of sortedTiers) {
          if (item.qty >= tier.minQuantity) {
            activePrice = tier.price;
            break;
          }
        }
        item.price = activePrice;
      }

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product ? item : x
        );
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.appliedCoupon = null;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('appliedCoupon');
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      localStorage.setItem('appliedCoupon', JSON.stringify(action.payload));
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      localStorage.removeItem('appliedCoupon');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;
export default cartSlice.reducer;
