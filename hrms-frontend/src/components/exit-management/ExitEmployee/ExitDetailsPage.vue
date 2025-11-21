<template>
  <app-layout>
    <v-container fluid class="pa-4">
      <v-card elevation="3">
        <v-card-title class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h2 class="text-h5">Exit Employee Details</h2>
              <v-breadcrumbs :items="breadcrumbs" class="pa-0 mt-2" density="compact" />
            </div>
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="router.back()"
            />
          </div>
        </v-card-title>

        <v-card-text v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </v-card-text>

        <v-card-text v-else-if="exitDetails" class="pa-4">
          <!-- Resignation Details Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="bg-grey-lighten-4">
              Resignation Details
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="detail in resignationDetails"
                  :key="detail.label"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <div class="detail-item">
                    <div class="text-caption text-grey-darken-1 mb-1">
                      {{ detail.label }}
                    </div>
                    <div v-if="detail.value" class="text-body-1 font-weight-medium">
                      {{ detail.value }}
                    </div>
                    <div v-else-if="detail.component" class="d-flex align-center">
                      <component :is="detail.component" v-bind="detail.props" />
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Clearance Tabs -->
          <v-card elevation="2">
            <v-tabs v-model="activeTab" bg-color="grey-lighten-4">
              <v-tab value="hr">HR Clearance</v-tab>
              <v-tab value="department">Department Clearance</v-tab>
              <v-tab value="it">IT Clearance</v-tab>
              <v-tab value="accounts">Accounts Clearance</v-tab>
            </v-tabs>

            <v-card-text class="pa-4">
              <v-window v-model="activeTab">
                <v-window-item value="hr">
                  <hr-clearance-tab
                    :resignation-id="resignationId"
                    :can-edit="canEditExitDetails"
                    @updated="fetchExitDetails"
                  />
                </v-window-item>

                <v-window-item value="department">
                  <department-clearance-tab
                    :resignation-id="resignationId"
                    :can-edit="canEditExitDetails"
                    @updated="fetchExitDetails"
                  />
                </v-window-item>

                <v-window-item value="it">
                  <it-clearance-tab
                    :resignation-id="resignationId"
                    :can-edit="canEditExitDetails"
                    @updated="fetchExitDetails"
                  />
                </v-window-item>

                <v-window-item value="accounts">
                  <accounts-clearance-tab
                    :resignation-id="resignationId"
                    :can-edit="canEditExitDetails"
                    @updated="fetchExitDetails"
                  />
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-text v-else class="text-center py-8">
          <v-icon size="64" color="grey">mdi-alert-circle</v-icon>
          <p class="text-h6 mt-2">No data found</p>
        </v-card-text>
      </v-card>

      <!-- Accept Resignation Dialog -->
      <v-dialog v-model="showAcceptResignationDialog" max-width="500">
        <v-card>
          <v-card-title>Accept Resignation</v-card-title>
          <v-card-text>
            Are you sure you want to accept this resignation?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showAcceptResignationDialog = false">Cancel</v-btn>
            <v-btn color="success" @click="acceptResignation" :loading="submitting">Accept</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Reject Resignation Dialog -->
      <v-dialog v-model="showRejectResignationDialog" max-width="500">
        <v-card>
          <v-card-title>Reject Resignation</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="rejectReason"
              label="Rejection Reason"
              rows="3"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showRejectResignationDialog = false">Cancel</v-btn>
            <v-btn color="error" @click="rejectResignation" :loading="submitting">Reject</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Accept Early Release Dialog -->
      <v-dialog v-model="showAcceptEarlyReleaseDialog" max-width="500">
        <v-card>
          <v-card-title>Accept Early Release</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="earlyReleaseDate"
              label="Early Release Date"
              type="date"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showAcceptEarlyReleaseDialog = false">Cancel</v-btn>
            <v-btn color="success" @click="acceptEarlyRelease" :loading="submitting">Accept</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Reject Early Release Dialog -->
      <v-dialog v-model="showRejectEarlyReleaseDialog" max-width="500">
        <v-card>
          <v-card-title>Reject Early Release</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="rejectReason"
              label="Rejection Reason"
              rows="3"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showRejectEarlyReleaseDialog = false">Cancel</v-btn>
            <v-btn color="error" @click="rejectEarlyRelease" :loading="submitting">Reject</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Update Last Working Day Dialog -->
      <v-dialog v-model="showUpdateLastWorkingDayDialog" max-width="500">
        <v-card>
          <v-card-title>Update Last Working Day</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="lastWorkingDay"
              label="Last Working Day"
              type="date"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showUpdateLastWorkingDayDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="updateLastWorkingDay" :loading="submitting">Update</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- View Reason Dialog -->
      <v-dialog v-model="showReasonDialog" max-width="600">
        <v-card>
          <v-card-title>{{ reasonDialogTitle }}</v-card-title>
          <v-card-text>
            <p class="text-body-1">{{ reasonDialogContent }}</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showReasonDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import { adminExitEmployeeApi } from '@/api/adminExitEmployeeApi';
