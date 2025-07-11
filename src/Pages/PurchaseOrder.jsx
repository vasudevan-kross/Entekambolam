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
  Modal,
  Button,
} from "@mui/material";
import Box from "@mui/material/Box";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET, UPDATE } from "../Functions/apiFunction";
import api from "../Data/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import Vendor from "./Supplier";
import { PictureAsPdf } from "@mui/icons-material";
import Utils from "../Global/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/a_logo.png";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function PurchaseOrder() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [purchaseOrders, setPurchaseOrders] = useState();
  const [allPurchaseOrders, setAllPurchaseOrders] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isStateUpdated, setUpdatedState] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = async () => {
    let vendors = [];
    let warehouses = [];
    let purchaseOrders = [];
    setUpdatedState(false);
    try {
      const getVendors = async () => {
        const url = `${api}/get_vendors`;
        const result = await GET(token, url);
        vendors = result.data;
      };
      const getWarehouse = async () => {
        const url = `${api}/get_warehouse`;
        const result = await GET(token, url);
        warehouses = result.data;
      };
  
      const getPurchaseOrders = async () => {
        const url = `${api}/get_purchaseOrder`;
        const result = await GET(token, url);
        purchaseOrders = result.data;
      };
  
      await Promise.all([getVendors(), getWarehouse(), getPurchaseOrders()]);
    
      const updatedPurchaseOrders = purchaseOrders?.map((po) => {
        const supplierName =
          vendors?.find((vendor) => vendor.id === po.supplier_id)?.supplier_name || "";
        const warehouseName =
          warehouses?.find((warehouse) => warehouse.id === po.warehouse_id)?.warehouse_name || "";
        const district =
          warehouses?.find((warehouse) => warehouse.id === po.warehouse_id)?.district || "";
    
        return {
          ...po,
          supplier_name: supplierName,
          warehouse_name: warehouseName,
          city: district,
        };
      });
  
      setPurchaseOrders(updatedPurchaseOrders || []);
      setAllPurchaseOrders(updatedPurchaseOrders || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setUpdatedState(true);
    }
  }
  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const handleOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleConfirm = async () => {
    const url = `${api}/send_po_approval/${selectedId}`;
    setUpdatedState(false);
    const update = await GET(token, url);
    if (update.response === 200) {
      getAllData();
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg(`PO sent to Approval.`);
    } else if (update.response === 201) {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(update.message);
    } else {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
    handleClose();
  };

  const column = useMemo(
    () => [
      // { field: "id", headerName: "Id", width: 50 },
      { field: "po_no", headerName: "PO#", width: 150 },
      {
        field: "supplier_name",
        headerName: "Supplier Name",
        width: 150
      },
      {
        field: "warehouse_name",
        headerName: "Warehouse Name",
        width: 150
      },
      { field: "city", headerName: "City", width: 150 },
      {
        field: "date_of_po", headerName: "Date Of Purchase Order", width: 150
      },
      {
        field: "date_of_delivery", headerName: "Date Of Delivery", width: 150
      },
      { field: "delivery_time", headerName: "Delivery Time", width: 120 },
      { field: "no_of_products", headerName: "Total no. of products in PO", width: 120 },
      { field: "no_of_qty", headerName: "Total Qty in PO", width: 120 },
      {
        field: "total_amount",
        headerName: "Total PO Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.value?.toFixed(2) ?? "0.00"}</p>;
        }
      },
      { field: "po_status", headerName: "PO Status", width: 120 },
      {
        field: "sendApprove",
        headerName: "Request Approval",
        width: 150,
        renderCell: (params) => (
          params.row.po_status === "New" &&
          <button
            class="approveBtn"
            style={{ width: "100px" }}
            onClick={() => {
              handleOpen(params.row.id);
            }}
          >
            Send Approval
          </button>
        ),
      },
      {
        field: "Edit",
        headerName: "Edit",
        width: 100,
        renderCell: (params) => (
          (params.row.po_status === "New" || params.row.po_status === "Pending") &&
          <button
            class="updateBtn"
            onClick={() => {
              navigate(
                `/editpurchaseorder/${params.row.id}`
              );
            }}
          >
            <i class="fa-regular fa-pen-to-square" style={{ color: "white" }}></i>
          </button>
        ),
      },
      {
        field: "view_pdf",
        headerName: "View PDF",
        width: 100,
        renderCell: (params) => (
          <button
            className="viewPdfBtn"
            onClick={() => {
              const pdfUrl = `/purchasePDFViewer/${params.row.id}/?isFrom=purchaseOrder`;
              window.open(pdfUrl, "_blank");
            }}
          >
            <PictureAsPdf />
          </button>
        ),
      },
    ],
    [navigate, purchaseOrders]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "PO #",
      "Supplier Name",
      "Warehouse Name",
      "City",
      "Date Of Purchase Order",
      "Date Of Delivery",
      "Delivery Time",
      "Total no. of products in PO",
      "Total Qty in PO",
      "Total PO Amount",
      "PO Status"
    ];

    const reversedReports = [...purchaseOrders].reverse();

    const csvData = reversedReports
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((row, index) => {
        return [
          index + 1,
          row.po_no,
          row. supplier_name,
          row.warehouse_name,
          row.city,
          row.date_of_po,
          row.date_of_delivery,
          row.delivery_time,
          row.no_of_products,
          row.no_of_qty,
          row?.total_amount.toFixed(2) ?? "0.00",
          row.po_status
        ];
      });

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Order");

    // Set the filename and download
    XLSX.writeFile(workbook, `Purchase_Order ${Utils.formatDateToDDMMYYYY(new Date())}.csv`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add the header text
   
    doc.setFontSize(18);
    const headerText = "Purchase Order";
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
        { header: "PO #", dataKey: "po_no" },
        { header: "Supplier Name", dataKey: "supplier_name" },
        { header: "Warehouse Name", dataKey: "warehouse_name" },
        { header: "City", dataKey: "city" },
        { header: "Date Of Purchase Order", dataKey: "date_of_po" },
        { header: "Date Of Delivery", dataKey: "date_of_delivery" },
        { header: "Delivery Time", dataKey: "delivery_time" },
        { header: "Total no. of products in PO", dataKey: "total_prdt" },
        { header: "Total Qty in PO", dataKey: "total_qty" },
        { header: "Total PO Amount", dataKey: "po_amt" },
        { header: "PO Status", dataKey: "po_status" },
      ];

      const reversedReports = [...purchaseOrders].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((row, index) => ({
          sno: index + 1,
          po_no: row.po_no,
          supplier_name: row.supplier_name,
          warehouse_name: row.warehouse_name,
          city: row.city,
          date_of_po: row.date_of_po,
          date_of_delivery: row.date_of_delivery,
          delivery_time: row.delivery_time,
          total_prdt: row.no_of_products,
          total_qty: row.no_of_qty,
          po_amt: row?.total_amount.toFixed(2) ?? "0.00",
          po_status: row.po_status
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
        margin: { left: 6 },
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
          0: { cellWidth: 11 }, //S.no
          1: { cellWidth: 20 }, //PO #
          2: { cellWidth: 23 }, //Supplier Name
          3: { cellWidth: 30 }, //Warehouse Name
          4: { cellWidth: 32 }, //City
          5: { cellWidth: 24 }, //Date of purchase order
          6: { cellWidth: 28 }, //Date of delivery
          7: { cellWidth: 20 }, //Delivery time
          8: { cellWidth: 25 }, //Total products in PO
          9: { cellWidth: 25 }, //Total Qty
          10: { cellWidth: 25 }, //Total PO Amount
          11: { cellWidth: 20 }, //PO Status
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
      doc.save(`Purchase_Order ${Utils.formatDateToDDMMYYYY(new Date())}.pdf`);
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
            disabled={purchaseOrders.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={purchaseOrders.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/newpurchaseorder");
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
            Manage Purchase Order
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
                      return Object.entries(obj).some(([key, val]) => {
                        if (
                          key !== "id" &&
                          key !== "supplier_id" &&
                          key !== "warehouse_id"
                        ) {
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
                
                  setPurchaseOrders(
                    searchArrayByValue(
                      allPurchaseOrders,
                      e.target?.value?.toLowerCase()
                    )
                  );
                }, 500);
                
              }}
            />
          </Box>
        </Box>

        {isStateUpdated ? (
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
              rows={purchaseOrders}
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography>Are you sure you want to send Approval this PO?</Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handleClose}
              color="primary"
              variant="contained"
              size="small"
              style={{
                padding: "8px 16px",
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirm}
              color="secondary"              
              variant="contained"
              size="small"
              style={{
                padding: "8px 16px",
              }}
            >
              Confirm
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default PurchaseOrder;
