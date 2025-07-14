import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import { TextField, Typography, useTheme, Button, Modal, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";

import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import Utils from "../../Global/utils";
import * as CONSTANTS from "../../Common/Constants";
import api from "../../Data/api";
import { GET } from "../../Functions/apiFunction";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assets/a_logo.png";
import { addDays } from "date-fns";
import { DateRangePicker } from "react-date-range";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90vw",
    sm: "fit-content",
    md: "fit-content",
    lg: "fit-content",
    xl: "fit-content",
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 2,
  textAlign: "center",
};

function BuyOnceOrders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [orders, setorders] = useState();
  const [mainproducts, setMainproducts] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [reFetch, setRefectch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isDateRange, setisDateRange] = useState(false);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: new Date(),
      key: "selection",
    },
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dispatch = useDispatch();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const status = (id) => {
    const data = [
      {
        id: 1,
        text: "Confirmed",
      },
      {
        id: 2,
        text: "Canceled",
      },
      {
        id: 0,
        text: "Pending",
      },
    ];
    const ttl = data.filter((dt) => dt.id === id);
    return ttl[0]?.text || "N/A";
  };

  useEffect(() => {
    getOrders();
  }, [token, reFetch, dispatch]);

  const getOrders = async () => {
    try {
      setIsLoading(true);
      let url = `${api}/get_buyonce_order`;

      if (startDate?.trim() && endDate?.trim()) {
        const queryParams = new URLSearchParams({
          startfilterdate: startDate,
          endfilterdate: endDate,
        });
        url += `?${queryParams.toString()}`;
      }

      const products = await GET(token, url);

      if (products?.response === 200) {
        const updatedData = Array.isArray(products.data)
          ? products.data
          : products.data
          ? [products.data]
          : [];
        if(searchValue.trim() !== ""){
          const filteredOrders = searchArrayByValue(updatedData, searchValue);
          setorders(filteredOrders);
        }
        else{
          setorders(updatedData);
        }
        setMainproducts(updatedData);
      } else {
        setorders([]);
        setMainproducts([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setorders([]);
      setMainproducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "ID", width: 120, cellClassName: () => theme.palette.mode === "dark" ? "sticky-col-3" : "sticky-col-1"  },
      { field: "name", headerName: "Customer Name", width: 150, cellClassName: () => theme.palette.mode === "dark" ? "sticky-col-4" : "sticky-col-2" },
      {
        field: "s_phone", headerName: "Phone Number", width: 120,
        renderHeader: () => (
          <Tooltip title="Phone Number" arrow>
            <Typography className="fs-13">
              Phone Number
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "title",
        headerName: "Product",
        width: 180,
        renderHeader: () => (
          <Tooltip title="Product" arrow>
            <Typography className="fs-13">
              Product
            </Typography>
          </Tooltip>
        ),
        valueGetter: (params) =>
          params.row.subscription_type !== null
            ? params.row.title
            : JSON.parse(params.row.product_detail)
              ?.map((product) => product.product_title)
              .join(", "),
      },
      {
        field: "qty", headerName: "Qty", width: 50, sortable: false, renderHeader: () => (
          <Tooltip title="Qty" arrow>
            <Typography className="fs-13">
              Qty
            </Typography>
          </Tooltip>
        ),

      },
      {
        field: "order_amount",
        headerName: "Amount",
        width: 100,
        renderCell: (params) => (
          <p>{params.row?.order_amount?.toFixed(2) || "0.00"}</p>
        ),
        renderHeader: () => (
          <Tooltip title="Amount" arrow>
            <Typography className="fs-13">
              Amount
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "created_at",
        headerName: "Ordered Date",
        width: 100,
        renderHeader: () => (
          <Tooltip title="Ordered Date" arrow>
            <Typography className="fs-13">
              Ordered Date
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) =>
          params.row.created_at
            ? moment.utc(params.row?.created_at).local().format("DD-MM-YYYY")
            : "--",
      },
      {
        field: "delivery_date",
        headerName: "Delivery Date",
        width: 100,
        renderHeader: () => (
          <Tooltip title="Delivery Date" arrow>
            <Typography className="fs-13">
              Delivery Date
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) =>
          params.row.delivery_date
            ? moment.utc(params.row?.delivery_date).local().format("DD-MM-YYYY")
            : "--",
      },
      {
        field: "order_type",
        headerName: "Order Type",
        width: 100,
        renderHeader: () => (
          <Tooltip title="Order Type" arrow>
            <Typography className="fs-13">
              Order Type
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => {
          let orderText = Utils.getOrderType(params.row.order_type);
          return <p>{orderText}</p>;
        },
      },
      {
        field: "status",
        headerName: "Order Status",
        width: 100,
        renderHeader: () => (
          <Tooltip title="Order Status" arrow>
            <Typography className="fs-13">
              Order Status
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => <p>{status(params.row.status)}</p>,
      },
      {
        field: "delivered",
        headerName: "Delivery Status",
        width: 120,
        renderHeader: () => (
          <Tooltip title="Delivery Status" arrow>
            <Typography className="fs-13">
              Delivery Status
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => (
          <p>
            {params.row?.delivered === 0 ? (
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
        field: "pincode", headerName: "Pincode", width: 100,
        renderHeader: () => (
          <Tooltip title="Pincode" arrow>
            <Typography className="fs-13">
              Pincode
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "payment_id", headerName: "Payment ID", width: 150,
        renderHeader: () => (
          <Tooltip title="Payment ID" arrow>
            <Typography className="fs-13">
              Payment ID
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "Action",
        headerName: "Action",
        width: 100,
        renderHeader: () => (
          <Tooltip title="Action" arrow>
            <Typography className="fs-13">
              Action
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(
                `/order/${params.row.id}/?subscription_type=${params.row.subscription_type !== null
                }`
              );
            }}
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        ),
      },
    ],
    [navigate, theme.palette.mode]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "ID",
      "Customer Name",
      "Phone Number",
      "Product",
      "Quantity",
      "Amount",
      "Ordered Date",
      "Delivery Date",
      "Order Type",
      "Order Status",
      "Delivery Status",
      "Pincode",
      "Payment ID",
      "Last Update",
    ];

    const reversedReports = [...orders].reverse();

    const csvData = reversedReports.map((row, index) => [
      index + 1,
      row.order_number,
      row.name,
      row.s_phone,
      row.subscription_type !== null
        ? row.title
        : JSON.parse(row.product_detail)
          ?.map((product) => product.product_title)
          .join(", "),
      row.qty,
      row?.order_amount?.toFixed(2) || "0.00",
      moment.utc(row?.created_at).local().format("DD-MM-YYYY"),
      moment.utc(row?.delivery_date).local().format("DD-MM-YYYY"),
      Utils.getOrderType(row.order_type),
      status(row.status),
      row?.delivered === 0 ? "Not Delivered" : "Delivered",
      row.pincode,
      row.payment_id,
      moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
    ]);

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "BuyOnce Orders");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `BuyOnce Orders_${moment
        .utc(new Date())
        .local()
        .format("DD-MM-YYYY")}.csv`
    );
  };

  const exportToPDF = () => {
    // const dateRange = `Date Range: ${startDate} to ${endDate}`;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    });

    // Add the header text
    doc.setFontSize(18);
    const headerText = "BuyOnce Orders";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerX, 20);

    // Load the logo and add it to the document
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

      // Set smaller font size for the date range text below header
      doc.setFontSize(12);

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "ID", dataKey: "order_ID" },
        { header: "Customer Name", dataKey: "name" },
        { header: "Phone Number", dataKey: "phe_no" },
        { header: "Product", dataKey: "product" },
        { header: "Quantity", dataKey: "qty" },
        { header: "Amount", dataKey: "amt" },
        { header: "Ordered Date", dataKey: "order_date" },
        { header: "Delivery Date", dataKey: "delivery_date" },
        { header: "Order Type", dataKey: "order_type" },
        { header: "Order Status", dataKey: "order_status" },
        { header: "Delivery Status", dataKey: "status" },
        { header: "Pincode", dataKey: "pincode" },
        { header: "Payment ID", dataKey: "payment_id" },
        { header: "Last Update", dataKey: "last_update" },
      ];

      const reversedReports = [...orders].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports.map((row, index) => ({
        sno: index + 1,
        order_ID: row.order_number,
        name: row.name,
        phe_no: row.s_phone,
        product:
          row.subscription_type !== null
            ? row.title
            : JSON.parse(row.product_detail)
              ?.map((product) => product.product_title)
              .join(", "),
        qty: row.qty,
        amt: row?.order_amount?.toFixed(2) || "0.00",
        order_date: moment.utc(row?.created_at).local().format("DD-MM-YYYY"),
        delivery_date: moment
          .utc(row?.delivery_date)
          .local()
          .format("DD-MM-YYYY"),
        order_type: Utils.getOrderType(row.order_type),
        order_status: status(row.status),
        status: row?.delivered === 0 ? "Not Delivered" : "Delivered",
        pincode: row.pincode,
        payment_id: row.payment_id,
        last_update: moment
          .utc(row.updated_at)
          .local()
          .format("DD-MM-YYYY HH:mm:ss"),
      }));

      const tableStartY = 10 + logoHeight + 6;

      // Your table configuration remains unchanged
      doc.addFont(
        "meera-regular-unicode-font-normal.ttf",
        "meera-regular-unicode-font-normal",
        "normal"
      );
      doc.setFont("meera-regular-unicode-font-normal");
      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => Object.values(row)),
        startY: tableStartY,
        margin: { left: 20 },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
          textColor: [255, 255, 255], // White text
          fontSize: 10, // Reduced font size for header
          lineWidth: 0.2, // Set border thickness for header
          halign: "center", // Center-align the table headers
        },
        bodyStyles: {
          font: "meera-regular-unicode-font-normal",
          lineWidth: 0.2, // Set border thickness for body cells
          lineColor: [0, 0, 0], // Black border color
        },
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellPadding: 3, // Add padding to cells for better appearance
          lineWidth: 0.2, // General border thickness
          lineColor: [0, 0, 0], // General border color
        },
        showHead: "firstPage",
      });

      // After the table is completely generated, add the page numbers
      const totalPages = doc.internal.getNumberOfPages(); // Get total pages
      doc.setFontSize(9);
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Set the page context to the current page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`; // Format "Page X/Y"
        const marginRight = 15;
        const marginBottom = i === 1 ? 7 : 10;

        // Add page number at the bottom-right of the page
        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - marginBottom
        );
      }

      // Save the PDF
      doc.save(
        `BuyOnce Orders_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  function searchArrayByValue(arr, searchQuery) {
    return arr
      .map((obj) => ({
        ...obj,
        start_date_temp: new Date(obj.start_date)
          .toISOString()
          .split("T")[0]
          .split("-")
          .reverse()
          .join("-"),
        exist_order_type: obj.order_type,
        order_type_temp:
          obj.order_type === 1
            ? CONSTANTS.PAYMENT_OPTIONS.PREPAID
            : obj.order_type === 2
            ? CONSTANTS.PAYMENT_OPTIONS.POSTPAID
            : obj.order_type === 3
            ? CONSTANTS.PAYMENT_OPTIONS.PAYNOW
            : obj.order_type === 4
            ? CONSTANTS.PAYMENT_OPTIONS.PAYLATER
            : "",
        exist_order_status: obj.order_status,
        order_status_temp:
          obj.order_status === 0
            ? CONSTANTS.STATUSES.ACTIVE
            : obj.order_status === 1
            ? CONSTANTS.STATUSES.PAUSED
            : CONSTANTS.NOT_APPLICABLE,
        exist_status: obj.status,
        status_temp:
          obj.status === 1
            ? CONSTANTS.ORDER_STATUSES.CONFIRMED
            : obj.status === 2
            ? CONSTANTS.ORDER_STATUSES.CANCELLED
            : CONSTANTS.ORDER_STATUSES.PENDING,
        exist_subscription_type: obj.subscription_type,
        subscription_type_temp:
          obj.subscription_type === 1
            ? CONSTANTS.ORDER_TYPES.ONE_TIME_ORDER
            : obj.subscription_type === 2
            ? CONSTANTS.ORDER_TYPES.WEEKLY
            : obj.subscription_type === 3
            ? CONSTANTS.ORDER_TYPES.MONTHLY
            : obj.subscription_type === 4
            ? CONSTANTS.ORDER_TYPES.ALTERNATIVE_DAYS
            : CONSTANTS.NOT_APPLICABLE,
        exist_start_date: obj.start_date,
        updated_at_temp: moment
          .utc(obj.updated_at)
          .local()
          .format("DD-MM-YYYY HH:mm:ss"),
        exist_update_at: obj.updated_at,
      }))
      .filter((obj) => {
        return Object.values(obj).some((val) => {
          if (typeof val === "string") {
            return val
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          }
          if (typeof val === "number") {
            return val.toString().includes(searchQuery);
          }
          return false;
        });
      })
      .map(
        ({
          start_date_temp,
          exist_order_type,
          order_type_temp,
          exist_order_status,
          order_status_temp,
          exist_status,
          status_temp,
          exist_subscription_type,
          subscription_type_temp,
          exist_start_date,
          updated_at_temp,
          exist_update_at,
          ...rest
        }) => ({
          ...rest,
          order_type: exist_order_type,
          start_date: exist_start_date,
          updated_at: exist_update_at,
          status: exist_status,
          order_status: exist_order_status,
          subscription_type: exist_subscription_type,
        })
      );
  }

  const handleSearchChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchValue(value);
  
    setTimeout(() => {
      const filteredOrders = searchArrayByValue(mainproducts, value);
      setorders(filteredOrders);
    }, 500);
  };
  
  // custom toolbar
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
            disabled={orders.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={orders.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/neworder");
          }}
        >
          {" "}
          Add New
          <div class="icon">
            <i class="fa-regular fa-plus"></i>
          </div>
        </button>
      </GridToolbarContainer>
    );
  }

  const handleReset = () => {
    setisDateRange(false);
    setStartDate();
    setEndDate();
    setdateRange([
      {
        endDate: new Date(),
        startDate: new Date(),
        key: "selection",
      },
    ]);
    setRefectch((prev) => !prev);
  };

  return (
    <div style={{ height: "100%" }}>
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
            Manage Buy Once Orders
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"52%"}
          >
            <TextField
              size="small"
              sx={{ width: { xs: "80%", sm: "300px", md: "500px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              id="outlined-basic"
              fullWidth
              label="Delivery Date Range"
              variant="outlined"
              autoComplete="off"
              size="small"
              color="secondary"
              onKeyDown={() => {
                return false;
              }}
              onClick={() => {
                handleOpen();
              }}
              value={startDate && endDate ? `${startDate} - ${endDate}` : ""}
            />
            <Button
              variant="contained"
              sx={{
                fontWeight: "700",
                color: "fff",
              }}
              color="secondary"
              disabled={!isDateRange}
              onClick={() => {
                getOrders();
              }}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              sx={{ fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {!isLoading && orders ? (
          <Box
            className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 relative ${theme.palette.mode === "dark" ? "bg-darkcard" : "bg-card"
              }`}
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
                backgroundColor:
                  theme.palette.mode === "dark" ? "#334155" : "#0e0e23",
                borderBottom: "none",
                color: "#f5f5f5",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[0],
                borderBottom: "#000",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor:
                  theme.palette.mode === "dark" ? "#334155" : "#0e0e23",
                color: "#f5f5f5",
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
              sx={{ fontSize: "13px" }}
              columns={column}
              rows={orders}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.id}
              localeText={{
                noRowsLabel: "No records found",
              }}
            />

            <span className={theme.palette.mode === "dark" ? "idColumn addcolor" : "idColumn"}><Tooltip title="ID" arrow>ID</Tooltip>
              <span class="MuiDataGrid-columnSeparator MuiDataGrid-columnSeparator--sideRight" style={{ minHeight: '56px', opacity: '1', display: 'flex', alignItems: 'center' }}>
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiDataGrid-iconSeparator css-bac4tg-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SeparatorIcon"><path d="M11 19V5h2v14z"></path></svg>
              </span>
            </span>

            

              <span className={theme.palette.mode === "dark" ? "nameColumn addcolor" : "nameColumn"}><Tooltip title="Name" arrow>Name</Tooltip>
                <span class="MuiDataGrid-columnSeparator MuiDataGrid-columnSeparator--sideRight" style={{ minHeight: '56px', opacity: '1', display: 'flex', alignItems: 'center' }}>
                  <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiDataGrid-iconSeparator css-bac4tg-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SeparatorIcon"><path d="M11 19V5h2v14z"></path></svg>
                </span>
              </span>
            
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="subtitle1" fontWeight="600" mb={2}>
            Delivery Date Range
          </Typography>
          <DateRangePicker
            onChange={(item) => {
              setisDateRange(true);
              setStartDate(
                moment(item.selection.startDate).format("DD-MM-YYYY")
              );
              setEndDate(moment(item.selection.endDate).format("DD-MM-YYYY"));
              setdateRange([item.selection]);
            }}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={dateRange}
            direction="vertical"
            scroll={{ enabled: true }}
          />
          <Box mt={5}>
            {" "}
            <Button
              fullWidth
              variant="contained"
              sx={{ height: "30px", fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={() => {
                if (!startDate) {
                  setisDateRange(true);
                  setStartDate(
                    moment(dateRange[0].startDate).format("DD-MM-YYYY")
                  );
                  setEndDate(moment(dateRange[0].endDate).format("DD-MM-YYYY"));
                }
                handleClose();
              }}
            >
              Set
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default BuyOnceOrders;