import type { ExitDetails } from '@/types/exitEmployee.types';
import HrClearanceTab from './clearance-tabs/HrClearanceTab.vue';
import DepartmentClearanceTab from './clearance-tabs/DepartmentClearanceTab.vue';
import ItClearanceTab from './clearance-tabs/ItClearanceTab.vue';
import AccountsClearanceTab from './clearance-tabs/AccountsClearanceTab.vue';
import { VBtn, VIcon, VChip } from 'vuetify/components';

const route = useRoute();
const router = useRouter();

const resignationId = computed(() => parseInt(route.params.resignationId as string));
const exitDetails = ref<ExitDetails | null>(null);
const loading = ref(false);
const submitting = ref(false);
const activeTab = ref('hr');

// Dialog states
const showAcceptResignationDialog = ref(false);
const showRejectResignationDialog = ref(false);
const showAcceptEarlyReleaseDialog = ref(false);
const showRejectEarlyReleaseDialog = ref(false);
const showUpdateLastWorkingDayDialog = ref(false);
const showReasonDialog = ref(false);
const reasonDialogTitle = ref('');
const reasonDialogContent = ref('');

// Form data
const rejectReason = ref('');
const earlyReleaseDate = ref('');
const lastWorkingDay = ref('');

const breadcrumbs = [
  { title: 'Home', to: '/' },
  { title: 'Exit Management', to: '/employees/employee-exit' },
  { title: 'Details', disabled: true },
];

const canEditExitDetails = computed(() => {
  if (!exitDetails.value) return false;
  const disabledStatuses = [2, 4, 5]; // Revoked, Cancelled, Completed
  return !disabledStatuses.includes(exitDetails.value.resignationStatus);
});

const getResignationStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    1: 'Pending',
    2: 'Revoked',
    3: 'Accepted',
    4: 'Cancelled',
    5: 'Completed',
  };
  return labels[status] || 'Unknown';
};

const getResignationStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    1: 'warning',
    2: 'grey',
    3: 'success',
    4: 'error',
    5: 'info',
  };
  return colors[status] || 'default';
};

