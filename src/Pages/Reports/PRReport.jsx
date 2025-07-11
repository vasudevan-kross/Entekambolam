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

const PRReport = () => {
  const [prReports, setPRReports] = useState(null);
  const [allPRReports, setAllPRReports] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pageSize, setpageSize] = useState(20);
  const [startDate, setstartDate] = useState();
  const [endDate, setendDate] = useState();
  const [backdropOpen, setbackdropOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isStateUpdated, setUpdatedState] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [isDateRange, setisDateRange] = useState(false);
  const [dataSet, setdataSet] = useState([]);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: addDays(new Date(), -7),
      key: "selection",
    },
  ]);
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const { toDate, fromDate } = Utils.getDateRange();

  useEffect(() => {
    getAllData();
    setstartDate(fromDate);
    setendDate(toDate);
  }, []);

  const getAllData = async () => {
    setUpdatedState(false);
    try {
      const url = `${api}/get_pr_report`;
      const result = await GET(token, url);
      const reportData = result.data;
      if (searchValue.trim() !== "") {
        const filtered = searchArrayByValue(reportData, searchValue);
        setPRReports(filtered);
      } else {
        setPRReports(reportData || []);
      }
      setAllPRReports(reportData || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setUpdatedState(true);
    }
  };

  const column = useMemo(
    () => [
      { field: "pr_no", headerName: "PR#", width: 150 },
      { field: "pi_no", headerName: "PI#", width: 150 },
      {
        field: "supplier_name",
        headerName: "Supplier Name",
        width: 200,
      },
      {
        field: "warehouse_name",
        headerName: "Warehouse Name",
        width: 200,
      },
      { field: "city", headerName: "City", width: 200 },
      {
        field: "created_at",
        headerName: "PR created at",
        width: 220,
        renderCell: (params) =>
          moment.utc(params.row.created_at).local().format("DD-MM-YYYY"),
      },
      {
        field: "date_of_pr",
        headerName: "Date Of PR",
        width: 200,
        renderCell: (params) => {
          const date = params.row?.date_of_pr;
          if (moment(date, "YYYY-MM-DD", true).isValid()) {
            return moment(date).format("DD-MM-YYYY");
          } else {
            return moment(date, "DD-MM-YYYY").format("DD-MM-YYYY") || "--";
          }
        },
      },
      {
        field: "no_of_products",
        headerName: "Total no. of products return",
        width: 120,
        renderCell: (params) => params.row?.no_of_products || "--",
      },
      {
        field: "no_of_qty",
        headerName: "Total Qty return",
        width: 120,
        renderCell: (params) => params.row?.no_of_qty || "--",
      },
      {
        field: "pi_amount",
        headerName: "Total PI Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.row?.pi_amount?.toFixed(2) ?? "0.00"}</p>;
        },
      },
      {
        field: "total_amount",
        headerName: "Total PR Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.row?.total_amount?.toFixed(2) ?? "0.00"}</p>;
        },
      },
    ],
    [prReports]
  );

  const exportToCSV = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;

    // Prepare the headers and data
    const headers = [
      "S.No",
      "PR#",
      "PI#",
      "Supplier Name",
      "Warehouse Name",
      "City",
      "PR created at",
      "Date Of PR",
      "Total no.of roducts return",
      "Total Qty return",
      "Total PI Amount",
      "Total PR Amount",
    ];

    const reversedPrReport = [...prReports].reverse();

    const csvData = reversedPrReport?.map((row, index) => [
      index + 1,
      row.pr_no,
      row.pi_no,
      row.supplier_name,
      row.warehouse_name,
      row.city,
      moment.utc(row.created_at).local().format("DD-MM-YYYY"),
      moment.utc(row.date_of_pr).local().format("DD-MM-YYYY"),
      row.no_of_products,
      row.no_of_qty,
      row.pi_amount,
      row.total_amount,
    ]);

    const workbook = XLSX.utils.book_new();

    const tempData = [
      ...(startDate && endDate ? [[dateRange], []] : []), // Add date range and empty row if available
      headers,
      ...csvData,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(tempData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "PR Report");

    XLSX.writeFile(workbook, `PR_Report_${startDate}_${endDate}.csv`);
  };

  const exportToPDF = () => {
    const dateRange = `Date Range: ${startDate} to ${endDate}`;
    // const doc = new jsPDF();

    // Create a jsPDF instance with A3 landscape orientation for more width
    const doc = new jsPDF({
      orientation: "landscape", // Set to landscape to increase width
      unit: "mm", // Measurement unit in millimeters
      format: "a4", // Use A3 size for wider layout
    });

    // Set header font size and center-align it
    doc.setFontSize(18);
    const headerText = "Purchase Return";
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
        { header: "PR#", dataKey: "pr_no" },
        { header: "PI#", dataKey: "pi_no" },
        { header: "Supplier Name", dataKey: "supplier_id" },
        { header: "Warehouse Name", dataKey: "warehouse_id" },
        { header: "City", dataKey: "city" },
        { header: "PR created at", dataKey: "created_at" },
        { header: "Date Of PR", dataKey: "date_of_pr" },
        { header: "Total no.of products return", dataKey: "no_of_products" },
        { header: "Total Qty return", dataKey: "no_of_qty" },
        { header: "Total PI Amount", dataKey: "pi_amount" },
        { header: "Total PR Amount", dataKey: "total_amount" },
      ];

      const reversedPrReport = [...prReports].reverse();

      const tableRows = reversedPrReport.map((row, index) => ({
        sno: index + 1,
        pr_no: row.pr_no,
        pi_no: row.pi_no,
        supplier_name: row.supplier_name,
        warehouse_name: row.warehouse_name,
        city: row.city,
        created_at: moment.utc(row.created_at).local().format("DD-MM-YYYY"),
        date_of_pr: moment.utc(row.date_of_pr).local().format("DD-MM-YYYY"),
        no_of_products: row.no_of_products,
        no_of_qty: row.no_of_qty,
        pi_amount: row.pi_amount,
        total_amount: row.total_amount,
      }));

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
        margin: { left: 5 },
        halign: "center",
        styles: {
          fontSize: 10,
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
          1: { cellWidth: 30 }, // PI Number
          2: { cellWidth: 30 }, // PR number
          3: { cellWidth: 30 }, //Supplier Name
          4: { cellWidth: 30 }, //Warehouse Name
          5: { cellWidth: 30 }, //City
          6: { cellWidth: 20 }, // PR created at
          7: { cellWidth: 20 }, // Date of PR
          8: { cellWidth: 23 }, // Total no.of products return
          9: { cellWidth: 20 }, // Total qty return
          10: { cellWidth: 20 }, // Total PI Amount
          11: { cellWidth: 20 }, // Total PI Amount
        },
        tableWidth: "wrap", // Adjust table width to fit contents
        showHead: "firstPage",
        didDrawCell: (data) => {
          if (
            data.column.dataKey === "title" &&
            data.cell.text[0].length > 15
          ) {
            doc.setFontSize(8);
          }
        },
      });

      const totalPages = doc.internal.getNumberOfPages(); // Get total pages
      doc.setFontSize(9);
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Set the page context to the current page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`; // Format "Page X/Y"
        const marginRight = 15;
        const marginBottom = i === 1 ? 7 : 10;

        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - marginBottom
        );
      }

      doc.save(`PR_Report_${startDate}_${endDate}.pdf`);
    });
  };

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    if (searchValue.trim() !== "") {
      const result = searchArrayByValue(report.data, searchValue);
      setPRReports(result);
    } else {
      setPRReports(report.data);
    }
    setAllPRReports(report.data);

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
    const dateValueObj = inputArray.reduce((acc, curr) => {
      const currDate = curr.date;
      if (!acc[currDate]) {
        acc[currDate] = [];
      }
      acc[currDate].push(1);

      return acc;
    }, {});

    const dateValueArray = Object.entries(dateValueObj).map(
      ([date, values]) => {
        return { date, values };
      }
    );

    return dateValueArray;
  }

  function searchArrayByValue(arr, searchQuery) {
    const keysToSearch = [
      "pr_no",
      "pi_no",
      "supplier_name",
      "warehouse_name",
      "city",
      "date_of_pr",
      "no_of_products",
      "no_of_qty",
      "pi_amount",
      "total_amount",
    ];

    return arr.filter((obj) => {
      return keysToSearch.some((key) => {
        if (obj[key] !== undefined) {
          const val = obj[key];
          if (typeof val === "string") {
            return val
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          }
          if (typeof val === "number") {
            return val
              .toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          }
        }
        return false;
      });
    });
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
        style={{ marginBottom: "1rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", gap: "1rem" }}>
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
                  let url = `${api}/get_pr_report/${startDate}/${endDate}`;
                  filter(url);
                } else {
                  let url = `${api}/get_pr_report`;
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
                setstartDate(fromDate);
                setendDate(toDate);
                let url = `${api}/get_pr_report`;
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

          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={exportToCSV}
              disabled={prReports.length === 0}
            >
              Export to CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={exportToPDF}
              disabled={prReports.length === 0}
            >
              Export to PDF
            </Button>
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
            Purchase Return Report
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
              value={searchValue}
              onChange={(e) => {
                e.preventDefault();
                setSearchValue(e.target.value);
                setTimeout(() => {
                  setPRReports(
                    searchArrayByValue(
                      allPRReports,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {prReports && isStateUpdated ? (
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
              rows={prReports}
              components={{ Toolbar: CustomToolbar }}
              localeText={{
                noRowsLabel: "No records found",
              }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.id} // Ensure the unique ID for rows
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
};

export default PRReport;
