import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Products from "./pages/Products";
import Challans from "./pages/Challans";
import ChallanCreate from "./pages/ChallanCreate";
import ChallanDetail from "./pages/ChallanDetail";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/challans"
        element={
          <ProtectedRoute>
            <Layout>
              <Challans />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/challans/new"
        element={
          <ProtectedRoute roles={["ADMIN", "SALES"]}>
            <Layout>
              <ChallanCreate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/challans/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ChallanDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
