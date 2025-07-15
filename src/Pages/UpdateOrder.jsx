/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Modal,
  DialogTitle,
  DialogContentText,
  Tooltip,
  // DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import TextField from "@mui/material/TextField";
import api from "./../Data/api";
import { ADD, DELETE, GET, UPDATE } from "../Functions/apiFunction";
import { tokens } from "../theme";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import RefundDialog from "../Components/RefundDialog";
import CartOrderProductModal from "../Components/CartOrderProductModal";
import * as CONSTANTS from "../Common/Constants";
import OrderDaysCalendarView from "../Components/OrderDaysCalendarView";
import PauseCalendar from "../Components/OrderPauseCalender";
import { CalendarMonth } from "@mui/icons-material";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import dayjs from "dayjs";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90vw", sm: 500, md: 500, lg: 500, xl: 500 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 2,
  overflow: "scroll",
};

function UpdateOrder() {
  const products = useSelector((state) => {
    return state.Products[state.Products.length - 1];
  });
  const users = useSelector((state) => {
    return state.Users[state.Users.length - 1];
  });

  const appSetting = useSelector((state) => {
    return state.AppSettings[state.AppSettings.length - 1];
  });

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const param = useParams();
  const [searchParams] = useSearchParams();
  const subscription_type = searchParams.get("subscription_type");

  // delivery details
  const [delivery, setdelivery] = useState();
  const [orderAssign, setorderAssign] = useState();
  const [selcetedDaysForWeekly, setselectedDaysForWeekly] = useState();
  const [deliveryNote, setDeliveryNote] = useState("");

  //
  const [transactionHistory, settransactionHistory] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [pageSize2, setpageSize2] = useState(20);
  const [pageSize3, setpageSize3] = useState(20);
  const [userId, setuserId] = useState();
  const [productId, setproductId] = useState();
  const [orderAmount, setorderAmount] = useState(0);
  const [date, setdate] = useState();
  const [addressID, setaddressID] = useState();
  const [quantity, setquantity] = useState();
  const [subsType, setsubsType] = useState();
  const [status, setstatus] = useState();
  const [mrp, setMrp] = useState(0);
  const [price, setPrice] = useState(0);
  const [tax, setTax] = useState(0);
  const [order_status, setorder_status] = useState();
  const [order_number, setorder_number] = useState();
  const [dlvStatus, setdlvStatus] = useState();
  const [selectedCartItems, setSelectedCartItems] = useState();
  const [openProductModal, setIsOpenProductModal] = useState(false);
  const [deliveryInstruction, setDeliveryInstruction] = useState("");

  // const [orderInitialStatus, setOrderInitialStatus] = useState();

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

  const [reFetch, setreFetch] = useState(false);
  const [isUpdating, setisUpdating] = useState(false);
  const [assignID, setassignID] = useState();
  const [delivryBoyz, setdelivryBoyz] = useState();
  const [selectedBoy, setselectedBoy] = useState();

  const [loading, setloading] = useState(false);
  const [DailogOpen, setDailogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [addDelvryModal, setaddDelvryModal] = useState(false);
  const [hasDeliveryPartner, setHasDeliveryPartner] = useState(false);
  const [isDeliveryDialog, setDeliveryDialogModal] = useState(false);
  const [deliveryAvailablity, setDeliveryAvailablity] = useState();
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [pauseOrdersDates, setPauseOrdersDates] = useState();

  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isRefundLoading, setIsRefundLoading] = useState(false);
  const [isCartOrderPage, setCartOrderPage] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [orderCreatedDate, setCreatedDate] = useState();

  const [openPauseCalender, setOpenPauseCalender] = useState(false);
  const [orderData, setOrderData] = useState({});
  const [openCalendar, setOpenCalendar] = useState(false);
  const [orderDayModel, setOrderDayModel] = useState({});
  const [tempOrderStatus, setTempOrderStaus] = useState();
  const [openPauseOrderDialog, setOpenPauseDialog] = useState(false);

  const handleOpenCalendar = () => {
    setOpenCalendar(true);
  };

  const handleCloseCalendar = () => {
    setOpenCalendar(false);
  };

  const handleOpenPauseCalendar = () => {
    setOpenPauseCalender(true);
  };

  const handleClosePauseCalendar = () => {
    setOpenPauseCalender(false);
  };

  const handleDailogOpen = () => {
    setDailogOpen(true);
  };

  const handleDailogClose = () => {
    setDailogOpen(false);
  };
  const handleaddDekiveryDailogOpen = () => {
    setaddDelvryModal(true);
  };

  const handleaddDekiveryDailogClose = () => {
    setaddDelvryModal(false);
  };

  const handleDeliveryDialogClose = () => {
    setDeliveryDialogModal(false);
  };
  // add new order date
  const [addDlvryDate, setaddDlvryDate] = useState();

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

  const selectDays = () => {
    let arr = [];
    for (let index = 0; index < selected_days?.length; index++) {
      if (selected_days[index].d !== undefined) {
        arr.push({
          dayCode: selected_days[index].d,
          qty: selected_days[index].qt,
        });
      }
    }
    let string = "";

    for (let i = 0; i < arr?.length; i++) {
      const obj = arr[i];
      string += `{dayCode:${obj.dayCode}, qty:${obj.qty}},`;
    }
    string = `[${string.slice(0, -1)}]`;
    return {
      arr: arr,
      string: string,
    };
  };

  function handleModalClose() {
    setIsOpenProductModal(false);
  }

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  useEffect(() => {
    let subscriptionType = null;
    let weeklyDayList = [];
    let deliveryStatus = false;
    let startDate = "";
    let orderIntialStatus = false;
    let orderCreatedAt = "";
    const getOrder = async () => {
      const hasDelivery =
        appSetting &&
        appSetting?.find((setting) => setting.title == "HasDeliveryPartner")
          ?.value === "true";
      setHasDeliveryPartner(hasDelivery);
      var orderRes = "";
      try {
        setCartOrderPage(subscription_type === "false");
        if (subscription_type === "false") {
          const url = `${api}/get_cart_order/${param.id}`;
          orderRes = await GET(token, url);
          const getCartUrl = `${api}/get_cart_product/${param.id}`;
          const cartOrderProduct = await GET(token, getCartUrl);
          var productList = cartOrderProduct.data ?? [];
          setSelectedCartItems(productList);
        } else {
          const url = `${api}/get_order/${param.id}`;
          orderRes = await GET(token, url);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return;
      }
      const order = orderRes.data;
      setOrderDayModel({
        startDate: order?.start_date,
        pauseDates: order?.pause_dates,
        resumeDates: order?.resume_dates,
        weekDayCode: order?.selected_days_for_weekly,
        subscriptionType: order?.subscription_type,
        deliveryDateList: order?.deliveryDates,
      });
      const cleanedPauseDates =
        order?.pause_dates && order?.pause_dates.replace(/[[\]]/g, "");
      setPauseOrdersDates(cleanedPauseDates);
      setCreatedDate(order?.created_at);
      getAddress(order.user_id, order.address_id);
      setuserId(order.user_id);
      setname(order.name);
      setproductId(order.product_id);
      setorder_number(order.order_number);

      setquantity(order.qty);
      setdate(order.start_date);
      setsubsType(order.subscription_type);
      setaddressID(order.address_id);
      setstatus(order.status);
      setDeliveryInstruction(order.delivery_instruction);
      setorder_status(order.order_status);
      setDeliveryCharge(parseFloat(order.delivery_charge) || 0);
      setdlvStatus(order.delivery_status);
      setselectedDaysForWeekly(order.selected_days_for_weekly);
      subscriptionType = order.subscription_type;
      weeklyDayList = order.selected_days_for_weekly;
      deliveryStatus = order.delivery_status;
      startDate = order.start_date;
      orderIntialStatus = order.status;
      orderCreatedAt = order.created_at;
      setorderAmount(order.order_amount);
      setOrderData(order);
      // eslint-disable-next-line no-eval
      const selected_days = eval(order.selected_days_for_weekly);

      if (order.selected_days_for_weekly) {
        for (let index = 0; index < selected_days?.length; index++) {
          const element = selected_days[index];
          const val = element.dayCode;
          switch (val) {
            case 1:
              setM(element.dayCode);
              setM_QT(element.qty);
              break;
            case 2:
              setT(element.dayCode);
              setT_QT(element.qty);
              break;
            case 3:
              setW(element.dayCode);
              setW_QT(element.qty);
              break;
            case 4:
              setTH(element.dayCode);
              setTH_QT(element.qty);
              break;
            case 5:
              setF(element.dayCode);
              setF_QT(element.qty);
              break;
            case 6:
              setS(element.dayCode);
              setS_QT(element.qty);
              break;
            case 0:
              setSU(element.dayCode);
              setSU_QT(element.qty);
              break;
            default:
              return;
          }
        }
      }

      if (order.subscription_type === null) {
        const productDetails = JSON.parse(order.product_detail);

        // Calculate totals for mrp, price, and tax
        const totalMrp = productDetails.reduce((acc, item) => {
          const taxAmount =
            (parseFloat(item.tax) / 100) *
            parseFloat(item.mrp) *
            parseFloat(item.qty);
          return acc + parseFloat(item.mrp) * parseFloat(item.qty) + taxAmount;
        }, 0);

        const totalPrice = productDetails.reduce((acc, item) => {
          const taxAmount =
            (parseFloat(item.tax) / 100) *
            parseFloat(item.price) *
            parseFloat(item.qty);
          return (
            acc + parseFloat(item.price) * parseFloat(item.qty) + taxAmount
          );
        }, 0);
        const totalTax = productDetails.reduce((acc, item) => {
          return (
            acc + (parseFloat(item.tax) / 100) * parseFloat(item.total_price)
          );
        }, 0);

        // Set state with the calculated totals
        setPrice(totalPrice);
        setMrp(totalMrp);
        // setTax(totalTax);
        const url = `${api}/txn/order/${order.id}`;
        getTrans(url);
      } else {
        setPrice(order.price);
        setMrp(order.mrp);
        setTax(order.tax);
        const url = `${api}/txn/sub_order/${order.id}`;
        getTrans(url);
      }
      getDelevery();
    };

    const getDelevery = async () => {
      const url = `${api}/get_sub_order_delivery/order/${param.id}`;
      const dvlries = await GET(token, url);
      const dlvry = dvlries.data;
      setdelivery(dlvry);
      checkAvailability(
        dlvry,
        subscriptionType,
        weeklyDayList,
        deliveryStatus,
        startDate,
        orderIntialStatus,
        orderCreatedAt
      );
    };

    getOrder();
  }, [param.id, token, reFetch]);

  useEffect(() => {
    // const assign = async () => {
    //   const url = `${api}/get_assign_user_order/order/${param.id}`;
    //   const ordrAssign = await GET(token, url);
    //   setorderAssign(ordrAssign?.data);
    // };
    const delivryBoyz = async () => {
      const url = `${api}/get_executive_details`;
      const boys = await GET(token, url);
      setdelivryBoyz(boys?.data);
    };
    // assign();
    delivryBoyz();
  }, [reFetch]);

  // const getTransc
  const getTrans = async (url) => {
    const transc = await GET(token, url);
    settransactionHistory(transc?.data);
  };

  const checkDeliveryAvailablity = (
    deliveryData,
    subscriptionType,
    weeklyDayList,
    deliveryStatus,
    startDate,
    orderInitialStatus,
    orderCreatedAt
  ) => {
    if (
      !hasDeliveryPartner &&
      orderInitialStatus === 1 &&
      deliveryStatus !== 1
    ) {
      //One day order
      const checkAlreadyDelivered = isAlreadyDelivered(deliveryData);
      if (subscriptionType === null && !checkAlreadyDelivered && !startDate) {
        // const today = moment();
        // const givenDate = moment(orderCreatedAt, "DD-MM-YYYY").add(1, "days");
        // if (today.isSame(givenDate, "day")) {
        //   return true;
        // }
        return true;
      }
      // One time order
      if (
        subscriptionType === 1 &&
        deliveryStatus !== 1 &&
        !checkAlreadyDelivered
      ) {
        const today = moment();
        const givenDate = moment(startDate, "DD-MM-YYYY");
        if (today.isSame(givenDate, "day")) {
          return true;
        }
        return false;
      }
      // Weekly
      if (subscriptionType === 2 && !checkAlreadyDelivered) {
        const validJSONString = weeklyDayList.replace(
          /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
          '"$2": '
        );
        const daysWithCode = JSON.parse(validJSONString);
        const todayDayCode = moment().day() === 0 ? 7 : moment().day();

        const todayData = daysWithCode.find(
          (day) => day.dayCode === todayDayCode
        );
        if (todayData) {
          const today = moment();
          const givenDate = moment(startDate, "DD-MM-YYYY");
          if (today.isSameOrAfter(givenDate, "day")) {
            return true;
          }
        }
        return false;
      }
      // Monthly
      if (subscriptionType === 3 && !checkAlreadyDelivered) {
        const today = moment();
        const givenDate = moment(startDate, "DD-MM-YYYY");
        if (today.isSameOrAfter(givenDate, "day")) {
          return true;
        }
        return false;
      }
      //Alternate days
      if (subscriptionType === 4 && !checkAlreadyDelivered) {
        const today = moment();
        const givenDate = moment(startDate, "DD-MM-YYYY");
        const dayDifference = today.diff(givenDate, "days");
        if (dayDifference % 2 === 0 && today.isSameOrAfter(givenDate, "day")) {
          return true;
        }
        return false;
      }
    }
  };

  const checkAvailability = (
    deliveryData,
    subscriptionType,
    weeklyDayList,
    deliveryStatus,
    startDate,
    orderInitialStatus,
    orderCreatedAt
  ) => {
    const available = checkDeliveryAvailablity(
      deliveryData,
      subscriptionType,
      weeklyDayList,
      deliveryStatus,
      startDate,
      orderInitialStatus,
      orderCreatedAt
    );
    if (available !== deliveryAvailablity) {
      setDeliveryAvailablity(available);
    }
  };

  const isAlreadyDelivered = (deliveredData) => {
    const today = moment().format("DD-MM-YYYY");
    const filterData =
      Array.isArray(deliveredData) &&
      deliveredData.length > 0 &&
      deliveredData.filter(
        (del) =>
          `${del.order_id}` === param.id &&
          moment(del.created_at).isSame(today, "day")
      );

    return filterData.length > 0;
  };

  const updateOrderActiveStatus = async (formattedPauseDates) => {
    try {
      setLOADING(true);

      const data = {
        id: param.id,
        pause_date: formattedPauseDates,
      };

      const url = `${api}/update_order`;
      const update = await UPDATE(token, url, data);

      if (update.response === 200) {
        const udateOrderData = update.data;
        if (udateOrderData) {
          setOrderData((prevOrderData) => ({
            ...prevOrderData,
            pause_dates: udateOrderData.pause_dates || prevOrderData.pauseDates,
          }));

          setOrderDayModel((prevOrderDayModel) => ({
            ...prevOrderDayModel,
            pauseDates:
              udateOrderData.pause_dates || prevOrderDayModel.pauseDates,
          }));
        }
        handleSnakBarOpen();
        handleClosePauseCalendar();
        setalertType("success");
        setalertMsg("order Pause dates updated sucessfully");
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Failed to update order");
      }
    } catch (error) {
      setLOADING(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("An error occurred while updating the order");
      console.error("Error updating order:", error);
    } finally {
      setLOADING(false);
    }
  };

  // add order
  const updateSubs = async (e) => {
    e.preventDefault();
    if (subsType === 2 && !selectDays().arr?.length) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Please Select Delivery Days  and Per Day Quality");
      return;
    }
    setLOADING(true);

    if (addnew) {
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

      let url = `${api}/add_address`;
      const address = await ADD(token, url, addresData);
      if (address.response === 200) {
        const data = {
          id: param.id,
          order_amount: orderAmount.toFixed(2),
          start_date: date,
          qty: quantity,
          address_id: address.id,
          status: status,
          order_status: order_status,
          pause_date: pauseOrdersDates,
        };
        if (!hasDeliveryPartner && status === 3) {
          data.status = 1;
        }
        const url = `${api}/update_order`;

        const add = await UPDATE(token, url, data);
        setLOADING(false);
        if (add.response === 200) {
          handleSnakBarOpen();
          setalertType("success");
          setalertMsg("Order Updated");
          setreFetch(!reFetch);
          setaddnew(false);
          subsType
            ? navigate("/subscription-orders")
            : navigate("/buyonce-orders");
        } else if (add.response === 201) {
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg(add.message);
        } else {
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg("Something went Wrong! Please Try Againn");
        }
      } else if (address.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(address.message);
        setLOADING(false);
        return;
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
        setLOADING(false);
        return;
      }
    } else {
      const data = {
        id: param.id,
        order_amount: orderAmount.toFixed(2),
        start_date: date,
        qty: quantity,
        address_id: addressID,
        status: status,
        order_status: order_status,
        pause_date: pauseOrdersDates,
      };
      if (!hasDeliveryPartner && status === 3) {
        data.status = 1;
      }
      const url = `${api}/update_order`;

      const add = await UPDATE(token, url, data);
      setLOADING(false);
      if (add.response === 200) {
        // updateSubscriptionOrderDelivery();
        handleSnakBarOpen();
        setalertType("success");
        setalertMsg("Order Updated");
        setreFetch(!reFetch);
        subsType
          ? navigate("/subscription-orders")
          : navigate("/buyonce-orders");
      } else if (add.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(add.message);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Againn");
      }
    }
  };

  const updateNormal = async (e) => {
    e.preventDefault();
    if (subsType === 2 && !selectDays().arr?.length) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Please Select Delivery Days  and Per Day Quality");
      return;
    }
    setLOADING(true);

    if (addnew) {
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

      let url = `${api}/add_address`;
      const address = await ADD(token, url, addresData);
      if (address.response === 200) {
        const data = {
          id: param.id,
          qty: quantity,
          order_amount: orderAmount.toFixed(2),
          address_id: address.id,
          status: status,
          pause_date: pauseOrdersDates,
        };
        if (!hasDeliveryPartner && status === 3) {
          data.status = 1;
        }
        const url = `${api}/update_order`;

        const add = await UPDATE(token, url, data);
        setLOADING(false);
        if (add.response === 200) {
          // updateNormalOrderDelivery();
          handleSnakBarOpen();
          setalertType("success");
          setalertMsg("Order Updated");
          setreFetch(!reFetch);
          setaddnew(false);
          subsType
            ? navigate("/subscription-orders")
            : navigate("/buyonce-orders");
        } else if (add.response === 201) {
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg(add.message);
        } else {
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg("Something went Wrong! Please Try Againn");
        }
      } else if (address.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(address.message);
        setLOADING(false);
        return;
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
        setLOADING(false);
        return;
      }
    } else {
      const data = {
        id: param.id,
        qty: quantity,
        order_amount: orderAmount.toFixed(2),
        address_id: addressID,
        status: status,
        pause_date: pauseOrdersDates,
      };
      if (!hasDeliveryPartner && status === 3) {
        data.status = 1;
      }
      const url = `${api}/update_order`;

      const add = await UPDATE(token, url, data);
      setLOADING(false);
      if (add.response === 200) {
        // updateNormalOrderDelivery();
        handleSnakBarOpen();
        setalertType("success");
        setalertMsg("Order Updated");
        setreFetch(!reFetch);
        subsType
          ? navigate("/subscription-orders")
          : navigate("/buyonce-orders");
      } else if (add.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(add.message);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Againn");
      }
    }
  };

  // get address
  const getAddress = async (userID) => {
    const url = `${api}/address/user/${userID}?include_deleted=true`;
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
  };

  const handleDeliveryNoteChange = (event) => {
    setDeliveryNote(event.target.value);
  };

  // ass assign
  const addAssign = async () => {
    const url = `${api}/add_order_assign`;
    const data = {
      user_id: selectedBoy,
      order_id: param.id,
    };
    setisUpdating(true);
    const assignAdd = await ADD(token, url, data);
    if (assignAdd.response === 200) {
      setisUpdating(false);
      handleClose();
      handleSnakBarOpen();
      setreFetch(!reFetch);
      setalertType("success");
      setalertMsg("Order assign successfully");
    } else if (assignAdd.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(assignAdd.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  // Delete Assign
  const DeleteAssign = async () => {
    const url = `${api}/order_assign/delete`;
    const data = {
      id: assignID,
    };
    setloading(true);
    const dltProdct = await DELETE(token, url, data);
    setloading(false);
    if (dltProdct.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("Successfully Deleted");
      handleDailogClose();
      setreFetch(!reFetch);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
      handleDailogClose();
    }
  };

  // ass assign
  const addDelivery = async () => {
    const url = `${api}/add_sub_order_delivery/add_manually`;
    const data = {
      entry_user_id: selectedBoy,
      order_id: param.id,
      date: addDlvryDate,
    };
    setisUpdating(true);
    const assignAdd = await ADD(token, url, data);
    if (assignAdd.response === 200) {
      setisUpdating(false);
      handleaddDekiveryDailogClose();
      handleSnakBarOpen();
      setreFetch(!reFetch);
      setalertType("success");
      setalertMsg("Delivery Added successfully");
    } else if (assignAdd.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(assignAdd.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  // addd weekly dlvry
  const addWeeklyDelivery = async () => {
    const url = `${api}/add_sub_order_delivery_weekly/add_manually`;
    const data = {
      entry_user_id: selectedBoy,
      order_id: param.id,
      date: addDlvryDate,
      qty: getQty(addDlvryDate).qty,
    };
    setisUpdating(true);
    const assignAdd = await ADD(token, url, data);
    if (assignAdd.response === 200) {
      setisUpdating(false);
      handleaddDekiveryDailogClose();
      handleSnakBarOpen();
      setreFetch(!reFetch);
      setalertType("success");
      setalertMsg("Delivery Added successfully");
    } else if (assignAdd.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(assignAdd.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  // tables
  const column = useMemo(
    () => [
      {
        field: "executive_id",
        headerName: "Delivery Executive ID",
        width: 170,
      },
      { field: "name", headerName: "Name", width: 200 },

      { field: "phone", headerName: "Phone Number", width: 150 },
      { field: "email", headerName: "Email", width: 180 },
      {
        field: "date",
        headerName: "Delivery Date",
        width: 180,
        renderCell: (params) =>
          moment.utc(params.row.date).local().format("DD-MM-YYYY"),
      },
      {
        field: "created_at",
        headerName: "Time Stamps",
        width: 180,
        renderCell: (params) =>
          moment
            .utc(params.row.created_at)
            .local()
            .format("DD-MM-YYYY HH:mm:ss"),
      },

      {
        field: "payment_mode",
        headerName: "Payment Mode",
        width: 100,
        renderCell: (params) => (
          <p>
            {params.row.payment_mode === null
              ? "N/A"
              : params.row.payment_mode === 1
              ? "Online"
              : params.row.payment_mode === 2
              ? "Offline"
              : "N/A"}
          </p>
        ),
      },
      {
        field: "delivery_notes",
        headerName: "Delivery Notes",
        width: 180,
        renderCell: (params) => (
          <Tooltip
            title={
              <span
                dangerouslySetInnerHTML={{
                  __html: params?.row?.delivery_notes
                    ? params?.row?.delivery_notes?.replace(/\n/g, "<br />")
                    : "--",
                }}
              />
            }
            arrow
          >
            <div
              className="deliveryNotesLineBreak"
              dangerouslySetInnerHTML={{
                __html: params?.row?.delivery_notes
                  ? params?.row?.delivery_notes?.replace(/\n/g, "<br />")
                  : "--",
              }}
            />
          </Tooltip>
        ),
      },
    ],
    []
  );
  const assignColumn = useMemo(
    () => [
      { field: "user_id", headerName: "Id", width: 200 },
      { field: "name", headerName: "Name", width: 200 },
      { field: "phone", headerName: "Phone Number", width: 150 },
      { field: "email", headerName: "Email", width: 180 },
      { field: "created_at", headerName: "Date & Time", width: 180 },
      {
        field: "Action",
        headerName: "Action",
        width: 100,
        renderCell: (params) => (
          <button
            class="dltBtn"
            onClick={(e) => {
              e.preventDefault();
              setassignID(params.row.id);
              handleDailogOpen();
            }}
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        ),
      },
    ],
    []
  );
  const transactionColumn = useMemo(
    () => [
      {
        field: "payment_id",
        headerName: "Payment Id",
        width: 200,
        renderCell: (params) => (
          <p>
            {params.row.payment_id === null ? "N/A" : params.row.payment_id}
          </p>
        ),
      },
      {
        field: "type",
        headerName: "Payment Type",
        width: 100,
        renderCell: (params) => (
          <p>
            {params.row.type === 1
              ? "Credit"
              : params.row.type === 2
              ? "Debit"
              : params.row.type === 3
              ? "Refund"
              : ""}
          </p>
        ),
      },
      {
        field: "payment_mode",
        headerName: "Payment Mode",
        width: 100,
        renderCell: (params) => (
          <p>
            {params.row.payment_mode === 1
              ? "Online"
              : params.row.payment_mode === 2
              ? "Cash"
              : ""}
          </p>
        ),
      },
      { field: "amount", headerName: "Amount", width: 120 },

      {
        field: "created_at",
        headerName: "Date & Time",
        width: 180,
        renderCell: (params) =>
          moment
            .utc(params.row.created_at)
            .local()
            .format("DD-MM-YYYY HH:mm:ss"),
      },
    ],
    []
  );

  function getDayName(dateString) {
    const date = new Date(dateString);
    const options = { weekday: "long" };
    const day = date.toLocaleDateString(undefined, options);
    switch (day) {
      case "Sunday":
        return 0;
      case "Monday":
        return 1;
      case "Tuesday":
        return 2;
      case "Wednesday":
        return 3;
      case "Thursday":
        return 4;
      case "Friday":
        return 5;
      case "Saturday":
        return 6;
      default:
        return null;
    }
  }

  const handleDelivered = () => {
    if (!hasDeliveryPartner) {
      if (subsType !== 2) {
        updateNormalOrderDelivery();
        return;
      }
      if (subsType === 2) {
        updateSubscriptionOrderDelivery();
      }
    }
  };

  const updateNormalOrderDelivery = async () => {
    if (hasDeliveryPartner && subsType === 2) {
      return;
    }
    try {
      const url = `${api}/add_normal_order_delivery`;
      const deliveredData = {
        entry_user_id: userId,
        order_id: param.id,
        payment_mode: 1,
        delivery_notes: deliveryNote,
      };
      setisUpdating(true);
      const updateResponse = await UPDATE(token, url, deliveredData);
      if (updateResponse.response === 200) {
        setisUpdating(false);
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setreFetch(!reFetch);
        setalertType("success");
        setalertMsg("Delivered status updated successfully");
      } else if (updateResponse.response === 201) {
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setalertType("error");
        setalertMsg(updateResponse.message);
      } else {
        setisUpdating(false);
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }
    } catch (err) {
      console.log("updating normal order", err);
    }
  };

  const updateSubscriptionOrderDelivery = async () => {
    try {
      if (subsType === 2) {
        let qty = 0;
        const validJSONString = selcetedDaysForWeekly.replace(
          /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
          '"$2": '
        );
        const daysWithCode = JSON.parse(validJSONString);
        const todayDayCode = moment().day() === 0 ? 7 : moment().day();

        const todayData = daysWithCode.find(
          (day) => day.dayCode === todayDayCode
        );

        if (todayData) {
          qty = todayData?.qty;
        }

        const updateData = {
          entry_user_id: userId,
          qty: qty,
          order_id: param.id,
          delivery_notes: deliveryNote,
        };
        setisUpdating(true);
        const url = `${api}/add_sub_order_delivery_weekly`;
        const updateResponse = await UPDATE(token, url, updateData);
        if (updateResponse.response === 200) {
          setisUpdating(false);
          handleSnakBarOpen();
          handleDeliveryDialogClose();
          setreFetch(!reFetch);
          setalertType("success");
          setalertMsg("Delivered status updated successfully");
        } else if (updateResponse.response === 201) {
          setisUpdating(false);
          handleSnakBarOpen();
          handleDeliveryDialogClose();
          setalertType("error");
          setalertMsg(updateResponse.message);
        } else {
          setisUpdating(false);
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg("Something went Wrong! Please Try Again");
        }
        return;
      }
      const updateData = {
        entry_user_id: userId,
        order_id: param.id,
        delivery_notes: deliveryNote,
      };
      setisUpdating(true);
      const url = `${api}/add_sub_order_delivery`;
      const updateResponse = await UPDATE(token, url, updateData);
      if (updateResponse.response === 200) {
        setisUpdating(false);
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setreFetch(!reFetch);
        setalertType("success");
        setalertMsg("Delivered status updated successfully");
      } else if (updateResponse.response === 201) {
        setisUpdating(false);
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setalertType("error");
        setalertMsg(updateResponse.message);
      } else {
        setisUpdating(false);
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }
    } catch (err) {
      console.log("updating normal order", err);
    }
  };

  const addOrderDelivery = async () => {
    // if (hasDeliveryPartner && subsType === 2) return;

    try {
      const url = `${api}/add_order_delivery_data`;
      const deliveredData = {
        entry_user_id: userId,
        order_id: param.id,
        executive_id: selectedBoy,
        assigned_date: addDlvryDate,
        delivery_notes: deliveryNote,
        payment_mode: 1,
      };
      setisUpdating(true);
      const updateResponse = await UPDATE(token, url, deliveredData);
      setisUpdating(false);

      if (updateResponse.response === 200) {
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setDeliveryNote("");
        setreFetch(!reFetch);
        handleaddDekiveryDailogClose();
        setalertType("success");
        setalertMsg("Delivered status updated successfully");
      } else {
        handleSnakBarOpen();
        handleDeliveryDialogClose();
        setDeliveryNote("");
        setalertType("error");
        setalertMsg(updateResponse.message || "Something went wrong!");
      }
    } catch (err) {
      setisUpdating(false);
      handleaddDekiveryDailogClose();
      setDeliveryNote("");
      console.error("Error:", err);
      setalertType("error");
      setalertMsg("Server error. Try again later.");
    }
  };

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",

          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <GridToolbarExport color="secondary" sx={{ fontSize: "14px" }} />
          <Select
            sx={{
              width: "100px",
              height: "30px",
            }}
            color="primary"
            size="small"
            labelId="demo-select-small"
            id="demo-select-small"
            value={pageSize}
            label="Page Size"
            onChange={(e) => {
              setpageSize(e.target.value);
            }}
            className="TopPageBar"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </div>
        {subsType === null && (dlvStatus === 1 || delivery?.length === 1) ? (
          ""
        ) : (
          <button
            class="cssbuttons-io-button"
            onClick={(e) => {
              e.preventDefault();
              setselectedBoy();
              handleaddDekiveryDailogOpen();
            }}
          >
            Add New
            <div class="icon">
              <i class="fa-regular fa-plus"></i>
            </div>
          </button>
        )}
      </GridToolbarContainer>
    );
  }
  // custom toolbar
  function transecToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {" "}
          <GridToolbarExport color="secondary" sx={{ fontSize: "14px" }} />
          <Select
            sx={{
              width: "100px",
              height: "30px",
            }}
            color="primary"
            size="small"
            labelId="demo-select-small"
            id="demo-select-small"
            value={pageSize2}
            label="Page Size"
            onChange={(e) => {
              setpageSize2(e.target.value);
            }}
            className="TopPageBar"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </div>
      </GridToolbarContainer>
    );
  }
  function assignToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {" "}
          <GridToolbarExport color="secondary" sx={{ fontSize: "14px" }} />
          <Select
            sx={{
              width: "100px",
              height: "30px",
            }}
            color="primary"
            size="small"
            labelId="demo-select-small"
            id="demo-select-small"
            value={pageSize3}
            label="Page Size"
            onChange={(e) => {
              setpageSize3(e.target.value);
            }}
            className="TopPageBar"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </div>
        <button
          class="cssbuttons-io-button"
          onClick={(e) => {
            e.preventDefault();
            setselectedBoy();
            handleOpen();
          }}
        >
          {" "}
          Assign New
          <div class="icon">
            <i class="fa-regular fa-plus"></i>
          </div>
        </button>
      </GridToolbarContainer>
    );
  }

  const product = products?.find((option) => {
    return productId === option.id;
  });

  const getQty = (date) => {
    const dayCode = getDayName(date);
    const string = selcetedDaysForWeekly;
    const validJSONString = string.replace(
      /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
      '"$2": '
    );
    const array = JSON.parse(validJSONString);
    const containsDayQty = array.find((obj) => obj.dayCode === dayCode);

    return containsDayQty;
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
      .filter(Boolean)
      .join(" , ");
    return address;
  };

  const handleRefund = async () => {
    if (!amount) {
      setAmountError("Amount is mandatory");
      return;
    }

    // Create the refund message
    const refundMessage = reason || `Refunded to the wallet for order`;

    try {
      const transectionData = {
        user_id: userId,
        order_id: param.id,
        amount,
        payment_id: "",
        type: 3,
        description: refundMessage,
        payment_mode: 1,
      };
      setIsRefundLoading(true);
      const url = `${api}/add_txn`;
      const transaction = await ADD(token, url, transectionData);

      if (transaction.response === 200) {
        handleRefundModalClose();
        if (subsType === null) {
          const url = `${api}/txn/order/${param.id}`;
          getTrans(url);
        } else {
          const url = `${api}/txn/sub_order/${param.id}`;
          getTrans(url);
        }
        setIsRefundLoading(false);
        handleSnakBarOpen();
        setalertType("success");
        setalertMsg("Refund processed successfully");
      } else {
        // Handle error response
        setIsRefundLoading(false);
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Error processing refund: " + transaction.data.message);
      }
    } catch (error) {
      // Handle any unexpected errors
      setIsRefundLoading(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(
        "An error occurred while processing the refund: " + error.message
      );
    }
  };

  const handleClickOpen = () => {
    setOpenRefundModal(true);
  };

  const handleRefundModalClose = () => {
    setOpenRefundModal(false);
    // Reset the form fields
    setAmount("");
    setReason("");
    setAmountError("");
  };

  const handlePauseOrder = () => {
    setTempOrderStaus(order_status);
    const newStatus = order_status === 1 ? 0 : 1;
    setorder_status(newStatus);
    setOpenPauseDialog(true);
    // updateOrderActiveStatus(newStatus);
  };
  const handleUpdatePauseOrder = (formattedPauseDates) => {
    setPauseOrdersDates(formattedPauseDates);
    updateOrderActiveStatus(formattedPauseDates);
  };
  const handleClosePauseOrder = () => {
    setorder_status(tempOrderStatus);
    setOpenPauseDialog(false);
  };

  const downladCustomerInvoice = async () => {
    setisUpdating(true);
    const invoiceId = param.id;
    const dateObject = new Date(orderCreatedDate.replace(" ", "T"));
    const options = { day: "numeric", month: "long", year: "numeric" };
    const invoiceDate = dateObject.toLocaleDateString("en-GB", options);
    const fileName = `Invoice_Order_No ${order_number} Date_${invoiceDate}.pdf`;

    if (subscription_type === "false") {
      var url = `${api}/invoice/${param.id}`;
    } else {
      var url = `${api}/sub_invoice/${param.id}`;
    }
    try {
      const invoiceResponse = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Pass token if needed
        },
      });

      const blob = await invoiceResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none"; // Hide the link element
      a.href = downloadUrl;
      a.download = fileName;

      // Append the link to the DOM and trigger the click event
      document.body.appendChild(a);
      a.click();

      // Clean up by revoking the URL and removing the link
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      setisUpdating(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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
          alignItems: "center",
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
          </IconButton>{" "}
          <h2 className="heading"> Update Order Details</h2>
        </div>
        {subsType === null && (dlvStatus === 1 || delivery?.length === 1) && (
          <div
            style={{
              padding: "3px 10px",
              background: "#28a745",
              color: "#f6f6f6",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            Order Delivered{" "}
            <span style={{ marginLeft: "5px" }}>
              <i class="fa-regular fa-thumbs-up"></i>
            </span>
          </div>
        )}
      </Box>
      {userId ? (
        <Box
          component="form"
          onSubmit={(e) => {
            if (subsType === null) {
              updateNormal(e);
            } else {
              updateSubs(e);
            }
          }}
        >
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
                maxWidth: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBlockEnd: "1rem",
                }}
              >
                <h4>
                  Order Details <span>{order_number}</span>
                </h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {subsType && subsType !== 1 && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleOpenCalendar}
                      sx={{
                        fontWeight: "600",
                        letterSpacing: "1px",
                        gap: "1rem",
                      }}
                    >
                      Subscription Days
                      <div class="icon" style={{ display: "contents" }}>
                        <CalendarTodayIcon />
                      </div>
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleClickOpen}
                    sx={{ fontWeight: "600", letterSpacing: "1px" }}
                  >
                    Refund
                  </Button>
                </div>
                {/* Refund Modal */}
                <RefundDialog
                  openRefundModal={openRefundModal}
                  handleRefundModalClose={handleRefundModalClose}
                  amount={amount}
                  setAmount={setAmount}
                  reason={reason}
                  setReason={setReason}
                  amountError={amountError}
                  setAmountError={setAmountError}
                  isRefundLoading={isRefundLoading}
                  setIsRefundLoading={setIsRefundLoading}
                  handleRefund={handleRefund}
                />
                {/* <Dialog
                  open={openRefundModal}
                  onClose={handleRefundModalClose}
                  sx={{ width: 400, maxWidth: "90%" }}
                >
                  <DialogTitle>Refund</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Amount"
                      type="number"
                      fullWidth
                      variant="outlined"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setAmountError(""); // Clear the error when the user starts typing
                      }}
                      required
                      error={Boolean(amountError)}
                    />
                    {amountError && (
                      <div style={{ color: "red", marginTop: "5px" }}>
                        {amountError}
                      </div>
                    )}
                    <TextField
                      margin="dense"
                      label="Reason (Optional)"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleRefundModalClose} color="primary">
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={isRefundLoading}
                      onClick={handleRefund}
                    >
                      Submit
                    </Button>
                  </DialogActions>
                </Dialog> */}
              </div>
              <p className="fs-16">
                Enter the required information below . You can change it anytime
                you want.
              </p>

              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="20px"
              >
                <Autocomplete
                  disablePortal
                  disabled
                  fullWidth
                  id="combo-box-demo"
                  color="secondary"
                  options={users}
                  inputValue={name}
                  onChange={(e, data) => {
                    setuserId(data.id);
                    getAddress(data.id);
                  }}
                  getOptionLabel={(option) =>
                    `${option?.name}   (${
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
                    />
                  )}
                />
                {isCartOrderPage ? (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "50%" }}
                    onClick={() => {
                      setIsOpenProductModal(true);
                    }}
                  >
                    View Order Products
                  </Button>
                ) : (
                  <Autocomplete
                    disablePortal
                    fullWidth
                    disabled
                    id="combo-box-demo"
                    color="secondary"
                    options={products}
                    value={
                      productId
                        ? products?.find((option) => {
                            return productId === option.id;
                          }) ?? null
                        : null
                    }
                    onChange={(e, data) => {
                      setproductId(data.id);
                    }}
                    getOptionLabel={(option) =>
                      `${option?.title} (${option?.qty_text}) ${
                        option?.subscription === 1 ? "( Subcription )" : ""
                      }` || ""
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product"
                        size="small"
                        fullWidth
                        required
                        color="secondary"
                      />
                    )}
                  />
                )}
              </Box>
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="20px"
              >
                <TextField
                  margin="normal"
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
                  value={parseFloat(mrp).toFixed(2)}
                />
                <TextField
                  margin="normal"
                  disabled
                  required
                  fullWidth
                  id="Price"
                  label="Price"
                  name="Price"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={parseFloat(price).toFixed(2)}
                />
                {subsType && (
                  <TextField
                    margin="normal"
                    disabled
                    required
                    fullWidth
                    id="Tax"
                    label="Tax"
                    name="Tax"
                    type="number"
                    color="secondary"
                    autoComplete="number"
                    size="small"
                    InputProps={{ inputProps: { min: 0 } }}
                    value={parseFloat(tax).toFixed(2)}
                  />
                )}
              </Box>
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="20px"
              >
                <TextField
                  margin="normal"
                  disabled
                  required
                  fullWidth
                  id="Order Amount"
                  label="Order Total Amount"
                  name="Order Amount"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={parseFloat(orderAmount).toFixed(2)}
                />
                <TextField
                  margin="normal"
                  required
                  disabled
                  fullWidth
                  id="Quantity"
                  label="Quantity"
                  name="Quantity"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={quantity}
                  onChange={(e) => {
                    setquantity(
                      e.target.value === "" ? "" : Math.floor(e.target.value)
                    );
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  disabled={subsType === null}
                  fullWidth
                  id="Start From"
                  label="Start From"
                  name="Start From"
                  type="date"
                  color="secondary"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(e) => {
                    setdate(e.target.value);
                  }}
                />
              </Box>
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="30px"
              >
                {subsType && (
                  <FormControl fullWidth>
                    <InputLabel
                      id="demo-simple-select-label"
                      color="secondary"
                      size="small"
                    >
                      Subscription Type
                    </InputLabel>
                    <Select
                      disabled
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Subscription Type"
                      size="small"
                      fullWidth
                      required={subsType != null}
                      color="secondary"
                      onChange={(e) => {
                        setsubsType(e.target.value);
                      }}
                      value={subsType}
                    >
                      <MenuItem value={1} selected>
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
                )}
                <FormControl fullWidth>
                  <TextField
                    margin="normal"
                    required
                    disabled={true}
                    fullWidth
                    id="Delivery Charge"
                    label="Delivery Charge"
                    name="Delivery Charge"
                    type="number"
                    color="secondary"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={deliveryCharge}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel
                    id="address-select"
                    color="secondary"
                    size="small"
                  >
                    Address
                  </InputLabel>
                  <Select
                    disabled={!userId}
                    labelId="address-select"
                    id="demo-simple-select"
                    label="Address"
                    size="small"
                    fullWidth
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
                    value={addressID}
                  >
                    <MenuItem value={0}>Add New Address</MenuItem>
                    <br />
                    {address?.map((ad) => (
                      <MenuItem
                        value={ad.id}
                        disabled={ad?.is_deleted === 1}
                        key={ad.id}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <span>{getFormattedAddress(ad)}</span>
                          {/* {ad?.is_deleted === 1 && (
                            <span style={{ color: "red", fontWeight: "bold" }}>
                              Deleted
                            </span>
                          )} */}
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {/* toggle btns */}
              {/* Order Status */}
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="30px"
              >
                {/* Select */}
                <FormControl fullWidth>
                  <InputLabel
                    id="demo-simple-select-label"
                    color="secondary"
                    size="small"
                  >
                    Status
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Status"
                    size="small"
                    fullWidth
                    color="secondary"
                    value={status}
                    onChange={(e) => {
                      setstatus(e.target.value);
                    }}
                  >
                    <MenuItem value={1}>Confirmed</MenuItem>
                    <MenuItem value={0}>Pending</MenuItem>
                    {/* {!hasDeliveryPartner && (
                        <MenuItem value={3}>Delivered</MenuItem>
                      )} */}
                    <MenuItem value={2}>Canceled</MenuItem>
                  </Select>
                </FormControl>

                {subsType != null && subsType !== 1 && (
                  <Button
                    fullWidth
                    color="secondary"
                    variant="contained"
                    onClick={handleOpenPauseCalendar}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      textTransform: "none",
                      cursor: "pointer",
                    }}
                  >
                    <CalendarMonth
                      style={{
                        color: "red",
                        fontSize: "20px",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPauseCalendar();
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.2)")
                      } // Slight zoom on hover
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      } // Reset zoom
                    />
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Pause order
                    </span>
                  </Button>
                )}

                {!hasDeliveryPartner && deliveryAvailablity && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={isUpdating}
                    onClick={() => setDeliveryDialogModal(true)}
                  >
                    Order Delivered
                  </Button>
                )}
              </Box>
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="30px"
              >
                <TextField
                  margin="normal"
                  disabled
                  required
                  fullWidth
                  id="discountAmount"
                  label="Discount Amount"
                  name="Discount Amount"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={parseFloat(
                    orderData.coupon_discount_value || 0
                  ).toFixed(2)}
                />
              </Box>
              {deliveryInstruction && deliveryInstruction.trim() !== "" && (
                <Box mt="30px">
                  <Typography fontWeight="bold" mr={1}>
                    Delivery Instruction:
                  </Typography>
                  <Typography fontSize={14} sx={{ whiteSpace: "pre-line" }}>
                    {deliveryInstruction}
                  </Typography>
                </Box>
              )}

              {subsType === 2 && (
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent={"space-between"}
                  gap="20px"
                  mt="20px"
                >
                  <Box width={"fir-content"}>
                    <Typography mt={3}>Select Delivery Days *</Typography>
                    <Stack direction="row" spacing={2} mt={1} gap={1}>
                      <div className={M === 1 ? "dayBTn active" : "dayBTn"}>
                        M
                      </div>
                      <div className={T === 2 ? "dayBTn active" : "dayBTn"}>
                        T
                      </div>
                      <div className={W === 3 ? "dayBTn active" : "dayBTn"}>
                        W
                      </div>
                      <div className={TH === 4 ? "dayBTn active" : "dayBTn"}>
                        TH
                      </div>
                      <div className={F === 5 ? "dayBTn active" : "dayBTn"}>
                        F
                      </div>
                      <div className={S === 6 ? "dayBTn active" : "dayBTn"}>
                        S
                      </div>
                      <div className={SU === 0 ? "dayBTn active" : "dayBTn"}>
                        SU
                      </div>
                    </Stack>
                    <Typography mt={3}>Set Per Day Quality *</Typography>
                    <Stack direction="column" spacing={2} mt={1} gap={1}>
                      {selected_days.map(
                        (s) =>
                          s.d === s.id && (
                            <div className="dayQty">
                              <p style={{ fontWeight: "600" }}>{s.name}</p>
                              <div className="qty">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  aria-label="add an alarm"
                                  sx={{
                                    border: "1px solid #000",
                                    padding: "2px",
                                  }}
                                >
                                  <RemoveIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                                <b>
                                  {" "}
                                  <p>{s.qt}</p>
                                </b>
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  aria-label="add an alarm"
                                  sx={{
                                    border: "1px solid #4cceac",
                                    padding: "3px",
                                  }}
                                >
                                  <AddIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </div>
                            </div>
                          )
                      )}
                    </Stack>
                  </Box>
                </Box>
              )}
            </div>
          </div>
          {addnew && (
            <div className="product">
              <div
                className="left"
                style={{
                  backgroundColor: colors.cardBG[400],
                }}
              >
                <Typography fontWeight="bold" mr={1}>
                  Add New Address
                </Typography>
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent={"space-between"}
                  gap="20px"
                  mt="20px"
                >
                  <TextField
                    margin="normal"
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
                  <TextField
                    margin="normal"
                    required={addnew}
                    fullWidth
                    id="Phone Number"
                    label="Phone Number"
                    name="Phone Number"
                    color="secondary"
                    size="small"
                    onChange={(e) => {
                      setnumber(e.target.value);
                    }}
                  />
                </Box>
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent={"space-between"}
                  gap="20px"
                  mt="20px"
                >
                  <TextField
                    margin="normal"
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
                  <TextField
                    margin="normal"
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
                  <TextField
                    margin="normal"
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
                </Box>
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent={"space-between"}
                  gap="20px"
                  mt="20px"
                >
                  <TextField
                    margin="normal"
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
                  <TextField
                    margin="normal"
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
                  <TextField
                    margin="normal"
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
                </Box>
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent={"space-between"}
                  gap="20px"
                  mt="20px"
                ></Box>
              </div>
            </div>
          )}

          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              <Typography fontWeight="bold" mr={1}>
                Delivery Details:
              </Typography>
              <Box sx={{ height: 400, width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row-reverse",
                  }}
                >
                  {" "}
                </div>

                {delivery && (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      paddingBottom: "30px",
                      "& .MuiDataGrid-root": {
                        border: "none",
                      },
                      "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                      },
                      "& .MuiDataGrid-row": {
                        fontSize: "14px",
                      },
                      "& .name-column--cell": {
                        color: colors.greenAccent[300],
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.navbarBG[400],
                        borderBottom: "none",
                        color: "#f5f5f5",
                      },
                      "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                        borderBottom: "#000",
                      },
                      "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.navbarBG[400],
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiTablePagination-root": {
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiTablePagination-selectIcon": {
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiTablePagination-actions botton": {
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                      },
                    }}
                  >
                    {" "}
                    <DataGrid
                      sx={{ fontSize: "13px" }}
                      columns={column}
                      rows={delivery ? delivery : []}
                      getRowId={(row) => row?.date || Math.random()}
                      components={{ Toolbar: CustomToolbar }}
                      rowsPerPageOptions={[10, 20, 25, 50, 100]}
                      pageSize={pageSize}
                      onPageSizeChange={(newPageSize) =>
                        setpageSize(newPageSize)
                      }
                      localeText={{
                        noRowsLabel: "No records found",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </div>
          </div>

          {/* transection */}
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography fontWeight="bold" mr={1}>
                  Transaction History
                </Typography>
                <button
                  type="button"
                  class="cssbuttons-io-button"
                  onClick={(e) => {
                    downladCustomerInvoice();
                  }}
                >
                  {" "}
                  {isUpdating ? <CircularProgress /> : "Customer Invoice"}
                  <div class="icon">
                    <i class="fa-solid fa-file-arrow-down"></i>
                  </div>
                </button>
              </div>
              <Box sx={{ height: 400, width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row-reverse",
                  }}
                >
                  {" "}
                </div>

                {transactionHistory ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      paddingBottom: "30px",
                      "& .MuiDataGrid-root": {
                        border: "none",
                      },
                      "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                      },
                      "& .MuiDataGrid-row": {
                        fontSize: "14px",
                      },
                      "& .name-column--cell": {
                        color: colors.greenAccent[300],
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.navbarBG[400],
                        borderBottom: "none",
                        color: "#f5f5f5",
                      },
                      "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                        borderBottom: "#000",
                      },
                      "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.navbarBG[400],
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiTablePagination-root": {
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiTablePagination-selectIcon": {
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiTablePagination-actions botton": {
                        color: "#f5f5f5 !important",
                      },
                      "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                      },
                    }}
                  >
                    {" "}
                    <DataGrid
                      sx={{ fontSize: "13px" }}
                      columns={transactionColumn}
                      rows={transactionHistory ? transactionHistory : []}
                      components={{ Toolbar: transecToolbar }}
                      rowsPerPageOptions={[10, 20, 25, 50, 100]}
                      pageSize={pageSize2}
                      onPageSizeChange={(newPageSize) =>
                        setpageSize2(newPageSize)
                      }
                      localeText={{
                        noRowsLabel: "No records found",
                      }}
                    />
                  </Box>
                ) : (
                  <LoadingSkeleton rows={6} height={30} />
                )}
              </Box>
            </div>
          </div>
          {/* {hasDeliveryPartner && (
            <div className="product">
              <div
                className="left"
                style={{
                  backgroundColor: colors.cardBG[400],
                }}
              >
                <h3>Assign orders </h3>
                <Box sx={{ height: 400, width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexDirection: "row-reverse",
                    }}
                  >
                    {" "}
                  </div>

                  {delivery && (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        paddingBottom: "30px",
                        "& .MuiDataGrid-root": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell": {
                          borderBottom: "none",
                        },
                        "& .MuiDataGrid-row": {
                          fontSize: "14px",
                        },
                        "& .name-column--cell": {
                          color: colors.greenAccent[300],
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          backgroundColor: colors.navbarBG[400],
                          borderBottom: "none",
                          color: "#f5f5f5",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                          backgroundColor: colors.primary[400],
                          borderBottom: "#000",
                        },
                        "& .MuiDataGrid-footerContainer": {
                          borderTop: "none",
                          backgroundColor: colors.navbarBG[400],
                          color: "#f5f5f5 !important",
                        },
                        "& .MuiTablePagination-root": {
                          color: "#f5f5f5 !important",
                        },
                        "& .MuiTablePagination-selectIcon": {
                          color: "#f5f5f5 !important",
                        },
                        "& .MuiTablePagination-actions botton": {
                          color: "#f5f5f5 !important",
                        },
                        "& .MuiCheckbox-root": {
                          color: `${colors.greenAccent[200]} !important`,
                        },
                      }}
                    >
                      {" "}
                      <DataGrid
                        sx={{ fontSize: "13px" }}
                        columns={assignColumn}
                        rows={orderAssign ? orderAssign : []}
                        components={{ Toolbar: assignToolbar }}
                        rowsPerPageOptions={[10, 20, 25, 50, 100]}
                        pageSize={pageSize3}
                        onPageSizeChange={(newPageSize) =>
                          setpageSize3(newPageSize)
                        }
                        localeText={{
                          noRowsLabel: "No records found",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </div>
            </div>
          )} */}

          <div className="delete">
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="secondary"
              sx={{ fontWeight: "600", letterSpacing: "1px" }}
            >
              {LOADING ? <CircularProgress size={20} /> : "Update Order"}
            </Button>
          </div>
        </Box>
      ) : (
        <LoadingSkeleton rows={6} height={30} />
      )}

      {/* model */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Assign order to delivery partner
          </Typography>
          <Box component="form" sx={{ mt: 3 }}>
            <Autocomplete
              disablePortal
              fullWidth
              id="combo-box-demo"
              color="secondary"
              options={delivryBoyz}
              onChange={(e, data) => setselectedBoy(data.user_id)}
              getOptionLabel={(option) =>
                `${option?.name} , ${option?.email} , ${option?.phone}` || ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Delivery Partner"
                  size="small"
                  fullWidth
                  required
                  color="secondary"
                />
              )}
            />

            <button
              className="AddBtn"
              disabled={isUpdating}
              onClick={(e) => {
                e.preventDefault();
                if (!selectedBoy) {
                  handleSnakBarOpen();
                  setalertType("error");
                  setalertMsg("Please Select Delivery Partner");
                } else {
                  addAssign();
                }
              }}
            >
              {isUpdating ? <CircularProgress color="inherit" /> : "Assign"}
            </button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={addDelvryModal}
        onClose={handleaddDekiveryDailogClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Add Delivery
          </Typography>
          <Box component="form" sx={{ mt: 3 }}>
            <Autocomplete
              disablePortal
              fullWidth
              id="combo-box-demo"
              color="secondary"
              options={delivryBoyz}
              value={delivryBoyz?.find((d) => d.id === selectedBoy) || null}
              onChange={(e, data) => setselectedBoy(data ? data.id : null)}
              getOptionLabel={(option) =>
                `${option?.executive_id} - ${option?.name}` || ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Delivery Partner"
                  size="small"
                  fullWidth
                  required
                  color="secondary"
                />
              )}
            />
            <br />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Delivery Date"
                format="DD/MM/YYYY"
                onChange={(value) => {
                  if (value) {
                    setaddDlvryDate(moment(value.$d).format("DD-MM-YYYY"));
                  } else {
                    setaddDlvryDate(""); // Clear or handle empty value
                  }
                }}
                minDate={dayjs(date)}
                slotProps={{
                  textField: {
                    size: "small",
                    required: true,
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
            <br />
            <TextField
              label="Delivery Notes"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              size="small"
              fullWidth
              multiline
              color="secondary"
              sx={{ mt: 2 }}
            />

            <button
              className="AddBtn"
              disabled={isUpdating}
              onClick={(e) => {
                e.preventDefault();
                if (!selectedBoy) {
                  handleSnakBarOpen();
                  setalertType("error");
                  setalertMsg("Please Select Delivery Partner");
                } else {
                  addOrderDelivery();
                }
              }}
            >
              {isUpdating ? <CircularProgress color="inherit" /> : "Add"}
            </button>
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={DailogOpen}
        onClose={handleDailogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>Do You Want to Remove </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDailogClose}
            variant="contained"
            color="primary"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={DeleteAssign}
            autoFocus
            variant="contained"
            color="error"
            size="small"
          >
            {loading ? <CircularProgress /> : "Yes! Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeliveryDialog}
        onClose={handleDeliveryDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <div>Confirm this delivery </div>
          <TextField
            label="Delivery Note (Optional)"
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            value={deliveryNote}
            onChange={handleDeliveryNoteChange}
            multiline
            rows={3} // Adjust rows as needed for the medium size
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeliveryDialogClose}
            variant="contained"
            color="primary"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelivered}
            autoFocus
            variant="contained"
            color="secondary"
            size="small"
          >
            {isUpdating ? <CircularProgress /> : "Yes! Delivered"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPauseCalender}
        onClose={handleClosePauseCalendar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "10px",
          },
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            variant="text"
            edge="end"
            color="inherit"
            onClick={handleClosePauseCalendar}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </div>
        <PauseCalendar
          orderModel={orderData}
          handlePauseOrder={handleUpdatePauseOrder}
          handleClose={handleClosePauseCalendar}
          loading={LOADING}
        ></PauseCalendar>
      </Dialog>
      <Dialog
        open={openCalendar}
        onClose={handleCloseCalendar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "10px",
          },
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            variant="text"
            edge="end"
            color="inherit"
            onClick={handleCloseCalendar}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </div>
        <PauseCalendar
          orderModel={orderData}
          handlePauseOrder={handleUpdatePauseOrder}
          handleClose={handleClosePauseCalendar}
          loading={LOADING}
          isAllowSelect={false}
        ></PauseCalendar>
        {/* <OrderDaysCalendarView orderDayModel={orderDayModel} /> */}
      </Dialog>
      <CartOrderProductModal
        cartItems={selectedCartItems}
        open={openProductModal}
        onClose={handleModalClose}
      />
    </>
  );
}

export default UpdateOrder;
