import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { tokens } from "../../theme";
import { GET, PUT, ADD } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import LoadingSkeleton from "../../Components/LoadingSkeleton";
import dayjs from "dayjs";

function Coupons() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMsg, setAlertMsg] = useState("");
  const [open, setOpen] = useState(false);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pageSize, setpageSize] = useState(20);

  const [form, setForm] = useState({
    code: "",
    type: 1,
    value: "",
    min_cart_value: "",
    max_uses_per_user: "",
    start_at: "",
    expires_at: "",
    description: "",
    is_active: true,
    max_discount_amount: 0,
    first_time_user_only: false,
  });

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const getToday = () => new Date().toISOString().split("T")[0];

  const getMinStartDate = () => {
    const today = getToday();
    if (editingId && form.start_at) {
      const startDate = form.start_at.split("T")[0];
      return startDate < today ? startDate : today;
    }
    return today;
  };

  const getMinExpiryDate = () => {
    return form.start_at ? form.start_at.split("T")[0] : getToday();
  };

  const handleSnackbar = (type, msg) => {
    setAlertType(type);
    setAlertMsg(msg);
    setSnackbarOpen(true);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await GET(token, `${api}/get_all_coupons`);
    if (res?.data) {
      setCoupons(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);
  const handleSubmit = async () => {
    // Basic client-side validation
    if (
      !form.code ||
      !form.type ||
      !form.value ||
      !form.start_at ||
      !form.expires_at
    ) {
      handleSnackbar("error", "Please fill all required fields.");
      return;
    }

    if (Number(form.value) <= 0) {
      handleSnackbar("error", "Value must be a positive number.");
      return;
    }

    const start = new Date(form.start_at);
    const end = new Date(form.expires_at);

    if (start >= end) {
      handleSnackbar("error", "Expiry date must be after start date.");
      return;
    }

    const payload = { ...form };
    const url = editingId
      ? `${api}/update_coupon/${editingId}`
      : `${api}/add_coupon`;
    const method = editingId ? PUT : ADD;

    setCreating(true);
    try {
      const res = await method(token, url, payload);

      if (res.status) {
        handleSnackbar("success", "Coupon saved successfully");

        setForm({
          code: "",
          type: "amount",
          value: "",
          min_cart_value: "",
          max_uses: "",
          max_uses_per_user: "",
          is_active: true,
          first_time_user_only: false,
          max_discount_amount: 0,
          start_at: "",
          expires_at: "",
          description: "",
        });

        setEditingId(null);
        setOpen(false);
        fetchCoupons();
      } else {
        handleSnackbar("error", res.message || "Operation failed");
      }
    } catch (error) {
      console.error("Coupon submission failed:", error);
      handleSnackbar("error", "Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAdd = () => {
    setForm({
      code: "",
      type: "amount",
      value: "",
      min_cart_value: "",
      max_uses: "",
      max_uses_per_user: "",
      is_active: true,
      first_time_user_only: false,
      max_discount_amount: 0,
      start_at: "",
      expires_at: "",
      description: "",
    });
    setEditingId(null);
    setOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type || "amount",
      value: coupon.value,
      min_cart_value: coupon.min_cart_value || "",
      max_uses: coupon.max_uses || "",
      max_uses_per_user: coupon.max_uses_per_user || "",
      is_active: coupon.is_active,
      first_time_user_only: coupon.first_time_user_only,
      max_discount_amount: coupon.max_discount_amount || 0,
      start_at: coupon.start_at || "",
      expires_at: coupon.expires_at || "",
      description: coupon.description || "",
    });
    setEditingId(coupon.id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };
  const columns = useMemo(
    () => [
      { field: "code", headerName: "Code", flex: 1 },

      {
        field: "type",
        headerName: "Type",
        flex: 1,
        renderCell: ({ row }) => (row.type === 1 ? "Amount" : "Percentage"),
      },

      { field: "value", headerName: "Value", flex: 1 },

      {
        field: "min_cart_value",
        headerName: "Min Cart",
        flex: 1,
        renderCell: ({ row }) => row.min_cart_value || "N/A",
      },
      {
        field: "max_discount_amount",
        headerName: "Max Discount Amount",
        flex: 1,
        renderCell: ({ row }) => row.max_discount_amount || "N/A",
      },
      {
        field: "max_uses_per_user",
        headerName: "Per User Limit",
        flex: 1,
        renderCell: ({ row }) => row.max_uses_per_user || "N/A",
      },

      {
        field: "start_at",
        headerName: "Start Date",
        flex: 1.2,
        renderCell: ({ row }) =>
          row.start_at ? dayjs(row.start_at).format("DD-MM-YYYY") : "N/A",
      },

      {
        field: "expires_at",
        headerName: "Expires At",
        flex: 1.2,
        renderCell: ({ row }) => {
          if (!row.expires_at) return "N/A";

          const today = dayjs().startOf("day");
          const expiryDate = dayjs(row.expires_at).startOf("day");
          const isExpiredToday =
            expiryDate.isSame(today) || expiryDate.isBefore(today);

          return (
            <span
              style={{
                color: isExpiredToday ? "red" : "inherit",
                fontWeight: isExpiredToday ? "bold" : "normal",
              }}
            >
              {dayjs(row.expires_at).format("DD-MM-YYYY")}
            </span>
          );
        },
      },
      {
        field: "first_time_user_only",
        headerName: "First Time Only",
        flex: 1,
        renderCell: ({ row }) => (
          <span
            style={{
              color: row.first_time_user_only ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {row.first_time_user_only ? "Yes" : "No"}
          </span>
        ),
      },
      {
        field: "is_active",
        headerName: "Status",
        flex: 1,
        renderCell: ({ row }) => (
          <span
            style={{
              color: row.is_active ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {row.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },

      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        flex: 1,
        renderCell: ({ row }) => (
          <button class="updateBtn" onClick={() => handleOpenEdit(row)}>
            <i
              class="fa-regular fa-pen-to-square"
              style={{ color: "white" }}
            ></i>
          </button>
        ),
      },
    ],
    []
  );
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
          {/* <Button
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
            </Button> */}
        </div>

        <button class="cssbuttons-io-button" onClick={handleOpenAdd}>
          Add New
          <div class="icon">
            <i class="fa-regular fa-plus"></i>
          </div>
        </button>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={alertType}>
          {alertMsg}
        </Alert>
      </Snackbar>

      <Box className="flex items-center justify-between title-menu">
        <Typography variant="h2" fontWeight={600} fontSize="1.5rem">
          Manage Coupons
        </Typography>
      </Box>
      <Box className="mt-6">
        {loading ? (
          <LoadingSkeleton rows={6} height={30} />
        ) : (
          <Box
            sx={{
              height: 500,
              width: "100%",
              mt: 2,
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .MuiDataGrid-row": {
                fontSize: "14px",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#334155" : "#0e0e23",
                color: "#f5f5f5",
                borderBottom: "none",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#334155" : "#0e0e23",
                borderTop: "none",
                color: "#f5f5f5",
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
            }}
          >
            <DataGrid
              rows={coupons}
              columns={columns}
              pageSize={pageSize}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              onPageSizeChange={(newSize) => setpageSize(newSize)}
              getRowId={(row) => row.id}
              localeText={{ noRowsLabel: "No records found" }}
            />
          </Box>
        )}
      </Box>

      {/* Coupon Form Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="coupon-modal"
        aria-describedby="add-or-edit-coupon"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor:
              theme.palette.mode === "dark" ? "#1e1e2f" : "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Close Button */}
          <Button
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              minWidth: "auto",
              width: 32,
              height: 32,
              borderRadius: "50%",
              padding: 0,
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
              },
              zIndex: 1,
            }}
          >
            <i className="fa-solid fa-times" style={{ fontSize: "16px" }}></i>
          </Button>

          <Typography variant="h4" fontWeight={600} mb={3}>
            {editingId ? "Edit Coupon" : "Add New Coupon"}
          </Typography>

          <Box component="form" sx={{ flexGrow: 1 }}>
            <Stack spacing={3}>
              <TextField
                label="Coupon Code"
                value={form.code}
                required
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                fullWidth
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <FormControl fullWidth>
                  <InputLabel id="coupon-type-label">Type</InputLabel>
                  <Select
                    labelId="coupon-type-label"
                    value={form.type}
                    label="Type"
                    required
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <MenuItem value={1}>Amount</MenuItem>
                    <MenuItem value={2}>Percentage</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Value"
                  type="number"
                  required
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  fullWidth
                />
                {form.type === 2 && (
                  <>
                    <TextField
                      label="Max Discount Amount"
                      type="number"
                      required
                      value={form.max_discount_amount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          max_discount_amount: e.target.value,
                        })
                      }
                      fullWidth
                    />
                    <Typography
                      variant="body2"
                      style={{ color: "red", marginTop: "4px" }}
                    >
                      Note: If "Max Discount Amount" = 0, the discount is
                      applied fully based on the set %. If a value is set (e.g.,
                      100), the discount is capped at that amount.
                    </Typography>
                  </>
                )}
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Minimum Cart Value"
                  type="number"
                  required
                  value={form.min_cart_value}
                  onChange={(e) =>
                    setForm({ ...form, min_cart_value: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Max usage limit per user"
                  type="number"
                  required
                  value={form.max_uses_per_user}
                  onChange={(e) =>
                    setForm({ ...form, max_uses_per_user: e.target.value })
                  }
                  fullWidth
                />
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Start Date"
                  type="date"
                  required
                  value={form.start_at ? form.start_at.split("T")[0] : ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      start_at: e.target.value
                        ? `${e.target.value}T00:00:00`
                        : "",
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: getMinStartDate(),
                  }}
                />

                <TextField
                  label="Expiry Date"
                  type="date"
                  required
                  value={form.expires_at ? form.expires_at.split("T")[0] : ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expires_at: e.target.value
                        ? `${e.target.value}T00:00:00`
                        : "",
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: getMinExpiryDate(),
                  }}
                />
              </Box>

              <TextField
                label="Description"
                multiline
                rows={3}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                fullWidth
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.is_active}
                      color="secondary"
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                    />
                  }
                  label="Is Active"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.first_time_user_only}
                      color="secondary"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          first_time_user_only: e.target.checked,
                        })
                      }
                    />
                  }
                  label="For First Time Users Only"
                />
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={creating}
              fullWidth
              sx={{ mt: 2 }}
            >
              {creating ? <CircularProgress size={20} /> : "Save Coupon"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default Coupons;
