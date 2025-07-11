import React, { useState } from "react";
import PropTypes from "prop-types";
import { Typography, Button } from "@mui/material";
import { Image } from "@mui/icons-material";

const FileUpload = ({
  id,
  label,
  name,
  accept,
  onChange,
  placeholder,
  color,
  size,
  isShowSupportedFormat,
}) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : "No file chosen");
    if (onChange) {
      onChange(event); // Pass the event back to the parent component
    }
  };

  return (
    <div>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Button
        variant="outlined"
        component="label"
        color={color}
        size={size}
        style={{ marginBottom: "10px" }}
      >
        {placeholder}
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Image />
      </Button>
      {isShowSupportedFormat && (
        <Typography variant="caption" color="textSecondary">
          Supported formats: {accept.replace(/,/g, ", ")}
        </Typography>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  accept: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  isShowSupportedFormat: PropTypes.bool,
};

FileUpload.defaultProps = {
  accept: ".png, .jpg, .jpeg",
  placeholder: "No file chosen",
  color: "secondary",
  size: "small",
  isShowSupportedFormat: false,
};

export default FileUpload;
