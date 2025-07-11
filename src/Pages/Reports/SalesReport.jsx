import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  useTheme,
  Modal,
  Button,
  Backdrop,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import moment from "moment/moment";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { margin, Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { tokens } from "../../theme";
import { DateRangePicker } from "react-date-range";
import "jspdf-autotable";
import { addDays } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";
import LoadingSkeleton from "../../Components/LoadingSkeleton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

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

function SalesReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [orders, setorders] = useState();
  const [MainOrders, setMainOrders] = useState();
  const [pageSize, setpageSize] = useState(20);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [backdropOpen, setbackdropOpen] = useState(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [dataSet, setdataSet] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [subDeliveryCharge, setSubDeliveryCharge] = useState(0);

  // const date = new Date();
  // const formattedDate = `${String(date.getDate()).padStart(2, "0")}_${String(
  //   date.getMonth() + 1
  // ).padStart(2, "0")}_${date.getFullYear()}`;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingIds = [17];
        const url = `${api}/get_web_app_settings_by_ids/${JSON.stringify(
          settingIds
        )}`;
        const result = await GET(token, url);
        if (result.response === 200) {
          const settingsMap = result.data.reduce((acc, setting) => {
            acc[setting.id] = parseFloat(setting.value);
            return acc;
          }, {});
          setSubDeliveryCharge(settingsMap[17] || 0);
        } else {
          throw new Error(`Unexpected response code: ${result.response}`);
        }
      } catch (error) {
        console.error(
          `Failed to fetch Delivery charge Details: ${error.message}`
        );
      }
    };

    // Get orders
    const fetchData = async () => {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const url = `${api}/get_sales_report/${formattedDate}`;
      const orders = await GET(token, url);
      setorders(orders.data);
      setMainOrders(orders.data);
      setDataRows(orders.data);
    };

    fetchSettings();
    fetchData();
  }, [token]);

  const calculateAmount = (filterFn) => {
    if (!dataRows || dataRows.length === 0) return 0;

    return dataRows.reduce((sum, row) => {
      if (filterFn && !filterFn(row)) return sum;

      const updatedQty = Utils.getUpdatedQuantity(
        row.qty,
        row.subscription_type,
        selectedDate,
        row.selected_days_for_weekly
      );

      // refund amount set to 0 to exclude refund
      const rawAmount = Utils.salesAmount(
        row.order_amount,
        row.refund_amount,
        updatedQty,
        row.price,
        row.tax,
        row.subscription_type,
        subDeliveryCharge
      );

      const parsedAmount = parseFloat(rawAmount);
      if (isNaN(parsedAmount)) return sum;

      return sum + parseFloat(parsedAmount.toFixed(2));
    }, 0);
  };

  const prepaid = useMemo(
    () => calculateAmount((row) => row.order_type === 1),
    [dataRows]
  );

  const payNow = useMemo(
    () => calculateAmount((row) => row.order_type === 3),
    [dataRows]
  );

  const refund = useMemo(() => {
    if (!dataRows || dataRows.length === 0) return 0;

    return dataRows.reduce((sum, row) => {
      const refundAmount = parseFloat(row.refund_amount);

      if (isNaN(refundAmount)) return sum;

      return sum + parseFloat((Math.abs(refundAmount)).toFixed(2));
    }, 0);
  }, [dataRows]);

  const totalAmount = useMemo(() => {
    if (!dataRows || dataRows.length === 0) return 0;

    return dataRows.reduce((sum, row) => {
      const updatedQty = Utils.getUpdatedQuantity(
        row.qty,
        row.subscription_type,
        selectedDate,
        row.selected_days_for_weekly
      );

      const rawAmount = Utils.salesAmount(
        row.order_amount,
        row.refund_amount,
        updatedQty,
        row.price,
        row.tax,
        row.subscription_type,
        subDeliveryCharge
      );

      if (rawAmount === null || isNaN(rawAmount)) return sum;

      // Round each item before adding
      const amount = parseFloat(parseFloat(rawAmount).toFixed(2));
      return sum + amount;
    }, 0);
  }, [dataRows]);

  const column = useMemo(() => [
    { field: "order_number", headerName: "Order ID", width: 120 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "phone", headerName: "Phone", width: 120 },
    {
      field: "title",
      headerName: "Products",
      width: 220,
      renderCell: (params) => {
        const title =
          params.row.subscription_type !== null
            ? `${params.row.title} (Qty ${params.row.qty})`
            : JSON.parse(params.row.product_detail)
              ?.map(
                (product) => `${product.product_title} (Qty ${product.qty})`
              )
              .join(", ");

        return (
          <Tooltip title={title} arrow>
            <Typography
              variant="body2"
              noWrap
              style={{
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "subscription_type",
      headerName: "Subscription Type",
      width: 130,
      renderCell: (params) => {
        let subscriptionText = Utils.getSubscriptionType(
          params.row.subscription_type
        );
        return (
          <p>{subscriptionText === "N/A" ? "Buyonce" : subscriptionText}</p>
        );
      },
    },
    {
      field: "order_type",
      headerName: "Order Type",
      width: 120,
      renderCell: (params) => {
        let orderText = Utils.getOrderType(params.row.order_type);
        return <p>{orderText}</p>;
      },
    },
    // {
    //   field: "created_at",
    //   headerName: "Created Date",
    //   width: 140,
    //   renderCell: (params) =>
    //     moment.utc(params.row.created_at).local().format("DD-MM-YYYY"),
    // },
    {
      field: "qty",
      headerName: "Qty",
      width: 80,
      renderCell: (params) => {
        let quantity = params.row.qty;
        let subscriptionType = params.row.subscription_type;
        let selectedDays = params.row.selected_days_for_weekly;
        return Utils.getUpdatedQuantity(
          quantity,
          subscriptionType,
          selectedDate,
          selectedDays
        );
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 100,
      renderCell: (params) => {
        const {
          order_amount,
          refund_amount,
          price,
          tax,
          subscription_type,
          qty,
          selected_days_for_weekly,
        } = params.row;

        const updatedQty = Utils.getUpdatedQuantity(
          qty,
          subscription_type,
          selectedDate,
          selected_days_for_weekly
        );

        const orderAmount = Utils.salesAmount(
          order_amount,
          refund_amount,
          updatedQty,
          price,
          tax,
          subscription_type,
          subDeliveryCharge
        );

        // Display "Invalid Order Amount" if the function returned null
        if (orderAmount === null) {
          return <p>Invalid Order Amount</p>;
        }

        const style = { color: orderAmount < 0 ? "red" : "inherit" };

        // Display the calculated amount, formatted to two decimal places
        return <p style={style}>{orderAmount}</p>;
      },
    },
    {
      field: "order_amount",
      headerName: "Order Amount",
      width: 100,
      renderCell: (params) => {
        const orderAmount = Utils.calculateOrderAmount(
          params.row.order_amount,
          params.row.refund_amount
        );

        // Display "Invalid Order Amount" if the function returned null
        if (orderAmount === null) {
          return <p>Invalid Order Amount</p>;
        }

        const style = { color: orderAmount < 0 ? "red" : "inherit" };

        // Display the calculated amount, formatted to two decimal places
        return <p style={style}>{orderAmount}</p>;
      },
    },
  ]);

  const exportToCSV = () => {
    const dateRange = selectedDate
      ? `Date: ${format(new Date(selectedDate), "dd/MM/yyyy")}`
      : null;

    // Prepare the headers and data
    const headers = [
      "S.No",
      "Order ID",
      "Name",
      "Phone",
      "Products",
      "Subscription Type",
      "Order Type",
      //"Created Date",
      "Qty",
      "Amount",
      "Order Amount",
    ];

    const reversedOrders = [...orders].reverse();

    const csvData = reversedOrders
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((row, index) => {
        const rowCopy = { ...row };

        // Update the qty property on the copy, not the original row
        rowCopy.qty = Utils.getUpdatedTotalQuantity(
          row.qty,
          row.subscription_type
        );

        const subscriptionType = Utils.getSubscriptionType(
          row.subscription_type
        );

        return [
          index + 1,
          row.order_number,
          row.name,
          row.phone,
          row.subscription_type !== null
            ? `${row.title} (Qty ${row.qty})`
            : JSON.parse(row.product_detail)
              ?.map(
                (product) => `${product.product_title} (Qty ${product.qty})`
              )
              .join(", "),
          subscriptionType === "N/A" ? "Buyonce" : subscriptionType,
          Utils.getOrderType(row.order_type),
          // moment.utc(row.created_at).local().format("DD-MM-YYYY"),
          Utils.getUpdatedQuantity(
            row.qty,
            row.subscription_type,
            selectedDate,
            row.selected_days_for_weekly
          ),
          Utils.salesAmount(
            row.order_amount,
            row.refund_amount,
            Utils.getUpdatedQuantity(
              row.qty,
              row.subscription_type,
              selectedDate,
              row.selected_days_for_weekly
            ),
            row.price,
            row.tax,
            row.subscription_type,
            subDeliveryCharge
          ),
          Utils.calculateOrderAmount(row.order_amount, row.refund_amount),
        ];
      });

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [
      ...(selectedDate ? [[dateRange], []] : []), // Add date range and empty row if available
      headers,
      ...csvData,
      [],
      ["", "", "", "", "", "", "", "Prepaid", prepaid.toFixed(2)],
      ["", "", "", "", "", "", "", "PayNow", payNow.toFixed(2)],
      ["", "", "", "", "", "", "", "Refund", refund.toFixed(2)],
      ["", "", "", "", "", "", "", "Total Amount", totalAmount.toFixed(2)], // "" - empty other index
    ];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Sales_Report_${format(new Date(selectedDate), "dd/MM/yyyy")}.csv`
    );
  };

  const exportToPDF = () => {
    const dateRange = `Date : ${format(new Date(selectedDate), "dd/MM/yyyy")}`;
    // const doc = new jsPDF();

    // Create a jsPDF instance with A3 landscape orientation for more width
    const doc = new jsPDF({
      orientation: "landscape", // Set to landscape to increase width
      unit: "mm", // Measurement unit in millimeters
      format: "a4", // Use A3 size for wider layout
    });

    // Set header font size and center-align it
    doc.setFontSize(18);
    const headerText = "Sales Report";
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
      // Set smaller font size for the date range text below header
      doc.setFontSize(12);
      if (selectedDate) {
        doc.text(dateRange, 20, 40);
      }

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "Order ID", dataKey: "order_number" },
        { header: "Name", dataKey: "name" },
        { header: "Phone", dataKey: "phone" },
        { header: "Products", dataKey: "title" },
        { header: "Subscription Type", dataKey: "subscription_type" },
        { header: "Order Type", dataKey: "order_type" },
        // { header: "Created Date", dataKey: "created_at" },
        { header: "Qty", dataKey: "qty" },
        { header: "Amount", dataKey: "amount" },
        { header: "Order Amount", dataKey: "order_amount" },
      ];

      const reversedOrders = [...orders].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedOrders
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((row, index) => ({
          sno: index + 1,
          order_number: row.order_number,
          name: row.name,
          phone: row.phone,
          title:
            row.subscription_type !== null
              ? `${row.title} (Qty ${row.qty})`
              : JSON.parse(row.product_detail)
                ?.map(
                  (product) => `${product.product_title} (Qty ${product.qty})`
                )
                .join(", "),
          subscription_type:
            Utils.getSubscriptionType(row.subscription_type) === "N/A"
              ? "Buyonce"
              : Utils.getSubscriptionType(row.subscription_type),
          order_type: Utils.getOrderType(row.order_type),
          // created_at: moment.utc(row.created_at).local().format("DD-MM-YYYY"),
          qty: Utils.getUpdatedQuantity(
            row.qty,
            row.subscription_type,
            selectedDate,
            row.selected_days_for_weekly
          ),
          amount: Utils.salesAmount(
            row.order_amount,
            row.refund_amount,
            Utils.getUpdatedQuantity(
              row.qty,
              row.subscription_type,
              selectedDate,
              row.selected_days_for_weekly
            ),
            row.price,
            row.tax,
            row.subscription_type,
            subDeliveryCharge
          ),
          order_amount: Utils.calculateOrderAmount(
            row.order_amount,
            row.refund_amount
          ),
        }));

      const tableStartY = 20 + logoHeight + 6;
      doc.addFont(
        "meera-regular-unicode-font-normal.ttf",
        "meera-regular-unicode-font-normal",
        "normal"
      );
      doc.setFont("meera-regular-unicode-font-normal");
      // Add the table with column width adjustment and long text wrapping options
      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => Object.values(row)),
        startY: tableStartY,
        margin: { left: 20 },
        rowPageBreak: 'avoid',
        halign: "center",
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellWidth: "auto",
        },
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
        columnStyles: {
          4: { cellWidth: 40 },
          // 10: { cellWidth: 25 },
        },
        showHead: "firstPage",
        didDrawCell: (data) => {
          if (
            data.column.dataKey === "title" &&
            data.cell.text[0].length > 15
          ) {
            doc.setFontSize(8); // Adjust font size for longer text in cells
          }
        },
      });

      const finalY = doc.lastAutoTable.finalY || tableStartY + 10;
      doc.autoTable({
        startY: finalY + 10,
        body: [
          [
            {
              content: "Prepaid",
              colSpan: tableColumn.length - 1,
              styles: { halign: "right", fontStyle: "bold" },
            },
            { content: prepaid.toFixed(2), styles: { fontStyle: "bold" } },
          ],
          [
            {
              content: "PayNow",
              colSpan: tableColumn.length - 1,
              styles: { halign: "right", fontStyle: "bold" },
            },
            { content: payNow.toFixed(2), styles: { fontStyle: "bold" } },
          ],
          [
            {
              content: "Refund",
              colSpan: tableColumn.length - 1,
              styles: { halign: "right", fontStyle: "bold" },
            },
            { content: refund.toFixed(2), styles: { fontStyle: "bold" } },
          ],
          [
            {
              content: "Total Amount",
              colSpan: tableColumn.length - 1,
              styles: { halign: "right", fontStyle: "bold" },
            },
            { content: totalAmount.toFixed(2), styles: { fontStyle: "bold" } },
          ],
        ],
        margin: { left: 20 },
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: "right",
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
        },
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

      // Save the PDF with a date-based file name
      doc.save(
        `Sales_Report_${format(new Date(selectedDate), "dd/MM/yyyy")}.pdf`
      );
    });
  };

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    setMainOrders(report.data);

    let array = getDateValueArray(report.data);
    const data_Set = () => {
      let arr = [];
      for (let i = 0; i < array.length; i++) {
        let data = {
          date: array[i].date,
          value: array[i].values.length,
        };
        arr.push(data);
      }
      setdataSet(arr);
    };

    data_Set();

    let filterdData = report.data;
    if (searchText.trim() !== "") {
      filterdData = searchArrayByValue(report.data, searchText.toLowerCase());
    }
    setorders(filterdData);
    setDataRows(filterdData);
  };

  function getDateValueArray(inputArray) {
    // Create an object to store the unique dates and their values
    const dateValueObj = inputArray.reduce((acc, curr) => {
      // Get the current date from the input array item
      const currDate = curr.date;

      // If the date is not already in the accumulator object, add it
      if (!acc[currDate]) {
        acc[currDate] = [];
      }

      // Add the current item's value to the date's array in the accumulator object
      acc[currDate].push(1);

      return acc;
    }, {});

    // Convert the accumulator object to an array
    const dateValueArray = Object.entries(dateValueObj).map(
      ([date, values]) => {
        return { date, values };
      }
    );

    return dateValueArray;
  }

  const handleDateChange = (newValue) => {
    if (newValue) {
      setSelectedDate(newValue);
    }
  };

  function searchArrayByValue(arr, searchQuery) {
    return arr
      .map((obj) => ({
        ...obj,
        created_at_temp: obj.created_at
          .split(" ")[0]
          .split("-")
          .reverse()
          .join("-"),
        exist_created_at: obj.created_at,
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
      }))
      .filter((obj) => {
        return Object.values(obj).some((val) => {
          if (typeof val === "string") {
            return val.toLowerCase().includes(searchQuery.toLowerCase());
          }
          if (typeof val === "number") {
            return val.toString().includes(searchQuery);
          }
          return false;
        });
      })
      .map(
        ({
          exist_created_at,
          created_at_temp,
          exist_order_type,
          order_type_temp,
          ...rest
        }) => ({
          ...rest,
          created_at: exist_created_at,
          order_type: exist_order_type,
        })
      );
  }

  const handleSearchChange = (e) => {
    e.preventDefault();
    const query = e.target.value;
    setSearchText(query);
    setTimeout(() => {
      const result = searchArrayByValue(MainOrders, query.toLowerCase());
      setorders(result);
      setDataRows(result);
    }, 500);
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
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box display="flex" gap={2} alignItems="center">
                <DatePicker
                  label="select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="dd/MM/yyyy"
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    const formattedDate = format(selectedDate, "yyyy-MM-dd");
                    const url = `${api}/get_sales_report/${formattedDate}`;
                    filter(url);
                  }}
                  disabled={!selectedDate}
                >
                  Submit
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSelectedDate(today);
                    const formattedDate = format(today, "yyyy-MM-dd");
                    filter(`${api}/get_sales_report/${formattedDate}`);
                  }}
                  disabled={!selectedDate}
                >
                  Reset
                </Button>
              </Box>
            </LocalizationProvider>
          </Box>

          <Box sx={{ display: "flex", gap: "15px" }}>
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
          </Box>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            padding: "1rem 0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3.5rem",
              alignItems: "center",
            }}
          >
            {[
              { label: "Prepaid", value: prepaid },
              { label: "PayNow", value: payNow },
              { label: "Refund", value: refund },
              { label: "Total Amount", value: totalAmount },
            ].map((item) => (
              <Typography
                key={item.label}
                variant="h2"
                component="h2"
                fontWeight={600}
                fontSize="1.5rem"
                lineHeight="2rem"
                sx={{
                  color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                {item.label} : ₹{item.value.toFixed(2)}
              </Typography>
            ))}
          </Box>
        </div>
      </GridToolbarContainer>
    );
  }
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
            Sales Report
          </Typography>

          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"32.33%"}
          >
            <TextField
              size="small"
              sx={{ width: { xs: "80%", sm: "300px", md: "500px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              onChange={handleSearchChange}
            />
          </Box>
        </Box>
        {orders ? (
          <Box
            className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 ${theme.palette.mode === "dark" ? "bg-darkcard" : "bg-card"
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
              localeText={{
                noRowsLabel: "No records found",
              }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.unique_id} // Ensure the unique ID for rows
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={5} height={30} />
        )}
      </Box>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 5 }}
        open={backdropOpen}
        onClick={handleBackDropClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default SalesReport;
