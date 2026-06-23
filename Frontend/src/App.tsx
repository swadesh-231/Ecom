import { Routes, Route } from "react-router";
import { useBootstrapAuth } from "@/hooks/use-bootstrap-auth";

import { CustomerLayout } from "@/components/layout/customer-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/guards/protected-route";
import { AdminRoute } from "@/components/guards/admin-route";

import { HomePage } from "@/pages/home";
import { CollectionsPage } from "@/pages/collections";
import { ProductDetailsPage } from "@/pages/product-details";
import { CheckoutPage } from "@/pages/checkout";
import { OrderSuccessPage } from "@/pages/order-success";
import { OrdersPage } from "@/pages/orders";
import { SignInPage, SignUpPage } from "@/pages/auth";
import { NotFoundPage } from "@/pages/not-found";

import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminProductsPage } from "@/pages/admin/products";
import { AdminOrdersPage } from "@/pages/admin/orders";

const App = () => {
  // Registers the Clerk token getter and syncs the DB user/role on sign-in.
  useBootstrapAuth();

  return (
    <Routes>
      {/* Storefront */}
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="collection/:id" element={<ProductDetailsPage />} />
        <Route path="sign-in/*" element={<SignInPage />} />
        <Route path="sign-up/*" element={<SignUpPage />} />

        {/* Requires sign-in */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
