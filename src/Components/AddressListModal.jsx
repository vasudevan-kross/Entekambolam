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
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { tokens } from "../theme";
import moment from "moment/moment";
import LoadingSkeleton from "./LoadingSkeleton";

function AddressListModal({ addressList, open, onClose }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      //   { field: "user_id", headerName: "User ID", width: 100 },
      //   { field: "name", headerName: "Name", width: 150 },
      { field: "s_phone", headerName: "Phone", width: 150 },
      {
        field: "flat_no",
        headerName: "Flat No",
        width: 150,
        renderCell: (params) =>
          params.row.flat_no ? params.row.flat_no : "N/A",
      },
      {
        field: "apartment_name",
        headerName: "Apartment Name",
        width: 180,
        renderCell: (params) =>
          params.row.apartment_name ? params.row.apartment_name : "N/A",
      },
      {
        field: "area",
        headerName: "Area",
        width: 180,
        renderCell: (params) => (params.row.area ? params.row.area : "N/A"),
      },
      {
        field: "landmark",
        headerName: "Landmark",
        width: 150,
        renderCell: (params) =>
          params.row.landmark ? params.row.landmark : "N/A",
      },
      {
        field: "city",
        headerName: "City",
        width: 150,
        renderCell: (params) => (params.row.city ? params.row.city : "N/A"),
      },
      {
        field: "pincode",
        headerName: "Pincode",
        width: 100,
        renderCell: (params) =>
          params.row.pincode ? params.row.pincode : "N/A",
      },
      {
        field: "coordinates",
        headerName: "Coordinates (Lat, Lng)",
        width: 180,
        renderCell: (params) => {
          const lat = params.row.lat;
          const lng = params.row.lng;
          return lat && lng ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                fontSize: "13px",
                lineHeight: "1.2",
              }}
            >
              <span>Lat: {lat}</span>
              <span>Lng: {lng}</span>
            </Box>
          ) : (
            "N/A"
          );
        },
      },
      {
        field: "created_at",
        headerName: "Created At",
        width: 180,
        renderCell: (params) =>
          moment
            .utc(params.row.created_at)
            .local()
            .format("DD-MM-YYYY hh:mm a"),
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        width: 180,
        renderCell: (params) =>
          moment
            .utc(params.row.updated_at)
            .local()
            .format("DD-MM-YYYY hh:mm a"),
      },
    ],
    []
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Address
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
        {addressList ? (
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
              sx={{ fontSize: "13px" }}
              columns={columns}
              rows={addressList}
              getRowId={(row) => row.id}
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

export default AddressListModal;
