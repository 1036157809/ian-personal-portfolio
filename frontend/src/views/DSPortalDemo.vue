<template>
  <div class="pt-20 px-4 pb-12">
    <div class="max-w-6xl mx-auto">
      <router-link
        to="/projects"
        class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-day-primary dark:hover:text-night-primary mb-6"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ $t('common.backToProjects') }}
      </router-link>

      <h1 class="section-title text-center mb-8">{{ $t('dsPortalDemo.title') }}</h1>

      <!-- Notification -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 translate-y-2"
      >
        <div
          v-if="notification.show"
          :class="{
            'fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border': true,
            'bg-white border-green-500 text-green-700 dark:bg-gray-800 dark:border-green-400 dark:text-green-300': notification.type === 'success',
            'bg-white border-red-500 text-red-700 dark:bg-gray-800 dark:border-red-400 dark:text-red-300': notification.type === 'error'
          }"
        >
          {{ notification.message }}
        </div>
      </transition>

      <!-- Confirmation Dialog -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="confirmDialog.show"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold mb-4 text-day-text dark:text-night-text">确认操作</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{{ confirmDialog.message }}</p>
            <div class="flex justify-end gap-3">
              <button
                @click="confirmDialog.show = false"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                @click="confirmDialog.onConfirm(); confirmDialog.show = false"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Loading Overlay -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0"
        enter-to-class="transform opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100"
        leave-to-class="transform opacity-0"
      >
        <div
          v-if="isLoading"
          class="fixed inset-0 z-40 flex items-center justify-center bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80"
        >
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 border-4 border-day-primary border-t-transparent rounded-full animate-spin dark:border-night-primary"></div>
            <p class="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </transition>

      <!-- Demo Section -->
      <div v-if="!showCodeSection" id="demo" class="card mb-8">
        <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.demoTitle') }}</h2>
        
        <!-- State Machine -->
        <div class="mb-8">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.stateMachine') }}</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ $t('dsPortalDemo.currentState') }}: <span class="font-bold text-day-primary dark:text-night-primary">{{ currentStateLabel }}</span></p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-9 gap-2 mb-4">
              <button 
                v-for="(state, index) in processStates" 
                :key="index"
                @click="transitionToState(state)"
                :disabled="!canTransitionTo(state)"
                :class="{
                  'px-1 py-2 text-[10px] rounded-lg transition-all truncate': true,
                  'bg-day-primary text-white dark:bg-night-primary': currentState === state.value,
                  'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500': currentState !== state.value && canTransitionTo(state),
                  'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed': currentState !== state.value && !canTransitionTo(state)
                }"
              >
                {{ index + 1 }}. {{ state.label }}
              </button>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 class="font-bold mb-2 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.stateDescription') }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ currentDescription }}</p>
            </div>
            <div class="mt-4 flex gap-2">
              <button @click="transitionToNextState" :disabled="!hasNextState" class="flex-1 btn-primary py-2 rounded-lg text-sm">{{ $t('dsPortalDemo.nextState') }}</button>
              <button @click="resetStateMachine" class="flex-1 btn-secondary py-2 rounded-lg text-sm">{{ $t('dsPortalDemo.reset') }}</button>
            </div>
          </div>
        </div>

        <!-- File Management -->
        <div>
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.fileManagement') }}</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.uploadFile') }}</label>
              <div class="relative">
                <input 
                  ref="fileInputRef"
                  type="file" 
                  @change="handleFileUpload"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-day-text dark:text-night-text file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-day-primary file:text-white dark:file:bg-night-primary dark:file:text-white hover:file:bg-day-primary/90 dark:hover:file:bg-night-primary/90 cursor-pointer"
                />
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-300 dark:border-gray-600">
                    <th class="text-left py-3 px-4 text-sm font-semibold text-day-text dark:text-night-text">{{ $t('dsPortalDemo.fileName') }}</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-day-text dark:text-night-text">{{ $t('dsPortalDemo.fileSize') }}</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-day-text dark:text-night-text">{{ $t('dsPortalDemo.fileType') }}</th>
                    <th class="text-left py-3 px-4 text-sm font-semibold text-day-text dark:text-night-text">{{ $t('dsPortalDemo.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in uploadedFiles" :key="file.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <td class="py-3 px-4 text-sm text-day-text dark:text-night-text">{{ file.name }}</td>
                    <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{{ file.size }}</td>
                    <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{{ file.type }}</td>
                    <td class="py-3 px-4 flex gap-2">
                      <button @click="downloadFile(file)" class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium transition-colors">{{ $t('dsPortalDemo.download') }}</button>
                      <button @click="deleteFile(file.id)" class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors">{{ $t('dsPortalDemo.delete') }}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Code Section -->
      <div v-if="showCodeSection" id="code" class="card">
        <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.codeTitle') }}</h2>
        
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.stateMachineCodeTitle') }}</h3>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ stateMachineCode }}</code></pre>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.createAppApiTitle') }}</h3>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ createAppApiCode }}</code></pre>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.homePageApiTitle') }}</h3>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ homePageApiCode }}</code></pre>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.uploadComponentTitle') }}</h3>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ uploadComponentCode }}</code></pre>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.routerConfigTitle') }}</h3>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ routerConfigCode }}</code></pre>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-3 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.oktaConfigTitle') }}</h3>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ oktaConfigCode }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

