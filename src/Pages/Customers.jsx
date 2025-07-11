import React, { useCallback, useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Modal,
  Snackbar,
  TextField,
  Typography,
  useTheme,
  Autocomplete,
  FormControl,
  FormHelperText,
} from "@mui/material";
import Box from "@mui/material/Box";

import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { ADD, GET, UPDATE } from "../Functions/apiFunction";
import api from "../Data/api";
import { tokens } from "../theme";
import AddressListModal from "../Components/AddressListModal";
import { useSelector } from "react-redux";
import { ROLES } from "../Common/Constants";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import logo from "../assets/a_logo.png";
import Utils from "../Global/utils";
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

function Customers() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const appSetting = useSelector((state) => {
    return state.AppSettings[state.AppSettings.length - 1];
  });
  const [isLoading, setisLoading] = useState(false);
  const [users, setusers] = useState();
  const [MainUsers, setMainUsers] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [reFetch, setreFetch] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAddModel, setisAddModel] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [userID, setuserID] = useState();
  const [role_id, setrole_id] = useState();
  const [id_role, setid_role] = useState();
  const [hasDeliveryPartner, setHasDeliveryPartner] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isUsersLoading, setisUsersLoading] = useState(false);

  // userDetails

  const [name, setname] = useState();
  const [email, setemail] = useState();
  const [number, setnumber] = useState();
  const [walletAmt, setwalletAmt] = useState();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const [addressList, setAddressList] = useState([]);
  const [openAddressModal, setIsOpenAddressModal] = useState(false);
  const [error, setError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [nameErrorText, setNameErrorText] = useState("");
  const [numberError, setNumberError] = useState(false);
  const [numberErrorText, setNumberErrorText] = useState("");

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const getAddress = useCallback(
    async (userID) => {
      const url = `${api}/address/user/${userID}`;
      const add = await GET(token, url);
      if (add.response === 200) {
        setAddressList(add.data);
      } else if (add.response === 201) {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg(add.message);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }
    },
    [token]
  );

  const handleModalOpen = useCallback(
    async (userId) => {
      await getAddress(userId);
      setIsOpenAddressModal(true);
    },
    [getAddress]
  );

  function handleModalClose() {
    setIsOpenAddressModal(false);
  }

  useEffect(() => {
    const hasDelivery =
      appSetting &&
      appSetting?.find((setting) => setting.title === "HasDeliveryPartner")
        ?.value === "true";
    setHasDeliveryPartner(hasDelivery);

    const getCat = async () => {
      try {
        setisUsersLoading(true);
        const url = `${api}/get_customers`;
        const users = await GET(token, url);
        setMainUsers(users.data);

        let filteredData = users.data.all || [];

        switch (filterType) {
          case "active":
            filteredData = users.data.active || [];
            break;
          case "inactive":
            filteredData = users.data.inactive || [];
            break;
          case "all":
          default:
            filteredData = users.data.all || [];
            break;
        }

        // Apply search after filtering
        if (searchText.trim() !== "") {
          filteredData = filteredData
            .map((obj) => {
              const originalUpdatedAt = obj.updated_at;
              return {
                ...obj,
                updated_at_temp: moment
                  .utc(obj.updated_at)
                  .local()
                  .format("DD-MM-YYYY HH:mm:ss"),
                originalUpdatedAt,
              };
            })
            .filter((obj) => {
              return Object.values(obj).some((val) => {
                if (typeof val === "string") {
                  return val.toLowerCase().includes(searchText.toLowerCase());
                }
                if (typeof val === "number") {
                  return val.toString().includes(searchText);
                }
                return false;
              });
            })
            .map((obj) => {
              const { originalUpdatedAt, updated_at_temp, ...rest } = obj;
              return {
                ...rest,
                updated_at: originalUpdatedAt,
              };
            });
        }

        setusers(filteredData);
      } catch (err) {
      } finally {
        setisUsersLoading(false);
      }
    };
    getCat();
  }, [reFetch, token]);

  // Add User
  const addUser = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior at the start

    if (!name) {
      setNameError(true);
      setNameErrorText("Please enter a name");
      return;
    }
    if (!number) {
      setNumberError(true);
      setNumberErrorText("Please enter a number");
      return;
    }

    if (number.length !== 10) {
      setNumberError(true);
      setNumberErrorText("Number is must be 10 digits");
      return;
    }

    // Prepare data payload
    const data = {
      phone: number,
      name: name,
      email: email,
      role: ROLES.USER,
    };

    const url = `${api}/add_user`;

    try {
      setisLoading(true); // Show loading indicator
      const user = await ADD(token, url, data); // Make the API call
      setisLoading(false); // Stop loading indicator after the API call

      // Handle response based on API status codes
      if (user.response === 200) {
        setalertType("success");
        setalertMsg("New User Added successfully");
        setreFetch((prev) => !prev); // Toggle re-fetch to refresh data
        handleClose();
      } else if (user.response === 201) {
        setalertType("error");
        setalertMsg(user.message);
      } else {
        setalertType("error");
        setalertMsg("Something went wrong! Please try again.");
      }

      handleSnakBarOpen(); // Show Snackbar
    } catch (error) {
      // Handle errors gracefully
      console.error("Error adding user:", error);
      setisLoading(false);
      setalertType("error");
      setalertMsg("An unexpected error occurred. Please try again.");
      handleSnakBarOpen();
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

  const handleChange = (e) => {
    const value = e.target.value;
    // Only allow digits (0-9)
    if (/^[0-9]*$/.test(value)) {
      setnumber(value);
      setNumberError(false);
      setNumberErrorText("");
    } else {
      setNumberError(true);
      setNumberErrorText("Please enter a valid number");
    }
  };

  // update User
  const updateUser = async (e) => {
    e.preventDefault();

    if (!name) {
      setNameError(true);
      setNameErrorText("Please enter a name");
      return;
    }
    if (!number) {
      setNumberError(true);
      setNumberErrorText("Please enter a number");
      return;
    }

    if (number.length !== 10) {
      setNumberError(true);
      setNumberErrorText("Number is must be 10 digits");
      return;
    }

    const data = {
      phone: number,
      name: name,
      email: email,
      wallet_amount: walletAmt || 0,
      id: userID,
      isFromAdmin: true,
    };

    const url = `${api}/update_user`;

    try {
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
        setalertType("error");
        setalertMsg(update.message);
      } else {
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }

      handleSnakBarOpen();
    } catch (error) {
      // Handle errors gracefully
      console.error("Error updating user:", error);
      setisLoading(false);
      setalertType("error");
      setalertMsg("An unexpected error occurred. Please try again.");
      handleSnakBarOpen();
    }
  };

  const handleWalletAmountChange = (e) => {
    let value = e.target.value;

    // Allow empty input
    if (value === "") {
      setwalletAmt(value);
      return;
    }

    // Allow only numbers with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setwalletAmt(value);
    }
  };

  const handleSearchAndFilter = (searchQuery = "", selectedFilter = "all") => {
    if (!MainUsers) return;
    setisUsersLoading(true);
    let userData;

    switch (selectedFilter) {
      case "active":
        userData = MainUsers.active;
        break;
      case "inactive":
        userData = MainUsers.inactive;
        break;
      case "all":
      default:
        userData = MainUsers.all;
    }

    let filteredData = userData;
    if (searchQuery.trim() !== "") {
      filteredData = userData
        .map((obj) => {
          const originalUpdatedAt = obj.updated_at;
          return {
            ...obj,
            updated_at_temp: moment
              .utc(obj.updated_at)
              .local()
              .format("DD-MM-YYYY HH:mm:ss"),
            originalUpdatedAt,
          };
        })
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
          const { originalUpdatedAt, updated_at_temp, ...rest } = obj;
          return {
            ...rest,
            updated_at: originalUpdatedAt,
          };
        });
    }

    setusers(filteredData);
    setisUsersLoading(false);
  };

  // For search input
  const handleSearchChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchText(value);
    setTimeout(() => {
      handleSearchAndFilter(value, filterType);
    }, 500);
  };

  const column = useMemo(
    () => [
      { field: "id", headerName: "Id", width: 60 },
      // {
      //   field: "image",
      //   headerName: "Image",
      //   width: 100,
      //   height: 100,
      //   renderCell: (params) =>
      //     params.row.image != null ? (
      //       <img src={params.row.image} alt={params.row.image} />
      //     ) : (
      //       <i class="fa-solid fa-user-tie" style={{ fontSize: "22px" }}></i>
      //     ),
      // },
      { field: "name", headerName: "Name", width: 180 },
      {
        field: "email",
        headerName: "Email",
        width: 250,
        renderCell: (params) => {
          return <p>{params.value ?? "N/A"}</p>;
        },
      },
      { field: "phone", headerName: "Phone", width: 150 },
      {
        field: "wallet_amount",
        headerName: "Wallet Amount",
        width: 100,
        renderCell: (params) => (
          <p
            style={{
              color:
                params.row.wallet_amount === null ||
                params.row.wallet_amount < 250
                  ? "red"
                  : "#54B435",
              fontWeight:
                params.row.wallet_amount === null ||
                params.row.wallet_amount < 250
                  ? "700"
                  : "700",
            }}
          >
            {params.row.wallet_amount === null
              ? "0.00"
              : params.row.wallet_amount.toFixed(2)}
          </p>
        ),
      },
      // {
      //   field: "role",
      //   headerName: "Role",
      //   width: 150,
      //   renderCell: (params) => (
      //     <>
      //       {params.row.role.length ? (
      //         params.row.role.map((role, index) => (
      //           <p key={index}>{role.role_title}</p>
      //         ))
      //       ) : (
      //         <p>USER</p>
      //       )}
      //     </>
      //   ),
      //   type: "string",
      // },
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
      {
        field: "Update",
        headerName: "Update",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              setisAddModel(false);
              setname(params.row.name);
              setemail(params.row.email);
              setnumber(params.row.phone);
              setuserID(params.row.id);
              setwalletAmt(
                params.row.wallet_amount === null ? 0 : params.row.wallet_amount
              );
              setrole_id(
                params.row.role.length ? params.row.role[0].role_id : null
              );
              setid_role(params.row.role.length ? params.row.role[0].id : null);
              setNameError(false);
              setNameErrorText("");
              setNumberError(false);
              setNumberErrorText("");
              handleOpen();
            }}
          >
            <span class="icon">
              <i class="fa-regular fa-pen-to-square"></i>
            </span>
          </button>
        ),
      },
      {
        field: "Address",
        headerName: "Address",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={async () => {
              // setSelectedCartItems(params?.row?.cart_items || []);
              const userId = params.row.id;
              handleModalOpen(userId);
            }}
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        ),
      },
    ],
    [handleModalOpen]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "ID",
      "Name",
      "Email",
      "Phone",
      "Wallet Amount",
      "Last Update",
    ];

    const reversedReports = [...users].reverse();

    const csvData = reversedReports
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((row, index) => {
        return [
          index + 1,
          row.id,
          row.name,
          row.email ?? "N/A",
          row.phone,
          row?.wallet_amount?.toFixed(2) ?? "0.00",
          moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
        ];
      });

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Details");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Customer_Details ${Utils.formatDateToDDMMYYYY(new Date())}.csv`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add the header text

    doc.setFontSize(18);
    const headerText = "Customer Details";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerX, 20);

    // Load the logo and add it to the document
    Utils.getBase64FromImage(logo, (base64Logo) => {
      const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
      const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(
        base64Logo,
        "PNG",
        pageWidth - logoWidth - 10,
        10,
        logoWidth,
        logoHeight
      );

      // Set smaller font size for the date range text below header
      doc.setFontSize(12);

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Phone", dataKey: "phone" },
        { header: "Wallet Amount", dataKey: "wallet_amt" },
        { header: "Last Update", dataKey: "last_update" },
      ];

      const reversedReports = [...users].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((row, index) => ({
          sno: index + 1,
          id: row.id,
          name: row.name,
          email: row.email ?? "N/A",
          phone: row.phone,
          wallet_amt: row?.wallet_amount?.toFixed(2) ?? "0.00",
          last_update: moment
            .utc(row.updated_at)
            .local()
            .format("DD-MM-YYYY HH:mm:ss"),
        }));

      const tableStartY = 10 + logoHeight + 6;

      // Your table configuration remains unchanged
      doc.addFont(
        "meera-regular-unicode-font-normal.ttf",
        "meera-regular-unicode-font-normal",
        "normal"
      );
      doc.setFont("meera-regular-unicode-font-normal");
      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => Object.values(row)),
        startY: tableStartY,
        margin: { left: 10 },
        halign: "center",
        styles: {
          fontSize: 10,
          cellWidth: "auto",
        },
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
        columnStyles: {
          0: { cellWidth: 15 }, //S.no
          1: { cellWidth: 20 }, //ID #
          2: { cellWidth: 22 }, //Name
          3: { cellWidth: 30 }, //Email
          4: { cellWidth: 32 }, //Phone
          5: { cellWidth: 35 }, //Wallet Amount
          6: { cellWidth: 35 }, //Last Update
        },
        tableWidth: "wrap",
        showHead: "firstPage",
      });

      // After the table is completely generated, add the page numbers
      const totalPages = doc.internal.getNumberOfPages(); // Get total pages
      doc.setFontSize(9);
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Set the page context to the current page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`; // Format "Page X/Y"
        const marginRight = 15;
        const marginBottom = i === 1 ? 7 : 10;

        // Add page number at the bottom-right of the page
        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - marginBottom
        );
      }

      // Save the PDF
      doc.save(
        `Customer_Details ${Utils.formatDateToDDMMYYYY(new Date())}.pdf`
      );
    });
  };

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Orders in Last 7 Days", value: "active" },
    { label: "Not Orders in Last 7 Days", value: "inactive" },
  ];

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
            disabled={users.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={users.length === 0}
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
            setNameError(false);
            setNameErrorText("");
            setNumberError(false);
            setNumberErrorText("");
            setisAddModel(true);
            handleOpen();
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
            Manage Customers
          </Typography>
          <Box
            display={"flex"}
            // alignItems={"center"}
            gap={"1rem"}
            width={"38.33%"}
          >
            <Autocomplete
              margin="normal"
              size="small"
              options={filterOptions}
              fullWidth
              disableClearable={filterType === "all"}
              value={
                filterOptions.find((opt) => opt.value === filterType) || null
              }
              onChange={(event, newValue) => {
                const selectedValue = newValue?.value || "all";
                if (MainUsers) {
                  setFilterType(selectedValue);
                  handleSearchAndFilter(searchText, selectedValue);
                }
              }}
              renderInput={(params) => (
                <FormControl fullWidth size="small" margin="normal">
                  <TextField {...params} label="Select Customers" />
                  {/* <FormHelperText>Note: Based on past 7 days.</FormHelperText> */}
                </FormControl>
              )}
            />

            {/* <ImportCSV /> */}
            <TextField
              // margin="normal"
              size="small"
              sx={{
                width: {
                  xs: "80%",
                  sm: "300px",
                  md: "500px",
                  marginTop: "16px",
                },
              }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              onChange={handleSearchChange}
            />
          </Box>
        </Box>

        {!isUsersLoading && users ? (
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
              rows={users}
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
            {isAddModel ? "Add New User" : "Update User Details"}
          </Typography>
          {isAddModel ? (
            <Box component="form" sx={{ mt: 1 }} onSubmit={addUser} noValidate>
              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="Name"
                label="Name"
                name="Name"
                autoComplete="text"
                value={name}
                size="small"
                onChange={(e) => {
                  setname(e.target.value);
                  setNameError(false);
                  setNameErrorText("");
                }}
                error={nameError}
                helperText={nameError ? nameErrorText : ""}
              />
              <TextField
                margin="normal"
                color="secondary"
                fullWidth
                id="Email"
                label="Email"
                name="Email"
                autoComplete="email"
                type="email"
                value={email}
                size="small"
                onChange={(e) => {
                  setemail(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                color="secondary"
                required
                fullWidth
                id="Number"
                label="Number"
                name="Number"
                autoComplete="Number"
                type="tel"
                inputProps={{
                  inputMode: "tel",
                  pattern: "[0-9]*", // Regex pattern for only digits
                  maxLength: 10, // Limit input to 10 digits
                }}
                // autoFocus
                value={number}
                size="small"
                onChange={handleChange}
                error={numberError}
                helperText={numberError ? numberErrorText : ""}
              />

              {/* <input
                type="file"
                name="image"
                id="image"
                className="imageInput"
                accept="image/*"
                disabled
              /> */}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, fontWeight: "700" }}
                color="secondary"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress /> : `Add New User `}
              </Button>
            </Box>
          ) : (
            <>
              {" "}
              <Box
                component="form"
                sx={{ mt: 1 }}
                onSubmit={updateUser}
                noValidate
              >
                <TextField
                  margin="normal"
                  color="secondary"
                  required
                  fullWidth
                  id="Title"
                  label="Title"
                  name="Title"
                  autoComplete="text"
                  value={name}
                  size="small"
                  onChange={(e) => {
                    setname(e.target.value);
                    setNameError(false);
                    setNameErrorText("");
                  }}
                  error={nameError}
                  helperText={nameError ? nameErrorText : ""}
                />
                <TextField
                  margin="normal"
                  color="secondary"
                  fullWidth
                  id="Email"
                  label="Email"
                  name="Email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  size="small"
                  onChange={(e) => {
                    setemail(e.target.value);
                  }}
                />
                <TextField
                  margin="normal"
                  color="secondary"
                  required
                  fullWidth
                  id="Number"
                  label="Number"
                  name="Number"
                  autoComplete="Number"
                  type="tel"
                  inputProps={{
                    inputMode: "tel",
                    pattern: "[0-9]*", // Regex pattern for only digits
                    maxLength: 10, // Limit input to 10 digits
                  }}
                  autoFocus
                  value={number}
                  size="small"
                  onChange={handleChange}
                  error={numberError}
                  helperText={numberError ? numberErrorText : ""}
                />
                <TextField
                  margin="normal"
                  color="secondary"
                  fullWidth
                  id="Wallet Amount"
                  label="Wallet Amount"
                  name="Wallet Amount"
                  autoComplete="Number"
                  type="text"
                  inputProps={{
                    inputMode: "tel",
                    pattern: "^\\d+(\\.\\d{1,2})?$",
                    maxlength: 9,
                  }}
                  value={walletAmt}
                  size="small"
                  onChange={(e) => {
                    handleWalletAmountChange(e);
                  }}
                />
                {/* <input
                  type="file"
                  name="image"
                  id="image"
                  className="imageInput"
                  accept="image/*"
                  disabled
                /> */}

                {/* {hasDeliveryPartner && (
                  <>
                    {role_id === 4 ? (
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
                    ) : role_id !== 1 && role_id !== 2 ? (
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
                    ) : null}
                  </>
                )} */}

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
      <AddressListModal
        addressList={addressList}
        open={openAddressModal}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default Customers;
