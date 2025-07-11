import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/system";
import {
  Button,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import TextField from "@mui/material/TextField";
import api from "../Data/api";
import { ADD, GET } from "../Functions/apiFunction";
import { tokens } from "../theme";
import Skeleton from "@mui/material/Skeleton";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function NewWarehouse() {
  const users = useSelector((state) => {
    return state.Users[state.Users.length - 1];
  });

  const theme = useTheme();
  const param = useParams();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [LOADING, setLOADING] = useState(false);
  const [isStateUpdated, setUpdatedState] = useState(true);

  const [uid, setUid] = useState();
  const [warehouseName, setWarehouseName] = useState();
  const [email, setEmail] = useState();
  const [officePhNo, setOfficePhNo] = useState();
  const [pocName, setPocName] = useState();
  const [pocPhNo, setPocPhNo] = useState();
  const [pocEmail, setPocEmail] = useState();
  const [fssai, setfssai] = useState();
  const [gstNo, setGstNo] = useState();
  const [billingAddress, setBillingAddress] = useState();
  const [country, setCountry] = useState();
  const [state, setState] = useState();
  const [district, setDistrict] = useState();
  const [pincode, setPincode] = useState();
  const [address, setAddress] = useState();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [serviceCity, setServiceCity] = useState();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const locationData = [
    {
      contryid: 1,
      country: "India",
      states: [
        {
          state: "Kerala",
          districts: [
            "Thiruvananthapuram",
            "Eranakulam",
            "Kollam",
            "Pathanamthitta",
            "Alappuzha",
            "Kottayam",
            "Idukki",
            "Kannur",
            "Kasaragod",
            "Kozhikode",
            "Wayanad",
            "Malappuram",
            "Palakkad",
            "Thrissur",
          ],
        },
        {
          state: "Karnataka",
          districts: ["Bangalore"],
        },
        {
          state: "Tamilnadu",
          districts: ["Chennai"],
        },
      ],
    },
  ];

  const [countries, setCountries] = React.useState(
    locationData.map((loc) => loc.country)
  );
  const [states, setStates] = React.useState([]);
  const [districts, setDistricts] = React.useState([]);

  useEffect(() => {
    const getWarehouse = async () => {
      setUpdatedState(false);
      const url = `${api}/get_warehouse_by_id/${param.id}`;
      const warehouse = await GET(token, url);
      if (warehouse.response === 200 && warehouse.data) {
        const data = warehouse.data;
        const selectedCountryData = locationData.find(
          (loc) => loc.country === data.country
        );
        setStates(
          selectedCountryData
            ? selectedCountryData.states.map((s) => s.state)
            : []
        );
        const selectedStateData = locationData
          .find((loc) => loc.country === data.country)
          ?.states.find((s) => s.state === data.state);
        setDistricts(selectedStateData ? selectedStateData.districts : []);
        setCountry(data.country);
        setState(data.state);
        setDistrict(data.district);
        setUid(data.uid);
        setWarehouseName(data.warehouse_name);
        setEmail(data.email);
        setOfficePhNo(data.phone_no);
        setPocName(data.poc_name);
        setPocPhNo(data.poc_ph_no);
        setPocEmail(data.poc_email);
        setfssai(data.fssai);
        setGstNo(data.gst_no);
        setBillingAddress(data.billing_address);
        setPincode(data.pincode);
        setAddress(data.address);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setServiceCity(data.service_city);
      }
      setUpdatedState(true);
    };
    if (param.id) {
      getWarehouse();
    }
  }, []);

  const handleCountryChange = async (event, value) => {
    setCountry(value);
    const selectedCountryData = locationData.find(
      (loc) => loc.country === value
    );
    setStates(
      selectedCountryData ? selectedCountryData.states.map((s) => s.state) : []
    );
    setDistricts([]);
    setState(null);
    setDistrict(null);
  };

  const handleStateChange = async (event, value) => {
    setState(value);
    const selectedStateData = locationData
      .find((loc) => loc.country === country)
      ?.states.find((s) => s.state === value);
    setDistricts(selectedStateData ? selectedStateData.districts : []);
    setDistrict(null);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    switch (id) {
      case "UID":
        setUid(value);
        break;
      case "WarehouseName":
        setWarehouseName(value);
        break;
      case "Email":
        setEmail(value);
        break;
      case "OfficePhoneNo":
        setOfficePhNo(value);
        break;
      case "POCName":
        setPocName(value);
        break;
      case "POCPhoneNo":
        setPocPhNo(value);
        break;
      case "POCEmail":
        setPocEmail(value);
        break;
      case "FSSAI":
        setfssai(value);
        break;
      case "GSTNO":
        setGstNo(value);
        break;
      case "BillingAddress":
        setBillingAddress(value);
        break;
      case "Pincode":
        setPincode(value);
        break;
      case "Address":
        setAddress(value);
        break;
      case "Latitude":
        setLatitude(value);
        break;
      case "Longitude":
        setLongitude(value);
        break;
      case "ServiceCity":
        setServiceCity(value);
        break;
    }
  };

  const addWarehouse = async (e) => {
    e.preventDefault();
    setLOADING(true);
    const warehouseData = {
      uid: uid,
      warehouse_name: warehouseName,
      email: email,
      phone_no: officePhNo,
      poc_name: pocName,
      poc_ph_no: pocPhNo,
      poc_email: pocEmail,
      fssai: fssai,
      gst_no: gstNo,
      billing_address: billingAddress,
      country: country,
      state: state,
      district: district,
      pincode: pincode,
      address: address,
      latitude: latitude,
      longitude: longitude,
      service_city: serviceCity,
    };
    const data = JSON.stringify(warehouseData);
    const url = `${api}/add_warehouse`;
    const addWarehouse = await ADD(token, url, data);
    if (addWarehouse.response === 200) {
      setalertType("success");
      setalertMsg("New Warehouse Added successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/Warehouse");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(addWarehouse.message || "Error adding Warehouse");
      handleSnakBarOpen();
      setLOADING(false);
    }
  };

  const updateWarehouse = async (e) => {
    e.preventDefault();
    if (!district) {
      setalertType("error");
      setalertMsg(
        !country
          ? "please fill Country"
          : !state
          ? "please fill State"
          : "please fill District"
      );
      handleSnakBarOpen();
      return;
    }
    setLOADING(true);
    const warehouseData = {
      id: param.id,
      uid: uid,
      warehouse_name: warehouseName,
      email: email,
      phone_no: officePhNo,
      poc_name: pocName,
      poc_ph_no: pocPhNo,
      poc_email: pocEmail,
      fssai: fssai,
      gst_no: gstNo,
      billing_address: billingAddress,
      country: country,
      state: state,
      district: district,
      pincode: pincode,
      address: address,
      latitude: latitude,
      longitude: longitude,
      service_city: serviceCity,
    };
    const data = JSON.stringify(warehouseData);
    const url = `${api}/update_warehouse`;
    const addWarehouse = await ADD(token, url, data);
    if (addWarehouse.response === 200) {
      setalertType("success");
      setalertMsg("Warehouse Updated successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/Warehouse");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(addWarehouse.message || "Error updating Warehouse");
      handleSnakBarOpen();
      setLOADING(false);
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
              navigate("/Warehouse");
            }}
          >
            <ArrowBackIcon />
          </IconButton>{" "}
          <h2 className="heading">
            {" "}
            {param.id ? "Update Warehouse" : "Add New Warehouse"}{" "}
          </h2>
        </div>
      </Box>
      {isStateUpdated ? (
        <Box
          component="form"
          onSubmit={param.id ? updateWarehouse : addWarehouse}
        >
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              <h2>Basic Info</h2>
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
                  id="UID"
                  label="UID"
                  name="UID"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={uid}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="WarehouseName"
                  label="Warehouse Name"
                  name="Warehouse Name"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={warehouseName}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Email"
                  label="Email"
                  name="Email"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={email}
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
                  id="OfficePhoneNo"
                  label="Office Phone No."
                  name="Office Phone No."
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={officePhNo}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="POCName"
                  label="POC Name "
                  name="POC Name "
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={pocName}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="POCPhoneNo"
                  label="POC Phone No."
                  name="POC Phone No."
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={pocPhNo}
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
                  id="POCEmail"
                  label="POC Email"
                  name="POC Email"
                  type="text"
                  color="secondary"
                  size="small"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  value={pocEmail}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="FSSAI"
                  label="FSSAI"
                  name="FSSAI"
                  type="text"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={fssai}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="GSTNO"
                  label="GST NO"
                  name="GST NO"
                  type="text"
                  color="secondary"
                  size="small"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  value={gstNo}
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
                  fullWidth
                  required
                  id="BillingAddress"
                  label="Warehouse Billing Address"
                  name="Warehouse Billing Address"
                  type="text"
                  multiline
                  minRows="3"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={billingAddress}
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
              <h2>Warehouse / Delivery Address</h2>
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
                  id="Country"
                  color="secondary"
                  options={countries}
                  value={country}
                  onChange={handleCountryChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country"
                      name="Country"
                      size="small"
                      value={country}
                      fullWidth
                      required={!param.id}
                      color="secondary"
                    />
                  )}
                />
                <Autocomplete
                  disablePortal
                  fullWidth
                  id="State"
                  color="secondary"
                  options={states}
                  value={country ? state : ""}
                  onChange={handleStateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State"
                      name="State"
                      size="small"
                      value={state}
                      fullWidth
                      required={!param.id}
                      color="secondary"
                    />
                  )}
                />
                <Autocomplete
                  disablePortal
                  fullWidth
                  id="District"
                  color="secondary"
                  options={districts}
                  value={country && state ? district : ""}
                  onChange={(e, value) => {
                    setDistrict(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="District"
                      name="District"
                      size="small"
                      value={district}
                      fullWidth
                      required={!param.id}
                      color="secondary"
                    />
                  )}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Pincode"
                  label="Pincode"
                  name="Pincode"
                  type="text"
                  color="secondary"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={pincode}
                  onKeyPress={(e) => {
                    // Allow only numbers
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Limit input to 6 digits
                    if (e.target.value.length <= 6) {
                      handleFormChange(e);
                    }
                  }}
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2 }}
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
                  type="text"
                  id="Address"
                  label="Address"
                  name="Address"
                  minRows="3"
                  multiline
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={address}
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
                  fullWidth
                  required
                  id="Latitude"
                  label="Latitude"
                  name="Latitude"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={latitude}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="Longitude"
                  label="Longitude"
                  name="Longitude"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={longitude}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="ServiceCity"
                  label="Service City"
                  name="Service City"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={serviceCity}
                />
              </Box>
            </div>
          </div>
          <div className="delete">
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="secondary"
              sx={{ fontWeight: "600", letterSpacing: "1px" }}
            >
              {LOADING ? (
                <CircularProgress size={20} />
              ) : param.id ? (
                "Update Warehouse"
              ) : (
                "Add New Warehouse"
              )}
            </Button>
          </div>
        </Box>
      ) : (
        <LoadingSkeleton rows={6} height={30} />
      )}
    </>
  );
}

export default NewWarehouse;
