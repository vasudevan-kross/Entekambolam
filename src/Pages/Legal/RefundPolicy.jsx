import React from "react";
import logo from "../../assets/a_logo.png";
import { Card, CardContent } from "@mui/material";

const RefundPolicy = () => {
  return (
    <div className="w-full h-full">
      <div className="policyHeader">
        <img
          src={logo}
          alt="Privacy Icon"
          style={{ width: "32px", height: "32px" }}
        />
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1F2937" }}>
          REFUND & CANCELLATION
        </h1>
      </div>
      <Card className="privacyPolicy">
        <CardContent style={{ padding: 0 }}>
          <h5>
            <strong>
              <em>Last updated: February 25, 2025</em>
            </strong>
          </h5>

          <p style={{ lineHeight: "1.6" }}>
            At <strong>EnteKambolam</strong>, we value our customers and strive
            to provide the best quality milk, dairy products, and groceries.
            However, we understand that there may be instances where you need a
            refund. Please read our refund policy carefully to understand when
            and how refunds are processed.
          </p>

          {/* Refund Eligibility */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1F2937",
              margin: "20px 0",
            }}
          >
            1. Refund Eligibility
          </h2>
          <p>
            You may be eligible for a refund under the following conditions:
          </p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              Orders canceled <strong>before dispatch</strong> are eligible for
              a full refund.
            </li>
            <li>
              Refunds will be provided for{" "}
              <strong>damaged, defective, or incorrect</strong> items received.
            </li>
            <li>
              <strong>Perishable goods</strong> (milk, dairy products) are{" "}
              <strong>non-refundable</strong>, except in cases of quality issues
              reported within <strong>12 hours</strong> of delivery.
            </li>
            <li>
              Refund requests must be raised within <strong>24 hours</strong> of
              receiving the order.
            </li>
            <li>
              For subscription-based orders, refunds will be provided for{" "}
              <strong>unused</strong> subscription days in case of service
              disruption.
            </li>
          </ul>

          {/* Refund Process */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            2. Refund Process
          </h2>
          <p>To initiate a refund, please follow these steps:</p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              Contact our <strong>customer support</strong> via email or phone.
            </li>
            <li>
              Provide your <strong>order ID</strong> along with images of the
              defective product.
            </li>
            <li>
              Our team will verify and process the refund within{" "}
              <strong>5-7 business days</strong>.
            </li>
            <li>
              If approved, the amount will be credited back to your original
              payment method.
            </li>
          </ul>

          {/* Refund Mode */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            3. Refund Mode
          </h2>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              <strong>UPI / Wallets / Net Banking:</strong> 3-5 business days
            </li>
            <li>
              <strong>Credit / Debit Cards:</strong> 5-7 business days
            </li>
            {/* <li>
              <strong>Cash on Delivery (COD) Orders:</strong> Refunds will be
              issued as <strong>store credit</strong> or via bank transfer.
            </li> */}
            <li>
              <strong>Subscription Refunds:</strong> Refunds for unused days
              will be credited to the customer’s wallet or bank account.
            </li>
          </ul>

          {/* Contact */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            4. Contact Us
          </h2>
          <p>
            If you have any queries or need assistance regarding refunds, please
            contact:
          </p>
          <p style={{ fontWeight: "500" }}>
            Email:{" "}
            <a
              href="mailto:entekambolam@gmail.com"
              style={{ textDecoration: "underline" }}
            >
              entekambolam@gmail.com
            </a>
            <br />
            Phone:{" "}
            <a href="tel:+918138033314" style={{ textDecoration: "underline" }}>
              +91 8138033314
            </a>
            <br />
            Address: 5/170-A, NAGORE, SEVARKAR, M.G.PUDUR POST, DEVAMBADI,
            COIMBATORE, POLLACHI,TN-642005
          </p>

          <p>
            By using our services, you agree to our{" "}
            <a
              href="/terms-and-condition"
              style={{ color: "#2563EB", textDecoration: "underline" }}
            >
              Terms & Conditions
            </a>{" "}
            and this{" "}
            <a
              href="/refund-policy"
              style={{ color: "#2563EB", textDecoration: "underline" }}
            >
              Refund Policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundPolicy;
