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

function NewPurchaseReturn() {
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
  const [isPINumberSelected, setPINumberSelected] = useState(false);

  const [supplierId, setSupplierId] = useState();
  const [warehouseId, setWarehouseId] = useState();
  const [city, setCity] = useState();
  const [prDate, setPRDate] = useState();
  const [prStatus, setPRStatus] = useState();

  const [productRows, setProductRows] = useState([]);
  const [returnReason, setReturnReason] = useState([
    { title: "Expired" },
    { title: "Broken" },
    { title: "Change in Quantity" },
    { title: "Not Supplied" },
    { title: "Quality Issue" },
    { title: "Wrong Product Delivered" },
  ]);
  const [vendors, setVendors] = useState();
  const [warehouse, setWarehouse] = useState();
  const [products, setProducts] = useState();
  const [purchaseInvoice, setPurchaseInvoice] = useState();
  const [piNumber, setPINumber] = useState();
  const [poId, setPOId] = useState();
  const [piId, setPIId] = useState();
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const getPurchaseInvoices = async () => {
      setUpdatedState(false);
      const url = param.id
        ? `${api}/get_purchaseInvoice`
        : `${api}/get_approved_purchaseInvoice`;
      const result = await GET(token, url);
      setPurchaseInvoice(result.data);
      if (!param.id) {
        setUpdatedState(true);
      }
    };
    getPurchaseInvoices();
    if (param.id) {
      getAllPurchaseData(param.id);
    }
  }, []);

  const getAllPurchaseData = async (poId) => {
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
    };
    const getPurchaseReturns = async () => {
      const url = param.id
        ? `${api}/get_purchaseReturn_by_id/${poId}`
        : `${api}/get_purchaseOrder_by_id/${poId}`;
      const result = await GET(token, url);
      if (result.response === 200) {
        const purchaseReturn = result.data;
        setPINumber(purchaseReturn.pi_no);
        setSupplierId(purchaseReturn.supplier_id);
        setWarehouseId(purchaseReturn.warehouse_id);
        setCity(purchaseReturn.city);
        setPRDate(purchaseReturn.date_of_pr);
        setPRStatus(purchaseReturn.pr_status);
        setPIId(purchaseReturn.pi_id);
        const products = purchaseReturn.products.map((product, index) => ({
          id: product.id,
          rowId: index + 1,
          product_id: product.product_id,
          price: product.price,
          tax: product.tax,
          quantity: product.quantity,
          returnQuantity: product.returnQuantity ?? 0,
          ...(param.id && {
            amount: product.amount,
            tax_amount: product.tax_amount,
            net_amount: product.net_amount,
            comments: product.comments,
          }),
          isEditing: true,
        }));
        setProductRows(products);
      }
      setUpdatedState(true);
      setPINumberSelected(true);
    };
    getVendors();
    getWarehouse();
    getAllProduct();
    getPurchaseReturns();
  };

  const handlePINOChange = async (e, value) => {
    setPINumber(value.pi_no);
    setPIId(value.id);
    setPOId(value.purchase_id);
    await getAllPurchaseData(value.purchase_id);
  };

  const addPurchaseReturn = async (e) => {
    e.preventDefault();
    if (productRows.every((product) => Number(product.returnQuantity) === 0)) {
      setalertType("error");
      setalertMsg("All Return Quantity is Zero");
      handleSnakBarOpen();
      return;
    }
    var isSendApproval = e.nativeEvent.submitter.name;
    setLOADING(true);
    const purchaseOrderData = {
      pi_id: piId,
      pi_no: piNumber,
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      city: city,
      date_of_pr: prDate,
      productData: productRows,
      status: isSendApproval === "SendApprove" ? "Pending" : "New",
    };
    const data = JSON.stringify(purchaseOrderData);
    const url = `${api}/add_purchaseReturn`;
    const addPurchaseReturn = await ADD(token, url, data);
    if (addPurchaseReturn.response === 200) {
      setalertType("success");
      setalertMsg("New Purchase Return Added successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/PurchaseReturn");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(addPurchaseReturn.message || "Error adding Purchase Return");
      handleSnakBarOpen();
      setLOADING(false);
    }
  };

  const updatePurchaseReturn = async (e) => {
    e.preventDefault();
    if (productRows.every((product) => Number(product.returnQuantity) === 0)) {
      setalertType("error");
      setalertMsg("All Return Quantity is Zero");
      handleSnakBarOpen();
      return;
    }
    var isSendApproval = e.nativeEvent.submitter.name;
    setLOADING(true);
    const purchaseOrderData = {
      id: param.id,
      pi_id: piId,
      pi_no: piNumber,
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      city: city,
      date_of_pr: prDate,
      productData: productRows,
      status: isSendApproval === "SendApprove" ? "Pending" : "New",
    };
    const data = JSON.stringify(purchaseOrderData);
    const url = `${api}/update_purchaseReturn`;
    const updatePurchaseReturn = await ADD(token, url, data);
    if (updatePurchaseReturn.response === 200) {
      setalertType("success");
      setalertMsg("Purchase Return Updated successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/PurchaseReturn");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(
        updatePurchaseReturn.message || "Error updating Purchase Return"
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
                  params.row.quantity,
                  params.row.returnQuantity,
                  params.row.comments
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
            disabled
            fullWidth
            clearIcon={false}
            id="combo-box-demo"
            color="secondary"
            options={products || []}
            value={
              products?.find((product) => product.id === params.value) || null
            }
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
            disabled
            id="Price"
            type="number"
            color="secondary"
            value={params.value}
            InputProps={{ inputProps: { min: 1 } }}
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
      field: "returnQuantity",
      headerName: "Return Quantity",
      width: 150,
      renderCell: (params) =>
        params.row.isEditing ? (
          <TextField
            margin="normal"
            id="Price"
            type="number"
            color="secondary"
            value={params.value}
            InputProps={{ inputProps: { min: 0, max: params.row.quantity } }}
            onChange={(e) =>
              handleEditChange(
                params.row.rowId,
                "returnQuantity",
                e.target.value
              )
            }
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
            required={Number(params.row.returnQuantity) > 0}
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
            required={Number(params.row.returnQuantity) > 0}
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
            required={Number(params.row.returnQuantity) > 0}
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
      headerName: "Reason",
      width: 250,
      renderCell: (params) =>
        params.row.isEditing ? (
          <Autocomplete
            disablePortal={false}
            fullWidth
            clearIcon={false}
            id="combo-box-demo"
            color="secondary"
            options={returnReason}
            value={
              returnReason?.find((reason) => reason.title === params.value) ||
              null
            }
            onChange={(e, value) => {
              handleEditChange(
                params.row.rowId,
                "comments",
                value?.title || null
              );
            }}
            getOptionLabel={(option) => option?.title || ""}
            renderInput={(inputParams) => (
              <TextField
                {...inputParams}
                label="Reason"
                size="small"
                sx={{ fontSize: "12px" }}
                fullWidth
                required={Number(params.row.returnQuantity) > 0}
                color="secondary"
              />
            )}
          />
        ) : (
          params.value
        ),
    },
  ];

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
          if (field === "returnQuantity") {
            const price = updatedRow.price || 0;
            const returnQuantity = Number(updatedRow.returnQuantity) || 0;
            const tax = updatedRow.tax || 0;

            const amount = price * returnQuantity;
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

  const handleSave = (id, currentQty, returnQty, cmts) => {
    const returnQtyNumber = Number(returnQty);
    if (Number(currentQty) < returnQtyNumber || returnQtyNumber <= 0 || !cmts) {
      setalertType("error");
      setalertMsg(
        returnQtyNumber <= 0
          ? "please enter retrun quantity greater than 0 "
          : Number(currentQty) < returnQtyNumber
          ? "the return quantity must be smaller/equal with the quantity"
          : "Reason must be selected!"
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
                ? navigate("/PurchaseReturnApproval")
                : navigate("/PurchaseReturn");
            }}
          >
            <ArrowBackIcon />
          </IconButton>{" "}
          <h2 className="heading">
            {" "}
            {param.id
              ? "Update Purchase Return"
              : "Add New Purchase Return"}{" "}
          </h2>
        </div>
      </Box>
      {isStateUpdated ? (
        <Box
          component="form"
          onSubmit={param.id ? updatePurchaseReturn : addPurchaseReturn}
          id="my-form"
        >
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              <h2>Select PI Number</h2>

              <Box
                display={"flex"}
                alignItems="center"
                justifyContent={"space-between"}
                gap="20px"
                mt="20px"
              >
                <Autocomplete
                  disablePortal
                  disabled={param.id}
                  fullWidth
                  clearIcon={false}
                  id="PINumber"
                  color="secondary"
                  options={purchaseInvoice}
                  value={
                    purchaseInvoice?.find(
                      (option) => option.pi_no === piNumber
                    ) || null
                  }
                  getOptionLabel={(option) => option?.pi_no || ""}
                  onChange={(event, value) => {
                    handlePINOChange(event, value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="PI Number"
                      name="PI Number"
                      size="small"
                      fullWidth
                      color="secondary"
                    />
                  )}
                />
              </Box>
            </div>
          </div>
          {isPINumberSelected && (
            <>
              <div className="product">
                <div
                  className="left"
                  style={{
                    backgroundColor: colors.cardBG[400],
                  }}
                >
                  <h2>Purchase Invoice Info</h2>
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
                      disabled
                      id="Supplier"
                      color="secondary"
                      options={vendors?.filter((w) => w.is_active === 1) || []}
                      value={
                        vendors?.find((option) => option.id === supplierId) ||
                        null
                      }
                      getOptionLabel={(option) => option?.supplier_name || ""}
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
                      disabled
                      id="Warehouse"
                      color="secondary"
                      options={
                        warehouse?.filter((w) => w.is_active === 1) || []
                      }
                      value={
                        warehouse?.find(
                          (option) => option.id === warehouseId
                        ) || null
                      }
                      getOptionLabel={(option) => option?.warehouse_name || ""}
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
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="DateofPurchaseReturn"
                      label="Date of Purchase Return"
                      name="Date of Purchase Return "
                      autoComplete="number"
                      type="date"
                      color="secondary"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={prDate}
                      InputProps={{
                        inputProps: { min: today },
                      }}
                      onChange={(e) => {
                        setPRDate(e.target.value);
                      }}
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
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap="20px"
                    mt="20px"
                  >
                    <DataGrid
                      sx={{ fontSize: "13px" }}
                      columns={columns}
                      rows={productRows}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                      autoHeight
                      disableColumnMenu={true}
                      getRowId={(row) => row.rowId}
                    />
                  </Box>
                </div>
              </div>
            </>
          )}
          {isPINumberSelected &&
            (prStatus === "Pending" ? (
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
                  sx={{
                    fontWeight: "600",
                    letterSpacing: "1px",
                    width: "400px",
                  }}
                >
                  {LOADING ? <CircularProgress size={20} /> : "Update PR"}
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
                  sx={{
                    fontWeight: "600",
                    letterSpacing: "1px",
                    width: "400px",
                  }}
                >
                  {LOADING ? (
                    <CircularProgress size={20} />
                  ) : param.id ? (
                    "Update PR"
                  ) : (
                    "Add New PR"
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
            ))}
        </Box>
      ) : (
        <LoadingSkeleton rows={6} height={30} />
      )}
    </>
  );
}

export default NewPurchaseReturn;
