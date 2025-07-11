import { createSlice } from "@reduxjs/toolkit";
const initialState = [];

const userSlice = createSlice({
  name: "Users",
  initialState,
  reducers: {
    updateUsers(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updateUsers } = userSlice.actions;
export default userSlice.reducer;
