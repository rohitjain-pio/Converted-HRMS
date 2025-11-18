import AppUpdateDialog from "@/components/AppUpdateDialog/AppUpdateDialog";
import AuthLogin from "@/pages/Login/auth-forms/AuthLogin";
import LoginLayout from "@/pages/Login/LoginLayout";

// ================================|| LOGIN ||================================ //

export default function Login() {
  return (
    <LoginLayout title="Sign in to start Your Session" spacing={3}>
      <AppUpdateDialog />
      <AuthLogin />
    </LoginLayout>
  );
}
