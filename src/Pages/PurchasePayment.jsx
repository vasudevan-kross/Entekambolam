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
import moment from "moment/moment";
import { PictureAsPdf } from "@mui/icons-material";
import Utils from "../Global/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/a_logo.png";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function PurchasePayment() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [purchasePayment, setPurchasePayment] = useState();
  const [allPurchasePayment, setAllPurchasePayment] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isStateUpdated, setUpdatedState] = useState(false);

  const [open, setOpen] = useState(false);
  const [prModalOpen, setPRModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const dispatch = useDispatch();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = async () => {
    let vendors = [];
    let warehouses = [];
    let purchasePayments = [];
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
      const getPurchasePayment = async () => {
        const url = `${api}/get_purchasePayment`;
        const result = await GET(token, url);
        purchasePayments = result.data;
      };
      await Promise.all([getVendors(), getWarehouse(), getPurchasePayment()]);

      const updatedPurchasePayments = purchasePayments?.map((pp) => {
        const supplierName =
          vendors?.find((vendor) => vendor.id === pp.supplier_id)
            ?.supplier_name || "";
        const warehouseName =
          warehouses?.find((warehouse) => warehouse.id === pp.warehouse_id)
            ?.warehouse_name || "";

        return {
          ...pp,
          supplier_name: supplierName,
          warehouse_name: warehouseName,
        };
      });
      setPurchasePayment(updatedPurchasePayments || []);
      setAllPurchasePayment(updatedPurchasePayments || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setUpdatedState(true);
    }
  };

  const column = useMemo(
    () => [
      // { field: "id", headerName: "Id", width: 50 },
      { field: "pi_no", headerName: "PI#", width: 150 },
      { field: "pr_no", headerName: "PR#", width: 150 },
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
      {
        field: "date_of_po",
        headerName: "Date Of PI",
        width: 150,
      },
      {
        field: "invoice_amount",
        headerName: "Total PI Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.value?.toFixed(2) ?? "0.00"}</p>;
        },
      },
      {
        field: "return_amount",
        headerName: "Total PR Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.value?.toFixed(2) ?? "0.00"}</p>;
        },
      },
      {
        field: "total_amount",
        headerName: "Total Payable",
        width: 130,
        renderCell: (params) => {
          return <p>{params.value?.toFixed(2) ?? "0.00"}</p>;
        },
      },
      { field: "payment_status", headerName: "Payment Status", width: 150 },
      {
        field: "sendApprove",
        headerName: "Request Approval",
        width: 150,
        renderCell: (params) =>
          params.row.payment_status === "New" && (
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
        field: "view_pdf",
        headerName: "View PDF",
        width: 100,
        renderCell: (params) => (
          <button
            className="viewPdfBtn"
            onClick={() => {
              const paramId = params.row.return_amount
                ? params.row.id
                : params.row.purchase_id;
              const paramIdFrom = params.row.return_amount ? "PR" : "PP";
              const pdfUrl = `/purchasePDFViewer/${paramId}/?isFrom=purchasePayment&paramIdFrom=${paramIdFrom}`;
              window.open(pdfUrl, "_blank");
            }}
          >
            <PictureAsPdf />
          </button>
        ),
      },
    ],
    [navigate, purchasePayment]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "PI #",
      "PR #",
      "PO #",
      "Warehouse Name",
      "Supplier Name",
      "Date Of PI",
      "Total PI Amount",
      "Total PR Amount",
      "Total Payable",
      "Payment Status",
    ];

    const reversedReports = [...purchasePayment].reverse();

    const csvData = reversedReports
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((row, index) => {
        return [
          index + 1,
          row.pi_no,
          row.pr_no,
          row.po_no,
          row.supplier_name,
          row.warehouse_name,
          row.date_of_po,
          row?.invoice_amount?.toFixed(2) ?? "0.00",
          row?.return_amount?.toFixed(2) ?? "0.00",
          row?.total_amount?.toFixed(2) ?? "0.00",
          row.payment_status,
        ];
      });

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Payment");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Purchase_Payment ${Utils.formatDateToDDMMYYYY(new Date())}.csv`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add the header text

    doc.setFontSize(18);
    const headerText = "Purchase Payment";
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
        { header: "PI #", dataKey: "pi_no" },
        { header: "PR #", dataKey: "pr_no" },
        { header: "PO #", dataKey: "po_no" },
        { header: "Supplier Name", dataKey: "supplier_name" },
        { header: "Warehouse Name", dataKey: "warehouse_name" },
        { header: "Date Of PI", dataKey: "date_of_pi" },
        { header: "Total PI Amount", dataKey: "pi_amt" },
        { header: "Total PR Amount", dataKey: "pr_amt" },
        { header: "Total Payable", dataKey: "total_payable" },
        { header: "Payment Status", dataKey: "payment_status" },
      ];

      const reversedReports = [...purchasePayment].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((row, index) => ({
          sno: index + 1,
          pi_no: row.pi_no,
          pr_no: row.pr_no,
          po_no: row.po_no,
          supplier_name: row.supplier_name,
          warehouse_name: row.warehouse_name,
          date_of_pi: row.date_of_po,
          pi_amt: row?.invoice_amount?.toFixed(2) ?? "0.00",
          pr_amt: row?.return_amount?.toFixed(2) ?? "0.00",
          total_payable: row?.total_amount?.toFixed(2) ?? "0.00",
          payment_status: row.payment_status,
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
        margin: { left: 10 },
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
          1: { cellWidth: 28 }, //PI #
          2: { cellWidth: 30 }, //PR#
          3: { cellWidth: 30 }, //PO #
          4: { cellWidth: 30 }, //Supplier Name
          5: { cellWidth: 30 }, //Warehouse Name
          6: { cellWidth: 25 }, //Date of PI
          7: { cellWidth: 24 }, //Total products in PO
          8: { cellWidth: 20 }, //Total PI Amount
          9: { cellWidth: 25 }, //Total PR Amount
          10: { cellWidth: 25 }, //Total Payable
          11: { cellWidth: 25 }, //Payment Status
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
        `Purchase_Payment ${Utils.formatDateToDDMMYYYY(new Date())}.pdf`
      );
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const handleOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handlePRModalClose = () => {
    setPRModalOpen(false);
    setSelectedId(null);
  };

  const handlePRModalOpen = (id) => {
    setSelectedId(id);
    setPRModalOpen(true);
  };

  const handlePRRejectConfirm = async () => {
    const url = `${api}/send_pp_approval_reject_pr/${selectedId}`;
    const updatePRApproval = await GET(token, url);
    if (updatePRApproval.response === 200) {
      getAllData();
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg(`PP sent to Approval.`);
    } else if (updatePRApproval.response === 201) {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(updatePRApproval.message);
    } else {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
    handlePRModalClose();
  };

  const handleConfirm = async () => {
    const url = `${api}/send_pp_approval/${selectedId}`;
    setUpdatedState(false);
    const update = await GET(token, url);
    if (update.response === 202) {
      console.log(update.message);
      setOpen(false);
      handlePRModalOpen(selectedId);
      setUpdatedState(true);
      return;
    }
    if (update.response === 200) {
      getAllData();
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg(`PP sent to Approval.`);
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
            disabled={purchasePayment.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={purchasePayment.length === 0}
          >
            Export to PDF
          </Button>
        </div>
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
            Manage Purchase Payment
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
                    const keysToSearch = [
                      "pi_no",
                      "pr_no",
                      "po_no",
                      "supplier_name",
                      "warehouse_name",
                      "date_of_po",
                      "invoice_amount",
                      "return_amount",
                      "total_amount",
                      "payment_status",
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
                          return false;
                        }
                        return false;
                      });
                    });
                  }
                  setPurchasePayment(
                    searchArrayByValue(
                      allPurchasePayment,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {isStateUpdated ? (
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
              rows={purchasePayment}
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
          <Typography>
            Are you sure you want to send Approval this Purchase Payment?
          </Typography>
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

      <Modal
        open={prModalOpen}
        onClose={handlePRModalClose}
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
          <Typography>
            This PP already has Purchase Return, Are you still want to send
            Approval for this Purchase Payment?
          </Typography>
          <Typography style={{ fontWeight: "bold", marginTop: "8px" }}>
            Note: If you confirm "Yes", the attached PR will be auto-rejected.
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handlePRRejectConfirm}
              color="primary"
              variant="contained"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Yes
            </Button>
            <Button
              onClick={handlePRModalClose}
              color="secondary"
              variant="contained"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              No
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default PurchasePayment;
