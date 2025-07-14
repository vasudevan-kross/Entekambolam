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
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment/moment";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { display, Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { ADD, DELETE, GET, UPDATE, UPLOAD } from "../Functions/apiFunction";
import api from "../Data/api";
import { updateCategory } from "../Redux/Store/CategorySlice";
import { useDispatch } from "react-redux";
import "../Styles/buttons.css";
import { DeleteOutline } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import image from "../Data/image";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import logo from "../assets/a_logo.png";
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

function Categories() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [categories, setcategories] = useState();
  const [mainCat, setmainCat] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [isAddModel, setisAddModel] = useState(false);
  const [dailogOpne, setdailogOpne] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [reFetch, setreFetch] = useState(false);
  const [img, setimg] = useState();
  const [imgAdd, setimgAdd] = useState();
  const [uploadImage, setuploadImage] = useState();
  const [deleting, setdeleting] = useState(false);
  const [imgId, setimgId] = useState();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDailogOpen = () => setdailogOpne(true);
  const handleDailogClose = () => setdailogOpne(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isUpdating, setisUpdating] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  // update user state
  const [title, settitle] = useState("");
  const [Id, setId] = useState("");
  const [displayOrder, setdisplayOrder] = useState(0);

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const url = `${api}/get_cat`;
      const subcat = await GET(token, url);
      setcategories(subcat.data);
      setmainCat(subcat.data);
      dispatch(updateCategory(subcat.data));
    };
    getCat();
  }, [reFetch, token, dispatch]);

  // Update Product

  const update = async (e) => {
    e.preventDefault();
    if (parseInt(displayOrder) !== 0) {
      const duplicate = categories?.find(
        (cat) =>
          parseInt(cat.display_order) === parseInt(displayOrder) &&
          cat.id !== Id
      );
      if (duplicate) {
        setalertType("error");
        setalertMsg(
          `Display Order already in use by another category(${duplicate.title})`
        );
        handleSnakBarOpen();
        return;
      }
    }

    var data = JSON.stringify({
      id: Id,
      title: title,
      display_order: displayOrder,
    });
    const url = `${api}/update_cat`;
    setisUpdating(true);
    const update = await UPDATE(token, url, data);
    console.log(update);

    if (update.response === 200) {
      if (uploadImage) {
        let UploadUrl = `${api}/cat/upload_image`;
        let uploadData = {
          image: uploadImage,
          image_type: 1,
          id: Id,
        };
        await UPLOAD(token, UploadUrl, uploadData);
      }
      setisUpdating(false);
      handleClose();
      handleSnakBarOpen();
      setimgAdd();
      setreFetch(!reFetch);
      setalertType("success");
      setSearchValue("");
      setalertMsg("Updated successfully");
    } else if (update.response === 201) {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(update.message);
    } else {
      setisUpdating(false);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  // add category
  const Addcat = async (e) => {
    e.preventDefault();
    if (parseInt(displayOrder) !== 0) {
      const duplicate = categories?.find(
        (cat) => parseInt(cat.display_order) === parseInt(displayOrder)
      );
      if (duplicate) {
        setalertType("error");
        setalertMsg(
          `Display Order already in use by another category(${duplicate.title})`
        );
        handleSnakBarOpen();
        return;
      }
    }
    const data = JSON.stringify({
      title: title,
      display_order: displayOrder,
    });
    const url = `${api}/add_cat`;
    setisUpdating(true);
    const addsubcat = await ADD(token, url, data);
    console.log(addsubcat);

    if (addsubcat.response === 200) {
      if (uploadImage) {
        let UploadUrl = `${api}/cat/upload_image`;
        let uploadData = {
          image: uploadImage,
          image_type: 1,
          id: addsubcat.id,
        };
        await UPLOAD(token, UploadUrl, uploadData);
      }
      setisUpdating(false);
      handleSnakBarOpen();
      handleClose();
      setimgAdd();
      setreFetch(!reFetch);
      setisUpdating(false);
      setalertType("success");
      setSearchValue("");
      setalertMsg("New Category added successfully");
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
    const url = `${api}/delete_cat`;
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
      setalertMsg(
        "This Category has already been associated with some Sub Categories"
      );
    }
  };

  // delete image
  const deleteFile = async (id) => {
    const url = `${api}/cat/delete_image`;
    const data = {
      id: id,
    };
    setdeleting(true);
    const deleteImg = await DELETE(token, url, data);
    setdeleting(false);
    if (deleteImg.response === 200) {
      setreFetch(!reFetch);
      handleSnakBarOpen();
      setalertType("success");
      handleClose();
      setalertMsg(deleteImg.message);
    } else if (deleteImg.response === 201) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(deleteImg.message);
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
  };

  const exportToCSV = () => {
    const headers = ["S.No", "Title","Display Order", "Last Update"];

    const reversedCategories = [...categories].reverse();

    const csvData = reversedCategories.map((row, index) => [
      index + 1,
      row.title,
      row.display_order,
      moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories Reports");

    const fileName = `Categories_Reports_${moment
      .utc(new Date())
      .local()
      .format("DD-MM-YYYY")}.csv`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Categories Reports";
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
        { header: "S.No", dataKey: "sno" },
        { header: "Title", dataKey: "title" },
        { header: "Display Order", dataKey: "displayOrder" },
        { header: "Last Update", dataKey: "lastUpdate" },
      ];

      const reversedCategories = [...categories].reverse();

      const tableRows = reversedCategories.map((row, index) => ({
        sno: index + 1,
        title: row.title,
        displayOrder: row.display_order,
        lastUpdate: moment
          .utc(row.updated_at)
          .local()
          .format("DD-MM-YYYY HH:mm:ss"),
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [row.sno, row.title, row.displayOrder, row.lastUpdate]),
        startY: tableStartY,
        margin: { left: 20 },
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellWidth: "auto",
          cellPadding: 3,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
          textColor: [255, 255, 255], // White text
          fontSize: 11,
          fontStyle: 'bold',
          halign: "center",
          valign: "middle", // Vertically aligns text in the center
          overflow: "linebreak", // Enables word wrapping
        },
        bodyStyles: {
          fontSize: 10,
          font: "meera-regular-unicode-font-normal",
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          halign: "left",
          valign: "middle",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
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
        `Categories_Reports_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  const column = useMemo(
    () => [
      { field: "id", headerName: "Id", width: 100 },
      {
        field: "image",
        headerName: "Image",
        width: 120,
        height: 100,
        renderCell: (params) =>
          params.row.image != null ? (
            <img
              src={`${image}/${params.row.image}`}
              alt={params.row.image}
              width={"45px"}
            />
          ) : (
            <i class="fa-regular fa-image" style={{ fontSize: "22px" }}></i>
          ),
      },
      { field: "title", headerName: "Title", width: 380 },
      { field: "display_order", headerName: "Display Order", width: 100 },
      {
        field: "updated_at",
        headerName: "Last Update",
        width: 280,
        renderCell: (params) =>
          moment
            .utc(params.row.updated_at)
            .local()
            .format("DD-MM-YYYY HH:mm:ss"),
      },
      {
        field: "Update",
        headerName: "Update",
        width: 140,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              setisAddModel(false);
              settitle(params.row.title);
              setId(params.row.id);
              setdisplayOrder(params.row.display_order);
              setimg(
                params.row.image != null && `${image}/${params.row.image}`
              );
              setimgId(params.row.image_id && params.row.image_id);
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
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
        style={{ marginBottom: "1rem" }}
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
            disabled={categories.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={categories.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            settitle("");
            setimgAdd();
            setdisplayOrder(0);
            setisAddModel(true);
            handleOpen();
            setimg("");
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
            Manage Categories
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
              value={searchValue}
              color="secondary"
              onChange={(e) => {
                e.preventDefault();
                setSearchValue(e.target.value);
                setTimeout(() => {
                  function searchArrayByValue(arr, searchQuery) {
                    return arr
                      .map((obj) => {
                        const originalUpdatedAt = obj.updated_at;
                        return {
                          ...obj,
                          updated_at_temp: moment
                            .utc(obj.updated_at)
                            .local()
                            .format("DD-MM-YYYY HH:mm:ss"),
                          originalUpdatedAt, // Keep the original date
                        };
                      })
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
                      .map((obj) => {
                        // Revert the `updated_at` back to its original format
                        const { originalUpdatedAt, updated_at_temp, ...rest } =
                          obj; // Extract fields
                        return {
                          ...rest,
                          updated_at: originalUpdatedAt, // Restore the original format
                        };
                      });
                  }
                  setcategories(
                    searchArrayByValue(mainCat, e.target.value.toLowerCase())
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {categories ? (
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
              rows={categories}
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
            {isAddModel ? "Add New Category" : "Update Categories"}
          </Typography>
          {isAddModel ? (
            <Box component="form" onSubmit={Addcat} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="Title"
                label="Title"
                name="Title"
                autoComplete="text"
                autoFocus
                value={title}
                size="small"
                color="secondary"
                onChange={(e) => {
                  settitle(e.target.value);
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="Display order"
                label="Display order"
                color="secondary"
                name="Display order"
                type="number"
                autoFocus
                value={displayOrder}
                size="small"
                inputProps={{ min: 1 }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || Number(value) >= 1) {
                    setdisplayOrder(value);
                  }
                }}
              />
              <input
                style={{
                  marginTop: "20px",
                  padding: "8px 4px",
                  border: "1px solid #0000003b",
                  width: "100%",
                  borderRadius: "8px",
                }}
                type="file"
                name="image"
                id="image"
                className="imageInput"
                accept=".png, .jpg, .jpeg"
                color="secondary"
                onChange={(e) => {
                  if (e.target.files[0].size / 1024 >= 2048) {
                    alert("file size must be less then 2mb");
                  }
                  if (
                    e.target.files &&
                    e.target.files[0] &&
                    e.target.files[0].size / 1024 <= 2048
                  ) {
                    setimgAdd(URL.createObjectURL(e.target.files[0]));
                    setuploadImage(e.target.files[0]);
                  }
                }}
              />
              {imgAdd && (
                <img
                  src={imgAdd}
                  alt={imgAdd}
                  style={{ width: "100px", height: "auto", marginTop: "20px" }}
                />
              )}

              <Button
                color="update"
                variant="contained"
                type="submit"
                disabled={isUpdating}
                sx={{ mt: 2, fontWeight: "700", width: "100%" }}
              >
                {isUpdating ? (
                  <CircularProgress color="inherit" />
                ) : (
                  "Add New Catagory"
                )}
              </Button>
            </Box>
          ) : (
            <>
              {" "}
              <Box component="form" onSubmit={update} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Title"
                  label="Title"
                  color="secondary"
                  name="Title"
                  autoComplete="text"
                  autoFocus
                  value={title}
                  size="small"
                  onChange={(e) => {
                    settitle(e.target.value);
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  color="secondary"
                  name="id"
                  label="Id"
                  type="Id"
                  id="Id"
                  value={Id}
                  disabled
                  size="small"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="Display order"
                  label="Display order"
                  color="secondary"
                  name="Display order"
                  type="number"
                  autoFocus
                  value={displayOrder}
                  size="small"
                  inputProps={{ min: 1 }}
                  onChange={(e) => {                  
                    const value = e.target.value;
                    if (value === '' || Number(value) >= 1) {
                      setdisplayOrder(value);
                    }
                  }}
                />
                {!imgId && (
                  <input
                    style={{
                      marginTop: "20px",
                      padding: "8px 4px",
                      border: "1px solid #0000003b",
                      width: "100%",
                      borderRadius: "8px",
                    }}
                    type="file"
                    name="image"
                    id="image"
                    className="imageInput"
                    accept=".png, .jpg, .jpeg"
                    color="secondary"
                    onChange={(e) => {
                      if (e.target.files[0].size / 1024 >= 2048) {
                        alert("file size must be less then 2mb");
                      }
                      if (
                        e.target.files &&
                        e.target.files[0] &&
                        e.target.files[0].size / 1024 <= 2048
                      ) {
                        setimg(URL.createObjectURL(e.target.files[0]));
                        setuploadImage(e.target.files[0]);
                      }
                    }}
                  />
                )}
                {img && (
                  <div
                    className="img"
                    style={{
                      position: "relative",
                      marginTop: "20px",
                      width: "100px",
                    }}
                  >
                    <img
                      src={img}
                      alt={img}
                      style={{
                        width: "100px",
                        height: "auto",
                      }}
                    />
                    {imgId && (
                      <button
                        onClick={() => {
                          deleteFile(imgId);
                        }}
                        type="button"
                        style={{
                          position: "absolute",
                          top: "-5px",
                          right: "-5px",
                          height: "30px",
                          padding: "0 10px",
                          border: "none",
                          borderRadius: "5px",
                          backgroundColor: "#d32f2f",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {deleting ? (
                          <CircularProgress size={10} color="white" />
                        ) : (
                          <DeleteOutline sx={{ fontSize: "16px" }} />
                        )}
                      </button>
                    )}
                  </div>
                )}

                <div
                  className="bttns"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button
                    onClick={handleDailogOpen}
                    variant="contained"
                    sx={{ mt: 3, mb: 2, fontWeight: "700", width: "43%" }}
                    color="error"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <CircularProgress /> : "Delete"}
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      fontWeight: "700",
                      color: "#fff",
                      width: "43%",
                    }}
                    color="update"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <CircularProgress /> : "Update"}
                  </Button>
                </div>
              </Box>
            </>
          )}
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
        <DialogTitle id="alert-dialog-title">Delete Category</DialogTitle>
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
          <Button
            onClick={handleDailogClose}
            color="primary"
            variant="contained"
            size="small"
          >
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

export default Categories;
