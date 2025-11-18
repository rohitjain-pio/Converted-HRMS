import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useMenuStore } from '@/stores/menu';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Login - Microsoft SSO',
    },
  },
  {
    path: '/internal-login',
    name: 'InternalLogin',
    component: () => import('@/views/auth/InternalLoginView.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Internal Login',
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Dashboard',
    },
  },
  // Attendance Management Routes (Module-3)
  {
    path: '/attendance/my-attendance',
    name: 'MyAttendance',
    component: () => import('@/pages/attendance/AttendanceEmployee.vue'),
    meta: { 
      requiresAuth: true,
      title: 'My Attendance',
      permissions: ['attendance.read'],
    },
  },
  {
    path: '/attendance/employee-report',
    name: 'AttendanceReport',
    component: () => import('@/views/attendance/AttendanceReportView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Attendance Report',
      permissions: ['attendance.report'],
    },
  },
  {
    path: '/attendance/configuration',
    name: 'AttendanceConfiguration',
    component: () => import('@/views/attendance/AttendanceConfigView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Attendance Configuration',
      permissions: ['attendance.admin'],
    },
  },
  // Employee Management Routes (Module-2)
  {
    path: '/employees/list',
    name: 'EmployeeList',
    component: () => import('@/views/employees/EmployeeListView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Employees',
      permissions: ['employee.view'],
    },
  },
  {
    path: '/employees/add',
    name: 'EmployeeAdd',
    component: () => import('@/views/employees/EmployeeAddView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Add Employee',
      permissions: ['employee.create'],
    },
  },
  {
    path: '/employees/:id',
    name: 'EmployeeDetails',
    component: () => import('@/views/employees/EmployeeDetailsView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Employee Details',
      permissions: ['employee.view'],
    },
  },
  {
    path: '/employees/:id/edit',
    name: 'EmployeeEdit',
    component: () => import('@/views/employees/EmployeeEditView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Edit Employee',
      permissions: ['employee.edit'],
    },
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/error/UnauthorizedView.vue'),
    meta: {
      title: 'Unauthorized',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '404 Not Found',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();

  // Set page title
  document.title = `${to.meta.title || 'HRMS'} - Human Resource Management System`;

  // Check authentication requirement
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // Redirect authenticated users away from guest-only pages
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
    return;
  }

  // Fetch menu if authenticated and not loaded
  if (authStore.isAuthenticated && menuStore.menuItems.length === 0 && !menuStore.isLoading) {
    try {
      await menuStore.fetchMenu();
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      // Continue navigation even if menu fetch fails
    }
  }

  // Check permissions if required
  if (to.meta.permissions) {
    const requiredPermissions = to.meta.permissions as string[];
    if (!authStore.hasAllPermissions(requiredPermissions)) {
      next({ name: 'Unauthorized' });
      return;
    }
  }

  next();
});

export default router;
