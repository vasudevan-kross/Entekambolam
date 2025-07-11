import { useCallback, useEffect, useMemo, useState } from "react";
import { GET } from "../Functions/apiFunction";
import api from "../Data/api";
import {
  Alert,
  Box,
  Tooltip,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { tokens } from "../theme";
import { useTheme } from "@emotion/react";
import CartItemsModal from "../Components/CartItemsModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../Global/utils";
import moment from "moment/moment";
import logo from "../assets/a_logo.png";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function CartOrders() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [cartOrdersData, setCartOrders] = useState();
  const [mainCartOrdersData, setMainCartOrdersData] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("info");
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [selectedDate, setSelectedDate] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [openProductModal, setIsOpenProductModal] = useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const getCartOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `${api}/get_cart_orders`;

      if (selectedDate) {
        const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
        url += `?date=${formattedDate}`;
      }

      const result = await GET(token, url);

      if (result.response === 200) {
        setMainCartOrdersData(result.data);
        if (searchText.trim() !== "") {
          handleSearchAndFilter(searchText, result.data);
        }
        else {
          setCartOrders(result.data);
        }
        } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went wrong");
      }
    } catch (err) {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    getCartOrders();
  }, [getCartOrders, token]);

  const handleModalOpen = useCallback(async () => {
    // await getCartOrders();
    setIsOpenProductModal(true);
  }, [getCartOrders]);

  function handleModalClose() {
    setIsOpenProductModal(false);
  }

  const column = useMemo(
    () => [
      {
        field: "user_id",
        headerName: "User Id",
        width: 80,
        renderCell: (params) => params.value || "N/A",
      },
      {
        field: "name",
        headerName: "Name",
        width: 200,
        renderCell: (params) => (
          <Tooltip title={params.value || "N/A"}>
            <span
              style={{
                whiteSpace: "normal",
                overflowWrap: "break-word",
                display: "block",
                maxHeight: "4.5em",
                overflow: "hidden",
              }}
            >
              {params.value || "N/A"}
            </span>
          </Tooltip>
        ),
      },
      {
        field: "phone",
        headerName: "Number",
        width: 180,
        renderCell: (params) => params.value || "N/A",
      },
      {
        field: "email",
        headerName: "Email",
        width: 180,
        renderCell: (params) => (
          <Tooltip title={params.value || "N/A"}>
            <span
              style={{
                whiteSpace: "normal",
                overflowWrap: "break-word",
                display: "block",
                maxHeight: "4.5em",
                overflow: "hidden",
              }}
            >
              {params.value || "N/A"}
            </span>
          </Tooltip>
        ),
      },
      {
        field: "wallet_amount",
        headerName: "Wallet",
        width: 100,
        renderCell: (params) => params.value || "0.00",
      },
      {
        field: "updated_at",
        headerName: "Last Updated At",
        width: 180,
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
              setSelectedCartItems(params?.row?.cart_items || []);
              handleModalOpen();
            }}
          >
            <i class="fa-regular fa-eye"></i>
          </button>
        ),
      },
    ],
    [handleModalOpen]
  );

  const exportToCSV = () => {
    // Prepare the headers and data
    const headers = [
      "S.No",
      "User Id",
      "Name",
      "Number",
      "Products",
      "Email",
      "Wallet",
      "Last Updated At",
    ];

    const reversedCartOrdersData = [...cartOrdersData].reverse();

    const csvData = reversedCartOrdersData.map((row, index) => [
      index + 1,
      row.user_id,
      row.name,
      row.phone,
      row.cart_items
        ?.map((product) => `${product.product_title} (Qty ${product.quantity})`)
        .join(", "),
      row.email,
      row.wallet_amount,
      moment.utc(row.updated_at).local().format("DD-MM-YYYY HH:mm:ss"),
    ]);

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [headers, ...csvData];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cart Orders Report");

    // Set the filename and download
    XLSX.writeFile(
      workbook,
      `Cart_Orders_Report_${moment
        .utc(new Date())
        .local()
        .format("DD-MM-YYYY")}.csv`
    );
  };

  const exportToPDF = () => {
    // const dateRange = `Date Range: ${startDate} to ${endDate}`;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add the header text
    doc.setFontSize(18);
    const headerText = "Cart Orders Report";
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
        pageWidth - logoWidth - 15,
        10,
        logoWidth,
        logoHeight
      );

      // Set smaller font size for the date range text below header
      doc.setFontSize(12);

      // Define table headers with column names and configure column width
      const tableColumn = [
        { header: "S.No", dataKey: "sno" },
        { header: "User Id", dataKey: "user_id" },
        { header: "Name", dataKey: "name" },
        { header: "Number", dataKey: "phe_no" },
        { header: "Products", dataKey: "product" },
        { header: "Email", dataKey: "email" },
        { header: "Wallet", dataKey: "wallet_amt" },
        { header: "Last Update At", dataKey: "last_updated_at" },
      ];

      // Map table rows and format data as needed

      const reversedCartOrdersDatas = [...cartOrdersData].reverse();

      const tableRows = reversedCartOrdersDatas.map((row, index) => ({
        sno: index + 1,
        user_id: row.user_id,
        name: row.name,
        phe_no: row.phone,
        product: row.cart_items
          ?.map(
            (product) => `${product.product_title} (Qty ${product.quantity})`
          )
          .join(", "),
        email: row.email,
        wallet_amt: row.wallet_amount,
        last_updated_at: moment
          .utc(row.updated_at)
          .local()
          .format("DD-MM-YYYY HH:mm:ss"),
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
        margin: { left: 20 },
        headStyles: {
          fillColor: [0, 162, 51], // Orange background
          textColor: [255, 255, 255], // White text
          fontSize: 10, // Reduced font size for header
          lineWidth: 0.2, // Set border thickness for header
          halign: "center", // Center-align the table headers
        },
        bodyStyles: {
          font: "meera-regular-unicode-font-normal",
          lineWidth: 0.2, // Set border thickness for body cells
          lineColor: [0, 0, 0], // Black border color
        },
        styles: {
          fontSize: 10, // Adjust font size for table content
          cellPadding: 3, // Add padding to cells for better appearance
          lineWidth: 0.2, // General border thickness
          lineColor: [0, 0, 0], // General border color
        },
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
      doc.save(
        `Cart_Orders_Report_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

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
            disabled={cartOrdersData.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={cartOrdersData.length === 0}
          >
            Export to PDF
          </Button>
        </div>
      </GridToolbarContainer>
    );
  }

  const handleSearchAndFilter = (searchQuery = "" , cartData = mainCartOrdersData) => {
    let filteredData = cartData;
    if (searchQuery.trim() !== "") {
      filteredData = cartData
        .map((obj) => {
          const originalUpdatedAt = obj.updated_at;
          return {
            ...obj,
            updated_at_temp: moment
              .utc(obj.updated_at)
              .local()
              .format("DD-MM-YYYY HH:mm:ss"),
            originalUpdatedAt,
          };
        })
        .filter((obj) => {
          return Object.values(obj).some((val) => {
            if (typeof val === "string") {
              return val.toLowerCase().includes(searchQuery.toLowerCase());
            }
            if (typeof val === "number") {
              return val.toString().includes(searchQuery);
            }
            return false;
          });
        })
        .map((obj) => {
          const { originalUpdatedAt, updated_at_temp, ...rest } = obj;
          return {
            ...rest,
            updated_at: originalUpdatedAt,
          };
        });
    }

    setCartOrders(filteredData);
    setIsLoading(false);
  };

  const handleDateChange = (newValue) => {
    if (newValue instanceof Date && !isNaN(newValue)) {
      setSelectedDate(newValue);
    } else {
      setSelectedDate(null); // Optional: clear on invalid
    }
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchText(value);
    setTimeout(() => {
      handleSearchAndFilter(value);
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
          severity={alertType || "info"}
          sx={{ width: "100%" }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
      <Box sx={{ height: 600, width: "100%" }}>
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
            Cart Orders
          </Typography>
          <Box className="flex items-center flex-wrap" gap="1rem">
            <TextField
              // margin="normal"
              size="small"
              sx={{
                width: {
                  xs: "80%",
                  sm: "300px",
                  md: "500px",
                  marginTop: "16px",
                },
              }}
              id="Search"
              label="Search"
              name="Search"
              color="secondary"
              value={searchText}
              onChange={handleSearchChange}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                format="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params} fullWidth />}
                disabled={isLoading}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedDate(null);
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {!isLoading && cartOrdersData ? (
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
            {" "}
            <DataGrid
              sx={{ fontSize: "13px" }}
              columns={column}
              rows={cartOrdersData}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.user_id}
              localeText={{
                noRowsLabel: "No records found",
              }}
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={6} height={30} />
        )}
      </Box>
      <CartItemsModal
        cartItems={selectedCartItems}
        open={openProductModal}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default CartOrders;
