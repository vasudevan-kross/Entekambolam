import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import api from "../../Data/api";
import { GET } from "../../Functions/apiFunction";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Modal,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import moment from "moment";
import { DateRangePicker } from "react-date-range";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";
import * as XLSX from "xlsx";
import image from "../../Data/image";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90vw",
    sm: "fit-content",
    md: "fit-content",
    lg: "fit-content",
    xl: "fit-content",
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 2,
  textAlign: "center",
};

const OrderProductList = () => {
  const tomorrow = moment().add(1, "days").toDate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isLoading, setIsLoading] = useState(false);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [pageSize, setpageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [mergedProducts, setMergedProducts] = useState([]);
  const [mergedProdutList, setMergedProductList] = useState([]);
  const [reFetch, setRefectch] = useState(false);
  const [startDate, setStartDate] = useState(
    moment(tomorrow).format("DD-MM-YYYY")
  );
  const [endDate, setEndDate] = useState(moment(tomorrow).format("DD-MM-YYYY"));
  const [isDateRange, setisDateRange] = useState(false);
  const [dateRange, setdateRange] = useState([
    {
      startDate: tomorrow,
      endDate: tomorrow,
      key: "selection",
    },
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    fetchOrders();
  }, [reFetch]);

  const fetchOrders = async () => {
    if (!startDate || !endDate) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Please select both start and end dates.");
      return;
    }

    setIsLoading(true);
    try {
      let url = `${api}/get_order_product_list?start_date=${startDate}&end_date=${endDate}`;
      if (selectedVendor) {
        url += `&vendor_id=${selectedVendor.vendor_id}`;
      }
      const response = await GET(token, url);

      if (response.response === 200) {
        if(searchValue.trim() !== ""){          
        const filtered = searchArrayByValue(response.data.merged_products, searchValue.toLowerCase());
        setMergedProducts(filtered);
        }else{
            setMergedProducts(response.data.merged_products);
        }
        setMergedProductList(response.data.merged_products);
        setVendors(response.data.vendor_details);
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Failed to fetch the products");
      }
    } catch (error) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("An error occurred while fetching products.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setisDateRange(false);
    setStartDate(moment(tomorrow).format("DD-MM-YYYY"));
    setEndDate(moment(tomorrow).format("DD-MM-YYYY"));
    setdateRange([
      {
        startDate: tomorrow,
        endDate: tomorrow,
        key: "selection",
      },
    ]);
    setRefectch((prev) => !prev);
  };

  const column = useMemo(
    () => [
      { field: "product_id", headerName: "Product ID", width: 180 },
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
      {
        field: "product_name",
        headerName: "Product Name",
        width: 180,
      },
      {
        field: "vendor_name",
        headerName: "Supplier Name",
        width: 180,
      },
      {
        field: "total_qty",
        headerName: "Total QTY",
        width: 140,
      },
    ],
    []
  );

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "flex-start",
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
            disabled={mergedProducts.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={mergedProducts.length === 0}
          >
            Export to PDF
          </Button>
        </div>
      </GridToolbarContainer>
    );
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = selectedVendor
      ? `Order Products - ${selectedVendor?.vendor_name}`
      : "Order Products";
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
        { header: "Product ID", dataKey: "product_id" },
        { header: "Product Name", dataKey: "product_name" },
        { header: "Supplier Name", dataKey: "vendor_name" },
        { header: "Total QTY", dataKey: "total_qty" },
      ];

      const reversedCategories = [...mergedProducts].reverse();

      const tableRows = reversedCategories.map((row, index) => ({
        sno: index + 1,
        product_id: row.product_id,
        product_name: row.product_name,
        vendor_name: row.vendor_name,
        total_qty: row.total_qty,
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.sno,
          row.product_id,
          row.product_name,
          row.vendor_name,
          row.total_qty,
        ]),
        startY: tableStartY,
        margin: { left: 20 },
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellWidth: "auto",
        },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
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
        `Order_Products_${
          selectedVendor ? selectedVendor?.vendor_name + "_" : ""
        }${moment(startDate, "DD-MM-YYYY").format("DD-MM-YYYY")}_to_${moment(
          endDate,
          "DD-MM-YYYY"
        ).format("DD-MM-YYYY")}.pdf`
      );
    });
  };
  const exportToCSV = () => {
    const headers = [
      "S.No",
      "Product ID",
      "Product Name",
      "Supplier Name",
      "Total QTY",
    ];

    const reversedCategories = [...mergedProducts].reverse();

    const csvData = reversedCategories.map((row, index) => [
      index + 1,
      row.product_id,
      row.product_name,
      row.vendor_name,
      row.total_qty,
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Products");

    const fileName = `Order_Products_${
      selectedVendor ? selectedVendor?.vendor_name + "_" : ""
    }${moment(startDate, "DD-MM-YYYY").format("DD-MM-YYYY")}_to_${moment(
      endDate,
      "DD-MM-YYYY"
    ).format("DD-MM-YYYY")}.csv`;
    XLSX.writeFile(workbook, fileName);
  };

  function searchArrayByValue(arr, searchQuery) {
    return arr?.filter((obj) => {
      return Object.values(obj).some((val) => {
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

  const handleSearchChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchValue(value);
    setTimeout(() => {
      const filteredOrders = searchArrayByValue(mergedProdutList, value.toLowerCase());
      setMergedProducts(filteredOrders);
    }, 500);
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
            Order Products
          </Typography>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={"1rem"}
            width={"55%"}
          >
            <TextField
              size="small"
              fullWidth
              sx={{ width: { xs: "80%", sm: "300px", md: "500px" } }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <Autocomplete
              id="vendor-autocomplete"
              options={vendors}
              getOptionLabel={(option) => option.vendor_name} // Display vendor name
              value={selectedVendor || null}
              onChange={(event, newValue) => {
                setSelectedVendor(newValue);
                setRefectch((prev) => !prev);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Supplier"
                  variant="outlined"
                  size="small"
                />
              )}
              fullWidth
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              id="outlined-basic"
              fullWidth
              label="Select Date Range"
              variant="outlined"
              autoComplete="off"
              size="small"
              color="secondary"
              onKeyDown={() => {
                return false;
              }}
              onClick={() => {
                handleOpen();
              }}
              value={startDate && endDate ? `${startDate} - ${endDate}` : ""}
            />
            <Button
              variant="contained"
              sx={{
                fontWeight: "700",
                color: "fff",
              }}
              color="secondary"
              disabled={!isDateRange}
              onClick={() => {
                fetchOrders();
              }}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              sx={{ fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </Box>
        {!isLoading && mergedProducts ? (
          <Box
            className="bg-card text-card-foreground shadow-sm rounded-lg height-calc p-4 xl:p-2"
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
              columns={column}
              rows={mergedProducts}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.product_id}
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
          <DateRangePicker
            onChange={(item) => {
              setisDateRange(true);
              setStartDate(
                moment(item.selection.startDate).format("DD-MM-YYYY")
              );
              setEndDate(moment(item.selection.endDate).format("DD-MM-YYYY"));
              setdateRange([item.selection]);
            }}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={dateRange}
            direction="vertical"
            scroll={{ enabled: true }}
          />
          <Box mt={5}>
            {" "}
            <Button
              fullWidth
              variant="contained"
              sx={{ height: "30px", fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={() => {
                if (!startDate) {
                  setisDateRange(true);
                  setStartDate(
                    moment(dateRange[0].startDate).format("DD-MM-YYYY")
                  );
                  setEndDate(moment(dateRange[0].endDate).format("DD-MM-YYYY"));
                }
                handleClose();
              }}
            >
              Set
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderProductList;
