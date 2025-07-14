import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  IconButton,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import { ColorModeContext } from "./../theme";
import {
  Sidebar as ProSidebar,
  useProSidebar,
  sidebarClasses,
} from "react-pro-sidebar";
import image from "../assets/avataar.avif";
import {
  DarkModeOutlined,
  FitScreen, FullscreenExit,
  LightModeOutlined,
  LogoutOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Utils from "./utils";

function Topbar() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const user = Utils.getUserData();
  const { collapseSidebar, collapsed } = useProSidebar();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("driver");
    sessionStorage.removeItem('deliveryDate')
    window.location.reload("/");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      p={1}
      width="100%"
      className="header"
      sx={{
        backgroundColor:
          theme.palette.mode === "dark" ? "#0e0e23" : "#ffffffe6",
      }}
    >
      <IconButton onClick={() => collapseSidebar()}>
        <MenuOutlinedIcon />
      </IconButton>
      <Box display="flex" gap={"0.5rem"} justifyContent={"flex-end"}>
        <IconButton onClick={toggleFullScreen} sx={{ padding: '8px 10px' }}>
          {isFullScreen ? <FullscreenExit fontSize="small" /> : <FitScreen fontSize="small" />}
        </IconButton>
        <IconButton onClick={colorMode.toggleColorMode} sx={{ padding: '8px 10px' }}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlined fontSize="small" />
          ) : (
            <LightModeOutlined fontSize="small" />
          )}
        </IconButton>

        {/* <IconButton>
          <PersonOutlineOutlined />
        </IconButton> */}
        {/* <IconButton
          onClick={() => {
            setOpen(true);
          }}
        >
          <LogoutOutlined />
        </IconButton> */}
        {/* Avatar Button */}
        <IconButton onClick={handleAvatarClick}>
          <Avatar alt="Admin User" src={image} />
        </IconButton>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="confirm-logout-dialog"
        >
          <DialogTitle id="confirm-logout-dialog">Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to log out?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="primary" variant="contained">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              color="error"
              variant="contained"
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>

        {/* Avatar Popup Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "220px",
            },
          }}
        >
          <MenuItem>
            <Tooltip title={`${user?.email}`} arrow>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.email}
              </Typography>
            </Tooltip>
          </MenuItem>
          {user?.role[0].role_id !== 4 && <MenuItem>
            <Typography variant="body2" color="text.secondary">
              {user?.role[0].role_title}
            </Typography>
          </MenuItem>}
          {user?.role[0].role_id === 4 && <MenuItem>
            <Typography variant="body2" color="text.secondary">
              {`${user?.name} (DRIVER)`}
            </Typography>
          </MenuItem>}
          <Divider />
          {/* <MenuItem onClick={() => console.log('View Profile')}>
            <Typography variant="body2">View Profile</Typography>
          </MenuItem> */}
          <MenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            <Typography variant="body2" color="error">
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

export default Topbar;
