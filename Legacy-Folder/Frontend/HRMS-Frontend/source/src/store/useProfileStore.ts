import { create } from "zustand";

type ProfileData = {
  userName: string;
  profileImageUrl: string;
};

type ProfileStore = {
  profileData: ProfileData;
  setProfileData: (profileData: {
    userName: string;
    profileImageUrl: string;
  }) => void;
  resetProfileData: () => void;
};

const initialState = {
  profileData: {
    userName: "",
    profileImageUrl: "",
  },
};

export const useProfileStore = create<ProfileStore>((set) => ({
  ...initialState,
  setProfileData: (profileData) => set({ profileData }),
  resetProfileData: () => set(initialState),
}));
