import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/system";
import {
  Button,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Select,
  MenuItem,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import TextField from "@mui/material/TextField";
import api from "../Data/api";
import { ADD, GET } from "../Functions/apiFunction";
import { tokens } from "../theme";
import Skeleton from "@mui/material/Skeleton";
import moment from "moment";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function NewPurchaseOrder() {
  const theme = useTheme();
  const param = useParams();
  const [searchParams] = useSearchParams();
  const isFrom = searchParams.get("isFrom");
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [LOADING, setLOADING] = useState(false);
  const [isStateUpdated, setUpdatedState] = useState(true);
  const [pageSize, setPageSize] = useState(5);

  const [supplierId, setSupplierId] = useState();
  const [warehouseId, setWarehouseId] = useState();
  const [city, setCity] = useState();
  const [poDate, setPODate] = useState();
  const [deliveryDate, setDeliveryDate] = useState();
  const [deliveryTime, setDeliveryTime] = useState();
  const [poStatus, setPOStatus] = useState();

  const [productRows, setProductRows] = useState([
    {
      id: 0,
      rowId: 1,
      product_id: "",
      price: "",
      tax: "",
      quantity: "",
      amount: "",
      tax_amount: "",
      net_amount: "",
      comments: "",
      isEditing: true,
    },
  ]);
  const [vendors, setVendors] = useState();
  const [warehouse, setWarehouse] = useState();
  const [products, setProducts] = useState();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const getVendors = async () => {
      setUpdatedState(false);
      const url = `${api}/get_vendors`;
      const result = await GET(token, url);
      setVendors(result.data);
    };
    const getWarehouse = async () => {
      const url = `${api}/get_warehouse`;
      const result = await GET(token, url);
      setWarehouse(result.data);
    };
    const getAllProduct = async () => {
      const url = `${api}/get_all_product`;
      const result = await GET(token, url);
      setProducts(result.data);
      if (!param.id) {
        setUpdatedState(true);
      }
    };
    const getPurchaseOrders = async () => {
      const url = `${api}/get_purchaseOrder_by_id/${param.id}`;
      const result = await GET(token, url);
      if (result.response === 200) {
        const purchaseOrder = result.data;
        setSupplierId(purchaseOrder.supplier_id);
        setWarehouseId(purchaseOrder.warehouse_id);
        setCity(purchaseOrder.city);
        setPODate(purchaseOrder.date_of_po);
        setDeliveryDate(purchaseOrder.date_of_delivery);
        setPOStatus(purchaseOrder.po_status);
        setDeliveryTime(purchaseOrder.delivery_time);

        const products = purchaseOrder.products.map((product, index) => ({
          id: product.id,
          rowId: index + 1,
          product_id: product.product_id,
          price: product.price,
          tax: product.tax,
          quantity: product.quantity,
          amount: product.amount,
          tax_amount: product.tax_amount,
          net_amount: product.net_amount,
          comments: product.comments,
          isEditing: false,
        }));
        setProductRows(products);
      }
      setUpdatedState(true);
    };
    getVendors();
    getWarehouse();
    getAllProduct();
    getPurchaseOrders();
  }, []);

  const addPurchaseOrder = async (e) => {
    e.preventDefault();
    const purchaseDate = new Date(poDate);
    const deliverDate = new Date(deliveryDate);
    if (purchaseDate > deliverDate) {
      setalertType("error");
      setalertMsg("Date of Deliver is earlier than the Date of Purchase Order");
      handleSnakBarOpen();
      return;
    }
    const unSelectedRow = productRows.find((row) => row.product_id === "");
    if (unSelectedRow) {
      setalertType("error");
      setalertMsg("please fill the product details in all the pages");
      handleSnakBarOpen();
      return;
    }

    var isSendApproval = e.nativeEvent.submitter.name;
    setLOADING(true);
    const purchaseOrderData = {
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      city: city,
      date_of_po: poDate,
      date_of_delivery: deliveryDate,
      delivery_time: deliveryTime,
      productData: productRows,
      status: isSendApproval === "SendApprove" ? "Pending" : "New",
    };
    const data = JSON.stringify(purchaseOrderData);
    const url = `${api}/add_purchaseOrder`;
    const addPurchaseOrder = await ADD(token, url, data);
    if (addPurchaseOrder.response === 200) {
      setalertType("success");
      setalertMsg("New Purchase Order Added successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/PurchaseOrder");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(addPurchaseOrder.message || "Error adding Purchase Order");
      handleSnakBarOpen();
      setLOADING(false);
    }
  };

  const updatePurchaseOrder = async (e) => {
    e.preventDefault();
    const purchaseDate = new Date(poDate);
    const deliverDate = new Date(deliveryDate);
    if (purchaseDate > deliverDate) {
      setalertType("error");
      setalertMsg("Date of Deliver is earlier than the Date of Purchase Order");
      handleSnakBarOpen();
      return;
    }
    const unSelectedRow = productRows.find((row) => row.product_id === "");
    if (unSelectedRow) {
      setalertType("error");
      setalertMsg("please fill the product details in all the pages");
      handleSnakBarOpen();
      return;
    }

    var isSendApproval = e.nativeEvent.submitter.name;
    setLOADING(true);
    const purchaseOrderData = {
      id: param.id,
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      city: city,
      date_of_po: poDate,
      date_of_delivery: deliveryDate,
      delivery_time: deliveryTime,
      productData: productRows,
      status: isSendApproval === "SendApprove" ? "Pending" : "New",
    };
    const data = JSON.stringify(purchaseOrderData);
    const url = `${api}/update_purchaseOrder`;
    const updatePurchaseOrder = await ADD(token, url, data);
    if (updatePurchaseOrder.response === 200) {
      setalertType("success");
      setalertMsg("Purchase Order Updated successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/PurchaseOrder");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(
        updatePurchaseOrder.message || "Error updating Purchase Order"
      );
      handleSnakBarOpen();
      setLOADING(false);
    }
  };

  const columns = [
    {
      field: "Actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <div>
          {params.row.isEditing ? (
            <button
              class="cssbuttons-io-button"
              style={{ width: "50px" }}
              type="button"
              onClick={() =>
                handleSave(
                  params.row.rowId,
                  params.row.product_id,
                  params.row.quantity
                )
              }
            >
              Save
            </button>
          ) : (
            <button
              class="cssbuttons-io-button"
              style={{ width: "50px" }}
              type="button"
              onClick={() => handleEdit(params.row.rowId)}
            >
              Edit
            </button>
          )}
        </div>
      ),
    },
    { field: "rowId", headerName: "Id", width: 50 },
    {
      field: "product_id",
      headerName: "Product",
      width: 350,
      renderCell: (params) =>
        params.row.isEditing ? (
          <Autocomplete
            disablePortal={false}
            fullWidth
            clearIcon={false}
            id="combo-box-demo"
            color="secondary"
            options={products || []}
            value={
              products?.find((product) => product.id === params.value) || null
            }
            onChange={(e, value) => {
              handleEditChange(params.row.rowId, "product_id", value.id);
            }}
            getOptionLabel={(option) =>
              `${option?.title} (${option?.qty_text})` || ""
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product"
                size="small"
                sx={{ fontSize: "12px" }}
                fullWidth
                required
                color="secondary"
              />
            )}
          />
        ) : (
          products?.find((product) => product.id === params.value)?.title || ""
        ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 100,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            margin="normal"
            required
            id="Price"
            type="number"
            color="secondary"
            value={params.value}
            InputProps={{ inputProps: { min: 1 } }}
            onChange={(e) =>
              handleEditChange(params.row.rowId, "quantity", e.target.value)
            }
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            disabled
            margin="normal"
            required
            id="Price"
            type="text"
            color="secondary"
            value={params.value}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "tax",
      headerName: "Tax",
      width: 100,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            disabled
            margin="normal"
            required
            id="Tax"
            type="text"
            color="secondary"
            value={params.value}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 100,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            disabled
            margin="normal"
            required
            id="Amount"
            type="text"
            color="secondary"
            value={params.value}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "tax_amount",
      headerName: "Tax Amount",
      width: 100,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            disabled
            margin="normal"
            required
            id="TaxAmount"
            type="text"
            color="secondary"
            value={params.value}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "net_amount",
      headerName: "Net Amount",
      width: 100,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            disabled
            margin="normal"
            required
            id="Net Amount"
            type="text"
            color="secondary"
            value={params.value}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 200,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            margin="normal"
            id="Comments"
            name="Comments"
            type="text"
            color="secondary"
            onChange={(e) => {
              handleEditChange(params.row.rowId, "comments", e.target.value);
            }}
            InputLabelProps={{ shrink: true }}
            size="small"
            value={params.value}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 70,
      renderCell: (params) => (
        <button
          class="dltBtn"
          type="button"
          onClick={() => handleDelete(params.row.rowId)}
        >
          <div class="icon">
            <i class="fa-solid fa-trash"></i>
          </div>
        </button>
      ),
    },
  ];

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
          <GridToolbarExport
            color="secondary"
            sx={{ fontSize: "15px", fontWeight: "600" }}
          />
          <Select
            sx={{
              width: "100px",
              height: "30px",
            }}
            color="primary"
            size="small"
            labelId="demo-select-small"
            id="demo-select-small"
            value={pageSize}
            label="Page Size"
            onChange={(e) => {
              setPageSize(e.target.value);
            }}
            className="TopPageBar"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </div>
      </GridToolbarContainer>
    );
  }

  const handleEdit = (id) => {
    setProductRows((prevRows) =>
      prevRows.map((row) =>
        row.rowId === id ? { ...row, isEditing: true } : row
      )
    );
  };

  const handleEditChange = (id, field, value) => {
    setProductRows((prevRows) =>
      prevRows.map((row) => {
        if (row.rowId === id) {
          let updatedRow = { ...row, [field]: value };
          if (field === "product_id") {
            const selectedProduct = products.find((p) => p.id === value);
            if (selectedProduct) {
              updatedRow = {
                ...updatedRow,
                price: selectedProduct.purchase_price || 0,
                tax: selectedProduct.tax || 0,
                quantity: 1,
              };
            }
          }

          if (field === "quantity" || field === "product_id") {
            const price = updatedRow.price || 0;
            const quantity = updatedRow.quantity || 0;
            const tax = updatedRow.tax || 0;

            const amount = price * quantity;
            const tax_amount = amount * (tax / 100);
            const net_amount = amount + tax_amount;

            updatedRow = {
              ...updatedRow,
              amount: amount.toFixed(2),
              tax_amount: tax_amount.toFixed(2),
              net_amount: net_amount.toFixed(2),
            };
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleSave = (id, productId, qty) => {
    if (!productId || Number(qty) <= 0) {
      setalertType("error");
      setalertMsg(
        !productId
          ? "please fill the product details"
          : "please enter quantity greater than 0"
      );
      handleSnakBarOpen();
      return;
    }
    setProductRows((prevRows) =>
      prevRows.map((row) =>
        row.rowId === id ? { ...row, isEditing: false } : row
      )
    );
  };

  const handleAddRow = () => {
    const existingRowIds = productRows.map((row) => row.rowId);

    const maxRowId = Math.max(0, ...existingRowIds);
    let missingRowId = 1;
    for (let i = 1; i <= maxRowId + 1; i++) {
      if (!existingRowIds.includes(i)) {
        missingRowId = i;
        break;
      }
    }

    const newRow = {
      id: 0,
      rowId: productRows?.length > 0 ? missingRowId : 1,
      product_id: "",
      price: "",
      tax: "",
      quantity: "",
      amount: "",
      tax_amount: "",
      net_amount: "",
      comments: "",
      isEditing: true,
    };

    setProductRows((prevRows) => [newRow, ...prevRows]);
  };

  const handleDelete = (id) => {
    setProductRows((prevRows) => prevRows.filter((row) => row.rowId !== id));
  };

  return (
    <>
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "10px",
          borderBottom: colors.grey[300],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => {
              isFrom === "approval"
                ? navigate("/PurchaseOrderApproval")
                : navigate("/PurchaseOrder");
            }}
          >
            <ArrowBackIcon />
          </IconButton>{" "}
          <h2 className="heading">
            {" "}
            {param.id ? "Update Purchase Order" : "Add New Purchase Order"}{" "}
          </h2>
        </div>
      </Box>
      {isStateUpdated ? (
        <Box
          component="form"
          onSubmit={param.id ? updatePurchaseOrder : addPurchaseOrder}
          id="my-form"
        >
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              <h2>Purchase Order Info</h2>
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="20px"
              >
                <Autocomplete
                  disablePortal
                  fullWidth
                  clearIcon={false}
                  id="Supplier"
                  color="secondary"
                  options={vendors?.filter((w) => w.is_active === 1) || []}
                  value={
                    vendors?.find((option) => option.id === supplierId) || null
                  }
                  getOptionLabel={(option) => option?.supplier_name || ""}
                  onChange={(event, value) => {
                    setSupplierId(value.id);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier"
                      name="Supplier"
                      size="small"
                      fullWidth
                      required={!param.id}
                      color="secondary"
                    />
                  )}
                />
                <Autocomplete
                  disablePortal
                  fullWidth
                  clearIcon={false}
                  id="Warehouse"
                  color="secondary"
                  options={warehouse?.filter((w) => w.is_active === 1) || []}
                  value={
                    warehouse?.find((option) => option.id === warehouseId) ||
                    null
                  }
                  getOptionLabel={(option) => option?.warehouse_name || ""}
                  onChange={(event, value) => {
                    setCity(value.district);
                    setWarehouseId(value.id);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Warehouse"
                      name="Warehouse"
                      size="small"
                      fullWidth
                      required={!param.id}
                      color="secondary"
                    />
                  )}
                />
                <TextField
                  margin="normal"
                  disabled
                  fullWidth
                  required
                  id="City"
                  label="City"
                  name="City"
                  type="text"
                  color="secondary"
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={city}
                />
              </Box>
              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="20px"
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="DateofPurchaseOrder"
                  label="Date of Purchase Order"
                  name="Date of Purchase Order "
                  autoComplete="number"
                  type="date"
                  color="secondary"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={poDate}
                  InputProps={{
                    inputProps: { min: today },
                  }}
                  onChange={(e) => {
                    setPODate(e.target.value);
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="DateOfDelivery"
                  label="Date Of Delivery"
                  name="Date Of Delivery"
                  autoComplete="number"
                  type="date"
                  color="secondary"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { min: today },
                  }}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                  }}
                  value={deliveryDate}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="TimeOfDelivery"
                  label="Time Of Delivery(24 HRS)"
                  name="Time Of Delivery(24 HRS)"
                  type="text"
                  color="secondary"
                  onChange={(e) => {
                    setDeliveryTime(e.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={deliveryTime}
                />
              </Box>
            </div>
          </div>

          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              <h2>Products Info</h2>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  class="cssbuttons-io-button"
                  onClick={handleAddRow}
                  type="button"
                >
                  Add New
                  <div class="icon">
                    <i class="fa-regular fa-plus"></i>
                  </div>
                </button>
              </div>
              <Box display="flex" flexDirection="column" gap="20px" mt="20px">
                <DataGrid
                  sx={{ fontSize: "13px" }}
                  columns={columns}
                  rows={productRows}
                  components={{ Toolbar: CustomToolbar }}
                  pageSize={pageSize}
                  rowsPerPageOptions={[5, 10, 20]}
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  autoHeight
                  disableColumnMenu={true}
                  getRowId={(row) => row.rowId}
                />
              </Box>
            </div>
          </div>

          {poStatus === "Pending" ? (
            <Box
              display="flex"
              justifyContent="flex-end"
              gap="10px"
              marginTop="20px"
            >
              <Button
                form="my-form"
                variant="contained"
                color="secondary"
                name="SendApprove"
                type="submit"
                sx={{ fontWeight: "600", letterSpacing: "1px", width: "400px" }}
              >
                {LOADING ? <CircularProgress size={20} /> : "Update PO"}
              </Button>
            </Box>
          ) : (
            <Box
              display="flex"
              justifyContent="flex-end"
              gap="10px"
              marginTop="20px"
            >
              <Button
                form="my-form"
                type="submit"
                variant="contained"
                name="Save"
                color="secondary"
                sx={{ fontWeight: "600", letterSpacing: "1px", width: "400px" }}
              >
                {LOADING ? (
                  <CircularProgress size={20} />
                ) : param.id ? (
                  "Update PO"
                ) : (
                  "Add New PO"
                )}
              </Button>
              <Button
                form="my-form"
                variant="outlined"
                color="secondary"
                name="SendApprove"
                type="submit"
              >
                {LOADING ? (
                  <CircularProgress size={20} />
                ) : (
                  "Save and Send Approval"
                )}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <LoadingSkeleton rows={6} height={30} />
      )}
    </>
  );
}

export default NewPurchaseOrder;
