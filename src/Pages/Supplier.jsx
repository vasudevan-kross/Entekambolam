import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Select,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  Snackbar,
  Alert,
  Button
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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import moment from "moment/moment";
import logo from "../assets/a_logo.png";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function Supplier() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [vendors, setVendors] = useState();
  const [allVendor, setAllVendor] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [isUpdating, setUpdaing] = useState(true);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const dispatch = useDispatch();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    getVendor();
  }, [token, dispatch]);

  const getVendor = async () => {
    const url = `${api}/get_vendor`;
    const vendor = await GET(token, url);
    setVendors(vendor.data);
    setAllVendor(vendor.data);
  };

  const column = useMemo(
    () => [
      { field: "id", headerName: "Id", width: 100 },
      { field: "supplier_name", headerName: "Supplier Name", width: 150 },
      { field: "poc_name", headerName: "Name", width: 120 },
      { field: "user_name", headerName: "Email", width: 150 },
      { field: "office_ph_no", headerName: "Phone Number", width: 120 },
      { field: "poc_email", headerName: "POC Email", width: 150 },
      { field: "poc_ph_no", headerName: "POC Number", width: 120 },
      { field: "address", headerName: "Address", width: 200 },
      {
        field: "Action",
        headerName: "Action",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(`/editvendor/${params.row.id}`);
            }}
          >
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
        ),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 100,
        renderCell: (params) => (
          <button
            class={params.row.is_active === 1 ? "updateBtn" : "dltBtn"}
            onClick={() => {
              onChangeVendorStatus(params.row.id);
            }}
          >
            {params.row.is_active === 1 ? "Active" : "Inactive"}
          </button>
        ),
      },
    ],
    [navigate]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "Supplier Name",
      "Name",
      "Email",
      "Phone Number",
      "POC Email",
      "POC Number",
      "Address",
      "Status"
    ];

    const reversedReports = [...vendors].reverse();

    const csvData = reversedReports
      .map((row, index) => [
        index + 1,
        row.supplier_name,
        row.poc_name,
        row.user_name,
        row.office_ph_no,
        row.poc_email,
        row.poc_ph_no,
        row.address,
        row.is_active === 1 ? "Active" : "Inactive"
      ]);

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [
      headers,
      ...csvData,
    ];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Details");

    // Set the filename and download
    XLSX.writeFile(workbook, `Supplier Details_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.csv`);
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
    const headerText = "Supplier Details";
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
        { header: "Supplier Name", dataKey: "suplier_name" },
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Phone Number", dataKey: "phe_no" },
        { header: "POC Email", dataKey: "poc_email" },
        { header: "POC Number", dataKey: "poc_number" },
        { header: "Address", dataKey: "address" },
        { header: "Status", dataKey: "status" },
      ];

      const reversedReports = [...vendors].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports
        .map((row, index) => ({
          sno: index + 1,
          suplier_name: row.supplier_name,
          name: row.poc_name,
          email: row.user_name,
          phe_no: row.office_ph_no,
          poc_email: row.poc_email,
          poc_number: row.poc_ph_no,
          address: row.address,
          date: row.is_active === 1 ? "Active" : "Inactive"
        }));

      const tableStartY = 20 + logoHeight + 3;

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
          fillColor: [0, 162, 51],  // Orange background
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
          0: { cellWidth: 16 }, // S.No column
          1: { cellWidth: 40 }, // Supplier Name
          2: { cellWidth: 30 }, // Name
          3: { cellWidth: 35 }, // Email
          4: { cellWidth: 30 }, // Phone NUmber
          5: { cellWidth: 35 }, // POC Email
          6: { cellWidth: 32}, // POC Number
          7: { cellWidth: 40 }, // Address
          8: { cellWidth: 22 }, // Status 
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
      doc.save(`Supplier Details_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.pdf`);
    });
  };

  const onChangeVendorStatus = async (id) => {
    const url = `${api}/change_vendor_status/${id}`;
    setUpdaing(false);
    const vendor = await GET(token, url);
    if (vendor.response === 200) {
      getVendor();
      setalertType("success");
      setalertMsg(vendor.message ?? "Supplier Status updated successfully");
      handleSnakBarOpen();
      setUpdaing(true);
    } else {
      setUpdaing(true);
      setalertType("error");
      setalertMsg(vendor.message || "Error updating Supplier");
      handleSnakBarOpen();
    }
  };

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
            disabled={vendors.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={vendors.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/newvendor");
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
  return (
    <div style={{ height: "100%" }}>
      <Snackbar
        open={snakbarOpen}
        autoHideDuration={3000}
        onClose={handleSnakBarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnakBarClose}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
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
            Manage Supplier
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
              onChange={(e) => {
                e.preventDefault();
                setTimeout(() => {
                  function searchArrayByValue(arr, searchQuery) {
                    return arr.filter((obj) => {
                      return Object.values(obj).some((val) => {
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
                        return false;
                      });
                    });
                  }
                  setVendors(
                    searchArrayByValue(allVendor, e.target.value.toLowerCase())
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>
        {vendors && isUpdating ? (
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
              rows={vendors}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
    </div>
  );
}

export default Supplier;
