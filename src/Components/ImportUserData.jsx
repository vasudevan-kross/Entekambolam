import React, { useState } from "react";
import axios from "axios";
import api from "../Data/api";

const ImportCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // To handle loading state
  const [errorMessages, setErrorMessages] = useState([]); // To handle error messages
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessages([]); // Clear error messages when a new file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessages(["Please select a file."]);
      return;
    }

    const formData = new FormData();
    formData.append("csv_file", file);

    setLoading(true); // Start loading

    try {
      const url = `${api}/import_users`;
      var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: url,
        headers: {
          Authorization: token,
        },
        data: formData,
      };

      try {
        const response = await axios(config);
        setLoading(false); // Stop loading after response

        // If response contains success or errors
        if (response.data.success) {
          alert("File imported successfully!");
        } else if (response.data.errors && response.data.errors.length > 0) {
          setErrorMessages(response.data.errors); // Set error messages if any
        }
      } catch (error) {
        setLoading(false); // Stop loading on error
        console.error(error);
        setErrorMessages(["Error importing file, please try again."]);
      }
    } catch (error) {
      setLoading(false); // Stop loading on error
      console.error(error);
      setErrorMessages(["Error importing file"]);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Display error messages if any */}
      {errorMessages.length > 0 && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <ul>
            {errorMessages.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportCSV;
