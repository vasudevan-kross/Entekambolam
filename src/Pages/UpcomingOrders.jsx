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
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../Functions/apiFunction";
import api from "../Data/api";
import "../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import moment from "moment/moment";
import logo from "../assets/a_logo.png";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function UpcomingOrders() {
  const theme = useTheme();
  const appSetting = useSelector((state) => {
    return state.AppSettings[state.AppSettings.length - 1];
  });
  const [hasDeliveryPartner, setHasDeliveryPartner] = useState(false);
  const colors = tokens(theme.palette.mode);
  const [reports, setreports] = useState();
  const [pageSize, setpageSize] = useState(20);

  const [clearAuto, setclearAuto] = useState(1);
  const [backdropOpen, setbackdropOpen] = useState(false);
  //
  const [drivers, setdrivers] = useState();
  const [selectedDriver, setselectedDriver] = useState();
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const hasDelivery =
        appSetting &&
        appSetting?.find((setting) => setting.title == "HasDeliveryPartner")
          ?.value === "true";
      setHasDeliveryPartner(hasDelivery);
      const url = `${api}/get_upcoming_delivery/normal`;
      const report = await GET(token, url);
      setreports(report.data);
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
    setreports(report.data);
  };

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "Order ID",
      "Name",
      "Phone",
      "Products",
      "Order Type",
      "Pincode",
      "Quantity",
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
      Utils.getOrderType(row.order_type),
      row.pincode,
      row.qty,
    ]);

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Orders");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Upcoming Orders_${moment
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
    const headerText = "Upcoming Orders";
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
        { header: "Order ID", dataKey: "order_ID" },
        { header: "Name", dataKey: "name" },
        { header: "Phone", dataKey: "phe_no" },
        { header: "Products", dataKey: "product" },
        { header: "Order Type", dataKey: "order_type" },
        { header: "Pincode", dataKey: "pincode" },
        { header: "Quantity", dataKey: "qty" },
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
        order_type: Utils.getOrderType(row.order_type),
        pincode: row.pincode,
        qty: row.qty,
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
        `Upcoming Orders_${moment
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
      {
        field: "title",
        headerName: "Products",
        width: 220,
        valueGetter: (params) =>
          params.row.subscription_type !== null
            ? params.row.title
            : JSON.parse(params.row.product_detail)
                ?.map((product) => product.product_title)
                .join(", "),
      },
      {
        field: "order_type",
        headerName: "Order Type",
        width: 130,
        renderCell: (params) => (
          <p>{Utils.getOrderType(params.row.order_type)}</p>
        ),
      },
      {
        field: "pincode",
        headerName: "Pincode",
        width: 140,
      },
      {
        field: "qty",
        headerName: "Quantity",
        width: 140,
      },
      // {
      //   field: "qty_text",
      //   headerName: "Unit Of Measurement",
      //   width: 140,
      // },
      // {
      //   field: "order__assign_user",
      //   headerName: "Delivery Boy ID",
      //   width: 220,
      // },
    ],
    []
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
            Upcoming Orders
          </Typography>
          {/* <Divider /> */}
          {/* {hasDeliveryPartner && (
            <Box
              display={"flex"}
              alignItems={"center"}
              gap={"1rem"}
              width={"40%"}
            >
              <Autocomplete
                key={clearAuto}
                disablePortal
                sx={{ width: "100%" }}
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
                    let url = `${api}/get_normal_order/emp_user/${selectedDriver}`;
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
                  setselectedDriver();
                  setclearAuto(clearAuto === 1 ? 0 : 1);
                  let url = `${api}/get_upcoming_delivery/normal`;
                  filter(url);
                }}
              >
                Reset
              </Button>
            </Box>
          )} */}
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
              className="MuiDataGrid-root"
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

export default UpcomingOrders;
