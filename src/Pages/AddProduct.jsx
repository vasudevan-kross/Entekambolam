import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, margin } from "@mui/system";
import {
  Button,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import { PhotoCamera } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import api from "./../Data/api";
import { ADD, UPLOAD } from "../Functions/apiFunction";
import { tokens } from "../theme";
import { GET } from "../Functions/apiFunction";

function AddProduct() {
  const subCateg = useSelector((state) => {
    return state.subCategory[state.subCategory.length - 1];
  });

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [title, settitle] = useState("");
  const [quantity, setquantity] = useState("");
  // const [price, setprice] = useState(0);
  // const [MRP, setMRP] = useState(0);
  const [tax, settax] = useState();
  const [stock, setstock] = useState(0);
  const [subCat, setsubCat] = useState("");
  const [offer, setoffer] = useState("");
  const [desc, setdesc] = useState("");
  const [claimer, setclaimer] = useState("");
  const [subs, setsubs] = useState("0");
  const [img, setimg] = useState();
  const [LOADING, setLOADING] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [uploadImage, setuploadImage] = useState();
  const [imgType, setimgType] = useState();
  const [price, setPrice] = useState("");
  const [mrp, setMRP] = useState("");
  const [priceError, setPriceError] = useState("");
  const [mrpError, setMrpError] = useState("");
  const [vendors, setVendors] = useState();

  const [basicDetailsForm, setBasicDetailsForm] = useState({
    SKU: "",
    expireDay: "",
    unit: "",
    UOM: "",
    storageType: "Normal",
    minCart: "",
    maxCart: "",
    dailySalesLimit: "",
    active: true,
  });

  const [priceDetailsForm, setPriceDetailsForm] = useState({
    supplier: "",
    purchasePrice: "",
    marginType: "Percentage",
    margin: "",
    marginAmount: "",
  });

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const getVendors = async () => {
      const url = `${api}/get_vendors`;
      const result = await GET(token, url);
      setVendors(result.data);
    };
    getVendors();
  }, []);

  const validateFields = () => {
    const errors = {};

    // Validate required fields
    if (!title.trim()) errors.title = "Title is required";
    if (!quantity.trim()) errors.quantity = "Quantity is required";
    if (!basicDetailsForm.SKU.trim()) errors.SKU = "SKU is required";
    if (!priceDetailsForm.purchasePrice)
      errors.purchasePrice = "Purchase Price is required";
    if (!priceDetailsForm.margin) errors.margin = "Margin is required";

    // Validate Stock
    if (stock === undefined || stock === null || stock === "") {
      errors.stock = "Stock is required";
    } else if (stock < 0 || stock > 1000) {
      errors.stock = "Stock must be between 0 and 1000";
    }

    // Validate Sub Category
    if (!subCat) errors.subCategory = "Sub Category is required";

    // Validate Supplier
    if (!priceDetailsForm.supplier) errors.supplier = "Supplier is required";

    // Validate Tax
    if (tax === undefined || tax === null || tax === "") {
      errors.tax = "Tax is required";
    }
    if (
      isNaN(price) ||
      price === undefined ||
      price === null ||
      price === "" ||
      price === 0
    ) {
      errors.price = "Price is required";
      setPriceError(errors.price);
    }
    if (
      isNaN(mrp) ||
      mrp === undefined ||
      mrp === null ||
      mrp === "" ||
      mrp === 0
    ) {
      errors.mrp = "MRP is required";
      setMrpError(errors.mrp);
    }
    if (
      basicDetailsForm.dailySalesLimit &&
      (basicDetailsForm.dailySalesLimit < 1 ||
        basicDetailsForm.dailySalesLimit > 999999)
    ) {
      errors.dailySalesLimit = "Daily Sales Limit must be between 1 and 999999";
    }
    // Update state with errors
    setErrors(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const addProduct = async (e, actionName) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    const data = {
      title: title,
      qty_text: quantity,
      sku: basicDetailsForm.SKU,
      expire_days: basicDetailsForm.expireDay,
      storage_type: basicDetailsForm.storageType,
      min_cart_qty: basicDetailsForm.minCart || 0,
      max_cart_qty: basicDetailsForm.maxCart || 0,
      daily_sales_limit: basicDetailsForm.dailySalesLimit || 0,
      is_active: basicDetailsForm.active,
      status: actionName === "save" ? "New" : "Pending",
      vendor_id: priceDetailsForm.supplier,
      purchase_price: priceDetailsForm.purchasePrice,
      margin_percent: priceDetailsForm.margin,
      margin_amt: priceDetailsForm.marginAmount,
      margin_type: priceDetailsForm.marginType,
      sub_cat_id: subCat,
      price: price,
      tax: tax,
      mrp: mrp,
      offer_text: offer,
      description: desc,
      disclaimer: claimer,
      subscription: subs,
      stock_qty: parseFloat(stock) || 0,
    };

    const url = `${api}/add_product`;
    setLOADING(true);
    const add = await ADD(token, url, data);
    setLOADING(false);
    if (add.response === 200) {
      if (uploadImage) {
        let UploadUrl = `${api}/product/upload_image`;
        const uploadData = {
          image: uploadImage,
          image_type: imgType,
          id: add.id,
        };
        await UPLOAD(token, UploadUrl, uploadData);
      }
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("New Product Added successfully");
      setTimeout(() => {
        navigate("/Products");
      }, 1000);
    } else if (add.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(add.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  const handlePriceChange = (e) => {
    setErrors((prev) => ({ ...prev, price: "" }));
    const value = parseFloat(e.target.value);
    setPrice(value);

    // Validation: Price should not exceed MRP
    if (mrp && value > mrp) {
      setPriceError("Price cannot be greater than MRP");
    } else {
      setPriceError(""); // Clear error if validation passes
    }
  };

  const handleMRPChange = (e) => {
    setErrors((prev) => ({ ...prev, mrp: "" }));
    const value = parseFloat(e.target.value);
    setMRP(value);

    // Validation: MRP should be greater than or equal to Price
    if (price && value > price) {
      setPriceError("");
    }
    if (price && value < price) {
      setMrpError("MRP cannot be less than Price");
      setPriceError("Price cannot be greater than MRP");
    } else {
      setMrpError(""); // Clear error if validation passes
    }
  };

  const handleChange = (field, value) => {
    setBasicDetailsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePriceFormChange = (field, value) => {
    setPriceDetailsForm((prev) => {
      const updatedForm = {
        ...prev,
        [field]: value,
      };

      let purchasePrice = parseFloat(updatedForm.purchasePrice) || 0;
      let marginPercentage = parseFloat(updatedForm.margin) || 0;
      let offerPercentage = parseFloat(offer) || 0; // Default to 0 if not provided

      // Calculate margin amount
      const marginAmount = (purchasePrice * marginPercentage) / 100;
      updatedForm.marginAmount = marginAmount.toFixed(2);

      // Calculate MRP
      const calculatedMRP = purchasePrice + marginAmount;

      // Calculate Price (considering offerPercentage, default is 0)
      const calculatedPrice =
        calculatedMRP - (calculatedMRP * offerPercentage) / 100;

      // Update states
      setMRP(calculatedMRP.toFixed(2));
      setPrice(calculatedPrice.toFixed(2));

      return updatedForm;
    });
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
              navigate("/Products");
            }}
          >
            <ArrowBackIcon />
          </IconButton>
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
            Add New Product
          </Typography>
        </div>
      </Box>
      <Box component="form" onSubmit={(e) => addProduct(e, "submit")}>
        <div className="product">
          <div
            className="left"
            style={{
              backgroundColor: colors.cardBG[400],
              maxWidth: "100%",
            }}
          >
            <Typography
              className="mb1"
              variant="h3"
              component={"h3"}
              fontWeight={600}
              // fontSize={'1rem'}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Basic Information
            </Typography>
            <Typography
              className="mb1"
              variant="para"
              component={"p"}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Enter the required information below. You can change it anytime
              you want.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  required
                  color="secondary"
                  fullWidth
                  id="Title"
                  label="Title"
                  name="Title"
                  value={title}
                  autoComplete="text"
                  size="small"
                  placeholder="Title"
                  onChange={(e) => {
                    settitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: "" })); // Clear error on input change
                  }}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  color="secondary"
                  fullWidth
                  id="Quantity"
                  label="Quantity"
                  name="Quantity"
                  autoComplete="text"
                  value={quantity}
                  size="small"
                  onChange={(e) => {
                    setquantity(e.target.value);
                    setErrors((prev) => ({ ...prev, quantity: "" })); // Clear error on input change
                  }}
                  error={Boolean(errors.quantity)}
                  helperText={errors.quantity}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  color="secondary"
                  fullWidth
                  id="SKU"
                  label="SKU"
                  name="SKU"
                  autoComplete="text"
                  size="small"
                  value={basicDetailsForm.SKU}
                  onChange={(e) => {
                    handleChange("SKU", e.target.value);
                    setErrors((prev) => ({ ...prev, SKU: "" })); // Clear error on input change
                  }}
                  error={Boolean(errors.SKU)}
                  helperText={errors.SKU}
                  placeholder="SKU"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  color="secondary"
                  fullWidth
                  id="expireDay"
                  label="Expire Day"
                  name="expireDay"
                  autoComplete="text"
                  size="small"
                  value={basicDetailsForm.expireDay}
                  onChange={(e) => handleChange("expireDay", e.target.value)}
                  placeholder="Expire Day (optional)"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  fullWidth
                  label="Storage Type"
                  name="storageType"
                  size="small"
                  color="secondary"
                  value={basicDetailsForm.storageType}
                  onChange={(e) => handleChange("storageType", e.target.value)}
                >
                  <MenuItem value="Normal">Normal</MenuItem>
                  {/* <MenuItem value="Cold">Cold</MenuItem> */}
                  <MenuItem value="Frozen">Frozen</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                {/* Min Cart */}
                <TextField
                  // required
                  color="secondary"
                  fullWidth
                  id="minCart"
                  label="Minimum Cart Quantity"
                  name="minCart"
                  type="number"
                  size="small"
                  value={basicDetailsForm.minCart}
                  onChange={(e) => handleChange("minCart", e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                  placeholder="Enter Min Cart Quantity"
                />
              </Grid>
              <Grid item xs={4}>
                {/* Max Cart */}
                <TextField
                  // required
                  color="secondary"
                  fullWidth
                  id="maxCart"
                  label="Maximum Cart Quantity"
                  name="maxCart"
                  type="number"
                  size="small"
                  value={basicDetailsForm.maxCart}
                  onChange={(e) => handleChange("maxCart", e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                  placeholder="Enter Max Cart Quantity"
                />
              </Grid>
              <Grid item xs={4}>
                {/* Daily Sales Limit */}
                <TextField
                  // required
                  color="secondary"
                  fullWidth
                  id="dailySalesLimit"
                  label="Daily Sales Limit"
                  name="dailySalesLimit"
                  type="number"
                  size="small"
                  value={basicDetailsForm.dailySalesLimit}
                  onChange={(e) => {
                    handleChange("dailySalesLimit", e.target.value);
                    setErrors((prev) => ({ ...prev, dailySalesLimit: "" }));
                  }}
                  InputProps={{ inputProps: { min: 1 } }}
                  placeholder="Enter Daily Sales Limit"
                  error={Boolean(errors.dailySalesLimit)}
                  helperText={errors.dailySalesLimit}
                />
              </Grid>
              <Grid item xs={4}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Active Toggle */}

                  <label htmlFor="activeToggle" style={{ marginBottom: "8px" }}>
                    Active
                  </label>
                  <div
                    style={{
                      position: "relative",
                      width: "40px",
                      height: "20px",
                      background: basicDetailsForm.active ? "#4caf50" : "#ccc",
                      borderRadius: "20px",
                      cursor: "not-allowed",
                    }}
                  >
                    <input
                      id="activeToggle"
                      type="checkbox"
                      checked={basicDetailsForm.active}
                      disabled
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: "0",
                        height: "0",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: basicDetailsForm.active ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "all 0.3s",
                      }}
                    ></span>
                  </div>

                  {/* Subscription Toggle */}

                  <label htmlFor="subscrip" style={{ marginBottom: "8px" }}>
                    Subscription
                  </label>
                  <div
                    style={{
                      position: "relative",
                      width: "40px",
                      height: "20px",
                      background: subs === 1 ? "#4caf50" : "#ccc",
                      borderRadius: "20px",
                      cursor: "pointer",
                    }}
                    onClick={() => setsubs(subs === 0 ? 1 : 0)}
                  >
                    <input
                      id="subscrip"
                      type="checkbox"
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: "0",
                        height: "0",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: subs === 1 ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "all 0.3s",
                      }}
                    ></span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  disablePortal
                  sx={{ width: "100%" }}
                  id="combo-box-demo"
                  color="secondary"
                  options={subCateg}
                  onChange={(e, data) => {
                    setsubCat(data?.id ?? "");
                    if (!data) {
                      setErrors((prev) => ({
                        ...prev,
                        subCategory: "Sub Category is required",
                      }));
                    } else {
                      setErrors((prev) => ({ ...prev, subCategory: "" }));
                    }
                  }}
                  getOptionLabel={(option) => option?.title || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sub Category"
                      size="small"
                      fullWidth
                      required
                      color="secondary"
                      error={!!errors.subCategory}
                      helperText={errors.subCategory}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </div>
        </div>
        <div className="product">
          <div
            className="left"
            style={{
              backgroundColor: colors.cardBG[400],
              maxWidth: "100%",
            }}
          >
            <Typography
              className="mb1"
              variant="h3"
              component={"h3"}
              fontWeight={600}
              // fontSize={'1rem'}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Stock Information
            </Typography>
            <Typography
              className="mb1"
              variant="para"
              component={"p"}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Enter the required information below . You can change it anytime
              you want.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="Stock"
                  color="secondary"
                  label="Stock"
                  name="Stock"
                  type="number"
                  value={stock}
                  InputProps={{ inputProps: { min: 0, max: 10000 } }}
                  autoComplete="number"
                  size="small"
                  onChange={(e) => {
                    setstock(e.target.value);
                    setErrors((prev) => ({ ...prev, stock: "" }));
                  }}
                  error={Boolean(errors.stock)}
                  helperText={errors.stock}
                />
              </Grid>
            </Grid>
          </div>
        </div>
        <div className="product">
          <div
            className="left"
            style={{
              backgroundColor: colors.cardBG[400],
              maxWidth: "100%",
            }}
          >
            <Typography
              className="mb1"
              variant="h3"
              component={"h3"}
              fontWeight={600}
              // fontSize={'1rem'}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Price Information
            </Typography>
            <Typography
              className="mb1"
              variant="para"
              component={"p"}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Enter the required information below . You can change it anytime
              you want.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Autocomplete
                  disablePortal
                  sx={{ width: "100%" }}
                  id="combo-box-demo"
                  color="secondary"
                  options={vendors?.filter((w) => w.is_active === 1) || []}
                  onChange={(e, data) => {
                    handlePriceFormChange("supplier", data.id);
                    setErrors((prev) => ({ ...prev, supplier: "" }));
                  }}
                  getOptionLabel={(option) => option?.supplier_name || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier"
                      size="small"
                      fullWidth
                      required
                      color="secondary"
                      error={Boolean(errors.supplier)}
                      helperText={errors.supplier}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  color="secondary"
                  fullWidth
                  id="purchasePrice"
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  size="small"
                  value={priceDetailsForm.purchasePrice}
                  onChange={(e) => {
                    handlePriceFormChange("purchasePrice", e.target.value);
                    setErrors((prev) => ({ ...prev, purchasePrice: "" })); // Clear error on input change
                  }}
                  error={Boolean(errors.purchasePrice)}
                  helperText={errors.purchasePrice}
                  InputProps={{ inputProps: { min: 1 } }}
                  placeholder="Enter Purchase Price"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Margin Type"
                  name="marginType"
                  size="small"
                  color="secondary"
                  value={priceDetailsForm.marginType}
                  onChange={(e) =>
                    handlePriceFormChange("marginType", e.target.value)
                  }
                >
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  {/* <MenuItem value="Frozen">Frozen</MenuItem> */}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  required
                  fullWidth
                  id="margin"
                  label="Margin( in % )"
                  name="margin"
                  autoComplete="text"
                  size="small"
                  value={priceDetailsForm.margin}
                  type="number"
                  InputProps={{ inputProps: { min: 0, max: 99 } }}
                  onChange={(e) => {
                    handlePriceFormChange("margin", e.target.value);
                    setErrors((prev) => ({ ...prev, margin: "" })); // Clear error on input change
                  }}
                  error={Boolean(errors.margin)}
                  helperText={errors.margin}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  color="secondary"
                  fullWidth
                  id="marginAmount"
                  label="Margin Amount"
                  name="marginAmount"
                  type="number"
                  size="small"
                  value={priceDetailsForm.marginAmount}
                  onChange={(e) =>
                    handlePriceFormChange("marginAmount", e.target.value)
                  }
                  InputProps={{ readOnly: true }}
                  placeholder="Enter Margin Amount"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  id="Price"
                  label="Price"
                  name="Price"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  value={price || ""}
                  InputLabelProps={{ shrink: true }}
                  // InputProps={{ readOnly: true }}
                  onChange={handlePriceChange}
                  error={Boolean(priceError)}
                  helperText={priceError}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  id="MRP"
                  label="MRP"
                  name="MRP"
                  type="number"
                  color="secondary"
                  autoComplete="number"
                  size="small"
                  value={mrp || ""}
                  // InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  onChange={handleMRPChange}
                  error={Boolean(mrpError)}
                  helperText={mrpError}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  required
                  fullWidth
                  id="tax"
                  label="Tax( in % )"
                  name="tax"
                  autoComplete="text"
                  size="small"
                  value={tax}
                  type="number"
                  InputProps={{ inputProps: { min: 0, max: 99 } }}
                  onChange={(e) => {
                    settax(e.target.value);
                    setErrors((prev) => ({ ...prev, tax: "" }));
                  }}
                  error={Boolean(errors.tax)}
                  helperText={errors.tax}
                />
              </Grid>
            </Grid>
          </div>
          <div
            className="right"
            style={{
              backgroundColor: colors.cardBG[400],
            }}
          >
            <div className="image">
              <label htmlFor="productImage" className="lbl">
                Product Image
              </label>
              <div className="imgDiv">
                {img && <img src={img} alt="img" />}
                <div className="upload">
                  {" "}
                  <Button
                    fullWidth
                    color="secondary"
                    aria-label="upload picture"
                    component="label"
                    variant="contained"
                  >
                    <input
                      hidden
                      accept=".png, .jpg, .jpeg"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files[0].size / 1024 >= 2048) {
                          alert("file size must be less then 2mb");
                        }
                        if (
                          e.target.files &&
                          e.target.files[0] &&
                          e.target.files[0].size / 1024 <= 2048
                        ) {
                          setimg(URL.createObjectURL(e.target.files[0]));
                          setuploadImage(e.target.files[0]);
                          setimgType(1);
                        }
                      }}
                    />
                    Select Image <PhotoCamera />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="product">
          <div
            className="left"
            style={{
              backgroundColor: colors.cardBG[400],
              maxWidth: "100%",
            }}
          >
            <Typography
              className="title-menu"
              variant="h3"
              component={"h3"}
              fontWeight={600}
              // fontSize={'1rem'}
              lineHeight={"2rem"}
              sx={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            >
              Other Information
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="Offer"
                  label="Offer( in % )"
                  name="Offer"
                  type="number"
                  autoComplete="text"
                  color="secondary"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 99 } }}
                  onChange={(e) => {
                    const calculatedPrice = mrp - (mrp * e.target.value) / 100;
                    setoffer(e.target.value);
                    setPrice(calculatedPrice.toFixed(2));
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="Description"
                  color="secondary"
                  label="Description"
                  name="Description"
                  autoComplete="text"
                  size="small"
                  multiline
                  onChange={(e) => {
                    setdesc(e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="Disclaimer"
                  label="Disclaimer"
                  color="secondary"
                  name="Disclaimer"
                  autoComplete="text"
                  size="small"
                  minRows="3"
                  multiline
                  onChange={(e) => {
                    setclaimer(e.target.value);
                  }}
                />
              </Grid>
            </Grid>
          </div>
        </div>

        <Box
          display="flex"
          justifyContent="flex-end"
          gap="1rem"
          marginTop="1rem"
          marginBottom="1rem"
        >
          {/* Save Button */}
          <Button
            type="button" // Change to type="button" to prevent form submission
            variant="outlined"
            color="secondary"
            onClick={(e) => addProduct(e, "save")}
          >
            Save
          </Button>

          {/* Save and Send for Approval Button */}
          <Button
            type="button" // Change to type="button" to prevent form submission
            variant="contained"
            color="primary"
            onClick={(e) => addProduct(e, "submit")}
          >
            Save and Send for Approval
          </Button>
        </Box>

        {/* <div className="delete">
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="secondary"
            disabled={((mrpError || priceError) && true) || false}
            sx={{ fontWeight: "600", letterSpacing: "1px" }}
          >
            {LOADING ? <CircularProgress size={20} /> : "Add New Product"}
          </Button>
        </div> */}
      </Box>
    </>
  );
}

export default AddProduct;
