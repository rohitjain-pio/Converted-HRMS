# Company Policy Management Part 3: Compliance Tracking & Analytics - UI Migration Guide

## Overview
This document provides comprehensive migration guidance for the Company Policy Management Part 3 module from React to Vue.js, focusing on compliance tracking, policy analytics, acknowledgment workflows, and advanced reporting features.

## React Component Analysis

### Current React Implementation
```typescript
// React: ViewDocument Component
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import { downloadPolicyDocument } from "@/services/CompanyPolicies";

interface ViewDocumentProps {
  companyPolicyId: number | string;
  fileName: string;
  fileOriginalName?: string;
  hasPermission?: boolean;
}

const ViewDocument = ({
  companyPolicyId,
  fileName,
  fileOriginalName,
  hasPermission = false,
}: ViewDocumentProps) => {
  const { userData } = useUserStore();
  const [byteArray, setByteArray] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const {
    execute: previewPolicyDocument,
    isLoading: previewDocument,
  } = useAsync({
    requestFn: async (args) => await downloadPolicyDocument(args),
    onSuccess: (response) => {
      const { fileContent } = response.data.result;
      if (fileContent) {
        setByteArray(fileContent);
        setPreviewOpen(true);
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const handlePreviewDocument = async () => {
    if (!fileName) {
      toast.error("File name is not available");
      return;
    }
    await previewPolicyDocument({
      companyPolicyId,
      employeeId: Number(userData.userId),
      fileName,
    });
  };

  return (
    <Tooltip title={!hasPermission ? No_Permission_To_View_Attachment : View_Attachment}>
      <IconButton
        color="primary"
        onClick={handlePreviewDocument}
        disabled={previewDocument || !hasPermission}
      >
        {!hasPermission ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </Tooltip>
  );
};
```

## Vue.js Migration Implementation

