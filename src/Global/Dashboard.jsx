import React from "react";
import { Route, Routes } from "react-router-dom";
import Categories from "../Pages/Categories";
import Subcat from "../Pages/Subcat";
import Customers from "../Pages/Customers";
import Products from "../Pages/Products";
import Product from "../Pages/Product";
import AddProduct from "../Pages/AddProduct";
import Transaction from "../Pages/Transaction";
import Orders from "../Pages/Orders";
import NewOrder from "../Pages/NewOrder";
import UpdateOrder from "../Pages/UpdateOrder";
import Banners from "../Pages/Banners";
import DeliveryExecutive from "../Pages/DeliveryExecutive";
import Edit from "../Pages/Edit";
import Pincode from "../Pages/Pincode";
import Testimonial from "../Pages/Testimonial";
import Setting from "../Pages/Setting";
import Notification from "../Pages/Notification";
import NotificationLowWallet from "../Pages/NotificationLowWallet";
import DeliveryReport from "../Pages/Reports/DeliveryReport";
import UpcomingOrders from "../Pages/UpcomingOrders";
import UpcomingSubsOrder from "../Pages/UpcomingSubsOrder";
import Webappsetting from "../Pages/Webappsetting";
import Loocation from "../Pages/Loocation";
import Paymentgetway from "../Pages/Paymentgetway";
import Socialmedia from "../Pages/Socialmedia";
import InvoiceSettings from "../Pages/InvoiceSetting";
import SubscriptionsReport from "../Pages/Reports/SubscriptionsReport";
import SalesReport from "../Pages/Reports/SalesReport";
import CartOrders from "../Pages/CartOrders";
import ReconciliationReport from "../Pages/Reports/ReconciliationReport";
import CustomersReport from "../Pages/Reports/CustomersReport";
import ProductsApproval from "../Pages/ApprovalCenter/ProductsApproval";
import NewVendor from "../Pages/NewVendor";
import Supplier from "../Pages/Supplier";
import Warehouse from "../Pages/Warehouse";
import NewWarehouse from "../Pages/NewWarehouse";
import PurchaseOrder from "../Pages/PurchaseOrder";
import NewPurchaseOrder from "../Pages/NewPurchaseOrder";
import POApproval from "../Pages/ApprovalCenter/POApproval";
import PurchaseInvoice from "../Pages/PurchaseInvoice";
import PurchasePDFViewer from "../Pages/PurchasePDFViewer";
import StockApproval from "../Pages/ApprovalCenter/StockApproval";
import PoReport from "../Pages/Reports/PoReport";
import PiReport from "../Pages/Reports/PiReport";
import PIApproval from "../Pages/ApprovalCenter/PIApproval";
import PurchasePayment from "../Pages/PurchasePayment";
import PPApproval from "../Pages/ApprovalCenter/PPApproval";
import PurchasePaymentReport from "../Pages/Reports/PurchasePaymentReport";
import StockAdjustmentReport from "../Pages/Reports/StockAdjustmentReport";
import BuyOnceOrders from "../Pages/Orders/BuyOnce";
import SubscriptionOrders from "../Pages/Orders/Subscription";
import DriverDetails from "../Pages/driverDetails";
import DeliveryRoutes from "../Pages/Delivery/DeliveryRoutes";
import PurchaseReturn from "../Pages/PurchaseReturn";
import NewPurchaseReturn from "../Pages/NewPurchaseReturn";
import PRApproval from "../Pages/ApprovalCenter/PRApproval";
import PRReport from "../Pages/Reports/PRReport";
import AssignDeliveryRoutes from "../Pages/Delivery/AssignDeliveryRoutes";
import AssignExecutiveRoutes from "../Pages/Delivery/AssignExecutiveRoutes";
import Utils from "./utils";
import Home from "../Pages/Home";
import DeliveryOrderDetails from "../Pages/Delivery/DeliveryOrderDetails";
import ConfirmStock from "../Pages/Delivery/ConfirmStock";
import DeliveryOrders from "../Pages/Delivery/DeliveryOrders";
import ProtectedRoute from "./ProtectedRoute";
import AssignDeliveryOrders from "../Pages/Delivery/AssignDeliveryOrders";
import AssignExecutiveOrders from "../Pages/Delivery/AssignExecutiveOrders";
import DeliveryReAssigneRequest from "../Pages/Delivery/DeliveryReAssigneRequest";
import OrderProductList from "../Pages/Orders/OrderProductList";
import ViewOrdersDeliveries from "../Pages/Delivery/ViewOrdersDeliveries";
import Coupons from "../Pages/Coupons/Coupons";

