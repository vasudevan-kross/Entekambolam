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
import { GET, UPDATE } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import moment from "moment/moment";
import { PictureAsPdf } from "@mui/icons-material";
import LoadingSkeleton from "../../Components/LoadingSkeleton";


function PIApproval() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [purchaseInvoice, setPurchaseInvoice] = useState();
  const [allPurchaseInvoice, setAllPurchaseInvoice] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isStateUpdated, setUpdatedState] = useState(false);

  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("");
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
    let purchaseInvoices = [];
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
      const getPurchaseInvoice = async () => {
        const url = `${api}/get_pending_purchaseInvoice`;
        const result = await GET(token, url);
        purchaseInvoices = result.data;
      };
      await Promise.all([getVendors(), getWarehouse(), getPurchaseInvoice()]);
    
      const updatedPurchaseInvoices = purchaseInvoices?.map((pi) => {
        const supplierName =
          vendors?.find((vendor) => vendor.id === pi.supplier_id)?.supplier_name || "";
        const warehouseName =
          warehouses?.find((warehouse) => warehouse.id === pi.warehouse_id)?.warehouse_name || "";
        const district =
          warehouses?.find((warehouse) => warehouse.id === pi.warehouse_id)?.district || "";
    
        return {
          ...pi,
          supplier_name: supplierName,
          warehouse_name: warehouseName,
          city: district,
        };
      });
      
      setPurchaseInvoice(updatedPurchaseInvoices || []);
      setAllPurchaseInvoice(updatedPurchaseInvoices || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setUpdatedState(true);
    }
  }

  const column = useMemo(
    () => [
      // { field: "id", headerName: "Id", width: 50 },
      { field: "pi_no", headerName: "PI#", width: 150 },
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
        field: "city",
        headerName: "City",
        width: 150,
      },
      {
        field: "date_of_po", headerName: "Date Of PO", width: 150,
      },
      { field: "no_of_products", headerName: "Total no. of products in PO", width: 120 },
      { field: "no_of_qty", headerName: "Total Qty in PO", width: 120 },
      {
        field: "invoice_amount",
        headerName: "Total PO Amount",
        width: 130,
        renderCell: (params) => {
          return <p>{params.row?.invoice_amount?.toFixed(2) ?? "0.00"}</p>;
        }
      },
      { field: "approval_status", headerName: "PI Status", width: 150 },
      {
        field: "Action",
        headerName: "Action",
        width: 200,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: "10px" }}>
            {(params.row.approval_status === "Pending") &&
              <button
                class="approveBtn"
                onClick={() => handleOpen(params.row.id, "approve")}
              >
                Approve
              </button>
            }
            {(params.row.approval_status === "Pending") &&
              <button
                className="rejectBtn"
                onClick={() => handleOpen(params.row.id, "reject")}
              >
                Reject
              </button>
            }
          </div>
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
              const pdfUrl = `/purchasePDFViewer/${params.row.purchase_id}/?isFrom=piApproval`;
              window.open(pdfUrl, "_blank");
            }}
          >
            <PictureAsPdf />
          </button>
        ),
      },
    ],
    [navigate, purchaseInvoice]
  );


  const handleClose = () => {
    setOpen(false);
    setActionType("");
    setSelectedId(null);
  };

  const handleOpen = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setOpen(true);
  };

  const handleConfirm = async () => {
    const admin = JSON.parse(sessionStorage.getItem("admin"));
    const data = {
      id: selectedId,
      status: actionType === "approve" ? "Approved" : "Rejected",
      approved_by: admin.loginUserId
    };
    const url = `${api}/update_purchaseInvoice_status`;
    setUpdatedState(false);
    const update = await UPDATE(token, url, data);
    if (update.response === 200) {
      getAllData();
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg(`PI ${actionType === "approve" ? "approved" : "rejected"} succesfully.`);
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
            Manage PI Approval
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
                    const keysToSearch = ["pi_no", "po_no", "supplier_name", "warehouse_name", "city", "date_of_po", "no_of_products", "no_of_qty", "invoice_amount", "approval_status"];
                    return arr.filter((obj) => {
                      return keysToSearch.some((key) => {
                        if (obj[key] !== undefined) {
                          const val = obj[key];
                          if (typeof val === "string") {
                            return val.toLowerCase().includes(searchQuery.toLowerCase());
                          }
                          if (typeof val === "number") {
                            return val.toString().toLowerCase().includes(searchQuery.toLowerCase());
                          }
                          return false;
                        }
                        return false;
                      });
                    });
                  }                
                  setPurchaseInvoice(
                    searchArrayByValue(allPurchaseInvoice, e.target.value.toLowerCase())
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
              rows={purchaseInvoice}
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
          <Typography>{`Are you sure you want to ${actionType === "approve" ? "Approve" : actionType === "paid" ? "Pay" : "Reject"
            } this PI?`}</Typography>
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
              size="small"
              variant="contained"
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

export default PIApproval;
