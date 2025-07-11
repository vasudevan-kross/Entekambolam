import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Select,
  TextField,
  Typography,
  useTheme,
  MenuItem,
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
import { GET } from "../Functions/apiFunction";
import api from "../Data/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import image from "./../Data/image";
import Utils from "../Global/utils";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function Orders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [orders, setorders] = useState();
  const [mainproducts, setMainproducts] = useState();
  const [pageSize, setpageSize] = useState(20);

  const dispatch = useDispatch();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const status = (id) => {
    const data = [
      {
        id: 1,
        text: "Confirmed",
      },
      {
        id: 2,
        text: "Canceled",
      },
      {
        id: 0,
        text: "Pending",
      },
    ];
    const ttl = data.filter((dt) => dt.id === id);
    return ttl[0]?.text || "N/A";
  };

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const url = `${api}/get_order`;
      const products = await GET(token, url);
      setorders(products.data);
      setMainproducts(products.data);
    };
    getCat();
  }, [token, dispatch]);

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "id", width: 120 },
      { field: "trasation_id", headerName: "Trasation Id", width: 90 },
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
      // {
      //   field: "image",
      //   headerName: "Image",
      //   width: 100,
      //   height: 100,
      //   renderCell: (params) =>
      //     params.row.product_image != null ? (
      //       <div
      //         style={{
      //           display: "flex",
      //           justifyContent: "center",
      //           width: "100%",
      //         }}
      //       >
      //         <img
      //           src={`${image}/${params.row.product_image}`}
      //           alt={params.row.product_image}
      //           height={"45px"}
      //         />
      //       </div>
      //     ) : (
      //       <i class="fa-regular fa-image" style={{ fontSize: "22px" }}></i>
      //     ),
      // },
      {
        field: "order_type",
        headerName: "Order type",
        width: 140,
        renderCell: (params) => {
          let orderText = Utils.getOrderType(params.row.order_type);
          return <p>{orderText}</p>;
        },
      },
      {
        field: "status",
        headerName: "Order Status",
        width: 100,
        renderCell: (params) => <p>{status(params.row.status)}</p>,
      },
      {
        field: "order_status",
        headerName: "Subscription Status",
        width: 130,
        renderCell: (params) =>
          params.row.subscription_type !== null ? (
            <p>{params.row.order_status === 0 ? "Active" : "Paused"}</p>
          ) : (
            <p>{params.row.order_status === 0 ? "Active" : "N/A"}</p>
          ),
      },
      {
        field: "",
        headerName: "Subscription Type",
        width: 140,
        renderCell: (params) => {
          let subscriptionText = Utils.getSubscriptionType(
            params.row.subscription_type
          );
          return <p>{subscriptionText}</p>;
        },
      },
      {
        field: "wallet_amount",
        headerName: "Wallet Amount",
        width: 100,
        renderCell: (params) => (
          <p>{params.row?.wallet_amount?.toFixed(2) || "0.00"}</p>
        ),
      },
      { field: "name", headerName: "Name", width: 180 },
      { field: "s_phone", headerName: "Number", width: 120 },
      { field: "qty", headerName: "Quantity", width: 100 },
      {
        field: "order_amount",
        headerName: "Amount",
        width: 100,
        renderCell: (params) => (
          <p>{params.row?.order_amount?.toFixed(2) || "0.00"}</p>
        ),
      },
      {
        field: "start_date",
        headerName: "Start Date",
        width: 100,
        renderCell: (params) =>
          params.row.start_date
            ? moment.utc(params.row.start_date).local().format("DD-MM-YYYY")
            : "--",
      },
      { field: "pincode", headerName: "Pincode", width: 100 },

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
        field: "Action",
        headerName: "Action",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(
                `/order/${params.row.id}/?subscription_type=${params.row.subscription_type !== null
                }`
              );
            }}
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        ),
      },
    ],
    [navigate]
  );

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "flex-start",
        }}
        style={{ marginBottom: "1rem" }}>
        <div style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center"
        }}>
          <GridToolbarExport
            color="secondary"
            sx={{ fontSize: "15px", fontWeight: "600" }}
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
              setpageSize(e.target.value);
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

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/neworder");
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
      < Box sx={{ height: " 100%", width: "100%" }
      }>
        <Box className="flex items-center flex-wrap justify-between gap-4 w-100 title-menu">
          <Typography className=""
            variant="h2"
            component={"h2"}
            fontWeight={600}
            fontSize={'1.5rem'}
            lineHeight={'2rem'}
            sx={{
              color: theme.palette.mode === 'dark' ? '#ffffffe6' : '#0e0e23',
            }}
          >
            Manage Orders
          </Typography>
          <Box display={"flex"} alignItems={"center"} gap={"1rem"} width={"40%"}>
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
                    return arr
                      .map((obj) => ({
                        ...obj,
                        start_date_temp: new Date(obj.start_date)
                          .toISOString()
                          .split("T")[0]
                          .split("-")
                          .reverse()
                          .join("-"),
                        exist_order_type: obj.order_type,
                        order_type_temp:
                          obj.order_type === 1
                            ? CONSTANTS.PAYMENT_OPTIONS.PREPAID
                            : obj.order_type === 2
                              ? CONSTANTS.PAYMENT_OPTIONS.POSTPAID
                              : obj.order_type === 3
                                ? CONSTANTS.PAYMENT_OPTIONS.PAYNOW
                                : obj.order_type === 4
                                  ? CONSTANTS.PAYMENT_OPTIONS.PAYLATER
                                  : "",
                        exist_order_status: obj.order_status,
                        order_status_temp:
                          obj.order_status === 0
                            ? CONSTANTS.STATUSES.ACTIVE
                            : obj.order_status === 1
                              ? CONSTANTS.STATUSES.PAUSED
                              : CONSTANTS.NOT_APPLICABLE,
                        exist_status: obj.status,
                        status_temp:
                          obj.status === 1
                            ? CONSTANTS.ORDER_STATUSES.CONFIRMED
                            : obj.status === 2
                              ? CONSTANTS.ORDER_STATUSES.CANCELLED
                              : CONSTANTS.ORDER_STATUSES.PENDING,
                        exist_subscription_type: obj.subscription_type,
                        subscription_type_temp:
                          obj.subscription_type === 1
                            ? CONSTANTS.ORDER_TYPES.ONE_TIME_ORDER
                            : obj.subscription_type === 2
                              ? CONSTANTS.ORDER_TYPES.WEEKLY
                              : obj.subscription_type === 3
                                ? CONSTANTS.ORDER_TYPES.MONTHLY
                                : obj.subscription_type === 4
                                  ? CONSTANTS.ORDER_TYPES.ALTERNATIVE_DAYS
                                  : CONSTANTS.NOT_APPLICABLE,
                        exist_start_date: obj.start_date,
                        updated_at_temp: moment
                          .utc(obj.updated_at)
                          .local()
                          .format("DD-MM-YYYY HH:mm:ss"),
                        exist_update_at: obj.updated_at,
                      }))
                      .filter((obj) => {
                        return Object.values(obj).some((val) => {
                          if (typeof val === "string") {
                            return val
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase());
                          }
                          if (typeof val === "number") {
                            return val.toString().includes(searchQuery);
                          }
                          return false;
                        });
                      })
                      .map(
                        ({
                          start_date_temp,
                          exist_order_type,
                          order_type_temp,
                          exist_order_status,
                          order_status_temp,
                          exist_status,
                          status_temp,
                          exist_subscription_type,
                          subscription_type_temp,
                          exist_start_date,
                          updated_at_temp,
                          exist_update_at,
                          ...rest
                        }) => ({
                          ...rest,
                          order_type: exist_order_type,
                          start_date: exist_start_date,
                          updated_at: exist_update_at,
                          status: exist_status,
                          order_status: exist_order_status,
                          subscription_type: exist_subscription_type,
                        })
                      );
                  }
                  setorders(
                    searchArrayByValue(mainproducts, e.target.value.toLowerCase())
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {orders ? (
          <Box className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 ${theme.palette.mode === 'dark' ? "bg-darkcard" : "bg-card"
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
                backgroundColor: theme.palette.mode === 'dark' ? "#334155" : "#0e0e23",
                borderBottom: "none",
                color: "#f5f5f5",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[0],
                borderBottom: "#000",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: theme.palette.mode === 'dark' ? "#334155" : "#0e0e23",
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
    </div>
  );
}

export default Orders;
