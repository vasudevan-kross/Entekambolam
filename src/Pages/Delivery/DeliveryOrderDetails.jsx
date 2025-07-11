import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Utils from "../../Global/utils";
import api from "../../Data/api";
import { GET, ADD } from "../../Functions/apiFunction";
import { tokens } from "../../theme";
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import moment from "moment";
import {
  GridToolbarContainer,
  GridToolbarExport,
  DataGrid,
} from "@mui/x-data-grid";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import IconButton from "@mui/material/IconButton";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import AddchartIcon from "@mui/icons-material/Addchart";
import { TextField } from "@mui/material";
import { DeliveryDining, ShoppingCartCheckout } from "@mui/icons-material";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

const DeliveryOrderDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const storedDate = sessionStorage.getItem("deliveryDate");
  const formattedDate = moment(storedDate).format("DD/MM/YYYY");

  const user = Utils.getUserData();
  const exe_id = user?.loginUserId;
  const token = `Bearer ${user.token}`;
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };
  // Get the current date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Remove time part

  const parsedDate = parseDate(formattedDate);
  let isPastDate = false;
  let isFutureDate = false;
  if (parsedDate < currentDate) {
    isPastDate = true;
  }
  if (parsedDate > currentDate) {
    isFutureDate = true;
  }

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [isUpdating, setUpdaing] = useState(true);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [emailAddresses, setEmailAddresses] = useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [isAdminDecide, setIsAdminDecide] = useState(false);
  const [orderId, setOrderId] = useState();
  const [executiveAssignId, setExecutiveAssignId] = useState();
  const [isPopupLoading, setIsPopupLoading] = useState(true);

  const navigate = useNavigate();

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const Tile = ({ title, color, onClick, disabled, icon }) => {
    const handleClick = (event) => {
      // Prevent click action if disabled
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Trigger onClick if not disabled
      if (onClick) {
        onClick();
      }
    };
    return (
      <Box
        className="shadow-sm color-white"
        sx={{
          backgroundColor: color,
          padding: "10px",
          display: "flex",
          alignItems: "center",
          height: "100px",
          cursor: onClick && !disabled ? "pointer" : "default",
          opacity: disabled ? 0.3 : 1,
          pointerEvents: disabled ? "none" : "auto",
          position: "relative",
        }}
        onClick={handleClick}
      >
        <Typography
          variant="h5"
          style={{ textAlign: "center", fontWeight: "600" }}
        >
          {title}
        </Typography>
        <span className="widget-stat-icon">{icon}</span>
      </Box>
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = `${api}/get_orders_by_date/${storedDate}/${exe_id}`;
        setUpdaing(false);
        const orders = await GET(token, url);
        if (orders.status) {
          const processedOrders =
            orders.data && Array.isArray(orders.data)
              ? orders.data
              : orders.data && typeof orders.data === "object"
              ? Object.values(orders.data)
              : [];

          setOrders(processedOrders);
          setAllOrders(processedOrders);
        } else {
          setalertType("error");
          setalertMsg("Failed to fetch Orders");
          handleSnakBarOpen();
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setUpdaing(true);
      }
    };

    fetchOrders();
  }, []);

  // const staticLatitude = 10.8505;
  // const staticLongitude = 76.2711;

  // const [currentLocation, setCurrentLocation] = useState({
  //     lat: staticLatitude,
  //     lng: staticLongitude,
  // });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
    // setCurrentLocation({
    //     lat: staticLatitude,
    //     lng: staticLongitude,
    // });
  }, []);

  const formatAddress = (row) => {
    const { apartment_name, area, city, flat_no, landmark, pincode } = row;
    const addressParts = [
      flat_no,
      apartment_name,
      area,
      landmark,
      city,
      pincode,
    ];
    return addressParts.filter((part) => part).join(", ");
  };

  const handlePhoneClick = (phoneNumber) => {
    // This will open the default dialer with the given phone number
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleAddressClick = (address) => {
    if (currentLocation) {
      const { lat, lng } = currentLocation;
      console.log("Opening map for address:", address);

      // Construct the Google Maps URL with the user's current location and the destination address
      const mapUrl = `https://www.google.com/maps/dir/${lat},${lng}/${encodeURIComponent(
        address
      )}`;
      // Open the map URL
      window.open(mapUrl);
    } else {
      console.error("Current location is not available.");
    }
  };

  const handleConfirmStock = () => {
    navigate("/ConfirmStock");
  };

  const handleOpenDialog = () => {
    setSelectedOption("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setIsAdminDecide(false);
    setOpenDialog(false);
  };

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
    setIsAdminDecide(false);
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const processedOrders = allOrders.map((order) => ({
        ...order,
        temp_address: formatAddress(order),
      }));

      function searchArrayByValue(arr, searchQuery) {
        const keysToSearch = [
          "order_number",
          "name",
          "s_phone",
          "city",
          "flat_no",
          "apartment_name",
          "area",
          "landmark",
          "pincode",
          "temp_address",
        ];

        return arr.filter((obj) =>
          keysToSearch.some((key) => {
            const val = obj[key];
            if (val !== undefined) {
              if (typeof val === "string") {
                return val.toLowerCase().includes(searchQuery.toLowerCase());
              }
              if (typeof val === "number") {
                return val
                  .toString()
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
              }
            }
            return false;
          })
        );
      }

      setOrders(
        searchArrayByValue(processedOrders, e.target.value.toLowerCase())
      );
    }, 500);
  };

  const handleSubmit = async () => {
    const isFrom = isAdminDecide ? "let admin decide" : "submit";
    const payload = {
      exe_id: selectedOption,
      isFrom,
      order_id: orderId,
      date: storedDate,
      executive_assign_id: executiveAssignId,
    };
    const url = `${api}/re_assign_executive`;
    try {
      const response = await ADD(token, url, payload);
      if (response && response.status) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, is_reassigned: true } : order
          )
        );
      } else {
        console.error("Failed to reassign the order:", response);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
    setIsAdminDecide(false);
    handleCloseDialog();
  };

  const handleAdminDecide = () => {
    setIsAdminDecide(true);
  };

  const handleBack = () => {
    navigate("/Home");
  };

  const getExecutivesByPincode = async (pincode) => {
    try {
      const url = `${api}/get_executives_by_pincode/${pincode}/${exe_id}`;
      setIsPopupLoading(false);
      const executives = await GET(token, url);
      if (executives.status) {
        setEmailAddresses(executives.data);
        setIsPopupLoading(true);
      } else {
        setalertType("error");
        setalertMsg("Failed to fetch executives");
        handleSnakBarOpen();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "Order Number", width: 130 },
      { field: "name", headerName: "Customer Name", width: 200 },
      {
        field: "s_phone",
        headerName: "Phone Number",
        width: 150,
        renderCell: (params) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => handlePhoneClick(params.value)}
              color="primary"
            >
              <PhoneIcon style={{ fontSize: "18px" }} />
            </IconButton>
            <span style={{ marginLeft: "5px" }}>{params.value}</span>
          </div>
        ),
      },
      {
        field: "customerAddress",
        headerName: "Customer Address",
        width: 400,
        valueGetter: (params) => formatAddress(params.row),
        renderCell: (params) => {
          const address = params.value || "Loading address...";
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => handleAddressClick(address)}>
                <LocationOnIcon style={{ fontSize: "18px" }} />
              </IconButton>
              <span style={{ marginLeft: "5px", whiteSpace: "break-spaces" }}>
                {address}
              </span>
            </div>
          );
        },
      },
      {
        field: "action",
        headerName: "Action",
        width: 150,
        disableExport: true,
        renderCell: (params) => (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setOrderId(params.id);
              getExecutivesByPincode(params.row.pincode);
              setExecutiveAssignId(params.row.delivery_executive_orders_id);
              handleOpenDialog();
            }}
            disabled={
              isPastDate ||
              params.row?.is_reassigned ||
              params.row?.subs_id ||
              params.row?.updated_stock?.length > 0
            }
            style={{
              minWidth: "96px",
              backgroundColor: params.row?.is_reassigned ? "gray" : "primary",
              color: params.row?.is_reassigned ? "white" : "default",
              fontSize: "12px",
            }}
          >
            {params.row?.subs_id
              ? "Delivered"
              : params.row?.is_reassigned
              ? "Reassigned"
              : params.row?.updated_stock?.length > 0
              ? "Stock Confirmed"
              : "Reassign"}
          </Button>
        ),
      },
    ],
    [currentLocation, orders]
  );

  const handleProceedToDelivery = () => {
    navigate("/DeliveryOrders?isFromHome");
  };

  function CustomToolbar() {
    const fileName = `${user.name}_${formattedDate}`;
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
        style={{ marginBottom: "1rem" }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <GridToolbarExport
            csvOptions={{
              fileName: fileName,
              utf8WithBom: true,
            }}
            color="secondary"
            sx={{ fontSize: "15px" }}
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
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </div>
      </GridToolbarContainer>
    );
  }

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
      <Box className="flex items-center justify-between flex-wrap gap-2 w-100 title-menu">
        <Box display={"flex"} alignItems={"center"} gap={"1rem"}>
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
            {formattedDate} - 05:00 AM - 07:00 AM
            {/* Change Date / Time Slot */}
          </Typography>
        </Box>
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
              handleSearchChange(e);
            }}
          />
        </Box>
      </Box>

      <Box className="title-menu" sx={{ mt: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                border: "2px solid transparent",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: (props) =>
                    props.disabled ? "transparent" : colors.primary[500],
                  cursor: (props) =>
                    props.disabled ? "not-allowed" : "pointer",
                },
                transition: "border-color 0.3s",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                pointerEvents: (props) => (props.disabled ? "none" : "auto"), // Disable pointer events if disabled
              }}
            >
              <Tile
                icon={<AddchartIcon style={{ fontSize: 40 }} />}
                title="Accept / Re-Assign Orders"
                color={colors.warning[900]}
                disabled={false} // Set this value dynamically as needed
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                border: "2px solid transparent",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: (props) =>
                    isPastDate || isFutureDate
                      ? "transparent"
                      : colors.primary[500],
                  cursor: (props) =>
                    isPastDate || isFutureDate ? "not-allowed" : "pointer",
                },
                transition: "border-color 0.3s",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                pointerEvents: (props) =>
                  isPastDate || isFutureDate ? "none" : "auto", // Disable pointer events if disabled
              }}
            >
              <Tile
                icon={<ShoppingCartCheckout style={{ fontSize: 40 }} />}
                title="Confirm Stock"
                color={colors.info[900]}
                disabled={isPastDate || isFutureDate} // Make sure this is dynamically set
                onClick={() => handleConfirmStock()}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                border: "2px solid transparent",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: (props) =>
                    props.disabled ? "transparent" : colors.primary[500],
                  cursor: (props) =>
                    props.disabled ? "not-allowed" : "pointer",
                },
                transition: "border-color 0.3s",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                pointerEvents: (props) => (props.disabled ? "none" : "auto"), // Disable pointer events if disabled
              }}
            >
              <Tile
                icon={<DeliveryDining style={{ fontSize: 40 }} />}
                title="Delivery Details"
                color={colors.success[900]}
                disabled={false} // Set this value dynamically as needed
                onClick={() => handleProceedToDelivery()}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ height: " 100%", width: "100%" }}>
        {orders && isUpdating ? (
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
              rows={orders}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              localeText={{
                noRowsLabel: "No records found",
              }}
              getRowId={(row) => row.id}
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
      {/* Reassign Dialog */}
      {isPopupLoading && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md" // Options: 'xs', 'sm', 'md', 'lg', 'xl'
          fullWidth // Ensures the Dialog stretches to the maxWidth
          sx={{
            "& .MuiDialog-paper": {
              minWidth: "600px", // Minimum width of the popup
              minHeight: "400px", // Minimum height of the popup
            },
          }}
        >
          <DialogTitle>Reassign Order</DialogTitle>
          <DialogContent>
            <Select
              value={selectedOption}
              disabled={isAdminDecide}
              onChange={handleDropdownChange}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select an Option
              </MenuItem>
              {emailAddresses?.map((executive) => (
                <MenuItem
                  key={executive.executive_id}
                  value={executive.executive_id}
                >
                  {executive.name} - {executive.email}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color={isAdminDecide ? "success" : "primary"}
              disabled={isAdminDecide}
              onClick={handleAdminDecide}
            >
              Let Admin Decide
            </Button>
            <Button
              disabled={!isAdminDecide && selectedOption === ""}
              onClick={handleSubmit}
              color="secondary"
              variant="contained"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
export default DeliveryOrderDetails;
