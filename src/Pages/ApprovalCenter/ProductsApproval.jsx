import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  useTheme,
  Grid,
  Modal,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import Box from "@mui/material/Box";

import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET, UPDATE } from "../../Functions/apiFunction";
import api from "../../Data/api";

import { tokens } from "../../theme";
import image from "../../Data/image";
import LoadingSkeleton from "../../Components/LoadingSkeleton";
import { useNavigate } from "react-router-dom";

const FILTERS = {
  ALL: "All",
  APPROVED: "Approved",
  PENDING: "Pending",
  REJECTED: "Rejected",
};

function ProductsApproval() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [products, setproducts] = useState();
  const [productsData, setproductsData] = useState({
    all: [],
    approved: [],
    pending: [],
    rejected: [],
  });
  const [mainproducts, setMainproducts] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [counts, setCounts] = useState();
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setloading] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [filter, setFilter] = useState(FILTERS.ALL);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const Tile = ({ title, count, color, onClick, isSelected, isLoading }) => {
    return (
      <Box
        onClick={onClick}
        className="text-card-foreground shadow-sm rounded-lg"
        sx={{
          backgroundColor: color,
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
          cursor: "pointer",
          border: isSelected ? "3px solid #000" : "none", // Highlight selected
          boxShadow: isSelected ? 6 : 1, // Extra shadow on hover
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: 4,
          },
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {isLoading ? (
            <Skeleton variant="text" width={60} height={40} />
          ) : (
            <Typography variant="h4">{count}</Typography>
          )}
        </Box>
      </Box>
    );
  };

  const handleTileClick = (type) => {
    setFilter(type);
    if (type === FILTERS.APPROVED) {
      setproducts(productsData.approved);
    } else if (type === FILTERS.PENDING) {
      setproducts(productsData.pending);
    } else if (type === FILTERS.REJECTED) {
      setproducts(productsData.rejected);
    } else {
      setproducts(productsData.all);
    }
  };

  const handleOpen = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActionType("");
    setSelectedId(null);
  };

  const handleConfirm = async () => {
    if (actionType === "approve") {
      console.log(`Approved product with ID: ${selectedId}`);
      // Add approve logic here
    } else if (actionType === "reject") {
      console.log(`Rejected product with ID: ${selectedId}`);
      // Add reject logic here
    }
    const admin = JSON.parse(sessionStorage.getItem("admin"));
    const data = {
      id: selectedId,
      status: actionType === "approve" ? "Approved" : "Rejected",
      approved_by: admin.loginUserId,
    };
    const url = `${api}/update_product`;
    setloading(true);
    const update = await UPDATE(token, url, data);
    setloading(false);
    if (update.response === 200) {
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg(
        `Product ${
          actionType === "approve" ? "approved" : "rejected"
        } succesfully.`
      );
      getProducts();
    } else if (update.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(update.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
    handleClose();
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Get products
  const getProducts = async () => {
    const url = `${api}/get_all_product`;
    const products = await GET(token, url);

    const productsData = products.data?.filter((product) => {
      if (product.status !== "New") {
        return product;
      }
      return false;
    });
    const transformedProducts = {
      all: productsData,
      approved: productsData.filter((product) => product.status === "Approved"),
      pending: productsData.filter((product) => product.status === "Pending"),
      rejected: productsData.filter((product) => product.status === "Rejected"),
    };

    setCounts(products.counts);
    setproducts(productsData);
    setproductsData(transformedProducts);
    setMainproducts(products.data);
    setFilter(FILTERS.ALL);
  };

  const column = useMemo(() => [
      { field: "id", headerName: "Id", width: 60 },
      {
        field: "image",
        headerName: "Image",
        width: 100,
        height: 100,
        renderCell: (params) =>
          params.row.image != null ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <img
                src={`${image}/${params.row.image}`}
                alt={params.row.image}
                height={"45px"}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <i class="fa-regular fa-image" style={{ fontSize: "22px" }}></i>
            </div>
          ),
      },

      { field: "title", headerName: "Title", width: 180 },
      { field: "qty_text", headerName: "Quantity", width: 100 },
      {
        field: "subscription",
        headerName: "Subscription Type",
        width: 140,
        renderCell: (params) => (
          <p>
            {params.row.subscription === 0
              ? "Non Subscription"
              : params.row.subscription === 1
              ? "Subscription"
              : params.row.subscription === null
              ? "N/A"
              : "N/A"}
          </p>
        ),
      },
      { field: "stock_qty", headerName: "Stock", width: 100 },
      {
        field: "price",
        headerName: "Price",
        width: 100,
        renderCell: (params) => {
          return <p>{params.row?.price?.toFixed(2) ?? "0.00"}</p>;
        },
      },
      {
        field: "mrp",
        headerName: "MRP",
        width: 100,
        renderCell: (params) => {
          return <p>{params.row?.mrp?.toFixed(2) ?? "0.00"}</p>;
        },
      },
      { field: "cat_title", headerName: "Category", width: 150 },
      { field: "sub_cat_title", headerName: "Sub Category", width: 150 },
      {
        field: "status",
        headerName: "Approval Status",
        width: 150,
      },
      {
        field: "Action",
        headerName: "Action",
        width: 200,
        renderCell: (params) => {
          return (
            <div style={{ display: "flex", gap: "10px" }}>
              {params.row.status === "Pending" && (
                <>
                  <button
                    className="approveBtn"
                    onClick={() => handleOpen(params.row.id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="rejectBtn"
                    onClick={() => handleOpen(params.row.id, "reject")}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          );
        },
      },
      {
        field: "view_product",
        headerName: "View Product",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(`/product/${params.row.id}`, {
                state: { isFrom: "productApproval" }, // <-- pass the flag here
              });
            }}
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        ),
      },
  ]);

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
            Product Approval
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
                      const subscriptionType =
                        obj.subscription === 0
                          ? "Non subscription"
                          : obj.subscription === 1
                          ? "Subscription"
                          : "N/A";

                      return [
                        obj.title,
                        obj.id,
                        obj.mrp,
                        obj.price,
                        obj.qty_text,
                        obj.stock_qty,
                        obj.cat_title,
                        obj.status,
                        obj.sub_cat_title,
                        subscriptionType,
                      ].some((val) => {
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
                  setproducts(
                    searchArrayByValue(
                      mainproducts,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {/* Tiles Section */}
        <Box className="title-menu">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Tile
                title="Approved"
                count={counts?.approved_count}
                color={colors.greenAccent[500]}
                onClick={() => handleTileClick(FILTERS.APPROVED)}
                isSelected={filter === FILTERS.APPROVED}
                isLoading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Tile
                title="Pending"
                count={counts?.pending_count}
                color={colors.redAccent[500]}
                onClick={() => handleTileClick(FILTERS.PENDING)}
                isSelected={filter === FILTERS.PENDING}
                isLoading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Tile
                title="Rejected"
                count={counts?.rejected_count}
                color={colors.blueAccent[500]}
                onClick={() => handleTileClick(FILTERS.REJECTED)}
                isSelected={filter === FILTERS.REJECTED}
                isLoading={loading}
              />
            </Grid>
          </Grid>
        </Box>

        {products ? (
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
              rows={products}
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
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography>{`Are you sure you want to ${
            actionType === "approve" ? "Approve" : "Reject"
          } this product?`}</Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handleClose}
              color="primary"
              size="small"
              variant="contained"
              style={{
                padding: "8px 16px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              color="secondary"
              variant="contained"
              size="small"
              style={{
                padding: "8px 16px",
              }}
            >
              Confirm
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default ProductsApproval;