interface ProcessState {
  value: string
  label: string
  description: string
}

interface UploadedFile {
  id: string
  name: string
  size: string
  type: string
}

// Show code section only when URL has #code anchor
const showCodeSection = ref(false)

const handleHashChange = () => {
  showCodeSection.value = route.hash === '#code'
}

onMounted(() => {
  fetchFiles()
  handleHashChange()
  window.addEventListener('hashchange', handleHashChange)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange)
})

// Code content from dscode project
const stateMachineCode = ref(`// State Machine Definition (src/utils/constants.js)
export const RECRUITMENT_PROCESS_STATUS_MAP = {
  CREATED: '1',
  FSC_APPLICATION: '2',
  REVIEW_APPLICATION: '3',
  INTERVIEW_AND_SIGNING: '4',
  DUE_DILIGENCE_CHECK: '5',
  TD_OPS_MANAGEMENT_REVIEW: '6',
  RNF_LODGEMENT: '7',
  ISSUED_FSC_CODE: '8',
  COMPLETION_HIRING: '9',
};

export const RECRUITMENT_PROCESS_STATUS_LIST = [
  RECRUITMENT_PROCESS_STATUS_MAP.CREATED,
  RECRUITMENT_PROCESS_STATUS_MAP.FSC_APPLICATION,
  RECRUITMENT_PROCESS_STATUS_MAP.REVIEW_APPLICATION,
  RECRUITMENT_PROCESS_STATUS_MAP.INTERVIEW_AND_SIGNING,
  RECRUITMENT_PROCESS_STATUS_MAP.DUE_DILIGENCE_CHECK,
  RECRUITMENT_PROCESS_STATUS_MAP.TD_OPS_MANAGEMENT_REVIEW,
  RECRUITMENT_PROCESS_STATUS_MAP.RNF_LODGEMENT,
  RECRUITMENT_PROCESS_STATUS_MAP.ISSUED_FSC_CODE,
  RECRUITMENT_PROCESS_STATUS_MAP.COMPLETION_HIRING,
];

// Route Guard for State-Based Access Control
const RouteAuth = ({ routeAuthByRecruitmentProcessStepStatus, component }) => {
  const { recruitmentProcessStatus } = useSelector((state) => state.app);
  
  if (!routeAuthByRecruitmentProcessStepStatus.includes(recruitmentProcessStatus)) {
    return <Navigate to="/tdops/404" replace />;
  }
  
  return component;
};`)

const createAppApiCode = ref(`import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { BASE_API } from '@utils/constants';

export const TAG_TYPES_MAP = {
  SAVE_APPLICATION_FORM_STATUS: 'saveApplicationFormStatus',
  SAVE_CEA_CHECK: 'saveCeaCheck',
  NICE_INDEX: 'niceIndex',
  MED_SAVE: 'medSave',
  CLOSE_MONITORING: 'closeMonitoring',
  GET_FATCA_CHECK: 'getFatcaCheck',
  FINANCIAL_SOUNDNESS: 'financialSoundness',
  ISSUANCE: 'issuance',
  SAVE_MANAGEMENT_REVIEW: 'saveManagementReview',
  SAVE_QUESTNET_CHECK: 'saveQuestnetCheck',
  SAVE_RNF_CHECK: 'saveRnfCheck',
  RNF_LODGEMENT: 'rnfLodgement',
  UPLOAD: 'upload',
  TABLE_ORDER: 'table_order',
};
const url = '/api';
const bool = true;
export const baseApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: bool ? url : BASE_API,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().app?.accessToken ?? '';
      headers.set('Authorization', \`Bearer \${token}\`);
      return headers;
    },
  }),
  tagTypes: Object.values(TAG_TYPES_MAP),
  endpoints: () => {
    return {};
  },
});`)