### 1. Policy Compliance Panel Component
```vue
<!-- Vue: PolicyCompliancePanel.vue -->
<template>
  <v-card-text class="pa-6">
    <!-- Compliance Overview -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-shield-check</v-icon>
        Compliance Overview
      </h3>
      
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4" color="success" variant="tonal">
            <v-icon size="48" color="success" class="mb-2">
              mdi-check-circle
            </v-icon>
            <div class="text-h4 font-weight-bold text-success">
              {{ complianceStats.acknowledged }}
            </div>
            <div class="text-body-2">
              Acknowledged
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4" color="warning" variant="tonal">
            <v-icon size="48" color="warning" class="mb-2">
              mdi-clock-outline
            </v-icon>
            <div class="text-h4 font-weight-bold text-warning">
              {{ complianceStats.pending }}
            </div>
            <div class="text-body-2">
              Pending Review
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4" color="error" variant="tonal">
            <v-icon size="48" color="error" class="mb-2">
              mdi-alert-circle
            </v-icon>
            <div class="text-h4 font-weight-bold text-error">
              {{ complianceStats.overdue }}
            </div>
            <div class="text-body-2">
              Overdue
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="text-center pa-4" color="info" variant="tonal">
            <v-icon size="48" color="info" class="mb-2">
              mdi-percent
            </v-icon>
            <div class="text-h4 font-weight-bold text-info">
              {{ complianceStats.complianceRate }}%
            </div>
            <div class="text-body-2">
              Compliance Rate
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Acknowledgment Tracking -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-account-check</v-icon>
        Acknowledgment Tracking
      </h3>
      
      <v-card variant="outlined">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Employee Acknowledgments</span>
          
          <div class="d-flex gap-2">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-email"
              @click="sendReminders"
              :loading="sendingReminders"
            >
              Send Reminders
            </v-btn>
            
            <v-btn
              variant="outlined"
              prepend-icon="mdi-export"
              @click="exportCompliance"
            >
              Export Report
            </v-btn>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-data-table-server
            :headers="acknowledgmentHeaders"
            :items="acknowledgments"
            :items-length="totalAcknowledgments"
            :loading="loadingAcknowledgments"
            :items-per-page="pageSize"
            :page="currentPage"
            class="elevation-0"
            item-value="employeeId"
            @update:options="handleAcknowledgmentOptions"
          >
            <template #item.employee="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" class="mr-3">
                  <v-img
                    v-if="item.avatar"
                    :src="item.avatar"
                    :alt="item.employeeName"
                  />
                  <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-medium">
                    {{ item.employeeName }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.department }} - {{ item.designation }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="getAcknowledgmentStatusColor(item.status)"
                :prepend-icon="getAcknowledgmentStatusIcon(item.status)"
                variant="tonal"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.acknowledgedDate="{ item }">
              <div v-if="item.acknowledgedDate">
                <div class="text-body-2">{{ formatDate(item.acknowledgedDate) }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ formatTime(item.acknowledgedDate) }}
                </div>
              </div>
              <span v-else class="text-medium-emphasis">—</span>
            </template>

            <template #item.dueDate="{ item }">
              <div class="text-body-2" :class="getDueDateClass(item.dueDate)">
                {{ formatDate(item.dueDate) }}
              </div>
              <div v-if="isOverdue(item.dueDate)" class="text-caption text-error">
                {{ getDaysOverdue(item.dueDate) }} days overdue
              </div>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  v-if="item.status === 'Pending'"
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  @click="requestAcknowledgment(item)"
                >
                  <v-icon>mdi-email-send</v-icon>
                  <v-tooltip activator="parent">Send Reminder</v-tooltip>
                </v-btn>
                
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="viewAcknowledgmentDetails(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent">View Details</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table-server>
        </v-card-text>
      </v-card>
    </div>

    <!-- Compliance Timeline -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-timeline</v-icon>
        Compliance Timeline
      </h3>
      
      <v-card variant="outlined">
        <v-card-text>
          <v-timeline density="comfortable" align="start">
            <v-timeline-item
              v-for="(event, index) in complianceTimeline"
              :key="index"
              :dot-color="getTimelineEventColor(event.type)"
              size="small"
            >
              <template #icon>
                <v-icon 
                  :color="getTimelineEventIconColor(event.type)"
                  size="small"
                >
                  {{ getTimelineEventIcon(event.type) }}
                </v-icon>
              </template>
              
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="d-flex justify-space-between align-center pa-4">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">
                      {{ event.title }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ event.description }}
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <div class="text-body-2">{{ formatDate(event.timestamp) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatTime(event.timestamp) }}
                    </div>
                  </div>
                </v-card-title>
                
                <v-card-text v-if="event.details" class="pt-0 pb-4">
                  <div class="text-body-2">{{ event.details }}</div>
                  
                  <div v-if="event.employees" class="mt-2">
                    <v-chip-group>
                      <v-chip
                        v-for="employee in event.employees.slice(0, 3)"
                        :key="employee"
                        size="small"
                        variant="outlined"
                      >
                        {{ employee }}
                      </v-chip>
                      <v-chip
                        v-if="event.employees.length > 3"
                        size="small"
                        variant="outlined"
                      >
                        +{{ event.employees.length - 3 }} more
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </div>

    <!-- Compliance Analytics -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
        Compliance Analytics
      </h3>
      
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Acknowledgment Rate by Department</v-card-title>
            <v-card-text>
              <ComplianceChart
                type="bar"
                :data="departmentComplianceData"
                :options="chartOptions"
              />
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Compliance Trend</v-card-title>
            <v-card-text>
              <ComplianceChart
                type="line"
                :data="complianceTrendData"
                :options="trendChartOptions"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Risk Assessment -->
    <div>
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-shield-alert</v-icon>
        Risk Assessment
      </h3>
      
      <v-card variant="outlined">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-center">
                <v-progress-circular
                  :model-value="riskScore"
                  :color="getRiskScoreColor(riskScore)"
                  size="120"
                  width="12"
                  class="mb-4"
                >
                  <span class="text-h4 font-weight-bold">{{ riskScore }}</span>
                </v-progress-circular>
                <div class="text-h6 mb-2">Overall Risk Score</div>
                <v-chip
                  :color="getRiskScoreColor(riskScore)"
                  variant="tonal"
                >
                  {{ getRiskLevel(riskScore) }}
                </v-chip>
              </div>
            </v-col>
            
            <v-col cols="12" md="8">
              <h4 class="text-h6 mb-3">Risk Factors</h4>
              
              <div
                v-for="factor in riskFactors"
                :key="factor.name"
                class="mb-3"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-body-1">{{ factor.name }}</span>
                  <span class="text-body-2 font-weight-medium">{{ factor.score }}%</span>
                </div>
                <v-progress-linear
                  :model-value="factor.score"
                  :color="getFactorColor(factor.score)"
                  height="8"
                  rounded
                />
              </div>
              
              <v-alert
                v-if="riskScore > 70"
                type="warning"
                variant="tonal"
                class="mt-4"
              >
                <v-alert-title>High Risk Detected</v-alert-title>
                <div>
                  This policy shows high compliance risk. Consider reviewing acknowledgment
                  requirements and implementing additional training measures.
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Acknowledgment Details Dialog -->
    <PolicyAcknowledgmentDialog
      v-model="acknowledgmentDialog.show"
      :employee="acknowledgmentDialog.employee"
      :policy="policy"
      @acknowledge="handleAcknowledgment"
      @close="closeAcknowledgmentDialog"
    />

    <!-- Compliance Report Dialog -->
    <ComplianceReportDialog
      v-model="reportDialog.show"
      :policy="policy"
      :filters="reportFilters"
      @export="exportComplianceReport"
      @close="reportDialog.show = false"
    />
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePolicyStore } from '@/stores/policyStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import ComplianceChart from './charts/ComplianceChart.vue'
import PolicyAcknowledgmentDialog from '../dialogs/PolicyAcknowledgmentDialog.vue'
import ComplianceReportDialog from '../dialogs/ComplianceReportDialog.vue'

// Props & Emits
const props = defineProps<{
  policy: any
  complianceData: any
}>()

const emit = defineEmits<{
  'acknowledge': [data: any]
  'track-compliance': [data: any]
}>()

// State
const policyStore = usePolicyStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loadingAcknowledgments = ref(false)
const sendingReminders = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalAcknowledgments = ref(0)

const acknowledgments = ref([])
const complianceTimeline = ref([])
const departmentComplianceData = ref({})
const complianceTrendData = ref({})

const acknowledgmentDialog = ref({
  show: false,
  employee: null
})

const reportDialog = ref({
  show: false
})

const reportFilters = ref({
  department: '',
  status: '',
  dateRange: { start: null, end: null }
})

// Computed
const complianceStats = computed(() => {
  if (!props.complianceData) {
    return {
      acknowledged: 0,
      pending: 0,
      overdue: 0,
      complianceRate: 0
    }
  }
  
  return {
    acknowledged: props.complianceData.acknowledged || 0,
    pending: props.complianceData.pending || 0,
    overdue: props.complianceData.overdue || 0,
    complianceRate: props.complianceData.complianceRate || 0
  }
})

const riskScore = computed(() => {
  const rate = complianceStats.value.complianceRate
  return Math.max(0, 100 - rate)
})

const riskFactors = computed(() => [
  {
    name: 'Overdue Acknowledgments',
    score: (complianceStats.value.overdue / (complianceStats.value.acknowledged + complianceStats.value.pending + complianceStats.value.overdue)) * 100
  },
  {
    name: 'Pending Reviews',
    score: (complianceStats.value.pending / (complianceStats.value.acknowledged + complianceStats.value.pending + complianceStats.value.overdue)) * 100
  },
  {
    name: 'Policy Complexity',
    score: 25 // This would be calculated based on policy content
  },
  {
    name: 'Training Requirements',
    score: 15 // Based on training completion rates
  }
])

// Table Headers
const acknowledgmentHeaders = [
  { title: 'Employee', key: 'employee', width: '250px' },
  { title: 'Status', key: 'status', width: '120px' },
  { title: 'Acknowledged Date', key: 'acknowledgedDate', width: '180px' },
  { title: 'Due Date', key: 'dueDate', width: '150px' },
  { title: 'Actions', key: 'actions', width: '100px', sortable: false }
]

// Chart Options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
}))

const trendChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
}))

// Methods
const loadAcknowledments = async () => {
  try {
    loadingAcknowledgments.value = true
    const response = await policyStore.getPolicyAcknowledgments(props.policy.id, {
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    acknowledgments.value = response.data || []
    totalAcknowledgments.value = response.total || 0
  } catch (error) {
    notificationStore.showError('Failed to load acknowledgments')
  } finally {
    loadingAcknowledgments.value = false
  }
}

const loadComplianceTimeline = async () => {
  try {
    const response = await policyStore.getComplianceTimeline(props.policy.id)
    complianceTimeline.value = response.data || []
  } catch (error) {
    console.error('Failed to load compliance timeline:', error)
  }
}

const loadComplianceAnalytics = async () => {
  try {
    const [departmentData, trendData] = await Promise.all([
      policyStore.getDepartmentComplianceData(props.policy.id),
      policyStore.getComplianceTrendData(props.policy.id)
    ])
    
    departmentComplianceData.value = departmentData
    complianceTrendData.value = trendData
  } catch (error) {
    console.error('Failed to load compliance analytics:', error)
  }
}

const handleAcknowledgmentOptions = async (options: any) => {
  currentPage.value = options.page
  pageSize.value = options.itemsPerPage
  await loadAcknowledments()
}

const sendReminders = async () => {
  try {
    sendingReminders.value = true
    await policyStore.sendAcknowledgmentReminders(props.policy.id)
    notificationStore.showSuccess('Reminders sent successfully')
  } catch (error) {
    notificationStore.showError('Failed to send reminders')
  } finally {
    sendingReminders.value = false
  }
}

const requestAcknowledgment = async (employee: any) => {
  try {
    await policyStore.requestAcknowledgment(props.policy.id, employee.employeeId)
    notificationStore.showSuccess('Reminder sent to employee')
    await loadAcknowledments()
  } catch (error) {
    notificationStore.showError('Failed to send reminder')
  }
}

const viewAcknowledgmentDetails = (employee: any) => {
  acknowledgmentDialog.value = {
    show: true,
    employee
  }
}

const closeAcknowledgmentDialog = () => {
  acknowledgmentDialog.value = {
    show: false,
    employee: null
  }
}

const handleAcknowledgment = async (acknowledgmentData: any) => {
  emit('acknowledge', acknowledgmentData)
  closeAcknowledgmentDialog()
  await loadAcknowledments()
}

const exportCompliance = () => {
  reportDialog.value.show = true
}

const exportComplianceReport = async (filters: any) => {
  try {
    await policyStore.exportComplianceReport(props.policy.id, filters)
    notificationStore.showSuccess('Compliance report exported successfully')
    reportDialog.value.show = false
  } catch (error) {
    notificationStore.showError('Failed to export compliance report')
  }
}

// Utility Functions
const getAcknowledgmentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'Acknowledged': 'success',
    'Pending': 'warning',
    'Overdue': 'error'
  }
  return colorMap[status] || 'default'
}

const getAcknowledgmentStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    'Acknowledged': 'mdi-check-circle',
    'Pending': 'mdi-clock-outline',
    'Overdue': 'mdi-alert-circle'
  }
  return iconMap[status] || 'mdi-circle'
}

const getDueDateClass = (dueDate: string): string => {
  if (isOverdue(dueDate)) {
    return 'text-error'
  }
  
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 3) {
    return 'text-warning'
  }
  
  return ''
}

const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

const getDaysOverdue = (dueDate: string): number => {
  return Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
}

const getTimelineEventColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'policy_published': 'success',
    'acknowledgment_requested': 'info',
    'reminder_sent': 'warning',
    'acknowledgment_received': 'success'
  }
  return colorMap[type] || 'primary'
}

const getTimelineEventIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'policy_published': 'mdi-publish',
    'acknowledgment_requested': 'mdi-email-send',
    'reminder_sent': 'mdi-bell',
    'acknowledgment_received': 'mdi-check-circle'
  }
  return iconMap[type] || 'mdi-circle'
}

const getTimelineEventIconColor = (type: string): string => {
  return type === 'policy_published' || type === 'acknowledgment_received' ? 'white' : undefined
}

const getRiskScoreColor = (score: number): string => {
  if (score < 30) return 'success'
  if (score < 60) return 'warning'
  return 'error'
}

const getRiskLevel = (score: number): string => {
  if (score < 30) return 'Low Risk'
  if (score < 60) return 'Medium Risk'
  return 'High Risk'
}

const getFactorColor = (score: number): string => {
  if (score < 30) return 'success'
  if (score < 60) return 'warning'
  return 'error'
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadAcknowledments(),
    loadComplianceTimeline(),
    loadComplianceAnalytics()
  ])
})

// Watch for policy changes
watch(() => props.policy?.id, async () => {
  if (props.policy?.id) {
    await Promise.all([
      loadAcknowledments(),
      loadComplianceTimeline(),
      loadComplianceAnalytics()
    ])
  }
})
</script>

<style scoped>
.text-error {
  color: rgb(var(--v-theme-error)) !important;
}

.text-warning {
  color: rgb(var(--v-theme-warning)) !important;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

.text-info {
  color: rgb(var(--v-theme-info)) !important;
}
</style>
```

