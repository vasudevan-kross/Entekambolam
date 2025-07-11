import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const errorMsg = "Please enter a valid amount";
const useStyles = makeStyles(() => ({
  dialogContent: {
    width: "400px",
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  errorMessage: {
    color: "red",
    marginTop: "5px",
  },
  textField: {
    // Remove up/down arrows on number inputs
    "& input[type=number]": {
      MozAppearance: "textfield", // Firefox
      WebkitAppearance: "none", // Chrome, Safari, Edge
      appearance: "none",
    },
    width: "100%",
  },
  errorLabel:{
    width: "100%",
  },
}));

const RefundDialog = ({
  openRefundModal,
  handleRefundModalClose,
  amount,
  setAmount,
  amountError,
  setAmountError,
  reason,
  setReason,
  isRefundLoading,
  setIsRefundLoading,
  handleRefund,
}) => {
  const classes = useStyles();

  // Ensure only non-negative values
  const handleAmountChange = (e) => {
    const value = e.target.value;
    const isValid = !isNaN(value) && value > 0;
  
    setAmount(value);
    setAmountError(isValid ? "" : errorMsg);
    setIsRefundLoading(!isValid);
  };

  return (
    <Dialog open={openRefundModal} onClose={handleRefundModalClose}>
      <DialogTitle>Refund</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          label="Amount"
          type="number"
          variant="outlined"
          value={amount}
          onChange={handleAmountChange}
          required
          error={Boolean(amountError)}
          className={classes.textField}
          inputProps={{ min: 1 }} // Enforce non-negative values
        />
        {amountError && (
          <div className={`${classes.errorMessage} ${classes.errorLabel}`}>{amountError}</div>
        )}
        <TextField
          margin="dense"
          label="Reason (Optional)"
          type="text"
          variant="outlined"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={classes.textField}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRefundModalClose} color="primary" variant="contained">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={isRefundLoading}
          onClick={handleRefund}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;
