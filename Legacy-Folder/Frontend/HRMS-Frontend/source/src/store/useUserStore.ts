import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TSetMsalToken = {
  idToken: string;
  accessToken: string;
};

type TUserData = {
  authToken: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  userEmail: string;
  userId: string;
  userName: string;
  refreshToken?: string;
  menus: Menu[];
};

type Menu = {
  mainMenu: string;
  mainMenuApiEndPoint: string;
  subMenus: SubMenu[];
};

type SubMenu = {
  subMenu: string;
  subMenuApiEndPoint: string;
};

type TZustandStore = {
  isLoggedIn: boolean;
  isInternalUser: boolean;
  idToken: string;
  accessToken: string;
  userData: TUserData;
  setUserData: (
    userData: TUserData,
    isLogin: boolean,
    isInternalUser: boolean
  ) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setMsalToken: ({ idToken, accessToken }: TSetMsalToken) => void;
  resetUserData: () => void;
};

const initialState = {
  isLoggedIn: false,
  isInternalUser: false,
  idToken: "",
  accessToken: "",
  userData: {
    authToken: "",
    refreshToken: "",
    firstName: "",
    lastName: "",
    roleId: "",
    roleName: "",
    userEmail: "",
    userId: "",
    userName: "",
    menus: [],
  },
};

const useUserStore = create<TZustandStore>()(
  persist(
    (set) => ({
      ...initialState,
      setIsLoggedIn: (isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          set({ ...initialState });
        } else {
          set({ isLoggedIn });
        }
      },
      setMsalToken: ({ idToken, accessToken }: TSetMsalToken) => {
        set({ ...initialState, idToken: idToken, accessToken: accessToken });
      },
      setUserData: (
        userData: TUserData,
        isLogin: boolean,
        isInternalUser: boolean
      ) => {
        set({ ...initialState, userData, isLoggedIn: isLogin, isInternalUser });
      },
      resetUserData: () => {
        set(initialState);
      },
    }),
    {
      name: "userToken",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