### 2. Policy Analytics Panel Component
```vue
<!-- Vue: PolicyAnalyticsPanel.vue -->
<template>
  <v-card-text class="pa-6">
    <!-- Analytics Overview -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
        Analytics Overview
      </h3>
      
      <v-row>
        <v-col cols="12" sm="6" lg="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="primary" class="mb-2">
              mdi-eye
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ analyticsData.views || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">Total Views</div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" lg="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="info" class="mb-2">
              mdi-download
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ analyticsData.downloads || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">Downloads</div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" lg="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="success" class="mb-2">
              mdi-clock
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ analyticsData.avgReadTime || '0m' }}</div>
            <div class="text-body-2 text-medium-emphasis">Avg. Read Time</div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" lg="3">
          <v-card class="text-center pa-4">
            <v-icon size="48" color="warning" class="mb-2">
              mdi-account-multiple
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ analyticsData.uniqueUsers || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">Unique Users</div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Usage Analytics Charts -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-trending-up</v-icon>
        Usage Analytics
      </h3>
      
      <v-row>
        <v-col cols="12" lg="8">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Policy Views Over Time</span>
              
              <v-btn-toggle v-model="viewsPeriod" variant="outlined" divided>
                <v-btn value="7d" size="small">7D</v-btn>
                <v-btn value="30d" size="small">30D</v-btn>
                <v-btn value="90d" size="small">90D</v-btn>
              </v-btn-toggle>
            </v-card-title>
            
            <v-card-text>
              <AnalyticsChart
                type="line"
                :data="viewsChartData"
                :options="lineChartOptions"
                height="300"
              />
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" lg="4">
          <v-card class="h-100">
            <v-card-title>Department Engagement</v-card-title>
            <v-card-text>
              <AnalyticsChart
                type="doughnut"
                :data="departmentEngagementData"
                :options="doughnutChartOptions"
                height="300"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Device and Location Analytics -->
    <div class="mb-8">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Device Breakdown</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="device in deviceData"
                  :key="device.name"
                  class="px-0"
                >
                  <template #prepend>
                    <v-icon :color="device.color">{{ device.icon }}</v-icon>
                  </template>
                  
                  <v-list-item-title>{{ device.name }}</v-list-item-title>
                  
                  <template #append>
                    <div class="text-right">
                      <div class="text-body-1 font-weight-medium">{{ device.percentage }}%</div>
                      <v-progress-linear
                        :model-value="device.percentage"
                        :color="device.color"
                        height="4"
                        class="mt-1"
                        style="width: 60px;"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Access Locations</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="location in locationData"
                  :key="location.name"
                  class="px-0"
                >
                  <template #prepend>
                    <v-icon color="info">mdi-map-marker</v-icon>
                  </template>
                  
                  <v-list-item-title>{{ location.name }}</v-list-item-title>
                  
                  <template #append>
                    <div class="text-right">
                      <div class="text-body-1 font-weight-medium">{{ location.count }}</div>
                      <div class="text-caption text-medium-emphasis">{{ location.percentage }}%</div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- User Behavior Analysis -->
    <div class="mb-8">
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-account-search</v-icon>
        User Behavior Analysis
      </h3>
      
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-center">
                <v-progress-circular
                  :model-value="engagementScore"
                  :color="getEngagementColor(engagementScore)"
                  size="120"
                  width="12"
                  class="mb-4"
                >
                  <span class="text-h4 font-weight-bold">{{ engagementScore }}</span>
                </v-progress-circular>
                <div class="text-h6 mb-2">Engagement Score</div>
                <v-chip
                  :color="getEngagementColor(engagementScore)"
                  variant="tonal"
                >
                  {{ getEngagementLevel(engagementScore) }}
                </v-chip>
              </div>
            </v-col>
            
            <v-col cols="12" md="8">
              <h4 class="text-h6 mb-3">Engagement Metrics</h4>
              
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span>Average Session Duration</span>
                  <span class="font-weight-medium">{{ analyticsData.avgSessionDuration || '0m 0s' }}</span>
                </div>
                
                <div class="d-flex justify-space-between align-center mb-2">
                  <span>Bounce Rate</span>
                  <span class="font-weight-medium">{{ analyticsData.bounceRate || '0%' }}</span>
                </div>
                
                <div class="d-flex justify-space-between align-center mb-2">
                  <span>Return Visitors</span>
                  <span class="font-weight-medium">{{ analyticsData.returnVisitors || '0%' }}</span>
                </div>
                
                <div class="d-flex justify-space-between align-center">
                  <span>Completion Rate</span>
                  <span class="font-weight-medium">{{ analyticsData.completionRate || '0%' }}</span>
                </div>
              </div>
              
              <v-alert
                v-if="engagementScore < 60"
                type="warning"
                variant="tonal"
              >
                <v-alert-title>Low Engagement Detected</v-alert-title>
                <div>
                  Consider reviewing policy content and accessibility to improve user engagement.
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Top Performing Content -->
    <div>
      <h3 class="text-h5 mb-4 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-trophy</v-icon>
        Content Performance
      </h3>
      
      <v-card>
        <v-card-title>Most Viewed Sections</v-card-title>
        <v-card-text>
          <v-data-table
            :headers="contentHeaders"
            :items="contentPerformance"
            :loading="loadingContent"
            class="elevation-0"
            no-data-text="No content performance data available"
          >
            <template #item.views="{ item }">
              <div class="d-flex align-center">
                <span class="mr-2">{{ item.views }}</span>
                <v-progress-linear
                  :model-value="(item.views / maxViews) * 100"
                  color="primary"
                  height="4"
                  style="width: 60px;"
                />
              </div>
            </template>
            
            <template #item.engagement="{ item }">
              <v-chip
                :color="getEngagementColor(item.engagement)"
                size="small"
                variant="tonal"
              >
                {{ item.engagement }}%
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePolicyStore } from '@/stores/policyStore'
import { useNotificationStore } from '@/stores/notificationStore'
import AnalyticsChart from './charts/AnalyticsChart.vue'

// Props
const props = defineProps<{
  policyId: string
  analyticsData: any
}>()

// State
const policyStore = usePolicyStore()
const notificationStore = useNotificationStore()

const loadingContent = ref(false)
const viewsPeriod = ref('30d')
const viewsChartData = ref({})
const departmentEngagementData = ref({})
const deviceData = ref([])
const locationData = ref([])
const contentPerformance = ref([])

// Computed
const engagementScore = computed(() => {
  return props.analyticsData?.engagementScore || 0
})

const maxViews = computed(() => {
  return Math.max(...contentPerformance.value.map((item: any) => item.views || 0))
})

// Chart Options
const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}))

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}))

// Table Headers
const contentHeaders = [
  { title: 'Section', key: 'section' },
  { title: 'Views', key: 'views', width: '150px' },
  { title: 'Avg. Time', key: 'avgTime', width: '120px' },
  { title: 'Engagement', key: 'engagement', width: '120px' }
]

// Methods
const loadAnalyticsData = async () => {
  try {
    const [views, engagement, devices, locations, content] = await Promise.all([
      policyStore.getViewsAnalytics(props.policyId, viewsPeriod.value),
      policyStore.getDepartmentEngagement(props.policyId),
      policyStore.getDeviceAnalytics(props.policyId),
      policyStore.getLocationAnalytics(props.policyId),
      policyStore.getContentPerformance(props.policyId)
    ])
    
    viewsChartData.value = views
    departmentEngagementData.value = engagement
    deviceData.value = devices || []
    locationData.value = locations || []
    contentPerformance.value = content || []
  } catch (error) {
    notificationStore.showError('Failed to load analytics data')
  }
}

// Utility Functions
const getEngagementColor = (score: number): string => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getEngagementLevel = (score: number): string => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  return 'Poor'
}

// Lifecycle
onMounted(() => {
  loadAnalyticsData()
})

// Watch for period changes
watch(viewsPeriod, () => {
  loadAnalyticsData()
})

// Watch for policy changes
watch(() => props.policyId, () => {
  if (props.policyId) {
    loadAnalyticsData()
  }
})
</script>
```

