import { useEffect, useMemo, useState } from "react";
import api from "../../Data/api";
import { GET, UPDATE } from "../../Functions/apiFunction";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import * as CONSTANTS from "../../Common/Constants";
import { tokens } from "../../theme";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assets/a_logo.png";
import Utils from "../../Global/utils";
import { useTheme } from "@emotion/react";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

const FILTERS = {
  ALL: "all",
  ASSIGNED: "assigned",
  UNASSIGNED: "unassigned",
  DELIVERED: "delivered",
  UNDELIVERED: "undelivered",
};

function ViewOrdersDeliveries() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [allDeliveryOrder, setAllDeliveryOrder] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [counts, setCounts] = useState();
  const [refetch, setRefetch] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [deliveryOrderData, setDeliveryOrderData] = useState({
    all: [],
    assigned: [],
    unassigned: [],
    delivered: [],
    undelivered: [],
  });
  const [currentFilter, setCurrentFilter] = useState(FILTERS.ALL);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedExecutive, setselectedExecutive] = useState();
  const [executiveList, setExecutiveList] = useState([]);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState();
  const [assingnExecutiveModelOpen, setAssingnExecutiveModelOOpen] =
    useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const Tile = ({ title, count, color, onClick, isSelected, isLoading }) => {
    return (
      <Box
        onClick={onClick}
        className="text-card-foreground shadow-sm rounded-lg"
        sx={{
          backgroundColor: color,
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
          cursor: "pointer",
          border: isSelected ? "3px solid #000" : "none", // Highlight selected
          boxShadow: isSelected ? 6 : 1, // Extra shadow on hover
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: 4,
          },
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {isLoading ? (
            <Skeleton variant="text" width={60} height={40} />
          ) : (
            <Typography variant="h4">{count}</Typography>
          )}
        </Box>
      </Box>
    );
  };

  const handleTileClick = (type) => {
    setCurrentFilter(type);
    const allOrders = deliveryOrderData[type] || [];
    let filteredData =
      filterType === "all"
        ? allOrders
        : allOrders.filter((order) => {
          if (filterType === "buyonce") return !order.subscription_type;
          if (filterType === "subscription") return !!order.subscription_type;
          return order.subscription_type === filterType;
        });
    if (searchText.trim() !== "") {
      filteredData = searchArrayByValue(
        filteredData,
        searchText.toLowerCase()
      );
    }
    setAllDeliveryOrder(filteredData);
    // setRefetch((prev) => !prev);
  };

  useEffect(() => {
    const getDeliveryOrders = async () => {
      try {
        setIsLoading(true);
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const url = `${api}/get_delivery_order_detail/${formattedDate}`;
        const orderData = await GET(token, url);

        if (orderData.response === 200) {
          const transformOrders = (orders) =>
            orders?.map((item) => {
              const subscription_text = Utils.getSubscriptionType(
                item.subscription_type
              );
              return {
                id: item.id,
                order_id: item.id,
                order_number: item.order_number,
                customerName: item.customerName,
                phone: item.phone,
                qty: item.qty,
                created_at:
                  (item?.created_at &&
                    moment(item?.created_at).local().format("DD-MM-YYYY")) ||
                  "N/A",
                start_date:
                  (item?.start_date &&
                    moment(item?.start_date).local().format("DD-MM-YYYY")) ||
                  "N/A",
                end_date:
                  (item?.end_date &&
                    moment(item?.end_date).local().format("DD-MM-YYYY")) ||
                  "N/A",

                prodcut_title: item.title,
                product_detail: JSON.parse(item.product_detail)
                  ?.map((product) => product.product_title)
                  .join(", "),
                subscription_type: item.subscription_type,
                subscription_text:
                  subscription_text === "N/A" ? "BuyOnce" : subscription_text,
                order_amount: item.order_amount.toFixed(2),
                pincode: item.pincode,
                status: item.status,
                executive_number: item?.executive_number || "",
                delivery_executive:
                  (item?.delivery_boy_name &&
                    `${item.executive_number} - ${item.delivery_boy_name}`) ||
                  "N/A",
                delivery_executive_id: item.delivery_executive_id,
                assigned_date: item?.assigned_date,
                parsedAssigned_date:
                  (item?.assigned_date &&
                    moment(item?.assigned_date).local().format("DD-MM-YYYY")) ||
                  "N/A",
                delivered: item?.isDelivered,
                deliveredDate: item?.deliveredDate,
              };
            });

          const transformedData = {
            all: transformOrders(orderData.data?.all || []),
            assigned: transformOrders(orderData.data?.assigned || []),
            unassigned: transformOrders(orderData.data?.unassigned || []),
            delivered: transformOrders(orderData.data?.delivered || []),
            undelivered: transformOrders(orderData.data?.undelivered || []),
          };
          setCounts(orderData.counts);
          setDeliveryOrderData(transformedData);
          const allOrders = transformedData[currentFilter] || [];

          let filteredData =
            filterType === "all"
              ? allOrders
              : allOrders.filter((order) => {
                if (filterType === "buyonce") return !order.subscription_type;
                if (filterType === "subscription")
                  return !!order.subscription_type;
                return order.subscription_type === filterType;
              });

          if (searchText.trim() !== "") {
            filteredData = searchArrayByValue(
              filteredData,
              searchText.toLowerCase()
            );
          }
          setAllDeliveryOrder(filteredData);
        } else {
          console.error("Failed to fetch delivery orders:", orderData.message);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching delivery orders:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      getDeliveryOrders();
    }
  }, [token, refetch]);

  const handleDateChange = (newValue) => {
    if (newValue) {
      setSelectedDate(newValue);
      setRefetch((prev) => !prev);
    }
  };

  const column = useMemo(() => {
    const baseColumns = [
      { field: "order_number", headerName: "ID", width: 120 },
      { field: "customerName", headerName: "Customer Name", width: 180 },
      { field: "phone", headerName: "Phone Number", width: 120 },
      {
        field: "title",
        headerName: "Product",
        width: 180,
        valueGetter: (params) =>
          params.row.subscription_type !== null
            ? params.row.prodcut_title
            : params.row.product_detail,
      },
      { field: "qty", headerName: "Qty", width: 80 },
      { field: "order_amount", headerName: "Amount", width: 80 },
      {
        field: "created_at",
        headerName: "Ordered Date",
        width: 180,
      },
      {
        field: "subscription_text",
        headerName: "Subscription Type",
        width: 120,
      },
      {
        field: "start_date",
        headerName: "Start Date",
        width: 100,
      },
      {
        field: "end_date",
        headerName: "End Date",
        width: 100,
      },
      {
        field: "subscription_alert",
        headerName: "Subscription Status",
        width: 120,
        renderHeader: () => (
          <Tooltip title="Subscription Status" arrow>
            <Typography className="fs-13">Subscription Status</Typography>
          </Tooltip>
        ),
        renderCell: (params) => Utils.renderSubscriptionStatusCell(params),
      },
      {
        field: "pincode",
        headerName: "Pin code",
        width: 100,
      },
      {
        field: "delivery_executive",
        headerName: "Assigned To",
        width: 200,
      },
      {
        field: "delivered",
        headerName: "Delivery Status",
        width: 120,
        renderCell: (params) => (
          <p>
            {!params.row?.delivered ? (
              <p style={{ color: "red" }}>
                <b>Not Delivered</b>
              </p>
            ) : (
              <p style={{ color: "green" }}>
                <b>Delivered</b>
              </p>
            )}
          </p>
        ),
      },
      {
        field: "deliveredDate",
        headerName: "Delivered On",
        width: 180,
        renderCell: (params) =>
          (params.row?.deliveredDate &&
            moment
              .utc(params.row.deliveredDate)
              .local()
              .format("DD-MM-YYYY HH:mm:ss")) ||
          "N/A",
      },
    ];

    // const actionColumn = {
    //   field: "Action",
    //   headerName: "Action",
    //   width: 400,
    //   renderCell: (params) => {
    //     const isAssigned =
    //       params?.row.executive_number && currentFilter === FILTERS.ASSIGNED;

    //     return (
    //       <div style={{ display: "flex", gap: "10px" }}>
    //         {!isAssigned && (
    //           <button
    //             className="AssignButton"
    //             style={{ backgroundColor: "green" }}
    //             // onClick={() => handleOpen(params.row)}
    //           >
    //             Assign
    //           </button>
    //         )}
    //         {isAssigned && (
    //           <button
    //             className="AssignButton"
    //             style={{ backgroundColor: "blue" }}
    //             onClick={() => handleAssignExecutiveModelOpen(params.row)}
    //           >
    //             Re-Assign
    //           </button>
    //         )}
    //       </div>
    //     );
    //   },
    // };

    // if (
    //   currentFilter === FILTERS.ASSIGNED ||
    //   currentFilter === FILTERS.UNASSIGNED
    // ) {
    //   return [...baseColumns, actionColumn];
    // }

    return baseColumns;
  }, [currentFilter]);

  const getReportName = () => {
    switch (currentFilter) {
      case FILTERS.ALL:
        return "All Orders";
      case FILTERS.ASSIGNED:
        return "Assigned Orders";
      case FILTERS.UNASSIGNED:
        return "Unassigned Orders";
      case FILTERS.DELIVERED:
        return "Orders Delivered";
      case FILTERS.UNDELIVERED:
        return "Orders Undelivered";
      default:
        return "Deliveries";
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Customer Name",
      "Phone Number",
      "Product",
      "Qty",
      "Amount",
      "Ordered Date",
      "Subscription Type",
      "Start Date",
      "End Date",
      "Subscription Status",
      "Pin code",
      "Assigned To",
      "Delivery Status",
      "Delivered On",
    ];

    const reversedRequest = [...allDeliveryOrder].reverse();

    const csvData = reversedRequest.map((row, index) => [
      row.order_number,
      row.customerName,
      row.phone,
      row.subscription_type !== null ? row.prodcut_title : row.product_detail,
      row.qty,
      row.order_amount,
      row.created_at,
      row.subscription_text,
      row.start_date,
      row.end_date,
      Utils.getSubscriptionAlert(row),
      row.pincode,
      row.delivery_executive || "--",
      row.delivered ? "Delivered" : "Not Delivered",
      (row?.deliveredDate &&
        moment.utc(row.deliveredDate).local().format("DD-MM-YYYY HH:mm:ss")) ||
      "N/A",
    ]);

    const tempData = [
      [
        `View Orders and Deliveries - ${getReportName()} : ${selectedDate ? moment(selectedDate).format("DD-MM-YYYY") : ""
        }`,
      ],
      [],
      headers,
      ...csvData,
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "View Orders & Deliveries Report"
    );

    const fileName = `View Orders and Deliveries ${moment
      .utc(new Date())
      .local()
      .format("DD-MM-YYYY")}.csv`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    });

    doc.setFontSize(18);
    const headerText = `View Orders and Deliveries - ${getReportName()} : ${selectedDate ? moment(selectedDate).format("DD-MM-YYYY") : ""
      }`;

    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerX, 20);

    Utils.getBase64FromImage(logo, (base64Logo) => {
      const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
      const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(
        base64Logo,
        "PNG",
        pageWidth - logoWidth - 15,
        10,
        logoWidth,
        logoHeight
      );

      const tableColumn = [
        { header: "ID", dataKey: "order_id" },
        { header: "Customer Name", dataKey: "name" },
        { header: "Phone Number", dataKey: "phone" },
        { header: "Product", dataKey: "product" },
        { header: "Qty", dataKey: "qty" },
        { header: "Amount", dataKey: "amnt" },
        { header: "Ordered Date", dataKey: "created_at" },
        { header: "Subscription Type", dataKey: "sub_type" },
        { header: "Start Date", dataKey: "starte_date" },
        { header: "End Date", dataKey: "end_date" },
        { header: "Subscription Status", dataKey: "subscription_alert" },
        { header: "Pin code", dataKey: "pincode" },
        { header: "Assigned To", dataKey: "executive" },
        { header: "Delivery Status", dataKey: "delstatus" },
        { header: "Delivered On", dataKey: "delivered_date" },
      ];

      const reversedRequests = [...allDeliveryOrder].reverse();

      const tableRows = reversedRequests.map((row, index) => ({
        order_id: row.order_number,
        name: row.customerName,
        phone: row.phone,
        product:
          row.subscription_type !== null
            ? row.prodcut_title
            : row.product_detail,
        qty: row.qty,
        amnt: row.order_amount,
        created_at: row.created_at,
        sub_type: row.subscription_text,
        start_date: row.start_date,
        end_date: row.end_date,
        subscription_alert: Utils.getSubscriptionAlert(row),
        pincode: row.pincode,
        executive: row.delivery_executive || "N/A",
        delstatus: row.delivered ? "Delivered" : "Not Delivered",
        delivered_date:
          (row?.deliveredDate &&
            moment
              .utc(row.deliveredDate)
              .local()
              .format("DD-MM-YYYY HH:mm:ss")) ||
          "N/A",
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.order_id,
          row.name,
          row.phone,
          row.product,
          row.qty,
          row.amnt,
          row.created_at,
          row.sub_type,
          row.start_date,
          row.end_date,
          row.subscription_alert,
          row.pincode,
          row.executive,
          row.delstatus,
          row.delivered_date,
        ]),
        startY: tableStartY,
        margin: { left: 20 },
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellWidth: "auto",
        },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
          textColor: [255, 255, 255], // White text
          fontSize: 10,
          halign: "center",
          valign: "middle", // Vertically aligns text in the center
          overflow: "linebreak", // Enables word wrapping
        },
        bodyStyles: {
          fontSize: 9,
          font: "meera-regular-unicode-font-normal",
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          overflow: "linebreak", // Applies word wrapping globally
        },
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`;
        const marginRight = 15;

        doc.setFontSize(9);
        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - 10
        );
      }

      doc.save(
        `View Orders and Deliveries ${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  const handleAssignExecutiveModelOpen = async (row) => {
    try {
      const url = `${api}/get_all_executives`;
      setIsLoading(true);
      setFormData(row);
      setSelectedId(row?.id);
      const executiveRes = await GET(token, url);
      if (executiveRes.response === 200) {
        const filteredData = executiveRes.data.filter(
          (a) => a.id !== row?.delivery_executive_id && a.is_active === 1
        );
        setExecutiveList(filteredData);
        setAssingnExecutiveModelOOpen(true);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! to get the Executives");
      }
    } catch (err) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! to get the Executives");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedExecutive) {
        setError(true);
        return;
      }
      setIsLoading(true);
      const data = {
        id: selectedId,
        selected_executive: selectedExecutive,
        exsisting_executive: formData,
      };
      const url = `${api}/delivery_re_assign_Order`;

      const update = await UPDATE(token, url, data);
      if (update.response === 200) {
        handleSnakBarOpen();
        setalertType("success");
        setalertMsg("Order Reassigned succesfully.");
      } else if (update.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(update.message);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }
      handleClose();
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAssingnExecutiveModelOOpen(false);
    setselectedExecutive();
    setSelectedId(null);
    setError(false);
  };

  const searchArrayByValue = (arr, searchQuery) => {
    return arr
      .map((obj) => {
        const exist_updated_at = obj.updated_at;
        const exist_subscription = obj.subscription;
        return {
          ...obj,
          updated_at_temp: moment
            .utc(obj.updated_at)
            .local()
            .format("DD-MM-YYYY HH:mm:ss"),
          exist_updated_at,
          subscription_temp:
            obj.subscription === 0
              ? CONSTANTS.SUBSCRIPTION_TYPES.NON_SUBSCRIPTION
              : obj.subscription === 1
                ? CONSTANTS.SUBSCRIPTION_TYPES.SUBSCRIPTION
                : obj.subscription === null
                  ? CONSTANTS.NOT_APPLICABLE
                  : CONSTANTS.NOT_APPLICABLE,
          exist_subscription,
        };
      })
      .filter((obj) => {
        return Object.values(obj).some((val) => {
          if (typeof val === "string") {
            return val.toLowerCase().includes(searchQuery);
          }
          if (typeof val === "number") {
            return val.toString().includes(searchQuery);
          }
          return false;
        });
      })
      .map((obj) => {
        const {
          exist_updated_at,
          updated_at_temp,
          subscription_temp,
          exist_subscription,
          ...rest
        } = obj;
        return {
          ...rest,
          updated_at: exist_updated_at,
          subscription: exist_subscription,
        };
      });
  };

  const applyFilters = (searchQuery, selectedFilter) => {
    let filteredOrders = deliveryOrderData[currentFilter] || [];

    // Filter based on Order Type
    if (selectedFilter !== "all") {
      filteredOrders = filteredOrders.filter((order) => {
        if (selectedFilter === "buyonce") return !order.subscription_type;
        if (selectedFilter === "subscription") return !!order.subscription_type;
        return order.subscription_type === selectedFilter;
      });
    }

    // Search based on input text
    if (searchQuery.trim() !== "") {
      filteredOrders = searchArrayByValue(
        filteredOrders,
        searchQuery.toLowerCase()
      );
    }

    setAllDeliveryOrder(filteredOrders);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setTimeout(() => {
      applyFilters(value, filterType);
    }, 500);
  };

  const handleFilterChange = (event, newValue) => {
    const selectedValue = newValue?.value || "all";
    setFilterType(selectedValue);
    applyFilters(searchText, selectedValue);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ marginBottom: "1rem" }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            disabled={allDeliveryOrder.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={allDeliveryOrder.length === 0}
          >
            Export to PDF
          </Button>
        </div>
      </GridToolbarContainer>
    );
  }

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Buyonce", value: "buyonce" },
    { label: "Subscription (All)", value: "subscription" },
    { label: "One Time", value: 1 },
    { label: "Weekly", value: 2 },
    { label: "Monthly", value: 3 },
    { label: "Alternative Days", value: 4 },
  ];

  return (
    <div style={{ height: "100%" }}>
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
      <Box sx={{ height: " 100%", width: "100%" }}>
        <Box className="flex items-center flex-wrap justify-between gap-4 w-100 title-menu">
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
            View Orders/Deliveries
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"52%"}
          >
            <TextField
              size="small"
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              onChange={handleSearchChange}
            />
            <Box width="50%">
              <Autocomplete
                margin="normal"
                size="small"
                options={filterOptions}
                disableClearable={filterType === "all"}
                fullWidth
                value={
                  filterOptions.find((opt) => opt.value === filterType) || null
                }
                onChange={handleFilterChange}
                renderInput={(params) => (
                  <TextField {...params} label="Order Type" />
                )}
              />
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Delivery Date"
                value={selectedDate}
                onChange={handleDateChange}
                format="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* Tiles Section */}
        <Box className="title-menu">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Orders"
                count={counts?.totalOrders || 0}
                color={colors.redAccent[500]}
                onClick={() => handleTileClick(FILTERS.ALL)}
                isSelected={currentFilter === FILTERS.ALL}
                isLoading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Assigned Orders"
                count={counts?.assignedOrders || 0}
                color={colors.greenAccent[500]}
                onClick={() => handleTileClick(FILTERS.ASSIGNED)}
                isSelected={currentFilter === FILTERS.ASSIGNED}
                isLoading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Unassigned Orders"
                count={counts?.unassignedOrders || 0}
                color={colors.blueAccent[500]}
                onClick={() => handleTileClick(FILTERS.UNASSIGNED)}
                isSelected={currentFilter === FILTERS.UNASSIGNED}
                isLoading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Orders Delivered"
                count={counts?.deliveredOrders || 0}
                color={colors.greenAccent[500]}
                onClick={() => handleTileClick(FILTERS.DELIVERED)}
                isSelected={currentFilter === FILTERS.DELIVERED}
                isLoading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Orders Undelivered"
                count={counts?.undeliveredOrders || 0}
                color={colors.redAccent[500]}
                onClick={() => handleTileClick(FILTERS.UNDELIVERED)}
                isSelected={currentFilter === FILTERS.UNDELIVERED}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </Box>

        {!isLoading && allDeliveryOrder ? (
          <Box
            className="bg-card text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2"
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
            <DataGrid
              sx={{
                fontSize: "13px",
                "& .MuiDataGrid-row": {
                  maxHeight: "150px !important",
                },
                "& .MuiDataGrid-cell": {
                  maxHeight: "150px !important",
                  whiteSpace: "break-spaces !important",
                },
              }}
              columns={column}
              rows={allDeliveryOrder}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              localeText={{
                noRowsLabel: "No records found",
              }}
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
      <Modal
        open={assingnExecutiveModelOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography
            className=""
            variant="h4"
            component={"h4"}
            fontWeight={600}
            // fontSize={'1rem'}
            lineHeight={"2rem"}
            sx={{
              color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
            }}
          >
            Re-Assign Delivery Executive
          </Typography>
          <Divider style={{ margin: "1rem 0" }} />

          <TextField
            required
            disabled
            fullWidth
            label="Order Number#"
            type="text"
            variant="outlined"
            sx={{ mb: 2 }}
            value={formData?.order_number}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <TextField
            required
            fullWidth
            disabled
            label="Assigned Date"
            type="Date"
            variant="outlined"
            sx={{ mb: 2 }}
            value={formData?.assigned_date}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <FormControl fullWidth sx={{ mb: 2, textAlign: "left" }}>
            <InputLabel id="optional-select-label">Executive</InputLabel>

            <Select
              labelId="optional-select-label"
              value={selectedExecutive}
              label="Executive"
              onChange={(e) => {
                setselectedExecutive(e.target.value);
              }}
            >
              {executiveList.map((item) => (
                <MenuItem key={item.id} value={item}>
                  {`${item.executive_id} - ${item.name}`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText sx={{ color: "red" }}>
              {error ? "choose executive" : ""}
            </FormHelperText>
          </FormControl>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <Button
              onClick={handleClose}
              color="primary"
              variant="contained"
              style={{
                width: "100%",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="secondary"
              variant="contained"
              style={{
                width: "100%",
              }}
            >
              Submit
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
export default ViewOrdersDeliveries;
