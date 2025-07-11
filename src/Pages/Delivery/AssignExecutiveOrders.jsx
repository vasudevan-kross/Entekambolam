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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { GET, ADD, UPDATE } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Utils from "../../Global/utils";
import moment from "moment";
import dayjs from "dayjs";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

function AssignExecutiveOrders() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [executives, setExecutives] = useState([]);
  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  const [selectedExecutiveNumber, setSelectedExecutiveNumber] = useState("");
  const [searchText, setSearchText] = useState("");
  const tomorrow = new Date().setDate(new Date().getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedDateString, setSelectedDateString] = useState(
    format(tomorrow, "yyyy-MM-dd")
  );
  const [orderstoAssign, setOrderstoAssign] = useState([]);
  const [allOrderstoAssign, setAllOrderstoAssign] = useState([]);

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [initialAssignedOrders, setInitialAssignedOrders] = useState([]);
  const [initialUnassignedOrders, setInitialUnassignedOrders] = useState([]);

  const [pageSize, setPageSize] = useState(20);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [loadingExecutives, setLoadingExecutives] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const handleSnackbarOpen = () => setSnackbarOpen(true);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [searchParams] = useSearchParams();
  const executiveId = searchParams.get("executiveId");
  const assignedDate = searchParams.get("assigned_date");
  useEffect(() => {
    const getExecutives = async () => {
      setLoadingExecutives(true);
      try {
        const url = `${api}/get_all_executives`;
        const result = await GET(token, url);
        if (result.data) {
          setExecutives(result.data);
          if (executiveId) {
            const parsedAssignedDate = moment(
              assignedDate,
              "DD-MM-YYYY"
            ).toDate();
            setSelectedDate(parsedAssignedDate);
            setSelectedDateString(assignedDate);
            const matchedExecutive = result.data?.find(
              (executive) => executive.id === parseInt(executiveId)
            );
            if (matchedExecutive) {
              setSelectedExecutiveId(matchedExecutive.id);
              setSelectedExecutiveNumber(matchedExecutive.executive_id);
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
    const getExecutiveOrders = async () => {
      if (selectedExecutiveId && selectedDate) {
        setLoadingOrders(true);
        try {
          var url = `${api}/get_delivery_executive_order_details/${selectedExecutiveId}/${selectedDateString}`;
          const result = await GET(token, url);
          if (result.data) {
            setAllOrderstoAssign(result.data);
            setAllOrderstoAssign(result.data);
            // apply the filter here based on current filterType
            const filtered = result.data?.filter((order) => {
              const searchResults = Object.values(order).some((val) => {
                if (typeof val === "string") {
                  return val.toLowerCase().includes(searchText.toLowerCase());
                }
                if (typeof val === "number") {
                  return val.toString().includes(searchText.toLowerCase());
                }
                return false;
              });

              // Apply order type filter
              if (filterType === "all") {
                return searchResults;
              }

              if (filterType === "buyonce") {
                return searchResults && !order.subscription_type;
              }

              if (filterType === "subscription") {
                return searchResults && !!order.subscription_type;
              }

              return searchResults && order.subscription_type === filterType;
            });
            setOrderstoAssign(filtered);
            const assigned = result.data.filter((order) =>
              order?.isAssigned ? order?.isAssigned === 1 : false
            );
            const unassigned = result.data.filter((order) =>
              order?.isAssigned ? order?.isAssigned === 0 : true
            );

            setAssignedOrders(assigned);
            setInitialAssignedOrders(assigned);

            setUnassignedOrders(unassigned);
            setInitialUnassignedOrders(unassigned);
          }
        } catch (error) {
          setAlertMsg("Failed to load orders. Please try again.");
          setAlertType("error");
          setSnackbarOpen(true);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    getExecutiveOrders();
  }, [selectedExecutiveId, selectedDate, token]);

  const getQuantity = (row) => {
    if (row.subscription_type === 2) {
      const selectedDayCode = dayjs(selectedDate).day();
      const string = row.selected_days_for_weekly;
      const validJSONString = string.replace(
        /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
        '"$2": '
      );
      const array = JSON.parse(validJSONString);
      const matchedDay = array.find((day) => day.dayCode === selectedDayCode);

      return matchedDay ? matchedDay.qty : 0;
    }
  };

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
            checked={assignedOrders.length > 0 && unassignedOrders.length === 0}
            indeterminate={
              assignedOrders.length > 0 && unassignedOrders.length > 0
            }
            onChange={handleSelectAll}
          />
        ),
        renderCell: (params) => {
          const isAssigned = assignedOrders.some((r) => r.id === params.row.id);
          return (
            <Checkbox
              checked={isAssigned}
              onChange={() =>
                handleOrderSelection(
                  params.row,
                  isAssigned ? "unassigned" : "assigned"
                )
              }
            />
          );
        },
      },
      { field: "order_number", headerName: "Order Number#", width: 150 },
      {
        field: "title",
        headerName: "Product",
        width: 180,
        valueGetter: (params) =>
          params.row.subscription_type !== null
            ? params.row.title
            : JSON.parse(params.row.product_detail)
              ?.map((product) => product.product_title)
              .join(", "),
      },
      {
        field: "qty",
        headerName: "Quantity",
        width: 100,
        renderCell: (params) => {
          if (params.row.subscription_type === 2) {
            return getQuantity(params.row);
          }
          return params.row.qty;
        },
      },
      {
        field: "order_amount",
        headerName: "Amount",
        width: 100,
        renderCell: (params) => (
          <p>{params.row?.order_amount?.toFixed(2) || "0.00"}</p>
        ),
      },
      {
        field: "",
        headerName: "Subscription Type",
        width: 140,
        renderCell: (params) => {
          let subscriptionText =
            Utils.getSubscriptionType(params.row.subscription_type) === "N/A"
              ? "Buyonce"
              : Utils.getSubscriptionType(params.row.subscription_type);
          return <p>{subscriptionText}</p>;
        },
      },
      { field: "customerName", headerName: "Customer Name", width: 180 },
      { field: "phone", headerName: "Customer Phone", width: 180 },
      { field: "pincode", headerName: "Pincode", width: 180 },
      {
        field: "DeliveryInfo",
        headerName: "Customer Address",
        width: 250,
        renderCell: (params) => {
          const address = getFormattedAddress(params.row);
          return <div>{address}</div>;
        },
      },
    ],
    [orderstoAssign, assignedOrders, unassignedOrders]
  );

  const getFormattedAddress = (ad) => {
    const address = [
      ad.name,
      ad.flat_no,
      ad.apartment_name,
      ad.area,
      ad.landmark,
      ad.city,
      ad.pincode,
    ]
      .filter(Boolean)
      .join(" , ");
    return address;
  };

  const handleSelectAll = () => {
    if (assignedOrders.length > 0 && unassignedOrders.length === 0) {
      setUnassignedOrders((prev) => [...prev, ...assignedOrders]);
      setAssignedOrders([]);
    } else {
      setAssignedOrders((prev) => [...prev, ...unassignedOrders]);
      setUnassignedOrders([]);
    }
  };

  const handleOrderSelection = (order, type) => {
    const updatedOrders = {
      ...order,
      assigned: type === "assigned",
    };

    if (type === "unassigned") {
      setUnassignedOrders((prev) => {
        return prev.some((r) => r.id === order.id)
          ? prev
          : [...prev, updatedOrders];
      });

      setAssignedOrders(
        (prev) => prev.filter((r) => r.id !== order.id) // Remove from assignedOrders
      );
    } else if (type === "assigned") {
      setAssignedOrders((prev) => {
        return prev.some((r) => r.id === order.id)
          ? prev
          : [...prev, updatedOrders];
      });

      setUnassignedOrders(
        (prev) => prev.filter((r) => r.id !== order.id) // Remove from unassignedOrders
      );
    }
  };

  const formatDate = (dateString) => {
    dateString = dateString.trim(); // Remove leading/trailing spaces
    const parsedDate = moment(dateString, "DD-MM-YYYY", true);
    if (parsedDate.isValid()) {
      return parsedDate.format("YYYY-MM-DD");
    } else {
      return dateString;
    }
  };

  const hasOrderChanges = () => {
    const getIds = (orders) => (orders || []).map((order) => order.id).sort();
    const isAssignedChanged =
      JSON.stringify(getIds(initialAssignedOrders)) !==
      JSON.stringify(getIds(assignedOrders));
    const isUnassignedChanged =
      JSON.stringify(getIds(initialUnassignedOrders)) !==
      JSON.stringify(getIds(unassignedOrders));

    return isAssignedChanged || isUnassignedChanged;
  };

  const handleSave = async () => {
    if (!hasOrderChanges()) {
      setAlertType("warning");
      setAlertMsg("No changes detected to save.");
      handleSnackbarOpen();
      return;
    }

    try {
      const formattedDate = formatDate(selectedDateString);
      const dataToSave = {
        executive_id: selectedExecutiveId,
        executive_number: selectedExecutiveNumber,
        assigned_orders: assignedOrders || [],
        unassigned_orders: unassignedOrders || [],
        assigned_date: formattedDate,
      };

      const url = `${api}/add_delivery_executive_orders`;
      const result = await ADD(token, url, dataToSave);

      if (result.response === 200) {
        setAlertType("success");
        setAlertMsg("Orders assigned successfully!");
        handleSnackbarOpen();
        navigate("/AssignDeliveryOrders");
      } else {
        throw new Error("Failed to assign orders.");
      }
    } catch (error) {
      console.error(error);
      setAlertType("error");
      setAlertMsg("An error occurred while assigning orders.");
      handleSnackbarOpen();
    }
  };

  const handleDateChange = (newValue) => {
    if (newValue) {
      setSelectedDate(newValue);
      const localDate = setMilliseconds(
        setSeconds(setMinutes(setHours(newValue, 0), 0), 0),
        0
      );
      const formattedDate = format(localDate, "yyyy-MM-dd");
      setSelectedDateString(formattedDate);
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
          {/* <GridToolbarExport color="secondary" sx={{ fontSize: "14px" }} /> */}
          {/* <Select
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
          disabled={!selectedExecutiveId || !hasOrderChanges()}
        >
          Save
        </Button>
      </GridToolbarContainer>
    );
  }

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    setTimeout(() => {
      filterOrders(searchValue, filterType);
    }, 500);
  };

  const handleFilterChange = (event, newValue) => {
    const selectedValue = newValue?.value || "all";
    setFilterType(selectedValue);
    filterOrders(searchText, selectedValue);
  };

  const filterOrders = (searchValue, selectedType) => {
    const filteredOrders = allOrderstoAssign?.filter((order) => {
      const searchResults = Object.values(order).some((val) => {
        if (typeof val === "string") {
          return val.toLowerCase().includes(searchValue.toLowerCase());
        }
        if (typeof val === "number") {
          return val.toString().includes(searchValue.toLowerCase());
        }
        return false;
      });

      // Apply order type filter
      if (selectedType === "all") {
        return searchResults;
      }

      if (selectedType === "buyonce") {
        return searchResults && !order.subscription_type;
      }

      if (selectedType === "subscription") {
        return searchResults && !!order.subscription_type;
      }

      return searchResults && order.subscription_type === selectedType;
    });

    setOrderstoAssign(filteredOrders);
  };

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Buyonce", value: "buyonce" },
    { label: "Subscription (All)", value: "subscription" },
    { label: "One Time", value: 1 },
    { label: "Weekly", value: 2 },
    { label: "Monthly", value: 3 },
    { label: "Alternative Days", value: 4 },
  ];

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
        <Box
          className="title-menu"
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Typography
            variant="h2"
            fontWeight={600}
            fontSize="1.5rem"
            lineHeight="2rem"
            sx={{
              color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
            }}
          >
            <IconButton
              onClick={() => {
                navigate("/AssignDeliveryOrders");
              }}
            >
              <ArrowBackIcon />
            </IconButton>{" "}
            Delivery Executive Orders
          </Typography>
          <Box display={"flex"} alignItems={"center"} gap={"1rem"}>
            <TextField
              size="small"
              fullWidth
              sx={{ width: { xs: "100%", sm: "300px", md: "400px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              onChange={handleSearchChange}
            />

            <Autocomplete
              disablePortal
              options={filterOptions}
              disableClearable={filterType === "all"}
              size="small"
              value={
                filterOptions.find((opt) => opt.value === filterType) || null
              }
              onChange={handleFilterChange}
              sx={{ width: { xs: "100%", sm: "200px" } }}
              renderInput={(params) => (
                <TextField {...params} label="Order Type" />
              )}
            />
          </Box>
        </Box>

        {/* Executive Selection with Loading State */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            paddingBottom: "10px",
            borderBottom: colors.grey[300],
          }}
        >
          <FormControl fullWidth>
            <Autocomplete
              disabled={executiveId}
              value={
                (executives &&
                  executives.find(
                    (executive) => executive.id === selectedExecutiveId
                  )) ||
                null
              }
              onChange={(event, newValue) => {
                if (!newValue) {
                  setSelectedExecutiveId("");
                  setSelectedExecutiveNumber("");
                  setOrderstoAssign([]);
                  setAssignedOrders([]);
                } else {
                  setSelectedExecutiveId(newValue ? newValue.id : null);
                  setSelectedExecutiveNumber(
                    newValue ? newValue.executive_id : null
                  );
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
              renderOption={(props, option) => {
                return (
                  <li
                    {...props}
                    style={{ color: option.is_active === 0 ? "gray" : "black" }}
                  >
                    {option.executive_id} - {option.name}
                    {option.is_active === 0 && (
                      <span style={{ color: "red", marginLeft: "10px" }}>
                        (Inactive)
                      </span>
                    )}
                  </li>
                );
              }}
              getOptionDisabled={(option) => option.is_active === 0}
            />
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              disabled={executiveId}
              label="Delivery Date"
              value={selectedDate}
              onChange={handleDateChange}
              minDate={assignedDate ? new Date(assignedDate) : new Date()}
              format="dd/MM/yyyy"
              disablePast={!executiveId}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Box>

        {selectedExecutiveId && loadingOrders ? (
          <LoadingSkeleton rows={6} height={30} />
        ) : (
          // selectedExecutiveId && (
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
              columns={columns}
              rows={orderstoAssign}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              // getRowHeight={() => 'auto'}
              rowHeight={70}
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

export default AssignExecutiveOrders;
