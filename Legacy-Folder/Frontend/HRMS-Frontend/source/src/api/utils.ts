import { useUserStore } from "@/store";
import { pca as instance } from "@/main";
import { useProfileStore } from "@/store/useProfileStore";
import useModulePermissionsStore from "@/store/useModulePermissionsStore";

export async function logoutUser() {
  await instance.logoutRedirect({
    onRedirectNavigate: () => false,
  });
  const { isInternalUser, resetUserData } = useUserStore.getState();
  const { resetProfileData } = useProfileStore.getState();

  resetUserData();
  resetProfileData();
  useModulePermissionsStore.getState().setModulePermissions([]);

  window.location.href = isInternalUser ? "/internal-login" : "/";
}
