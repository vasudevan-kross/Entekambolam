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
} from "@mui/material";
import Box from "@mui/material/Box";
import moment from "moment/moment";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { tokens } from "../../theme";
import { DateRangePicker } from "react-date-range";
import "jspdf-autotable";
import { addDays } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import logo from "../../assets/a_logo.png";
import Utils from "../../Global/utils";
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

function ReconciliationReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reportDatas, setReportDatas] = useState();
  const [MainDatas, setMainDatas] = useState();
  const [pageSize, setpageSize] = useState(20);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [startDate, setstartDate] = useState();
  const [endDate, setendDate] = useState();
  const [backdropOpen, setbackdropOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [isDateRange, setisDateRange] = useState(false);
  const [dateRange, setdateRange] = useState([
    {
      startDate: new Date(), // Today's date
      endDate: new Date(), // Also today's date
      key: "selection",
    },
  ]);
  const date = new Date();
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}_${String(
    date.getMonth() + 1
  ).padStart(2, "0")}_${date.getFullYear()}`;

  useEffect(() => {
    // Get reportDatas
    const fetchData = async () => {
      const url = `${api}/get_reconciliation_report`;
      const reportData = await GET(token, url);
      setReportDatas(reportData.data);
      setMainDatas(reportData.data);

      setstartDate(Utils.formatDateToDDMMYYYY(new Date()));
      setendDate(Utils.formatDateToDDMMYYYY(new Date()));
    };
    fetchData();
  }, [token]);

  const calculateTotals = (reportDatas) => {
    const prepaidTotal = reportDatas?.prepaid_total || 0;
    const postpaidTotal = reportDatas?.postpaid_total || 0;
    const paynowTotal = reportDatas?.paynow_total || 0;
    const codTotal = reportDatas?.cod_total || 0;
    const refundAmountToday = reportDatas?.refund_amount_today || 0;

    // Calculate sub totals and final total
    const subTotal = prepaidTotal + postpaidTotal + paynowTotal + codTotal;
    const total = subTotal - refundAmountToday;

    return {
      prepaidTotal,
      postpaidTotal,
      paynowTotal,
      codTotal,
      subTotal,
      refundAmountToday,
      total,
    };
  };

  const column = [
    {
      field: "type",
      headerName: "Payment Type",
      flex: 1,
      renderCell: (params) => {
        const isBold = params.row.isBold;
        return (
          <span style={{ fontWeight: isBold ? "bold" : "normal" }}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      renderCell: (params) => {
        const isBold = params.row.isBold;
        return (
          <span style={{ fontWeight: isBold ? "bold" : "normal" }}>
            {params.value}
          </span>
        );
      },
    },
  ];

  const {
    prepaidTotal,
    postpaidTotal,
    paynowTotal,
    codTotal,
    subTotal,
    refundAmountToday,
    total,
  } = calculateTotals(reportDatas);

  const rows = [
    { id: 1, type: "Prepaid", amount: prepaidTotal.toFixed(2) },
    { id: 2, type: "Postpaid", amount: postpaidTotal.toFixed(2) },
    { id: 3, type: "PayNow", amount: paynowTotal.toFixed(2) },
    { id: 4, type: "COD", amount: codTotal.toFixed(2) },
    { id: 5, type: "Sub Total", amount: subTotal.toFixed(2), isBold: true },
    { id: 6, type: "Refund Amount", amount: refundAmountToday.toFixed(2) },
    { id: 7, type: "Total", amount: total.toFixed(2), isBold: true },
  ];

  const exportToCSV = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;

    // Prepare the headers and data
    const headers = ["Payment Type", "Amount"];

    // Prepare the totals data
    const totalsData = [
      ["Prepaid", reportDatas.prepaid_total?.toFixed(2) || "0"],
      ["Postpaid", reportDatas.postpaid_total?.toFixed(2) || "0"],
      ["PayNow", reportDatas.paynow_total?.toFixed(2) || "0"],
      ["COD", reportDatas.cod_total?.toFixed(2) || "0"],
      [
        "Sub Total",
        (
          reportDatas.prepaid_total +
          reportDatas.postpaid_total +
          reportDatas.paynow_total +
          reportDatas.cod_total
        )?.toFixed(2) || "0",
      ],
      ["Refund Amount", reportDatas.refund_amount_today?.toFixed(2) || "0"],
      [
        "Total",
        (
          reportDatas.prepaid_total +
          reportDatas.postpaid_total +
          reportDatas.paynow_total +
          reportDatas.cod_total -
          reportDatas.refund_amount_today
        )?.toFixed(2) || "0",
      ],
    ];

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [
      ...(dateRange ? [[dateRange], []] : []), // Add date range and empty row if available
      headers,
      ...totalsData,
    ];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reconciliation Report");

    const file_name =
      startDate && endDate
        ? `Reconciliation_Report_${startDate}_${endDate}.csv`
        : `Reconciliation_Report_${formattedDate}.csv`;
    // Set the filename and download
    XLSX.writeFile(workbook, file_name);
  };

  const exportToPDF = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;

    const doc = new jsPDF();

    doc.setFontSize(18); // Set font size for header
    const headerText = "Reconciliation Report";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2; // Center the header
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

      doc.setFontSize(12); // Reset font size for normal text
      // Add the date range below the header
      if (dateRange) {
        doc.text(dateRange, 15, 40);// Positioning the date range below the header
      }

      // Prepare the totals data
      const tableColumn = ["Payment Type", "Amount"];
      const tableRows = [
        ["Prepaid", reportDatas.prepaid_total?.toFixed(2) || "0.00"],
        ["Postpaid", reportDatas.postpaid_total?.toFixed(2) || "0.00"],
        ["PayNow", reportDatas.paynow_total?.toFixed(2) || "0.00"],
        ["COD", reportDatas.cod_total?.toFixed(2) || "0.00"],
        [
          "Sub Total",
          (
            reportDatas.prepaid_total +
            reportDatas.postpaid_total +
            reportDatas.paynow_total +
            reportDatas.cod_total
          )?.toFixed(2) || "0.00",
        ],
        [
          "Refund Amount",
          reportDatas.refund_amount_today?.toFixed(2) || "0.00",
        ],
        [
          "Total",
          (
            reportDatas.prepaid_total +
            reportDatas.postpaid_total +
            reportDatas.paynow_total +
            reportDatas.cod_total -
            reportDatas.refund_amount_today
          )?.toFixed(2) || "0.00",
        ],
      ];

      const tableStartY = 20 + logoHeight + 6;
      // Add the table to the PDF
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY, // Adjust startY to leave space for header and date range
        showHead: "firstPage",
        headStyles: {
          fillColor: [0, 162, 51],  // RGB color for orange background
          textColor: [255, 255, 255], // White text for contrast
          fontSize: 10, // Font size for the table header
          lineWidth: 0.2, // Set border thickness for header
          halign: "center", // Center-align the table headers
        },
        bodyStyles: {
          lineWidth: 0.2, // Set border thickness for body cells
          lineColor: [0, 0, 0], // Black border color
        },
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellPadding: 3, // Add padding to cells for better appearance
          lineWidth: 0.2, // General border thickness
          lineColor: [0, 0, 0], // General border color
        },
        didParseCell: function (data) {
          // Check if the row corresponds to "Sub Total" or "Total"
          if (
            data.row.raw &&
            (data.row.raw[0] === "Sub Total" || data.row.raw[0] === "Total")
          ) {
            data.cell.styles.fontStyle = "bold"; // Make the text bold
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

      const file_name =
        startDate && endDate
          ? `Reconciliation_Report_${startDate}_${endDate}.pdf`
          : `Reconciliation_Report_${formattedDate}.pdf`;

      doc.save(file_name);
    });
  };

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    setReportDatas(report.data);
    setMainDatas(report.data);
  };

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
              if (isDateRange === true) {
                let url = `${api}/get_reconciliation_report/${startDate}/${endDate}`;
                filter(url);
              } else {
                let url = `${api}/get_reconciliation_report`;
                filter(url);
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
              setstartDate(Utils.formatDateToDDMMYYYY(new Date()));
              setendDate(Utils.formatDateToDDMMYYYY(new Date()));
              let url = `${api}/get_reconciliation_report`;
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
            disabled={reportDatas.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={reportDatas.length === 0}
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
            Reconciliation Report
          </Typography>
        </Box>

        {reportDatas ? (
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
              rows={rows}
              components={{ Toolbar: CustomToolbar }}
              localeText={{
                noRowsLabel: "No records found",
              }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              // getRowId={(row) => row.id} // Ensure the unique ID for rows
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={5} height={30} />
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

export default ReconciliationReport;
