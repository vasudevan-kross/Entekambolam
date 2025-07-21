import React, { useEffect, useMemo, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import {
  Backdrop,
  Button,
  CircularProgress,
  Divider,
  Modal,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import { DateRangePicker } from "react-date-range";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../../Functions/apiFunction";
import api from "../../Data/api";
import "../../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import "jspdf-autotable";
import { addDays } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";
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

function SubscriptionsReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reports, setreports] = useState();
  const [mainReports, setMainReports] = useState();
  const [pageSize, setpageSize] = useState(100);

  const [startDate, setstartDate] = useState();
  const [endDate, setendDate] = useState();
  const [backdropOpen, setbackdropOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [isDateRange, setisDateRange] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [memoDate, setmemoDate] = useState(
    moment(Date.now()).format("DD-MM-YYYY")
  );
  const [dataSet, setdataSet] = useState([]);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: addDays(new Date(), -7),
      key: "selection",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  // const date = new Date();
  // const formattedDate = `${String(date.getDate()).padStart(2, "0")}_${String(
  //   date.getMonth() + 1
  // ).padStart(2, "0")}_${date.getFullYear()}`;

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [selection, setSelection] = useState("Subscriptions Report");
  const { toDate, fromDate } = Utils.getDateRange();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let url = "";
        if (selection === "Subscriptions Report") {
          url = `${api}/get_subscriptions_report`;
        } else {
          url = `${api}/get_subscriber_report`;
        }

        const report = await GET(token, url);

        if (!report || !report.data) {
          throw new Error("Invalid response from server");
        }

        if (searchValue.trim() !== "") {
          const result = searchArrayByValue(report.data, searchValue);
          setreports(result);
        } else {
          setreports(report.data);
        }

        setMainReports(report.data);
        setstartDate(fromDate);
        setendDate(toDate);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, selection]);

  const column = useMemo(() => {
    let columns = [];

    if (selection === "Subscriptions Report") {
      columns = [
        { field: "order_number", headerName: "Order ID #", width: 120 },
        { field: "name", headerName: "Customer Name", width: 150 },
        { field: "s_phone", headerName: "Phone Number", width: 120 },
        { field: "title", headerName: "Products", width: 220 },
        {
          field: "qty",
          headerName: "Qty",
          width: 80,
          renderCell: (params) => {
            let quantity = params.row.qty;
            let subscriptionType = params.row.subscription_type;

            return Utils.getUpdatedTotalQuantity(quantity, subscriptionType);
          },
        },
        {
          field: "order_amount",
          headerName: "Order Amount",
          width: 100,
          renderCell: (params) => (
            <p>{params.row.order_amount?.toFixed(2) ?? "0.00"}</p>
          ),
        },
        {
          field: "created_at",
          headerName: "Ordered Date",
          width: 100,
          renderCell: (params) =>
            params.row.created_at
              ? moment.utc(params.row?.created_at).local().format("DD-MM-YYYY")
              : "--",
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
        {
          field: "order_status",
          headerName: "Subscription Status",
          width: 130,
          renderCell: (params) =>
            params.row.subscription_type !== null ? (
              <p>{params.row.order_status === 0 ? "Active" : "Paused"}</p>
            ) : (
              <p>{params.row.order_status === 0 ? "Active" : "N/A"}</p>
            ),
        },
        {
          field: "subscription_type",
          headerName: "Subscription Type",
          width: 130,
          renderCell: (params) => {
            let subscriptionText = Utils.getSubscriptionType(
              params.row.subscription_type
            );
            return <p>{subscriptionText}</p>;
          },
        },
        {
          field: "start_date",
          headerName: "Start Date",
          width: 140,
          renderCell: (params) =>
            moment.utc(params.row.start_date).local().format("DD-MM-YYYY"),
        },
        {
          field: "total_deliveries",
          headerName: "Total No. of Deliveries",
          width: 100,
        },
        {
          field: "deliveries_left",
          headerName: "No. of Deliveries Left",
          width: 100,
        },
        {
          field: "delivered",
          headerName: "No. of Deliveries Completed",
          width: 100,
        },
        {
          field: "executive_name",
          headerName: "Assigned to Delivery Executive",
          width: 200,
        },
        { field: "pincode", headerName: "Pincode", width: 140 },
        { field: "payment_id", headerName: "Transaction ID", width: 150 },
        {
          field: "updated_at",
          headerName: "Last Update",
          width: 220,
          renderCell: (params) =>
            moment
              .utc(params.row.updated_at)
              .local()
              .format("DD-MM-YYYY HH:mm:ss"),
        },
      ];
    } else {
      columns = [
        { field: "user_id", headerName: "Customer ID", width: 140 },
        { field: "name", headerName: "Name", width: 150 },
        {
          field: "email", headerName: "Email", width: 180,
          renderCell: (params) => {
            return <p>{params.value ?? "N/A"}</p>;
          }
        },
        { field: "phone", headerName: "Phone", width: 160 },
        {
          field: "total_order_amount",
          headerName: "Total Order Amount",
          width: 180,
          renderCell: (params) => {
            const amount = parseFloat(params?.row?.total_order_amount);
            return !isNaN(amount) ? amount.toFixed(2) : "0.00";
          }
        },
        {
          field: "wallet_amount",
          headerName: "Wallet Amount",
          width: 180,
          renderCell: (params) => {
            const amount = parseFloat(params?.row?.wallet_amount);
            return !isNaN(amount) ? amount.toFixed(2) : "0.00";
          }
        }
      ];
    }

    return columns;
  }, [memoDate, selection]);

  const exportToCSV = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;
    let headers = [];
    let csvData = [];

    // Prepare the headers and data
    if (selection === "Subscriptions Report") {
      headers = [
        "S.No",
        "Order ID #",
        "Customer Name",
        "Phone Number",
        "Products",
        "Qty",
        "Order Amount",
        "Ordered Date",
        "Order Type",
        "Subscription Status",
        "Subscription Type",
        "Start Date",
        "Total No. of Deliveries",
        "No. of Deliveries Left",
        "No. of Deliveries completed",
        "Assigned to Delivery Executive",
        "Pincode",
        "Transaction ID",
        "Last Update",
      ];

      const reversedReports = [...reports].reverse();

      csvData = reversedReports
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((row, index) => {
          const rowCopy = { ...row };

          // Update the qty property on the copy, not the original row
          rowCopy.qty = Utils.getUpdatedTotalQuantity(
            row.qty,
            row.subscription_type
          );
          return [
            index + 1,
            row.order_number,
            row.name,
            row.s_phone,
            row.title,
            rowCopy.qty,
            row.order_amount ?? 0,
            row.created_at
              ? moment.utc(row?.created_at).local().format("DD-MM-YYYY")
              : "--",
            Utils.getOrderType(row.order_type),
            row.subscription_type !== null
              ? row.order_status === 0
                ? "Active"
                : "Paused"
              : row.order_status === 0
                ? "Active"
                : "N/A",
            Utils.getSubscriptionType(row.subscription_type),
            moment.utc(row.start_date).local().format("DD-MM-YYYY"),
            row.total_deliveries,
            row.deliveries_left,
            row.delivered,
            row.executive_name,
            row.pincode,
            row.payment_id,
            moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
          ];
        });
    } else {
      headers = [
        "S.No",
        "Customer ID",
        "Name",
        "Email",
        "Phone",
        "Total Order Amount",
        "Wallet Amount",
      ];
      const reversedReports = [...reports].reverse();

      csvData = reversedReports.map((row, index) => [
        index + 1,
        row.user_id,
        row.name,
        row.email ?? "N/A",
        row.phone,
        row?.total_order_amount.toFixed(2),
        row?.wallet_amount.toFixed(2),
      ]);
    }

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [
      ...(startDate && endDate ? [[dateRange], []] : []), // Add date range and empty row if available
      headers,
      ...csvData,
    ];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users Report");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      selection === "Subscriptions Report"
        ? `Subscriptions_Report_${startDate}_${endDate}.csv`
        : `Subscribers_Report_${startDate}_${endDate}.csv`
    );
  };

  // PDF Export Function
  const exportToPDF = () => {
    const dateRange = `Date Range: ${startDate} to ${endDate}`;
    let tableColumn = [];
    let tableRows = [];

    const doc = new jsPDF({
      orientation: "landscape", // Set to landscape to increase width
      unit: "mm", // Measurement unit in millimeters
      format: "a3", // Use A3 size for wider layout
    });

    doc.setFontSize(18); // Set font size for header
    const headerText = "Subscriptions Report";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2; // Center the header
    doc.text(headerText, headerX, 20);
    doc.setFontSize(12); // Reset font size for normal text



    if (selection === "Subscriptions Report") {
      Utils.getBase64FromImage(logo, (base64Logo) => {
        const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
        const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(
          base64Logo,
          "PNG",
          pageWidth - logoWidth - 5,
          10,
          logoWidth,
          logoHeight
        );
        // Add the date range below the header
        if (startDate && endDate) {
          doc.text(dateRange, 5, 40); // Positioning the date range below the header
        }
        tableColumn = [
          { header: "S.No", dataKey: "sno" },
          { header: "Order ID #", dataKey: "order_number" },
          { header: "Customer Name", dataKey: "name" },
          { header: "Phone Number", dataKey: "s_phone" },
          { header: "Products", dataKey: "title" },
          { header: "Qty", dataKey: "qty" },
          { header: "Order Amount", dataKey: "order_amount" },
          { header: "Ordered Date", dataKey: "ordered_date" },
          { header: "Order Type", dataKey: "order_type" },
          { header: "Subscription Status", dataKey: "subscription_status" },
          { header: "Subscription Type", dataKey: "subscription_type" },
          { header: "Start Date", dataKey: "start_date" },
          { header: "Total No. of Deliveries", dataKey: "total_deliveries" },
          { header: "No. of Deliveries Left", dataKey: "delivery_left" },
          {
            header: "No. of Deliveries Completed",
            dataKey: "delivery_completed",
          },
          {
            header: "Assigned to Delivery Executive",
            dataKey: "assigned_delivery_executive",
          },
          { header: "Pincode", dataKey: "pincode" },
          { header: "Transaction ID", dataKey: "transaction_id" },
          { header: "Last Update", dataKey: "last_update" },
        ];

        const reversedReports = [...reports].reverse();

        tableRows = reversedReports
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map((row, index) => {
            const rowCopy = { ...row };

            // Update the qty property on the copy, not the original row
            rowCopy.qty = Utils.getUpdatedTotalQuantity(
              row.qty,
              row.subscription_type
            );
            return [
              index + 1,
              row.order_number,
              row.name,
              row.s_phone,
              row.title,
              rowCopy.qty,
              row.order_amount ?? 0,
              row.created_at
                ? moment.utc(row?.created_at).local().format("DD-MM-YYYY")
                : "--",
              Utils.getOrderType(row.order_type),
              row.subscription_type !== null
                ? row.order_status === 0
                  ? "Active"
                  : "Paused"
                : row.order_status === 0
                  ? "Active"
                  : "N/A",
              Utils.getSubscriptionType(row.subscription_type),
              moment.utc(row.start_date).local().format("DD-MM-YYYY"),
              row.total_deliveries,
              row.deliveries_left,
              row.delivered,
              row.executive_name,
              row.pincode,
              row.payment_id,
              moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
            ];
          });

        const tableStartY = 20 + logoHeight + 6;
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
          halign: "center",
          margin: { left: 5 },
          styles: {
            fontSize: 10, // Adjust font size for table content
            cellWidth: "auto",
          },
          headStyles: {
            fillColor: [0, 162, 51],  // Orange background
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
          columnStyles: {
            0: { cellWidth: 11 }, // S.No column
            1: { cellWidth: 24 }, // Order ID
            2: { cellWidth: 23 }, // Customer Name
            3: { cellWidth: 23 }, // Phone Number
            4: { cellWidth: 28 }, // Products
            5: { cellWidth: 12 }, // Aty
            6: { cellWidth: 20 }, // Order Amount
            7: { cellWidth: 20 }, // Order date
            8: { cellWidth: 16 }, // Order Type
            9: { cellWidth: 28 }, // Subscription Status
            10: { cellWidth: 28 }, // Subscription Type
            11: { cellWidth: 20 }, // Start Date
            12: { cellWidth: 20 }, // Total NO of deliveries
            13: { cellWidth: 20 }, // Total NO of deliveries Left
            14: { cellWidth: 25 }, // Total NO of deliveries Completed
            15: { cellWidth: 25 }, // Assignedn to delivery Executive
            16: { cellWidth: 20 }, // PinCode
            17: { cellWidth: 27 }, // Transaction Id
            18: { cellWidth: 20 }, // Last Update
          },
          tableWidth: "wrap", // Adjust table width to fit contents
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

        doc.save(`Subscriptions_Report_${startDate}_${endDate}.pdf`);
      });
    } else {
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

        // Add the date range below the header
        if (startDate && endDate) {
          doc.text(dateRange, 15, 40); // Positioning the date range below the header
        }
        tableColumn = [
          { header: "S.No", dataKey: "sno" },
          { header: "Customer ID", dataKey: "user_id", width: 30 },
          { header: "Name", dataKey: "name", width: 40 },
          {
            header: "Email", dataKey: "email", width: 50,
            renderCell: (params) => {
              return <p>{params.value ?? "N/A"}</p>;
            }
          },
          { header: "Phone", dataKey: "phone", width: 30 },
          {
            header: "Total Order Amount",
            dataKey: "total_order_amount",
            width: 40,
          },
          {
            header: "Wallet Amount",
            dataKey: "wallet_amount",
            width: 40,
          },
        ];
        const reversedReports = [...reports].reverse();

        tableRows = reversedReports.map((row, index) => [
          index + 1,
          row.user_id,
          row.name,
          row.email ?? "N/A",
          row.phone,
          row?.total_order_amount.toFixed(2),
          row?.wallet_amount.toFixed(2),
        ]);

        const tableStartY = 20 + logoHeight + 6;
        doc.addFont(
          "meera-regular-unicode-font-normal.ttf",
          "meera-regular-unicode-font-normal",
          "normal"
        );
        doc.setFont("meera-regular-unicode-font-normal");
        doc.autoTable(tableColumn, tableRows, {
          startY: tableStartY,
          showHead: "firstPage",
          headStyles: {
            fillColor: [0, 162, 51],  // Orange background
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
        doc.save(`Subscribers_Report_${startDate}_${endDate}.pdf`);
      });
    }
  };

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    if (searchValue.trim() !== "") {
      const result = searchArrayByValue(report.data, searchValue);
      setreports(result);
    } else {
      setreports(report.data);
    }
    setMainReports(report.data);

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
  };

  function searchArrayByValue(arr, searchQuery) {
    return arr
      .map((obj) => ({
        ...obj,
        start_date_temp: obj.start_date && !isNaN(new Date(obj.start_date))
          ? new Date(obj.start_date)
            .toISOString()
            .split("T")[0]
            .split("-")
            .reverse()
            .join("-")
          : "Invalid Date",
        exist_start_date: obj.start_date,
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
          exist_order_type,
          start_date_temp,
          exist_start_date,
          order_type_temp,
          exist_subscription_type,
          subscription_type_temp,
          ...rest
        }) => ({
          ...rest,
          start_date: exist_start_date,
          order_type: exist_order_type,
          subscription_type: exist_subscription_type,
        })
      );
  }

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

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        style={{ marginBottom: "1rem" }}
      >
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <TextField
            InputLabelProps={{ shrink: true }}
            id="outlined-basic"
            label="Select Date Range"
            variant="outlined"
            Autocomplete={false}
            size="small"
            color="secondary"
            onKeyDown={() => {
              return false;
            }}
            onClick={handleOpen}
            value={startDate && `${startDate} - ${endDate}`}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              if (selection === "Subscriptions Report") {
                if (isDateRange === true) {
                  let url = `${api}/get_subscriptions_report/${startDate}/${endDate}`;
                  filter(url);
                } else {
                  let url = `${api}/get_subscriptions_report`;
                  filter(url);
                }
              } else {
                if (isDateRange === true) {
                  let url = `${api}/get_subscriber_report/${startDate}/${endDate}`;
                  filter(url);
                } else {
                  let url = `${api}/get_subscriber_report`;
                  filter(url);
                }
              }
            }}
            disabled={!startDate && !endDate}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setisDateRange(false);
              setstartDate(fromDate);
              setendDate(toDate);
              let url =
                selection === "Subscriptions Report"
                  ? `${api}/get_subscriptions_report`
                  : `${api}/get_subscriber_report`;
              filter(url);
              setdateRange([
                {
                  endDate: new Date(),
                  startDate: addDays(new Date(), -7),
                  key: "selection",
                },
              ]);
            }}
            disabled={!startDate && !endDate}
          >
            Reset
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            disabled={reports.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={reports.length === 0}
          >
            Export to PDF
          </Button>
        </Box>
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
            Subscribers & Subscriptions Report
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"50%"}
          >
            <TextField
              size="small"
              sx={{ width: { xs: "60%", sm: "300px", md: "400px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              value={searchValue}
              onChange={(e) => {
                e.preventDefault();
                setSearchValue(e.target.value);
                setTimeout(() => {
                  setreports(
                    searchArrayByValue(
                      mainReports,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
            <Autocomplete
              disableClearable
              color="secondary"
              options={["Subscriptions Report", "Subscribers Report"]}
              sx={{ width: "100%" }}
              value={selection}
              onChange={(event, newValue) => {
                setSelection(newValue);
                setstartDate(fromDate);
                setendDate(toDate);
                setSearchValue("");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Report Type"
                  variant="outlined"
                />
              )}
            />
          </Box>
        </Box>

        {reports && !isLoading ? (
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
              sx={{
                fontSize: "13px",
                "& .MuiDataGrid-row": {
                  maxHeight: "auto",
                  wordWrap: "break-word",
                },
                "& .MuiDataGrid-cell": {
                  lineHeight: "normal",
                  whiteSpace: "normal",
                },
              }}
              columns={column}
              rows={reports}
              components={{ Toolbar: CustomToolbar }}
              localeText={{
                noRowsLabel: "No records found",
              }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) =>
                selection === "Subscriptions Report" ? `${row.id}_${row.executive_name}` : row.user_id
              }
              disableVirtualization
            />
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
          <DateRangePicker
            onChange={(item) => {
              setisDateRange(true);
              setstartDate(
                moment(item.selection.startDate).format("DD-MM-YYYY")
              );
              setendDate(moment(item.selection.endDate).format("DD-MM-YYYY"));
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
                  setstartDate(
                    moment(dateRange[0].startDate).format("DD-MM-YYYY")
                  );
                  setendDate(moment(dateRange[0].endDate).format("DD-MM-YYYY"));
                }
                handleClose();
              }}
            >
              Set
            </Button>
          </Box>
        </Box>
      </Modal>

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

export default SubscriptionsReport;
