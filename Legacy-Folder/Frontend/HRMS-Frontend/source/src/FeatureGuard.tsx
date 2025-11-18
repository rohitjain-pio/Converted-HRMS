import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

type WithRedirect = {
  redirectTo: string;
  fallback?: ReactNode;
};

type WithFallback = {
  fallback: ReactNode;
  redirectTo?: string;
};

type FeatureGuardProps = {
  children: ReactNode;
  flag: string;
} & (WithRedirect | WithFallback);

const FeatureGuard = (props: FeatureGuardProps) => {
  const { children, flag, fallback = null, redirectTo } = props;

  if (fallback === null && !redirectTo) {
    throw new Error(
      `FeatureGuard("${flag}") requires either a \`fallback\` or a \`redirectTo\` prop.`
    );
  }

  const enabled = useFeatureFlag(flag);

  if (!enabled) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export default FeatureGuard;
