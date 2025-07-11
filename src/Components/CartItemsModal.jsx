import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import image from "../Data/image";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { tokens } from "../theme";
import LoadingSkeleton from "./LoadingSkeleton";

function CartItemsModal({ cartItems, open, onClose }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const column = useMemo(
    () => [
      { field: "product_id", headerName: "Product Id", width: 120 },
      {
        field: "product_image",
        headerName: "Image",
        width: 100,
        height: 100,
        renderCell: (params) =>
          params.row.product_image != null ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <img
                src={`${image}/${params.row.product_image}`}
                alt={params.row.product_image}
                height={"45px"}
              />
            </div>
          ) : (
            <i class="fa-regular fa-image" style={{ fontSize: "22px" }}></i>
          ),
      },

      { field: "product_title", headerName: "Title", width: 250 },
      { field: "category", headerName: "Category", width: 150 },
      { field: "subcategory", headerName: "Sub Category", width: 150 },
      { field: "product_mrp", headerName: "MRP", width: 100 },
      { field: "product_price", headerName: "Price", width: 100 },
      { field: "quantity", headerName: "Quantity", width: 100 },
      { field: "stock_qty", headerName: "Stock", width: 100 },
    ],
    []
  );

  // return (
  //   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
  //     <DialogTitle>Cart Items</DialogTitle>
  //     <DialogContent>
  //       {cartItems ? (
  //         <Box
  //           sx={{
  //             width: "100%",
  //             height: "400px", // Set a fixed height for the container
  //             paddingBottom: "30px",
  //             "& .MuiDataGrid-root": {
  //               border: "none",
  //             },
  //             "& .MuiDataGrid-cell": {
  //               borderBottom: "none",
  //             },
  //             "& .MuiDataGrid-row": {
  //               fontSize: "14px",
  //             },
  //             "& .name-column--cell": {
  //               color: colors.greenAccent[300],
  //             },
  //             "& .MuiDataGrid-columnHeaders": {
  //               backgroundColor: colors.navbarBG[400],
  //               borderBottom: "none",
  //               color: "#f5f5f5",
  //             },
  //             "& .MuiDataGrid-virtualScroller": {
  //               backgroundColor: colors.primary[400],
  //               borderBottom: "#000",
  //             },
  //             "& .MuiDataGrid-footerContainer": {
  //               borderTop: "none",
  //               backgroundColor: colors.navbarBG[400],
  //               color: "#f5f5f5 !important",
  //             },
  //             "& .MuiTablePagination-root": {
  //               color: "#f5f5f5 !important",
  //             },
  //             "& .MuiTablePagination-selectIcon": {
  //               color: "#f5f5f5 !important",
  //             },
  //             "& .MuiTablePagination-actions button": {
  //               color: "#f5f5f5 !important",
  //             },
  //             "& .MuiCheckbox-root": {
  //               color: `${colors.greenAccent[200]} !important`,
  //             },
  //           }}
  //         >
  //           <DataGrid
  //             sx={{ fontSize: "13px" }}
  //             columns={column}
  //             rows={cartItems}
  //             getRowId={(row) => row.product_id}
  //             hideFooter={true}
  //           />
  //         </Box>
  //       ) : (
  //         <Stack spacing={1}>
  //           {/* Skeleton Loading */}
  //           <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
  //           <Skeleton
  //             variant="rectangular"
  //             animation="wave"
  //             width={"100%"}
  //             height={30}
  //           />
  //           <Skeleton
  //             variant="rectangular"
  //             animation="wave"
  //             width={"100%"}
  //             height={30}
  //           />
  //           <Skeleton
  //             variant="rectangular"
  //             animation="wave"
  //             width={"100%"}
  //             height={30}
  //           />
  //           <Skeleton
  //             variant="rectangular"
  //             animation="wave"
  //             width={"100%"}
  //             height={30}
  //           />
  //         </Stack>
  //       )}
  //     </DialogContent>

  //     <DialogActions>
  //       <Button onClick={onClose} color="primary">
  //         Close
  //       </Button>
  //     </DialogActions>
  //   </Dialog>
  // );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Cart Items
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {cartItems ? (
          <Box
            sx={{
              width: "100%",
              height: "400px", // Set a fixed height for the container
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
                backgroundColor: colors.navbarBG[400],
                borderBottom: "none",
                color: "#f5f5f5",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
                borderBottom: "#000",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.navbarBG[400],
                color: "#f5f5f5 !important",
              },
              "& .MuiTablePagination-root": {
                color: "#f5f5f5 !important",
              },
              "& .MuiTablePagination-selectIcon": {
                color: "#f5f5f5 !important",
              },
              "& .MuiTablePagination-actions button": {
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
              rowHeight={70}
              rows={cartItems}
              getRowId={(row) => row.product_id}
              hideFooter={true}
              localeText={{
                noRowsLabel: "No records found",
              }}
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={4} height={30} />
        )}
      </DialogContent>
      <DialogActions>{/* Remove the close button here */}</DialogActions>
    </Dialog>
  );
}

export default CartItemsModal;
