import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  TextField,
  CircularProgress,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  Snackbar,
  Backdrop,
  Typography,
  Autocomplete,
} from "@mui/material";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import moment from "moment/moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";

import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import api from "../../Data/api";
import "../../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { addDays, format } from "date-fns";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { DELETE, GET } from "../../Functions/apiFunction";
import { DateRangePicker } from "react-date-range";
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

const defaultStartDate = format(
  new Date(new Date().setDate(new Date().getDate() - 7)),
  "yyyy-MM-dd"
);
const defaultEndDate = format(new Date(), "yyyy-MM-dd");

function AssignDeliveryOrders() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [deliveryExecutiveOrders, setDeliveryExectiveOrders] = useState();
  const [allDeliveryExecutiveOrders, setAllDeliveryExecutiveOrders] =
    useState();
  const [pageSize, setpageSize] = useState(20);

  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [reFetch, setreFetch] = useState(false);
  const [backdropOpen, setbackdropOpen] = useState(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [startDate, setstartDate] = useState(defaultStartDate);
  const [endDate, setendDate] = useState(defaultEndDate);
  const [isDateRange, setisDateRange] = useState(false);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: addDays(new Date(), -7),
      key: "selection",
    },
  ]);
  const [filterType, setFilterType] = useState("all");

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  // update user state

  const handleDeleteDialogClose = () => {
    setSelectedId("");
    setOrderNumber("");
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    getdeliveryOrders(true);
  }, [reFetch, token]);

  const getdeliveryOrders = async (isDateRangeSearch = false) => {
    try {
      setIsLoading(true);
      const url =
        isDateRangeSearch && startDate && endDate
          ? `${api}/get_delivery_executive_orders/${startDate}/${endDate}`
          : defaultStartDate && defaultEndDate ? `${api}/get_delivery_executive_orders/${defaultStartDate}/${defaultEndDate}`
          : `${api}/get_delivery_executive_orders`;
      // isDateRangeSearch && handleBackDropOpen();
      const deliveryOrders = await GET(token, url);
      if (deliveryOrders.response === 200) {
        const transformedOrders = deliveryOrders.data.map((item) => {
          const subscription_text = Utils.getSubscriptionType(
            item.subscription_type
          );
          return {
            id: item.id,
            order_number: item.order_number,
            prodcut_title: item.prodcut_title,
            product_detail: JSON.parse(item.product_detail)
              ?.map((product) => product.product_title)
              .join(", "),
            subscription_type: item.subscription_type,
            subscription_text:
              subscription_text === "N/A" ? "BuyOnce" : subscription_text,
            order_amount: parseFloat(item.order_amount)?.toFixed(2),
            delivery_executive: `${item.executive_number} - ${item.delivery_boy_name}`,
            delivery_executive_id: item.delivery_executive_id,
            assigned_date: moment(item?.assigned_date)
              .local()
              .format("DD-MM-YYYY"),
          };
        });
        setAllDeliveryExecutiveOrders(transformedOrders || []);
        const filteredOrders =
          filterType === "all"
            ? transformedOrders || []
            : transformedOrders?.filter((order) => {
                if (filterType === "buyonce") return !order.subscription_type;
                if (filterType === "subscription")
                  return !!order.subscription_type;
                return order.subscription_type === filterType;
              });
              
              let filteredData = filteredOrders; 
              if (searchText.trim() !== "") {
                filteredData = filteredOrders.filter((obj) => {
                  return Object.values(obj).some((val) => {
                    if (typeof val === "string") {
                      return val.toLowerCase().includes(searchText.toLowerCase());
                    }
                    if (typeof val === "number") {
                      return val.toString().toLowerCase().includes(searchText.toLowerCase());
                    }
                    return false;
                  });
                });
              }
        setDeliveryExectiveOrders(filteredData);

        // isDateRangeSearch && handleBackDropClose();
      } else {
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went wrong");
        // isDateRangeSearch && handleBackDropClose();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "Order Number#", width: 180 },
      {
        field: "title",
        headerName: "Product",
        width: 180,
        valueGetter: (params) =>
          params.row.subscription_type !== null
            ? params.row.prodcut_title
            : params.row.product_detail,
      },
      {
        field: "subscription_text",
        headerName: "Subscription Type",
        width: 140,
      },
      { field: "order_amount", headerName: "Amount", width: 150 },
      {
        field: "delivery_executive",
        headerName: "Delivery Executive",
        width: 180,
      },
      {
        field: "assigned_date",
        headerName: "Delivery Date",
        width: 220,
      },
      {
        field: "Edit",
        headerName: "Edit",
        width: 100,
        renderCell: (params) => (
          <button
            className="updateBtn"
            onClick={() => {
              const executiveId = params.row?.delivery_executive_id;
              executiveId &&
                navigate(
                  `/AssignExecutiveOrders?executiveId=${executiveId}&assigned_date=${params.row?.assigned_date}`
                );
            }}
          >
            <span className="icon">
              <i className="fa-regular fa-pen-to-square"></i>
            </span>
          </button>
        ),
      },
      // {
      //   field: "Delete",
      //   headerName: "Delete",
      //   width: 100,
      //   renderCell: (params) => (
      //     <button
      //       className="dltBtn"
      //       onClick={() => {
      //         setSelectedId(params.row?.id);
      //         setOrderNumber(params.row?.order_number);
      //         setDeleteDialogOpen(true);
      //       }}
      //     >
      //       <span className="icon">
      //         <i className="fa-solid fa-trash"></i>
      //       </span>
      //     </button>
      //   ),
      // },
    ],
    []
  );

  const exportToCSV = () => {
    const headers = [
      "Order Number#",
      "Product",
      "Subscription Type",
      "Amount",
      "Delivery Executive",
      "Delivery Date",
    ];

    const reversedRequest = [...deliveryExecutiveOrders].reverse();

    const csvData = reversedRequest.map((row, index) => [
      row.order_number,
      row.subscription_type !== null ? row.prodcut_title : row.product_detail,
      row.subscription_text,
      row.order_amount,
      row.delivery_executive || "--",
      row.assigned_date,
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Assign_deliveries Report"
    );

    const fileName = `Assign_deliveries${moment
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
    const headerText = "Assign Deliveries";
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
        { header: "Order Number#", dataKey: "ordernum" },
        { header: "Product", dataKey: "product" },
        { header: "Subscription Type", dataKey: "sub_type" },
        { header: "Amount", dataKey: "order_amount" },
        { header: "Delivery Executive", dataKey: "delexec" },
        { header: "Delivery Date", dataKey: "deldate" },
      ];

      const reversedRequests = [...deliveryExecutiveOrders].reverse();

      const tableRows = reversedRequests.map((row, index) => ({
        ordernum: row.order_number,
        product:
          row.subscription_type !== null
            ? row.prodcut_title
            : row.product_detail,
        sub_type: row.subscription_text,
        order_amount: row.order_amount,
        delexec: row.delivery_executive || "--",
        deldate: row.assigned_date,
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.ordernum,
          row.product,
          row.sub_type,
          row.order_amount,
          row.delexec,
          row.deldate,
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
        `Assign_deliveries${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  const handleDelete = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      if (!selectedId) {
        handleDeleteDialogClose();
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Empty executive id to delete");
        return;
      }
      const deleteData = JSON.stringify({
        id: selectedId,
      });
      const url = `${api}/delete_delivery_executive_order`;
      const deleteResponse = await DELETE(token, url, deleteData);

      if (deleteResponse.response === 200) {
        handleDeleteDialogClose();
        handleSnakBarOpen();
        setalertType("success");
        setalertMsg("Successfully Deleted");
        setreFetch(!reFetch);
      } else {
        handleDeleteDialogClose();
        handleSnakBarOpen();
        setalertType("error");
        setalertMsg("Something went Wrong! Please Try Again");
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ marginBottom: "1rem" }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
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
            disabled={deliveryExecutiveOrders.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={deliveryExecutiveOrders.length === 0}
          >
            Export to PDF
          </Button>
        </div>
        {/* <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <GridToolbarExport color="secondary" sx={{ fontSize: "15px" }} />
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
        </div> */}

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/AssignExecutiveOrders");
          }}
        >
          {" "}
          Assign Deliveries
          <div class="icon">
            <i class="fa-regular fa-plus"></i>
          </div>
        </button>
      </GridToolbarContainer>
    );
  }

  function handleSearchAndFilter(searchQuery, selectedFilter) {
    let filteredData = allDeliveryExecutiveOrders || [];

    // 1. Apply filter first
    if (selectedFilter !== "all") {
      filteredData = filteredData.filter((order) => {
        if (selectedFilter === "buyonce") return !order.subscription_type;
        if (selectedFilter === "subscription") return !!order.subscription_type;
        return order.subscription_type === selectedFilter;
      });
    }

    // 2. Apply search
    if (searchQuery) {
      filteredData = filteredData.filter((obj) => {
        return Object.values(obj).some((val) => {
          if (typeof val === "string") {
            return val.toLowerCase().includes(searchQuery.toLowerCase());
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

    setDeliveryExectiveOrders(filteredData);
  }

  const filterOptions = [
    { label: "All", value: "all" }, // 👈 Add this
    { label: "Buyonce", value: "buyonce" },
    { label: "Subscription (All)", value: "subscription" },
    { label: "One Time", value: 1 },
    { label: "Weekly", value: 2 },
    { label: "Monthly", value: 3 },
    { label: "Alternative Days", value: 4 },
  ];

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
            Assign Deliveries
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
              onChange={(e) => {
                const searchValue = e.target.value;
                setSearchText(searchValue);
                setTimeout(() => {
                  handleSearchAndFilter(searchValue, filterType);
                }, 500);
              }}
            />
            <Autocomplete
              margin="normal"
              size="small"
              options={filterOptions}
              fullWidth
              disableClearable={filterType === "all"}
              value={
                filterOptions.find((opt) => opt.value === filterType) || null
              }
              onChange={(event, newValue) => {
                const selectedValue = newValue?.value || "all";
                setFilterType(selectedValue);
                handleSearchAndFilter(searchText, selectedValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Order Type" />
              )}
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
              value={
                startDate && endDate ? `${startDate} - ${endDate}` : "" // Only display value if both dates are set
              }
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
                getdeliveryOrders(true);
              }}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              sx={{ fontWeight: "700", color: "fff" }}
              color="primary"
              onClick={() => {
                setisDateRange(false);
                setstartDate(defaultStartDate);
                setendDate(defaultEndDate);
                setdateRange([
                  {
                    startDate: new Date(
                      new Date().setDate(new Date().getDate() - 7)
                    ),
                    endDate: new Date(),
                    key: "selection",
                  },
                ]);
                getdeliveryOrders(false);
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {!isLoading && deliveryExecutiveOrders ? (
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
              rows={deliveryExecutiveOrders}
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
          <DateRangePicker
            onChange={(item) => {
              setisDateRange(true);
              setstartDate(
                moment(item.selection.startDate).format("DD-MM-YYYY")
              );
              setendDate(moment(item.selection.endDate).format("DD-MM-YYYY"));
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
                  setstartDate(
                    moment(dateRange[0].startDate).format("DD-MM-YYYY")
                  );
                  setendDate(moment(dateRange[0].endDate).format("DD-MM-YYYY"));
                }
                handleClose();
              }}
            >
              Set
            </Button>
          </Box>
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">Delete Delivery Route</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
              Do you want to remove Order-{" "}
              <b>
                <span>{orderNumber}</span>
              </b>
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary" variant="contained" size="small">
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleDelete}
            autoFocus
            color="error"
          >
            {isLoading ? <CircularProgress /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 5 }}
        open={backdropOpen}
        onClick={handleBackDropClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default AssignDeliveryOrders;
