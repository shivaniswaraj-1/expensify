import { Navigate, Outlet } from "react-router-dom";
import { Loading } from "@/components/Loading";
import { User } from "@/types/auth";

export const PublicRoute = ({
  user,
  isInitializing,
}: {
  user: User | null;
  isInitializing: boolean;
}) => {
  if (isInitializing) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
