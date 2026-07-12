import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Public endpoint for active offers (No auth required)
export const fetchOffers = createAsyncThunk('offers/fetchActive', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/api/offers');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Admin/Sales endpoint for all offers (Auth required)
export const fetchAdminOffers = createAsyncThunk('offers/fetchAdminAll', async (_, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.get('/api/offers/all', config);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createOffer = createAsyncThunk('offers/create', async (offerData, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.post('/api/offers', offerData, config);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateOffer = createAsyncThunk('offers/update', async ({ id, offerData }, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.put(`/api/offers/${id}`, offerData, config);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteOffer = createAsyncThunk('offers/delete', async (id, { getState, rejectWithValue }) => {
  try {
    const { auth: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    await axios.delete(`/api/offers/${id}`, config);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchProductOffers = createAsyncThunk('offers/fetchByProduct', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`/api/offers/product/${productId}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const validateCoupon = createAsyncThunk('offers/validateCoupon', async ({ code, productIds }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/offers/validate', { code, productIds });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const offerSlice = createSlice({
  name: 'offers',
  initialState: {
    offers: [],
    productOffers: [],
    loading: false,
    error: null,
    successCreate: false,
    successUpdate: false,
    successDelete: false,
    validatingCoupon: false,
    couponError: null,
    validatedCoupon: null,
  },
  reducers: {
    resetOfferStatus: (state) => {
      state.successCreate = false;
      state.successUpdate = false;
      state.successDelete = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => { state.loading = true; })
      .addCase(fetchOffers.fulfilled, (state, action) => { state.loading = false; state.offers = action.payload; })
      .addCase(fetchOffers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchAdminOffers.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminOffers.fulfilled, (state, action) => { state.loading = false; state.offers = action.payload; })
      .addCase(fetchAdminOffers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createOffer.pending, (state) => { state.loading = true; })
      .addCase(createOffer.fulfilled, (state, action) => { state.loading = false; state.successCreate = true; state.offers.push(action.payload); })
      .addCase(createOffer.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateOffer.pending, (state) => { state.loading = true; })
      .addCase(updateOffer.fulfilled, (state, action) => { 
        state.loading = false; 
        state.successUpdate = true; 
        state.offers = state.offers.map(o => o._id === action.payload._id ? action.payload : o); 
      })
      .addCase(updateOffer.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteOffer.pending, (state) => { state.loading = true; })
      .addCase(deleteOffer.fulfilled, (state, action) => { 
        state.loading = false; 
        state.successDelete = true;
        state.offers = state.offers.filter(o => o._id !== action.payload); 
      })
      .addCase(deleteOffer.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProductOffers.pending, (state) => { state.loading = true; })
      .addCase(fetchProductOffers.fulfilled, (state, action) => { state.loading = false; state.productOffers = action.payload; })
      .addCase(fetchProductOffers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(validateCoupon.pending, (state) => { state.validatingCoupon = true; state.couponError = null; })
      .addCase(validateCoupon.fulfilled, (state, action) => { state.validatingCoupon = false; state.validatedCoupon = action.payload; })
      .addCase(validateCoupon.rejected, (state, action) => { state.validatingCoupon = false; state.couponError = action.payload; });
  }
});

export const { resetOfferStatus } = offerSlice.actions;
export default offerSlice.reducer;
