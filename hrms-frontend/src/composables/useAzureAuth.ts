import { ref } from 'vue';
import { PublicClientApplication, type Configuration, type AuthenticationResult } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export function useAzureAuth() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function initializeMsal() {
    try {
      await msalInstance.initialize();
    } catch (e: any) {
      console.error('MSAL initialization failed:', e);
      error.value = e.message;
    }
  }

  async function loginWithAzure(): Promise<string | null> {
    isLoading.value = true;
    error.value = null;

    try {
      await initializeMsal();

      const loginRequest = {
        scopes: ['user.read', 'openid', 'profile', 'email'],
      };

      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      return response.accessToken;
    } catch (e: any) {
      console.error('Azure AD login failed:', e);
      error.value = e.message || 'Azure AD login failed';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function logoutFromAzure() {
    try {
      await msalInstance.logoutPopup();
    } catch (e: any) {
      console.error('Azure AD logout failed:', e);
    }
  }

  async function getAzureAccount() {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  return {
    isLoading,
    error,
    loginWithAzure,
    logoutFromAzure,
    getAzureAccount,
  };
}
