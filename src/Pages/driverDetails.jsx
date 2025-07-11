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
import { ADD, GET, ADDMulti } from "../Functions/apiFunction";
import { tokens } from "../theme";
import Skeleton from "@mui/material/Skeleton";
import image from "../Data/image";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function DriverDetails() {
    const theme = useTheme();
    const param = useParams();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [snakbarOpen, setsnakbarOpen] = useState(false);
    const [alertType, setalertType] = useState("");
    const [alertMsg, setalertMsg] = useState("");
    const [LOADING, setLOADING] = useState(false);
    const [isStateUpdated, setUpdatedState] = useState(true);

    //Basic info states
    const [name, SetName] = useState();
    const [email, setEmail] = useState();
    const [phnNo1, setPhnNo1] = useState();
    const [phnNo2, setPhnNo2] = useState();
    const [dob, setDob] = useState();
    const [photo, setPhoto] = useState();
    const [photoImgAdd, setphotoImgAdd] = useState();

    //Address info states
    const [country, setCountry] = useState();
    const [state, setState] = useState();
    const [district, setDistrict] = useState();
    const [address, setAddress] = useState();

    //Documents Info states
    const [docType, setDocType] = useState();
    const [docNumber, setDocNumber] = useState();
    const [docPhoto, setDocPhoto] = useState();
    const [docPhotoImgAdd, setDocPhotoImgAdd] = useState();

    //vehicle Info states
    const [vehicleNo, setVehicleNo] = useState();
    const [vehicleInsNo, setVehicleInsNo] = useState();
    const [vehicleInsExpDate, setVehicleInsExpDate] = useState();

    //Personal Insurance Info states
    const [personalInsNo, setPersonalInsNo] = useState();
    const [depositAmt, setDepositAmt] = useState();
    const [depositDate, setDepositDate] = useState();
    const [depositReceiptNo, setDepositReceiptNo] = useState();

    //Bank info states
    const [bankNames, setBankNames] = useState();
    const [accNo, setAccNo] = useState();
    const [branchName, setBranchName] = useState();
    const [branchAddress, setBranchAddress] = useState();
    const [ifsc, setIfsc] = useState();
    const [upiId, setUpiId] = useState();

    //others info states
    const [city, SetCity] = useState();
    const [dateOfJoining, setDateOfJoining] = useState();
    const [uID, setUID] = useState();
    const [basicSalary, setBasicSalary] = useState(null);
    const [remunerationModel, setRemunerationModel] = useState("Fixed-Pay-Model");
    const [deliveryFeePerCustomer, setDeliveryFeePerCustomer] = useState(null);
    const [percentageOfMargin, setPercentageOfMargin] = useState(null);
    const [dailyIncentives, setDailyIncentives] = useState();
    const [otherIncentives, setOtherIncentives] = useState();
    const [referredBy, setReferredBy] = useState();
    const [specificProduct, setSpecificProduct] = useState();
    const [comments, setComments] = useState();
    
    const [emailAddresses, setEmailAddresses] = useState([]);
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
                    ]
                },
                {
                    state: "Karnataka",
                    districts: ["Bangalore"]
                },
                {
                    state: "Tamilnadu",
                    districts: ["Chennai"]
                },
            ]
        },
    ];

    const [countries, setCountries] = React.useState(locationData.map(loc => loc.country));
    const [states, setStates] = React.useState([]);
    const [districts, setDistricts] = React.useState([]);


    useEffect(() => {
        const getExecutiveDetails = async () => {
            setUpdatedState(false);
            const url = `${api}/get_executive_by_id/${param.id}`;
            const executive = await GET(token, url);
            if (executive.response === 200 && executive.data) {
                const data = executive.data;
                const parsedRemuneration = JSON.parse(data.remuneration_model);

                //Basic info 
                SetName(data.name);
                setEmail(data.email);
                setPhnNo1(data.phn_no1);
                setPhnNo2(data.phn_no2);
                setDob(data.dob);
                setPhoto(data.executive_image != null && `${image}/${data.executive_image}`);
                setphotoImgAdd(data.executive_image != null && `${image}/${data.executive_image}`);

                //Address info 
                const selectedCountryData = locationData.find(loc => loc.country === data.country);
                setStates(selectedCountryData ? selectedCountryData.states.map(s => s.state) : []);
                const selectedStateData = locationData.find(loc => loc.country === data.country)?.states.find(s => s.state === data.state);
                setDistricts(selectedStateData ? selectedStateData.districts : []);
                setCountry(data.country);
                setState(data.state);
                setDistrict(data.district);
                setAddress(data.address);

                //Documents Info
                setDocType(data.doc_type);
                setDocNumber(data.doc_no);
                setDocPhoto(data.doc_image != null && `${image}/${data.doc_image}`);
                setDocPhotoImgAdd(data.doc_image != null && `${image}/${data.doc_image}`);

                //vehicle Info 
                setVehicleNo(data.vehicle_no);
                setVehicleInsNo(data.vehicle_ins_no);
                setVehicleInsExpDate(data.vehicle_ins_exp_date);

                //Personal Insurance Info
                setPersonalInsNo(data.personal_ins_no);
                setDepositAmt(data.deposit_amt);
                setDepositDate(data.deposit_date);
                setDepositReceiptNo(data.deposit_receipt_no);

                //Bank info 
                setBankNames(data.bank);
                setAccNo(data.account_no);
                setBranchName(data.branch_name);
                setBranchAddress(data.branch_address);
                setIfsc(data.ifsc);
                setUpiId(data.upi);

                //others info states
                SetCity(data.city);
                setDateOfJoining(data.doj);
                setUID(data.uid);
                setRemunerationModel((parsedRemuneration.remuneration_type === 1) ? "Fixed-Pay-Model" : (parsedRemuneration.remuneration_type === 2) ? "Delivery-Fee-Model" : "Margin-Model");
                setBasicSalary(parsedRemuneration.basic);
                setDeliveryFeePerCustomer(parsedRemuneration.delivery_fee);
                setPercentageOfMargin(parsedRemuneration.percentage_margin);
                setDailyIncentives(parsedRemuneration.daily_incentives);
                setOtherIncentives(parsedRemuneration.other_incentives);
                setReferredBy(data.referred_by);
                setSpecificProduct(data.specific_product_inclusion);
                setComments(data.comments);
            }
            setUpdatedState(true);
        };
        const getExecutiveEmails = async () => {
            setUpdatedState(false);
            const url = `${api}/get_executive_emails`;
            const executive = await GET(token, url);
            if(executive.status) {
                setEmailAddresses(executive.data);
            }
            setUpdatedState(true);
        }
        if (param.id) {
            getExecutiveDetails();
        } else {
            getExecutiveEmails();
        }

    }, []);

    const handleCountryChange = async (event, value) => {
        setCountry(value);
        const selectedCountryData = locationData.find(loc => loc.country === value);
        setStates(selectedCountryData ? selectedCountryData.states.map(s => s.state) : []);
        setDistricts([]);
        setState(null);
        setDistrict(null);
    };

    const handleStateChange = async (event, value) => {
        setState(value);
        const selectedStateData = locationData.find(loc => loc.country === country)?.states.find(s => s.state === value);
        setDistricts(selectedStateData ? selectedStateData.districts : []);
        setDistrict(null);
    };
    const documentOptions = [
        "PAN Card",
        "Driving License",
        "RC Book",
        "Vehicle Insurance",
        "ID/Address Proof",
        "Pollution Certificate",
        "Aadhaar / UID"
    ];

    const handleDocumentTypeChange = (event, newValue) => {
        setDocType(newValue);
    };

    const bankOptions = [
        "Andhra Bank",
        "Axis Bank Ltd.",
        "Bandhan Bank Ltd.",
        "Bank of Baroda",
        "Bank of India",
        "Bank of Maharashtra",
        "Canara Bank",
        "Central Bank of India",
        "City Union Bank Ltd.",
        "Co-operative Bank",
        "CSB Bank Limited",
        "DCB Bank Ltd.",
        "Dhanlaxmi Bank Ltd.",
        "ESAF Small Finance Bank",
        "Federal Bank Ltd.",
        "Fincare Small Finance Bank",
        "HDFC Bank Ltd",
        "HDFC Bank Ltd.",
        "IDBI Bank Limited",
        "IDFC First Bank Limited",
        "Indian Bank",
        "Indian Overseas Bank",
        "IndisInd Bank Ltd",
        "Jammu & Kashmir Bank Ltd.",
        "Karnataka Bank Ltd.",
        "Karur Vysya Bank Ltd.",
        "Kerela Gramin Bank",
        "Kotak Mahindra Bank Ltd",
        "Kozhikode District Co-Operative Bank",
        "Lakshmi Vilas Bank Ltd.",
        "Nainital bank Ltd.",
        "Paytm Payments Bank Ltd",
        "Punjab & Sind Bank",
        "Punjab National Bank",
        "RBL Bank Ltd.",
        "South Indian Bank Ltd.",
        "State Bank of India",
        "Syndicate Bank",
        "Tamilnad Mercantile Bank Ltd.",
        "ttt",
        "UCO Bank",
        "Union Bank of India",
        "YES Bank Ltd."
    ];

    const handleBankNameChange = (event, newValue) => {
        setBankNames(newValue);
    };

    const cityOptions = [
        "Thiruvanandhapuram",
    ];

    const handleCityNameChange = (event, newValue) => {
        SetCity(newValue);
    };

    const remunerationModelOptions = [
        "Fixed-Pay-Model",
        "Delivery-Fee-Model",
        "Margin-Model",
    ];

    const handleRenumerationModelChange = (event, newValue) => {
        setRemunerationModel(newValue);
        setDeliveryFeePerCustomer();
        setBasicSalary();
        setPercentageOfMargin();
    };

    const documentCol = ["Photo", "DocumentPhoto"];
    const handleFormChange = (e) => {
        const { id, value, files } = e.target;
        if (documentCol.includes(id)) {
            if (files & files[0] && files[0].size / 1024 >= 2048) {
                alert("file size must be less then 2mb");
                return;
            }
        }
        switch (id) {
            case "Name":
                SetName(value);
                break;
            case "Email":
                setEmail(value);
                break;
            case "PhoneNumber1":
                setPhnNo1(value);
                break;
            case "PhoneNumber2":
                setPhnNo2(value);
                break;
            case "DateOfBirth":
                setDob(value);
                break;
            case "Photo":
                if (files && files[0] && files[0].size / 1024 <= 2048) {
                    setphotoImgAdd(URL.createObjectURL(e.target.files[0]));
                    setPhoto(files[0]);
                }
                break;
            case "Address":
                setAddress(value);
                break;
            case "DocumentNumber":
                setDocNumber(value);
                break;
            case "DocumentPhoto":
                if (files && files[0] && files[0].size / 1024 <= 2048) {
                    setDocPhotoImgAdd(URL.createObjectURL(e.target.files[0]));
                    setDocPhoto(files[0]);
                }
                break;
            case "VehicleNumber":
                setVehicleNo(value);
                break;
            case "VehicleInsuranceNumber":
                setVehicleInsNo(value);
                break;
            case "VehicleInsuranceExpiryDate":
                setVehicleInsExpDate(value);
                break;
            case "PersonalInsuranceNumber":
                setPersonalInsNo(value);
                break;
            case "DepositAmount":
                setDepositAmt(value);
                break;
            case "DepositDate":
                setDepositDate(value);
                break;
            case "DepositReceiptNo":
                setDepositReceiptNo(value);
                break;
            case "AccountNumber":
                setAccNo(value);
                break;
            case "BranchName":
                setBranchName(value);
                break;
            case "BranchAddress":
                setBranchAddress(value);
                break;
            case "Ifsc":
                setIfsc(value);
                break;
            case "UpiId":
                setUpiId(value);
                break;
            case "DateOfJoining":
                setDateOfJoining(value);
                break;
            case "UId":
                setUID(value);
                break;
            case "BasicSalary":
                setBasicSalary(value);
                break;
            case "DeliveryFeePercustomer":
                setDeliveryFeePerCustomer(value);
                break;
            case "MarginModel":
                setPercentageOfMargin(value);
                break;
            case "DailyIncentives":
                setDailyIncentives(value);
                break;
            case "OtherIncentives":
                setOtherIncentives(value);
                break;
            case "ReferredBy":
                setReferredBy(value);
                break;
            case "SpecificProductInclusion":
                setSpecificProduct(value);
                break;
            case "Comments":
                setComments(value);
                break;
        }
    }

    const addExecutive = async (e) => {
        e.preventDefault();
        if(!docPhoto || !docPhotoImgAdd) {
            setalertType("error");
            setalertMsg("Please fill Document Photo");
            handleSnakBarOpen();
            return;
        }
        if(emailAddresses.includes(email)) {
            setalertType("error");
            setalertMsg("Email already Exists");
            handleSnakBarOpen();
            return;
        }
        setLOADING(true);

        const remuneration_type = (remunerationModel === "Fixed-Pay-Model") ? 1 : (remunerationModel === "Delivery-Fee-Model") ? 2 : 3;
        const remuneration_details = {
            remuneration_type: remuneration_type,
            basic: basicSalary,
            delivery_fee: deliveryFeePerCustomer,
            percentage_margin: percentageOfMargin,
            daily_incentives: dailyIncentives,
            other_incentives: otherIncentives,
        }
        const executiveDetails = {
            name: name,
            email: email,
            phn_no1: phnNo1,
            phn_no2: phnNo2,
            dob: dob,
            country: country,
            state: state,
            district: district,
            address: address,
            doc_type: docType,
            doc_no: docNumber,
            vehicle_no: vehicleNo,
            vehicle_ins_no: vehicleInsNo,
            vehicle_ins_exp_date: vehicleInsExpDate,
            personal_ins_no: personalInsNo,
            deposit_amt: depositAmt,
            deposit_date: depositDate,
            deposit_receipt_no: depositReceiptNo,
            bank: bankNames,
            account_no: accNo,
            branch_name: branchName,
            branch_address: branchAddress,
            ifsc: ifsc,
            upi: upiId,
            city: city,
            doj: dateOfJoining,
            uid: uID,
            renumeration_model: remuneration_details,
            referred_by: referredBy,
            spcl_product_inclusion: specificProduct,
            comments: comments,
        };
        const data = JSON.stringify(executiveDetails);
        const url = `${api}/add_executive_details`;
        const addExecutive = await ADD(token, url, data);
        if (addExecutive.status === 200) {
            if (photoImgAdd || docPhotoImgAdd) {
                var imgData = [
                    { image_type: 8, image: photo },
                    { image_type: 9, image: docPhoto },
                ];
                let UploadUrl = `${api}/executive/upload_images`;
                let uploadData = {
                    imgData: imgData,
                    id: addExecutive.executiveId,
                };
                await ADDMulti(token, UploadUrl, uploadData);
            }

            setalertType("success");
            setalertMsg("New executive Added successfully");
            handleSnakBarOpen();
            setLOADING(false);
            setTimeout(() => {
                navigate("/DeliveryExecutive");
            }, 1000);
        } else {
            setalertType("error");
            setalertMsg(addExecutive.message || "Error adding executive");
            handleSnakBarOpen();
            setLOADING(false);
        }
    }

    const updateExecutive = async (e) => {
        e.preventDefault();
        if(!district) {
            setalertType("error");
            setalertMsg((!country) ? "please fill Country" : (!state) ? "please fill State" : "please fill District");
            handleSnakBarOpen();
            return;
          }
          if(!docType || !bankNames || !city || !remunerationModel) {
            setalertType("error");
            setalertMsg((!docType) ? "Please fill Document Type" : (!bankNames) ? "Please fill Bank" : (!city) ? "Please fill City" : "Please fill Remuneration Model");
            handleSnakBarOpen();
            return;
          }

        setLOADING(true);
        const remuneration_type = (remunerationModel === "Fixed-Pay-Model") ? 1 : (remunerationModel === "Delivery-Fee-Model") ? 2 : 3;
        const remuneration_details = {
            remuneration_type: remuneration_type,
            basic: basicSalary,
            delivery_fee: deliveryFeePerCustomer,
            percentage_margin: percentageOfMargin,
            daily_incentives: dailyIncentives,
            other_incentives: otherIncentives,
        }
        const executiveData = {
            id: param.id,
            name: name,
            email: email,
            phn_no1: phnNo1,
            phn_no2: phnNo2,
            dob: dob,
            country: country,
            state: state,
            district: district,
            address: address,
            doc_type: docType,
            doc_no: docNumber,
            vehicle_no: vehicleNo,
            vehicle_ins_no: vehicleInsNo,
            vehicle_ins_exp_date: vehicleInsExpDate,
            personal_ins_no: personalInsNo,
            deposit_amt: depositAmt,
            deposit_date: depositDate,
            deposit_receipt_no: depositReceiptNo,
            bank: bankNames,
            account_no: accNo,
            branch_name: branchName,
            branch_address: branchAddress,
            ifsc: ifsc,
            upi: upiId,
            city: city,
            doj: dateOfJoining,
            uid: uID,
            renumeration_model: remuneration_details,
            referred_by: referredBy,
            spcl_product_inclusion: specificProduct,
            comments: comments,
        };
        const data = JSON.stringify(executiveData);
        const url = `${api}/update_executive`;
        const updatedExecutive = await ADD(token, url, data);
          if (updatedExecutive.response === 200) {
            if (photo || docPhoto) {
              var imgData = [
                {image_type: 8, image: photo},
                {image_type: 9, image: docPhoto}
              ];
              let UploadUrl = `${api}/executive/upload_images`;
              let uploadData = {
                imgData: imgData,
                id: updatedExecutive.id,
              };
              await ADDMulti(token, UploadUrl, uploadData);
            }

            setalertType("success");
            setalertMsg("Executive Updated successfully");
            handleSnakBarOpen();
            setLOADING(false);
            setTimeout(() => {
              navigate("/DeliveryExecutive");
            }, 1000);
          } else {
            setalertType("error");
            setalertMsg(updatedExecutive.message || "Error updating Executive");
            handleSnakBarOpen();
            setLOADING(false);
          }
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
                            navigate("/DeliveryExecutive");
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>{" "}
                    <h2 className="heading"> {(param.id) ? "Update Executive Informations" : "Add Executive Informations"} </h2>
                </div>
            </Box>
            {isStateUpdated ?
                <Box component="form" onSubmit={(param.id) ? updateExecutive : addExecutive}>
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
                                mt="20px">
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="Name"
                                    label="Name"
                                    name="Name"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={name}
                                    inputProps={{ maxLength: 30 }}
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
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="PhoneNumber1"
                                    label="Phone Number 1"
                                    name="Phone Number 1"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={phnNo1}
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
                                    id="PhoneNumber2"
                                    label="Phone Number 2"
                                    name="Phone Number 2"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={phnNo2}
                                />

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="DateOfBirth"
                                    label="Date Of Birth"
                                    name="Date Of Birth"
                                    autoComplete="number"
                                    type="date"
                                    color="secondary"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={handleFormChange}
                                    value={dob}
                                    inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                />

                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="Photo"
                                    label="Photo"
                                    name="Photo"
                                    type="file"
                                    onChange={handleFormChange}
                                    inputProps={{ accept: ".png, .jpg, .jpeg" }}
                                    InputLabelProps={{ shrink: true }}
                                    color="secondary"
                                    size="small"
                                />
                                {photoImgAdd && (
                                    <img
                                        src={photoImgAdd}
                                        alt={photoImgAdd}
                                        style={{ width: "100px", height: "auto", marginTop: "20px" }}
                                    />
                                )}
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
                            <h2>Address Info</h2>
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
                                    value={(country) ? state : ""}
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
                                    value={(country && state) ? district : ""}
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
                            <h2>Documents Info</h2>
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
                                    id="DocumentType"
                                    color="secondary"
                                    options={documentOptions}
                                    value={docType}
                                    onChange={handleDocumentTypeChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Document Type"
                                            name="Document Type"
                                            size="small"
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
                                    id="DocumentNumber"
                                    label="Document Number"
                                    name="Document Number"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={docNumber}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="DocumentPhoto"
                                    label="Document Photo *"
                                    name="Document Photo"
                                    type="file"
                                    onChange={handleFormChange}
                                    inputProps={{ accept: ".png, .jpg, .jpeg" }}
                                    InputLabelProps={{ shrink: true }}
                                    color="secondary"
                                    size="small"
                                />
                                {docPhotoImgAdd && (
                                    <img
                                        src={docPhotoImgAdd}
                                        alt={docPhotoImgAdd}
                                        style={{ width: "100px", height: "auto", marginTop: "20px" }}
                                    />
                                )}
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
                            <h2>Vehicle Info</h2>
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
                                    id="VehicleNumber"
                                    label="Vehicle Number"
                                    name="Vehicle Number"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={vehicleNo}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="VehicleInsuranceNumber"
                                    label="Vehicle Insurance Number"
                                    name="Vehicle Insurance Number"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={vehicleInsNo}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="VehicleInsuranceExpiryDate"
                                    label="Vehicle Insurance Expiry Date"
                                    name="Vehicle Insurance Expiry Date"
                                    autoComplete="number"
                                    type="date"
                                    color="secondary"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={handleFormChange}
                                    value={vehicleInsExpDate}
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
                            <h2>Personal Insurance Info</h2>
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
                                    id="PersonalInsuranceNumber"
                                    label="Personal Insurance Number"
                                    name="Personal Insurance Number"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={personalInsNo}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="DepositAmount"
                                    label="Deposit Amount"
                                    name="Deposit Amount"
                                    type="number"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={depositAmt}
                                    inputProps={{ min: 0 }}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="DepositDate"
                                    label="Deposit Date"
                                    name="Deposit Date"
                                    autoComplete="number"
                                    type="date"
                                    color="secondary"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={handleFormChange}
                                    value={depositDate}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="DepositReceiptNo"
                                    label="Deposit Receipt No."
                                    name="Deposit Receipt No."
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={depositReceiptNo}
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
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    id="Bank"
                                    color="secondary"
                                    options={bankOptions}
                                    value={bankNames}
                                    onChange={handleBankNameChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Bank"
                                            name="Bank"
                                            size="small"
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
                                    id="AccountNumber"
                                    label="Account Number"
                                    name="Account Number"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={accNo}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="BranchName"
                                    label="Branch Name"
                                    name="Branch Name"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={branchName}
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
                                    id="BranchAddress"
                                    label="Branch Address"
                                    name="Branch Address"
                                    type="text"
                                    multiline
                                    minRows="3"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={branchAddress}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="Ifsc"
                                    label="IFSC"
                                    name="IFSC"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={ifsc}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="UpiId"
                                    label="Unified Payments Interface (UPI) ID"
                                    name="Unified Payments Interface (UPI) ID"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={upiId}
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
                            <h2>Others  Info</h2>
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
                                    id="City"
                                    color="secondary"
                                    options={cityOptions}
                                    value={city}
                                    onChange={handleCityNameChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="City"
                                            name="City"
                                            size="small"
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
                                    id="DateOfJoining"
                                    label="Date Of Joining"
                                    name="Date Of Joining"
                                    autoComplete="number"
                                    type="date"
                                    color="secondary"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={handleFormChange}
                                    value={dateOfJoining}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="UId"
                                    label="UID"
                                    name="UID"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={uID}
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
                                    id="RemunerationModel"
                                    color="secondary"
                                    options={remunerationModelOptions}
                                    value={remunerationModel}
                                    onChange={handleRenumerationModelChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Remuneration Model"
                                            name="Remuneration Model"
                                            size="small"
                                            fullWidth
                                            required={!param.id}
                                            color="secondary"
                                        />
                                    )}
                                />
                                {remunerationModel === "Fixed-Pay-Model" && <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="BasicSalary"
                                    label="Basic Salary"
                                    name="Basic Salary"
                                    type="number"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={basicSalary}
                                    inputProps={{ min: 0 }}
                                />}
                                {remunerationModel === "Delivery-Fee-Model" && <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="DeliveryFeePercustomer"
                                    label="Delivery Fee Per customer"
                                    name="Delivery Fee Per customer"
                                    type="number"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={deliveryFeePerCustomer}
                                />}
                                {remunerationModel === "Margin-Model" && <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="MarginModel"
                                    label="Margin Model"
                                    name="Margin Model"
                                    type="number"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={percentageOfMargin}
                                />}
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="DailyIncentives"
                                    label="Daily Incentives"
                                    name="Daily Incentives"
                                    type="number"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={dailyIncentives}
                                    inputProps={{ min: 0 }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="OtherIncentives"
                                    label="Other Incentives"
                                    name="Other Incentives"
                                    type="number"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={otherIncentives}
                                    inputProps={{ min: 0 }}
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
                                    id="ReferredBy"
                                    label="Referred By"
                                    name="Referred By"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={referredBy}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="SpecificProductInclusion"
                                    label="Specific Product Inclusion"
                                    name="Specific Product Inclusion"
                                    type="text"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={specificProduct}
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
                                    id="Comments"
                                    label="Comments"
                                    name="Comments"
                                    type="text"
                                    multiline
                                    minRows="3"
                                    color="secondary"
                                    onChange={handleFormChange}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={comments}
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
                            {LOADING ? <CircularProgress size={20} /> : param.id ? "Update Executive" : "Add New Executive"}
                        </Button>
                    </div>
                </Box>
                :
                (
                    <LoadingSkeleton rows={6} height={30} />
                )}
        </>
    );
}

export default DriverDetails;