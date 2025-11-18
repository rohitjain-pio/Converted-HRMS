import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { hasPermission } from "@/utils/hasPermission";
import { useUserStore } from "@/store";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission: string;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requiredRoles,
  children,
}) => {
  const { isLoggedIn, userData } = useUserStore();

  const userRole = userData.roleName;

  const hasRolePermission = Array.isArray(requiredRoles)
    ? requiredRoles.includes(userRole)
    : true;

  return isLoggedIn ? (
    hasPermission(requiredPermission) && hasRolePermission ? (
      <>{children}</>
    ) : (
      <Navigate to="/unauthorized" />
    )
  ) : (
    <Navigate to="/" />
  );
};

export default ProtectedRoute;
