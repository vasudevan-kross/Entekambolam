import React from "react";
import { Skeleton, Stack } from "@mui/material";

const LoadingSkeleton = ({ rows = 6, height = 30 }) => {
  return (
    <Stack spacing={1}>
      <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      {[...Array(rows)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          animation="wave"
          width="100%"
          height={height}
        />
      ))}
    </Stack>
  );
};

export default LoadingSkeleton;