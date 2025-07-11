import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/system";
import {
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import "../Styles/product.css";
import api from "../Data/api";
import { GET } from "../Functions/apiFunction";
import { tokens } from "../theme";
import Skeleton from "@mui/material/Skeleton";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/a_logo.png";
import Utils from "../Global/utils";
import moment from "moment/moment";
import malyalamFont from "../fonts/meera-regular-unicode-font-normal.js";
import * as CONSTANTS from "../Common/Constants";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function PurchasePDFViewer() {
  const theme = useTheme();
  const param = useParams();
  const [searchParams] = useSearchParams();
  const isFrom = searchParams.get("isFrom");
  const paramIdFrom = searchParams.get("paramIdFrom");
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [alertType, setalertType] = useState("");
  const [alertMsg, setalertMsg] = useState("");
  const [LOADING, setLOADING] = useState(false);
  const [isStateUpdated, setUpdatedState] = useState(false);

  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [vendors, setVendors] = useState();
  const [warehouses, setWarehouses] = useState();
  const [products, setProducts] = useState();
  const [data, setData] = useState();
  const [headerName, setHeaderName] = useState("");

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);

  useEffect(() => {
    setHeaderName(isFrom === "purchaseOrder" ? "Purchase Order"
      : isFrom === "purchaseInvoice" ? "Purchase Invoice"
        : isFrom === "purchasePayment" ? "Purchase Payment"
          : isFrom === "poApproval" ? "PO Approval"
            : isFrom === "piApproval" ? "PI Approval"
              : isFrom === "ppApproval" ? "PP Approval"
                : isFrom === "purchaseReturn" ? "Purchase Return"
                  : isFrom === "prApproval" ? "PR Approval" : "Purchase Order");
    const getVendors = async () => {
      const url = `${api}/get_vendors`;
      const result = await GET(token, url);
      setVendors(result.data);
    };

    const getWarehouse = async () => {
      const url = `${api}/get_warehouse`;
      const result = await GET(token, url);
      setWarehouses(result.data);
    };

    const getAllProduct = async () => {
      const url = `${api}/get_all_product`;
      const result = await GET(token, url);
      setProducts(result.data);
    };

    const getPurchaseOrders = async () => {
      const url = (isFrom == "purchaseReturn" || isFrom == "prApproval")
        ? `${api}/get_purchaseReturn_by_id/${param.id}`
        : paramIdFrom === "PR" ? `${api}/get_purchaseReturn_by_id/${param.id}?isPR=true`
          : `${api}/get_purchaseOrder_by_id/${param.id}`;
      const result = await GET(token, url);
      if (result.response === 200) {
        setData(result.data);
      }
    };

    const fetchData = async () => {
      await Promise.all([getVendors(), getWarehouse(), getAllProduct(), getPurchaseOrders()]);
      setUpdatedState(true);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isStateUpdated && data) {
      generatePDF(data);
    }
  }, [isStateUpdated, data]);

  const checkPageOverflow = (doc, currentY, isSignature = false) => {
    const pageHeight = doc.internal.pageSize.height;
    const marginBottom = 20;
    if (currentY + marginBottom >= pageHeight) {
      doc.addPage();
      if (isSignature) {
        return 50;
      }
      return 10;
    }
    return currentY;
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    const fileName = isFrom === "purchaseOrder" ? "Purchase Order" 
      : isFrom === "purchaseInvoice" ? "Purchase Invoice" 
      : isFrom === "purchasePayment" ? "Purchase Payment" 
      : isFrom === "poApproval" ? "PO Approval" 
      : isFrom === "piApproval" ? "PI Approval" 
      : isFrom === "ppApproval" ? "PP Approval" 
      :isFrom === "purchaseReturn" ? "Purchase Return" 
      : isFrom === "prApproval" ? "PR Approval" : "Purchase Order" ;
      
    doc.setProperties({
      title: fileName, // This sets the title displayed near the menu icon
    });
    const supplierData = vendors?.find((vendor) => vendor.id === data.supplier_id);
    const warehouseData = warehouses?.find((warehouse) => warehouse.id === data.warehouse_id);
    doc.setFontSize(13);
    doc.setFont("times", "bold");
    doc.setTextColor(0, 162, 51);
    doc.text(headerName, 10, 15);
    doc.setTextColor(0, 0, 0);
    Utils.getBase64FromImage(logo, (base64Logo) => {
      const logoWidth = CONSTANTS.IMAGE_OPTION.logoWidth;
      const logoHeight = CONSTANTS.IMAGE_OPTION.logoHeight;
      const logoSize = doc.internal.pageSize.getWidth();
      let totalAmount = 0;
      let totalTax = 0;
      doc.setFont("times");
      doc.addImage(
        base64Logo,
        "PNG",
        logoSize - logoWidth - 15,
        6,
        logoWidth,
        logoHeight
      );

      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text("Supplier :", 10, 40);
      const pageWidth = 65;
      const supplierAddressLines = doc.splitTextToSize(supplierData?.address ?? "", pageWidth);
      doc.text(supplierData?.supplier_name ?? "", 10, 47);
      let yLeftPosition = 54;
      doc.setFontSize(10);
      doc.setFont("times", 200);
      supplierAddressLines.forEach((line) => {
        doc.text(line, 10, yLeftPosition);
        yLeftPosition += 5;
      });

      doc.text(`GSTIN: ${supplierData?.gst_no ?? ""}`, 10, yLeftPosition);
      yLeftPosition += 5;
      doc.text(`Phone.No: ${supplierData?.office_ph_no ?? ""}`, 10, yLeftPosition);
      yLeftPosition += 5;
      doc.text(`Email: ${supplierData?.user_name ?? ""}`, 10, yLeftPosition);
      yLeftPosition += 5;
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text("Billing Address:", 140, 40);
      doc.setFontSize(10);
      doc.setFont("times", 200);
      const billingAddressLine = doc.splitTextToSize(warehouseData?.billing_address ?? "", pageWidth);
      let yRightPosition = 47;
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(warehouseData?.warehouse_name ?? "", 140, yRightPosition);
      yRightPosition += 5;
      doc.setFontSize(10);
      doc.setFont("times", 200);
      billingAddressLine.forEach((line) => {
        doc.text(line, 140, yRightPosition);
        yRightPosition += 5;
      });
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(`Phone No: ${warehouseData?.phone_no ?? ""}`, 140, yRightPosition);
      yRightPosition += 6;
      if (isFrom == "purchaseReturn" || isFrom == "prApproval" || paramIdFrom === "PR") {
        doc.text(`PR Number: ${data.pr_no ?? ""}`, 140, yRightPosition);
      } else if (paramIdFrom !== "PR") {
        doc.text(`PO Number: ${data.po_no ?? ""}`, 140, yRightPosition);
      }
      yRightPosition += 5;
      if (isFrom === "purchaseInvoice" || isFrom === "purchasePayment" || isFrom === "piApproval"
        || isFrom === "ppApproval" || isFrom == "purchaseReturn" || isFrom == "prApproval") {
        doc.text(`PI Number: ${data.pi_no ?? ""}`, 140, yRightPosition);
        yRightPosition += 5;
      }
      doc.setFontSize(10);
      doc.setFont("times", 200);
      if (isFrom == "purchaseReturn" || isFrom == "prApproval" || paramIdFrom === "PR") {
        doc.text(`Date of PR: ${moment.utc(data.date_of_pr).local().format("DD-MM-YYYY") ?? ""}`, 140, yRightPosition);
        yRightPosition += 5;
      } else {
        doc.text(`Date of PO: ${moment.utc(data.date_of_po).local().format("DD-MM-YYYY") ?? ""}`, 140, yRightPosition);
        yRightPosition += 5;
        doc.text(`Date of Delivery: ${moment.utc(data.date_of_delivery).local().format("DD-MM-YYYY") ?? ""}`, 140, yRightPosition);
        yRightPosition += 5;
        doc.text(`Time of Delivery: ${data.delivery_time ?? ""}`, 140, yRightPosition);
        yRightPosition += 5;
      }
      let tableYPosion = yLeftPosition > yRightPosition ? yLeftPosition += 3 : yRightPosition += 3
      // For Retrun Prodct Details 
      if (isFrom == "purchaseReturn" || isFrom == "prApproval" || paramIdFrom === "PR") {
        let totalPIAmount = 0;
        let totalPITax = 0;
        tableYPosion += 3;
        doc.text("PI Product", 10, tableYPosion);
        tableYPosion += 5;
        doc.addFont("meera-regular-unicode-font-normal.ttf", "meera-regular-unicode-font-normal", "normal");
        doc.setFont("meera-regular-unicode-font-normal");
        const tableColumn = ["#", "Product", "Qty", "Rate(₹)", "Amount(₹)", "Tax Rate", "Tax Amount(₹)", "Net Amount(₹)"];
        const tableRows = [];
        data.PIProducts.forEach((product, index) => {
          const rowData = [
            index + 1,
            products?.find((a) => a.id === product.product_id).title ?? "",
            product.quantity,
            product.price.toFixed(2),
            product.amount.toFixed(2),
            product.tax === "0" ? "Tax-Free" : `${product.tax}%`,
            product.tax_amount.toFixed(2),
            product.net_amount.toFixed(2),
          ];
          tableRows.push(rowData);
          totalPIAmount += parseFloat(product.amount);
          totalPITax += parseFloat(product.tax_amount);
        });

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: tableYPosion,
          theme: "striped",
          halign: "center",
          margin: { left: 10 },
          headStyles: {
            font: "",
            fillColor: [0, 162, 51],  // RGB color for orange background
            textColor: [255, 255, 255], // White text for contrast
            fontSize: 12, // Font size for the table header
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
          columnStyles: {
            0: { cellWidth: 11 }, // S.no
            1: { cellWidth: 30 }, // Product
            2: { cellWidth: 20 }, // Qty
            3: { cellWidth: 25 }, // Rate
            4: { cellWidth: 25 }, // Amount
            5: { cellWidth: 25 }, // Tax Rate
            6: { cellWidth: 25 }, // Tax Amount
            7: { cellWidth: 27 }, // Net Amou7t
          },
          tableWidth: "wrap",
          didDrawPage: (data) => {
            tableYPosion = data.cursor.y + 10;
          }
        });
        if (doc.lastAutoTable) {
          tableYPosion = doc.lastAutoTable.finalY + 10;
        }
        tableYPosion = checkPageOverflow(doc, tableYPosion);
        doc.text("Sub Total Amount: ", 155, tableYPosion);
        doc.text(`₹${totalPIAmount.toFixed(2)}`, 185, tableYPosion);
        tableYPosion += 5;
        tableYPosion = checkPageOverflow(doc, tableYPosion);
        doc.text("Tax: ", 174, tableYPosion);
        doc.text(`₹${totalPITax.toFixed(2)}`, 185, tableYPosion);
        tableYPosion += 5;
        tableYPosion = checkPageOverflow(doc, tableYPosion);
        doc.text("Net Amount: ", 163, tableYPosion);
        doc.text(`₹${data.pi_invoice_amount.toFixed(2)}`, 185, tableYPosion);
        tableYPosion += 5;
        tableYPosion = checkPageOverflow(doc, tableYPosion);
        doc.text("PR Product", 10, tableYPosion);
        tableYPosion += 5;
        tableYPosion = checkPageOverflow(doc, tableYPosion);
      }
      doc.addFont("meera-regular-unicode-font-normal.ttf", "meera-regular-unicode-font-normal", "normal");
      doc.setFont("meera-regular-unicode-font-normal");
      const tableColumn = ["#", "Product", "Qty", "Rate(₹)", "Amount(₹)", "Tax Rate", "Tax Amount(₹)", "Net Amount(₹)"];
      const tableRows = [];
      data.products.forEach((product, index) => {
        const rowData = [
          index + 1,
          products?.find((a) => a.id === product.product_id).title ?? "",
          (isFrom == "purchaseReturn" || isFrom == "prApproval" || paramIdFrom === "PR") ? product.returnQuantity : product.quantity,
          product.price.toFixed(2),
          product.amount.toFixed(2),
          product.tax === "0" ? "Tax-Free" : `${product.tax}%`,
          product.tax_amount.toFixed(2),
          product.net_amount.toFixed(2),
        ];
        tableRows.push(rowData);
        totalAmount += parseFloat(product.amount);
        totalTax += parseFloat(product.tax_amount);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: tableYPosion,
        theme: "striped",
        halign: "center",
        margin: { left: 10 },
          headStyles: {
            font: "",
            fillColor: [0, 162, 51],  // RGB color for orange background
            textColor: [255, 255, 255], // White text for contrast
            fontSize: 12, // Font size for the table header
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
          columnStyles: {
            0: { cellWidth: 11 }, // S.no
            1: { cellWidth: 30 }, // Product
            2: { cellWidth: 20 }, // Qty
            3: { cellWidth: 25 }, // Rate
            4: { cellWidth: 25 }, // Amount
            5: { cellWidth: 25 }, // Tax Rate
            6: { cellWidth: 25 }, // Tax Amount
            7: { cellWidth: 27 }, // Net Amou7t
          },
          tableWidth: "wrap",
        didDrawPage: (data) => {
          tableYPosion = data.cursor.y + 10;
        }
      });
      let finalY = doc.lastAutoTable.finalY + 10;
      finalY = checkPageOverflow(doc, finalY);
      doc.text("Sub Total Amount: ", 155, finalY);
      doc.text(`₹${totalAmount.toFixed(2)}`, 185, finalY);
      finalY += 5;
      finalY = checkPageOverflow(doc, finalY);
      doc.text("Tax: ", 174, finalY);
      doc.text(`₹${totalTax.toFixed(2)}`, 185, finalY);
      finalY += 5;
      finalY = checkPageOverflow(doc, finalY);
      
      doc.text("Net Amount: ", 163, finalY);
      doc.text(`₹${data.total_amount.toFixed(2)}`, 185, finalY);
      finalY += 5;

      if (isFrom == "purchaseReturn" || isFrom == "prApproval" || paramIdFrom === "PR") {
        finalY += 3;
        finalY = checkPageOverflow(doc, finalY);

        doc.setLineWidth(0.1);
        doc.line(7, finalY, 200, finalY);
        finalY += 7;
        finalY = checkPageOverflow(doc, finalY);
        doc.text("PI Total Amount:", 151, finalY);
        doc.text(`₹${data.pi_invoice_amount.toFixed(2)}`, 183, finalY);
        finalY += 5;
        finalY = checkPageOverflow(doc, finalY);
        doc.text("PR Total Amount:", 150, finalY);
        doc.text(`₹${data.total_amount.toFixed(2)} (-)`, 183, finalY);
        finalY += 5;
        finalY = checkPageOverflow(doc, finalY);
        doc.text("Payable Net Amount: ", 145, finalY);
        doc.text(`₹${(data.pi_invoice_amount.toFixed(2) - data.total_amount.toFixed(2)).toFixed(2)}`, 183, finalY);
        finalY += 5;
      }
      finalY = checkPageOverflow(doc, finalY);
      doc.setFont("times", "bold");
      doc.text("Delivery Address:", 10, finalY);
      finalY += 5;
      doc.text(warehouseData?.warehouse_name ?? "", 10, finalY);
      finalY += 5;
      finalY = checkPageOverflow(doc, finalY);
      doc.setFontSize(10);
      doc.setFont("times", 200);
      const deliveryAddressLine = doc.splitTextToSize(warehouseData?.address ?? "", pageWidth);
      deliveryAddressLine.forEach((line) => {
        doc.setFont("times", "bold");
        doc.text(line, 10, finalY);
        finalY += 5;
        finalY = checkPageOverflow(doc, finalY);
      });
      doc.setFontSize(11);  
      doc.setFont("times", "bold");    
      doc.text(`Phone No: ${warehouseData?.phone_no ?? ""}`, 10, finalY);
      const pageHeight = doc.internal.pageSize.height - 50;
      if (pageHeight > finalY) {
        finalY = pageHeight + 5;
      } else {
        finalY += 50;
      }
      let signatureY = checkPageOverflow(doc, finalY, true);
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text("Authorized Signatory", 200, signatureY, { align: "right" });
      doc.setLineWidth(0.5);
      doc.line(160, signatureY + 2, 200, signatureY + 2);
      signatureY += 10;
      signatureY = checkPageOverflow(doc, signatureY);
      doc.setLineWidth(0.2);
      doc.line(10, signatureY, 200, signatureY);
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);
      setPdfDownloadUrl(blob);
    });
  };


  return (
    <>
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "10px",
          borderBottom: colors.grey[300],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="heading">{headerName}</h2>
        </div>
      </Box>
      {isStateUpdated ?
        <Box component="form">
          <div className="product">
            <div
              className="left"
              style={{
                backgroundColor: colors.cardBG[400],
              }}
            >
              {pdfBlobUrl && (
                <div>
                  <div
                    style={{
                      border: "1px solid black",
                      height: "500px",
                      overflow: "auto",
                    }}
                  >
                    <iframe
                      src={pdfBlobUrl}
                      style={{ width: "100%", height: "500px" }}
                      title="PDF Viewer"
                    ></iframe>
                  </div>
                  {/* <a href={pdfDownloadUrl} download={`Purchase_Order_${data.po_no}.pdf`}>
                  <button>Download PDF</button>
                </a> */}
                </div>
              )}
            </div>
          </div>
        </Box>
        :
        (
          <LoadingSkeleton rows={6} height={30} />
        )}
    </>
  );
}

export default PurchasePDFViewer;
