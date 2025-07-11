import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Select,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  Modal,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
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
import { GET, ADD } from "../Functions/apiFunction";
import api from "../Data/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProducts } from "../Redux/Store/productSlice";

import { tokens } from "../theme";
import image from "../Data/image";
import ImportProducts from "../Components/ImportProducts";
import * as CONSTANTS from "../Common/Constants";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import logo from "../assets/a_logo.png";
import Utils from "../Global/utils";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function Products() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [products, setproducts] = useState();
  const [mainproducts, setMainproducts] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [counts, setCounts] = useState();
  const [po_noArr, setPo_noArr] = useState(null);
  const [pi_noArr, setPi_noArr] = useState(null);
  const [selectedPoNo, setSelectedPoNo] = useState("");
  const [selectedPiNo, setSelectedPiNo] = useState("");

  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [LOADING, setLOADING] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState();
  const [stock, setStock] = useState("");
  const [commands, setCommands] = useState("");
  const [errors, setErrors] = useState({
    stock: false,
    commands: false,
    po_pi: false,
  });
  const [selectedOption, setSelectedOption] = useState("");
  const [currRowStock, setCurrRowStock] = useState();

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const dispatch = useDispatch();

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const Tile = ({ title, count, color }) => {
    return (
      <Box
        className="text-card-foreground shadow-sm rounded-lg"
        sx={{
          backgroundColor: color,
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{count}</Typography>
      </Box>
    );
  };

  useEffect(() => {
    // Get categoriues
    const getCat = async () => {
      const url = `${api}/get_all_product`;
      const products = await GET(token, url);
      setCounts(products.counts);
      setproducts(products.data);
      setMainproducts(products.data);
      dispatch(updateProducts(products.data));
    };
    getCat();
  }, [token, dispatch]);

  useEffect(() => {
    const getPoAndPiNumber = async () => {
      try {
        setLOADING(true);
        const url = `${api}/get_pi_and_po_number`;
        const response = await GET(token, url);
        if (response.status === 200) {
          setPo_noArr(response.data?.purchaseOrders);
          setPi_noArr(response.data?.purchaseInvoices);
        } else {
          console.log("No data Found");
        }
      } catch (error) {
        console.error("Error fetching Po_no Or Pi_no", error);
      } finally {
        setLOADING(false);
      }
    };
    getPoAndPiNumber();
  }, [api, token]);

  const column = useMemo(
    () => [
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
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <i class="fa-regular fa-image" style={{ fontSize: "22px" }}></i>
            </div>
          ),
      },

      { field: "title", headerName: "Title", width: 180 },
      { field: "qty_text", headerName: "Quantity", width: 100 },
      { field: "status", headerName: "Approval Status", width: 150 },
      {
        field: "is_active",
        headerName: "Status",
        width: 150,
        renderCell: (params) => (
          <span>{params.value === 1 ? "Active" : "Inactive"}</span>
        ),
      },
      {
        field: "subscription",
        headerName: "Subscription Type",
        width: 140,
        renderCell: (params) => (
          <p>
            {params.row.subscription === 0
              ? CONSTANTS.SUBSCRIPTION_TYPES.NON_SUBSCRIPTION
              : params.row.subscription === 1
                ? CONSTANTS.SUBSCRIPTION_TYPES.SUBSCRIPTION
                : params.row.subscription === null
                  ? CONSTANTS.NOT_APPLICABLE
                  : CONSTANTS.NOT_APPLICABLE}
          </p>
        ),
      },
      { field: "stock_qty", headerName: "Stock", width: 100 },
      {
        field: "price",
        headerName: "Price",
        width: 100,
        renderCell: (params) => <p>{params.row.price?.toFixed(2)}</p>,
      },

      {
        field: "mrp",
        headerName: "MRP",
        width: 100,
        renderCell: (params) => <p>{params.row.mrp?.toFixed(2)}</p>,
      },
      { field: "cat_title", headerName: "Category", width: 150 },
      { field: "sub_cat_title", headerName: "Sub Category", width: 150 },

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
        field: "updateStock",
        headerName: "Update Stock",
        width: 150,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              class="approveBtn"
              style={{ width: "100px" }}
              onClick={() => handleOpen(params.row.id, params.row.stock_qty)}
            >
              Update Stock
            </button>
          </div>
        ),
      },
      {
        field: "Action",
        headerName: "Action",
        width: 100,
        renderCell: (params) => (
          <button
            class="updateBtn"
            onClick={() => {
              navigate(`/product/${params.row.id}`);
            }}
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        ),
      },
    ],
    [navigate]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "ID",
      "Title",
      "Quantity",
      "Approval Status",
      "Status",
      "Subscription Type",
      "Stock",
      "Price",
      "MRP",
      "Category",
      "Sub Category",
      "Last Update",
    ];

    const reversedReports = [...products].reverse();

    const csvData = reversedReports
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((row, index) => {
        return [
          index + 1,
          row.id,
          row.title,
          row.qty_text,
          row.status,
          row.is_active === 1 ? "Active" : "Inactive",
          row.subscription === 0
            ? CONSTANTS.SUBSCRIPTION_TYPES.NON_SUBSCRIPTION
            : row.subscription === 1
              ? CONSTANTS.SUBSCRIPTION_TYPES.SUBSCRIPTION
              : row.subscription === null
                ? CONSTANTS.NOT_APPLICABLE
                : CONSTANTS.NOT_APPLICABLE,
          row.stock_qty,
          row.price?.toFixed(2) ?? "0.00",
          row?.mrp?.toFixed(2) ?? "0.00",
          row.cat_title,
          row.sub_cat_title,
          moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
        ];
      });

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Details");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Product_Details ${Utils.formatDateToDDMMYYYY(new Date())}.csv`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    });

    // Add the header text

    doc.setFontSize(18);
    const headerText = "Product Details";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerX, 20);

    // Load the logo and add it to the document
    Utils.getBase64FromImage(logo, (base64Logo) => {
      const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
      const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(
        base64Logo,
        "PNG",
        pageWidth - logoWidth - 10,
        10,
        logoWidth,
        logoHeight
      );

      // Set smaller font size for the date range text below header
      doc.setFontSize(12);

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "ID", dataKey: "id" },
        { header: "Title", dataKey: "title" },
        { header: "Quantity", dataKey: "qty" },
        { header: "Approval Status", dataKey: "approval_status" },
        { header: "Status", dataKey: "prd_status" },
        { header: "Subscription Type", dataKey: "sub_type" },
        { header: "Stock", dataKey: "stock" },
        { header: "Price", dataKey: "price" },
        { header: "MRP", dataKey: "mrp" },
        { header: "Category", dataKey: "cat" },
        { header: "Sub Category", dataKey: "sub_cat" },
        { header: "Last Update", dataKey: "last_update" },
      ];

      const reversedReports = [...products].reverse();

      // Map table rows and format data as needed
      const tableRows = reversedReports
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((row, index) => ({
          sno: index + 1,
          id: row.id,
          title: row.title,
          qty: row.qty_text,
          approval_status: row.status,
          prd_status: row.is_active === 1 ? "Active" : "Inactive",
          sub_type: row.subscription === 0
            ? CONSTANTS.SUBSCRIPTION_TYPES.NON_SUBSCRIPTION
            : row.subscription === 1
              ? CONSTANTS.SUBSCRIPTION_TYPES.SUBSCRIPTION
              : row.subscription === null
                ? CONSTANTS.NOT_APPLICABLE
                : CONSTANTS.NOT_APPLICABLE,
          stock: row.stock_qty,
          price: row.price?.toFixed(2) ?? "0.00",
          mrp: row?.mrp?.toFixed(2) ?? "0.00",
          cat: row.cat_title,
          sub_cat: row.sub_cat_title,
          last_update: moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
        }));

      const tableStartY = 10 + logoHeight + 6;

      // Your table configuration remains unchanged
      doc.addFont(
        "meera-regular-unicode-font-normal.ttf",
        "meera-regular-unicode-font-normal",
        "normal"
      );
      doc.setFont("meera-regular-unicode-font-normal");
      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => Object.values(row)),
        startY: tableStartY,
        margin: { left: 10 },
        halign: "center",
        styles: {
          fontSize: 10,
          cellWidth: "auto",
        },
        headStyles: {
          fillColor: [0, 162, 51], // green background
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
        columnStyles: {
          0: { cellWidth: 15 }, //S.no
          1: { cellWidth: 16 }, //id#
          2: { cellWidth: 60 }, //Title #
          3: { cellWidth: 25 }, //Quantity
          4: { cellWidth: 35 }, //Approval Statis
          5: { cellWidth: 25 }, //Status
          6: { cellWidth: 40 }, //Sub Type
          7: { cellWidth: 24 }, //Stock
          8: { cellWidth: 24 }, //Price
          9: { cellWidth: 24 }, //MRP
          10: { cellWidth: 40 }, //Category
          11: { cellWidth: 35 }, //Sub Category
          12: { cellWidth: 35 }, //Last Update
        },
        tableWidth: "wrap",
        showHead: "firstPage",
      });

      // After the table is completely generated, add the page numbers
      const totalPages = doc.internal.getNumberOfPages(); // Get total pages
      doc.setFontSize(9);
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Set the page context to the current page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageText = `Page ${i} of ${totalPages}`; // Format "Page X/Y"
        const marginRight = 15;
        const marginBottom = i === 1 ? 7 : 10;

        // Add page number at the bottom-right of the page
        doc.text(
          pageText,
          pageWidth - marginRight - doc.getTextWidth(pageText),
          pageHeight - marginBottom
        );
      }

      // Save the PDF
      doc.save(`Product_Details ${Utils.formatDateToDDMMYYYY(new Date())}.pdf`);
    });
  };

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
            disabled={products.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={products.length === 0}
          >
            Export to PDF
          </Button>
        </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/addproduct");
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

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (id, stock) => {
    setSelectedId(id);
    setStock("");
    setCurrRowStock(stock);
    setCommands("");
    setSelectedOption("");
    setSelectedPoNo("");
    setSelectedPiNo("");
    setErrors({ stock: false, commands: false, po_pi: false });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const isValidateStock = currRowStock + Number(stock.trim()) >= 0;
    if (!isValidateStock) {
      setalertType("error");
      setalertMsg("Entered stock can't be reduced below the actual stock");
      handleSnakBarOpen();
      return;
    }

    const isStockValid = stock.trim() !== "" && stock.trim() !== "0";
    const isCommandsValid = commands.trim() !== "";
    const is_Pi_Po_Valid =
      selectedOption === "" && !selectedPoNo && !selectedPiNo
        ? true
        : selectedOption === "po_no" && selectedPoNo.trim() !== ""
          ? true
          : selectedOption === "pi_no" && selectedPiNo.trim() !== ""
            ? true
            : false;

    if (isStockValid && isCommandsValid && is_Pi_Po_Valid) {
      setLOADING(true);
      try {
        const stockApproval = {
          product_id: selectedId,
          stock: stock.trim(),
          commands: commands.trim(),
          approved_by: admin.loginUserId,
          po_pi:
            selectedOption === ""
              ? null
              : selectedOption === "po_no"
                ? { key: "po_no", value: selectedPoNo }
                : { key: "pi_no", value: selectedPiNo },
        };

        const data = JSON.stringify(stockApproval);
        const url = `${api}/add_stockApproval`;

        const addStockApproval = await ADD(token, url, data);

        if (addStockApproval.response === 200) {
          setalertType("success");
          setalertMsg("New Product Stock Added successfully");
          handleSnakBarOpen();
          setOpen(false);
        } else {
          setalertType("error");
          setalertMsg(addStockApproval.message || "Error adding Product Stock");
          handleSnakBarOpen();
        }
      } catch (error) {
        console.error("Error adding stock approval:", error);
        setalertType("error");
        setalertMsg("An unexpected error occurred while adding stock.");
        handleSnakBarOpen();
      } finally {
        setLOADING(false);
        setOpen(false);
      }
    } else {
      setErrors({
        stock: !isStockValid,
        commands: !isCommandsValid,
        po_pi: !is_Pi_Po_Valid,
      });
    }
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
            Manage Products
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"32.33%"}
          >
            {/* <ImportProducts /> */}
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
                      .map((obj) => {
                        const exist_updated_at = obj.updated_at;
                        const exist_subscription = obj.subscription;
                        return {
                          ...obj,
                          updated_at_temp: moment
                            .utc(obj.updated_at)
                            .local()
                            .format("DD-MM-YYYY HH:mm:ss"),
                          exist_updated_at,
                          subscription_temp:
                            obj.subscription === 0
                              ? CONSTANTS.SUBSCRIPTION_TYPES.NON_SUBSCRIPTION
                              : obj.subscription === 1
                                ? CONSTANTS.SUBSCRIPTION_TYPES.SUBSCRIPTION
                                : obj.subscription === null
                                  ? CONSTANTS.NOT_APPLICABLE
                                  : CONSTANTS.NOT_APPLICABLE,
                          exist_subscription,
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
                        const {
                          exist_updated_at,
                          updated_at_temp,
                          subscription_temp,
                          exist_subscription,
                          ...rest
                        } = obj; // Extract fields
                        return {
                          ...rest,
                          updated_at: exist_updated_at,
                          subscription: exist_subscription,
                        };
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
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Total Products"
                count={counts?.total_products}
                color={colors.redAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Total Active Products"
                count={counts?.total_active_products}
                color={colors.greenAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Total Inactive Products"
                count={counts?.total_inactive_products}
                color={colors.blueAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Total Categories"
                count={counts?.total_categories}
                color={colors.greenAccent[500]}
              />
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <Tile
                title="Total Sub Categories"
                count={counts?.total_subcategories}
                color={colors.redAccent[500]}
              />
            </Grid>
          </Grid>
        </Box>

        {products && !LOADING ? (
          <Box
            className={`text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2 ${theme.palette.mode === "dark" ? "bg-darkcard" : "bg-card"
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
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography
            className=""
            variant="h4"
            component={"h4"}
            fontWeight={600}
            // fontSize={'1rem'}
            lineHeight={"2rem"}
            sx={{
              color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
            }}
          >
            Update Product Stock
          </Typography>
          <Divider style={{ margin: "1rem 0" }} />

          <TextField
            required
            fullWidth
            label="Stock"
            type="number"
            variant="outlined"
            sx={{ mb: 2 }}
            onChange={(e) => {
              setStock(e.target.value);
              setErrors((prev) => ({ ...prev, stock: false }));
            }}
            error={errors.stock}
            helperText={errors.stock ? "Stock is required" : ""}
          />

          <FormControl fullWidth sx={{ mb: 2, textAlign: "left" }}>
            <InputLabel id="optional-select-label">Type</InputLabel>
            <Select
              labelId="optional-select-label"
              value={selectedOption}
              label="Type"
              onChange={(e) => {
                setSelectedOption(e.target.value);
                setSelectedPoNo("");
                setSelectedPiNo("");
              }}
            >
              <MenuItem value="po_no">PO number</MenuItem>
              <MenuItem value="pi_no">PI number</MenuItem>
            </Select>
          </FormControl>

          {selectedOption && (
            <FormControl fullWidth sx={{ mb: 2, textAlign: "left" }}>
              <InputLabel id={`${selectedOption}-select-label`}>
                {selectedOption === "po_no" ? "PO Number*" : "PI Number*"}
              </InputLabel>
              <Select
                labelId={`${selectedOption}-select-label`}
                value={selectedOption === "po_no" ? selectedPoNo : selectedPiNo}
                label={selectedOption === "po_no" ? "PO Number" : "PI Number"}
                onChange={(e) => {
                  if (selectedOption === "po_no") {
                    setSelectedPoNo(e.target.value);
                    setErrors((prev) => ({ ...prev, po_pi: false }));
                  } else {
                    setSelectedPiNo(e.target.value);
                    setErrors((prev) => ({ ...prev, po_pi: false }));
                  }
                }}
              >
                {(selectedOption === "po_no"
                  ? po_noArr
                  : pi_noArr.filter((item) => item.pi_no !== null)
                ).map((item) => (
                  <MenuItem key={item.id} value={item.po_no || item.pi_no}>
                    {item.po_no || item.pi_no}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ color: "red" }}>
                {errors.po_pi
                  ? `choose ${selectedOption === "po_no" ? "PO Number" : "PI Number"
                  }`
                  : ""}
              </FormHelperText>
            </FormControl>
          )}

          <TextField
            required
            fullWidth
            label="Comments"
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
            onChange={(e) => {
              setCommands(e.target.value);
              setErrors((prev) => ({ ...prev, commands: false }));
            }}
            error={errors.commands}
            helperText={errors.commands ? "Comments are required" : ""}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <Button
              onClick={handleClose}
              color="primary"
              variant="contained"
              style={{
                width: "100%",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={LOADING}
              color="secondary"
              variant="contained"
              style={{
                width: "100%",
              }}
            >
              Submit
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default Products;
