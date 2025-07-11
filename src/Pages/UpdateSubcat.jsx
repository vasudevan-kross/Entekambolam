import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/system";
import {
  Button,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
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

function UpdateSubcat() {
  const subcateggory = useSelector(
    (state) => state.subCategory[state.subCategory.length - 1]
  );
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const param = useParams();
  const [product, setproduct] = useState();
  const [title, settitle] = useState();
  const [quantity, setquantity] = useState();
  const [price, setprice] = useState();
  const [MRP, setMRP] = useState();
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
      const url = `${api}/get_product/${param.id}`;
      const products = await GET(token, url);
      const product = products.data;
      setproduct(product);
      settitle(product.title);
      setquantity(product.qty_text);
      setprice(product.price);
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
    };
    getproduct();
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
      setalertMsg("Something went Wrong! Please Try Again");
      handleClose();
    }
  };

  // Update Product

  const updateProduct = async () => {
    const data = {
      id: param.id,
      title: title,
      qty_text: quantity,
      sub_cat_id: subCat,
      price: price,
      mrp: MRP,
      tax: tax,
      stock_qty: stock,
      offer_text: offer,
      description: desc,
      disclaimer: claimer,
      subscription: subs,
    };

    const url = `${api}/update_product`;
    setloading(true);
    const update = await UPDATE(token, url, data);
    if (uploadImage) {
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
            onClick={() => {
              navigate("/Products");
            }}
          >
            <ArrowBackIcon />
          </IconButton>{" "}
          <h2 className="heading"> Product Details</h2>
        </div>
        <Button
          form="my-form"
          type="submit"
          variant="contained"
          color="secondary"
          sx={{ fontWeight: "600", letterSpacing: "1px", width: "140px" }}
        >
          {loading ? <CircularProgress /> : "Update"}
        </Button>
      </Box>

      {product ? (
        <Box component="form" onSubmit={updateProduct} id="my-form">
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.primary[400],
              }}
            >
              <h2>Product Information</h2>
              <p>
                Enter the required information below . You can change it anytime
                you want.
              </p>
              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="Title"
                label="Title"
                name="Title"
                autoComplete="text"
                size="small"
                value={title}
                onChange={(e) => {
                  settitle(e.target.value);
                }}
                placeholder="Title"
              />
              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="Quantity"
                label="Quantity"
                name="Quantity"
                autoComplete="text"
                size="small"
                value={quantity}
                onChange={(e) => {
                  setquantity(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="Price"
                label="Price"
                name="Price"
                autoComplete="text"
                size="small"
                value={price}
                onChange={(e) => {
                  setprice(e.target.value);
                }}
              />

              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="MRP"
                label="MRP"
                name="MRP"
                autoComplete="text"
                size="small"
                value={MRP}
                onChange={(e) => {
                  setMRP(e.target.value);
                }}
              />
              <TextField
                margin="normal"
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
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="Stock"
                color="secondary"
                label="Stock"
                name="Stock"
                type="number"
                InputProps={{ inputProps: { min: 1, max: 10000 } }}
                autoComplete="number"
                size="small"
                value={stock}
                onChange={(e) => {
                  if (e.target.value <= 1) {
                    setstock(1);
                  } else {
                    setstock(e.target.value);
                  }
                }}
              />
              <div className="sub">
                <label htmlFor="subscrip" className="subMAin">
                  Subscription
                </label>
                <div class="toggle-switch">
                  <input
                    class="toggle-input"
                    color="secondary"
                    id="toggle"
                    type="checkbox"
                    checked={subs === 1}
                    onChange={() => {
                      setsubs(subs === 1 ? 0 : 1);
                    }}
                  />
                  <label class="toggle-label" for="toggle"></label>
                </div>
              </div>

              <div className="auto">
                {" "}
                <Autocomplete
                  color="secondary"
                  disablePortal
                  disabled
                  sx={{ width: "45%", marginTop: "40px" }}
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
                <Autocomplete
                  disablePortal
                  color="secondary"
                  sx={{ width: "45%", marginTop: "40px" }}
                  id="combo-box-demo"
                  onClick={() => {
                    setsubcatName("");
                  }}
                  options={subcateggory}
                  inputValue={subcatName}
                  onChange={(e, data) => {
                    setsubCat(data.id);
                    setsubcatName(data.title);
                  }}
                  getOptionLabel={(option) => option.title || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      color="secondary"
                      label="Sub Category"
                      size="small"
                      fullWidth
                      required
                      value={subcatName}
                    />
                  )}
                />
              </div>
            </div>
            <div
              className="right"
              style={{
                backgroundColor: colors.primary[400],
              }}
            >
              <div className="image">
                <label htmlFor="productImage" className="lbl">
                  Product Image
                </label>
                <div className="imgDiv">
                  <div className="img" style={{ position: "relative" }}>
                    <img
                      src={
                        img.url
                          ? img.url
                          : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTANRJhlfd2yzWf0UxKDBMw_jDOC3SVwkDBreJjA_Gp&s"
                      }
                      alt="img"
                    />
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
          <div
            className="desc"
            style={{
              backgroundColor: colors.primary[400],
            }}
          >
            <h2>Additional Images</h2>

            <Box display={"flex"} alignItems="center" gap="20px" mt={4}>
              <div class="container">
                {sliderImages?.map((slider) => (
                  <div className="img">
                    {" "}
                    <img
                      src={`${image}/${slider.image}`}
                      alt=""
                      width={"150px"}
                    />
                    <button
                      onClick={() => {
                        deleteFile(slider.id);
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
                  </div>
                ))}

                {sliderImages.length >= 5 ? (
                  <></>
                ) : (
                  <div
                    className="upload"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <IconButton aria-label="upload picture" component="label">
                      <input
                        hidden
                        accept=".png, .jpg, .jpeg"
                        type="file"
                        onChange={async (e) => {
                          if (e.target.files[0].size / 1024 >= 2048) {
                            alert("file size must be less then 2mb");
                          }
                          if (
                            e.target.files &&
                            e.target.files[0] &&
                            e.target.files[0].size / 1024 <= 2048
                          ) {
                            let UploadUrl = `${api}/product/upload_image`;
                            const uploadData = {
                              image: e.target.files[0],
                              image_type: 2,
                              id: param.id,
                            };

                            setuploading(true);
                            const upload = await UPLOAD(
                              token,
                              UploadUrl,
                              uploadData
                            );
                            setuploading(false);

                            if (upload.response === 200) {
                              handleSnakBarOpen();
                              setalertType("success");
                              setalertMsg("Uploaded");
                              setreFetch(!reFetch);
                            } else if (upload.response === 201) {
                              handleSnakBarOpen();
                              setalertType("error");
                              setalertMsg(upload.message);
                            } else {
                              handleSnakBarOpen();
                              setalertType("error");
                              setalertMsg(
                                "Something went Wrong! Please Try Again"
                              );
                            }
                          }
                        }}
                      />
                      {uploading ? (
                        <CircularProgress />
                      ) : (
                        <AddPhotoAlternateIcon sx={{ fontSize: "80px" }} />
                      )}
                    </IconButton>
                  </div>
                )}
              </div>
            </Box>
          </div>
          <div
            className="desc"
            style={{
              backgroundColor: colors.primary[400],
            }}
          >
            <h2>Other Information</h2>

            <TextField
              color="secondary"
              required
              fullWidth
              id="Offer"
              label="Offer"
              name="Offer"
              autoComplete="text"
              size="small"
              value={offer}
              onChange={(e) => {
                setoffer(e.target.value);
              }}
            />
            <TextField
              color="secondary"
              required
              fullWidth
              id="Description"
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
            <TextField
              color="secondary"
              required
              fullWidth
              id="Disclaimer"
              label="Disclaimer"
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
          </div>

          <div className="delete">
            <Button
              fullWidth
              variant="contained"
              color="error"
              sx={{ fontWeight: "600", letterSpacing: "1px" }}
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

export default UpdateSubcat;
