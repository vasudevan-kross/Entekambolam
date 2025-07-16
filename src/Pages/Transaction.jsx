import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Select,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  Divider,
  Button,
  Modal,
  Backdrop,
  CircularProgress,
  Autocomplete,
  Switch,
  Snackbar,
  Alert,
  Tooltip,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";
import Box from "@mui/material/Box";

import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { ADD, GET } from "../Functions/apiFunction";
import api from "../Data/api";
// import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { DateRangePicker } from "react-date-range";
import { addDays } from "date-fns";
import styled from "@emotion/styled";
import * as CONSTANTS from "../Common/Constants";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import logo from "../assets/a_logo.png";
import LoadingSkeleton from "../Components/LoadingSkeleton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90vw",
    sm: "80vw",
    md: "60vw",
    lg: "600px",
    xl: "600px",
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 2,
  textAlign: "center",
};

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#177ddc" : "#1890ff",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

function Transaction() {
  // const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [txns, settxns] = useState();
  const [mainproducts, setMainproducts] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [reFetch, setreFetch] = useState(false);
  const [startDate, setstartDate] = useState(
    moment(addDays(new Date(), -7)).format("DD-MM-YYYY")
  );
  const [backdropOpen, setbackdropOpen] = useState(false);
  const [endDate, setendDate] = useState(
    moment(new Date()).format("DD-MM-YYYY")
  );
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [isDateRange, setisDateRange] = useState(false);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: addDays(new Date(), -7),
      key: "selection",
    },
  ]);

  const [isAddNewModal, setisAddNewModal] = useState(false);
  const [users, setusers] = useState();

  const [selectedUser, setselectedUser] = useState();
  const [TransectionId, setTransectionId] = useState();
  const [Amount, setAmount] = useState();
  const [trasectionType, settrasectionType] = useState(2);
  const [description, setdescription] = useState();
  const [isUpdating, setisUpdating] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const url = `${api}/txn/by_date_range/${startDate}/${endDate}`;
      const products = await GET(token, url);
      setMainproducts(products.data);
      if (searchValue.trim() !== "") {
        const result = searchArrayByValue(products.data, searchValue);
        settxns(result);
      } else {
        settxns(products.data);
      }
    };

    const getUsers = async () => {
      const url = `${api}/get_user`;
      const users = await GET(token, url);
      setusers(users.data);
    };
    getCat();
    getUsers();
  }, [token, reFetch]);

  const filter = async (url) => {
    handleBackDropOpen();
    const products = await GET(token, url);
    if (searchValue.trim() !== "") {
      const result = searchArrayByValue(products.data, searchValue);
      settxns(result);
    } else {
      settxns(products.data);
    }
    handleBackDropClose();
    setMainproducts(products.data);
  };

  const addNewTransection = async (e) => {
    e.preventDefault();
    if (
      parseInt(trasectionType) === 2 &&
      parseFloat(Amount) > selectedUser.wallet_amount
    ) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("User Do not Have Enough Balence in Wallet");
      return;
    } else {
      setisUpdating(true);
      let data = {
        user_id: selectedUser.id,
        payment_id: TransectionId,
        amount: parseFloat(Amount),
        description: description,
        type: parseInt(trasectionType),
        source_type: 1,
      };
      const url = `${api}/add_txn`;
      const addTransection = await ADD(token, url, data);
      setisUpdating(false);
      if (addTransection.response === 200) {
        handleSnakBarOpen();
        setreFetch(!reFetch);
        setalertType("success");
        setalertMsg("Success");
        handleClose();
      } else if (addTransection.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(addTransection.message);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(addTransection.message);
      }
    }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;

    // Allow empty input
    if (value === "") {
      setAmount(value);
      return;
    }
    // Allow only numbers with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const column = useMemo(
    () => [
      {
        field: "payment_id",
        headerName: "Payment Id",
        width: 180,
        renderCell: (params) => params.value || "N/A",
      },
      {
        field: "amount",
        headerName: "Amount",
        width: 120,
        renderCell: (params) => params.value?.toFixed(2) || "N/A",
      },
      {
        field: "name",
        headerName: "Name",
        width: 180,
        renderCell: (params) => params.value || "N/A",
      },
      {
        field: "phone",
        headerName: "Phone Number",
        width: 180,
        renderCell: (params) => params.value || "N/A",
      },
      {
        field: "order_number",
        headerName: "Order Id",
        width: 150,
        renderCell: (params) => params.value || "N/A",
      },
      {
        field: "description",
        headerName: "Description",
        width: 200,
        renderCell: (params) => (
          <Tooltip title={params.value || "N/A"}>
            <span
              style={{
                whiteSpace: "normal",
                overflowWrap: "break-word",
                display: "block",
                maxHeight: "4.5em", // Adjust as needed
                overflow: "hidden",
              }}
            >
              {params.value || "--"}
            </span>
          </Tooltip>
        ),
      },
      {
        field: "type",
        headerName: "Type",
        width: 100,
        renderCell: (params) => {
          const type = params.row.type;

          const typeMap = {
            1: { label: "Credit", color: "green" },
            2: { label: "Debit", color: "red" },
            3: { label: "Refund", color: "green" },
            4: { label: "Referral", color: "blue" },
          };

          const { label, color } = typeMap[type] || {
            label: "",
            color: "black",
          };

          return <p style={{ color }}>{label}</p>;
        },
      },
      // {
      //   field: "source_type",
      //   headerName: "Source Type",
      //   width: 100,
      //   renderCell: (params) =>
      //     params.value === 1 ? "Wallet" : "Online" || "N/A",
      // },
      {
        field: "previous_balance",
        headerName: "Previous Balance",
        width: 100,
        renderCell: (params) =>
          (params.value && parseFloat(params.value)?.toFixed(2)) || "N/A",
      },
      {
        field: "updated_at",
        headerName: "Last Update",
        width: 220,
        renderCell: (params) =>
          moment
            .utc(params.row.updated_at)
            .local()
            .format("DD-MM-YYYY HH:mm:ss"),
      },
      // {
      //   field: "Action",
      //   headerName: "Action",
      //   width: 100,
      //   renderCell: (params) => (
      //     <button
      //       class="updateBtn"
      //       onClick={() => {
      //         //navigate(`/product/${params.row.id}`);
      //       }}
      //     >
      //       <i class="fa-regular fa-eye"></i>
      //     </button>
      //   ),
      // },
    ],
    []
  );

  const exportToCSV = () => {
    const headers = [
      "S.No",
      "Payment Id",
      "Amount",
      "Name",
      "Phone Number",
      "Order Id",
      "Description",
      "Type",
      "Previous Balance",
      "Last Update",
    ];

    const reversedTxns = [...txns].reverse();

    const csvData = reversedTxns.map((row, index) => [
      index + 1,
      row.payment_id,
      row.amount?.toFixed(2) || "0.00",
      row.name,
      row.phone,
      row.order_number || "--",
      row.description,
      row.type === 1
        ? "Credit"
        : row.type === 2
        ? "Debit"
        : row.type === 3
        ? "Refund"
        : row.type === 4
        ? "Referral"
        : "N/A",
      (row.previous_balance && parseFloat(row.previous_balance)?.toFixed(2)) ||
        "0.00",
      moment(row.updated_at).format("DD-MM-YYYY HH:mm:ss"),
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions Reports");

    const fileName = `Transactions_Report_${moment
      .utc(new Date())
      .local()
      .format("DD-MM-YYYY")}.csv`;

    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Transactions Report";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerX, 20);

    Utils.getBase64FromImage(logo, (base64Logo) => {
      const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
      const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(
        base64Logo,
        "PNG",
        pageWidth - logoWidth - 20,
        10,
        logoWidth,
        logoHeight
      );

      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "Payment Id", dataKey: "payment_id" },
        { header: "Amount", dataKey: "amount" },
        { header: "Name", dataKey: "name" },
        { header: "Phone Number", dataKey: "phone" },
        { header: "Order Id", dataKey: "order_number" },
        { header: "Description", dataKey: "description" },
        { header: "Type", dataKey: "type" },
        { header: "Previous Balance", dataKey: "previous_balance" },
        { header: "Last Update", dataKey: "updated_at" },
      ];

      const reversedTxns = [...txns].reverse();

      const tableRows = reversedTxns.map((row, index) => ({
        sno: index + 1,
        payment_id: row.payment_id,
        amount: row.amount?.toFixed(2) || "0.00",
        name: row.name,
        phone: row.phone,
        order_number: row.order_number || "--",
        description: row.description,
        type:
          row.type === 1
            ? "Credit"
            : row.type === 2
            ? "Debit"
            : row.type === 3
            ? "Refund"
            : row.type === 4
            ? "Referral"
            : "N/A",
        previous_balance:
          (row.previous_balance &&
            parseFloat(row.previous_balance)?.toFixed(2)) ||
          "0.00",
        updated_at: moment(row.updated_at).format("DD-MM-YYYY HH:mm:ss"),
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => Object.keys(row).map((key) => row[key])),
        startY: tableStartY,
        margin: { left: 20 },
        headStyles: {
          fillColor: [0, 162, 51], // green background
          textColor: [255, 255, 255], // White text
          fontSize: 10,
          halign: "center",
          valign: "middle", // Vertically aligns text in the center
          overflow: "linebreak", // Enables word wrapping
        },
        bodyStyles: {
          fontSize: 9,
          font: "meera-regular-unicode-font-normal",
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          overflow: "linebreak", // Applies word wrapping globally
        },
        columnStyles: {},
        showHead: "firstPage",
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`;
        const marginRight = 15;

        doc.setFontSize(9);
        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - 10
        );
      }

      doc.save(
        `Transactions_Report_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  function searchArrayByValue(arr, searchQuery) {
    return arr
      .map((obj) => ({
        ...obj,
        updated_at_temp: moment
          .utc(obj.updated_at)
          .local()
          .format("DD-MM-YYYY HH:mm:ss"),
        type_temp:
          obj.type === 1
            ? CONSTANTS.PAYMENT_TYPES.CREDIT
            : obj.type === 2
            ? CONSTANTS.PAYMENT_TYPES.DEBIT
            : obj.type === 3
            ? CONSTANTS.PAYMENT_TYPES.REFUND
            : obj.type === 4
            ? CONSTANTS.PAYMENT_TYPES.REFERRAL
            : "",
      }))
      .filter((obj) => {
        return Object.values(obj).some((val) => {
          if (typeof val === "string") {
            return val.toLowerCase().includes(searchQuery.toLowerCase());
          }
          if (typeof val === "number") {
            return val.toString().includes(searchQuery);
          }
          return false;
        });
      })
      .map((obj) => {
        const { updated_at_temp, type_temp, ...rest } = obj;
        return { ...rest };
      });
  }

  const handleSearchChange = (e) => {
    e.preventDefault();
    const query = e.target.value;
    setSearchValue(query);
    setTimeout(() => {
      const filtered = searchArrayByValue(mainproducts, query);
      settxns(filtered);
    }, 500);
  };

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ marginBottom: "1rem" }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            disabled={txns.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={txns.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            setisAddNewModal(true);
            setTransectionId();
            handleOpen();
            setAmount();
          }}
        >
          Add New
          <div class="icon">
            <i class="fa-regular fa-plus"></i>
          </div>
        </button>
      </GridToolbarContainer>
    );
  }
  return (
    <div style={{ height: "100%" }}>
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
      <Box sx={{ height: " 100%", width: "100%" }}>
        <Box className="flex items-center flex-wrap justify-between gap-4 w-100 title-menu">
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
            Transactions
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            gap={"1rem"}
            width={"55%"}
          >
            <TextField
              size="small"
              sx={{
                width: { xs: "40%", sm: "300px", md: "300px" },
              }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              id="outlined-basic"
              label="Select Date Range"
              variant="outlined"
              autoComplete="off"
              size="small"
              color="secondary"
              onKeyDown={() => {
                return false;
              }}
              onClick={() => {
                handleOpen();
                setisAddNewModal(false);
              }}
              value={
                startDate && endDate ? `${startDate} - ${endDate}` : "" // Only display value if both dates are set
              }
            />
            <Button
              variant="contained"
              sx={{
                fontWeight: "700",
                color: "fff",
              }}
              color="secondary"
              disabled={!isDateRange}
              onClick={() => {
                let url = `${api}/txn/by_date_range/${startDate}/${endDate}`;
                filter(url);
              }}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              sx={{ fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={() => {
                setisDateRange(false);
                setstartDate(
                  moment(addDays(new Date(), -7)).format("DD-MM-YYYY")
                );
                setendDate(moment(new Date()).format("DD-MM-YYYY"));
                //  setSearchValue("");
                setdateRange([
                  {
                    endDate: new Date(),
                    startDate: addDays(new Date(), -7),
                    key: "selection",
                  },
                ]);
                setreFetch(!reFetch);
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
        {txns ? (
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
              rows={txns}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              localeText={{
                noRowsLabel: "No records found",
              }}
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {isAddNewModal ? (
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h3" component="h2">
              Add New Transaction
            </Typography>

            <Box
              component="form"
              onSubmit={addNewTransection}
              sx={{ mt: 4 }}
              className="popupMulti-popper"
            >
              <Autocomplete
                disablePortal
                sx={{ width: "100%" }}
                id="combo-box-demo"
                color="secondary"
                clearIcon
                options={users ? users : []}
                getOptionLabel={(option) =>
                  `${option?.id} , ${option?.name} ( ${
                    option.phone ? option?.phone : ""
                  }  ${option.email ? option?.email : ""})`
                }
                onChange={(e, data) => {
                  setselectedUser(data);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    Autocomplete={false}
                    label="Select User"
                    size="small"
                    fullWidth
                    required
                    color="secondary"
                  />
                )}
              />
              <Box display={"flex"} gap={"30px"} mt={1}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="Payment Id"
                  label="Payment Id"
                  name="Payment Id"
                  autoComplete="text"
                  // autoFocus
                  size="small"
                  color="secondary"
                  onChange={(e) => {
                    setTransectionId(e.target.value);
                  }}
                />{" "}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Amount"
                  label="Amount"
                  name="Amount"
                  autoComplete="number"
                  type="text"
                  inputMode="number"
                  inputProps={{
                    max: 5000,
                    min: 1,
                    pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
                  }}
                  // autoFocus
                  size="small"
                  color="secondary"
                  value={Amount}
                  onChange={(e) => {
                    handleAmountChange(e);
                  }}
                />
              </Box>

              <Box mt={1} ml={1}>
                <Typography textAlign={"left"} fontSize={"20px"}>
                  Transaction Type *
                </Typography>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  value={trasectionType}
                  onChange={(event) => {
                    settrasectionType(event.target.value);
                  }}
                  name="radio-buttons-group"
                  column
                >
                  <FormControlLabel
                    value={1}
                    control={<Radio color="success" />}
                    label="Credit"
                  />
                  <FormControlLabel
                    value={2}
                    control={<Radio color="success" />}
                    label="Debit"
                  />
                </RadioGroup>
              </Box>

              <TextField
                sx={{ mt: 3 }}
                margin="normal"
                required
                fullWidth
                id="Description"
                label="Description"
                name="Description"
                autoComplete="text"
                // autoFocus
                size="small"
                color="secondary"
                onChange={(e) => {
                  setdescription(e.target.value);
                }}
              />

              <button className="AddBtn" type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <CircularProgress color="inherit" />
                ) : (
                  "Add New Transaction"
                )}
              </button>
            </Box>
          </Box>
        ) : (
          <Box sx={style}>
            {/* Date range Picker */}
            <DateRangePicker
              onChange={(item) => {
                setisDateRange(true);
                setstartDate(
                  moment(item.selection.startDate).format("DD-MM-YYYY")
                );
                setendDate(moment(item.selection.endDate).format("DD-MM-YYYY"));
                setdateRange([item.selection]);
              }}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={1}
              ranges={dateRange}
              direction="vertical"
              scroll={{ enabled: true }}
            />
            <Box mt={5}>
              {" "}
              <Button
                fullWidth
                variant="contained"
                sx={{ height: "30px", fontWeight: "700", color: "fff" }}
                color="primary"
                onClick={() => {
                  if (!startDate) {
                    setisDateRange(true);
                    setstartDate(
                      moment(dateRange[0].startDate).format("DD-MM-YYYY")
                    );
                    setendDate(
                      moment(dateRange[0].endDate).format("DD-MM-YYYY")
                    );
                  }
                  handleClose();
                }}
              >
                Set
              </Button>
              {/* Clear Button */}
              {/* <Button
                fullWidth
                variant="outlined"
                sx={{ height: "30px", fontWeight: "700", color: "#333" }}
                onClick={() => {
                  setisDateRange(false);
                  setstartDate(null);
                  setendDate(null);
                  setdateRange([
                    {
                      startDate: new Date(),
                      endDate: new Date(),
                      key: "selection",
                    },
                  ]);
                  setreFetch(!reFetch);
                  handleClose();
                }}
              >
                Clear
              </Button> */}
            </Box>
          </Box>
        )}
      </Modal>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 5 }}
        open={backdropOpen}
        onClick={handleBackDropClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default Transaction;
