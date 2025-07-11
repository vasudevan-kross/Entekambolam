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
} from "@mui/material";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../Functions/apiFunction";
import api from "../Data/api";
import "../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import { Calendar } from "react-date-range";
import { useSelector } from "react-redux";
import Utils from "../Global/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/a_logo.png";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

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

function UpcomingSubsOrder() {
  const theme = useTheme();
  const appSetting = useSelector((state) => {
    return state.AppSettings[state.AppSettings.length - 1];
  });
  const colors = tokens(theme.palette.mode);
  const [reports, setreports] = useState();
  const [pageSize, setpageSize] = useState(100);
  const [open, setOpen] = useState(false);
  const [clearAuto, setclearAuto] = useState(1);
  const [backdropOpen, setbackdropOpen] = useState(false);
  //
  const [drivers, setdrivers] = useState();
  const [selectedDriver, setselectedDriver] = useState();
  const [hasDeliveryPartner, setHasDeliveryPartner] = useState(false);

  const [date, setdate] = useState(moment(Date.now()).format("DD-MM-YYYY"));
  const [nowDate, setnowDate] = useState(Date.now());
  const [memoDate, setmemoDate] = useState(
    moment(Date.now()).format("DD-MM-YYYY")
  );
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

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

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const hasDelivery =
        appSetting &&
        appSetting?.find((setting) => setting.title == "HasDeliveryPartner")
          ?.value === "true";
      setHasDeliveryPartner(hasDelivery);
      const url = `${api}/get_upcoming_delivery/sub_date/${date}`;
      const report = await GET(token, url);
      const reportData = report.data;
      const filter1 = () => {
        let arr = [];
        for (let i = 0; i < reportData.length; i++) {
          const element = reportData[i];
          const dateToCheck = new Date(date); // Date to check if it exists
          const data = element.user_holiday;
          const dateExists = data.some((item) => {
            const itemDate = new Date(item.date);
            return itemDate.toDateString() === dateToCheck.toDateString();
          });
          if (dateExists !== true) {
            if (element.order_type === 1) {
              if (element.subscription_type === 2) {
                const dayCode = getDayName(date);
                const string = element.selected_days_for_weekly;
                const validJSONString = string.replace(
                  /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
                  '"$2": '
                );
                const array = JSON.parse(validJSONString);
                const containsDayQty = array.find(
                  (obj) => obj.dayCode === dayCode
                );

                if (
                  containsDayQty &&
                  element.wallet_amount >=
                    containsDayQty?.qty * element.order_amount
                ) {
                  arr.push(element);
                }
              } else if (
                element.subscription_type === 1 ||
                element.subscription_type === 3 ||
                element.subscription_type === 4
              ) {
                if (element.wallet_amount >= element.order_amount) {
                  arr.push(element);
                }
              }
            } else if (element.order_type === 2) {
              arr.push(element);
            }
          }
        }
        return arr;
      };

      const filter2 = () => {
        let arr = [];
        for (let i = 0; i < filter1().length; i++) {
          const element = filter1()[i];
          const dt1 = new Date(element.start_date);
          const dt2 = new Date(date);
          if (dt2.getTime() >= dt1.getTime()) {
            if (element.subscription_type === 1) {
              const d1 = new Date(element.start_date);
              const d2 = new Date(date);
              if (d2.getTime() === d1.getTime()) {
                arr.push(element);
              }
            } else if (element.subscription_type === 4) {
              const currentDate = new Date(element.start_date);
              const finalDate = new Date(date);
              while (currentDate <= finalDate) {
                if (currentDate.getTime() === finalDate.getTime()) {
                  arr.push(element);
                  break; // Exit the loop when the current date matches the end date
                }
                currentDate.setDate(currentDate.getDate() + 2); // Skip the next date
              }
            } else if (element.subscription_type === 2) {
              const dayCode = getDayName(date);
              const string = element.selected_days_for_weekly;
              const validJSONString = string.replace(
                /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
                '"$2": '
              );
              const array = JSON.parse(validJSONString);
              const containsDayCode = array.some(
                (obj) => obj.dayCode === dayCode
              );

              if (containsDayCode === true) {
                arr.push(element);
              }
            } else if (element.subscription_type === 3) {
              arr.push(element);
            }
          }
        }
        return arr;
      };

      setreports(reportData);
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

  const filter = async (url, date) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    const reportData = report.data;

    const filter1 = () => {
      let arr = [];
      for (let i = 0; i < reportData.length; i++) {
        const element = reportData[i];
        const dateToCheck = new Date(date); // Date to check if it exists
        const data = element.user_holiday;
        const dateExists = data.some((item) => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === dateToCheck.toDateString();
        });
        if (dateExists !== true) {
          if (element.order_type === 1) {
            if (element.subscription_type === 2) {
              const dayCode = getDayName(date);
              const string = element.selected_days_for_weekly;
              const validJSONString = string.replace(
                /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
                '"$2": '
              );
              const array = JSON.parse(validJSONString);
              const containsDayQty = array.find(
                (obj) => obj.dayCode === dayCode
              );

              if (
                containsDayQty &&
                element.wallet_amount >=
                  containsDayQty?.qty * element.order_amount
              ) {
                arr.push(element);
              }
            } else if (
              element.subscription_type === 1 ||
              element.subscription_type === 3 ||
              element.subscription_type === 4
            ) {
              if (element.wallet_amount >= element.order_amount) {
                arr.push(element);
              }
            }
          } else if (element.order_type === 2) {
            arr.push(element);
          }
        }
      }
      return arr;
    };

    const filter2 = () => {
      let arr = [];
      for (let i = 0; i < filter1().length; i++) {
        const element = filter1()[i];
        const dt1 = new Date(element.start_date);
        const dt2 = new Date(date);
        if (dt2.getTime() >= dt1.getTime()) {
          if (element.subscription_type === 1) {
            const d1 = new Date(element.start_date);
            const d2 = new Date(date);
            if (d2.getTime() === d1.getTime()) {
              arr.push(element);
            }
          } else if (element.subscription_type === 4) {
            const currentDate = new Date(element.start_date);
            const finalDate = new Date(date);
            while (currentDate <= finalDate) {
              if (currentDate.getTime() === finalDate.getTime()) {
                arr.push(element);
                break; // Exit the loop when the current date matches the end date
              }
              currentDate.setDate(currentDate.getDate() + 2); // Skip the next date
            }
          } else if (element.subscription_type === 2) {
            const dayCode = getDayName(date);
            const string = element.selected_days_for_weekly;
            const validJSONString = string.replace(
              /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
              '"$2": '
            );
            const array = JSON.parse(validJSONString);
            const containsDayCode = array.some(
              (obj) => obj.dayCode === dayCode
            );

            if (containsDayCode === true) {
              arr.push(element);
            }
          } else if (element.subscription_type === 3) {
            arr.push(element);
          }
        }
      }
      return arr;
    };

    setreports(reportData);
    setmemoDate(date);
    setdate(date);
  };

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "Order ID",
      "Name",
      "Phone",
      "Products",
      "Subscription Type",
      "Order Type",
      "Delivery Status",
      "Start Date",
      "Pincode",
      "Quantity",
      "Quantity Text",
      "Wallet Balance",
    ];

    const csvData = reports.map((row, index) => [
      index + 1,
      row.order_number,
      row.name,
      row.s_phone,
      row.subscription_type !== null
        ? row.title
        : JSON.parse(row.product_detail)
            ?.map((product) => product.product_title)
            .join(", "),
      Utils.getSubscriptionType(row.subscription_type),
      Utils.getOrderType(row.order_type),
      row.delivered_date === null ? "Not Delivered" : "Delivered",
      moment.utc(row.start_date).local().format("DD-MM-YYYY"),
      row.pincode,
      row.qty,
      row.qty_text,
      row.wallet_amount,
    ]);

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Subs Orders");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Upcoming Subs Orders_${moment
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
      format: "a4",
    });

    // Add the header text
    doc.setFontSize(18);
    const headerText = "Upcoming Subs Orders";
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
        pageWidth - logoWidth - 8,
        10,
        logoWidth,
        logoHeight
      );

      // Set smaller font size for the date range text below header
      doc.setFontSize(12);

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "Order ID", dataKey: "order_ID" },
        { header: "Name", dataKey: "name" },
        { header: "Phone", dataKey: "phe_no" },
        { header: "Products", dataKey: "product" },
        { header: "Subscription Type", dataKey: "subs_type" },
        { header: "Order Type", dataKey: "order_type" },
        { header: "Delivery Status", dataKey: "status" },
        { header: "Start Date", dataKey: "start_date" },
        { header: "Pincode", dataKey: "pincode" },
        { header: "Qty", dataKey: "qty" },
        { header: "Qty Text", dataKey: "qty_txt" },
        { header: "Wallet Balance", dataKey: "wallet_amt" },
      ];

      // Map table rows and format data as needed
      const tableRows = reports.map((row, index) => ({
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
        subs_type: Utils.getSubscriptionType(row.subscription_type),
        order_type: Utils.getOrderType(row.order_type),
        status: row.delivered_date === null ? "Not Delivered" : "Delivered",
        start_date: moment.utc(row.start_date).local().format("DD-MM-YYYY"),
        pincode: row.pincode,
        qty: row.qty,
        qty_txt: row.qty_text,
        wallet_amt: row.wallet_amount,
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
        margin: { left: 8 },
        halign: "center",
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellWidth: "auto",
        },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
          textColor: [255, 255, 255], // White text
          fontSize: 10, // Reduced font size for header
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
          2: { cellWidth: 24 }, // Name
          3: { cellWidth: 24 }, // Phone
          4: { cellWidth: 30 }, // Products
          5: { cellWidth: 30 }, // Sub Type
          6: { cellWidth: 18 }, // Order Type
          7: { cellWidth: 24 }, // Delivery Status
          8: { cellWidth: 20 }, // Start Date
          9: { cellWidth: 20 }, // Pincode
          10: { cellWidth: 15 }, // Quantity
          11: { cellWidth: 22 }, // Qty Text
          12: { cellWidth: 20 }, // Wallet Balance
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
        `Upcoming Subs Orders_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "Order ID", width: 120 },
      { field: "name", headerName: "Name", width: 150 },
      { field: "s_phone", headerName: "Phone", width: 120 },
      { field: "title", headerName: "Products", width: 220 },
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
        field: "order_type",
        headerName: "Order Type",
        width: 120,
        renderCell: (params) => {
          let orderText = Utils.getOrderType(params.row.order_type);
          return <p>{orderText}</p>;
        },
      },
      {
        field: "delivered_date",
        headerName: "Delivery Status",
        width: 130,
        renderCell: (params) => (
          <p>
            {params.row.delivered_date === null ? (
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
        field: "start_date",
        headerName: "Start Date",
        width: 140,
        renderCell: (params) =>
          moment.utc(params.row.start_date).local().format("DD-MM-YYYY"),
      },
      {
        field: "pincode",
        headerName: "Pincode",
        width: 140,
      },
      {
        field: "qty",
        headerName: "Quantity",
        width: 80,
        renderCell: (params) => {
          if (params.row.subscription_type === 2) {
            const dayCode = getDayName(memoDate);
            console.log(dayCode);
            const string = params.row.selected_days_for_weekly;
            const validJSONString = string.replace(
              /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
              '"$2": '
            );
            const array = JSON.parse(validJSONString);
            const containsDayCode = array.find(
              (obj) => obj.dayCode === dayCode
            );
            return containsDayCode?.qty;
          }
        },
      },
      {
        field: "qty_text",
        headerName: "Quantity Text",
        width: 140,
      },
      // {
      //   field: "order_assign_user",
      //   headerName: "Delivery Boy ID",
      //   width: 130,
      // },
      {
        field: "wallet_amount",
        headerName: "Wallet Balance",
        width: 120,
      },
    ],

    [memoDate]
  );

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "flex-start",
        }}
        style={{ marginBottom: "1rem" }}
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
      <Box sx={{ height: 600, width: "100%" }}>
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
            Upcoming Subscription Orders
          </Typography>

          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            gap={"1rem"}
            width={"55%"}
          >
            {/* {hasDeliveryPartner && (
              <Autocomplete
                key={clearAuto}
                disablePortal
                sx={{ width: "60%" }}
                id="combo-box-demo"
                color="secondary"
                clearIcon
                options={drivers ? drivers : []}
                getOptionLabel={(option) =>
                  `${option?.id}  ${option?.name} ( ${option?.phone} , ${option?.email})`
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
              sx={{ width: "40%" }}
              InputLabelProps={{ shrink: true }}
              id="outlined-basic"
              label="Select Date"
              variant="outlined"
              Autocomplete={false}
              size="small"
              color="secondary"
              onKeyDown={() => {
                return false;
              }}
              onClick={handleOpen}
              value={date}
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
                if (selectedDriver) {
                  let url = `${api}/get_upcoming_delivery/sub_date/assign_user/${selectedDriver}/${date}`;
                  const Maindate = date;
                  filter(url, Maindate);
                } else {
                  const url = `${api}/get_upcoming_delivery/sub_date/${date}`;
                  const Maindate = date;
                  filter(url, Maindate);
                }
              }}
            >
              Submit
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setdate(moment(Date.now()).format("DD-MM-YYYY"));
                setselectedDriver();
                setreports("");
                setclearAuto(clearAuto === 1 ? 0 : 1);
                const date = moment(Date.now()).format("DD-MM-YYYY");
                const url = `${api}/get_upcoming_delivery/sub_date/${date}`;
                filter(url, date);
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {reports ? (
          <Box
            className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 ${
              theme.palette.mode === "dark" ? "bg-darkcard" : "bg-card"
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
              rows={reports}
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
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Calendar onChange={(item) => setnowDate(item)} date={nowDate} />
          <Box mt={5}>
            {" "}
            <Button
              fullWidth
              variant="contained"
              sx={{ height: "30px", fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={() => {
                setdate(moment(nowDate).format("DD-MM-YYYY"));
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

export default UpcomingSubsOrder;
