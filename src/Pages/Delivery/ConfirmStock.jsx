import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Utils from "../../Global/utils";
import api from "../../Data/api";
import { GET, ADD } from "../../Functions/apiFunction";
import { tokens } from "../../theme";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  useTheme,
  IconButton,
  Grid,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import Alert from "@mui/material/Alert";
import image from "../../Data/image";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

const ConfirmStock = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const storedDate = sessionStorage.getItem("deliveryDate");
  const user = Utils.getUserData();
  const exe_id = user?.loginUserId;
  const token = `Bearer ${user.token}`;
  const [isUpdating, setUpdaing] = useState(true);
  const [stockOrders, setStockOrders] = useState([]);
  const [executiveAssignId, setExecutiveAssignId] = useState();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(0);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmedProducts, setConfirmedProducts] = useState({});
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  useEffect(() => {
    const getStockOrdersByDate = async () => {
      try {
        const url = `${api}/get_stock_orders_by_date/${storedDate}/${exe_id}`;
        setUpdaing(false);

        const response = await GET(token, url);

        if (response && response.status === true && response.data) {
          const orders = Array.isArray(response.data)
            ? response.data
            : typeof response.data === "object"
            ? Object.values(response.data)
            : [];

          const parsedData = orders.map((order) => {
            let todayQty = 0; // Default value for todayQty

            // Process only if subscription_type is 2
            if (order.subscription_type === 2) {
              try {
                const rawSelectedDays = order.selected_days_for_weekly || "[]";

                // Preprocess the string to add double quotes around keys
                const fixedSelectedDays = rawSelectedDays.replace(
                  /([{,])\s*(\w+)\s*:/g, // Match keys without quotes
                  '$1"$2":' // Add double quotes around the keys
                );

                // Parse the string after fixing the keys
                const selectedDays = JSON.parse(fixedSelectedDays);

                if (Array.isArray(selectedDays)) {
                  if (storedDate) {
                    const deliveryDate = new Date(storedDate);
                    const dayCode = deliveryDate.getDay(); // Get day code from the stored date (0 for Sunday, 6 for Saturday)

                    // Find the entry for the corresponding dayCode
                    const todayEntry = selectedDays.find(
                      (day) => day.dayCode === dayCode
                    );
                    todayQty = todayEntry?.qty || 0;
                  } else {
                    console.warn("No deliveryDate found in session storage");
                    todayQty = 0;
                  }
                } else {
                  console.warn(
                    "selected_days_for_weekly is not an array:",
                    selectedDays
                  );
                  todayQty = 0; // Default to 0 if selectedDays is not an array
                }
              } catch (err) {
                console.error("Error parsing selected_days_for_weekly", err);
                todayQty = 0; // Default value if parsing fails
              }
            }

            const updatedStock =
              typeof order.updated_stock === "string"
                ? JSON.parse(order.updated_stock)
                : order.updated_stock || [];

            const productDetails =
              typeof order.product_detail === "string"
                ? JSON.parse(order.product_detail)
                : order.product_detail || [];

            const enrichedProducts = productDetails?.map((product) => {
              const stockUpdate = updatedStock?.find(
                (stock) => stock?.product_id === product?.product_id
              );
              return {
                ...product,
                confirmed_quantity: stockUpdate
                  ? stockUpdate?.confirmed_quantity
                  : -1,
                todayQty,
              };
            });
            return {
              ...order,
              product_detail: enrichedProducts,
            };
          });
          setStockOrders(parsedData);
          setUpdaing(true);
        } else {
          showSnackbar("Failed to fetch orders.", "error");
          setUpdaing(true);
        }
      } catch (error) {
        console.error("Error fetching stock orders:", error);
        showSnackbar("An error occurred while fetching orders.", "error");
      }
    };
    getStockOrdersByDate();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isUpdating) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const handleClose = () => {
    setConfirmationOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmBack = (product) => {
    setSelectedProduct(product);
    setInputQuantity(
      product?.todayQty && product?.todayQty !== 0
        ? product?.todayQty
        : product?.qty
    );
    setConfirmationOpen(true);
  };

  const handleSubmit = async () => {
    if (
      inputQuantity < 0 ||
      inputQuantity >
        (selectedProduct?.todayQty && selectedProduct?.todayQty !== 0
          ? selectedProduct?.todayQty
          : selectedProduct?.qty)
    ) {
      showSnackbar(
        "Quantity must be between 0 and the actual product quantity.",
        "error"
      );
      return;
    }

    setConfirmationDialogOpen(true);
  };

  const handleCancel = () => {
    setConfirmationDialogOpen(false);
  };

  const confirmSubmit = async () => {
    setConfirmationDialogOpen(false);
    setConfirmationOpen(false);

    const payload = {
      product_title: selectedProduct.product_title,
      product_id: selectedProduct.product_id,
      confirmed_quantity: inputQuantity,
    };
    const id = selectedProduct.id;

    try {
      const url = `${api}/update_stocks/${id}/${exe_id}/${storedDate}/${executiveAssignId}`;
      const response = await ADD(token, url, payload);

      if (response.status) {
        setConfirmedProducts((prevState) => ({
          ...prevState,
          [`${selectedProduct.order_number}-${selectedProduct.product_id}`]: true,
        }));

        setStockOrders((prevState) =>
          prevState.map((order) =>
            order.order_number === selectedProduct.order_number
              ? {
                  ...order,
                  product_detail: order.product_detail.map((product) =>
                    product.product_id === selectedProduct.product_id
                      ? {
                          ...product,
                          confirmed_quantity: inputQuantity,
                        }
                      : product
                  ),
                }
              : order
          )
        );
        showSnackbar("Quantity confirmed successfully!", "success");
      } else {
        showSnackbar("Failed to confirm quantity.", "error");
      }
    } catch (error) {
      console.error("Error confirming quantity:", error);
      showSnackbar("An error occurred while confirming quantity.", "error");
    }
  };

  const handleProceedToDelivery = () => {
    navigate("/DeliveryOrders");
  };

  const handleBack = () => {
    navigate("/DeliveryOrderDetails");
  };

  const ConfirmationDialog = ({ open, onClose, onConfirm }) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained" size="small">
            Cancel
          </Button>
          <Button onClick={onConfirm} color="secondary" variant="contained" size="small">
            Yes, Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box className="flex items-center flex-wrap justify-between w-100 title-menu">
        <Box className="flex items-center gap-2">
          {/* Back Button */}
          <IconButton onClick={handleBack}>
            <ArrowLeftIcon
              style={{
                color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
              }}
            />
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
            Confirm Stock
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          color="success"
          onClick={handleProceedToDelivery}
          disabled={!(stockOrders.length > 0)}
        >
          Submit & Proceed to Delivery
        </Button>
      </Box>

      <Box>
        <Grid container spacing={2}>
          {/* Loop through orders and products */}
          {!isUpdating ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="50vh"
            >
              <CircularProgress />
            </Box>
          ) : stockOrders.length > 0 ? (
            stockOrders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.order_number}>
                <Card style={{ minHeight: "250px" }}>
                  <CardContent>
                    <Typography variant="h5" color="primary" gutterBottom>
                      Order Number: {order.order_number}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {Array.isArray(order.product_detail) ? (
                      order.product_detail.map((product, index) => (
                        <Box key={index}>
                          <ul className="list-group list-group-divider no-margin group-off">
                            {/* Product Image */}
                            <li class="list-group-item">
                              {product.img_src ? (
                                <img
                                  src={`${image}/${product?.img_src}`}
                                  alt={product?.product_title}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              ) : (
                                // <ImageNotSupportedIcon
                                //   style={{ fontSize: "50px", color: "#ccc" }}
                                // /> // Replace with your desired icon
                                <i class="fa-regular fa-image imagesUpdateStock"></i>
                              )}
                            </li>
                            <li
                              class="list-group-item"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>{product.product_title}</span>
                              <span class="badge badge-danger badge-circle float-right">
                                {product.todayQty
                                  ? product.todayQty
                                  : product.qty}
                              </span>
                            </li>
                            {(product.confirmed_quantity >= 0 ||
                              confirmedProducts[product.product_id]) && (
                              <li class="list-group-item">
                                Confirmed Quantity:{" "}
                                <span class="badge badge-info badge-circle float-right">
                                  {product.confirmed_quantity !== null ||
                                  product.confirmed_quantity !== -1
                                    ? product.confirmed_quantity
                                    : confirmedProducts[product.product_id] ||
                                      0}
                                </span>
                              </li>
                            )}
                            <li class="list-group-item">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  handleConfirmBack({
                                    ...product,
                                    order_number: order.order_number,
                                    id: order.id,
                                  });
                                  setExecutiveAssignId(
                                    order?.executive_assign_id
                                  );
                                }}
                                // disabled={
                                //   product.confirmed_quantity >= 0 ||
                                //   confirmedProducts[product.product_id]
                                // } // Disable if confirmed
                                sx={{
                                  backgroundColor:
                                    product.confirmed_quantity >= 0 ||
                                    confirmedProducts[product.product_id]
                                      ? "#81c784"
                                      : "error.main",
                                  "&:hover": {
                                    backgroundColor:
                                      product.confirmed_quantity >= 0 ||
                                      confirmedProducts[product.product_id]
                                        ? "#66bb6a"
                                        : "error.dark",
                                  },
                                  "&.Mui-disabled": {
                                    opacity: 1,
                                  },
                                }}
                              >
                                {confirmedProducts[product.product_id] ||
                                product.confirmed_quantity >= 0
                                  ? "Stock Collected"
                                  : "Confirm Stock"}
                              </Button>
                            </li>
                          </ul>
                        </Box>
                      ))
                    ) : (
                      <Typography color="error">
                        Invalid product details.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{ height: "70vh" }}
              className={`text-card-foreground shadow-sm rounded-lg p-4 xl:p-2 w-100 ${
                theme.palette.mode === "dark" ? "bg-darkcard" : "bg-card"
              }`}
            >
              <Typography
                className=""
                variant="h2"
                component={"h2"}
                fontWeight={600}
                fontSize={"1.5rem"}
                lineHeight={"2rem"}
                sx={{
                  color:
                    theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                }}
              >
                No data found in this date
              </Typography>
            </Box>
          )}
        </Grid>
      </Box>

      {/* Popup for Confirm Back */}
      <Dialog open={confirmationOpen} onClose={handleClose}>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography>
                <strong>Product:</strong> {selectedProduct.product_title}
              </Typography>
              <Typography>
                <strong>Quantity:</strong>{" "}
                {selectedProduct.todayQty
                  ? selectedProduct.todayQty
                  : selectedProduct.qty}
              </Typography>
              <TextField
                type="number"
                label="Confirm Quantity"
                value={inputQuantity}
                onChange={(e) =>
                  setInputQuantity(
                    Math.max(
                      0,
                      Math.min(
                        selectedProduct.todayQty &&
                          selectedProduct.todayQty !== 0
                          ? selectedProduct.todayQty
                          : selectedProduct.qty,
                        parseInt(e.target.value) || 0
                      )
                    )
                  )
                }
                fullWidth
                inputProps={{
                  min: 0,
                  max: selectedProduct.qty,
                }}
                sx={{ mt: 2 }}
                error={
                  inputQuantity < 0 ||
                  inputQuantity >
                    (selectedProduct?.todayQty &&
                    selectedProduct?.todayQty !== 0
                      ? selectedProduct?.todayQty
                      : selectedProduct?.qty)
                }
                helperText={
                  inputQuantity < 0 ||
                  inputQuantity >
                    (selectedProduct?.todayQty &&
                    selectedProduct?.todayQty !== 0
                      ? selectedProduct?.todayQty
                      : selectedProduct?.qty)
                    ? "Quantity must be between 0 and the product quantity"
                    : ""
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button onClick={handleSubmit} color="secondary">
            Submit
          </Button>
        </DialogActions>
        <ConfirmationDialog
          open={confirmationDialogOpen}
          onClose={handleCancel}
          onConfirm={confirmSubmit}
        />
      </Dialog>
    </>
  );
};

export default ConfirmStock;