const homePageApiCode = ref(`import { baseApiSlice } from '@redux/createAppApi';
import { parseUrl } from '@utils/request';
import { getHomePageInfoUrl } from '@utils/apis';
import notifications from '@utils/notifications';

const homePageApi = baseApiSlice.injectEndpoints({
  endpoints(builder) {
    return {
      getHomePageData: builder.query({
        query(params) {
          return parseUrl(getHomePageInfoUrl, params);
        },
        transformResponse: (res) => res.data,
        transformErrorResponse(baseQueryReturnValue) {
          const message =
            baseQueryReturnValue?.data?.error?.message ||
            baseQueryReturnValue?.data?.success?.message ||
            'request Err';
          notifications('error', message);
          return baseQueryReturnValue;
        },
      }),
    };
  },
});

export const { useGetHomePageDataQuery } = homePageApi;
export default homePageApi;`)

const uploadComponentCode = ref(`import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import EnhanceUploader from './EnhanceUploader';
import { FILE_TYPES } from '@utils/constants';
import { parse } from 'query-string';
import { useGetCaseNumberQuery } from '@redux/api/commentsApi';

const CustomUploader = ({
  uploadFunction,
  deleteFunction,
  id,
  type = 'single',
  uploadFor = 'image',
  fileList,
  maxCount,
  maxSize,
  disabled,
  showWhenDisabled,
  fileRenameTemplate,
}) => {
  const navigate = useNavigate();
  const [listRef, setListRef] = React.useState([React.createRef()]);
  const [hidden, setHidden] = React.useState(false);
  const location = useLocation();
  const parsed = parse(location.search);
  const recruitmentProcessId = parsed?.recruitmentId;
  const caseType = parsed?.caseType;
  const caseNumberRes = useGetCaseNumberQuery({
    recruitmentProcessId,
    caseType,
  });

  const handleUpdateFunction = (ref, index, uploadId, e) => {
    if (!fileValidation(ref, e.target.files[0])) {
      return;
    }
    if (uploadFunction) {
      if (fileRenameTemplate?.length > 0) {
        uploadFunction(ref, uploadId, fileRename(e));
      } else {
        uploadFunction(ref, uploadId, e);
      }
    }
  };

  const fileValidation = (ref, file) => {
    const size = maxSize ?? 1024 * 1024 * 10;
    let errorMsg = '';
    if (file.size > size) {
      errorMsg = \`File exceeds maximum size limit.\`;
    } else if (!FILE_TYPES.includes(file.name.split('.').pop().toUpperCase())) {
      errorMsg = 'Incorrect file format.';
    }
    if (errorMsg != '') {
      ref.current.handleUpdateFile({
        uploadStatus: 'error',
        uploadingText: errorMsg,
      });
      return false;
    }
    return true;
  };

  return (
    <EnhanceUploader
      type={type}
      ref={listRef[0]}
      uploadFunction={(e) => handleUpdateFunction(listRef[0], 0, id, e)}
      deleteFunction={(fileName) => deleteFunction(listRef[0], fileName, id)}
      uploadFor={uploadFor}
      disabled={disabled}
      hidden={hidden}
    />
  );
};`)

const routerConfigCode = ref(`import React from 'react';
import loadable from '@loadable/component';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Security, LoginCallback } from '@okta/okta-react';
import { OktaAuth } from '@okta/okta-auth-js';
import { oktaAuthConfig } from '@utils/config';
import { RECRUITMENT_PROCESS_STATUS_MAP } from '@utils/constants';

const RouteAuth = loadable(() => import('@pages/RouteAuth.jsx'));
const PrivateRoute = loadable(() => import('@components/PrivateRoute'));
const HomePage = loadable(() => import('@pages/HomePage'));
const DueDiligenceCheck = loadable(() =>
  import('@pages/application/DueDiligenceCheck')
);
const ManagementReview = loadable(() =>
  import('@pages/application/ManagementReview')
);

const oktaAuth = new OktaAuth(oktaAuthConfig);

const Router = () => {
  const navigate = useNavigate();
  const restoreOriginalUri = () => {
    navigate('/tdops/login');
  };
  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        <Route exact path='/tdops' element={<IndexPage />} />
        <Route exact path='/tdops/404' element={<NotFoundPage />} />
        <Route exact path='/tdops/login' element={<LoginPage />} />
        <Route path='/tdops/login/callback' element={<LoginCallback />} />
        
        <Route
          path='/tdops/home'
          element={<HomePage />}
        />
        <Route
          path='/tdops/due-diligence-check'
          element={
            <PrivateRoute>
              <RouteAuth
                routeAuthByRecruitmentProcessStepStatus={
                  RECRUITMENT_PROCESS_STATUS_MAP.DUE_DILIGENCE_CHECK
                }
                component={DueDiligenceCheck}
              />
            </PrivateRoute>
          }
        />
        <Route
          path='/tdops/management-review'
          element={
            <PrivateRoute>
              <RouteAuth
                routeAuthByRecruitmentProcessStepStatus={
                  RECRUITMENT_PROCESS_STATUS_MAP.TD_OPS_MANAGEMENT_REVIEW
                }
                component={ManagementReview}
              />
            </PrivateRoute>
          }
        />
      </Routes>
    </Security>
  );
};

export default Router;`)

