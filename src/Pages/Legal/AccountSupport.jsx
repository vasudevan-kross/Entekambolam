import React from "react";
import logo from "../../assets/a_logo.png";
import { Card, CardContent } from "@mui/material";

const AccountSupport = () => {
  return (
    <div className="w-full h-full">
      <div className="policyHeader">
        <img
          src={logo}
          alt="Account Support Icon"
          style={{ width: "32px", height: "32px" }}
        />
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1F2937" }}>
          ACCOUNT SUPPORT
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
            At <strong>EnteKambolam</strong>, we strive to provide seamless
            account support for our users. Whether you need assistance with your
            account, password recovery, or account deletion, we are here to
            help. Please read the information below to understand how to get
            support for different account-related issues.
          </p>

          {/* Account Assistance */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1F2937",
              margin: "20px 0",
            }}
          >
            1. General Account Assistance
          </h2>
          <p>If you need help with your account, you can:</p>
          <ul style={{ paddingLeft: "30px" }}>
            {/* <li>
              Reset your password using the <strong>"Forgot Password"</strong>{" "}
              option on the login page.
            </li> */}
            <li>
              Update account details like email, phone number, or address in the
              account settings.
            </li>
            <li>
              Contact our <strong>support team</strong> for assistance with
              login issues or other account-related queries.
            </li>
          </ul>

          {/* How to Request Account Deletion */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1F2937",
              margin: "20px 0",
            }}
          >
            2. Requesting Account Deletion
          </h2>
          <p>
            If you wish to delete your account and associated data, please
            follow these steps:
          </p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              Contact our <strong>customer support</strong> via email at{" "}
              <a
                href="mailto:support@entekambolam.com"
                style={{ color: "#2563EB", textDecoration: "underline" }}
              >
                support@entekambolam.com
              </a>
              .
            </li>
            <li>
              Provide your <strong>registered email or phone number</strong> to
              verify your request.
            </li>
            <li>
              Our team will process the request and confirm account deletion
              within <strong>7 days</strong>.
            </li>
          </ul>

          {/* What Happens After Account Deletion */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            3. What Happens After Deletion?
          </h2>
          <p>
            Once your account is deleted, the following actions will be
            irreversible:
          </p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              All personal data (name, email, phone number) will be erased.
            </li>
            <li>
              Your order history and saved preferences will be permanently
              removed.
            </li>
            <li>
              Any active subscriptions or unused balances will be forfeited.
            </li>
          </ul>

          {/* Retained Data */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "20px 0",
            }}
          >
            4. Data Retention Policy
          </h2>
          <p>
            Some data may be retained due to legal or financial obligations:
          </p>
          <ul style={{ paddingLeft: "30px" }}>
            <li>
              <strong>Transaction history</strong> is stored for{" "}
              <strong>6 months</strong> for compliance and audit purposes.
            </li>
            <li>
              Any unresolved refunds or disputes must be settled before
              deletion.
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
            5. Contact Us for Support
          </h2>
          <p>
            If you have any account-related queries, please reach out to us:
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
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSupport;
