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

const PoReport = () => {
  const [poReports, setPoReports] = useState(null);
  const [allPoReports, setAllPoReports] = useState(null);
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
      const url = `${api}/get_po_report`;
      const result = await GET(token, url);
      const reportDatas = result.data;
      if (searchValue.trim() !== "") {
        const filtered = searchArrayByValue(reportDatas, searchValue);
        setPoReports(filtered);
      } else {
        setPoReports(reportDatas || []);
      }
      setAllPoReports(reportDatas || []);
    } catch (error) {
      console.error("Error fetching purchaseOrders:", error);
    }
    finally {
      setUpdatedState(true);
    }
  };

  const column = useMemo(
    () => [
      // { field: "id", headerName: "Id", width: 50 },
      { field: "po_no", headerName: "PO#", width: 150 },
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
        field: "date_of_po",
        headerName: "Date Of Purchase Order",
        width: 150,
        renderCell: (params) => {
          const date = params.row.date_of_po;
          if (moment(date, "YYYY-MM-DD", true).isValid()) {
            return moment(date).format("DD-MM-YYYY");
          } else {
            return moment(date, "DD-MM-YYYY").format("DD-MM-YYYY") || "--";
          }
        },
      },
      {
        field: "date_of_delivery",
        headerName: "Date Of Delivery",
        width: 150,
        renderCell: (params) => {
          const date = params.row.date_of_delivery;
          if (moment(date, "YYYY-MM-DD", true).isValid()) {
            return moment(date).format("DD-MM-YYYY");
          } else {
            return moment(date, "DD-MM-YYYY").format("DD-MM-YYYY") || "--";
          }
        },
      },
      { field: "delivery_time", headerName: "Delivery Time", width: 120 },
      {
        field: "no_of_products",
        headerName: "Total no. of products in PO",
        width: 120,
      },
      { field: "no_of_qty", headerName: "Total Qty in PO", width: 120 },
      {
        field: "total_amount",
        headerName: "Total PO Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.row?.total_amount?.toFixed(2) ?? "0.00"}</p>;
        },
      },
    ],
    [poReports]
  );

  const exportToCSV = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;

    // Prepare the headers and data
    const headers = [
      "S.No",
      "PO#",
      "Supplier Name",
      "Warehouse Name",
      "City",
      "Date Of Purchase Order",
      "Date Of Delivery",
      "Delivery Time",
      "Total no.of Products in PO",
      "Total qty in PO",
      "Total PO Amount",
    ];

    const reversedPOReport = [...poReports].reverse();

    const csvData = reversedPOReport.map((row, index) => [
      index + 1,
      row.po_no,
      row.supplier_name,
      row.warehouse_name,
      row.city,
      moment.utc(row.date_of_po).local().format("DD-MM-YYYY"),
      moment.utc(row.date_of_delivery).local().format("DD-MM-YYYY"),
      row.delivery_time,
      row.no_of_products,
      row.no_of_qty,
      row.total_amount,
    ]);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "PO Report");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `PO_Report_${fromDate}_${toDate}.csv`
    );
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
    const headerText = "Purchase Order Report";
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
        pageWidth - logoWidth - 8,
        10,
        logoWidth,
        logoHeight
      );
      // Set smaller font size for the date range text below header
      doc.setFontSize(12);
      if (startDate && endDate) {
        doc.text(dateRange, 8, 40);
      }

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "PO#", dataKey: "po_no" },
        { header: "Supplier Name", dataKey: "supplier_id" },
        { header: "Warehouse Name", dataKey: "warehouse_id" },
        { header: "City", dataKey: "city" },
        { header: "Date Of PO", dataKey: "date_of_po" },
        { header: "Date Of Delivery", dataKey: "date_of_delivery" },
        { header: "Delivery Time", dataKey: "delivery_time" },
        { header: "Total no.of Products in PO", dataKey: "no_of_products" },
        { header: "Total qty in PO", dataKey: "no_of_qty" },
        { header: "Total PO Amount", dataKey: "total_amount" },
      ];

      const reversedPOReport = [...poReports].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedPOReport.map((row, index) => ({
        sno: index + 1,
        po_no: row.po_no,
        supplier_name: row.supplier_name,
        warehouse_name: row.warehouse_name,
        city: row.city,
        date_of_po: moment(row.date_of_po, "YYYY-MM-DD", true).isValid()
          ? moment(row.date_of_po).format("DD-MM-YYYY")
          : moment(row.date_of_po, "DD-MM-YYYY").format("DD-MM-YYYY"),
        date_of_delivery: moment(
          row.date_of_delivery,
          "YYYY-MM-DD",
          true
        ).isValid()
          ? moment(row.date_of_delivery).format("DD-MM-YYYY")
          : moment(row.date_of_delivery, "DD-MM-YYYY").format("DD-MM-YYYY"),
        delivery_time: row.delivery_time,
        no_of_products: row.no_of_products,
        no_of_qty: row.no_of_qty,
        total_amount: row.total_amount,
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
        margin: { left: 6 },
        halign: "center",
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
          1: { cellWidth: 30 }, // P0 Number
          2: { cellWidth: 33 }, // Supplier Name
          3: { cellWidth: 33 }, // Warehouse Name
          4: { cellWidth: 40 }, // City
          5: { cellWidth: 20 }, // Date of PO
          6: { cellWidth: 23 }, // Date of Delivery
          7: { cellWidth: 23 }, // Delivery time
          8: { cellWidth: 25 }, // Total no.of products return
          9: { cellWidth: 23 }, // Total PO Amount
          10: { cellWidth: 23 }, // Total PO Amount
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

      // Save the PDF with a date-based file name
      doc.save(`PO_Report_${fromDate}_${toDate}.pdf`);
    });
  };

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    if (searchValue.trim() !== "") {
      const result = searchArrayByValue(report.data, searchValue);
      setPoReports(result);
    } else {
      setPoReports(report.data || []);
    }
    setAllPoReports(report.data);

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
    const keysToSearch = [
      "po_no",
      "supplier_name",
      "warehouse_name",
      "city",
      "date_of_po",
      "date_of_delivery",
      "delivery_time",
      "no_of_products",
      "no_of_qty",
      "total_amount",
    ];

    return arr.filter((obj) =>
      keysToSearch.some((key) => {
        const val = obj[key];
        if (val !== undefined) {
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
      })
    );
  }

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
    const dateValueArray = Object.entries(dateValueObj)?.map(
      ([date, values]) => {
        return { date, values };
      }
    );

    return dateValueArray;
  }

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
                let url = `${api}/get_po_report/${startDate}/${endDate}`;
                filter(url);
              } else {
                let url = `${api}/get_po_report`;
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
              let url = `${api}/get_po_report`;
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
            disabled={poReports.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={poReports.length === 0}
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
            Purchase Order Report
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
                  setPoReports(
                    searchArrayByValue(
                      allPoReports,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {poReports && isStateUpdated ? (
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
              rows={poReports}
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

export default PoReport;
