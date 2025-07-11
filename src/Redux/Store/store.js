import { configureStore } from "@reduxjs/toolkit";
import CategoryReducer from "./CategorySlice";
import productReducer from "./productSlice";
import subcatSlice from "./subcatSlice";
import userSlice from "./userSlice";
import appSettingSlice from "./appSettingSlice";

const store = configureStore({
  reducer: {
    Category: CategoryReducer,
    Products: productReducer,
    subCategory: subcatSlice,
    Users: userSlice,
    AppSettings: appSettingSlice,
  },
});

export default store;
