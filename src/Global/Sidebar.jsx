import React, { useState } from "react";
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  useProSidebar,
  sidebarClasses,
} from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { tokens } from "../theme";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArtTrackIcon from "@mui/icons-material/ArtTrack";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { IconButton, Typography, useMediaQuery } from "@mui/material";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaymentIcon from "@mui/icons-material/Payment";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VpnLockOutlinedIcon from "@mui/icons-material/VpnLockOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import RateReviewIcon from "@mui/icons-material/RateReview";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
// import NextWeekIcon from "@mui/icons-material/NextWeek";
import UpcomingOutlinedIcon from "@mui/icons-material/UpcomingOutlined";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import "../Styles/sidebar.css";
import {
  ApprovalOutlined,
  ApprovalRounded,
  ApprovalTwoTone,
  SubscriptionsRounded,
  ArrowDropDown,
  ArrowDropUp,
  AssignmentTurnedInRounded,
  DeliveryDiningRounded,
  PoolRounded,
  ProductionQuantityLimitsRounded,
  Warehouse,
  MapOutlined,
  MapsUgcRounded,
} from "@mui/icons-material";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DescriptionIcon from "@mui/icons-material/Description";
import Diversity1OutlinedIcon from "@mui/icons-material/Diversity1Outlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useSelector } from "react-redux";
import logo from "../assets/logo.png";
import whitelogo from "../assets/whitelogo.png";
import alogo from "../assets/a_logo.png";
import "../Styles/sidebar.css";
import Utils from "./utils";

const Links = ({ title, to, icon, location, collapsed, active }) => {
  const theme = useTheme(); // Access the theme object
  const colors = tokens(theme.palette.mode);
  return (
    <Link to={to} style={{ all: "unset" }}>
      <MenuItem
        style={{ paddingLeft: collapsed ? "20%" : "" }}
        active={to === location}

        // icon={icon}
      >
        <span
          className="shape1"
          style={{
            backgroundColor: active
              ? colors.selectedText[100]
              : colors.selected[100],
          }}
        ></span>
        <span
          className="shape2"
          style={{
            backgroundColor: active
              ? colors.selectedText[100]
              : colors.selected[100],
          }}
        ></span>

        <span className="ps-menu-icon">{icon}</span>
        <Typography
          variant="h5"
          style={collapsed ? { display: "none" } : { display: "" }}
        >
          {title}
        </Typography>
      </MenuItem>
    </Link>
  );
};

