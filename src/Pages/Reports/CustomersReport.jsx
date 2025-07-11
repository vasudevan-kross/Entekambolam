import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  useTheme,
  Modal,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Box from "@mui/material/Box";
import moment from "moment/moment";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { Stack } from "@mui/system";
import Skeleton from "@mui/material/Skeleton";
import { GET } from "../../Functions/apiFunction";
import api from "../../Data/api";
import { tokens } from "../../theme";
import { DateRangePicker } from "react-date-range";
import "jspdf-autotable";
import { addDays } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import logo from "../../assets/a_logo.png";
import Utils from "../../Global/utils";
import * as CONSTANTS from "../../Common/Constants";
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

function CustomersReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setusers] = useState();
  const [MainUsers, setMainUsers] = useState();
  const [pageSize, setpageSize] = useState(20);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [startDate, setstartDate] = useState();
  const [endDate, setendDate] = useState();
  const [backdropOpen, setbackdropOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBackDropOpen = () => setbackdropOpen(true);
  const handleBackDropClose = () => setbackdropOpen(false);
  const [isDateRange, setisDateRange] = useState(false);
  const [dataSet, setdataSet] = useState([]);
  const [dateRange, setdateRange] = useState([
    {
      endDate: new Date(),
      startDate: addDays(new Date(), -7),
      key: "selection",
    },
  ]);
  // const date = new Date();
  // const formattedDate = `${String(date.getDate()).padStart(2, "0")}_${String(
  //   date.getMonth() + 1
  // ).padStart(2, "0")}_${date.getFullYear()}`;

  const { toDate, fromDate } = Utils.getDateRange();

  useEffect(() => {
    // Get users
    const getCat = async () => {
      const url = `${api}/get_user_report`;
      const users = await GET(token, url);
      if (searchValue.trim() !== "") {
        const result = searchArrayByValue(users.data, searchValue);
        setusers(result);
      } else {
        setusers(users.data);
      }
      setMainUsers(users.data);
      setstartDate(fromDate);
      setendDate(toDate);
    };
    getCat();
  }, [token]);

  const column = useMemo(() => [
    { field: "id", headerName: "Customer ID", width: 180 },
    { field: "name", headerName: "Name", width: 180 },
    { field: "email", headerName: "Email", width: 250 ,
      renderCell: (params) => {
        return <p>{params.value ?? "N/A"}</p>;
      }
    },
    { field: "phone", headerName: "Phone", width: 150 },
    {
      field: "wallet_amount",
      headerName: "Wallet Amount",
      width: 150,
      renderCell: (params) => (
        <p
          style={{
            color:
              params.row.wallet_amount === null ||
                params.row.wallet_amount < 250
                ? "red"
                : "#54B435",
            fontWeight:
              params.row.wallet_amount === null ||
                params.row.wallet_amount < 250
                ? "700"
                : "700",
          }}
        >
          {params.row.wallet_amount === null
            ? "0.00"
            : params.row?.wallet_amount?.toFixed(2)}
        </p>
      ),
    },
    {
      field: "created_at",
      headerName: "Customer Registered Date",
      width: 220,
      renderCell: (params) =>
        moment.utc(params.row.created_at).local().format("DD-MM-YYYY"),
    },
    // {
    //   field: "role_title",
    //   headerName: "Role",
    //   width: 150,
    //   renderCell: (params) => (
    //     <>
    //       {params.row.role_title === null ? "USER" : params.row.role_title}
    //     </>
    //   ),
    //   type: "string",
    // },
  ]);

  const exportToCSV = () => {
    const dateRange =
      startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : null;

    // Prepare the headers and data
    const headers = [
      "S.No",
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Wallet Amount",
      "Customer Register Date",
    ];

    const reversedUsers = [...users].reverse();

    const csvData = reversedUsers
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((row, index) => [
        index + 1,
        row.id,
        row.name,
        row.email ?? "N/A",
        row.phone,
        row.wallet_amount ?? 0,
        moment.utc(row.created_at).local().format("DD-MM-YYYY"),
      ]);

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the data for the worksheet
    const tempData = [
      ...(startDate && endDate ? [[dateRange], []] : []), // Add date range and empty row if available
      headers,
      ...csvData,
    ];

    // Convert tempData to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(tempData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers Report");

    // Set the filename and download
    XLSX.writeFile(workbook, `Customers_Report_${startDate}_${endDate}.csv`);
  };

  // PDF Export Function
  const exportToPDF = () => {
    const dateRange = `Date Range: ${startDate} to ${endDate}`;

    const doc = new jsPDF();


    doc.setFontSize(18); // Set font size for header
    const headerText = "Customers Report";
    const headerX =
      (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2; // Center the header
    doc.text(headerText, headerX, 20);

    Utils.getBase64FromImage(logo, (base64Logo) => {
      const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
      const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(
        base64Logo,
        "PNG",
        pageWidth - logoWidth - 5,
        10,
        logoWidth,
        logoHeight
      );

      doc.setFontSize(12); // Reset font size for normal text
      if (startDate && endDate) {
        doc.text(dateRange, 5, 40); // Positioning the date range below the header
      }

      const tableColumn = [
        "S.No",
        "Customer ID",
        "Name",
        "Email",
        "Phone",
        "Wallet Amount",
        "Customer Register Date",
      ];

      const reversedUsers = [...users].reverse();

      const tableRows = reversedUsers
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((row, index) => [
          index + 1,
          row.id,
          row.name,
          row.email ?? "N/A",
          row.phone,
          row?.wallet_amount?.toFixed(2) ?? "0.00",
          moment.utc(row.created_at).local().format("DD-MM-YYYY"),
        ]);

      const tableStartY = 20 + logoHeight + 6;
      // Add the table to the PDF
      doc.addFont(
        "meera-regular-unicode-font-normal.ttf",
        "meera-regular-unicode-font-normal",
        "normal"
      );
      doc.setFont("meera-regular-unicode-font-normal");
      doc.autoTable(tableColumn, tableRows, {
        startY: tableStartY,
        showHead: "firstPage",
        margin: { left: 4 },
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
          0: { cellWidth: 11 }, // S/no
          1: { cellWidth: 25 }, // Customer ID
          2: { cellWidth: 25 }, // Customer Name
          3: { cellWidth: 45 }, // Email
          4: { cellWidth: 30 }, // Phone Number
          5: { cellWidth: 30 }, // Wallet Amount
          6: { cellWidth: 35 }, // Customer Reg Date
        },
        tableWidth: "wrap",
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

      doc.save(`Customers_Report_${startDate}_${endDate}.pdf`);
    });
    // Add the date range below the header
  };

  const filter = async (url) => {
    handleBackDropOpen();
    const report = await GET(token, url);
    handleBackDropClose();
    if (searchValue.trim() !== "") {
      const result = searchArrayByValue(report.data, searchValue);
      setusers(result);
    } else {
      setusers(report.data);
    }
    setMainUsers(report.data);

    let array = getDateValueArray(report.data);
    const data_Set = () => {
      let arr = [];
      for (let i = 0; i < array.length; i++) {
        let data = {
          date: array[i].date,
          value: array[i].values.length,
        };
        arr.push(data);
      }
      setdataSet(arr);
    };

    data_Set();
  };

  function getDateValueArray(inputArray) {
    // Create an object to store the unique dates and their values
    const dateValueObj = inputArray.reduce((acc, curr) => {
      // Get the current date from the input array item
      const currDate = curr.date;

      // If the date is not already in the accumulator object, add it
      if (!acc[currDate]) {
        acc[currDate] = [];
      }

      // Add the current item's value to the date's array in the accumulator object
      acc[currDate].push(1);

      return acc;
    }, {});

    // Convert the accumulator object to an array
    const dateValueArray = Object.entries(dateValueObj).map(
      ([date, values]) => {
        return { date, values };
      }
    );

    return dateValueArray;
  }

  function searchArrayByValue(arr, searchQuery) {
    return arr
      .map((obj) => ({
        ...obj,
        updated_at_temp: new Date(obj.updated_at)
          .toLocaleDateString("en-GB")
          .split("/") // Convert to "dd-mm-yyyy"
          .join("-"),
        originalUpdatedAt: obj.updated_at,
      }))
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
          obj;
        return {
          ...rest,
          updated_at: originalUpdatedAt, // Restore the original format
        };
      });
  }

  // custom toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        style={{ marginBottom: "1rem" }}
      >
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <TextField
            InputLabelProps={{ shrink: true }}
            id="outlined-basic"
            label="Select Date Range"
            variant="outlined"
            Autocomplete={false}
            size="small"
            color="secondary"
            onKeyDown={() => {
              return false;
            }}
            onClick={handleOpen}
            value={startDate && `${startDate} - ${endDate}`}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              if (isDateRange === true) {
                let url = `${api}/get_user_report/${startDate}/${endDate}`;
                filter(url);
              } else {
                let url = `${api}/get_user_report`;
                filter(url);
              }
            }}
            disabled={!startDate && !endDate}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setisDateRange(false);
              setstartDate(fromDate);
              setendDate(toDate);
              let url = `${api}/get_user_report`;
              filter(url);
              setdateRange([
                {
                  endDate: new Date(),
                  startDate: addDays(new Date(), -7),
                  key: "selection",
                },
              ]);
            }}
            disabled={!startDate && !endDate}
          >
            Reset
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            disabled={users.length === 0}
          >
            Export to CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            disabled={users.length === 0}
          >
            Export to PDF
          </Button>
        </Box>
      </GridToolbarContainer>
    );
  }

  return (
    <div style={{ height: "100%" }}>
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
            Customers Report
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
              value={searchValue}
              onChange={(e) => {
                e.preventDefault();
                setSearchValue(e.target.value);
                setTimeout(() => {
                  setusers(
                    searchArrayByValue(MainUsers, e.target.value.toLowerCase())
                  );
                }, 500);
              }}
            />
          </Box>
        </Box>

        {users ? (
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
              rows={users}
              components={{ Toolbar: CustomToolbar }}
              localeText={{
                noRowsLabel: "No records found",
              }}
              rowsPerPageOptions={[10, 20, 25, 50, 100]}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setpageSize(newPageSize)}
              getRowId={(row) => row.id} // Ensure the unique ID for rows
            />
          </Box>
        ) : (
          <LoadingSkeleton rows={5} height={30} />
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

export default CustomersReport;
