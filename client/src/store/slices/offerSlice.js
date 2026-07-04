import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchOffers = createAsyncThunk('offers/fetchAll', async (_, { getState, rejectWithValue }) => {
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

const offerSlice = createSlice({
  name: 'offers',
  initialState: {
    offers: [],
    loading: false,
    error: null,
    successCreate: false,
    successUpdate: false,
    successDelete: false,
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
  }
});

export const { resetOfferStatus } = offerSlice.actions;
export default offerSlice.reducer;