function Sidebar() {
  const Uselocation = useLocation();
  const defaultPath = "Categories";
  const appSetting = useSelector((state) => {
    return state.AppSettings[state.AppSettings.length - 1];
  });
  const hasDelivery =
    appSetting &&
    appSetting?.find((setting) => setting.title == "HasDeliveryPartner")
      ?.value === "true";
  const location = Uselocation.pathname.replace("/", "") || defaultPath;
  const matches = useMediaQuery("(max-width:767px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { collapseSidebar, collapsed } = useProSidebar();
  const user = Utils.getUserData();
  const isAdmin = user?.role[0]?.role_id === 2;

  const [openMenus, setOpenMenus] = useState({}); // State to manage open submenus

  // Toggle submenu function
  const toggleSubmenu = (menuName) => {
    setOpenMenus((prev) => {
      return prev[menuName] ? {} : { [menuName]: true };
    });
  };

  const links = [
    // {
    //   name: "Upcoming Orders",
    //   to: "upcoming-orders",
    //   display: isAdmin,
    //   icon: function () {
    //     return <UpcomingOutlinedIcon />;
    //   },
    // },
    // {
    //   name: "Upcoming Subs",
    //   to: "upcoming-subs-orders",
    //   display: isAdmin,
    //   icon: function () {
    //     return <ContentPasteGoIcon />;
    //   },
    // },
    {
      name: "View Orders/Deliveries",
      to: "ViewOrdersDeliveries",
      display: isAdmin,
      icon: function () {
        return <ReceiptLongIcon />;
      },
    },
    {
      name: "Cart Orders",
      to: "cart-orders",
      display: isAdmin,
      icon: function () {
        return <AddShoppingCartIcon />;
      },
    },
    {
      name: "Categories",
      to: "Categories",
      display: isAdmin,
      icon: function () {
        return <CategoryOutlinedIcon />;
      },
    },
    {
      name: "Subcategories",
      to: "Subcategory",
      display: isAdmin,
      icon: function () {
        return <SubtitlesIcon />;
      },
    },
    {
      name: "Products",
      to: "Products",
      display: isAdmin,
      icon: function () {
        return <ArtTrackIcon />;
      },
    },
    {
      name: "Customers",
      to: "Customers",
      display: isAdmin,
      icon: function () {
        return <GroupIcon />;
      },
    },
    {
      name: "Orders",
      to: "#",
      display: isAdmin,
      icon: <LocalMallIcon />,
      subLinks: [
        {
          name: "Buy Once",
          to: "buyonce-orders",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Subscription",
          to: "subscription-orders",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Order Products",
          to: "order-products",
          icon: <Box className="arrowIconSubMenu" />,
        },
      ],
    },
    {
      name: "Transactions",
      to: "Transaction",
      display: isAdmin,
      icon: function () {
        return <PaymentIcon />;
      },
    },
    {
      name: "Supplier",
      to: "Supplier",
      display: isAdmin,
      icon: function () {
        return <Diversity1OutlinedIcon />;
      },
    },
    {
      name: "Warehouse",
      to: "Warehouse",
      display: isAdmin,
      icon: function () {
        return <FactoryOutlinedIcon />;
      },
    },
    {
      name: "Pincode",
      to: "Pincode",
      display: isAdmin,
      icon: function () {
        return <AddLocationAltOutlinedIcon />;
      },
    },
    {
      name: "Home",
      to: "Home",
      display: !isAdmin,
      icon: function () {
        return <DirectionsBikeIcon />;
      },
    },
    {
      name: "Delivery Management",
      to: "#",
      display: hasDelivery && isAdmin,
      icon: <DirectionsBikeIcon />,
      subLinks: [
        {
          name: "Delivery Executive",
          to: "DeliveryExecutive",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Delivery Routes",
          to: "DeliveryRoutes",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Executive Routes",
          to: "AssignDeliveryRoutes",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Assign Deliveries",
          to: "AssignDeliveryOrders",
          icon: <Box className="arrowIconSubMenu" />,
        },

        {
          name: "Delivery Reassign Requests",
          to: "DeliveryRequestReassign",
          icon: <Box className="arrowIconSubMenu" />,
        },
      ],
    },
    {
      name: "Inventory",
      to: "#",
      display: isAdmin,
      icon: <Inventory2OutlinedIcon />,
      subLinks: [
        {
          name: "Purchase Order",
          to: "PurchaseOrder",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Purchase Invoice",
          to: "PurchaseInvoice",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Purchase Return",
          to: "PurchaseReturn",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Purchase Payment",
          to: "PurchasePayment",
          icon: <Box className="arrowIconSubMenu" />,
        },
      ],
    },
    {
      name: "Approval Center",
      to: "#",
      display: isAdmin,
      icon: <ApprovalOutlined />,
      subLinks: [
        {
          name: "Products Approval",
          to: "ProductsApproval",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PO Approval",
          to: "PurchaseOrderApproval",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PI Approval",
          to: "PurchaseInvoiceApproval",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PR Approval",
          to: "PurchaseReturnApproval",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PP Approval",
          to: "PurchasePaymentApproval",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Stock Approval",
          to: "StockApproval",
          icon: <Box className="arrowIconSubMenu" />,
        },
      ],
    },
    {
      name: "Reports",
      to: "#",
      display: isAdmin,
      icon: <QueryStatsIcon />,
      subLinks: [
        {
          name: "Delivery Report",
          to: "DeliveryReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Customers Report",
          to: "CustomersReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Reconciliation Report",
          to: "ReconciliationReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Sales Report",
          to: "SalesReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "Subscribers & Subscriptions",
          to: "SubscribersAndSubscriptions",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PO Report",
          to: "PoReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PI Report",
          to: "PiReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PR Report",
          to: "PrReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "PP Report",
          to: "PpReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
        {
          name: "SA Report",
          to: "SaReport",
          icon: <Box className="arrowIconSubMenu" />,
        },
      ],
    },
    {
      name: "Banners",
      to: "Banners",
      display: isAdmin,
      icon: function () {
        return <ViewCarouselOutlinedIcon />;
      },
    },
    {
      name: "Notifications",
      to: "Notification",
      display: isAdmin,
      icon: function () {
        return <NotificationsActiveOutlinedIcon />;
      },
    },
    {
      name: "Low Wallet Notifications",
      to: "Low-Wallet-Notification",
      display: isAdmin,
      icon: function () {
        return <WalletOutlinedIcon />;
      },
    },
    // {
    //   name: "Settings",
    //   to: "Setting",
    //   display: isAdmin,
    //   icon: function () {
    //     return <SettingsIcon />;
    //   },
    // },
    {
      name: "Web App Settings",
      to: "web-app-setting",
      display: isAdmin,
      icon: function () {
        return <i class="fa-brands fa-chrome"></i>;
      },
    },
    {
      name: "Invoice Settings",
      to: "invoice-setting",
      display: isAdmin,
      icon: function () {
        return <DescriptionIcon />;
      },
    },

    // {
    //   name: "Payment Gateway",
    //   to: "payment-getway",
    //   display: isAdmin,
    //   icon: function () {
    //     return <i class="fa-brands fa-paypal"></i>;
    //   },
    // },
    {
      name: "Testimonial",
      to: "Testimonial",
      display: isAdmin,
      icon: function () {
        return <RateReviewIcon />;
      },
    },
    {
      name: "Social Media",
      to: "social-media",
      display: isAdmin,
      icon: function () {
        return <i class="fa-regular fa-thumbs-up"></i>;
      },
    },
    {
      name: "Privacy",
      to: "Privacy",
      display: isAdmin,
      icon: function () {
        return <VpnLockOutlinedIcon />;
      },
    },
    {
      name: "Terms & Condition",
      to: "Terms",
      display: isAdmin,
      icon: function () {
        return <LibraryBooksOutlinedIcon />;
      },
    },
    {
      name: "About-Us",
      to: "About",
      display: isAdmin,
      icon: function () {
        return <InfoOutlinedIcon />;
      },
    },
  ];

  return (
    <div className="sideBar">
      <Box height={"100vh"}>
        <ProSidebar
          className="proSidebar"
          defaultCollapsed={matches}
          backgroundColor={colors.navbarBG[400]}
          height={"100vh"}
          paddingBottom={"50px"}
          rootStyles={{
            [`.${sidebarClasses.container}`]: {
              height: "100vh",
            },
            [`.${sidebarClasses.root}`]: {
              borderRight: "none !important",
            },
          }}
        >
          <Menu
            style={{
              position: "sticky",
              top: 0,
              zIndex: 9,
              background: "#0e0e23",
            }}
            menuItemStyles={{
              button: ({ level, active, disabled }) => {
                // only apply styles on first level elements of the tree
                if (level === 0)
                  return {
                    height: "40px",
                    color: disabled ? "#f5d9ff" : "#d359ff",
                    backgroundColor: active ? "#6870fa" : undefined,
                    "&:hover": {
                      backgroundColor: "transparent !important",
                    },
                  };
              },
            }}
          >
            <MenuItem style={{ margin: "0" }} className="menuOutlineBar">
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
              >
                <img
                  src={collapsed ? alogo : whitelogo}
                  alt="EnteKambolam Logo"
                  style={{ height: "50px", width: "auto" }}
                />
              </Box>
            </MenuItem>
          </Menu>

          <Menu
            iconShape="square"
            menuItemStyles={{
              button: ({ level, active, disabled }) => {
                // only apply styles on first level elements of the tree
                if (level === 0)
                  return {
                    height: "50px",
                    color: active
                      ? `${colors.selectedText[100]} !important`
                      : `${colors.text[100]} !important`,
                    backgroundColor: active ? colors.selected[100] : undefined,
                    "&:hover": {
                      backgroundColor: `transparent`,
                      color: `${colors.primary} !important`,
                    },
                  };
              },
            }}
          >
            <Box
              mt="1px"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: collapsed ? "center" : "flex-start",
                paddingLeft: "1rem",
              }}
            >
              {links.map((link, active) =>
                link.display ? (
                  <Box
                    key={link.name}
                    sx={{ width: "100%" }}
                    className={
                      theme.palette.mode === "light"
                        ? "mainReportLink"
                        : "mainReportLink without"
                    }
                  >
                    {link.subLinks ? (
                      <>
                        <MenuItem
                          className="menuLinkName"
                          onClick={() => toggleSubmenu(link.name)}
                          style={{
                            color:
                              location === link.to
                                ? colors.selectedText[100]
                                : colors.text[100],
                          }}
                          active={link.to === location}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            width="100%"
                            className="linkName"
                          >
                            <span
                              className="shape1"
                              style={{
                                backgroundColor: active
                                  ? colors.selected[100]
                                  : colors.selectedText[100],
                              }}
                            ></span>
                            <span
                              className="shape2"
                              style={{
                                backgroundColor: active
                                  ? colors.selected[100]
                                  : colors.selectedText[100],
                              }}
                            ></span>
                            <span className="ps-menu-icon">{link.icon}</span>
                            {!collapsed && (
                              <Typography
                                variant="h5"
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  paddingRight: "10px",
                                }}
                              >
                                {link.name}{" "}
                                <span>
                                  {openMenus[link.name] ? (
                                    <i className="fa angle fa-angle-down "></i>
                                  ) : (
                                    <i className="fa angle fa-angle-right"></i>
                                  )}
                                </span>
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                        {/* Render Submenu if open */}
                        {openMenus[link.name] &&
                          link.subLinks.map((subLink) => (
                            <Links
                              className="reportSubLink"
                              key={subLink.name}
                              title={subLink.name}
                              to={subLink.to}
                              icon={subLink.icon}
                              location={location}
                              collapsed={collapsed}
                              // active={subLink.to === location}
                            />
                          ))}
                      </>
                    ) : (
                      link.display && (
                        <Links
                          key={link.name}
                          title={link.name}
                          to={link.to}
                          icon={link.icon()}
                          location={location}
                          collapsed={collapsed}
                        />
                      )
                    )}
                  </Box>
                ) : null
              )}
            </Box>
          </Menu>
        </ProSidebar>
      </Box>
    </div>
  );
}

export default Sidebar;