const getEmployeeStatusLabel = (status: number) => {
  const labels: Record<number, string> = {
    1: 'Active',
    2: 'F&F Pending',
    3: 'On Notice',
    4: 'Ex Employee',
  };
  return labels[status] || 'Unknown';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const resignationDetails = computed(() => {
  if (!exitDetails.value) return [];

  return [
    { label: 'Employee Name', value: exitDetails.value.employeeName },
    { label: 'Employee Code', value: exitDetails.value.employeeCode },
    { label: 'Department', value: exitDetails.value.departmentName },
    { label: 'Branch', value: exitDetails.value.branchName },
    { label: 'Reporting Manager', value: exitDetails.value.reportingManagerName },
    { 
      label: 'Resignation Date', 
      value: formatDate(exitDetails.value.resignationDate) 
    },
    {
      label: 'Resignation Status',
      component: () => h('div', { class: 'd-flex align-center gap-2' }, [
        h(VChip, {
          color: getResignationStatusColor(exitDetails.value!.resignationStatus),
          size: 'small'
        }, () => getResignationStatusLabel(exitDetails.value!.resignationStatus)),
        exitDetails.value!.resignationStatus === 1 && canEditExitDetails.value ? [
          h(VBtn, {
            icon: 'mdi-check',
            size: 'small',
            color: 'success',
            variant: 'text',
            onClick: () => showAcceptResignationDialog.value = true
          }),
          h(VBtn, {
            icon: 'mdi-close',
            size: 'small',
            color: 'error',
            variant: 'text',
            onClick: () => showRejectResignationDialog.value = true
          })
        ] : []
      ])
    },
    {
      label: 'Resignation Reason',
      component: () => h(VBtn, {
        icon: 'mdi-eye',
        size: 'small',
        variant: 'text',
        color: 'primary',
        onClick: () => {
          reasonDialogTitle.value = 'Resignation Reason';
          reasonDialogContent.value = exitDetails.value?.reason || 'No reason provided';
          showReasonDialog.value = true;
        }
      })
    },
    {
      label: 'Last Working Day',
      component: () => h('div', { class: 'd-flex align-center gap-2' }, [
        h('span', formatDate(exitDetails.value!.lastWorkingDay)),
        canEditExitDetails.value ? h(VBtn, {
          icon: 'mdi-pencil',
          size: 'small',
          variant: 'text',
          color: 'primary',
          onClick: () => {
            lastWorkingDay.value = exitDetails.value!.lastWorkingDay || '';
            showUpdateLastWorkingDayDialog.value = true;
          }
        }) : null
      ])
    },
    {
      label: 'Employee Status',
      component: () => h(VChip, {
        size: 'small',
        color: 'info'
      }, () => getEmployeeStatusLabel(exitDetails.value!.employeeStatus))
    },
    {
      label: 'Early Release Request',
      value: exitDetails.value.earlyReleaseRequest ? 'Yes' : 'No'
    },
    exitDetails.value.earlyReleaseRequest ? {
      label: 'Early Release Date',
      value: formatDate(exitDetails.value.earlyReleaseDate)
    } : null,
    {
      label: 'Exit Interview',
      value: exitDetails.value.exitInterviewStatus ? 'Completed' : 'Pending'
    },
    {
      label: 'IT No Due',
      value: exitDetails.value.itNoDue ? 'Yes' : 'No'
    },
    {
      label: 'Accounts No Due',
      value: exitDetails.value.accountsNoDue ? 'Yes' : 'No'
    },
  ].filter(Boolean);
});

const fetchExitDetails = async () => {
  loading.value = true;
  try {
    const response = await adminExitEmployeeApi.getResignationById(resignationId.value);
    if (response.data.statusCode === 200) {
      exitDetails.value = response.data.result;
    }
  } catch (error: any) {
    console.error('Error fetching exit details:', error);
  } finally {
    loading.value = false;
  }
};

const acceptResignation = async () => {
  submitting.value = true;
  try {
    await adminExitEmployeeApi.acceptResignation(resignationId.value);
    showAcceptResignationDialog.value = false;
    await fetchExitDetails();
  } catch (error) {
    console.error('Error accepting resignation:', error);
  } finally {
    submitting.value = false;
  }
};

const rejectResignation = async () => {
  if (!rejectReason.value.trim()) return;
  
  submitting.value = true;
  try {
    await adminExitEmployeeApi.adminRejection({
      ResignationId: resignationId.value,
      RejectionType: 'Resignation',
      RejectionReason: rejectReason.value
    });
    showRejectResignationDialog.value = false;
    rejectReason.value = '';
    await fetchExitDetails();
  } catch (error) {
    console.error('Error rejecting resignation:', error);
  } finally {
    submitting.value = false;
  }
};

const acceptEarlyRelease = async () => {
  if (!earlyReleaseDate.value) return;
  
  submitting.value = true;
  try {
    await adminExitEmployeeApi.acceptEarlyRelease({
      ResignationId: resignationId.value,
      EarlyReleaseDate: earlyReleaseDate.value
    });
    showAcceptEarlyReleaseDialog.value = false;
    earlyReleaseDate.value = '';
    await fetchExitDetails();
  } catch (error) {
    console.error('Error accepting early release:', error);
  } finally {
    submitting.value = false;
  }
};

const rejectEarlyRelease = async () => {
  if (!rejectReason.value.trim()) return;
  
  submitting.value = true;
  try {
    await adminExitEmployeeApi.adminRejection({
      ResignationId: resignationId.value,
      RejectionType: 'EarlyRelease',
      RejectionReason: rejectReason.value
    });
    showRejectEarlyReleaseDialog.value = false;
    rejectReason.value = '';
    await fetchExitDetails();
  } catch (error) {
    console.error('Error rejecting early release:', error);
  } finally {
    submitting.value = false;
  }
};

const updateLastWorkingDay = async () => {
  if (!lastWorkingDay.value) return;
  
  submitting.value = true;
  try {
    await adminExitEmployeeApi.updateLastWorkingDay({
      ResignationId: resignationId.value,
      LastWorkingDay: lastWorkingDay.value
    });
    showUpdateLastWorkingDayDialog.value = false;
    await fetchExitDetails();
  } catch (error) {
    console.error('Error updating last working day:', error);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchExitDetails();
});
</script>

<style scoped>
.detail-item {
  padding: 8px 0;
}

.gap-2 {
  gap: 8px;
}
</style>
