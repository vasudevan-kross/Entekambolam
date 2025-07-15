import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/system";
import {
  Button,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Stack,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import TextField from "@mui/material/TextField";
import api from "./../Data/api";
import { ADD, GET } from "../Functions/apiFunction";
import { tokens } from "../theme";
import moment from "moment";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import * as CONSTANTS from "../Common/Constants";

function NewOrder() {
  const products = useSelector((state) => {
    return state.Products[state.Products.length - 1];
  });

  const [users, setusers] = useState();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [userId, setuserId] = useState();
  const [productId, setproductId] = useState();
  const [price, setprice] = useState(0);
  const [MRP, setMRP] = useState(0);
  const [tax, settax] = useState(0);
  const [orderAmount, setorderAmount] = useState(0);
  const [originalOrderAmount, setOriginalOrderAmount] = useState(0);
  const [date, setdate] = useState();
  const [addressID, setaddressID] = useState();
  const [quantity, setquantity] = useState(1);
  const [subsType, setsubsType] = useState("");
  const [status, setstatus] = useState();
  const [order_status, setorder_status] = useState(0);
  const [type, settype] = useState(1);
  const [paymentMode, setpaymentMode] = useState(1);

  const [name, setname] = useState();
  const [number, setnumber] = useState();
  const [apartment, setapartment] = useState();
  const [flat, setflat] = useState();
  const [area, setarea] = useState();
  const [landmark, setlandmark] = useState();
  const [city, setcity] = useState();
  const [pincode, setpincode] = useState();

  const [addnew, setaddnew] = useState(false);
  const [LOADING, setLOADING] = useState(false);
  const [address, setaddress] = useState();
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [orderType, setOrderType] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [oneTimeDeliveryCharge, setOneTimeDeliveryCharge] = useState(0);
  const [subDeliveryCharge, setSubDeliveryCharge] = useState(0);
  const [freeDeliveryMax, setFreeDeliveryMax] = useState(0);
  const [deliveryAmount, setDeliveryAmount] = useState(0);
  const [deliveryInstruction, setDeliveryInstruction] = useState("");
  const [calcAmt, setCalcAmt] = useState(false);
  const [startDayCode, setStartDayCode] = useState();
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // days state
  const [M, setM] = useState();
  const [T, setT] = useState();
  const [W, setW] = useState();
  const [TH, setTH] = useState();
  const [F, setF] = useState();
  const [S, setS] = useState();
  const [SU, setSU] = useState();
  // dayqt
  const [M_QT, setM_QT] = useState(1);
  const [T_QT, setT_QT] = useState(1);
  const [W_QT, setW_QT] = useState(1);
  const [TH_QT, setTH_QT] = useState(1);
  const [F_QT, setF_QT] = useState(1);
  const [S_QT, setS_QT] = useState(1);
  const [SU_QT, setSU_QT] = useState(1);

  let selected_days = [
    {
      d: M,
      qt: M_QT,
      id: 1,
      name: "Monday",
      add: function () {
        setM_QT(M_QT + 1);
      },
      remove: function () {
        setM_QT(M_QT > 1 ? M_QT - 1 : 1);
      },
    },
    {
      d: T,
      qt: T_QT,
      id: 2,
      name: "Tuesday",
      add: function () {
        setT_QT(T_QT + 1);
      },
      remove: function () {
        setT_QT(T_QT > 1 ? T_QT - 1 : 1);
      },
    },
    {
      d: W,
      qt: W_QT,
      id: 3,
      name: "Wednesday",
      add: function () {
        setW_QT(W_QT + 1);
      },
      remove: function () {
        setW_QT(W_QT > 1 ? W_QT - 1 : 1);
      },
    },
    {
      d: TH,
      qt: TH_QT,
      id: 4,
      name: "Thursday",
      add: function () {
        setTH_QT(TH_QT + 1);
      },
      remove: function () {
        setTH_QT(TH_QT > 1 ? TH_QT - 1 : 1);
      },
    },
    {
      d: F,
      qt: F_QT,
      id: 5,
      name: "Friday",
      add: function () {
        setF_QT(F_QT + 1);
      },
      remove: function () {
        setF_QT(F_QT > 1 ? F_QT - 1 : 1);
      },
    },
    {
      d: S,
      qt: S_QT,
      id: 6,
      name: "Saturday",
      add: function () {
        setS_QT(S_QT + 1);
      },
      remove: function () {
        setS_QT(S_QT > 1 ? S_QT - 1 : 1);
      },
    },
    {
      d: SU,
      qt: SU_QT,
      id: 0,
      name: "Sunday",
      add: function () {
        setSU_QT(SU_QT + 1);
      },
      remove: function () {
        setSU_QT(SU_QT > 1 ? SU_QT - 1 : 1);
      },
    },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingIds = [16, 17, 18];
        const url = `${api}/get_web_app_settings_by_ids/${JSON.stringify(
          settingIds
        )}`;
        const result = await GET(token, url);
        if (result.response === 200) {
          const settingsMap = result.data.reduce((acc, setting) => {
            acc[setting.id] = parseFloat(setting.value);
            return acc;
          }, {});
          setOneTimeDeliveryCharge(settingsMap[16] || 0);
          setSubDeliveryCharge(settingsMap[17] || 0);
          setFreeDeliveryMax(settingsMap[18] || 0);
        } else {
          throw new Error(`Unexpected response code: ${result.response}`);
        }
      } catch (error) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(`Failed to fetch Delivery Details: ${error.message}`);
      }
    };
    const getUsers = async () => {
      try {
        setIsUserLoading(true);
        const url = `${api}/get_user`;
        const users = await GET(token, url);
        setusers(users?.data);
      } catch (error) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(`Failed to fetch User Details: ${error.message}`);
      } finally {
        setIsUserLoading(false);
      }
    };
    getUsers();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (Array.isArray(products)) {
      const filtered = products?.filter((product) => {
        if (orderType === 0 && product.status === "Approved") {
          setDeliveryAmount(0);
          return product.subscription === 1;
        } else if (orderType === 1 && product.status === "Approved") {
          setDeliveryAmount(oneTimeDeliveryCharge);
          return product;
        }
        return false;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    resetOrderStates();
  }, [orderType, products]);

  const getAvailableCoupons = async (userId) => {
    setLOADING(true);
    try {
      if (!userId) {
        setCoupons([]);
        setFilteredCoupons([]);
        return;
      }
      const url = `${api}/get_available_coupons?user_id=${userId}`;
      const res = await GET(token, url);
      if (res?.data) {
        setCoupons(res.data);
        setFilteredCoupons(res.data);
      } else {
        setCoupons([]);
        setFilteredCoupons([]);
        clearCouponSelection();
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
      setFilteredCoupons([]);
      clearCouponSelection();
    } finally {
      setLOADING(false);
    }
  };

  useEffect(() => {
    clearCouponSelection();
    if (userId) {
      getAvailableCoupons(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!originalOrderAmount) {
      clearCouponSelection();
      return;
    }
    if (appliedCoupon) {
      validateCoupon(appliedCoupon);
    } else {
      setDiscountAmount(0);
      setorderAmount(parseFloat(originalOrderAmount).toFixed(2));
    }
  }, [appliedCoupon, originalOrderAmount]);

  const resetOrderStates = () => {
    setprice(0);
    setMRP(0);
    setorderAmount(0);
    setOriginalOrderAmount(0);
    setquantity(0);
    setsubsType("");
    settax(0);
    setSelectedProducts([]);
    setDiscountAmount(0);
  };

  // const selectDays = () => {
  //   let arr = [];
  //   for (let index = 0; index < selected_days.length; index++) {
  //     if (selected_days[index].d !== undefined) {
  //       arr.push({
  //         dayCode: selected_days[index].d,
  //         qty: selected_days[index].qt,
  //       });
  //     }
  //   }
  //   let string = "";

  //   for (let i = 0; i < arr.length; i++) {
  //     const obj = arr[i];
  //     string += `{dayCode:${obj.dayCode}, qty:${obj.qty}},`;
  //   }
  //   string = `[${string.slice(0, -1)}]`;
  //   return {
  //     arr: arr,
  //     string: string,
  //   };
  // };

  const selectDays = () => {
    if (!Array.isArray(selected_days)) {
      throw new Error("selected_days must be an array");
    }

    const arr = selected_days
      ?.filter((day) => day.d !== null && day.d !== undefined) // Filter valid entries
      .map((day) => ({ dayCode: day.d, qty: day.qt })); // Map to desired format

    const string = JSON.stringify(arr); // Convert array to JSON string

    return {
      arr,
      string,
    };
  };

  const today = new Date().toISOString().split("T")[0];

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const getUserById = async (userId) => {
    try {
      const url = `${api}/get_user/${userId}`;
      const result = await GET(token, url);
      if (result.response === 200) {
        return result.data;
      } else {
        throw new Error(`Unexpected response code: ${result.response}`);
      }
    } catch (error) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(`Failed to fetch user with ID ${userId}:`, error);
      return;
    }
  };

  const getPincode = async (pincode) => {
    try {
      const url = `${api}/get_pincode/pincode/${pincode}`;
      const result = await GET(token, url);
      if (result.response === 200) {
        return result?.data;
      } else {
        throw new Error(`Unexpected response code: ${result.response}`);
      }
    } catch (error) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(`Failed to fetch pincode with  ${pincode}:`, error);
      return;
    }
  };

  const addOrder = async (e) => {
    e.preventDefault();
    setLOADING(true);
    var selectedDayCode = selectDays().arr;
    const orderTotalAmount = parseFloat(orderAmount);
    // Check subscription type and selected days for weekly deliveries
    if (subsType === 2 && !selectDays().arr.length) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Please Select Delivery Days and Per Day Quality");
      setLOADING(false);
      return;
    }

    const selectedUser = await getUserById(userId);
    if (!selectedUser) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("User is not active or incorrect user");
      setLOADING(false);
      return;
    }
    if (
      selectedUser &&
      selectedUser.wallet_amount < parseFloat(orderTotalAmount)
    ) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Insufficiant wallet amount to place order");
      setLOADING(false);
      return;
    }
    const selectedAddressPin = address.find(
      (address) => address.id === addressID
    );
    const addressPincode = selectedAddressPin?.pincode || pincode;

    if (!addressPincode) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Please update the delivery pincode to place ordr");
      setLOADING(false);
      return;
    }
    const isPincodeAvailable = await getPincode(addressPincode);
    if (!isPincodeAvailable) {
      handleSnakBarOpen();
      setalertType("info");
      setalertMsg("Sorry we are not delivering in this area");
      setLOADING(false);
      return;
    }
    // Data for the address
    const addresData = {
      user_id: userId,
      name: name,
      s_phone: number,
      flat_no: flat,
      apartment_name: apartment,
      area: area,
      landmark: landmark,
      city: city,
      pincode: pincode,
    };

    const productDetail = selectedProducts.map((item) => ({
      product_id: item.product_id.toString(),
      product_title: item.product_title,
      qty: item.qty.toString(),
      tax: item.tax.toString(),
      mrp: item.mrp.toString(),
      price: item.price.toString(),
      total_price: item.total_price.toFixed(2),
    }));

    if (addnew) {
      try {
        // First, add the address
        let url = `${api}/add_address`;
        const address = await ADD(token, url, addresData);

        if (address.response !== 200) {
          setalertType("error");
          setalertMsg(address.message || "Error adding address");
          handleSnakBarOpen();
          setLOADING(false);
          return;
        }

        // Prepare transaction data if needed (type === 1)
        let transectionID = null;
        if (type === 1) {
          const transectionData = {
            user_id: userId,
            payment_id: "",
            amount: orderTotalAmount,
            description: "Amount paid from wallet",
            type: "2",
            payment_mode: paymentMode,
          };

          url = `${api}/add_order_txn`;
          const transaction = await ADD(token, url, transectionData);

          if (transaction.response !== 200) {
            setalertType("error");
            setalertMsg("Error processing transaction");
            handleSnakBarOpen();
            setLOADING(false);
            return;
          }
          transectionID = transaction.id;
        }

        // Prepare and call the add_order API
        const orderData = {
          user_id: userId,
          product_id: orderType == 1 ? null : productId,
          order_amount: orderTotalAmount,
          start_date: date,
          qty: quantity,
          address_id: address.id,
          subscription_type: subsType,
          status: status || 0,
          order_status: order_status,
          order_type: type,
          selected_days_for_weekly: subsType === 2 ? selectDays().string : null,
          price: price,
          mrp: MRP,
          tax: tax,
          trasation_id: transectionID,
          isFromAdmin: true,
          product_detail: productDetail,
          delivery_charge: deliveryAmount,
          delivery_instruction: deliveryInstruction || "",
          coupon_id: appliedCoupon ? appliedCoupon.id : null,
          coupon_discount_value: discountAmount || 0,
        };

        url = `${api}/add_order`;
        const addOrderResponse = await ADD(token, url, orderData);

        if (addOrderResponse.response === 200) {
          setalertType("success");
          setalertMsg("New Order Added successfully");
          handleSnakBarOpen();
          setTimeout(() => {
            subsType
              ? navigate("/subscription-orders")
              : navigate("/buyonce-orders");
          }, 1000);
        } else {
          setalertType("error");
          setalertMsg(addOrderResponse.message || "Error adding order");
          handleSnakBarOpen();
        }
      } catch (error) {
        setalertType("error");
        setalertMsg("Something went wrong! Please try again.");
        handleSnakBarOpen();
      } finally {
        setLOADING(false);
      }
    } else {
      // Non-addnew flow
      let transectionID = null;

      if (type === 1) {
        const transectionData = {
          user_id: userId,
          payment_id: "",
          amount: orderTotalAmount,
          description: "Amount paid from wallet",
          type: "2",
          payment_mode: type === 1 ? 1 : paymentMode,
        };

        const url = `${api}/add_order_txn`;
        const transaction = await ADD(token, url, transectionData);

        if (transaction.response !== 200) {
          setalertType("error");
          setalertMsg("Error processing transaction");
          handleSnakBarOpen();
          setLOADING(false);
          return;
        }
        transectionID = transaction.id;
      }

      const orderData = {
        user_id: userId,
        product_id: productId,
        order_amount: orderTotalAmount,
        start_date: date,
        qty: quantity,
        address_id: addressID,
        subscription_type: subsType,
        status: status || 0,
        order_status: order_status,
        order_type: type,
        selected_days_for_weekly: subsType === 2 ? selectDays().string : null,
        price: price,
        mrp: MRP,
        tax: tax,
        trasation_id: transectionID,
        isFromAdmin: true,
        product_detail: productDetail,
        delivery_charge: deliveryAmount,
        delivery_instruction: deliveryInstruction || "",
        coupon_id: appliedCoupon ? appliedCoupon.id : null,
        coupon_discount_value: discountAmount || 0,
      };

      const url = `${api}/add_order`;
      const addOrderResponse = await ADD(token, url, orderData);

      if (addOrderResponse.response === 200) {
        setalertType("success");
        setalertMsg("New Order Added successfully");
        handleSnakBarOpen();
        setTimeout(() => {
          subsType
            ? navigate("/subscription-orders")
            : navigate("/buyonce-orders");
        }, 1000);
      } else {
        setalertType("error");
        setalertMsg(addOrderResponse.message || "Error adding order");
        handleSnakBarOpen();
      }
      setLOADING(false);
    }
  };

  const getAddress = async (userID) => {
    try {
      setIsAddressLoading(true);
      const url = `${api}/address/user/${userID}`;
      const add = await GET(token, url);
      if (add.response === 200) {
        setaddress(add.data);
      } else if (add.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(add.message);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }
    } catch (e) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    } finally {
      setIsAddressLoading(false);
    }
  };

  const getFormattedAddress = (ad) => {
    const address = [
      ad.flat_no,
      ad.apartment_name,
      ad.area,
      ad.landmark,
      ad.city,
      ad.pincode,
    ]
      ?.filter(Boolean)
      .join(" , ");
    return address;
  };

  const handleQuantityChange = (data, quantity) => {
    const quantityInt = parseInt(quantity);
    const productList = selectedProducts.map((product) => {
      if (product.product_id === data.product_id) {
        const priceWithTax = data.price * (1 + data.tax / 100);
        return {
          ...product,
          qty: quantityInt,
          total_price: priceWithTax * quantityInt,
        };
      }
      return product;
    });
    const totalQuantity = productList.reduce(
      (sum, product) => sum + product.qty,
      0
    );
    const totalPrice = productList.reduce(
      (sum, product) => sum + product.total_price,
      0
    );
    setprice(parseFloat(totalPrice).toFixed(2));
    setMRP(parseFloat(totalPrice).toFixed(2));
    const calculatedDeliveryAmount =
      freeDeliveryMax > 0 && totalPrice > 0 && totalPrice > freeDeliveryMax
        ? 0
        : oneTimeDeliveryCharge;
    const finalAmount = parseFloat(
      totalPrice + calculatedDeliveryAmount
    ).toFixed(2);
    setorderAmount(finalAmount);
    setOriginalOrderAmount(finalAmount);
    setDeliveryAmount(calculatedDeliveryAmount);
    setquantity(parseInt(totalQuantity));
    setSelectedProducts(productList);
  };

  const updateDeliveryQtyCharge = (qty) => {
    const taxPrice = (price * tax) / 100;
    const orderDays = subsType === 3 ? 30 : subsType === 4 ? 15 : 1;
    const deliveryCharge = subDeliveryCharge;
    if ([1, 3, 4].includes(subsType)) {
      const orderAmount =
        ((taxPrice + price) * qty + deliveryCharge) * orderDays;
      const finalAmount = parseFloat(orderAmount).toFixed(2);
      setorderAmount(finalAmount);
      setOriginalOrderAmount(finalAmount);
      const deliveryAmt = deliveryCharge * orderDays;
      setDeliveryAmount(deliveryAmt);
    }
  };

  const handleChangeSubscription = (e) => {
    var subsType = e.target.value;
    setsubsType(subsType);
    const taxPrice = (price * tax) / 100;
    const orderDays = subsType === 3 ? 30 : subsType === 4 ? 15 : 1;
    const deliveryCharge = subDeliveryCharge;
    if ([1, 3, 4].includes(subsType)) {
      const orderAmount =
        ((taxPrice + price) * quantity + deliveryCharge) * orderDays;
      const deliveryAmt = deliveryCharge * orderDays;
      setDeliveryAmount(deliveryAmt);
      const finalAmount = parseFloat(orderAmount).toFixed(2);
      setorderAmount(finalAmount);
      setOriginalOrderAmount(finalAmount);
    } else {
      setorderAmount(0);
      setOriginalOrderAmount(0);
      setquantity(0);
      setDeliveryAmount(0);
      setCalcAmt(false);
    }
  };

  const calculateWeeklyAmount = () => {
    let totalQty = 0;
    let totalAmt = 0;
    let subDeliveryAmount = 0;
    let taxPrice = (price * tax) / 100;
    var selectedDayCode = selectDays().arr;
    const weeklytotalDays = 7;
    let reorderedDayCode = selectedDayCode;
    if (!date) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Select 'Start From' to calculate");
      return;
    }
    if (selectedDayCode.length === 0) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Select 'Days' to calculate");
      return;
    }

    if (!selectedDayCode.some((item) => item.dayCode === startDayCode)) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(
        "Selected 'Start From' day not selected in the Weekly day list!"
      );
      return;
    }
    const startingIndex = selectedDayCode.findIndex(
      (element) => element.dayCode === startDayCode
    );

    if (startingIndex !== -1) {
      reorderedDayCode = [
        ...selectedDayCode.slice(startingIndex),
        ...selectedDayCode.slice(0, startingIndex),
      ];
    }
    for (let i = 0; i < 7; i++) {
      var dayQty = reorderedDayCode[i % reorderedDayCode.length];
      totalQty += dayQty["qty"] ?? 0;
      // subDeliveryAmount +=
      //   (dayQty["qty"] ?? 0) * price >= freeDeliveryMax ? 0 : subDeliveryCharge;
    }
    subDeliveryAmount = subDeliveryCharge * weeklytotalDays;
    totalAmt = (taxPrice + price) * totalQty + subDeliveryAmount;
    setDeliveryAmount(subDeliveryAmount);
    setquantity(totalQty);
    const finalAmount = parseFloat(totalAmt).toFixed(2);
    setorderAmount(finalAmount);
    setOriginalOrderAmount(finalAmount);
    setCalcAmt(true);
  };

  const handleOrderTypeChange = () => {
    const updatedOrderType = orderType === 1 ? 0 : 1;
    setOrderType(updatedOrderType);
    if (updatedOrderType === 1) {
      const nextDay = moment().add(1, "day").format("YYYY-MM-DD");
      setdate(nextDay);
    } else {
      setdate(null);
    }
  };

  const calculateDiscountAmount = (coupon, cartTotal) => {
    if (!coupon || !cartTotal) return 0;

    const orderValue = parseFloat(cartTotal);
    let discount = 0;

    if (coupon.type === 2) {
      // Percentage-based coupon
      discount = (coupon.value / 100) * orderValue;
    } else {
      // Fixed amount coupon
      discount = parseFloat(coupon.value || 0);
    }

    // Ensure discount doesn't exceed order amount
    return Math.min(discount, orderValue);
  };

  const clearCouponSelection = () => {
    setSelectedCoupon(null);
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
    setFilteredCoupons(coupons);
    setCouponValidating(false);
    setDiscountAmount(0);
    setorderAmount(parseFloat(originalOrderAmount).toFixed(2));
  };

  const setCouponState = (coupon, error = "") => {
    if (coupon) {
      setSelectedCoupon(coupon);
      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);
      setCouponError("");
    } else {
      setSelectedCoupon(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(error);
    }
  };

  const findCouponByCode = (code) => {
    const trimmedCode = code.trim().toLowerCase();
    return coupons.find(
      (coupon) => coupon?.code?.trim().toLowerCase() === trimmedCode
    );
  };

  const validateCoupon = async (coupon) => {
    if (!coupon || !userId) return;

    const minVal = parseFloat(coupon.min_cart_value || 0);
    const orderVal = parseFloat(originalOrderAmount);

    if (minVal && orderVal < minVal) {
      setCouponError(
        `Minimum cart value for this coupon is ₹${coupon.min_cart_value}`
      );
      setDiscountAmount(0);
      setorderAmount(orderVal.toFixed(2));
      return;
    }

    try {
      setCouponValidating(true);
      const response = await ADD(token, `${api}/validate_coupon`, {
        code: coupon.code,
        user_id: userId,
        cart_total: orderVal,
      });

      if (response?.response === 200) {
        const discount =
          response.data?.discount || calculateDiscountAmount(coupon, orderVal);
        const finalAmount = Math.max(0, orderVal - discount);
        setCouponError("");
        setDiscountAmount(discount);
        setorderAmount(finalAmount.toFixed(2));
      } else {
        setCouponError(response?.message || "Invalid coupon code");
        setDiscountAmount(0);
        setorderAmount(orderVal.toFixed(2));
      }
    } catch (error) {
      setCouponError("Something went wrong. Please try again.");
      setDiscountAmount(0);
      setorderAmount(orderVal.toFixed(2));
    } finally {
      setCouponValidating(false);
    }
  };

  const handleCouponChange = async (e, value, reason) => {
    if (reason === "clear" || !value) {
      clearCouponSelection();
      return;
    }

    setCouponError("");
    setFilteredCoupons(coupons);

    if (typeof value === "string") {
      const coupon = findCouponByCode(value);
      setCouponState(coupon, coupon ? "" : "Invalid Coupon code");
    } else if (value?.code) {
      setCouponState(value);
    }
  };

  const handleCouponInputChange = (newInputValue, reason) => {
    if (reason === "clear" || !newInputValue) {
      clearCouponSelection();
      return;
    }

    if (reason !== "input") return;

    const input = newInputValue.trim().toLowerCase();
    setCouponCode(newInputValue.trim());
    setCouponState(null); // Reset selected/applied

    const filtered = coupons.filter((coupon) => {
      const code = coupon?.code?.toLowerCase() || "";
      const desc = coupon?.description?.toLowerCase() || "";
      return code.includes(input) || desc.includes(input);
    });

    setFilteredCoupons(filtered);
    setCouponError(filtered.length === 0 ? "No matching coupons found" : "");
  };

  const handleCouponEnterPress = () => {
    if (!couponCode || !coupons?.length) return;
    const trimmedCode = couponCode.trim();
    if (appliedCoupon && appliedCoupon.code === trimmedCode) return;
    const coupon = findCouponByCode(trimmedCode);
    setFilteredCoupons(coupons);

    if (!coupon) {
      setCouponState(null, "Invalid Coupon code");
      return;
    }
    setSelectedCoupon(coupon);
    setCouponCode(coupon.code);
    setAppliedCoupon(coupon);
    setCouponError("");
  };

  const handleCouponKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCouponEnterPress();
    }
  };

  return (
    <>
      <Snackbar
        open={snakbarOpen}
        autoHideDuration={3000}
        onClose={handleSnakBarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnakBarClose}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "10px",
          borderBottom: colors.grey[300],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => {
              subsType
                ? navigate("/subscription-orders")
                : navigate("/buyonce-orders");
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            className=""
            variant="h2"
            component={"h2"}
            fontWeight={600}
            fontSize={"1.5rem"}
            lineHeight={"2rem"}
            sx={{
              color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
            }}
          >
            Add New Order
          </Typography>
        </div>
      </Box>
      <Box component="form" onSubmit={addOrder}>
        <div className="product">
          {/* <div className={`left text-card-foreground shadow-sm rounded-lg p-4 xl:p-2 ${theme.palette.mode === 'dark' ? "bg-darkcard" : "bg-card"
            }`}> */}
          <div
            className="left"
            style={{
              backgroundColor: colors.cardBG[400],
              maxWidth: "100%",
            }}
          >
            <Typography
              className="mb1"
              variant="h3"
              component={"h3"}
              fontWeight={600}
              // fontSize={'1rem'}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              {`Order Details - ${
                orderType === 0 ? "Subscription Order" : "Buy Once"
              }`}
            </Typography>
            <Typography
              className="mb1"
              variant="para"
              component={"p"}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Enter the required information below. You can change it anytime
              you want.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <Autocomplete
                  disablePortal
                  fullWidth
                  id="combo-box-demo"
                  color="secondary"
                  options={users}
                  disabled={isUserLoading} // Pass loading state
                  onChange={(e, data) => {
                    setuserId(data?.id);
                    if (data?.id) getAddress(data?.id);
                  }}
                  getOptionLabel={(option) =>
                    `${option?.name} (${
                      option?.phone ? option?.phone : option?.email
                    })` || ""
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="User"
                      size="small"
                      fullWidth
                      required
                      color="secondary"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isUserLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Box
                  display={"flex"}
                  alignItems="center"
                  gap="1rem"
                  justifyContent="space-evenly"
                >
                  <Typography fontSize={"16px"} fontWeight={"600"}>
                    Buy Once
                  </Typography>
                  <div class="toggle-switch">
                    <input
                      class="toggle-input"
                      id="toggle1"
                      type="checkbox"
                      checked={orderType === 0}
                      onChange={() => {
                        handleOrderTypeChange();
                      }}
                    />
                    <label class="toggle-label-2" for="toggle1"></label>
                  </div>
                  <Typography fontSize={"16px"} fontWeight={"600"}>
                    Subscription Order
                  </Typography>
                </Box>
              </Grid>
              {orderType === 0 ? (
                <Grid item xs={4}>
                  <Autocomplete
                    disablePortal
                    fullWidth
                    id="combo-box-demo"
                    color="secondary"
                    options={filteredProducts || []}
                    onChange={(e, data) => {
                      if (!data) {
                        setproductId(null);
                        setprice(0);
                        setMRP(0);
                        setquantity(0);
                        setDeliveryAmount(0);
                        setsubsType("");
                        settax(0);
                        setorderAmount(0);
                        setOriginalOrderAmount(0);
                        return;
                      }
                      setproductId(data.id);
                      setprice(data.price);
                      setMRP(data.mrp);
                      setquantity(1);
                      setDeliveryAmount(0);
                      setsubsType("");
                      settax(data.tax);
                      const amount = parseFloat(
                        (data.price * data.tax) / 100 + data.price
                      ).toFixed(2);
                      setorderAmount(amount);
                      setOriginalOrderAmount(amount);
                    }}
                    getOptionLabel={(option) =>
                      `${option?.title} (${option?.qty_text})` || ""
                    }
                    getOptionDisabled={(option) => option.stock_qty <= 0}
                    renderOption={(props, option) => (
                      <li
                        {...props}
                        style={{
                          pointerEvents: option.stock_qty > 0 ? "auto" : "none",
                          color: option.stock_qty > 0 ? "inherit" : "grey",
                          opacity: option.stock_qty > 0 ? 1 : 0.6,
                        }}
                      >
                        {`${option.title} (${option.qty_text})`}
                        {option.stock_qty <= 0 && " - Sold Out"}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product"
                        size="small"
                        sx={{ fontSize: "12px" }}
                        fullWidth
                        required
                        color="secondary"
                      />
                    )}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Box>
                      <Autocomplete
                        fullWidth
                        multiple
                        options={filteredProducts || []}
                        getOptionLabel={(option) =>
                          `${option?.title} (${option?.qty_text})` || ""
                        }
                        getOptionDisabled={(option) => option.stock_qty <= 0}
                        onChange={(event, newValue) => {
                          setSelectedProducts((prevSelected) => {
                            const updatedSelection = newValue.map((item) => {
                              const existingProduct = prevSelected.find(
                                (p) => p.product_id === item.id
                              );
                              const quantity = existingProduct
                                ? existingProduct.qty
                                : 1;
                              const priceWithTax =
                                item.price * (1 + item.tax / 100);
                              const total_price = priceWithTax * quantity;
                              return {
                                product_id: item.id,
                                product_title: item.title,
                                qty: existingProduct ? existingProduct.qty : 1,
                                tax: item.tax,
                                mrp: item.mrp,
                                price: item.price,
                                total_price: existingProduct
                                  ? existingProduct.total_price
                                  : total_price,
                              };
                            });
                            const totalQuantity = updatedSelection.reduce(
                              (sum, product) => sum + product.qty,
                              0
                            );
                            const totalPrice = updatedSelection.reduce(
                              (sum, product) => sum + product.total_price,
                              0
                            );
                            const calculatedDeliveryAmount =
                              freeDeliveryMax > 0 &&
                              totalPrice > 0 &&
                              totalPrice > freeDeliveryMax
                                ? 0
                                : oneTimeDeliveryCharge;
                            setprice(parseFloat(totalPrice).toFixed(2));
                            setMRP(parseFloat(totalPrice).toFixed(2));
                            const amount = parseFloat(
                              totalPrice + calculatedDeliveryAmount
                            ).toFixed(2);
                            setorderAmount(amount);
                            setOriginalOrderAmount(amount);
                            setDeliveryAmount(calculatedDeliveryAmount);
                            setquantity(parseInt(totalQuantity));
                            return updatedSelection;
                          });
                        }}
                        renderOption={(props, option) => (
                          <li
                            {...props}
                            style={{
                              pointerEvents:
                                option.stock_qty > 0 ? "auto" : "none",
                              color: option.stock_qty > 0 ? "inherit" : "grey",
                              opacity: option.stock_qty > 0 ? 1 : 0.6,
                            }}
                          >
                            {`${option.title} (${option.qty_text})`}
                            {option.stock_qty <= 0 && " - Sold Out"}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Product"
                            required={!selectedProducts?.length}
                            size="small"
                            sx={{ fontSize: "12px" }}
                            color="secondary"
                          />
                        )}
                        renderTags={(selected) =>
                          selected.length > 0
                            ? `${selected
                                .map(
                                  (item) => `${item.title.substring(0, 20)}...`
                                )
                                .join(", ")}`
                            : ""
                        }
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "1rem",
                        width: "100%",
                      }}
                    >
                      {selectedProducts.map((product) => (
                        <Box
                          key={product.product_id}
                          display="flex"
                          alignItems="center"
                          gap="0.5rem"
                          borderRadius="20px"
                          paddingRight="10px"
                        >
                          <Chip
                            className="chipLabel"
                            label={
                              product.product_title.length > 30
                                ? `${product.product_title.substring(0, 30)}...`
                                : product.product_title
                            }
                          />
                          <TextField
                            className="qtyLabel"
                            required
                            label="Qty"
                            type="number"
                            variant="outlined"
                            value={product.qty}
                            onChange={(e) =>
                              handleQuantityChange(product, e.target.value)
                            }
                            inputProps={{ min: 1, max: 20, maxLength: 3 }}
                            sx={{ flex: 1, width: 55 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </>
              )}
              <Grid item xs={4}>
                <TextField
                  disabled
                  required
                  fullWidth
                  id="MRP"
                  label="MRP"
                  name="MRP"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={MRP}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  disabled
                  fullWidth
                  id="Price"
                  label="Price"
                  name="Price"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={price}
                />
              </Grid>
              {orderType === 0 && (
                <Grid item xs={4}>
                  <TextField
                    required
                    disabled
                    fullWidth
                    id="Tax"
                    label="Tax"
                    name="Tax"
                    type="number"
                    color="secondary"
                    autoComplete="number"
                    size="small"
                    InputProps={{ inputProps: { min: 0 } }}
                    value={tax}
                  />
                </Grid>
              )}
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  id="Order Amount"
                  label="Order Total Amount"
                  name="Order Amount"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  color="secondary"
                  size="small"
                  disabled
                  value={orderAmount}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  disabled={orderType === 1 || subsType === 2}
                  required
                  fullWidth
                  id="Quantity"
                  label="Quantity"
                  name="Quantity"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 1, max: 20 } }}
                  value={quantity}
                  onChange={(e) => {
                    setquantity(
                      e.target.value === "" ? "" : Math.floor(e.target.value)
                    );
                    updateDeliveryQtyCharge(
                      e.target.value === "" ? "" : Math.floor(e.target.value)
                    );
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  disabled={orderType === 1}
                  required
                  fullWidth
                  id="Start From"
                  label="Start From"
                  name="Start From"
                  autoComplete="number"
                  type="date"
                  color="secondary"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { min: today },
                  }}
                  value={date || ""}
                  onChange={(e) => {
                    setdate(e.target.value);
                    setStartDayCode(new Date(e.target.value).getDay());
                  }}
                />
              </Grid>
              {orderType === 0 && (
                <Grid item xs={4}>
                  <FormControl fullWidth disabled={!productId}>
                    <InputLabel
                      id="demo-simple-select-label"
                      color="secondary"
                      size="small"
                      required
                    >
                      Subscription Type
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Subscription Type"
                      size="small"
                      fullWidth
                      required
                      color="secondary"
                      value={subsType}
                      onChange={handleChangeSubscription}
                    >
                      <MenuItem value={1}>
                        {CONSTANTS.ORDER_TYPES.ONE_TIME_ORDER}
                      </MenuItem>
                      <MenuItem value={2}>
                        {CONSTANTS.ORDER_TYPES.WEEKLY}
                      </MenuItem>
                      <MenuItem value={3}>
                        {CONSTANTS.ORDER_TYPES.MONTHLY}
                      </MenuItem>
                      <MenuItem value={4}>
                        {CONSTANTS.ORDER_TYPES.ALTERNATIVE_DAYS}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  id="Delivery Charge"
                  label="Delivery Charge"
                  name="Delivery Charge"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  color="secondary"
                  size="small"
                  disabled
                  value={deliveryAmount}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel
                    id="address-select"
                    color="secondary"
                    size="small"
                    required
                  >
                    Address
                  </InputLabel>
                  <Select
                    disabled={!userId || isAddressLoading}
                    labelId="address-select"
                    id="demo-simple-select"
                    label="Address"
                    size="small"
                    fullWidth
                    required
                    color="secondary"
                    onChange={(e) => {
                      if (e.target.value === 0) {
                        setaddressID();
                        setaddnew(true);
                      } else {
                        setaddnew(false);
                        setaddressID(e.target.value);
                      }
                    }}
                  >
                    <MenuItem value={0}>Add New Address</MenuItem>
                    <br />
                    {address?.map((ad) => (
                      <MenuItem value={ad.id}>
                        {getFormattedAddress(ad)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel
                    id="demo-simple-select-label"
                    color="secondary"
                    size="small"
                    required
                  >
                    Status
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Status"
                    size="small"
                    fullWidth
                    required
                    color="secondary"
                    onChange={(e) => {
                      setstatus(e.target.value);
                    }}
                  >
                    <MenuItem value={1}>Confirmed</MenuItem>
                    <MenuItem value={0}>Pending</MenuItem>
                    {/* <MenuItem value={2}>Canceled</MenuItem> */}
                  </Select>
                </FormControl>
              </Grid>
              {/* {orderType === 0 && (
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography fontWeight={"600"} fontSize={"16x"}>
                      Order Status *
                    </Typography>
                    <Box
                      display={"flex"}
                      alignItems="center"
                      justifyContent="space-evenly"
                    >
                      <Typography fontSize={"16px"} fontWeight={"600"}>
                        Pause
                      </Typography>
                      <div class="toggle-switch">
                        <input
                          class="toggle-input"
                          id="toggle1"
                          type="checkbox"
                          checked={order_status === 0}
                          onChange={() => {
                            setorder_status(order_status === 1 ? 0 : 1);
                          }}
                        />
                        <label class="toggle-label-2" for="toggle1"></label>
                      </div>
                      <Typography fontSize={"16px"} fontWeight={"600"}>
                        Active
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}*/}
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel
                    id="demo-simple-select-label"
                    color="secondary"
                    size="small"
                    required
                  >
                    Order Type
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Order Type"
                    size="small"
                    fullWidth
                    required
                    color="secondary"
                    onChange={(e) => {
                      settype(e.target.value);
                    }}
                  >
                    <MenuItem value={1}>Wallet Payment</MenuItem>
                    {/* <MenuItem value={4}>Pay Later</MenuItem> */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="Delivery Instruction"
                  label="Delivery Instruction"
                  name="Delivery Instruction"
                  type="text"
                  color="secondary"
                  size="small"
                  value={deliveryInstruction}
                  onChange={(e) => setDeliveryInstruction(e.target.value)}
                />
              </Grid>
              {subsType === 2 && (
                <Grid item xs={12}>
                  <>
                    <Box width={"fit-content"} mb={2}>
                      <Typography mb={2}>Select Delivery Days *</Typography>
                      <Stack direction="row" spacing={2} gap="1rem">
                        <div
                          className={M === 1 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setM(M ? null : 1);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          M
                        </div>
                        <div
                          className={T === 2 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setT(T ? null : 2);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          T
                        </div>
                        <div
                          className={W === 3 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setW(W ? null : 3);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          W
                        </div>
                        <div
                          className={TH === 4 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setTH(TH ? null : 4);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          TH
                        </div>
                        <div
                          className={F === 5 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setF(F ? null : 5);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          F
                        </div>
                        <div
                          className={S === 6 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setS(S ? null : 6);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          S
                        </div>
                        <div
                          className={SU === 0 ? "dayBTn active" : "dayBTn"}
                          onClick={() => {
                            setSU(SU === 1 ? 0 : 1);
                            setorderAmount(0);
                            setOriginalOrderAmount(0);
                            setquantity(0);
                            setDeliveryAmount(0);
                            setCalcAmt(false);
                          }}
                        >
                          SU
                        </div>
                      </Stack>
                      <Typography mt={2}>Set Per Day Quality *</Typography>

                      <Stack direction="column" spacing={2} mt={2} gap="1rem">
                        {selected_days.map(
                          (s) =>
                            s.d === s.id && (
                              <div className="dayQty" key={s.id}>
                                <p style={{ fontWeight: "600" }}>{s.name}</p>
                                <div className="qty">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    aria-label="remove quantity"
                                    sx={{
                                      border: "1px solid #000",
                                      padding: "2px",
                                    }}
                                    onClick={() => {
                                      s.remove();
                                      setorderAmount(0);
                                      setOriginalOrderAmount(0);
                                      setquantity(0);
                                      setDeliveryAmount(0);
                                      setCalcAmt(false);
                                    }}
                                  >
                                    <RemoveIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                  <b
                                    style={{
                                      width: "20px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <p>{s.qt}</p>
                                  </b>
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    aria-label="add quantity"
                                    sx={{
                                      border: "1px solid #4cceac",
                                      padding: "3px",
                                    }}
                                    onClick={() => {
                                      if (s.qt < 20) {
                                        // Check if the quantity is less than 20
                                        s.add();
                                        setorderAmount(0);
                                        setOriginalOrderAmount(0);
                                        setquantity(0);
                                        setDeliveryAmount(0);
                                        setCalcAmt(false);
                                      }
                                    }}
                                    disabled={s.qt >= 20} // Disable button if quantity reaches 20
                                  >
                                    <AddIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </div>
                              </div>
                            )
                        )}
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={calculateWeeklyAmount}
                      startIcon={<CalculateIcon />}
                    >
                      Calculate
                    </Button>
                  </>
                </Grid>
              )}
            </Grid>
          </div>
        </div>

        {addnew && (
          <div className="product">
            {/* <div className={`left text-card-foreground shadow-sm rounded-lg p-4 xl:p-2 ${theme.palette.mode === 'dark' ? "bg-darkcard" : "bg-card"
            }`}>
             */}
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
                maxWidth: "100%",
              }}
            >
              <Typography
                className="mb1"
                variant="h3"
                component={"h3"}
                fontWeight={600}
                // fontSize={'1rem'}
                lineHeight={"2rem"}
                sx={{
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                Add New Address
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Name "
                    label="Name "
                    name="Name "
                    type="text"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setname(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Phone Number"
                    label="Phone Number"
                    name="Phone Number"
                    color="secondary"
                    size="small"
                    type="tel" // sets the field to accept phone number-like input
                    onChange={(e) => {
                      // Allow only numbers and limit to 10 characters
                      const numericValue = e.target.value.replace(/\D/g, ""); // remove non-numeric characters
                      setnumber(numericValue.slice(0, 10)); // limit to 10 characters
                    }}
                    inputProps={{
                      maxLength: 10, // limit the input length
                      inputMode: "numeric", // ensures numeric keyboard on mobile
                      pattern: "[0-9]*", // restrict to numbers only
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Flat "
                    label="Flat "
                    name="Flat "
                    type="text"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setflat(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Apartment_name"
                    label="Apartment name"
                    name="Apartment_name"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setapartment(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Area"
                    label="Area"
                    name="Area"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setarea(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Landmark "
                    label="Landmark "
                    name="Landmark "
                    type="text"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setlandmark(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="City"
                    label="City"
                    name="City"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setcity(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required={addnew}
                    fullWidth
                    id="Pincode"
                    label="Pincode"
                    name="Pincode"
                    color="secondary"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxlength: "8",
                    }}
                    size="small"
                    onChange={(e) => {
                      setpincode(e.target.value);
                    }}
                  />
                </Grid>
              </Grid>
            </div>
          </div>
        )}

        {/* Coupon Code Section */}
        {coupons && coupons.length > 0 && userId && originalOrderAmount > 0 && (
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
                maxWidth: "100%",
              }}
            >
              <Typography
                className="mb1"
                variant="h3"
                component={"h3"}
                fontWeight={600}
                lineHeight={"2rem"}
                sx={{
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                Select Coupon Code
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Autocomplete
                    id="coupon-autocomplete"
                    options={
                      Array.isArray(filteredCoupons) ? filteredCoupons : []
                    }
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option?.code || ""
                    }
                    value={
                      typeof selectedCoupon === "string" || !selectedCoupon
                        ? null
                        : selectedCoupon
                    }
                    fullWidth
                    freeSolo
                    renderOption={(props, option) => {
                      if (!option || typeof option !== "object") return null;
                      return (
                        <li {...props}>
                          <Box display="flex" flexDirection="column">
                            <span style={{ fontWeight: 600, fontSize: 18 }}>
                              {option.code}
                            </span>
                            <span style={{ fontSize: 16, color: "#888" }}>
                              {option.description}
                            </span>
                            <span style={{ fontSize: 16, color: "#666" }}>
                              {option.type === 1
                                ? `₹${option.value} off`
                                : `${option.value}% off`}{" "}
                              | Min Cart: ₹{option.min_cart_value}
                            </span>
                            <span
                              style={{
                                fontSize: 15,
                                color: option.is_active ? "green" : "red",
                              }}
                            >
                              {option.is_active ? "Active" : "Inactive"} |
                              Expires:{" "}
                              {option.expires_at
                                ? option.expires_at.split("T")[0]
                                : "N/A"}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                color:
                                  Number(originalOrderAmount) >=
                                  Number(option.min_cart_value)
                                    ? "#4CAF50"
                                    : "#FF9800",
                                fontStyle: "italic",
                              }}
                            >
                              {Number(originalOrderAmount) >=
                              Number(option.min_cart_value)
                                ? `✓ Coupon can be applied!`
                                : `Your cart value is ₹${Number(
                                    originalOrderAmount
                                  ).toFixed(2)}. Add ₹${Math.max(
                                    0,
                                    Number(option.min_cart_value) -
                                      Number(originalOrderAmount)
                                  ).toFixed(2)} more to unlock this coupon.`}
                            </span>
                          </Box>
                        </li>
                      );
                    }}
                    onChange={handleCouponChange}
                    onInputChange={(event, newInputValue, reason) => {
                      handleCouponInputChange(newInputValue, reason);
                    }}
                    inputValue={couponCode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Coupon Code"
                        placeholder="Enter or select coupon code"
                        size="small"
                        fullWidth
                        color="secondary"
                        error={!!couponError}
                        onKeyDown={handleCouponKeyDown}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {couponValidating ? (
                                <CircularProgress size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  {couponValidating ? (
                    <Typography color="info.main" sx={{ fontSize: 14, ml: 1 }}>
                      Validating coupon...
                    </Typography>
                  ) : couponError ? (
                    <Typography color="error" sx={{ fontSize: 14, ml: 1 }}>
                      {couponError}
                    </Typography>
                  ) : appliedCoupon ? (
                    <Typography
                      color="success.main"
                      sx={{ fontSize: 14, ml: 1 }}
                    >
                      {appliedCoupon.type === 2 ? (
                        <>
                          Coupon "{appliedCoupon.code}" applied:{" "}
                          {appliedCoupon.value}% off (₹
                          {(
                            (appliedCoupon.value / 100) *
                            originalOrderAmount
                          ).toFixed(2)}
                          )!
                        </>
                      ) : (
                        <>
                          Coupon "{appliedCoupon.code}" applied: ₹
                          {appliedCoupon.value} off!
                        </>
                      )}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>
            </div>
          </div>
        )}

        <div className="delete" style={{ marginBottom: "1rem" }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="secondary"
            disabled={subsType === 2 && !calcAmt}
            sx={{ fontWeight: "600", letterSpacing: "1px" }}
          >
            {LOADING ? <CircularProgress size={20} /> : "Add New Order"}
          </Button>
        </div>
      </Box>
    </>
  );
}

export default NewOrder;
