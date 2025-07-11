import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  Select,
  TextField,
  Typography,
  useTheme,
  MenuItem,
  Snackbar,
  Alert,
  Modal,
  InputLabel,
  FormHelperText,
  Divider,
  FormControl,
  Button,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";

import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET, UPDATE } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import moment from "moment/moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Utils from "../../Global/utils";
import logo from "../../assets/a_logo.png";
import * as CONSTANTS from "../../Common/Constants";
import LoadingSkeleton from "../../Components/LoadingSkeleton";

function DeliveryReAssigneRequest() {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [reQuestReAssign, setReQuestReAssign] = useState();
  const [allReQuestReAssign, setAllReQuestReAssign] = useState();
  const [pageSize, setpageSize] = useState(20);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);
  const [isStateUpdated, setUpdatedState] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedExecutive, setselectedExecutive] = useState();
  const [exsistingExecutive, setExsistingExecutive] = useState();
  const [executiveList, setExecutiveList] = useState([]);
  const [assingnExecutiveModelOpen, setAssingnExecutiveModelOOpen] =
    useState(false);
  const [errors, setErrors] = useState({ executive: false });

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = () => {
    const getStockApprovalData = async () => {
      const url = `${api}/get_all_re_assigne_request_data`;
      const result = await GET(token, url);
      setReQuestReAssign(result.data);
      setAllReQuestReAssign(result.data);
      setUpdatedState(true);
    };
    getStockApprovalData();
  };

  const column = useMemo(
    () => [
      { field: "order_number", headerName: "Order Number#", width: 120 },
      { field: "customer_name", headerName: "Customer Name", width: 150 },
      { field: "customer_phone", headerName: "Ph. Number", width: 100 },
      { field: "customer_pincode", headerName: "Pincode", width: 70 },
      {
        field: "delivery_executive",
        headerName: "Assigned To",
        width: 250,
        renderCell: (params) => (
          <Tooltip
            title={
              `${params?.row.executive_number} - ${params?.row.delivery_boy_name}` ||
              "--"
            }
          >
            <span
              style={{
                whiteSpace: "normal",
                overflowWrap: "break-word",
                display: "block",
                maxHeight: "4.5em", // Adjust as needed
                overflow: "hidden",
              }}
            >
              {`${params?.row.executive_number} - ${params?.row.delivery_boy_name}` ||
                "--"}
            </span>
          </Tooltip>
        ),
      },
      {
        field: "assigned_date",
        headerName: "Delivery Date",
        width: 120,
        renderCell: (params) =>
          moment(params.row.assigned_date).local().format("DD-MM-YYYY"),
      },
      {
        field: "request_delivery_executive",
        headerName: "Reassign Request To",
        width: 250,
        renderCell: (params) =>
          params?.row.request_executive_number
            ? `${params?.row.request_executive_number} - ${params?.row.request_executive_name}`
            : "N/A",
      },
      {
        field: "Action",
        headerName: "Action",
        width: 400,
        renderCell: (params) => (
          <div style={{ display: "flex", gap: "10px" }}>
            {params?.row.request_executive_number && (
              <button
                class="AssignButton"
                style={{ backgroundColor: "green" }}
                onClick={() => handleOpen(params.row)}
              >
                {" Assign to Requested Executive "}
              </button>
            )}
            <button
              class="AssignButton"
              style={{ backgroundColor: "blue" }}
              onClick={() => handleAssignExecutiveModelOpen(params.row)}
            >
              {" Assign to other Executive's "}
            </button>
          </div>
        ),
      },
    ],
    [navigate, reQuestReAssign]
  );

  const handleAssignExecutiveModelOpen = async (row) => {
    // const url = `${api}/get_delivery_executive_by_order/${row?.order_id}`;
    const url = `${api}/get_all_executives`;
    setErrors({ executive: false });
    setExsistingExecutive(row);
    setUpdatedState(false);
    setSelectedId(row?.id);
    const executiveRes = await GET(token, url);
    if (executiveRes.response === 200) {
      const filteredData = executiveRes.data.filter(
        (a) => a.id !== row?.delivery_executive_id && a.is_active === 1
      );
      setExecutiveList(filteredData);
      setAssingnExecutiveModelOOpen(true);
      setUpdatedState(true);
    } else {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! to get the Executives");
    }
  };

  const handleSubmit = async () => {
    if (!selectedExecutive) {
      setErrors({ executive: true });
      return;
    }
    const data = {
      id: selectedId,
      selected_executive: selectedExecutive,
      exsisting_executive: exsistingExecutive,
    };
    const url = `${api}/delivery_re_assign_Order`;
    setUpdatedState(false);
    const update = await UPDATE(token, url, data);
    if (update.response === 200) {
      getAllData();
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("Order Reassigned succesfully.");
    } else if (update.response === 201) {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg(update.message);
    } else {
      setUpdatedState(true);
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something went Wrong! Please Try Again");
    }
    handleClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    const headerText = "Delivery Reassign Requests";
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
        { header: "Customer Name", dataKey: "customername" },
        { header: "Ph. Number", dataKey: "customerphone" },
        { header: "Pincode", dataKey: "customerpincode" },
        { header: "Assigned To", dataKey: "delexec" },
        { header: "Delivery Date", dataKey: "deldate" },
        { header: "Reassign Request To", dataKey: "reqdelexec" },
      ];

      const reversedRequests = [...reQuestReAssign].reverse();

      const tableRows = reversedRequests.map((row, index) => ({
        ordernum: row.order_number,
        customername: row.customer_name,
        customerphone: row.customer_phone,
        customerpincode: row.customer_pincode,
        delexec: `${row.executive_number} - ${row.delivery_boy_name}` || "--",
        deldate: moment(row.assigned_date).local().format("DD-MM-YYYY"),
        reqdelexec: row.request_executive_number
          ? `${row.request_executive_number} - ${row.request_executive_name}`
          : "N/A",
      }));

      const tableStartY = 10 + logoHeight + 10;

      doc.autoTable({
        head: [tableColumn.map((col) => col.header)],
        body: tableRows.map((row) => [
          row.ordernum,
          row.customername,
          row.customerphone,
          row.customerpincode,
          row.delexec,
          row.deldate,
          row.reqdelexec,
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
        `Delivery Reassign_Requests_${moment
          .utc(new Date())
          .local()
          .format("DD-MM-YYYY")}.pdf`
      );
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Order Number#",
      "Customer Name",
      "Ph. Number",
      "Pincode",
      "Assigned To",
      "Delivery Date",
      "Reassign Request To",
    ];

    const reversedRequest = [...reQuestReAssign].reverse();

    const csvData = reversedRequest.map((row, index) => [
      row.order_number,
      row.customer_name,
      row.customer_phone,
      row.customer_pincode,
      `${row.executive_number} - ${row.delivery_boy_name}` || "--",
      moment(row.assigned_date).local().format("DD-MM-YYYY"),
      row.request_executive_number
        ? `${row.request_executive_number} - ${row.request_executive_name}`
        : "N/A",
    ]);

    const tempData = [headers, ...csvData];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Reassign Requests Reports"
    );

    const fileName = `Delivery Reassign_Requests_${moment
      .utc(new Date())
      .local()
      .format("DD-MM-YYYY")}.csv`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleClose = () => {
    setOpen(false);
    setAssingnExecutiveModelOOpen(false);
    setselectedExecutive();
    setSelectedId(null);
    setExsistingExecutive();
    setErrors({ executive: false });
  };

  const handleOpen = (row) => {
    setExsistingExecutive(row);
    setSelectedId(row?.id);
    setselectedExecutive({
      id: row?.reassigned_executive_id,
      executive_id: row?.request_executive_number,
      name: row?.request_executive_name,
    });
    setOpen(true);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer
        style={{ marginBottom: "1rem" }}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
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
            disabled={reQuestReAssign?.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={reQuestReAssign?.length === 0}
          >
            Export to PDF
          </Button>
        </div>
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
            Manage Reassign Requests
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
                  setReQuestReAssign(
                    searchArrayByValue(
                      allReQuestReAssign,
                      e.target.value.toLowerCase()
                    )
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {isStateUpdated ? (
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
              rows={reQuestReAssign}
              components={{ Toolbar: CustomToolbar }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
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
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography>
            Are you sure you want to Reassign the order to{" "}
            {exsistingExecutive?.request_executive_number} -{" "}
            {exsistingExecutive?.request_executive_name}
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handleClose}
              color="primary"
              variant="contained"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="secondary"
              variant="contained"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Confirm
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal
        open={assingnExecutiveModelOpen}
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
            Assign Delivery Executive
          </Typography>
          <Divider style={{ margin: "1rem 0" }} />

          <TextField
            required
            disabled
            fullWidth
            label="Order Number#"
            type="text"
            variant="outlined"
            sx={{ mb: 2 }}
            value={exsistingExecutive?.order_number}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <TextField
            required
            fullWidth
            disabled
            label="Assigned Date"
            type="Date"
            variant="outlined"
            sx={{ mb: 2 }}
            value={exsistingExecutive?.assigned_date}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <FormControl fullWidth sx={{ mb: 2, textAlign: "left" }}>
            <InputLabel id="optional-select-label">Executive</InputLabel>

            <Select
              labelId="optional-select-label"
              value={selectedExecutive}
              label="Executive"
              onChange={(e) => {
                setselectedExecutive(e.target.value);
                setErrors({ executive: false });
              }}
            >
              {executiveList.map((item) => (
                <MenuItem key={item.id} value={item}>
                  {`${item.executive_id} - ${item.name}`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText sx={{ color: "red" }}>
              {errors.executive ? "choose executive" : ""}
            </FormHelperText>
          </FormControl>
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

export default DeliveryReAssigneRequest;
