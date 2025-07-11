import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, margin } from "@mui/system";
import {
  Button,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import { DeleteOutline, PhotoCamera } from "@mui/icons-material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import api from "./../Data/api";
import { DELETE, GET, UPDATE, UPLOAD } from "../Functions/apiFunction";
import { tokens } from "../theme";
import image from "../Data/image";

function Product() {
  const subcateggory = useSelector(
    (state) => state.subCategory[state.subCategory.length - 1]
  );
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const param = useParams();
  const location = useLocation();
  const isFrom = location.state?.isFrom;
  const [product, setproduct] = useState();
  const [title, settitle] = useState();
  const [quantity, setquantity] = useState();
  // const [price, setprice] = useState();
  // const [MRP, setMRP] = useState();
  const [tax, settax] = useState();
  const [stock, setstock] = useState();
  const [Cat, setCat] = useState();
  const [subCat, setsubCat] = useState();
  const [subcatName, setsubcatName] = useState();
  const [offer, setoffer] = useState();
  const [desc, setdesc] = useState();
  const [claimer, setclaimer] = useState();
  const [subs, setsubs] = useState(0);
  const [loading, setloading] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [DailogOpen, setDailogOpen] = useState(false);
  const [reFetch, setreFetch] = useState(false);
  const [img, setimg] = useState();
  const [uploadImage, setuploadImage] = useState();

  const [deleting, setdeleting] = useState();
  const [sliderImages, setsliderImages] = useState([]);
  const [uploading, setuploading] = useState(false);

  const [price, setPrice] = useState("");
  const [mrp, setMRP] = useState("");
  const [priceError, setPriceError] = useState("");
  const [mrpError, setMrpError] = useState("");
  const [vendors, setVendors] = useState();
  const [selectedVendor, setSelectedVendor] = useState();
  const [isStateUpdated, setUpdatedState] = useState(true);

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

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const handleClickOpen = () => {
    setDailogOpen(true);
  };

  const handleClose = () => {
    setDailogOpen(false);
  };

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    // Get categoriues
    const getproduct = async () => {
      setUpdatedState(false);
      const url = `${api}/get_product/${param.id}`;
      const products = await GET(token, url);
      const product = products.data;
      setproduct(product);
      settitle(product.title);
      setquantity(product.qty_text);
      setPrice(product.price);
      setMRP(product.mrp);
      settax(product.tax);
      setstock(product.stock_qty);
      setCat(product.cat_title);
      setsubCat(product.sub_cat_id);
      setsubcatName(product.sub_cat_title);
      setoffer(product.offer_text);
      setclaimer(product.disclaimer);
      setdesc(product.description);
      setsubs(product.subscription);
      setimg(
        product.image != null && {
          url: `${image}/${product.image}`,
          id: product.image_id,
        }
      );
      setsliderImages(product.slider_image);
      setSelectedVendor(product.vendor_id);
      // Set the basicDetailsForm state
      setBasicDetailsForm((prev) => ({
        ...prev,
        SKU: product.sku || "",
        expireDay: product.expiry_days || "",
        storageType: product.storage_type || "Normal",
        minCart: product.min_cart_qty || "",
        maxCart: product.max_cart_qty || "",
        dailySalesLimit: product.daily_sales_limit || "",
        active: product.is_active !== undefined ? product.is_active : true,
      }));

      // Set the priceDetailsForm state
      setPriceDetailsForm((prev) => ({
        ...prev,
        supplier: product.vendor_id || "",
        purchasePrice: product.purchase_price || "",
        marginType: product.margin_type || "Percentage",
        margin: product.margin_percent || "",
        marginAmount: product.margin_amt || "",
      }));
    };
    const getVendors = async () => {
      const url = `${api}/get_vendors`;
      const result = await GET(token, url);
      setVendors(result.data);
      setUpdatedState(true);
    };
    getproduct();
    getVendors();
  }, [reFetch, token, param.id]);

  // Delete Product
  const DeleteProduct = async () => {
    const url = `${api}/delete_product`;
    const data = {
      id: param.id,
    };
    setloading(true);
    const dltProdct = await DELETE(token, url, data);
    setloading(false);
    if (dltProdct.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("Successfully Deleted");
      handleClose();
      setTimeout(() => {
        navigate("/Products");
      }, 1200);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("This product has already been associated with the order");
      handleClose();
    }
  };

  // Update Product

  const addORUpdateProduct = async (e, actionName = "") => {
    e.preventDefault();
    const data = {
      id: param.id,
      title: title,
      qty_text: quantity,
      sub_cat_id: subCat,
      price: price,
      mrp: mrp,
      tax: tax,
      stock_qty: stock,
      offer_text: offer,
      description: desc,
      disclaimer: claimer,
      subscription: subs,
      sku: basicDetailsForm.SKU,
      expire_days: basicDetailsForm.expireDay,
      storage_type: basicDetailsForm.storageType,
      min_cart_qty: basicDetailsForm.minCart || 0,
      max_cart_qty: basicDetailsForm.maxCart || 0,
      daily_sales_limit: basicDetailsForm.dailySalesLimit || 0,
      is_active: basicDetailsForm.active,
      vendor_id: priceDetailsForm.supplier,
      purchase_price: priceDetailsForm.purchasePrice,
      margin_percent: priceDetailsForm.margin,
      margin_amt: priceDetailsForm.marginAmount,
      margin_type: priceDetailsForm.marginType,
      status: actionName
        ? actionName === "save"
          ? "New"
          : "Pending"
        : product.status,
    };

    const url = `${api}/update_product`;
    setloading(true);
    const update = await UPDATE(token, url, data);
    if (uploadImage) {
      console.log("hello");
      let UploadUrl = `${api}/product/upload_image`;
      const uploadData = {
        image: uploadImage,
        image_type: 1,
        id: param.id,
      };
      const upload = await UPLOAD(token, UploadUrl, uploadData);
      console.log(upload);
    }
    setloading(false);
    if (update.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("Product Details Updated");
      handleClose();
      setTimeout(() => {
        setreFetch(!reFetch);
      }, 800);
    } else if (update.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(update.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
      handleClose();
    }
  };

  // delete Image

  const deleteFile = async (id) => {
    const url = `${api}/product/delete_image`;
    const data = {
      id: id,
    };
    console.log(data);
    setdeleting(true);
    const deleteImg = await UPDATE(token, url, data);
    console.log(deleteImg);
    setdeleting(false);
    if (deleteImg.response === 200) {
      setreFetch(!reFetch);
      handleSnakBarOpen();
      setalertType("success");
      handleClose();
      setalertMsg(deleteImg.message);
    } else if (deleteImg.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(deleteImg.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  const handlePriceChange = (e) => {
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
          borderBottom:
            theme.palette.mode === "dark"
              ? "0.5px solid #E1E3E6"
              : "1px solid #757D8A",
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
            aria-label="delete"
            onClick={() =>
              navigate(
                isFrom === "productApproval" ? "/ProductsApproval" : "/Products"
              )
            }
          >
            <ArrowBackIcon />
          </IconButton>{" "}
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
            Product Details
          </Typography>
        </div>
        {product?.status === "Approved" || product?.status === "Pending" ? (
          <Button
            form="my-form"
            type="submit"
            variant="contained"
            color="secondary"
            disabled={((mrpError || priceError) && true) || false}
            sx={{ fontWeight: "600", letterSpacing: "1px", width: "140px" }}
          >
            {loading ? <CircularProgress /> : "Update"}
          </Button>
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
              color="primary"
              onClick={(e) => addORUpdateProduct(e, "save")}
            >
              {loading ? <CircularProgress /> : "Save"}
            </Button>
            <Button
              form="my-form"
              type="button"
              variant="outlined"
              color="secondary"
              onClick={(e) => addORUpdateProduct(e, "submit")}
            >
              Save and Send Approval
            </Button>
          </Box>
        )}
      </Box>

      {product && isStateUpdated ? (
        <Box
          component="form"
          onSubmit={(e) => addORUpdateProduct(e, "")}
          id="my-form"
        >
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
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                Basic Information
              </Typography>
              <p className="title-menu">
                Enter the required information below. You can change it anytime
                you want.
              </p>
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
                    }}
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
                    }}
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
                    onChange={(e) => handleChange("SKU", e.target.value)}
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
                    onChange={(e) =>
                      handleChange("storageType", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleChange("dailySalesLimit", e.target.value)
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                    placeholder="Enter Daily Sales Limit"
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

                    <label htmlFor="activeToggle">Active</label>
                    <div
                      style={{
                        position: "relative",
                        width: "40px",
                        height: "20px",
                        background: basicDetailsForm.active
                          ? "#4caf50"
                          : "#ccc",
                        borderRadius: "20px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setBasicDetailsForm((prev) => ({
                          ...prev,
                          active: !prev.active,
                        }))
                      }
                    >
                      <input
                        id="activeToggle"
                        type="checkbox"
                        checked={basicDetailsForm.active}
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
                    <label htmlFor="subscrip">Subscription</label>
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
                        checked={subs === 1}
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
                    color="secondary"
                    disablePortal
                    disabled
                    id="combo-box-demo"
                    value={Cat}
                    inputValue={Cat}
                    options={[]}
                    // onChange={(e, data) => setselectedCategory(data.id)}
                    getOptionLabel={(option) => option.title || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        size="small"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    color="secondary"
                    options={subcateggory}
                    getOptionLabel={(option) => option?.title || ""}
                    value={
                      subcateggory.find((item) => item.id === subCat) || null
                    }
                    inputValue={subcatName}
                    onChange={(e, data) => {
                      setsubCat(data?.id || "");
                      setsubcatName(data?.title || "");
                    }}
                    onInputChange={(event, newInputValue) => {
                      setsubcatName(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        color="secondary"
                        label="Sub Category"
                        size="small"
                        fullWidth
                        required
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
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                Stock Information
              </Typography>
              <p className="title-menu">
                Enter the required information below . You can change it anytime
                you want.
              </p>

              <TextField
                required
                fullWidth
                disabled={
                  product?.status === "Approved" ||
                  product?.status === "Pending"
                }
                id="Stock"
                color="secondary"
                label="Stock"
                name="Stock"
                type="number"
                value={stock}
                InputProps={{ inputProps: { min: 0, max: 10000 } }}
                InputLabelProps={{ shrink: true }}
                autoComplete="number"
                size="small"
                onChange={(e) => {
                  setstock(e.target.value);
                }}
              />
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
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                Price Information
              </Typography>
              <p className="title-menu">
                Enter the required information below . You can change it anytime
                you want.
              </p>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Autocomplete
                    disablePortal
                    sx={{ width: "100%" }}
                    id="combo-box-demo"
                    color="secondary"
                    options={vendors?.filter((w) => w.is_active === 1) || []}
                    value={
                      vendors?.find((option) => option.id === selectedVendor) ||
                      null
                    }
                    onChange={(e, data) => {
                      setSelectedVendor(data.id);
                      handlePriceFormChange("supplier", data.id);
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
                    onChange={(e) =>
                      handlePriceFormChange("purchasePrice", e.target.value)
                    }
                    InputProps={{ inputProps: { min: 1, step: "any" } }}
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
                    InputProps={{
                      inputProps: { min: 0, max: 99, step: "any" },
                    }}
                    onChange={(e) =>
                      handlePriceFormChange("margin", e.target.value)
                    }
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
                    InputProps={{
                      inputProps: { min: 0, max: 99, step: "any" },
                    }}
                    onChange={(e) => {
                      settax(e.target.value);
                    }}
                  />
                </Grid>
              </Grid>
            </div>
            <div
              className="right"
              style={{
                backgroundColor: colors.primary[400],
              }}
            >
              <div className="image">
                <Typography
                  className=""
                  variant="h4"
                  component={"h4"}
                  fontWeight={600}
                  // fontSize={'1rem'}
                  lineHeight={"2rem"}
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                  }}
                >
                  Product Image
                </Typography>

                {/* <label htmlFor="productImage" className="lbl">
                  Product Image
                </label> */}
                <div className="imgDiv">
                  <div className="img" style={{ position: "relative" }}>
                    {img.url && <img src={img.url} alt="img" />}
                    {img.id && (
                      <button
                        onClick={() => {
                          deleteFile(img.id);
                        }}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          height: "30px",
                          padding: "0 10px",
                          border: "none",
                          borderRadius: "5px",
                          backgroundColor: "#d32f2f",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {deleting ? (
                          <CircularProgress size={10} color="white" />
                        ) : (
                          <DeleteOutline sx={{ fontSize: "28px" }} />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="upload">
                    {" "}
                    <Button
                      color="secondary"
                      aria-label="upload picture"
                      component="label"
                      variant="contained"
                      onChange={(e) => {
                        if (e.target.files[0].size / 1024 >= 2048) {
                          alert("file size must be less then 2mb");
                          return false;
                        }
                        if (
                          e.target.files &&
                          e.target.files[0] &&
                          e.target.files[0].size / 1024 <= 2048
                        ) {
                          setimg({
                            url: URL.createObjectURL(e.target.files[0]),
                          });
                          setuploadImage(e.target.files[0]);
                        }
                      }}
                    >
                      <input hidden accept=".png, .jpg, .jpeg" type="file" />
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
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
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
                    value={offer}
                    InputProps={{ inputProps: { min: 0, max: 99 } }}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => {
                      const calculatedPrice =
                        mrp - (mrp * e.target.value) / 100;
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
                    value={desc}
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
                    value={claimer}
                    onChange={(e) => {
                      setclaimer(e.target.value);
                    }}
                  />
                </Grid>
              </Grid>
            </div>
          </div>
          <div className="delete">
            <Button
              fullWidth
              variant="contained"
              color="error"
              sx={{
                fontWeight: "600",
                letterSpacing: "1px",
                marginBottom: "1rem",
              }}
              onClick={handleClickOpen}
            >
              Delete
            </Button>
          </div>
        </Box>
      ) : (
        <Stack spacing={1}>
          {/* For variant="text", adjust the height via font-size */}
          <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
          {/* For other variants, adjust the size with `width` and `height` */}

          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
          <Skeleton variant="rectangular" width={"100%"} height={60} />
          <Skeleton variant="rounded" width={"100%"} height={60} />
        </Stack>
      )}
      <Dialog
        open={DailogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>Do You Want to Delete {product?.title}</DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={DeleteProduct}
            autoFocus
            variant="contained"
            color="error"
            size="small"
          >
            {loading ? <CircularProgress /> : "Yes! Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Product;