const oktaConfigCode = ref(`export const oktaAuthConfig = {
  issuer:
    process.env.REACT_APP_OKTA_ISSUER ||
    'https://[REDACTED_ID].okta.com/oauth2/[REDACTED_ID]',

  clientId: process.env.REACT_APP_OKTA_CLIENT_ID || '[REDACTED_CLIENT_ID]',

  redirectUri: \`\${window.location.origin}/tdops/login/callback\`,

  postLogoutRedirectUri: \`\${window.location.origin}/tdops/logout\`,

  scopes: ['openid', 'profile', 'email'],

  pkce: true,
};`)

// State Machine
const currentState = ref('1')

const processStates = computed<ProcessState[]>(() => [
  { value: '1', label: 'Created', description: t('dsPortalDemo.stateCreated') },
  { value: '2', label: 'FSC Application', description: t('dsPortalDemo.stateFscApplication') },
  { value: '3', label: 'Review Application', description: t('dsPortalDemo.stateReviewApplication') },
  { value: '4', label: 'Interview & Signing', description: t('dsPortalDemo.stateInterviewSigning') },
  { value: '5', label: 'Due Diligence', description: t('dsPortalDemo.stateDueDiligence') },
  { value: '6', label: 'TD Ops Review', description: t('dsPortalDemo.stateTdOpsReview') },
  { value: '7', label: 'RNF Lodgement', description: t('dsPortalDemo.stateRnfLodgement') },
  { value: '8', label: 'Issued FSC Code', description: t('dsPortalDemo.stateIssuedFscCode') },
  { value: '9', label: 'Completion', description: t('dsPortalDemo.stateCompletionHiring') }
])

const currentStateLabel = computed(() => {
  const state = processStates.value.find(s => s.value === currentState.value)
  return state ? state.label : 'Unknown'
})

const currentDescription = computed(() => {
  const state = processStates.value.find(s => s.value === currentState.value)
  return state ? state.description : ''
})

const canTransitionTo = (state: ProcessState) => {
  const currentIndex = processStates.value.findIndex(s => s.value === currentState.value)
  const targetIndex = processStates.value.findIndex(s => s.value === state.value)
  return targetIndex === currentIndex + 1 || targetIndex === currentIndex
}

const transitionToState = (state: ProcessState) => {
  if (canTransitionTo(state)) {
    currentState.value = state.value
  }
}

const hasNextState = computed(() => {
  const currentIndex = processStates.value.findIndex(s => s.value === currentState.value)
  return currentIndex < processStates.value.length - 1
})

const transitionToNextState = () => {
  const currentIndex = processStates.value.findIndex(s => s.value === currentState.value)
  if (currentIndex < processStates.value.length - 1) {
    currentState.value = processStates.value[currentIndex + 1].value
  }
}

const resetStateMachine = () => {
  currentState.value = '1'
}

// File Management
const uploadedFiles = ref<UploadedFile[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

// Notification state
const notification = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
  show: false,
  message: '',
  type: 'success'
})

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Loading state
const isLoading = ref(false)

// Confirmation dialog state
const confirmDialog = ref<{ show: boolean; message: string; onConfirm: () => void }>({
  show: false,
  message: '',
  onConfirm: () => {}
})

const showConfirmDialog = (message: string, onConfirm: () => void) => {
  confirmDialog.value = { show: true, message, onConfirm }
}

// Fetch files from API
const fetchFiles = async () => {
  try {
    isLoading.value = true
    const response = await fetch('/api/files')
    const data = await response.json()
    uploadedFiles.value = data
  } catch (error) {
    console.error('Failed to fetch files:', error)
    showNotification('获取文件列表失败', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      isLoading.value = true
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          type: file.type.split('/')[1].toUpperCase() || 'Unknown'
        })
      })
      
      if (response.ok) {
        await fetchFiles()
        showNotification(`文件上传成功：${file.name}`, 'success')
        if (fileInputRef.value) {
          fileInputRef.value.value = '' // Clear file input
        }
      } else {
        showNotification('文件上传失败', 'error')
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      showNotification('文件上传失败', 'error')
    } finally {
      isLoading.value = false
    }
  }
}

const downloadFile = (file: UploadedFile) => {
  showNotification(`下载文件：${file.name}`, 'success')
}

const deleteFile = async (id: string) => {
  showConfirmDialog('确定要删除此文件吗？', async () => {
    try {
      isLoading.value = true
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchFiles()
        showNotification('文件已删除', 'success')
      } else {
        showNotification('文件删除失败', 'error')
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      showNotification('文件删除失败', 'error')
    } finally {
      isLoading.value = false
    }
  })
}
</script>
