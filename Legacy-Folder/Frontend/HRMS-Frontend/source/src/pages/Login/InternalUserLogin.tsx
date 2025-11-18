import AppUpdateDialog from "@/components/AppUpdateDialog/AppUpdateDialog";
import UserLogin from "@/pages/Login/auth-forms/UserLogin";
import LoginLayout from "@/pages/Login/LoginLayout";

// ================================|| INTERNAL USER LOGIN ||================================ //

export default function InternalUserLogin() {
  return (
    <LoginLayout title="User Login" spacing={1}>
      <AppUpdateDialog />
      <UserLogin />
    </LoginLayout>
  );
}
