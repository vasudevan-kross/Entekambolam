import React, { useEffect, useMemo, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import {
  Autocomplete,
  Backdrop,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../../Functions/apiFunction";
import api from "../../Data/api";
import "../../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { addDays } from "date-fns";
import { DateRangePicker } from "react-date-range";
import "chart.js/auto";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";
import { useSelector } from "react-redux";
import Utils from "../../Global/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

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

function DeliveryReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const appSetting = useSelector((state) => {
    return state.AppSettings[state.AppSettings.length - 1];
  });
  const [hasDeliveryPartner, setHasDeliveryPartner] = useState(false);
  const [reports, setreports] = useState();
  const [allReports, setAllReports] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [clearAuto, setclearAuto] = useState(1);
  const [dataSet, setdataSet] = useState([]);
  const [backdropOpen, setbackdropOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  //
  const [drivers, setdrivers] = useState();
  const [selectedDriver, setselectedDriver] = useState();
  const [isDateRange, setisDateRange] = useState(false);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: addDays(new Date(), -7),
      key: "selection",
    },
  ]);
  const [startDate, setstartDate] = useState();
  const [endDate, setendDate] = useState();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  // const date = new Date();
  // const formattedDate = `${String(date.getDate()).padStart(2, "0")}_${String(
  //   date.getMonth() + 1
  // ).padStart(2, "0")}_${date.getFullYear()}`;

  const { toDate, fromDate } = Utils.getDateRange();

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const hasDelivery =
        appSetting &&
        appSetting?.find((setting) => setting.title == "HasDeliveryPartner")
          ?.value === "true";
      setHasDeliveryPartner(hasDelivery);
      const url = `${api}/get_report/delivery`;
      const report = await GET(token, url);
      if (searchValue.trim() !== "") {
        const filtered = searchArrayByValue(report.data, searchValue);
        setreports(filtered);
      } else {
        setreports(report.data);
      }
      setAllReports(report.data);

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
      setstartDate(fromDate);
      setendDate(toDate);
    };
    const getDriver = async () => {
      const url = `${api}/get_user/role/4`;
      const drivers = await GET(token, url);
      setdrivers(drivers.data);
    };
    getCat();
    getDriver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    if (searchValue.trim() !== "") {
      const filtered = searchArrayByValue(report.data, searchValue);
      setreports(filtered);
    } else {
      setreports(report.data);
    }
    setAllReports(report.data);

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

  function getDateValueArray(inputArray) {
    // Create an object to store the unique dates and their values
    const dateValueObj = inputArray?.reduce((acc, curr) => {
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

  function searchArrayByValue(arr, searchQuery) {
    return arr
      .map((obj) => ({
        ...obj,
        date_temp: obj.date
          .split(" ")[0]
          .split("-")
          .reverse()
          .join("-"),
        exist_date: obj.date,
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
                  : obj.subscription_type === null
                  ? "BuyOnce" : CONSTANTS.NOT_APPLICABLE,
      }))
      .filter((obj) => {
        return Object.values(obj).some((val) => {
          if (typeof val === "string") {
            return val
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          }
          if (typeof val === "number") {
            return val.toString().includes(searchQuery.toLowerCase());
          }
          return false;
        });
      })
      .map(
        ({
          exist_date,
          date_temp,
          exist_order_type,
          order_type_temp,          
          exist_subscription_type,
          subscription_type_temp,
          ...rest
        }) => ({
          ...rest,
          date: exist_date,
          order_type: exist_order_type,
          subscription_type: exist_subscription_type,
        })
      );
  }

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setTimeout(() => {
      const filtered = searchArrayByValue(allReports, value);
      setreports(filtered);
    }, 500);
  };

  const exportToCSV = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;

    // Prepare the headers and data
    const headers = [
      "S.No",
      "Order ID #",
      "Customer ID",
      "Customer Name",
      "Phone Number",
      "Products",
      "Subscription Type",
      "Order Type",
      "Qty",
      "Pincode",
      "Address",
      "Delivery Notes",
      "Delivered By",
      "Delivered Date",
    ];

    const reversedReports = [...reports].reverse();

    const csvData = reversedReports
      .sort((a, b) => new Date(a.date) - new Date(b.date))
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
          row.entry_user_id,
          row.name,
          row.s_phone,
          row.subscription_type !== null
            ? row.title
            : JSON.parse(row.product_detail)
              ?.map(
                (product) => `${product.product_title} (Qty ${product.qty})`
              )
              .join(", "),
          Utils.getSubscriptionType(row.subscription_type),
          Utils.getOrderType(row.order_type),
          rowCopy.qty,
          row.pincode,
          Utils.formatAddress(row),
          row.delivery_notes,
          row?.executive_name || "Admin",
          moment.utc(row.date).local().format("DD-MM-YYYY"),
        ];
      });

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Report");

    // Set the filename and download
    XLSX.writeFile(workbook, `Delivery_Report_${startDate}_${endDate}.csv`);
  };

  const exportToPDF = () => {
    const dateRange = `Date Range: ${startDate} to ${endDate}`;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add the header text

    doc.setFontSize(18);
    const headerText = "Delivery Report";
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
        pageWidth - logoWidth - 5,
        10,
        logoWidth,
        logoHeight
      );

      // Set smaller font size for the date range text below header
      doc.setFontSize(12);
      if (startDate && endDate) {
        doc.text(dateRange, 5, 40);
      }

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "Order ID", dataKey: "order_number" },
        { header: "Customer ID", dataKey: "user_Id" },
        { header: "Customer Name", dataKey: "name" },
        { header: "Phone Number", dataKey: "phone" },
        { header: "Products", dataKey: "title" },
        { header: "Subscription Type", dataKey: "subscription_type" },
        { header: "Order Type", dataKey: "order_type" },
        { header: "Qty", dataKey: "qty" },
        { header: "Pincode", dataKey: "pincode" },
        { header: "Address", dataKey: "address" },
        { header: "Delivery Notes", dataKey: "delivery_notes" },
        { header: "Delivered By", dataKey: "delivered_by" },
        { header: "Delivered Date", dataKey: "date" },
      ];

      const reversedReports = [...reports].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((row, index) => ({
          sno: index + 1,
          order_number: row.order_number,
          user_Id: row.entry_user_id,
          name: row.name,
          phone: row.s_phone,
          title:
            row.subscription_type !== null
              ? row.title
              : JSON.parse(row.product_detail)
                ?.map(
                  (product) => `${product.product_title} (Qty ${product.qty})`
                )
                .join(", "),
          subscription_type: Utils.getSubscriptionType(row.subscription_type),
          order_type: Utils.getOrderType(row.order_type),
          qty: Utils.getUpdatedTotalQuantity(row.qty, row.subscription_type),
          pincode: row.pincode,
          address: Utils.formatAddress(row),
          delivery_notes: row.delivery_notes,
          delivered_by: row?.executive_name || "Admin",
          date: moment.utc(row.date).local().format("DD-MM-YYYY"),
        }));

      const tableStartY = 20 + logoHeight + 6;

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
        margin: { left: 4 },
        halign: "center",
        styles: {
          fontSize: 10,
          cellWidth: "auto",
        },
        headStyles: {
          fillColor: [0, 162, 51], // green background
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
          0: { cellWidth: 11 }, // S/no
          1: { cellWidth: 20 }, // Order ID
          2: { cellWidth: 23 }, // Customer ID
          3: { cellWidth: 23 }, // Customer Name
          4: { cellWidth: 24 }, // Phone Number
          5: { cellWidth: 24 }, // Products
          6: { cellWidth: 28 }, // Subsc Type
          7: { cellWidth: 16 }, // Order Type
          8: { cellWidth: 12 }, // Qty
          9: { cellWidth: 20 }, // Pincode
          10: { cellWidth: 25 }, //Address
          11: { cellWidth: 20 }, // delivery NOtes
          12: { cellWidth: 22 }, // delivery BY
          13: { cellWidth: 22 }, // delivery date
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
      doc.save(`Delivery_Report_${startDate}_${endDate}.pdf`);
    });
  };

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "Order ID #", width: 120 },
      { field: "user_id", headerName: "Customer ID", width: 120 },
      { field: "name", headerName: "Customer Name", width: 160 },
      { field: "s_phone", headerName: "Phone Number", width: 120 },
      {
        field: "title",
        headerName: "Products",
        width: 180,
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
          subscriptionText =
            subscriptionText === "N/A" ? "BuyOnce" : subscriptionText;
          return <p>{subscriptionText}</p>;
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

      {
        field: "qty",
        headerName: "Qty",
        width: 80,
        renderCell: (params) => {
          const quantity = params.row.qty;
          const subscriptionType = params.row.subscription_type;

          return Utils.getUpdatedTotalQuantity(quantity, subscriptionType);
        },
      },
      {
        field: "pincode",
        headerName: "PinCode",
        width: 140,
      },
      {
        field: "address",
        headerName: "Address",
        width: 220,
        renderCell: (params) => {
          // Call the utility function to format the address
          const address = Utils.formatAddress(params.row);

          return (
            <Tooltip title={address} arrow>
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
                {address}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        field: "delivery_notes",
        headerName: "Delivery Notes",
        width: 220,
      },
      {
        field: "executive_name",
        headerName: "Delivered By",
        width: 200,
        // renderCell: (params) => "Admin",
      },
      {
        field: "date",
        headerName: "Delivered Date",
        width: 120,
        renderCell: (params) =>
          moment.utc(params.row.date).local().format("DD-MM-YYYY"),
      },
    ],
    []
  );

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ marginBottom: "1rem" }}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
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
            Delivery Report
          </Typography>

          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"50%"}
          >
            {/* {hasDeliveryPartner && (
              <Autocomplete
                key={clearAuto}
                disablePortal
                sx={{ width: "80%" }}
                id="combo-box-demo"
                color="secondary"
                clearIcon
                options={drivers ? drivers : []}
                getOptionLabel={(option) =>
                  `${option?.name} ( ${option?.phone} , ${option?.email})`
                }
                onChange={(e, data) => {
                  setselectedDriver(data.user_id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    Autocomplete={false}
                    label="Select Driver"
                    size="small"
                    fullWidth
                    color="secondary"
                  />
                )}
              />
            )} */}

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
              fullWidth
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
              sx={{
                fontWeight: "700",
                color: "fff",
                width: "150px",
              }}
              color="secondary"
              onClick={() => {
                if (isDateRange === true) {
                  let url = `${api}/get_report/delivery/${startDate}/${endDate}`;
                  filter(url);
                } else {
                  let url = `${api}/get_report/delivery`;
                  filter(url);
                }
              }}
            >
              Submit
            </Button>

            <Button
              variant="contained"
              sx={{ fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={() => {
                setisDateRange(false);
                setselectedDriver();
                setclearAuto(clearAuto === 1 ? 0 : 1);
                setstartDate(fromDate);
                setendDate(toDate);
                let url = `${api}/get_report/delivery`;
                filter(url);
                setdateRange([
                  {
                    endDate: new Date(),
                    startDate: addDays(new Date(), -7),
                    key: "selection",
                  },
                ]);
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
        {dataSet && (
          <Box className="bg-card text-card-foreground shadow-sm rounded-lg p-4 xl:p-2 title-menu">
            <Typography
              variant="h3"
              component={"h3"}
              fontWeight={500}
              sx={{ textAlign: "center", pb: "8px", pt: "8px" }}
            >
              Statistics - Delivery Data
            </Typography>{" "}
            <Divider />
            <Box
              height={"350px"}
              display={"flex"}
              p={"20px"}
              justifyContent={"space-around"}
            >
              <Chart
                type="line"
                lineThickness="1"
                data={{
                  labels: dataSet.map((coin) =>
                    moment.utc(coin.date).local().format("DD-MM-YYYY")
                  ),
                  datasets: [
                    {
                      data: dataSet.map((coin) => coin.value),
                      label: `Total Delivery`,
                      borderWidth: 2,
                      fill: true,
                      borderColor: "#28a745",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  elements: {
                    point: {
                      radius: 4,
                      borderWidth: 1,
                    },
                  },
                  datalabels: {
                    display: false,
                  },

                  plugins: {
                    datalabels: {
                      display: false,
                    },
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      mode: "index",
                      intersect: false,
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        beginAtZero: true,
                        display: false,
                      },
                      title: {
                        display: true,
                        text: "Delivery →",
                        font: {
                          size: "18px",
                          color: "#000",
                        },
                      },
                      display: true, // Hide Y axis labels
                      grid: {
                        color: "#28a7469f",
                        display: false,
                      },
                    },
                    x: {
                      ticks: {
                        beginAtZero: true,
                        display: false,
                      },
                      grid: {
                        color: "#28a7469f",
                        display: false,
                      },
                      title: {
                        display: true,
                        text: "Date →",
                        font: {
                          size: "18px",
                          color: "#000",
                        },
                      },
                      display: true, // Hide X axis labels
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {reports ? (
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
              rows={reports.map((row) => ({
                ...row,
                // Generating a unique ID for each row using a combination of order_id and a random number
                unique_id: `${row.order_id}-${row.order_number}-${Math.random()
                  .toString(36)
                  .substring(2, 15)}`,
              }))}
              components={{ Toolbar: CustomToolbar }}
              localeText={{
                noRowsLabel: "No records found",
              }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.unique_id}
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

export default DeliveryReport;
