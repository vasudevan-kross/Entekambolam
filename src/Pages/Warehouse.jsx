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
  Button,
} from "@mui/material";
import Box from "@mui/material/Box";

import {
  DataGrid,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../Functions/apiFunction";
import api from "../Data/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import moment from "moment/moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import logo from "../assets/a_logo.png"
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function Warehouse() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [warehouses, setWarehouses] = useState();
  const [allWarehouse, setAllWarehouse] = useState();
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
    getWarehouse();
  }, [token, dispatch]);

  const getWarehouse = async () => {
    const url = `${api}/get_all_warehouse`;
    const warehouse = await GET(token, url);
    setWarehouses(warehouse.data);
    setAllWarehouse(warehouse.data);
  };

  const column = useMemo(
    () => [
      { field: "id", headerName: "Id", width: 100 },
      { field: "warehouse_name", headerName: "Warehouse Name", width: 120 },
      { field: "uid", headerName: "UID", width: 120 },
      { field: "email", headerName: "Email", width: 120 },
      { field: "phone_no", headerName: "Phone No", width: 120 },
      { field: "poc_name", headerName: "POC Name", width: 120 },
      { field: "poc_ph_no", headerName: "POC Phone No", width: 120 },
      { field: "poc_email", headerName: "POC Email", width: 120 },
      { field: "gst_no", headerName: "GST Number", width: 120 },
      { field: "fssai", headerName: "FSSAI", width: 120 },
      { field: "latitude", headerName: "Latitude", width: 120 },
      { field: "longitude", headerName: "Longitude", width: 120 },
      { field: "billing_address", headerName: "Billing Address", width: 120 },
      { field: "address", headerName: "Office Address", width: 120 },
      {
        field: "Action",
        headerName: "Action",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(
                `/editwarehouse/${params.row.id}`
              );
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
              onChangeWarehouseStatus(params.row.id)
            }}
          >
            {params.row.is_active === 1 ? "Active" : "Inactive"}
          </button>
        ),
      },
    ],
    [navigate]
  );

  const onChangeWarehouseStatus = async (id) => {
    const url = `${api}/change_warehouse_status/${id}`;
    setUpdaing(false);
    const warehouse = await GET(token, url);
    if (warehouse.response === 200) {
      getWarehouse();
      setalertType("success");
      setalertMsg("warehouse Status updated successfully");
      handleSnakBarOpen();
      setUpdaing(true);
    } else {
      setUpdaing(true);
      setalertType("error");
      setalertMsg(warehouse.message || "Error updating Warehouse");
      handleSnakBarOpen();
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Warehouse Name",
      "UID",
      "Email",
      "Phone No",
      "POC Name",
      "POC Phone No",
      "POC Email",
      "GST Number",
      "FSSAI",
      "Latitude",
      "Longitude",
      "Billing Address",
      "Office Address",
    ];

    const reversedWarehouses = [...warehouses].reverse();

    const csvData = reversedWarehouses.map((row, index) => [
      row.warehouse_name,
      row.uid,
      row.email,
      row.phone_no,
      row.poc_name,
      row.poc_ph_no,
      row.poc_email,
      row.gst_no,
      row.fssai,
      row.latitude,
      row.longitude,
      row.billing_address,
      row.address,
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouses Reports");

    const fileName = `Warehouses_Reports_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.csv`;
    XLSX.writeFile(workbook, fileName);
  };





  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Warehouses Reports";
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

      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "Warehouse Name", dataKey: "warehouse_name" },
        { header: "UID", dataKey: "uid" },
        { header: "Email", dataKey: "email" },
        { header: "Phone No", dataKey: "phone_no" },
        { header: "POC Name", dataKey: "poc_name" },
        { header: "POC Phone No", dataKey: "poc_ph_no" },
        { header: "POC Email", dataKey: "poc_email" },
        { header: "GST Number", dataKey: "gst_no" },
        { header: "FSSAI", dataKey: "fssai" },
        { header: "Latitude", dataKey: "latitude" },
        { header: "Longitude", dataKey: "longitude" },
        { header: "Billing Address", dataKey: "billing_address" },
        { header: "Office Address", dataKey: "address" },
      ];

      const reversedWarehouses = [...warehouses].reverse();

      const tableRows = reversedWarehouses.map((row, index) => ({
        sno: index + 1,
        warehouse_name: row.warehouse_name,
        uid: row.uid,
        email: row.email,
        phone_no: row.phone_no,
        poc_name: row.poc_name,
        poc_ph_no: row.poc_ph_no,
        poc_email: row.poc_email,
        gst_no: row.gst_no,
        fssai: row.fssai,
        latitude: row.latitude,
        longitude: row.longitude,
        billing_address: row.billing_address,
        address: row.address,
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) =>
          Object.keys(row).map((key) => row[key])
        ),
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
          0: { cellWidth: 11 }, // S.No column
          1: { cellWidth: 25 }, // Warehouse Name
          2: { cellWidth: 12 }, // UID
          3: { cellWidth: 25 }, // Email
          4: { cellWidth: 22 }, // Phone No
          5: { cellWidth: 25 }, // POC Name
          6: { cellWidth: 20 }, // POC Phone No
          7: { cellWidth: 24 }, // POC Email
          8: { cellWidth: 19 }, // GST Number
          9: { cellWidth: 16 }, // FSSAI
          10: { cellWidth: 20 }, // Latitude
          11: { cellWidth: 23 }, // Longitude
          12: { cellWidth: 20 }, // Billing Address
          13: { cellWidth: 20 }, // Office Address
        },
        tableWidth: "wrap", // Adjust table width to fit contents
        showHead: "firstPage",
      });


      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`;
        const marginRight = 15;

        doc.setFontSize(9);
        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - 10
        );
      }

      doc.save(`Warehouses_Reports_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.pdf`);
    });
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
        <div style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center"
        }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            disabled={warehouses.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={warehouses.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/newwarehouse");
          }}
        >
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
          <Typography className=""
            variant="h2"
            component={"h2"}
            fontWeight={600}
            fontSize={'1.5rem'}
            lineHeight={'2rem'}
            sx={{
              color: theme.palette.mode === 'dark' ? '#ffffffe6' : '#0e0e23',
            }}
          >
            Manage Warehouse
          </Typography>
          <Box display={"flex"} alignItems={"center"} gap={"1rem"} width={"32.33%"}>
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
                  setWarehouses(
                    searchArrayByValue(allWarehouse, e.target.value.toLowerCase())
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {warehouses && isUpdating ? (
          <Box className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 ${theme.palette.mode === 'dark' ? "bg-darkcard" : "bg-card"
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
                backgroundColor: theme.palette.mode === 'dark' ? "#334155" : "#0e0e23",
                borderBottom: "none",
                color: "#f5f5f5",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[0],
                borderBottom: "#000",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: theme.palette.mode === 'dark' ? "#334155" : "#0e0e23",
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
              rows={warehouses}
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

export default Warehouse;
