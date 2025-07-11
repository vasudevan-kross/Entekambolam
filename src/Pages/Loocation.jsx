import React, { useEffect, useMemo, useState } from "react";
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
import { ADD, DELETE, GET } from "../Functions/apiFunction";
import api from "../Data/api";
import "../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
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

function Loocation() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pincode, setpincode] = useState();
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
  const [title, settitle] = useState("");
  const [Id, setId] = useState("");

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const url = `${api}/get_available_delivery_location`;
      const subcat = await GET(token, url);
      setpincode(subcat.data);
    };
    getCat();
  }, [reFetch, token]);

  // add category
  const Addcat = async (e) => {
    e.preventDefault();
    const data = {
      title: title,
    };
    const url = `${api}/add_available_delivery_location`;
    setisUpdating(true);
    const addsubcat = await ADD(token, url, data);
    console.log(addsubcat);
    if (addsubcat.response === 200) {
      setisUpdating(false);
      handleSnakBarOpen();
      handleClose();
      setreFetch(!reFetch);
      setisUpdating(false);
      setalertType("success");
      setalertMsg("New Location added successfully");
    } else if (addsubcat.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg(addsubcat.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setisUpdating(false);
      setalertType("error");
      setalertMsg(addsubcat.response.data.message);
    }
  };

  // delete
  const deleteCat = async (e) => {
    e.preventDefault();
    var deleteData = JSON.stringify({
      id: Id,
    });
    const url = `${api}/delete_available_delivery_location`;
    setisUpdating(true);
    const deleteSub = await DELETE(token, url, deleteData);
    setisUpdating(false);
    console.log(deleteSub);

    if (deleteSub.response === 200) {
      handleDailogClose();
      handleClose();
      handleSnakBarOpen();
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

  const column = useMemo(
    () => [
      { field: "id", headerName: "id", width: 60 },

      { field: "title", headerName: "Location", width: 180 },
      {
        field: "created_at",
        headerName: "Created At",
        width: 220,
        renderCell: (params) =>
          moment(params.row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
      },
      {
        field: "Delete",
        headerName: "Delete",
        width: 100,
        renderCell: (params) => (
          <button
            class="dltBtn"
            onClick={() => {
              setId(params.row.id);
              settitle(params.row.title);
              handleDailogOpen();
            }}
          >
            <span class="icon">
              <i class="fa-solid fa-trash"></i>
            </span>
          </button>
        ),
      },
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
        <div style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center"
        }}>
          <GridToolbarExport
            color="secondary"
            sx={{ fontSize: "15px" }}
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
            settitle("");
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
            Manage Delivery Location
          </Typography>
        </Box>

        {pincode ? (
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
              rows={pincode}
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
            Add New Delivery Location
          </Typography>
          <Box component="form" onSubmit={Addcat} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              id="Title"
              label="Title"
              name="Title"
              value={title}
              size="small"
              color="secondary"
              onChange={(e) => {
                settitle(e.target.value);
              }}
            />

            <button className="AddBtn" type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <CircularProgress color="inherit" />
              ) : (
                "Add New Location"
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
        <DialogTitle id="alert-dialog-title">Delete Location</DialogTitle>
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

export default Loocation;
