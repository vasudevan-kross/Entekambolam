import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  Snackbar,
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
import api from "../../Data/api";
import "../../Styles/buttons.css";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { DELETE, GET } from "../../Functions/apiFunction";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png"
import * as CONSTANTS from "../../Common/Constants";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

function AssignDeliveryRoutes() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [deliveryExecutiveRoutes, setDeliveryExectiveRoutes] = useState();
  const [alldeliveryExecutiveRoutes, setAllDeliveryExecutiveRoutes] =
    useState();
  const [pageSize, setpageSize] = useState(20);

  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [reFetch, setreFetch] = useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  // update user state

  const handleDeleteDialogClose = () => {
    setSelectedId("");
    setRouteName("");
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    const getdeliveryRoutes = async () => {
      try {
        const url = `${api}/get_delivery_executive_routes`;
        const deliveryRoutes = await GET(token, url);
        if (deliveryRoutes.response === 200) {
          const deliveryExecutiveRoutes = deliveryRoutes?.data.map((item) => ({
            id: item.delivery_executive_route?.id,
            route_name: item.delivery_route?.route_name,
            pincode: item.delivery_route?.pincode,
            delivery_executive: `${item.delivery_executive?.executive_id} - ${item.delivery_executive?.name}`,
            delivery_executive_id: item.delivery_executive?.id,
            city_name: item.delivery_route?.city_name,
            locations:
              item.delivery_route?.locations &&
              Array.isArray(item.delivery_route?.locations) &&
              item.delivery_route?.locations.length > 0
                ? item.delivery_route?.locations?.join(", ")
                : "N/A",
            max_customers: item.delivery_executive_route?.max_customers,
            max_orders: item.delivery_executive_route?.max_orders,
            priority: item.delivery_executive_route?.priority,
            latitude: null,
            longitude: null,
            is_active: item.delivery_route?.is_active,
            created_at: item.delivery_executive_route?.created_at,
            updated_at: moment(item.delivery_executive_route?.updated_at)
              .local()
              .format("DD-MM-YYYY HH:mm:ss"),
          }));
          setDeliveryExectiveRoutes(deliveryExecutiveRoutes || []);
          setAllDeliveryExecutiveRoutes(deliveryExecutiveRoutes || []);
        } else {
          handleSnakBarOpen();
          setalertType("error");
          setalertMsg("Something went wrong");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getdeliveryRoutes();
  }, [reFetch, token]);

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Executive Routes";
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
        { header: "Executive ID - Name", dataKey: "name" },
        { header: "Route Name", dataKey: "routename" },
        { header: "Pincode", dataKey: "pincode" },
        { header: "City", dataKey: "city" },
        { header: "Locations", dataKey: "location" },
        { header: "Max Customer", dataKey: "maxcustomer" },
        { header: "Max Orders", dataKey: "maxorder" },
        { header: "Priority", dataKey: "priority" },
        { header: "Last Updated", dataKey: "lastupdate" },
        { header: "Status", dataKey: "status" },
      ];

      const reversedRoutes = [...deliveryExecutiveRoutes].reverse();

      const tableRows = reversedRoutes.map((row, index) => ({
        name: row.delivery_executive,
        routename: row.route_name,
        pincode: row.pincode,
        city: row.city_name,
        location: row.locations,
        maxcustomer: row.max_customers != null ? row.max_customers : "N/A",
        maxorder: row.max_orders != null ? row.max_orders : "N/A",
        priority: row.priority != null ? row.priority : "N/A",
        lastupdate: row.updated_at,
        status: row.is_active ? "Active" : "In Active",
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.name,
          row.routename,
          row.pincode,
          row.city,
          row.location,
          row.maxcustomer,
          row.maxorder,
          row.priority,
          row.lastupdate,
          row.status
        ]),
        startY: tableStartY,
        margin: { left: 20 },
        styles: {
          fontSize: 10, // Adjust font size for table content  
        }, 
        columnStyles: {
          0: { cellWidth: 40 }, //name
          1: { cellWidth: 20 }, //Route name
          2: { cellWidth: 20 }, //Pincode
          3: { cellWidth: 30 }, //City
          4: { cellWidth: 45 }, //Location
          5: { cellWidth: 20 }, //Max customer
          6: { cellWidth: 20 }, //Max order
          7: { cellWidth: 20 }, //Priority
          8: { cellWidth: 30 }, //last update
          9: { cellWidth: 20 }, //status
        },
        headStyles: {
          fillColor: [0, 162, 51],  // Orange background
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

      doc.save(`Executive_Routes_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.pdf`);
    });
  };

  const exportToCSV = () => {
      const headers = ["Executive ID - Name","Route Name", "Pincode" ,"City", "Locations", "Max Customer", "Max Orders", "Priority" , "Last Updated"," Status"];
  
      const reversedRoutes = [...deliveryExecutiveRoutes].reverse();
  
      const csvData = reversedRoutes.map((row, index) => [
        row.delivery_executive,
        row.route_name,
        row.pincode,
        row.city_name,
        row.locations,   
        row.max_customers != null ? row.max_customers : "N/A",
        row.max_orders != null ? row.max_orders : "N/A",
        row.priority != null ? row.priority : "N/A",
        row.updated_at, 
        row.is_active  ? "Active" : "In Active",
      ]);
  
      const tempData = [headers, ...csvData];
  
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(tempData);
  
      XLSX.utils.book_append_sheet(workbook, worksheet, "Executive Routes Reports");
  
      const fileName = `Executive_Routes_${moment.utc(new Date()).local().format("DD-MM-YYYY")}.csv`;
      XLSX.writeFile(workbook, fileName);
    };

  const column = useMemo(
    () => [
      //   { field: "id", headerName: "ID", width: 60 },
      {
        field: "delivery_executive",
        headerName: "Executive ID - Name",
        width: 150,
      },
      { field: "route_name", 
        headerName: "Route Name", 
        width: 180,
       },
      { field: "pincode", headerName: "Pincode", width: 120 },
      { field: "city_name", headerName: "City", width: 180 },
      {
        field: "locations",
        headerName: "Locations",
        width: 220,
      },
      {
        field: "max_customers",
        headerName: "Max Customer",
        width: 100,
        renderCell: (params) => {
          return params.row?.max_customers !== null
            ? params.row?.max_customers
            : "N/A";
        },
      },
      {
        field: "max_orders",
        headerName: "Max Orders",
        width: 100,
        renderCell: (params) => {
          return params.row?.max_orders !== null
            ? params.row?.max_orders
            : "N/A";
        },
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 100,
        renderCell: (params) => {
          return params.row?.priority !== null ? params.row?.priority : "N/A";
        },
      },
      {
        field: "updated_at",
        headerName: "Last Updated",
        width: 220,
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 120,
        renderCell: (params) => {
          const isActive = params.row?.is_active;
          return (
            <span
              style={{
                color: isActive ? "green" : "red", // Green for Active, Red for Inactive
                fontWeight: "bold",
              }}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
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
                navigate(`/AssignExecutiveRoutes?executiveId=${executiveId}`);
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
      //         setRouteName(params.row?.route_name);
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
      const url = `${api}/delete_delivery_executive_route`;
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
        <div style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center"
                }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={exportToCSV}
                        disabled={deliveryExecutiveRoutes.length === 0}
                    > 
                        Export to CSV
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={exportToPDF}
                        disabled={deliveryExecutiveRoutes.length === 0}
                    >
                        Export to PDF
                    </Button>
                </div>

        <button
          class="cssbuttons-io-button"
          onClick={() => {
            navigate("/AssignExecutiveRoutes");
          }}
        >
          {" "}
          Add/ Update the Executive Routes
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
            Manage Executive Routes
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
                  setDeliveryExectiveRoutes(
                    searchArrayByValue(
                      alldeliveryExecutiveRoutes,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {deliveryExecutiveRoutes ? (
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
              rows={deliveryExecutiveRoutes}
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
              Do you want to remove route{" "}
              <b>
                <span>{routeName}</span>
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
    </div>
  );
}

export default AssignDeliveryRoutes;
