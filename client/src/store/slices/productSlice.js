import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const listProducts = createAsyncThunk(
  'products/list',
  async ({ keyword = '', pageNumber = '', category = '', pageSize = '' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/products?keyword=${keyword}&pageNumber=${pageNumber}&category=${category}&pageSize=${pageSize}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const listProductDetails = createAsyncThunk(
  'products/details',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const createProductReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, review }, { rejectWithValue, getState }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(`/api/products/${productId}/reviews`, review, config);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: { reviews: [] },
    loading: false,
    error: null,
    page: 1,
    pages: 1,
  },
  reducers: {
    resetReviewResult: (state) => {
      state.reviewResult = { success: false, loading: false, error: null };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(listProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(listProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(listProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProductReview.pending, (state) => {
        state.reviewResult = { loading: true };
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewResult = { loading: false, success: true };
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewResult = { loading: false, error: action.payload };
      });
  },
});

export const { resetReviewResult } = productSlice.actions;

export default productSlice.reducer;
