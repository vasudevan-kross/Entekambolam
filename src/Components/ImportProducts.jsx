import React, { useState } from "react";
import axios from "axios";
import api from "../Data/api";

const ImportProducts = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const url = `${api}/product/import_products`; // Ensure `api` is defined or replace with the full URL
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: url,
        headers: {
          Authorization: token, // Ensure `token` is defined or replace with actual token
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      };

      const response = await axios(config);

      setLoading(false); // Stop loading after response

      if (response.data.success) {
        setMessage(response.data.message);
      } else if (response.data.error) {
        setError(response.data.error);
      } else {
        setMessage("Products imported successfully.");
      }
    } catch (err) {
      if (err.response) {
        // Backend responded with an error
        setError(
          err.response.data.error ||
            "An error occurred while importing products."
        );
      } else if (err.request) {
        // Request was made but no response received
        setError("No response from server. Please try again later.");
      } else {
        // Something else went wrong
        setError("Error importing products. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Import Products</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: "block", marginBottom: "10px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && (
        <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default ImportProducts;
