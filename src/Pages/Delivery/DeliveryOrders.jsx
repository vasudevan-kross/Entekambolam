import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Utils from "../../Global/utils";
import api from "../../Data/api";
import { GET, ADD } from "../../Functions/apiFunction";
import {
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Modal,
  Box,
  useTheme,
  IconButton,
  Grid,
  CardHeader,
} from "@mui/material";
import moment from "moment";
import image from "../../Data/image";
import PhoneIcon from "@mui/icons-material/Phone";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { tokens } from "../../theme";

const DeliveryOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const storedDate = sessionStorage.getItem("deliveryDate");
  const formattedDate = moment(storedDate).format("DD/MM/YYYY");
  const user = Utils.getUserData();
  const token = `Bearer ${user.token}`;
  const exe_id = user?.loginUserId;
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outForDeliveryCount, setOutForDeliveryCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [comments, setComments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToSubmit, setOrderToSubmit] = useState(null);
  const [submittedOrders, setSubmittedOrders] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState();
  const [undeliveredOrders, setUndeliveredOrders] = useState();

  useEffect(() => {
    const getDeliveryOrdersByDate = async () => {
      try {
        setLoading(true);
        const url = `${api}/get_delivery_orders_by_date/${storedDate}/${exe_id}`;
        const response = await GET(token, url);
        if (response.status) {
          let rawOrders = [];

          if (Array.isArray(response.data)) {
            rawOrders = response.data;
          } else if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            rawOrders = Object.values(response.data);
          }
          const filteredOrders = rawOrders?.reduce((acc, order) => {
            const parsedOrder = {
              ...order,
              product_detail: order.product_detail
                ? JSON.parse(order.product_detail)
                : null,
              updated_stock: order.updated_stock
                ? JSON.parse(order.updated_stock)
                : [],
            };

            // Check if any stock item has confirmed_quantity > 0
            if (
              parsedOrder?.updated_stock?.some(
                (stock) => stock?.confirmed_quantity > 0
              )
            ) {
              acc.push(parsedOrder);
            }

            return acc;
          }, []);
          setDeliveryOrders(filteredOrders);
          // Set counts based on fetched data
          const undelivered = filteredOrders?.filter((order) => !order.subs_id);
          const delivered = filteredOrders?.filter((order) => order.subs_id);
          setUndeliveredOrders(undelivered);
          setDeliveredOrders(delivered);
          setOutForDeliveryCount(undelivered.length);
          setDeliveredCount(delivered.length);

          // Set submittedOrders for orders with non-null subs_id
          const submittedOrdersMap = filteredOrders
            ?.filter((order) => order.subs_id)
            ?.reduce((acc, order) => {
              acc[order.order_number] = true;
              return acc;
            }, {});
          setSubmittedOrders(submittedOrdersMap);
          // Set comments for each order
          const commentsMap = filteredOrders?.reduce((acc, order) => {
            acc[order.order_number] = order.delivery_notes;
            return acc;
          }, {});
          setComments(commentsMap);
          setError(null);
        } else {
          console.log("Failed to fetch orders");
          setError("Failed to fetch orders.");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("An error occurred while fetching the orders.");
        console.error(error);
      }
    };
    getDeliveryOrdersByDate();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);
  console.log(currentLocation);

  const handleNavigateLocation = (order) => {
    const { flat_no, area, city, pincode } = order;
    const address = `${flat_no},${area},${city},${pincode}`;
    if (currentLocation) {
      const { lat, lng } = currentLocation;
      // Construct the Google Maps URL with the user's current location and the destination address
      const mapUrl = `https://www.google.com/maps/dir/${lat},${lng}/${encodeURIComponent(
        address
      )}`;
      window.open(mapUrl);
    } else {
      console.error("Current location is not available.");
    }
  };

  const handleSubmitOrder = (orderNumber, id) => {
    setOrderToSubmit({ orderNumber, id });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const formatAddress = (order) => {
    return [
      order.flat_no,
      order.apartment_name,
      order.area,
      order.landmark,
      order.city,
      order.pincode,
    ]
      .filter((value) => value)
      .join(", ");
  };

  const handleConfirmSubmit = async () => {
    const { orderNumber, id } = orderToSubmit;
    const comment = comments[orderNumber];
    const payload = {
      order_id: id,
      entry_userId: exe_id,
      comments: comment ?? "",
    };
    try {
      setLoading(true);
      const url = `${api}/store_delivered_info/${exe_id}`;
      const response = await ADD(token, url, payload);
      if (response.status) {
        const updatedUndelivered = undeliveredOrders.filter(
          (order) => order.id !== id
        );

        const deliveredOrder = undeliveredOrders.find(
          (order) => order.id === id
        );
        if (deliveredOrder) {
          const updatedDelivered = [...deliveredOrders, deliveredOrder];

          setUndeliveredOrders(updatedUndelivered);
          setDeliveredOrders(updatedDelivered);
          setOutForDeliveryCount(updatedUndelivered.length);
          setDeliveredCount(updatedDelivered.length);
        }
        setSubmittedOrders((prev) => ({ ...prev, [orderNumber]: true }));
        setError(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleCommentChange = (orderNumber, event) => {
    setComments({
      ...comments,
      [orderNumber]: event.target.value,
    });
  };

  const handlePhoneClick = (phoneNumber) => {
    // This will open the default dialer with the given phone number
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleBack = () => {
    // Check if "isFromHome" exists in the query params
    const searchParams = new URLSearchParams(location.search);
    const isFromHome = searchParams.has("isFromHome");

    if (isFromHome) {
      navigate("/DeliveryOrderDetails");
    } else {
      navigate("/ConfirmStock");
    }
  };
  const getOrderType = (order) => {
    return (order?.subscription_type !== null && "Subscription") || "Buy Once";
  };

  const getSubscriptionType = (order) => {
    switch (order?.subscription_type) {
      case 1:
        return "One Time Order";
      case 2:
        return "Weekly Subscription";
      case 3:
        return "Monthly Subscription";
      case 4:
        return "Alternative Days Subscription";
      default:
        return "";
    }
  };

  const ConfirmationPopup = ({ open, onClose, onConfirm }) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="confirmation-modal-title" variant="h6" component="h2">
            Are you sure you want to submit this order?
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{ mt: 2, ml: 2 }}
          >
            No
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onConfirm}
            sx={{ mt: 2, ml: 2 }}
          >
            Yes
          </Button>
        </Box>
      </Modal>
    );
  };

  return (
    <>
      <Box className="flex items-center flex-wrap justify-between w-100 title-menu">
        <Box className="flex items-center gap-2">
          {/* Back Button */}
          <IconButton onClick={handleBack}>
            <ArrowLeftIcon style={{ color: "black" }} />
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
            Delivery Orders
          </Typography>
        </Box>
        <Typography
          variant="h6"
          fontWeight={600}
          fontSize={"1.2rem"}
          color="primary"
        >
          {`${formattedDate} - 05:00 AM - 07:00 AM`}
        </Typography>
      </Box>

      {loading ? (
        <div style={{ textAlign: "center" }}>Loading...</div> // Add loader if necessary
      ) : error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : (
        <div>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              onClick={() => {
                setIsDelivered(false);
              }}
            >
              <div
                style={{
                  backgroundColor: "#8BC34A",
                  borderRadius: "5px",
                  padding: "35px 20px",
                  border: !isDelivered
                    ? "4px solid #4CAF50"
                    : "4px solid transparent",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  color: "#fff",
                  opacity: !isDelivered ? 1 : 0.8,
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <h3>Out for Delivery</h3>
                <h2>{outForDeliveryCount}</h2>
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              onClick={() => {
                setIsDelivered(true);
              }}
            >
              <div
                style={{
                  backgroundColor: "#FF9800",
                  borderRadius: "5px",
                  padding: "35px 20px",
                  border: isDelivered
                    ? "4px solid #FF5722"
                    : "4px solid transparent",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  color: "#fff",
                  opacity: isDelivered ? 1 : 0.8,
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <h3>Delivered</h3>
                <h2>{deliveredCount}</h2>
              </div>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              {(isDelivered ? deliveredOrders : undeliveredOrders).length >
              0 ? (
                (isDelivered ? deliveredOrders : undeliveredOrders).map(
                  (order) => (
                    <Card
                      key={order.order_id}
                      style={{
                        borderRadius: "5px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <CardHeader
                        style={{ paddingBottom: 0 }}
                        title={
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="h5"
                                style={{ fontWeight: "bold" }}
                              >
                                Order Number: {order.order_number}
                              </Typography>
                              {submittedOrders[order.order_number] && (
                                <Typography
                                  variant="body1"
                                  style={{
                                    color: "#81c784", // Light green for delivered
                                    fontWeight: "bold",
                                  }}
                                >
                                  Delivered
                                </Typography>
                              )}
                            </div>
                            <Typography>
                              Order Type:{" "}
                              <span
                                style={{
                                  color: "blue",
                                  fontWeight: "bold", // Make text bold
                                  padding: "2px 4px",
                                  borderRadius: "4px",
                                }}
                              >
                                {getOrderType(order)}
                              </span>
                            </Typography>
                            {order?.subscription_type !== null && (
                              <Typography>
                                Subscription Type:{" "}
                                <span
                                  style={{
                                    color: "lightgreen",
                                    fontWeight: "bold", // Make text bold
                                    padding: "2px 4px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {getSubscriptionType(order)}
                                </span>
                              </Typography>
                            )}
                          </>
                        }
                      />

                      <CardContent style={{ paddingTop: 0 }}>
                        <Box sx={{ padding: "10px 0" }}>
                          <Typography>
                            <strong>Customer Name:</strong> {order.name}
                          </Typography>

                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography>
                              <strong>Phone Number:</strong> {order.s_phone}
                            </Typography>
                            <IconButton
                              onClick={() => handlePhoneClick(order.s_phone)}
                            >
                              <PhoneIcon
                                style={{ fontSize: "18px", color: "#555" }}
                              />
                            </IconButton>
                          </Box>

                          <Typography>
                            <strong>Address:</strong> {formatAddress(order)}
                          </Typography>

                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography>
                              <strong>Location:</strong> {order.city},{" "}
                              {order.pincode}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleNavigateLocation(order)}
                            >
                              Navigate to Location
                            </Button>
                          </Box>

                          {/* ✅ Delivery Instruction - Conditionally Rendered */}
                          {order.subs_updated_at?.trim() && (
                            <Box
                              display="flex"
                              mt={1}
                              alignItems="center"
                              gap="0.5rem"
                            >
                              <Typography fontWeight="bold">
                                Delivered On:
                              </Typography>
                              <Typography
                                sx={{
                                  whiteSpace: "pre-line",
                                  fontSize: 14,
                                }}
                              >
                                {moment
                                  .utc(order.subs_updated_at)
                                  .local()
                                  .format("DD-MM-YYYY HH:mm:ss")}
                              </Typography>
                            </Box>
                          )}
                          {order.delivery_instruction?.trim() && (
                            <Box
                              display="flex"
                              mt={1}
                              alignItems="center"
                              gap="0.5rem"
                            >
                              <Typography fontWeight="bold">
                                Delivery Instruction:
                              </Typography>
                              <Typography
                                sx={{
                                  whiteSpace: "pre-line",
                                  fontSize: 14,
                                }}
                              >
                                {order.delivery_instruction}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Products Section */}
                        <div style={{ marginTop: "20px" }}>
                          <Typography
                            variant="h5"
                            style={{
                              fontWeight: "bold",
                              marginBottom: "10px",
                              textDecoration: "underline",
                            }}
                          >
                            Product Details :
                          </Typography>
                          {order.updated_stock &&
                          order.updated_stock.length > 0 ? (
                            order.updated_stock.map((product, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "15px",
                                  gap: "15px",
                                  borderBottom: "1px solid #ddd",
                                  paddingBottom: "10px",
                                }}
                              >
                                {product.img_src ? (
                                  <img
                                    src={`${image}/${product.img_src}`}
                                    alt={product.img_src}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                ) : (
                                  <i
                                    class="fa-regular fa-image"
                                    style={{ fontSize: "22px" }}
                                  ></i>
                                )}

                                <Typography variant="body1" style={{ flex: 1 }}>
                                  <span style={{ fontWeight: "bold" }}>
                                    {product.product_title}
                                  </span>{" "}
                                  - Qty: {product.confirmed_quantity}
                                </Typography>
                              </div>
                            ))
                          ) : (
                            <Typography
                              variant="body1"
                              style={{ fontStyle: "italic" }}
                            >
                              No products available.
                            </Typography>
                          )}
                        </div>

                        {/* Comments TextArea */}
                        <TextField
                          fullWidth
                          label="Delivery Notes"
                          multiline
                          rows={4}
                          variant="outlined"
                          style={{ marginTop: "10px" }}
                          inputProps={{ maxLength: 256 }}
                          value={comments[order.order_number] || ""}
                          onChange={(e) =>
                            handleCommentChange(order.order_number, e)
                          }
                          disabled={submittedOrders[order.order_number]}
                          helperText={`${
                            (comments[order.order_number] || "").length
                          }/256`}
                        />

                        {/* Submit Button */}
                        <div style={{ marginTop: "20px" }}>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ width: "100%" }}
                            onClick={() =>
                              handleSubmitOrder(order.order_number, order.id)
                            }
                            disabled={
                              submittedOrders[order.order_number] ||
                              !Utils.isDateToday(storedDate)
                            }
                          >
                            {submittedOrders[order.order_number]
                              ? "Delivered"
                              : "Deliver"}
                          </Button>
                          {/* Confirmation Modal */}
                          <ConfirmationPopup
                            open={isModalOpen}
                            onClose={handleCloseModal}
                            onConfirm={handleConfirmSubmit}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                )
              ) : (
                <Typography
                  variant="h6"
                  style={{
                    textAlign: "center",
                    color: "#757575",
                    fontStyle: "italic",
                    marginTop: "20px",
                  }}
                >
                  No records found.
                </Typography>
              )}
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
};

export default DeliveryOrders;
