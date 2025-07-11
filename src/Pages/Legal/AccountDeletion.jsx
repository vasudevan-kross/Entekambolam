import React from "react";
import logo from "../../assets/a_logo.png";
import { Card, CardContent } from "@mui/material";

const AccountDeletion = () => {
  return (
    <div className="w-full h-full">
      <div className="policyHeader">
        <img
          src={logo}
          alt="Account Deletion Icon"
          style={{ width: "32px", height: "32px" }}
        />
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1F2937" }}>
          ACCOUNT DELETION
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
            At <strong>EnteKambolam</strong>, we respect your privacy and
            provide you with the option to delete your account and associated
            data upon request. Please read the information below to understand
            how to request account deletion and what data is affected.
          </p>

          {/* How to Request Account Deletion */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1F2937",
              margin: "20px 0",
            }}
          >
            1. How to Request Account Deletion
          </h2>
          <p>If you want to delete your account, please follow these steps:</p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              Contact our <strong>customer support</strong> via email.
            </li>
            <li>
              Provide your <strong>registered phone number or email</strong> to
              verify your request.
            </li>
            <li>
              Our team will process the request and confirm deletion within{" "}
              <strong>7 days</strong>.
            </li>
          </ul>

          {/* What Data is Deleted */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            2. What Data is Deleted?
          </h2>
          <p>
            Upon successful account deletion, the following data will be removed
            permanently:
          </p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>Personal information (name, email, phone number)</li>
            <li>Order history and transaction details</li>
            <li>Saved preferences and account settings</li>
          </ul>

          {/* What Data is Retained */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            3. What Data is Retained?
          </h2>
          <p>
            Some data may be retained for a specific period due to legal or
            regulatory requirements:
          </p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              <strong>Transaction records</strong> are stored for{" "}
              <strong>6 months</strong> for tax and auditing purposes.
            </li>
            <li>
              Any pending refunds or disputes must be resolved before deletion.
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
            If you have any questions regarding account deletion, please
            contact:
          </p>
          <p style={{ fontWeight: "500" }}>
            Email:{" "}
            <a
              href="mailto:support@entekambolam.com"
              style={{ color: "#2563EB", textDecoration: "underline" }}
            >
              support@entekambolam.com
            </a>
            <br />
            {/* Phone:{" "}
            <a href="tel:+918138033314" style={{ textDecoration: "underline" }}>
              +91 8138033314
            </a>
            <br /> */}
            Address: 5/170-A, NAGORE, SEVARKAR, M.G.PUDUR POST, DEVAMBADI,
            COIMBATORE, POLLACHI, TN-642005
          </p>

          <p>
            By using our services, you agree to our{" "}
            <a
              href="/terms-and-condition"
              style={{ color: "#2563EB", textDecoration: "underline" }}
            >
              Terms & Conditions
            </a>
            {/* {" "} */}
            {/* and this{" "}
            <a
              href="/account-deletion-policy"
              style={{ color: "#2563EB", textDecoration: "underline" }}
            >
              Account Deletion Policy
            </a>
            . */}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDeletion;
