import { createSlice } from "@reduxjs/toolkit";
const initialState = [];

const productSlice = createSlice({
  name: "Products",
  initialState,
  reducers: {
    updateProducts(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updateProducts } = productSlice.actions;
export default productSlice.reducer;
