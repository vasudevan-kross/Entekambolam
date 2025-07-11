import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, TextField, Box, Button, Snackbar, Alert, useTheme, Grid } from "@mui/material";
import { tokens } from "../theme";
const Home = () => {


    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [formData, setFormData] = useState({
        city: "",
        deliveryDate: "",
        timeSlot: "",
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertMsg, setAlertMsg] = useState("");
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.city || !formData.deliveryDate || !formData.timeSlot) {
            setAlertType("error");
            setAlertMsg("All fields are mandatory");
            setSnackbarOpen(true);
            return;
        }
        sessionStorage.setItem("deliveryDate", formData.deliveryDate);
        setAlertType("success");
        setAlertMsg("Form submitted successfully");
        setSnackbarOpen(true);
        navigate("/DeliveryOrderDetails");
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleSnackbarClose} severity={alertType} sx={{ width: "100%" }}>
                    {alertMsg}
                </Alert>
            </Snackbar>
            <Box>
                <Box className="flex items-center flex-wrap justify-between gap-4 w-100 title-menu">
                    <Typography
                        className=""
                        variant="h2"
                        component={"h2"}
                        fontWeight={600}
                        fontSize={"1.5rem"}
                        lineHeight={"2rem"}
                        sx={{
                            color: theme.palette.mode === "dark" ? "#ffffffe6" : "#0e0e23",
                        }}
                    >
                        Select City and Time slot
                    </Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} className={`text-card-foreground shadow-sm rounded-lg p-4 xl:p-2 ${theme.palette.mode === 'dark' ? "bg-darkcard" : "bg-card"
                    }`}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6} lg={6}>
                            <TextField
                                color="secondary"
                                required
                                fullWidth
                                id="city"
                                label="Select City"
                                name="city"
                                autoComplete="text"
                                autoFocus
                                value={formData.city}
                                size="small"
                                onChange={handleChange}
                                select
                                SelectProps={{ native: true }}
                            >
                                <option value="" disabled>
                                    Select City
                                </option>
                                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6} lg={6}>
                            <TextField
                                color="secondary"
                                required
                                fullWidth
                                id="deliveryDate"
                                label="Select Delivery Date"
                                name="deliveryDate"
                                type="date"
                                value={formData.deliveryDate}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} lg={6}>
                            <TextField
                                color="secondary"
                                required
                                fullWidth
                                id="timeSlot"
                                label="Select Time Slot"
                                name="timeSlot"
                                value={formData.timeSlot}
                                size="small"
                                onChange={handleChange}
                                select
                                SelectProps={{ native: true }}
                            >
                                <option value="" disabled>
                                    Select Time Slot
                                </option>
                                <option value="05:00 AM - 07:00 AM">05:00 AM - 07:00 AM</option>
                            </TextField>
                        </Grid>
                    </Grid>
                    <Box style={{ marginTop: "16px" }} xs={12} md={6} lg={6}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary">
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default Home;