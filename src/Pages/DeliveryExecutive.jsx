import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { ADD, GET, UPDATE } from "../Functions/apiFunction";
import api from "../Data/api";
import { tokens } from "../theme";
import image from "../Data/image";
import KeyIcon from "@mui/icons-material/VpnKey";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import logo from "../assets/a_logo.png"
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90vw", sm: 500, md: 500, lg: 500, xl: 500 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 2,
};

function DeliveryExecutive() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isLoading, setisLoading] = useState(false);
  const [users, setusers] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [reFetch, setreFetch] = useState(false);
  const [open, setOpen] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [isAddModel, setisAddModel] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [userID, setuserID] = useState();
  const [role_id, setrole_id] = useState();
  const [id_role, setid_role] = useState();
  const [executive_details, setExecutive_Details] = useState();
  const [allExecutive_details, setAllExecutive_Details] = useState();
  const [isUpdating, setUpdaing] = useState(true);

  // userDetails

  const [name, setname] = useState();
  const [email, setemail] = useState();
  const [number, setnumber] = useState();
  const [password, setPassword] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCloseModel = () => {
    setOpenModel(false);
    setPassword("");
  };
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

  const handleDialogOpen = (currRow) => { setSelectedRow(currRow); setDialogOpen(true); };
  const handleDialogClose = () => {setSelectedRow({}) ;setDialogOpen(false);}

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    getExecutiveDetails();
  }, [reFetch, token]);

  const getExecutiveDetails = async () => {
    try {
      const url = `${api}/get_executive_details`;
      const executive = await GET(token, url);
      setExecutive_Details(executive.data);
      setAllExecutive_Details(executive.data);
    } catch (error) {
      console.error("Error fetching executive details:", error);
    }
  };

  // useEffect(() => {
  //   // Get categoriues
  //   const getCat = async () => {
  //     const url = `${api}/get_user/role/4`;
  //     const users = await GET(token, url);
  //     console.log(users.data);
  //     setusers(users.data);
  //     setMainUsers(users.data);
  //   };
  //   getCat();
  // }, [reFetch, token]);

  // Add User
  const addUser = async (e) => {
    e.preventDefault();
    const data = {
      phone: number,
      name: name,
      email: email,
      role: 4,
    };
    const url = `${api}/add_user`;
    setisLoading(true);
    const user = await ADD(token, url, data);
    setisLoading(false);
    if (user.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg(`New  Driver Added successfully`);
      setreFetch(!reFetch);
      handleClose();
    } else if (user.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(user.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  // assign user
  const assignUser = async (e) => {
    e.preventDefault();
    const data = {
      user_id: userID,
      role_id: 4,
    };
    const url = `${api}/add_assign_user`;
    setisLoading(true);
    const user = await ADD(token, url, data);
    setisLoading(false);
    if (user.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("User Assigned As Delivery Boy");
      setreFetch(!reFetch);
      handleClose();
    } else if (user.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(user.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };
  // assign user
  const deAssignUser = async (e) => {
    e.preventDefault();
    const data = {
      id: id_role,
    };
    const url = `${api}/delete_assign_user`;
    setisLoading(true);
    const user = await ADD(token, url, data);
    setisLoading(false);
    if (user.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("User Dessigned As Delivery Boy");
      setreFetch(!reFetch);
      handleClose();
    } else if (user.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(user.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };
  const onChangeExecutiveStatus = async () => {
    const url = `${api}/change_executive_status/${selectedRow.id}`;
    setDialogOpen(false);
    setUpdaing(false);
    try {
      const executiveStatus = await GET(token, url);
      if (executiveStatus.response === 200) {
        getExecutiveDetails();
        setalertType("success");
        setalertMsg(executiveStatus.message ?? "Executive Details updated successfully");
        handleSnakBarOpen();
      } else {
        setalertType("error");
        setalertMsg(executiveStatus.message || "Error updating Executive status");
        handleSnakBarOpen();
      }
    } catch (error) {
      setalertType("error");
      setalertMsg("An unexpected error occurred. Please try again.");
      handleSnakBarOpen();
      console.error("Error updating executive status:", error);
    } finally {
      setUpdaing(true);
    }
  };

  // update User
  const updateUser = async (e) => {
    e.preventDefault();
    const data = {
      phone: number,
      name: name,
      email: email,
      id: userID,
    };
    console.log(data);
    const url = `${api}/update_user`;
    setisLoading(true);
    const update = await UPDATE(token, url, data);
    setisLoading(false);
    if (update.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("User Details Updated successfully");
      setreFetch(!reFetch);
      handleClose();
    } else if (update.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(update.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = async (id) => {
    const newPassword = generateRandomPassword();
    if (newPassword) {
      try {
        const url = `${api}/store_generated_pswd/${id}`;
        const response = await ADD(token, url, JSON.stringify({ newPassword }));
        if (response.status) {
          setalertType("success");
          setalertMsg("Password generated successfully");
          handleSnakBarOpen();
        } else {
          setalertType("error");
          setalertMsg("Failed to generate password");
          handleSnakBarOpen();
        }
      } catch (error) {
        console.error("Error fetching executive details:", error);
      }
    }
  };

  const handleCopyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      setalertType("success");
      setalertMsg("Password copied to clipboard");
      handleSnakBarOpen();
    } catch (error) {
      console.error(error);
      setalertType("error");
      setalertMsg("Failed to copy password");
      handleSnakBarOpen();
    }
  };

  const handleViewPassword = async (e, id) => {
    e.preventDefault();
    try {
      const url = `${api}/get_password/${id}`;
      const response = await GET(token, url);
      if (response.status === 200) {
        if (response.password) {
          setPassword(response.password);
          setOpenModel(true);
        } else {
          setPassword("");
          setalertType("error");
          setalertMsg("Password not generated");
          handleSnakBarOpen();
        }
      } else {
        console.error("Failed to fetch password:", response.message);
      }
    } catch (error) {
      console.error("Error fetching password:", error);
      alert("An error occurred while fetching the password.");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Delivery Executives";
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
        pageWidth - logoWidth - 15,
        10,
        logoWidth,
        logoHeight
      );

      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "Executive ID", dataKey: "id" },
        { header: "Executive Name", dataKey: "name" },
        { header: "Contact Info", dataKey: "contact" },
        { header: "Address", dataKey: "address" },
        { header: "City", dataKey: "city" },
        { header: "Vehicle Info", dataKey: "vehicle" },
        { header: "Status", dataKey: "status" },
      ];

      const reversedExecutives = [...allExecutive_details].reverse();

      const tableRows = reversedExecutives.map((row, index) => ({
        sno: index + 1,
        id: row.executive_id,
        name: row.name,
        email: `${row.email}\n${row.phn_no1}${row.phn_no2 != null ? " / " + row.phn_no2 : ""}`,
        address: row.address,
        city: row.city,
        vehicle:  row.vehicle_no+"\n"+ row.vehicle_ins_no+" , "+row.vehicle_ins_exp_date,
        status: row.is_active === "true" ? "Active" : "In Active" 
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.sno,
          row.id,
          row.name,
          row.email,
          row.address,
          row.city,
          row.vehicle,
          row.status
        ]),
        startY: tableStartY,
        margin: { left: 20 },
        styles: {
          fontSize: 10, // Adjust font size for table content 
        },
        columnStyles: {
          0: { cellWidth: 15 }, //S.no
          1: { cellWidth: 35 }, //ID #
          2: { cellWidth: 30 }, //Name
          3: { cellWidth: 40 }, //Email
          4: { cellWidth: 40 }, //Address
          5: { cellWidth: 35 }, //City
          6: { cellWidth: 45 }, //Vehicle
          7: { cellWidth: 20 }, //Status
        },
        headStyles: {
          fillColor: [0, 162, 51],  // Orange background
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

      doc.save(`Delivery_Executives_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.pdf`);
    });
  };

  const exportToCSV = () => {
      const headers = ["S.No", "Executive ID" ,"Executive Name", "Contact Info", "Address", "City", "Vehicle Info", "Status"];
  
      const reversedExecutives = [...allExecutive_details].reverse();
  
      const csvData = reversedExecutives.map((row, index) => [
        index + 1, 
        row.executive_id,
        row.name,
        `${row.email}\n${row.phn_no1}${row.phn_no2 != null ? " / " + row.phn_no2 : ""}`,
        row.address,
        row.city,
        row.vehicle_no+"\n"+ row.vehicle_ins_no+" , "+row.vehicle_ins_exp_date,
        row.is_active === "true" ? "Active" : "In Active" 
      ]);
  
      const tempData = [headers, ...csvData];
  
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(tempData);
  
      XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Executives Reports");
  
      const fileName = `Delivery_Executives_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.csv`;
      XLSX.writeFile(workbook, fileName);
    };

  const column = useMemo(
    () => [
      { field: "executive_id", headerName: "Executive ID", width: 180 },
      { field: "name", headerName: "Executive Name", width: 180 },
      // {
      //   field: "image",
      //   headerName: "Photo",
      //   width: 120,
      //   height: 100,
      //   renderCell: (params) =>
      //     params.row.image != null ? (
      //       <div
      //         style={{
      //           display: "flex",
      //           justifyContent: "center",
      //           width: "100%",
      //         }}
      //       >
      //         <img
      //           src={`${image}/${params.row.image}`}
      //           alt={params.row.image}
      //           height={"45px"}
      //         />
      //       </div>
      //     ) : (
      //       <i class="fa-solid fa-user-tie" style={{ fontSize: "22px" }}></i>
      //     ),
      // },
      {
        field: "email",
        headerName: "Contact Info",
        width: 210,
        renderCell: (params) => (
          <>
            {params.row.email} <br />
            {params.row.phn_no1} / {params.row.phn_no2 != null ? params.row.phn_no2 : ""}
          </>
        ),
      },
      { field: "address", headerName: "Address", width: 300 },
      { field: "city", headerName: "City", width: 250 },
      {
        field: "vehicle_no",
        headerName: "Vehicle Info",
        width: 210,
        renderCell: (params) => (
          <>
            {params.row.vehicle_no} <br />
            {params.row.vehicle_ins_no} , {params.row.vehicle_ins_exp_date}
          </>
        ),
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
          <button
            className={params.row.is_active === "true" ? "updateBtn" : "dltBtn"}
            onClick={() => {
              handleDialogOpen({id:params.row.id , is_Active : params.row.is_active});
            }}
          >
            {params.row.is_active === "true" ? "Active" : "In Active"}
          </button>
        ),
      },
      {
        field: "Action",
        headerName: "Edit",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(`/DriverDetails/${params.row.id}`);
            }}
          >
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
        ),
      },
      {
        field: "password",
        headerName: "Generate Password",
        width: 130,
        renderCell: (params) => (
          <div>
            <Tooltip title="Generate Password">
              <IconButton 
                color="primary"
                onClick={() => handleGeneratePassword(params.row.id)}
              >
                <KeyIcon sx={{fontSize: "18px"}}/>
              </IconButton>
            </Tooltip>

            <Tooltip title="View Password">
              <IconButton 
                color="primary"
                onClick={(event) => handleViewPassword(event, params.row.id)}
              >
                <VisibilityIcon sx={{fontSize: "18px"}}/>
              </IconButton>
            </Tooltip>
          </div>
        ),
      },
    ],
    []
  );

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
        style={{ marginBottom: "1rem" }}
      >
        <div style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center"
                }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={exportToCSV}
                        disabled={allExecutive_details.length === 0}
                    > 
                      Export to CSV
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={exportToPDF}
                        disabled={allExecutive_details.length === 0}
                    >
                      Export to PDF
                    </Button>
                </div> 

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            setname("");
            setemail("");
            setnumber("");
            setisAddModel(true);
            navigate("/DriverDetails");
          }}
        >
          {" "}
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
            Manage Executives
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"40%"}
          >
            <TextField
              size="small"
              sx={{ width: { xs: "80%", sm: "300px", md: "500px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              onChange={(e) => {
                e.preventDefault();
                setTimeout(() => {
                  function searchArrayByValue(arr, searchQuery) {
                    return arr.filter((obj) => {
                      return Object.entries(obj).some(([key, val]) => {
                        if (
                          key !== "id" &&
                          key !== "image" &&
                          key !== "updated_at" &&
                          typeof val === "string"
                        ) {
                          return val
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        }
                        return false;
                      });
                    });
                  }
                  setExecutive_Details(
                    searchArrayByValue(
                      allExecutive_details,
                      e.target?.value?.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {executive_details && isUpdating ? (
          <Box
            className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 ${theme.palette.mode === "dark" ? "bg-darkcard" : "bg-card"
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
              rows={executive_details}
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
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {isAddModel ? "Add New Driver" : "Update User Details"}
          </Typography>
          {isAddModel ? (
            <Box component="form" sx={{ mt: 1 }} onSubmit={addUser}>
              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="Name"
                label="Name"
                name="Name"
                autoComplete="text"
                autoFocus
                value={name}
                size="small"
                onChange={(e) => {
                  setname(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                color="secondary"
                required={number ? false : true}
                fullWidth
                id="Email"
                label="Email"
                name="Email"
                autoComplete="email"
                type="email"
                autoFocus
                value={email}
                size="small"
                onChange={(e) => {
                  setemail(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                color="secondary"
                required={email ? false : true}
                fullWidth
                id="Number"
                label="Number"
                name="Number"
                autoComplete="Number"
                type="tel"
                inputProps={{
                  inputMode: "tel",
                  pattern: "[0-9]*",
                  maxlength: "12",
                }}
                autoFocus
                value={number}
                size="small"
                onChange={(e) => {
                  setnumber(e.target.value);
                }}
              />

              <input
                type="file"
                name="image"
                id="image"
                className="imageInput"
                accept="image/*"
                disabled
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, fontWeight: "700" }}
                color="secondary"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress /> : "Add New Driver"}
              </Button>
            </Box>
          ) : (
            <>
              {" "}
              <Box component="form" sx={{ mt: 1 }} onSubmit={updateUser}>
                <TextField
                  margin="normal"
                  color="secondary"
                  required
                  fullWidth
                  id="Title"
                  label="Title"
                  name="Title"
                  autoComplete="text"
                  autoFocus
                  value={name}
                  size="small"
                  onChange={(e) => {
                    setname(e.target.value);
                  }}
                />
                <TextField
                  margin="normal"
                  color="secondary"
                  required={number ? false : true}
                  fullWidth
                  id="Email"
                  label="Email"
                  name="Email"
                  autoComplete="email"
                  type="email"
                  autoFocus
                  value={email}
                  size="small"
                  onChange={(e) => {
                    setemail(e.target.value);
                  }}
                />
                <TextField
                  margin="normal"
                  color="secondary"
                  required={email ? false : true}
                  fullWidth
                  id="Number"
                  label="Number"
                  name="Number"
                  autoComplete="Number"
                  type="tel"
                  inputProps={{
                    inputMode: "tel",
                    pattern: "[0-9]*",
                    maxlength: "12",
                  }}
                  value={number}
                  size="small"
                  onChange={(e) => {
                    setnumber(e.target.value);
                  }}
                />
                <input
                  type="file"
                  name="image"
                  id="image"
                  className="imageInput"
                  accept="image/*"
                  disabled
                />

                {role_id === 1 || role_id === 2 ? (
                  ""
                ) : role_id === 4 ? (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, fontWeight: "700" }}
                    color="primary"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      deAssignUser(e);
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress />
                    ) : (
                      "De-assign As Delivery Boy"
                    )}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, fontWeight: "700" }}
                    color="primary"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      assignUser(e);
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress />
                    ) : (
                      "Assign As Delivery Boy"
                    )}
                  </Button>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, fontWeight: "700" }}
                  color="secondary"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress /> : "Update"}
                </Button>
                {/* <Button
                  onClick={addUser}
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, fontWeight: "700" }}
                  color="error"
                  disabled
                >
                  {isLoading ? <CircularProgress /> : "Delete"}
                </Button> */}
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <Dialog open={openModel} onClose={handleCloseModel}>
        <DialogTitle>Password</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {password}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopyPassword(password)}
          >
            Copy Password
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModel} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {(selectedRow.is_Active) === "true" ? "deactivate" : "activate"} this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" variant="contained">
            Cancel
          </Button>
          <Button onClick={onChangeExecutiveStatus} color="secondary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeliveryExecutive;
