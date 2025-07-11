import { createSlice } from "@reduxjs/toolkit";
const initialState = [];

const subCatSlice = createSlice({
  name: "subCategory",
  initialState,
  reducers: {
    updatesubCategory(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updatesubCategory } = subCatSlice.actions;
export default subCatSlice.reducer;
