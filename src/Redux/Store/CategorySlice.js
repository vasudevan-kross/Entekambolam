import { createSlice } from "@reduxjs/toolkit";
const initialState = [];

const CategorySlice = createSlice({
  name: "Category",
  initialState,
  reducers: {
    updateCategory(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updateCategory } = CategorySlice.actions;
export default CategorySlice.reducer;
