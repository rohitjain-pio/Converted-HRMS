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

          <!-- User Login Title -->
          <h3 class="signin-title">User Login</h3>

          <!-- Standard Login Form -->
          <v-form @submit.prevent="handleLogin" ref="formRef" v-model="formValid" class="login-form">
            <v-text-field
              v-model="credentials.email"
              label="Email*"
              type="email"
              :rules="emailRules"
              variant="outlined"
              density="comfortable"
              required
              autocomplete="email"
              :disabled="isLoading"
              class="form-input"
              hide-details="auto"
            ></v-text-field>

            <v-text-field
              v-model="credentials.password"
              label="Password*"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :rules="passwordRules"
              variant="outlined"
              density="comfortable"
              required
              autocomplete="current-password"
              :disabled="isLoading"
              class="form-input"
              hide-details="auto"
            ></v-text-field>

            <v-btn
              variant="outlined"
              size="large"
              type="submit"
              :loading="isLoading"
              :disabled="!formValid"
              class="login-button"
            >
              <strong>Sign In</strong>
            </v-btn>
          </v-form>

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
import type { LoginCredentials } from '@/types';

const { login } = useAuth();

const formRef = ref();
const formValid = ref(false);
const showPassword = ref(false);
const credentials = ref<LoginCredentials>({
  email: '',
  password: '',
});
const isLoading = ref(false);
const errorMessage = ref('');

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
];

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
];

const handleLogin = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await login(credentials.value);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input {
  width: 100%;
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
  width: 100%;
}

.login-button:hover {
  background-color: #1e75bb !important;
  color: white !important;
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
