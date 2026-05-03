import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider } from "../auth/SessionContext";
import { DataStudioProvider } from "../data/DataStudioContext";
import { DashboardLayout } from "../layout/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { EditorPage } from "../pages/EditorPage";
import { LoginPage } from "../pages/LoginPage";
import { PreviewPage } from "../pages/PreviewPage";
import { SignupPage } from "../pages/SignupPage";
import { HomeRedirect } from "./HomeRedirect";
import { RequireAuth } from "./RequireAuth";
import { SyncStudioUser } from "./SyncStudioUser";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <DataStudioProvider>
          <SyncStudioUser />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>
            <Route
              path="/projects/:projectSlug/editor"
              element={
                <RequireAuth>
                  <EditorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/:projectSlug/preview"
              element={
                <RequireAuth>
                  <PreviewPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataStudioProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
