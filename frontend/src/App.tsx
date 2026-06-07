import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Loading } from "./components/Loading";
import { PrivateRoute } from "./hoc/PrivateRoute";
import { PublicRoute } from "./hoc/PublicRoute";

const Auth         = lazy(() => import("./pages/Auth"));
const Root         = lazy(() => import("./pages/Root"));
const NotFound     = lazy(() => import("./pages/NotFound"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Report       = lazy(() => import("./pages/Report"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function App() {
  const { initialize, isInitializing, user } = useAuthStore();

  useEffect(() => { initialize(); }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<PublicRoute user={user} isInitializing={isInitializing} />}>
          <Route path="/"     element={<Root />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
        <Route element={<PrivateRoute user={user} isInitializing={isInitializing} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports"   element={<Report />} />
        </Route>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
