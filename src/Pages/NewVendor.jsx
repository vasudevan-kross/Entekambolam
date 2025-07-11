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
  Typography,
  Grid,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import TextField from "@mui/material/TextField";
import api from "../Data/api";
import { ADD, GET, ADDMulti } from "../Functions/apiFunction";
import { tokens } from "../theme";
import Skeleton from "@mui/material/Skeleton";
import image from "../Data/image";
import FileUpload from "../Components/FileUploads";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function NewVendor() {
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

  const [supplierName, setSupplierName] = useState();
  const [userName, setUserName] = useState();
  const [officePhNo, setOfficePhNo] = useState();
  const [pocName, setPocName] = useState();
  const [pocPhNo, setPocPhNo] = useState();
  const [pocEmail, setPocEmail] = useState();
  const [fssai, setfssai] = useState();
  const [arn, setarn] = useState();
  const [pan, setPan] = useState();
  const [gstNo, setGstNo] = useState();
  const [gstStateCode, setGstStateCode] = useState();
  const [country, setCountry] = useState();
  const [state, setState] = useState();
  const [district, setDistrict] = useState();
  const [pincode, setPincode] = useState();
  const [address, setAddress] = useState();
  const [uid, setUid] = useState();
  const [isPriceEdit, setIsPriceEdit] = useState(false);
  const [outlet, setOutlet] = useState();
  const [bankName, setBankName] = useState();
  const [acNo, setAcNo] = useState();
  const [ifsc, setifsc] = useState();
  const [branchName, setBranchName] = useState();
  const [branchAddress, setBranchAddress] = useState();

  const [checkBookImage, setCheckBookImage] = useState();
  const [agreementImage, setAgreementImage] = useState();
  const [panCardImage, setPanCardImage] = useState();
  const [gstCertificateImage, setGstCertificateImage] = useState();
  const [fssiCertificateImage, setFssiCertificateImage] = useState();

  const [passBookImgAdd, setPassBookImgAdd] = useState();
  const [agreementImgAdd, setAgreementImgAdd] = useState();
  const [panCardImgAdd, setPANCardImgAdd] = useState();
  const [gstImgAdd, setGSTImgAdd] = useState();
  const [fssiImgAdd, setFSSIImgAdd] = useState();

  const [vendors, setVendors] = useState();
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
    const getVendor = async () => {
      setUpdatedState(false);
      const url = `${api}/get_vendor_by_id/${param.id}`;
      const vendor = await GET(token, url);
      if (vendor.response === 200 && vendor.data) {
        const data = vendor.data;
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
        setSupplierName(data.supplier_name);
        setUserName(data.user_name);
        setOfficePhNo(data.office_ph_no);
        setPocName(data.poc_name);
        setPocPhNo(data.poc_ph_no);
        setPocEmail(data.poc_email);
        setfssai(data.fssai);
        setarn(data.arn);
        setPan(data.pan);
        setGstNo(data.gst_no);
        setGstStateCode(data.gst_state_code);
        setPincode(data.pincode);
        setAddress(data.address);
        setUid(data.uid);
        setIsPriceEdit(data.is_price_edit === 1);
        setOutlet(data.outlet);
        setBankName(data.bankName);
        setAcNo(data.ac_no);
        setifsc(data.ifsc);
        setBranchName(data.branch_name);
        setBranchAddress(data.branch_address);
        setCheckBookImage(
          data.check_book_image != null && `${image}/${data.check_book_image}`
        );
        setAgreementImage(
          data.agreement_image != null && `${image}/${data.agreement_image}`
        );
        setPanCardImage(
          data.pan_card_image != null && `${image}/${data.pan_card_image}`
        );
        setGstCertificateImage(
          data.gst_certificate_image != null &&
            `${image}/${data.gst_certificate_image}`
        );
        setFssiCertificateImage(
          data.fssiCertificateImage != null &&
            `${image}/${data.fssiCertificateImage}`
        );

        setPassBookImgAdd(
          data.check_book_image != null && `${image}/${data.check_book_image}`
        );
        setAgreementImgAdd(
          data.agreement_image != null && `${image}/${data.agreement_image}`
        );
        setPANCardImgAdd(
          data.pan_card_image != null && `${image}/${data.pan_card_image}`
        );
        setGSTImgAdd(
          data.gst_certificate_image != null &&
            `${image}/${data.gst_certificate_image}`
        );
        setFSSIImgAdd(
          data.fssiCertificateImage != null &&
            `${image}/${data.fssiCertificateImage}`
        );
      }

      setUpdatedState(true);
    };
    const getVendors = async () => {
      setUpdatedState(false);
      const url = `${api}/get_vendors`;
      const result = await GET(token, url);
      setVendors(result.data);
      if (param.id) {
        getVendor();
      } else {
        setUpdatedState(true);
      }
    };
    getVendors();
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

  const documentCol = [
    "PassBookCopy",
    "Agreement",
    "PANCard",
    "GSTCertificate",
    "FSSICertificate",
  ];
  const handleFormChange = (e) => {
    const { id, value, files } = e.target;
    if (documentCol.includes(id)) {
      if (files & files[0] && files[0].size / 1024 >= 2048) {
        alert("file size must be less then 2mb");
        return;
      }
    }
    switch (id) {
      case "SupplierName":
        setSupplierName(value);
        break;
      case "Username":
        setUserName(value);
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
      case "ARN":
        setarn(value);
        break;
      case "PAN":
        setPan(value);
        break;
      case "GSTNO":
        setGstNo(value);
        break;
      case "GSTStateCode":
        setGstStateCode(value);
        break;
      case "Pincode":
        setPincode(value);
        break;
      case "UID":
        setUid(value);
        break;
      case "Address":
        setAddress(value);
        break;
      case "BankName":
        setBankName(value);
        break;
      case "acNo":
        setAcNo(value);
        break;
      case "IFSC":
        setifsc(value);
        break;
      case "BranchName":
        setBranchName(value);
        break;
      case "PassBookCopy":
        if (files && files[0] && files[0].size / 1024 <= 2048) {
          setPassBookImgAdd(URL.createObjectURL(e.target.files[0]));
          setCheckBookImage(files[0]);
        }
        break;
      case "BranchAddress":
        setBranchAddress(value);
        break;
      case "Agreement":
        if (files && files[0] && files[0].size / 1024 <= 2048) {
          setAgreementImgAdd(URL.createObjectURL(e.target.files[0]));
          setAgreementImage(files[0]);
        }
        break;
      case "PANCard":
        if (files && files[0] && files[0].size / 1024 <= 2048) {
          setPANCardImgAdd(URL.createObjectURL(e.target.files[0]));
          setPanCardImage(files[0]);
        }
        break;
      case "GSTCertificate":
        if (files && files[0] && files[0].size / 1024 <= 2048) {
          setGSTImgAdd(URL.createObjectURL(e.target.files[0]));
          setGstCertificateImage(files[0]);
        }
        break;
      case "FSSICertificate":
        if (files && files[0] && files[0].size / 1024 <= 2048) {
          setFSSIImgAdd(URL.createObjectURL(e.target.files[0]));
          setFssiCertificateImage(files[0]);
        }
        break;
    }
  };

  const addVendor = async (e) => {
    e.preventDefault();
    setLOADING(true);
    const vendorData = {
      supplier_name: supplierName,
      user_name: userName,
      office_ph_no: officePhNo,
      poc_name: pocName,
      poc_ph_no: pocPhNo,
      poc_email: pocEmail,
      fssai: fssai,
      arn: arn,
      pan: pan,
      gst_no: gstNo,
      gst_state_code: gstStateCode,
      country: country,
      state: state,
      district: district,
      pincode: pincode,
      address: address,
      uid: uid,
      is_price_edit: isPriceEdit,
      outlet: outlet,
      bankName: bankName,
      ac_no: acNo,
      ifsc: ifsc,
      branch_name: branchName,
      branch_address: branchAddress,
    };
    const data = JSON.stringify(vendorData);
    const url = `${api}/add_vendor`;
    const addVendor = await ADD(token, url, data);
    if (addVendor.response === 200) {
      if (
        checkBookImage ||
        agreementImage ||
        panCardImage ||
        gstCertificateImage ||
        fssiCertificateImage
      ) {
        var imgData = [
          { image_type: 3, image: checkBookImage },
          { image_type: 4, image: agreementImage },
          { image_type: 5, image: panCardImage },
          { image_type: 6, image: gstCertificateImage },
          { image_type: 7, image: fssiCertificateImage },
        ];
        let UploadUrl = `${api}/vendor/upload_images`;
        let uploadData = {
          imgData: imgData,
          id: addVendor.id,
        };
        await ADDMulti(token, UploadUrl, uploadData);
      }

      setalertType("success");
      setalertMsg("New Supplier Added successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/Supplier");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(addVendor.message || "Error adding Supplier");
      handleSnakBarOpen();
      setLOADING(false);
    }
  };

  const updateVendor = async (e) => {
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
    const vendorData = {
      id: param.id,
      supplier_name: supplierName,
      user_name: userName,
      office_ph_no: officePhNo,
      poc_name: pocName,
      poc_ph_no: pocPhNo,
      poc_email: pocEmail,
      fssai: fssai,
      arn: arn,
      pan: pan,
      gst_no: gstNo,
      gst_state_code: gstStateCode,
      country: country,
      state: state,
      district: district,
      pincode: pincode,
      address: address,
      uid: uid,
      is_price_edit: isPriceEdit,
      outlet: outlet,
      bankName: bankName,
      ac_no: acNo,
      ifsc: ifsc,
      branch_name: branchName,
      branch_address: branchAddress,
    };
    const data = JSON.stringify(vendorData);
    const url = `${api}/update_vendor`;
    const addVendor = await ADD(token, url, data);
    if (addVendor.response === 200) {
      if (
        checkBookImage ||
        agreementImage ||
        panCardImage ||
        gstCertificateImage ||
        fssiCertificateImage
      ) {
        var imgData = [
          { image_type: 3, image: checkBookImage },
          { image_type: 4, image: agreementImage },
          { image_type: 5, image: panCardImage },
          { image_type: 6, image: gstCertificateImage },
          { image_type: 7, image: fssiCertificateImage },
        ];
        let UploadUrl = `${api}/vendor/upload_images`;
        let uploadData = {
          imgData: imgData,
          id: addVendor.id,
        };
        await ADDMulti(token, UploadUrl, uploadData);
      }

      setalertType("success");
      setalertMsg("Supplier Updated successfully");
      handleSnakBarOpen();
      setLOADING(false);
      setTimeout(() => {
        navigate("/Supplier");
      }, 1000);
    } else {
      setalertType("error");
      setalertMsg(addVendor.message || "Error updating Supplier");
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
              navigate("/Supplier");
            }}
          >
            <ArrowBackIcon />
          </IconButton>{" "}
          <h2 className="heading">
            {" "}
            {param.id ? "Update Supplier" : "Add New Supplier"}{" "}
          </h2>
        </div>
      </Box>
      {isStateUpdated ? (
        <Box component="form" onSubmit={param.id ? updateVendor : addVendor}>
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
                  id="SupplierName"
                  label="Supplier Name"
                  name="Supplier Name"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={supplierName}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Username"
                  label="Username / Office Email"
                  name="Username"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={userName}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="OfficePhoneNo"
                  label="Office Phone No."
                  name="Office Phone No."
                  type="text"
                  color="secondary"
                  onKeyPress={(e) => {
                    // Allow only numbers
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Limit input to 10 digits
                    if (e.target.value.length <= 10) {
                      handleFormChange(e);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ maxLength: 10 }} // Enforce max length at HTML level as well
                  size="small"
                  value={officePhNo}
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
                  onKeyPress={(e) => {
                    // Allow only numbers
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Limit input to 10 digits
                    if (e.target.value.length <= 10) {
                      handleFormChange(e);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ maxLength: 10 }} // Enforce max length at HTML level as well
                  size="small"
                  value={pocPhNo}
                />

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
                  id="ARN"
                  label="ARN"
                  name="ARN"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  type="text"
                  color="secondary"
                  size="small"
                  value={arn}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="PAN"
                  label="PAN"
                  name="PAN"
                  type="text"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={pan}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="GSTNO"
                  label="GST NO"
                  name="GST NO"
                  type="text"
                  value={gstNo}
                  color="secondary"
                  size="small"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="GSTStateCode"
                  label="GST State Code"
                  name="GST State Code"
                  type="text"
                  color="secondary"
                  size="small"
                  value={gstStateCode}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
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
                  inputProps={{ maxLength: 6 }} // Enforce max length at HTML level as well
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
                  id="UID"
                  type="text"
                  label="UID"
                  name="UID"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={uid}
                />
                <Autocomplete
                  disablePortal
                  fullWidth
                  id="Outlet"
                  color="secondary"
                  options={vendors?.filter((w) => w.is_active === 1) || []}
                  value={
                    vendors?.find(
                      (vendor) => vendor.supplier_name === outlet
                    ) || null
                  }
                  // onChange={handleOutletChange}
                  onChange={(event, value) => {
                    setOutlet(value.supplier_name);
                  }}
                  getOptionLabel={(option) => option?.supplier_name || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Outlet"
                      name="Outlet"
                      size="small"
                      fullWidth
                      color="secondary"
                    />
                  )}
                />
                <Box fullWidth>
                  <div className="sub">
                    <label htmlFor="subscrip" className="subMAin">
                      Enable Purchase Price Edit
                    </label>
                    <div class="toggle-switch">
                      <input
                        class="toggle-input"
                        id="isPriceEdit"
                        type="checkbox"
                        checked={isPriceEdit}
                        onChange={(e) => {
                          setIsPriceEdit(!isPriceEdit);
                        }}
                      />
                      <label class="toggle-label" for="isPriceEdit"></label>
                    </div>
                  </div>
                </Box>
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
                  id="Address"
                  label="Address"
                  name="Address"
                  type="text"
                  multiline
                  minRows="3"
                  color="secondary"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  value={address}
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
              <h2>Bank Info</h2>
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
                  id="BankName"
                  label="Bank Name"
                  name="Bank Name"
                  type="text"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={bankName}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="acNo"
                  type="text"
                  label="A/C No."
                  name="A/C No."
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={acNo}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  type="text"
                  id="IFSC"
                  label="IFSC"
                  name="IFSC"
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={ifsc}
                />
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    type="text"
                    id="BranchName"
                    label="Branch Name"
                    name="Branch Name"
                    onChange={handleFormChange}
                    InputLabelProps={{ shrink: true }}
                    color="secondary"
                    size="small"
                    value={branchName}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" gap="1rem">
                    <FileUpload
                      id="PassBookCopy"
                      label="Cancel Check/PassBook Copy"
                      name="passbookCopy"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleFormChange}
                      placeholder="Upload Image"
                      color="primary"
                      size="medium"
                    />
                    {passBookImgAdd && (
                      <img
                        src={passBookImgAdd}
                        alt={passBookImgAdd}
                        style={{
                          width: "100px",
                          height: "auto",
                          marginTop: "20px",
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                {/* </Box> */}
              </Grid>
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
                  id="BranchAddress"
                  label="Branch Address"
                  name="Branch Address"
                  minRows="3"
                  multiline
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  color="secondary"
                  size="small"
                  value={branchAddress}
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
              <h2>Documents Info</h2>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Box display="flex" gap="1rem">
                    <FileUpload
                      id="Agreement"
                      label="Agreement"
                      name="Agreement"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleFormChange}
                      placeholder="Upload Image"
                      color="primary"
                      size="medium"
                    />
                    {agreementImgAdd && (
                      <Box textAlign="center">
                        <img
                          src={agreementImgAdd}
                          alt="Agreement"
                          style={{
                            width: "100px",
                            height: "auto",
                            marginTop: "10px",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box display="flex" gap="1rem">
                    <FileUpload
                      id="PANCard"
                      label="PAN Card"
                      name="PAN Card"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleFormChange}
                      placeholder="Upload Image"
                      color="primary"
                      size="medium"
                    />
                    {panCardImgAdd && (
                      <Box textAlign="center">
                        <img
                          src={panCardImgAdd}
                          alt="PAN Card"
                          style={{
                            width: "100px",
                            height: "auto",
                            marginTop: "10px",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box display="flex" gap="1rem">
                    <FileUpload
                      id="GSTCertificate"
                      label="GST Certificate"
                      name="GST Certificate"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleFormChange}
                      placeholder="Upload Image"
                      color="primary"
                      size="medium"
                    />
                    {gstImgAdd && (
                      <Box textAlign="center">
                        <img
                          src={gstImgAdd}
                          alt="GST Certificate"
                          style={{
                            width: "100px",
                            height: "auto",
                            marginTop: "10px",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box display="flex" gap="1rem">
                    <FileUpload
                      id="FSSICertificate"
                      label="FSSI Certificate"
                      name="FSSI Certificate"
                      accept=".png, .jpg, .jpeg"
                      onChange={handleFormChange}
                      placeholder="Upload Image"
                      color="primary"
                      size="medium"
                    />
                    {fssiImgAdd && (
                      <Box textAlign="center">
                        <img
                          src={fssiImgAdd}
                          alt="FSSI Certificate"
                          style={{
                            width: "100px",
                            height: "auto",
                            marginTop: "10px",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
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
                "Update Supplier"
              ) : (
                "Add New Supplier"
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

export default NewVendor;
