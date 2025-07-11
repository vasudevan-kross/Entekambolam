import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ condition, children }) => {
  if (!condition) {
    return <Navigate to="*" replace />;
  }
  return children;
};

export default ProtectedRoute;
