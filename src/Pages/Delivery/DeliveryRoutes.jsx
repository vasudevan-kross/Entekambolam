import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import moment from "moment/moment";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { ADD, DELETE, GET } from "../../Functions/apiFunction";
import api from "../../Data/api";
import "../../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { CityOptions } from "../../Common/Constants";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

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

function DeliveryRoutes() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [deliveryRoutes, setDeliveryRoutes] = useState();
  const [allDeliveryRoutes, setAllDeliveryRoutes] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [dailogOpne, setdailogOpne] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [reFetch, setreFetch] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDailogOpen = () => setdailogOpne(true);
  const handleDailogClose = () => setdailogOpne(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isUpdating, setisUpdating] = useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  // update user state
  const [title, setTitle] = useState("");
  const [Id, setId] = useState("");
  const [routeName, setRouteName] = useState("");
  const [pincode, setPincode] = useState("");
  const [cityName, setCityName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locations, setLocations] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [routeNameError, setRouteNameError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [latitudeError, setLatitudeError] = useState("");
  const [longitudeError, setLongitudeError] = useState("");

  useEffect(() => {
    const getdeliveryRoutes = async () => {
      try {
        const url = `${api}/get_delivery_routes`;
        const deliveryRoutes = await GET(token, url);
        if (deliveryRoutes.response === 200) {
          const transformedRoutes = deliveryRoutes.data.map((route) => {
            return {
              ...route,
              locations_string:
                route?.locations && route?.locations.length > 0
                  ? route?.locations?.join(", ")
                  : "N/A",
            };
          });
          setDeliveryRoutes(transformedRoutes || []);
          setAllDeliveryRoutes(transformedRoutes || []);
        } else {
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg("Something went wrong");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getdeliveryRoutes();
  }, [reFetch, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const data = {
      route_name: routeName,
      pincode,
      city_name: cityName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      locations,
      is_active: isActive,
    };
    if (isUpdate) {
      const updatedData = {
        ...data,
        id: Id,
      };
      await UpdateDeliveryRoute(updatedData);
      return;
    }
    await AddDeliveryRoute(data);
  };

  const validateForm = () => {
    // Reset errors
    resetError();
    // Check if route name already exists (excluding current route if it's an update)
    const routeNameExists = deliveryRoutes.some(
      (route) =>
        route.route_name.toString() === routeName.toString() &&
        (Id === null || Id === undefined || route.id !== Id)
    );
    if (routeNameExists) {
      setRouteNameError("Route Name already exists");
      return false;
    }

    // Check if pincode is at least 6 digits long
    if (!/^\d{6,}$/.test(pincode)) {
      setPincodeError("Pincode must be at least 6 digits");
      return false;
    }

    // Check if pincode already exists (excluding current route if it's an update)
    const pincodeExists = deliveryRoutes?.some(
      (route) =>
        route.pincode.toString() === pincode.toString() &&
        (Id === null || Id === undefined || route.id !== Id)
    );
    if (pincodeExists) {
      setPincodeError("Pincode already exists");
      return false;
    }

    if (
      latitude &&
      (!/^-?\d+(\.\d+)?$/.test(latitude) || latitude < -90 || latitude > 90)
    ) {
      setLatitudeError("Latitude must be a decimal");
      return false;
    }

    // Validate longitude (must be a valid decimal between -180 and 180)
    if (
      longitude &&
      (!/^-?\d+(\.\d+)?$/.test(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setLongitudeError("Longitude must be a decimal");
      return false;
    }
    return true;
  };

  const AddDeliveryRoute = async (data) => {
    const url = `${api}/add_delivery_route`;
    setisUpdating(true);
    const addDeliveryRoute = await ADD(token, url, data);
    if (addDeliveryRoute.response === 200) {
      setisUpdating(false);
      handleSnakBarOpen();
      handleClose();
      setreFetch(!reFetch);
      setisUpdating(false);
      setalertType("success");
      setalertMsg("New Delivery Route added successfully");
    } else if (addDeliveryRoute.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg(addDeliveryRoute.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg(addDeliveryRoute.response.data.message);
    }
  };

  const UpdateDeliveryRoute = async (data) => {
    const url = `${api}/update_delivery_route`;
    setisUpdating(true);
    const updateDeliveryRoute = await ADD(token, url, data);
    if (updateDeliveryRoute.response === 200) {
      setisUpdating(false);
      handleSnakBarOpen();
      handleClose();
      setreFetch(!reFetch);
      setisUpdating(false);
      setIsUpdate(false);
      setalertType("success");
      setalertMsg("Delivery Route Updated successfully");
    } else if (updateDeliveryRoute.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg(updateDeliveryRoute.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg(updateDeliveryRoute.response.data.message);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Delivery Routes";
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
        { header: "Route Name", dataKey: "name" },
        { header: "Pincode", dataKey: "pincode" },
        { header: "City", dataKey: "city" },
        { header: "Locations", dataKey: "location" },
        { header: "Latitude", dataKey: "latitude" },
        { header: "Longitude", dataKey: "longitude" },
        { header: "Status", dataKey: "status" },
        { header: "Last Updated", dataKey: "lastupdate" },
      ];

      const reversedRoutes = [...deliveryRoutes].reverse();

      const tableRows = reversedRoutes.map((row, index) => ({
        name: row.route_name,
        pincode: row.pincode,
        city: row.city_name,
        location: row.locations_string,
        latitude: row.latitude != null ? row.latitude : "N/A",
        longitude: row.longitude != null ? row.longitude : "N/A",
        status: row.is_active ? "Active" : "In Active",
        lastupdate: parseDate(row.updated_at),
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.name,
          row.pincode,
          row.city,
          row.location,
          row.latitude,
          row.longitude,
          row.status,
          row.lastupdate,
        ]),
        startY: tableStartY,
        margin: { left: 20 },
        styles: {
          fontSize: 10, // Adjust font size for table content
        },

        columnStyles: {
          0: { cellWidth: 40 }, //name
          1: { cellWidth: 20 }, //Pincode
          2: { cellWidth: 35 }, //City
          3: { cellWidth: 50 }, //Location
          4: { cellWidth: 25 }, //Latitude
          5: { cellWidth: 30 }, //Longitude
          6: { cellWidth: 20 }, //status
          7: { cellWidth: 40 }, //Last update
        },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
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

      doc.save(
        `Delivery_Routes_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Route Name",
      "Pincode",
      "City",
      "Locations",
      "Latitude",
      "Longitude",
      "Status",
      "Last Updated",
    ];

    const reversedRoutes = [...deliveryRoutes].reverse();

    const csvData = reversedRoutes.map((row, index) => [
      row.route_name,
      row.pincode,
      row.city_name,
      row.locations_string,
      row.latitude != null ? row.latitude : "N/A",
      row.longitude != null ? row.longitude : "N/A",
      row.is_active ? "Active" : "In Active",
      parseDate(row.updated_at),
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Delivery Routes Reports"
    );

    const fileName = `Delivery_Routes_${moment
      .utc(new Date())
      .local()
      .format("DD-MM-YYYY")}.csv`;
    XLSX.writeFile(workbook, fileName);
  };

  // Fallback parser function (you can also extract this to a helper)
  const parseDate = (dateStr) => {
    let date = moment(dateStr, moment.ISO_8601, true);
    if (!date.isValid()) {
      date = moment(dateStr, "DD-MM-YYYY", true);
    }
    return date.isValid() ? date.local().format("DD-MM-YYYY") : "Invalid date";
  };

  // delete
  const deleteCat = async (e) => {
    e.preventDefault();
    var deleteData = JSON.stringify({
      id: Id,
    });
    const url = `${api}/delete_delivery_route`;
    setisUpdating(true);
    const deleteSub = await DELETE(token, url, deleteData);
    setisUpdating(false);
    console.log(deleteSub);

    if (deleteSub.response === 200) {
      handleDailogClose();
      handleClose();
      handleSnakBarOpen();
      resetState();
      setalertType("success");
      setalertMsg("Successfully Deleted");
      setreFetch(!reFetch);
    } else {
      handleDailogClose();
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  const resetError = () => {
    setRouteNameError("");
    setPincodeError("");
    setLatitudeError("");
    setLongitudeError("");
  };
  const column = useMemo(
    () => [
      // { field: "id", headerName: "Id", width: 60 },
      { field: "route_name", headerName: "Route Name", width: 180 },
      { field: "pincode", headerName: "Pincode", width: 120 },
      { field: "city_name", headerName: "City", width: 180 },
      {
        field: "locations_string",
        headerName: "Locations",
        width: 220,
      },
      {
        field: "latitude",
        headerName: "Latitude",
        width: 120,
        renderCell: (params) => {
          // Check if latitude is null, display a placeholder or default value
          return params.row?.latitude !== null ? params.row?.latitude : "N/A";
        },
      },
      {
        field: "longitude",
        headerName: "Longitude",
        width: 120,
        renderCell: (params) => {
          // Check if longitude is null, display a placeholder or default value
          return params.row?.longitude !== null ? params.row?.longitude : "N/A";
        },
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 120,
        renderCell: (params) => {
          const isActive = params.row?.is_active;
          return (
            <span
              style={{
                color: isActive ? "green" : "red", // Green for Active, Red for Inactive
                fontWeight: "bold", // Optional, to make the text stand out
              }}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        field: "updated_at",
        headerName: "Last Updated",
        width: 220,
        renderCell: (params) => {
          let date = moment(params.row.updated_at, moment.ISO_8601, true);

          // If not ISO, try custom "DD-MM-YYYY"
          if (!date.isValid()) {
            date = moment(params.row.updated_at, "DD-MM-YYYY", true);
          }

          return date.isValid()
            ? date.local().format("DD-MM-YYYY")
            : "Invalid date";
        },
      },
      {
        field: "Actions",
        headerName: "Actions",
        width: 150,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Edit Button */}
            <button
              className="updateBtn"
              onClick={() => {
                setId(params.row.id);
                setRouteName(params.row.route_name);
                setPincode(params.row.pincode);
                setCityName(params.row.city_name);
                setLocations(params.row.locations);
                setLatitude(params.row.latitude);
                setLongitude(params.row.longitude);
                setIsActive(params.row.is_active);
                setIsUpdate(true);
                resetError();
                handleOpen();
              }}
            >
              <span className="icon">
                <i className="fa-regular fa-pen-to-square"></i>
              </span>
            </button>

            {/* Delete Button */}
            {/* <button
              className="dltBtn"
              onClick={() => {
                setId(params.row.id);
                setTitle(params.row.route_name);
                handleDailogOpen(); // Handle delete if needed
              }}
            >
              <span className="icon">
                <i className="fa-solid fa-trash"></i>
              </span>
            </button> */}
          </div>
        ),
      },

      // {
      //   field: "Edit",
      //   headerName: "Edit",
      //   width: 100,
      //   renderCell: (params) => (
      //     <button
      //       className="updateBtn"
      //       onClick={() => {
      //         setId(params.row.id);
      //         setRouteName(params.row.route_name);
      //         setPincode(params.row.pincode);
      //         setCityName(params.row.city_name);
      //         setLocations(params.row.locations);
      //         setLatitude(params.row.latitude);
      //         setLongitude(params.row.longitude);
      //         setIsActive(params.row.is_active);
      //         setIsUpdate(true);
      //         handleOpen();
      //       }}
      //     >
      //       <span className="icon">
      //         <i className="fa-regular fa-pen-to-square"></i>
      //       </span>
      //     </button>
      //   ),
      // },
      // {
      //   field: "Delete",
      //   headerName: "Delete",
      //   width: 100,
      //   renderCell: (params) => (
      //     <button
      //       className="dltBtn"
      //       onClick={() => {
      //         setId(params.row.id);
      //         setTitle(params.row.route_name);
      //         handleDailogOpen(); // Handle delete if needed
      //       }}
      //     >
      //       <span className="icon">
      //         <i className="fa-solid fa-trash"></i>
      //       </span>
      //     </button>
      //   ),
      // },
    ],
    []
  );

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
            disabled={deliveryRoutes.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={deliveryRoutes.length === 0}
          >
            Export to PDF
          </Button>
        </div>
        <button
          class="cssbuttons-io-button"
          onClick={() => {
            resetState();
            handleOpen();
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

  const resetState = () => {
    setTitle("");
    setRouteName("");
    setPincode("");
    setCityName("");
    setLocations([]);
    setLatitude();
    setLongitude();
    setIsActive(true);
    setIsUpdate(false);
  };
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
            Manage Delivery Routes
          </Typography>
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
                e.preventDefault();
                setTimeout(() => {
                  function searchArrayByValue(arr, searchQuery) {
                    return arr.filter((obj) => {
                      return Object.values(obj).some((val) => {
                        if (typeof val === "string") {
                          return val
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        }
                        if (typeof val === "number") {
                          return val
                            .toString()
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        }
                        return false;
                      });
                    });
                  }
                  setDeliveryRoutes(
                    searchArrayByValue(
                      allDeliveryRoutes,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {deliveryRoutes ? (
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
              sx={{
                fontSize: "13px",
                "& .MuiDataGrid-row": {
                  maxHeight: "150px !important",
                },
                "& .MuiDataGrid-cell": {
                  maxHeight: "150px !important",
                  whiteSpace: "break-spaces !important",
                },
              }}
              columns={column}
              rows={deliveryRoutes}
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
            {isUpdate ? "Update Delivery Route" : "Add New Delivery Route"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {/* Route Name */}
            <TextField
              fullWidth
              id="routeName"
              label="Route Name"
              name="routeName"
              required={true}
              value={routeName}
              size="small"
              color="secondary"
              onChange={(e) => {
                setRouteName(e.target.value);
                setRouteNameError("");
              }}
              sx={{ mb: 2 }}
              error={!!routeNameError}
              helperText={routeNameError}
            />

            {/* Pincode */}
            <TextField
              fullWidth
              id="pincode"
              label="Pincode"
              name="pincode"
              type="number"
              required={true}
              value={pincode}
              size="small"
              color="secondary"
              onKeyPress={(e) => {
                // Allow only numbers
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                // Limit input to 6 digits
                if (e.target.value.length <= 6) {
                  setPincode(e.target.value);
                  setRouteNameError("");
                }
              }}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 2 }}
              error={!!pincodeError}
              helperText={pincodeError}
            />

            {/* City Name */}
            <Autocomplete
              disablePortal
              fullWidth
              id="CityName"
              color="secondary"
              options={CityOptions}
              value={cityName || ""}
              // inputValue={cityName}
              // onInputChange={(event, newInputValue) =>
              //   setCityName(newInputValue)
              // } // To capture the user-typed value
              onChange={(event, newValue) => setCityName(newValue)} // To capture the selected value
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City Name"
                  name="CityName"
                  size="small"
                  fullWidth
                  required
                  color="secondary"
                />
              )}
              sx={{ mb: 2 }}
            />

            {/* Locations (array input) */}
            <TextField
              fullWidth
              id="locations"
              label="Locations (comma-separated)"
              name="locations"
              value={locations.join(", ")} // Display as comma-separated
              size="small"
              color="secondary"
              onChange={(e) => setLocations([e.target.value])} // Allow free typing, including commas
              onBlur={(e) => {
                setLocations(
                  e.target.value
                    .split(/\s*,\s*/g) // Split on commas with optional spaces
                    .filter((loc) => loc.length > 0) // Remove empty values
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setLocations(
                    e.target.value
                      .split(/\s*,\s*/g) // Split when Enter is pressed
                      .filter((loc) => loc.length > 0)
                  );
                  e.preventDefault(); // Prevent form submission
                }
              }}
              sx={{ mb: 2 }}
            />

            {/* Latitude */}
            <TextField
              fullWidth
              id="latitude"
              label="Latitude"
              name="latitude"
              type="number"
              value={latitude}
              size="small"
              color="secondary"
              onChange={(e) => {
                setLatitude(e.target.value);
              }}
              sx={{ mb: 2 }}
              error={!!latitudeError}
              helperText={latitudeError}
            />

            {/* Longitude */}
            <TextField
              fullWidth
              id="longitude"
              label="Longitude"
              name="longitude"
              type="number"
              value={longitude}
              size="small"
              color="secondary"
              onChange={(e) => {
                setLongitude(e.target.value);
              }}
              sx={{ mb: 2 }}
              error={!!longitudeError}
              helperText={longitudeError}
            />

            {/* is_active Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="secondary"
                />
              }
              label="Is Active"
              sx={{ mb: 2 }}
            />
            {/* Submit Button */}
            <button className="AddBtn" type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <CircularProgress color="inherit" />
              ) : isUpdate ? (
                "Update Delivery Route"
              ) : (
                "Add New Delivery Route"
              )}
            </button>
          </Box>
        </Box>
      </Modal>

      {/* Dailog */}
      <Dialog
        open={dailogOpne}
        onClose={handleDailogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">Delete Delivery Route</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
              Do you want to delete{" "}
              <b>
                <span>{title}</span>
              </b>
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDailogClose} color="primary" variant="contained" size="small">
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={deleteCat}
            autoFocus
            color="error"
          >
            {isUpdating ? <CircularProgress /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeliveryRoutes;
