import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import {
  LinearProgress, Link, Snackbar, IconButton,
  InputAdornment,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import api from "../Data/api";
import axios from "axios";
import loginBG from "../assets/IMGBG.jpg";
import log0BG from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, Email, LockOutlined } from '@mui/icons-material';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Login() {
  const [isLoading, setisLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [type, settype] = React.useState("");
  const [msg, setmsg] = React.useState("");
  const [roleId, setRoleId] = React.useState(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (event) => {
    setisLoading(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const loginData = {
      email: data.get("email"),
      password: data.get("password"),
    };

    try {
      const login = await axios.post(`${api}/login`, loginData);
      const { data } = login;
      setisLoading(false);
      setOpen(true);
      if (data.response === 200) {
        setmsg("login Success");
        settype("success");
        const userData = {
          token: data.token,
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          role: data.data.role,
          loginUserId: data.data.id,
        };
        if (data.data.role[0].role_title === "ADMIN") {
          const admin = { ...userData, fcm: data.data?.fcm };
          setRoleId(data.data.role[0].role_id);
          sessionStorage.setItem("admin", JSON.stringify(admin));
          if (sessionStorage.getItem("driver")) {
            sessionStorage.removeItem("driver");
            sessionStorage.removeItem("deliveryDate");
          }
        } else {
          const driver = { ...userData, executiveId: data.data.executive_id };
          setRoleId(data.data.role[0].role_id);

          sessionStorage.setItem("driver", JSON.stringify(driver));
          if (sessionStorage.getItem("admin")) {
            sessionStorage.removeItem("admin");
            sessionStorage.removeItem("deliveryDate");
          }
          navigate("/Home");
        }
        window.location.reload("/");
      } else {
        if (data.response === 403) {
          setmsg("Your account is inactive. Please contact administration.");
          settype("error");
          return;
        }
        setmsg("Invalid Email Or Password");
        settype("error");
      }
    } catch (error) {
      setisLoading(false);
      console.log(error);
    }
  };

  return (
    <div>
      {isLoading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress color="secondary" />
        </Box>
      )}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={type} sx={{ width: "100%" }}>
          {msg}
        </Alert>
      </Snackbar>
      <Box
        component="main"
        maxWidth="xs"
        sx={{ display: "flex", width: "100vw", height: "100vh" }}
      >
        <Box
          width={"50%"}
          sx={{
            backgroundImage: `url(${loginBG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></Box>
        <CssBaseline />
        <Box
          sx={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "50%",
            padding: "30px",
          }}
        >
          <Box width={"70%"} display={"flex"} alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
            <img
              style={{
                maxWidth: "100%",
                width: "220px",
              }}
              src={log0BG}
            />

            <Typography sx={{ mt: 2 }} variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Welcome back!
            </Typography>
            <Typography sx={{ mb: 2 }} variant="body1" color="text.secondary" gutterBottom>
              Enter your email and password
            </Typography>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "70%", }}
          >
            <TextField
              variant="outlined"
              className="title-menu"
              required
              fullWidth
              id="email"
              placeholder="Email"
              // label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              color="secondary"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#9e9e9e', fontSize:'20px' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              placeholder="Password"
              // label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              color="secondary"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#9e9e9e', fontSize:'20px' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} size="small" sx={{
                      padding: '4px',
                    }}>
                      {showPassword ? (
                        <Visibility sx={{ color: '#9e9e9e', fontSize:'20px' }} />
                      ) : (
                        <VisibilityOff sx={{ color: '#9e9e9e', fontSize:'20px' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{
                mt: 4,
                color: '#fff',
                padding: '10px 0',
                borderRadius: '30px',
                '&:hover': {
                  backgroundColor: '#57c569',
                },
              }}

            >
              Login
            </Button>
          </Box>
          {/* <Link
            // href="http://ziridailyadmin.s3-website.ap-south-1.amazonaws.com/forget-password"
            href="http://localhost:3000/forget-password"
            target="_blank"
            rel="noopener"
          >
            Forget Password?
          </Link> */}
          {/* <Box mt={5}>
            <Typography component="h6" variant="h5">
              Demo Email- <b>admin@gmail.com</b>
            </Typography>
            <Typography component="h6" variant="h5">
              Demo password- <b>12345678</b>
            </Typography>
          </Box> */}
        </Box>
      </Box>
    </div>
  );
}
