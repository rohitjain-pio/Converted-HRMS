<template>
  <div class="login-page">
    <!-- Top Logo -->
    <div class="top-logo-container">
      <a href="/dashboard" class="logo-link">
        <img 
          src="@/assets/images/icons/programmers-io.svg" 
          alt="Programmers.io" 
          class="top-logo"
        />
      </a>
    </div>

    <!-- Main Content -->
    <div class="login-container">
      <v-card class="login-card">
        <!-- Left Side - Illustration -->
        <div class="login-left">
          <img 
            src="@/assets/images/icons/login-left-img.svg" 
            alt="Security Illustration" 
            class="login-illustration"
          />
        </div>

        <!-- Divider -->
        <div class="login-divider"></div>

        <!-- Right Side - Form -->
        <div class="login-right">
          <!-- Logo and Title Section -->
          <div class="login-header">
            <div class="login-center-icon">
              <img 
                src="@/assets/images/icons/pio-logo.svg" 
                alt="HRMS Logo" 
                height="40"
              />
            </div>
            <div class="vertical-divider"></div>
            <h3 class="hrms-title">HRMS</h3>
          </div>

          <!-- Sign In Title -->
          <h3 class="signin-title">Sign in to start Your Session</h3>

          <!-- Azure AD SSO Button -->
          <v-btn
            variant="outlined"
            size="large"
            class="login-button"
            @click="handleAzureLogin"
            :loading="azureLoading"
          >
            <template #prepend>
              <img 
                src="@/assets/images/icons/microsoft365.svg" 
                alt="Microsoft" 
                height="30"
                class="button-icon"
              />
            </template>
            <strong>Sign In with Microsoft</strong>
          </v-btn>

          <!-- Error Alert -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="error-alert"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useAzureAuth } from '@/composables/useAzureAuth';

const { loginWithAzure } = useAuth();
const { loginWithAzure: getAzureToken, isLoading: azureLoading } = useAzureAuth();

const errorMessage = ref('');

const handleAzureLogin = async () => {
  errorMessage.value = '';

  try {
    const accessToken = await getAzureToken();
    
    if (!accessToken) {
      errorMessage.value = 'Failed to get Azure AD access token';
      return;
    }

    await loginWithAzure(accessToken);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || error.message || 'Azure AD login failed';
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #eef4fb;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
}

.top-logo-container {
  padding: 16px 24px;
}

.logo-link {
  display: inline-block;
  text-decoration: none;
}

.top-logo {
  height: 30px;
  width: auto;
  margin: 0 auto;
}

.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  max-width: 726px;
  width: 100%;
  margin: 24px;
  border-radius: 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background-color: #ffffff;
}

.login-left {
  flex: 0 0 33.33%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-illustration {
  width: 228px;
  height: auto;
  opacity: 0.8;
}

.login-divider {
  width: 2px;
  background-color: #f0f0f0;
  margin: 8px 0;
  align-self: stretch;
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.login-center-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #283a50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 1px 8px 0px rgba(38, 38, 38, 0.5);
}

.vertical-divider {
  width: 2px;
  height: 50px;
  background-color: #f0f0f0;
}

.hrms-title {
  font-size: 24px;
  font-weight: 600;
  color: #283a50;
  margin: 0;
}

.signin-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e75bb;
  text-align: center;
  margin: 0 0 20px 0;
}

.login-button {
  border-color: #1e75bb !important;
  color: #1e75bb !important;
  border-width: 0.8px;
  border-radius: 4px;
  padding: 5px 50px !important;
  height: 48px !important;
  text-transform: none;
  font-weight: 400;
  font-size: 14px;
}

.login-button:hover {
  background-color: #1e75bb !important;
  color: white !important;
}

.login-button:hover .button-icon {
  filter: brightness(0) invert(1);
}

.button-icon {
  margin-right: 8px;
}

.error-alert {
  margin-top: 20px;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 700px;
    margin: 16px;
  }

  .login-left {
    display: none;
  }

  .login-divider {
    display: none;
  }

  .login-right {
    padding: 24px;
  }

  .login-button {
    padding: 5px 30px !important;
  }
}

@media screen and (min-width: 1024px) {
  .login-container {
    min-height: calc(100vh - 112px);
  }

  .login-right {
    padding: 32px;
  }
}

@media screen and (min-width: 1440px) {
  .login-right {
    padding: 40px;
  }
}
</style>
