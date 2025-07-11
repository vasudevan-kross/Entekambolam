import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Snackbar,
  Typography,
  Box,
  MenuItem,
  Select,
  Stack,
  Skeleton,
  FormControl,
  Checkbox,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  IconButton,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { GET, ADD } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

function AssignExecutiveRoutes() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [executives, setExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [unassignedRoutes, setUnassignedRoutes] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [loadingExecutives, setLoadingExecutives] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const handleSnackbarOpen = () => setSnackbarOpen(true);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [searchParams] = useSearchParams();
  const executiveId = searchParams.get("executiveId");
  useEffect(() => {
    const getExecutives = async () => {
      setLoadingExecutives(true);
      try {
        const url = `${api}/get_all_executives`;
        const result = await GET(token, url);
        if (result.data) {
          setExecutives(result.data);
          if (executiveId) {
            const matchedExecutive = result.data?.find(
              (executive) => executive.id === parseInt(executiveId)
            );
            if (matchedExecutive) {
              setSelectedExecutive(matchedExecutive.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching executives:", error);
        setAlertMsg("Failed to load executives. Please try again.");
        setAlertType("error");
        setSnackbarOpen(true);
      } finally {
        setLoadingExecutives(false);
      }
    };
    getExecutives();
  }, [executiveId, token]);

  useEffect(() => {
    const getExecutiveRoutes = async () => {
      if (selectedExecutive) {
        setLoadingRoutes(true);
        try {
          const url = `${api}/get_delivery_executive_routes_details/${selectedExecutive}`;
          const result = await GET(token, url);
          if (result.data) {
            setAssignedRoutes(result.data.assigned_routes);
            setUnassignedRoutes(result.data.unassigned_routes);
          }
        } catch (error) {
          console.error("Error fetching executive routes:", error);
          setAlertMsg("Failed to load routes. Please try again.");
          setAlertType("error");
          setSnackbarOpen(true);
        } finally {
          setLoadingRoutes(false);
        }
      }
    };
    getExecutiveRoutes();
  }, [selectedExecutive, token]);

  const columns = useMemo(
    () => [
      {
        field: "select",
        headerName: "Select",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        renderHeader: (params) => (
          <Checkbox
            checked={assignedRoutes.length > 0 && unassignedRoutes.length === 0}
            indeterminate={
              assignedRoutes.length > 0 && unassignedRoutes.length > 0
            }
            onChange={handleSelectAll}
          />
        ),
        renderCell: (params) => {
          const isAssigned = assignedRoutes.some((r) => r.id === params.row.id);
          return (
            <Checkbox
              checked={isAssigned}
              onChange={() =>
                handleRouteSelection(
                  params.row,
                  isAssigned ? "unassigned" : "assigned"
                )
              }
            />
          );
        },
      },
      { field: "route_name", headerName: "Route Name", width: 180 },
      { field: "pincode", headerName: "Pincode", width: 130 },
      { field: "city_name", headerName: "City Name", width: 150 },
      { field: "locations", headerName: "Locations", width: 200 },
      {
        field: "max_customers",
        headerName: "Max Customer",
        width: 150,
        renderCell: (params) => {
          return (
            <TextField
              type="number"
              value={params.row.max_customers || ""}
              inputProps={{ min: 0 }}
              onChange={(event) =>
                handleFieldChange(event, params.row, "max_customers")
              }
              fullWidth
              variant="outlined"
              InputProps={{
                style: {
                  // color: "#fff",
                },
                disableUnderline: true,
              }}
              sx={{
                width: "100px", // Set a fixed width to prevent the input from overlapping
                "& .MuiOutlinedInput-root": {
                  borderColor: "#4caf50", // Default border color
                  "&.Mui-focused": {
                    borderColor: "#76ff03", // Focused border color
                  },
                },
                "& .MuiOutlinedInput-input": {
                  // color: "#fff", // White text color
                  fontSize: "12px", // Reduce font size to make the input more compact
                  padding: "6px 8px", // Adjust padding to reduce the input box height
                },
              }}
            />
          );
        },
      },
      {
        field: "max_orders",
        headerName: "Max Order",
        width: 150,
        renderCell: (params) => {
          return (
            <TextField
              type="number"
              value={params.row.max_orders || ""}
              inputProps={{ min: 0 }}
              onChange={(event) =>
                handleFieldChange(event, params.row, "max_orders")
              }
              fullWidth
              variant="outlined"
              InputProps={{
                style: {
                  // color: "#fff",
                },
                disableUnderline: true,
              }}
              sx={{
                width: "100px", // Set a fixed width to prevent the input from overlapping
                "& .MuiOutlinedInput-root": {
                  borderColor: "#4caf50", // Default border color
                  "&.Mui-focused": {
                    borderColor: "#76ff03", // Focused border color
                  },
                },
                "& .MuiOutlinedInput-input": {
                  // color: "#fff", // White text color
                  fontSize: "12px", // Reduce font size to make the input more compact
                  padding: "6px 8px", // Adjust padding to reduce the input box height
                },
              }}
            />
          );
        },
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 150,
        renderCell: (params) => {
          return (
            <TextField
              type="number"
              value={params.row.priority || ""}
              inputProps={{ min: 0 }}
              onChange={(event) => {
                handleFieldChange(event, params.row, "priority");
              }}
              fullWidth
              variant="outlined"
              InputProps={{
                style: {
                  // color: "#fff",
                },
                disableUnderline: true,
              }}
              sx={{
                width: "100px", // Set a fixed width to prevent the input from overlapping
                "& .MuiOutlinedInput-root": {
                  borderColor: "#4caf50", // Default border color
                  "&.Mui-focused": {
                    borderColor: "#76ff03", // Focused border color
                  },
                },
                "& .MuiOutlinedInput-input": {
                  // color: "#fff", // White text color
                  fontSize: "12px", // Reduce font size to make the input more compact
                  padding: "6px 8px", // Adjust padding to reduce the input box height
                },
              }}
            />
          );
        },
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 100,
        renderCell: (params) => {
          const isActive = params.row?.is_active;
          return (
            <span
              style={{
                color: isActive ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
    ],
    [assignedRoutes, unassignedRoutes]
  );

  const handleSelectAll = () => {
    if (assignedRoutes.length > 0 && unassignedRoutes.length === 0) {
      // Move all assigned routes to unassigned
      setUnassignedRoutes((prev) => [...prev, ...assignedRoutes]);
      setAssignedRoutes([]);
    } else {
      // Move all unassigned routes to assigned
      setAssignedRoutes((prev) => [...prev, ...unassignedRoutes]);
      setUnassignedRoutes([]);
    }
  };

  const handleFieldChange = (event, row, field) => {
    const { value } = event.target;

    const updatedRow = {
      ...row, // Copy the existing route data
      [field]: value, // Update only the changed field
    };

    if (assignedRoutes.some((r) => r.id === row.id)) {
      // Update the route in assignedRoutes
      setAssignedRoutes((prevAssigned) =>
        prevAssigned.map((r) => (r.id === row.id ? updatedRow : r))
      );
    } else {
      // Update the route in unassignedRoutes
      setUnassignedRoutes((prevUnassigned) =>
        prevUnassigned.map((r) => (r.id === row.id ? updatedRow : r))
      );
    }
  };

  const handleRouteSelection = (route, type) => {
    // Find the route data that was selected, including custom fields like max_customer
    const updatedRoute = {
      ...route,
      assigned: type === "assigned", // Update the assigned status
    };

    if (type === "unassigned") {
      // Add to unassignedRoutes and remove from assignedRoutes
      setUnassignedRoutes((prev) => {
        // Only add if the route is not already in the list
        return prev.some((r) => r.id === route.id)
          ? prev // Do nothing if it's already in unassignedRoutes
          : [...prev, updatedRoute];
      });

      setAssignedRoutes(
        (prev) => prev.filter((r) => r.id !== route.id) // Remove from assignedRoutes
      );
    } else if (type === "assigned") {
      // Add to assignedRoutes and remove from unassignedRoutes
      setAssignedRoutes((prev) => {
        // Only add if the route is not already in the list
        return prev.some((r) => r.id === route.id)
          ? prev // Do nothing if it's already in assignedRoutes
          : [...prev, updatedRoute];
      });

      setUnassignedRoutes(
        (prev) => prev.filter((r) => r.id !== route.id) // Remove from unassignedRoutes
      );
    }
  };

  // Prepare rows by ensuring each row has a unique "id"
  const rows = [
    ...assignedRoutes.map((route) => ({
      id: route.id, // Use route.id for uniqueness
      ...route,
      assigned: true,
    })),
    ...unassignedRoutes.map((route) => ({
      id: route.id, // Use route.id for uniqueness
      ...route,
      assigned: false,
    })),
  ];

  const handleSave = async () => {
    // Prepare data to be sent in the request
    const dataToSave = {
      executive_id: selectedExecutive,
      routes: assignedRoutes,
      unassigned_routes: unassignedRoutes,
    };

    const isDataNegative = dataToSave.routes?.some(
      (val) => val.priority < 0 || val.max_customers < 0 || val.max_orders < 0
    );
    if (isDataNegative) {
      setAlertType("error");
      setAlertMsg("Values shouldn't be negative");
      setSnackbarOpen(true);
      return;
    }

    const url = `${api}/add_delivery_executive_route`;

    // Send request to the backend
    const result = await ADD(token, url, dataToSave);

    // Handle the result
    if (result.status) {
      setAlertType("success");
      setAlertMsg("Routes assigned successfully!");
      handleSnackbarOpen();
      setTimeout(() => {
        navigate("/AssignDeliveryRoutes");
      }, 1000);
    } else {
      setAlertType("error");
      setAlertMsg("An error occurred while assigning routes.");
      handleSnackbarOpen();
    }
  };

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
          {/* <GridToolbarExport color="secondary" sx={{ fontSize: "14px" }} />
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
          </Select> */}
        </div>
        {/* Save Button (Bottom-Right) */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSave}
          disabled={!selectedExecutive || assignedRoutes.length === 0}
        >
          Save
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={alertType}>
          {alertMsg}
        </Alert>
      </Snackbar>

      <Box sx={{ height: "100%", width: "100%" }}>
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
            <IconButton
              onClick={() => {
                navigate("/AssignDeliveryRoutes");
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            Delivery Executive Routes
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"40%"}
          >
            {/* Executive Selection with Loading State */}
            <FormControl fullWidth>
              <Autocomplete
                value={
                  (executives &&
                    executives.find(
                      (executive) => executive.id === selectedExecutive
                    )) ||
                  null
                }
                onChange={(event, newValue) => {
                  if (!newValue) {
                    setSelectedExecutive("");
                    setAssignedRoutes([]);
                    setUnassignedRoutes([]);
                  } else {
                    setSelectedExecutive(newValue.id);
                  }
                }}
                options={executives}
                getOptionLabel={(option) =>
                  `${option?.executive_id} - ${option?.name}`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={loadingExecutives}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Executive"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingExecutives ? (
                            <CircularProgress color="inherit" size={24} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disablePortal
              />
            </FormControl>
          </Box>
        </Box>

        {/* Loading Routes Spinner */}
        {selectedExecutive && loadingRoutes ? (
          <LoadingSkeleton rows={6} height={30} />
        ) : (
          // selectedExecutive && (
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
              columns={columns}
              rows={rows}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              localeText={{
                noRowsLabel: "No records found",
              }}
              // checkboxSelection={false} // Disable checkbox row selection feature
              // disableSelectionOnClick
            />
          </Box>
          // )
        )}
      </Box>
    </div>
  );
}

export default AssignExecutiveRoutes;
