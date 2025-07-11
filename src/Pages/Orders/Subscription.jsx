import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  useTheme,
  Button,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";

import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Import the UTC plugin
import LoadingSkeleton from "../../Components/LoadingSkeleton";

// Extend dayjs with the UTC plugin
dayjs.extend(utc);

function SubscriptionOrders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [orders, setorders] = useState();
  const [mainproducts, setMainproducts] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");

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
    // Get categoriues
    const getOrders = async () => {
      const url = `${api}/get_subscription_order`;
      const products = await GET(token, url);
      setorders(products.data);
      setMainproducts(products.data);
    };
    getOrders();
  }, [token, dispatch]);

  const column = useMemo(
    () => [
      {
        field: "order_number",
        headerName: "ID",
        width: 120,
        cellClassName: "sticky-col-1",
        renderHeader: () => (
          <Tooltip title="Number of completed deliveries for the order" arrow>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              order_number
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "name",
        headerName: "Customer Name",
        width: 150,
        cellClassName: "sticky-col-2",
      },
      {
        field: "s_phone", headerName: "Ph. Number", width: 120,
        renderHeader: () => (
          <Tooltip title="Phone Number" arrow>
            <Typography className="fs-13">
              Ph. Number
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "qty",
        headerName: "Qty",
        width: 50,
        sortable: false,
        disableColumnMenu:true,
        renderHeader: () => (
          <Tooltip title="Quantity" arrow>
            <Typography className="fs-13">
              Qty
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => {
          const quantity = params.row.qty;
          const subscriptionType = params.row.subscription_type;
          return Utils.getUpdatedTotalQuantity(quantity, subscriptionType);
        },
      },
      {
        field: "title",
        headerName: "Product",
        width: 200,
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
        field: "order_amount",
        headerName: "Amount",
        width: 100,
        renderHeader: () => (
          <Tooltip title="Amount" arrow>
            <Typography className="fs-13">
              Amount
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => (
          <p>{params.row?.order_amount?.toFixed(2) || "0.00"}</p>
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
        width: 80,
        renderHeader: () => (
          <Tooltip title="Order Status" arrow>
            <Typography className="fs-13">
              Order Status
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => <p>{status(params.row.status)}</p>,
      },
      // {
      //   field: "order_status",
      //   headerName: "Subs Status",
      //   width: 80,
      //   renderCell: (params) =>
      //     params.row.subscription_type !== null ? (
      //       <p>{params.row.order_status === 0 ? "Active" : "Paused"}</p>
      //     ) : (
      //       <p>{params.row.order_status === 0 ? "Active" : "N/A"}</p>
      //     ),
      // },
      {
        field: "",
        headerName: "Subs Type",
        width: 140,
        renderHeader: () => (
          <Tooltip title="Subs Type" arrow>
            <Typography className="fs-13">
              Subs Type
            </Typography>
          </Tooltip>
        ),
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
        width: 100,
        renderHeader: () => (
          <Tooltip title="Start Date" arrow>
            <Typography className="fs-13">
              Start Date
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) =>
          params.row.start_date
            ? dayjs(params.row.start_date).utc().local().format("DD-MM-YYYY")
            : "--",
      },
      {
        field: "end_date",
        headerName: "End Date",
        width: 100,
        renderHeader: () => (
          <Tooltip title="End Date" arrow>
            <Typography className="fs-13">
              End Date
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) =>
          params.row.end_date
            ? dayjs(params.row.end_date).utc().local().format("DD-MM-YYYY")
            : "--",
      },
      {
        field: "total_deliveries",
        headerName: "Total No. of Deliveries",
        width: 30,
        renderHeader: () => (
          <Tooltip title="Total No. of Deliveries" arrow>
            <Typography className="fs-13">
              Total No. of Deliveries
            </Typography>
          </Tooltip>
        ),
        sortable: false,
        // disableColumnMenu: true,
      },
      {
        field: "deliveries_left",
        headerName: "No. of Deliveries left",
        width: 30,
        renderHeader: () => (
          <Tooltip title="No. of Deliveries left" arrow>
            <Typography className="fs-13">
              No. of Deliveries left
            </Typography>
          </Tooltip>
        ),
        sortable: false,
        // disableColumnMenu: true,
      },
      {
        field: "delivered",
        headerName: "No. of Deliveries Completed",
        width: 30,
        renderHeader: () => (
          <Tooltip title="No. of Deliveries Completed" arrow>
            <Typography className="fs-13">
              No. of Deliveries Completed
            </Typography>
          </Tooltip>
        ),
        sortable: false,
        // disableColumnMenu: true,
        renderCell: (params) => {
          // Check if the total deliveries and delivered match
          const isEqual = params.row.total_deliveries === params.row.delivered;
          return (
            <div
              style={{
                color: isEqual ? "green" : "red",
              }}
            >
              {params.value}
            </div>
          );
        },
      },
      {
        field: "subscription_alert",
        headerName: "Subscription Status",
        width: 120,
        renderHeader: () => (
          <Tooltip title="Subscription Status" arrow>
            <Typography className="fs-13">
              Subs Status
            </Typography>
          </Tooltip>
        ),
        renderCell: (params) => {
          const orderStatus = params.row.status; // 1 = Confirmed, 0 = Pending, 2 = Canceled
          const endDate = params.row.end_date
            ? dayjs(params.row.end_date).utc().local().startOf("day")
            : null;
          const today = dayjs().startOf("day");

          let alertMsg = "--";
          let color = "gray";

          // If order is not confirmed
          if (orderStatus !== 1) {
            alertMsg = "Inactive";
            color = "gray";
          } else if (endDate) {
            const diffDays = endDate.diff(today, "day");

            if (diffDays === 0) {
              alertMsg = "Ends Today";
              color = "red";
            } else if (diffDays < 0) {
              alertMsg = "Ended";
              color = "red";
            } else if (diffDays <= 2) {
              alertMsg = "Ending Soon";
              color = "orange";
            } else {
              alertMsg = "Active";
              color = "green";
            }
          }

          return (
            <span
              style={{
                color: color,
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              {alertMsg}
            </span>
          );
        },
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
    [navigate]
  );

  const getSubscriptionAlert = (row) => {
    const orderStatus = row.status;
    const endDate = row.end_date
      ? dayjs(row.end_date).utc().local().startOf("day")
      : null;
    const today = dayjs().startOf("day");

    if (orderStatus !== 1) return "Inactive";
    if (!endDate) return "--";

    const diffDays = endDate.diff(today, "day");

    if (diffDays === 0) return "Ends Today";
    if (diffDays < 0) return "Ended";
    if (diffDays <= 2) return "Ending Soon";

    return "Active";
  };

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "ID",
      "Customer Name",
      "Phone Number",
      "Quantity",
      "Product",
      "Amount",
      "Ordered Date",
      "Order Type",
      "Order Status",
      "Subscription Status",
      "Subscription Type",
      "Start Date",
      "Total No. of Deliveries",
      "No. of Deliveries Left",
      "No. of Deliveries Completed",
      "Pincode",
      "Payment ID",
      "Last Update",
    ];

    const reversedReports = [...orders].reverse();

    const csvData = reversedReports.map((row, index) => {
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
        rowCopy.qty,
        row.subscription_type !== null
          ? row.title
          : JSON.parse(row.product_detail)
            ?.map((product) => product.product_title)
            .join(", "),
        row?.order_amount?.toFixed(2) || "0.00",
        moment.utc(row?.created_at).local().format("DD-MM-YYYY"),
        Utils.getOrderType(row.order_type),
        status(row.status),
        getSubscriptionAlert(row),
        // row.subscription_type !== null
        //   ? row.order_status === 0
        //     ? "Active"
        //     : "Paused"
        //   : row.order_status === 0
        //   ? "Active"
        //   : "N/A",
        Utils.getSubscriptionType(row.subscription_type),
        moment.utc(row.start_date).local().format("DD-MM-YYYY"),
        row.total_deliveries,
        row.deliveries_left,
        row.delivered,
        row.pincode,
        row.payment_id,
        moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
      ];
    });

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscription Orders");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Subscription Orders_${moment
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
    const headerText = "Subscription Orders";
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
        pageWidth - logoWidth - 10,
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
        { header: "Qty", dataKey: "qty" },
        { header: "Product", dataKey: "product" },
        { header: "Amount", dataKey: "amt" },
        { header: "Order Date", dataKey: "order_date" },
        { header: "Order Type", dataKey: "order_type" },
        { header: "Order Status", dataKey: "order_status" },
        { header: "Subscription Status", dataKey: "sub_status" },
        { header: "Subscription Type", dataKey: "sub_type" },
        { header: "Start Date", dataKey: "start_date" },
        { header: "Total No. of Deliveries", dataKey: "no_of_deliveries" },
        { header: "No. of Deliveries Left", dataKey: "no_of_deliveries_left" },
        {
          header: "No. of Deliveries Completed",
          dataKey: "no_of_deliveries_completed",
        },
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
        qty: Utils.getUpdatedTotalQuantity(row.qty, row.subscription_type),
        product:
          row.subscription_type !== null
            ? row.title
            : JSON.parse(row.product_detail)
              ?.map((product) => product.product_title)
              .join(", "),
        amt: row?.order_amount?.toFixed(2) || "0.00",
        order_date: moment.utc(row?.created_at).local().format("DD-MM-YYYY"),
        order_type: Utils.getOrderType(row.order_type),
        order_status: status(row.status),
        sub_status: getSubscriptionAlert(row),
        // sub_status:
        //   row.subscription_type !== null
        //     ? row.order_status === 0
        //       ? "Active"
        //       : "Paused"
        //     : row.order_status === 0
        //     ? "Active"
        //     : "N/A",
        sub_type: Utils.getSubscriptionType(row.subscription_type),
        start_date: moment.utc(row.start_date).local().format("DD-MM-YYYY"),
        no_of_deliveries: row.total_deliveries,
        no_of_deliveries_left: row.deliveries_left,
        no_of_deliveries_completed: row.delivered,
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
        halign: "center",
        margin: { left: 8 },
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
        columnStyles: {
          0: { cellWidth: 11 }, // S.No column
          1: { cellWidth: 15 }, // Order ID
          2: { cellWidth: 23 }, // Customer Name
          3: { cellWidth: 23 }, // Phone Number
          4: { cellWidth: 12 }, // Qty
          5: { cellWidth: 28 }, // Products
          6: { cellWidth: 20 }, // Amount
          7: { cellWidth: 20 }, // Order date
          8: { cellWidth: 16 }, // Order Type
          9: { cellWidth: 22 }, // Order Status
          10: { cellWidth: 28 }, // Subscription Status
          11: { cellWidth: 28 }, // Subscription type
          12: { cellWidth: 20 }, // Start Date
          13: { cellWidth: 20 }, // Total NO of deliveries
          14: { cellWidth: 25 }, // Total NO of deliveries Left
          15: { cellWidth: 25 }, // Total NO of deliveries Completed
          16: { cellWidth: 20 }, // PinCode
          17: { cellWidth: 27 }, // Transaction Id
          18: { cellWidth: 20 }, // Last Update
        },
        tableWidth: "wrap",
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
        `Subscription Orders_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
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

  const searchArrayByValue = (arr, searchQuery) => {
    return arr
      ?.map((obj) => {
        const today = dayjs().startOf("day");
        const endDate = obj.end_date
          ? dayjs(obj.end_date).startOf("day")
          : null;

        let subscription_alert_temp = CONSTANTS.NOT_APPLICABLE;

        const status = obj.status;

        if (status !== 1) {
          subscription_alert_temp = CONSTANTS.SUBSCRIPTION_ALERTS.INACTIVE;
        } else if (endDate) {
          const diffDays = endDate.diff(today, "day");

          if (diffDays === 0) {
            subscription_alert_temp = CONSTANTS.SUBSCRIPTION_ALERTS.ENDS_TODAY;
          } else if (diffDays > 0 && diffDays <= 2) {
            subscription_alert_temp = CONSTANTS.SUBSCRIPTION_ALERTS.ENDING_SOON;
          } else if (diffDays > 2) {
            subscription_alert_temp = CONSTANTS.SUBSCRIPTION_ALERTS.ACTIVE;
          } else if (diffDays < 0) {
            subscription_alert_temp = CONSTANTS.SUBSCRIPTION_ALERTS.ENDED;
          }
        }

        return {
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
          subscription_alert_temp,
        };
      })
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
          subscription_alert_temp,
          ...rest
        }) => ({
          ...rest,
          order_type: exist_order_type,
          start_date: exist_start_date,
          updated_at: exist_update_at,
          status: exist_status,
          order_status: exist_order_status,
          subscription_type: exist_subscription_type,
          subscription_alert: subscription_alert_temp,
        })
      );
  };

  const applyFilters = (searchQuery, selectedFilter) => {
    let filteredOrders = mainproducts;
    const today = dayjs().startOf("day");

    if (selectedFilter !== CONSTANTS.SUBSCRIPTION_FILTERS.ALL) {
      filteredOrders = filteredOrders?.filter((order) => {
        const endDate = order.end_date
          ? dayjs(order.end_date).startOf("day")
          : null;
        const status = order.status; // status: 1=CONFIRMED, 2=CANCELLED, 0=PENDING

        if (!endDate) return false;

        const diffDays = endDate.diff(today, "day");

        switch (selectedFilter) {
          case CONSTANTS.SUBSCRIPTION_FILTERS.ACTIVE:
            return status === 1 && diffDays > 2;
          case CONSTANTS.SUBSCRIPTION_FILTERS.ENDING_SOON:
            return status === 1 && diffDays > 0 && diffDays <= 2;
          case CONSTANTS.SUBSCRIPTION_FILTERS.ENDS_TODAY:
            return status === 1 && diffDays === 0;
          case CONSTANTS.SUBSCRIPTION_FILTERS.ENDED:
            return status === 1 && diffDays < 0;
          case CONSTANTS.SUBSCRIPTION_FILTERS.INACTIVE:
            return status !== 1;
          default:
            return true;
        }
      });
    }

    // Apply search after filter
    if (searchQuery.trim() !== "") {
      filteredOrders = searchArrayByValue(
        filteredOrders,
        searchQuery.toLowerCase()
      );
    }

    setorders(filteredOrders);
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

  const filterOptions = Object.entries(
    CONSTANTS.SUBSCRIPTION_FILTER_LABELS
  ).map(([value, label]) => ({
    label,
    value,
  }));

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
            Manage Subscription Orders
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"32.33%"}
          >
            <Box width="100%">
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
                  <TextField {...params} label="Subcription Status" />
                )}
              />
            </Box>
            <TextField
              size="small"
              sx={{ width: { xs: "80%", sm: "300px", md: "500px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              onChange={(e) => {
                e.preventDefault();
                handleSearchChange(e);
              }}
            />
          </Box>
        </Box>

        {orders ? (
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
              localeText={{
                noRowsLabel: "No records found",
              }}
              disableVirtualization
            />

            <span className="idColumn">
             <Tooltip title="ID" arrow>ID</Tooltip>
              <span
                class="MuiDataGrid-columnSeparator MuiDataGrid-columnSeparator--sideRight"
                style={{
                  minHeight: "56px",
                  opacity: "1",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiDataGrid-iconSeparator css-bac4tg-MuiSvgIcon-root"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  data-testid="SeparatorIcon"
                >
                  <path d="M11 19V5h2v14z"></path>
                </svg>
              </span>
            </span>

            <span className="nameColumn">
              <Tooltip title="Name" arrow>Name</Tooltip>
              <span
                class="MuiDataGrid-columnSeparator MuiDataGrid-columnSeparator--sideRight"
                style={{
                  minHeight: "56px",
                  opacity: "1",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiDataGrid-iconSeparator css-bac4tg-MuiSvgIcon-root"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  data-testid="SeparatorIcon"
                >
                  <path d="M11 19V5h2v14z"></path>
                </svg>
              </span>
            </span>
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
    </div>
  );
}

export default SubscriptionOrders;
