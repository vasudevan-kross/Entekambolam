import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  CircularProgress,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  Switch,
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
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET, UPDATE } from "../Functions/apiFunction";
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

function Setting() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [setting, setsetting] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [reFetch, setreFetch] = useState(false);
  // eslint-disable-next-line
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isUpdating, setisUpdating] = useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  // update user state
  // eslint-disable-next-line
  const [Id, setId] = useState("");
  const [Title, setTitle] = useState();
  const [value, setvalue] = useState();
  const [valueType, setvalueType] = useState();

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const url = `${api}/get_settings`;
      const subcat = await GET(token, url);
      setsetting(subcat.data);
    };
    getCat();
  }, [reFetch, token]);

  // add category
  const UpdateSetting = async (e) => {
    e.preventDefault();
    const data = JSON.stringify({
      setting_id: Id,
      value: value,
    });
    const url = `${api}/update_settings`;
    setisUpdating(true);
    const addsubcat = await UPDATE(token, url, data);
    if (addsubcat.response === 200) {
      setisUpdating(false);
      handleSnakBarOpen();
      handleClose();
      setreFetch(!reFetch);
      setisUpdating(false);
      setalertType("success");
      setalertMsg("setting Updated");
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

  const column = useMemo(
    () => [
      { field: "setting_id", headerName: "Id", width: 60 },

      { field: "title", headerName: "Title", width: 220 },
      {
        field: "value",
        headerName: "Value",
        width: 220,
        renderCell: (params) => (
          <p>
            {params.row.value === "0"
              ? "False"
              : params.row.value === "1"
                ? "True"
                : params.row.value}
          </p>
        ),
      },
      {
        field: "updated_at",
        headerName: "Updated At",
        width: 220,
        renderCell: (params) =>
          params.row.updated_at === null
            ? "N/A"
            : moment(params.row.updated_at).format("DD-MM-YYYY HH:MM:SS"),
      },
      {
        field: "",
        headerName: "Update",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              setId(params.row.id);
              setvalue(params.row.value);
              setvalueType(params.row.value);
              setTitle(params.row.title);
              handleOpen();
            }}
          >
            <span class="icon">
              <i class="fa-regular fa-pen-to-square"></i>
            </span>
          </button>
        ),
      },
    ],
    []
  );

  // custom toolbar
  // function CustomToolbar() {
  //   return (
  //     <GridToolbarContainer
  //       sx={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //       }} style={{ marginBottom: "1rem" }}
  //     >
  //       <div style={{
  //         display: "flex",
  //         gap: "1rem",
  //         alignItems: "center"
  //       }}>
  //         <GridToolbarExport
  //           color="secondary"
  //           sx={{ fontSize: "15px", fontWeight: "600" }}
  //         />
  //         <Select
  //           sx={{
  //             width: "100px",
  //             height: "30px",
  //           }}
  //           color="primary"
  //           size="small"
  //           labelId="demo-select-small"
  //           id="demo-select-small"
  //           value={pageSize}
  //           label="Page Size"
  //           onChange={(e) => {
  //             setpageSize(e.target.value);
  //           }}
  //           className="TopPageBar"
  //         >
  //           <MenuItem value={10}>10</MenuItem>
  //           <MenuItem value={20}>20</MenuItem>
  //           <MenuItem value={25}>25</MenuItem>
  //           <MenuItem value={50}>50</MenuItem>
  //           <MenuItem value={100}>100</MenuItem>
  //         </Select>
  //       </div>
  //     </GridToolbarContainer>
  //   );
  // }

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
            Manage Settings
          </Typography>
        </Box>

        {setting ? (
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
              rows={setting}
              // components={{ Toolbar: CustomToolbar }}
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
            Update Setting
          </Typography>
          <Box component="form" onSubmit={UpdateSetting} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="Setting ID"
              label="Setting ID"
              name="Setting ID"
              autoComplete="text"
              autoFocus
              value={Id}
              size="small"
              disabled
              color="secondary"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="Title"
              label="Title"
              name="Title"
              autoComplete="text"
              autoFocus
              value={Title}
              size="small"
              disabled
              color="secondary"
            />

            {valueType === "0" || valueType === "1" ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>False</Typography>
                <Switch
                  color="secondary"
                  defaultChecked={value === "1"}
                  onChange={(e) => {
                    setvalue(value === "1" ? "0" : value === "0" ? "1" : "0");
                  }}
                />
                <Typography>True</Typography>
              </Stack>
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="Value"
                label="Value"
                name="Value"
                autoComplete="text"
                autoFocus
                value={value}
                size="small"
                onChange={(e) => {
                  setvalue(e.target.value);
                }}
                color="secondary"
              />
            )}

            <button className="AddBtn" type="submit" disabled={isUpdating}>
              {isUpdating ? <CircularProgress color="inherit" /> : "Update"}
            </button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Setting;
