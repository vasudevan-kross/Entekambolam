import React, { useEffect } from "react";
import Login from "./Pages/Login";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useDispatch } from "react-redux";
import { updateCategory } from "./Redux/Store/CategorySlice";
import { GET } from "./Functions/apiFunction";
import api from "./Data/api";
import { updateProducts } from "./Redux/Store/productSlice";
import { updatesubCategory } from "./Redux/Store/subcatSlice";
import { ColorModeContext, useMode } from "./theme";
import Topbar from "./Global/Topbar";
import Sidebar from "./Global/Sidebar";
import Dashboard from "./Global/Dashboard";
import { updateUsers } from "./Redux/Store/userSlice";
import { updateAppSetting } from "./Redux/Store/appSettingSlice";
import Utils from "./Global/utils";
import { Route, Routes } from "react-router-dom";
import PrivacyPolicy from "./Pages/Legal/PrivacyPolicy";
import TermsAndCondition from "./Pages/Legal/TermsAndCondition";
import RefundPolicy from "./Pages/Legal/RefundPolicy";
import AboutUs from "./Pages/Legal/AboutUs";
import AccountSupport from "./Pages/Legal/AccountSupport";

function App() {
  const [theme, colorMode] = useMode();
  const dispatch = useDispatch();
  const user = Utils.getUserData();
  const token = `Bearer ${user?.token}`;

  useEffect(() => {
    const appSettings = async () => {
      const url = `${api}/get_web_app_settings`;
      const settings = await GET(token, url);
      dispatch(updateAppSetting(settings.data));
    };
    user && appSettings();
  }, [token, dispatch, user]);
  useEffect(() => {
    const getCat = async () => {
      const url = `${api}/get_cat`;
      const cat = await GET(token, url);
      dispatch(updateCategory(cat.data));
    };
    user && getCat();
  }, [token, dispatch, user]);

  useEffect(() => {
    // get subcat
    const getsubcat = async () => {
      const url = `${api}/get_sub_cat`;
      const subcat = await GET(token, url);
      dispatch(updatesubCategory(subcat.data));
    };
    user && getsubcat();
  }, [token, dispatch, user]);

  useEffect(() => {
    const getCat = async () => {
      const url = `${api}/get_product`;
      const products = await GET(token, url);
      dispatch(updateProducts(products.data));
    };
    user && getCat();
  }, [token, dispatch, user]);
  useEffect(() => {
    const users = async () => {
      const url = `${api}/get_user`;
      const users = await GET(token, url);
      dispatch(updateUsers(users.data));
    };
    user && users();
  }, [token, dispatch, user]);

  // return (
  //   <ColorModeContext.Provider value={colorMode}>
  //     <ThemeProvider theme={theme}>
  //       <CssBaseline />
  //       <div className="app" style={{}}>
  //         {user ? (
  //           <>
  //             <Sidebar />
  //             <main className="content">
  //               <Topbar />
  //               <Dashboard />
  //             </main>
  //           </>
  //         ) : (
  //           <Login />
  //         )}
  //       </div>
  //     </ThemeProvider>
  //   </ColorModeContext.Provider>
  // );
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Privacy Policy Page (Accessible without login) */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-condition" element={<TermsAndCondition />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/account-support" element={<AccountSupport />} />

          {/* If No User, Show Login Page */}
          {!user ? (
            <Route path="/*" element={<Login />} />
          ) : (
            <Route path="/*" element={<Layout />} />
          )}
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Topbar />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
