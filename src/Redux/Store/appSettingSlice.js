import { createSlice } from "@reduxjs/toolkit";
const initialState = [];

const appSettingSlice = createSlice({
  name: "AppSettings",
  initialState,
  reducers: {
    updateAppSetting(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updateAppSetting } = appSettingSlice.actions;
export default appSettingSlice.reducer;