function Dashboard() {
  const user = Utils.getUserData();
  const isAdmin = user?.role[0]?.role_id === 2;
  return (
    <div className="dashboard" style={{ padding: "1.5rem" }}>
      <Routes>
        <Route path="/" element={isAdmin ? <Categories /> : <Home />} />
        <Route
          path="/DeliveryReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <DeliveryReport />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/upcoming-orders"
          element={
            <ProtectedRoute condition={isAdmin}>
              <UpcomingOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upcoming-subs-orders"
          element={
            <ProtectedRoute condition={isAdmin}>
              <UpcomingSubsOrder />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/cart-orders"
          element={
            <ProtectedRoute condition={isAdmin}>
              <CartOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Categories"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subcategory"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Subcat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Supplier"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Supplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newvendor"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewVendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editvendor/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewVendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Warehouse"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Warehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newwarehouse"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editwarehouse/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchaseOrder"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PurchaseOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newpurchaseorder"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewPurchaseOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editpurchaseorder/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewPurchaseOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchaseReturn"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PurchaseReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newpurchaseReturn"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewPurchaseReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editpurchaseReturn/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewPurchaseReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchasePDFViewer/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PurchasePDFViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchaseInvoice"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PurchaseInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchasePayment"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PurchasePayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Customers"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CustomersReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <CustomersReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SalesReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <SalesReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ReconciliationReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <ReconciliationReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SubscribersAndSubscriptions"
          element={
            <ProtectedRoute condition={isAdmin}>
              <SubscriptionsReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PoReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PoReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PiReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PiReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PrReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PRReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PpReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PurchasePaymentReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SaReport"
          element={
            <ProtectedRoute condition={isAdmin}>
              <StockAdjustmentReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ProductsApproval"
          element={
            <ProtectedRoute condition={isAdmin}>
              <ProductsApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchaseOrderApproval"
          element={
            <ProtectedRoute condition={isAdmin}>
              <POApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchaseInvoiceApproval"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PIApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchaseReturnApproval"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PRApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PurchasePaymentApproval"
          element={
            <ProtectedRoute condition={isAdmin}>
              <PPApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/StockApproval"
          element={
            <ProtectedRoute condition={isAdmin}>
              <StockApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DeliveryExecutive"
          element={
            <ProtectedRoute condition={isAdmin}>
              <DeliveryExecutive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DriverDetails"
          element={
            <ProtectedRoute condition={isAdmin}>
              <DriverDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DriverDetails/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <DriverDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DeliveryRoutes"
          element={
            <ProtectedRoute condition={isAdmin}>
              <DeliveryRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Home"
          element={
            <ProtectedRoute condition={!isAdmin}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DeliveryOrderDetails"
          element={
            <ProtectedRoute condition={!isAdmin}>
              <DeliveryOrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ConfirmStock"
          element={
            <ProtectedRoute condition={!isAdmin}>
              <ConfirmStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DeliveryOrders"
          element={
            <ProtectedRoute condition={!isAdmin}>
              <DeliveryOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AssignDeliveryRoutes"
          element={
            <ProtectedRoute condition={isAdmin}>
              <AssignDeliveryRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AssignExecutiveRoutes"
          element={
            <ProtectedRoute condition={isAdmin}>
              <AssignExecutiveRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AssignDeliveryOrders"
          element={<AssignDeliveryOrders />}
        />
        <Route
          path="/ViewOrdersDeliveries"
          element={<ViewOrdersDeliveries />}
        />
        <Route
          path="/AssignExecutiveOrders"
          element={<AssignExecutiveOrders />}
        />
        <Route
          path="/DeliveryRequestReassign"
          element={<DeliveryReAssigneRequest />}
        />
        <Route
          path="/Products"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addproduct"
          element={
            <ProtectedRoute condition={isAdmin}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Transaction"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Transaction />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/Orders" element={<Orders />} /> */}
        <Route
          path="/buyonce-orders"
          element={
            <ProtectedRoute condition={isAdmin}>
              <BuyOnceOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription-orders"
          element={
            <ProtectedRoute condition={isAdmin}>
              <SubscriptionOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-products"
          element={
            <ProtectedRoute condition={isAdmin}>
              <OrderProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/neworder"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NewOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute condition={isAdmin}>
              <UpdateOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Banners"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Banners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/About"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Edit page={1} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Privacy"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Edit page={2} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Terms"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Edit page={3} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Pincode"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Pincode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Testimonial"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Testimonial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Coupons"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Coupons />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/Setting"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Setting />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/Notification"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Low-Wallet-Notification"
          element={
            <ProtectedRoute condition={isAdmin}>
              <NotificationLowWallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/web-app-setting"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Webappsetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice-setting"
          element={
            <ProtectedRoute condition={isAdmin}>
              <InvoiceSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery-location"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Loocation />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/payment-getway"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Paymentgetway />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/social-media"
          element={
            <ProtectedRoute condition={isAdmin}>
              <Socialmedia />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h2>Page not found</h2>} />
      </Routes>
    </div>
  );
}

export default Dashboard;