## Pinia Store Extensions

### Policy Store Extensions for Compliance
```typescript
// stores/policyStore.ts - Additional methods for compliance tracking
export const usePolicyStore = defineStore('policy', () => {
  // ... existing store code ...

  // Compliance tracking methods
  const getPolicyAcknowledgments = async (policyId: string, params: any) => {
    try {
      const response = await policyAPI.getPolicyAcknowledgments(policyId, params)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getComplianceTimeline = async (policyId: string) => {
    try {
      const response = await policyAPI.getComplianceTimeline(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const sendAcknowledgmentReminders = async (policyId: string) => {
    try {
      const response = await policyAPI.sendAcknowledgmentReminders(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const acknowledgePolicy = async (policyId: string, acknowledgmentData: any) => {
    try {
      const response = await policyAPI.acknowledgePolicy(policyId, acknowledgmentData)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getComplianceData = async (policyId: string) => {
    try {
      const response = await policyAPI.getComplianceData(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const exportComplianceReport = async (policyId: string, filters: any) => {
    try {
      const response = await policyAPI.exportComplianceReport(policyId, filters)
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `compliance_report_${policyId}_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
    } catch (err: any) {
      throw err
    }
  }

  // Analytics methods
  const getAnalyticsData = async (policyId: string) => {
    try {
      const response = await policyAPI.getAnalyticsData(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getViewsAnalytics = async (policyId: string, period: string) => {
    try {
      const response = await policyAPI.getViewsAnalytics(policyId, period)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getDepartmentEngagement = async (policyId: string) => {
    try {
      const response = await policyAPI.getDepartmentEngagement(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getDeviceAnalytics = async (policyId: string) => {
    try {
      const response = await policyAPI.getDeviceAnalytics(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getLocationAnalytics = async (policyId: string) => {
    try {
      const response = await policyAPI.getLocationAnalytics(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  const getContentPerformance = async (policyId: string) => {
    try {
      const response = await policyAPI.getContentPerformance(policyId)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  return {
    // ... existing returns ...
    
    // Compliance methods
    getPolicyAcknowledgments,
    getComplianceTimeline,
    sendAcknowledgmentReminders,
    acknowledgePolicy,
    getComplianceData,
    exportComplianceReport,
    
    // Analytics methods
    getAnalyticsData,
    getViewsAnalytics,
    getDepartmentEngagement,
    getDeviceAnalytics,
    getLocationAnalytics,
    getContentPerformance
  }
})
```

This concludes the Company Policy Management Part 3 UI migration documentation, providing comprehensive compliance tracking and analytics features while maintaining Vue.js best practices and modern UI/UX patterns.

## Key Migration Benefits

1. **Advanced Compliance Tracking**: Real-time acknowledgment monitoring with risk assessment
2. **Rich Analytics Dashboard**: Comprehensive usage analytics with interactive charts
3. **Automated Workflows**: Reminder systems and compliance notifications
4. **Risk Management**: Predictive risk scoring and compliance monitoring
5. **Mobile Optimization**: Touch-friendly interfaces for field compliance tracking
6. **Accessibility**: WCAG compliant components with proper ARIA support