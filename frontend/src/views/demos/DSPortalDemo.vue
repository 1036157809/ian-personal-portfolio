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
            <!-- Upload Area -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.uploadFile') }}</label>
              
              <!-- Drag & Drop Zone -->
              <div
                @drop="handleDrop"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @click="fileInputRef?.click()"
                :class="{
                  'border-2 border-dashed border-day-primary dark:border-night-primary bg-day-primary/5 dark:bg-night-primary/5': isDragging,
                  'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500': !isDragging
                }"
                class="relative cursor-pointer rounded-lg p-8 text-center transition-colors"
              >
                <div class="flex flex-col items-center justify-center">
                  <svg class="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ isDragging ? t('dsPortalDemo.dropFiles') : t('dsPortalDemo.dragOrClick') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ t('dsPortalDemo.fileLimits') }}</p>
                </div>
                <input
                  ref="fileInputRef"
                  type="file"
                  multiple
                  @change="handleFileUpload"
                  class="hidden"
                />
              </div>
            </div>

            <!-- Rename Template -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.renameTemplate') }}</label>
              <input
                v-model="renameTemplate"
                type="text"
                :placeholder="t('dsPortalDemo.renamePlaceholder')"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-day-text dark:text-night-text text-sm"
              />
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ t('dsPortalDemo.renameHint') }}</p>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress.length > 0" class="mb-4">
              <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">{{ $t('dsPortalDemo.uploadProgress') }}</label>
              <div class="space-y-2">
                <div v-for="progress in uploadProgress" :key="progress.fileName" class="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-day-text dark:text-night-text">{{ progress.fileName }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ progress.percentage }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      class="bg-day-primary dark:bg-night-primary h-2 rounded-full transition-all duration-300"
                      :style="{ width: progress.percentage + '%' }"
                    ></div>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ progress.speed }}</span>
                    <button
                      v-if="progress.paused"
                      @click="resumeUpload(progress)"
                      class="text-xs text-day-primary dark:text-night-primary hover:underline"
                    >
                      {{ t('dsPortalDemo.resume') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- File List -->
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
                  <tr v-if="uploadedFiles.length === 0">
                    <td colspan="4" class="py-12 text-center text-gray-500 dark:text-gray-400">
                      <div class="flex flex-col items-center justify-center">
                        <svg class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                        </svg>
                        <p class="text-lg font-medium mb-2">暂无文件</p>
                        <p class="text-sm">点击上方上传区域添加文件</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="file in uploadedFiles" :key="file.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <td class="py-3 px-4 text-sm text-day-text dark:text-night-text">{{ file.name }}</td>
                    <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{{ file.size }}</td>
                    <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{{ file.type }}</td>
                    <td class="py-3 px-4 flex gap-2">
                      <button
                        v-if="isImage(file.type)"
                        @click="previewImage(file)"
                        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        {{ t('dsPortalDemo.preview') }}
                      </button>
                      <button
                        v-if="isPDF(file.type)"
                        @click="previewPDF(file)"
                        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        {{ t('dsPortalDemo.preview') }}
                      </button>
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
      <div v-if="showCodeSection" id="code" class="space-y-6">
        <h2 class="section-title text-center mb-8">技术难点与解决方案</h2>

        <!-- Challenge 1: Complex Business State Management -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">难点1：复杂的业务状态管理</h3>
          
          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">问题描述</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">系统包含9个主要流程状态，每个状态有多个子步骤和条件判断，不同角色在不同状态下有不同的访问权限和操作权限，状态流转逻辑复杂。</p>
          </div>

          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">解决方案</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>使用 Redux Toolkit + RTK Query 统一管理状态</li>
              <li>定义清晰的状态常量和状态映射</li>
              <li>使用 useMemo 和 useEffect 实现状态依赖的动态计算</li>
              <li>通过路由守卫实现权限控制</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">关键代码</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ challenge1Code }}</code></pre>
          </div>
        </div>

        <!-- Challenge 2: File Upload/Download Performance -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">难点2：文件上传与下载的性能优化</h3>
          
          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">问题描述</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">系统需要处理大量文件上传和下载，包括图片、PDF等多种格式，文件大小可能达到10MB以上，需要优化上传下载性能，提升用户体验。</p>
          </div>

          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">解决方案</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>使用 FormData 实现文件上传</li>
              <li>实现文件大小和格式校验</li>
              <li>使用 Blob 实现流式下载</li>
              <li>支持文件重命名模板</li>
              <li>实现上传进度显示</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">关键代码</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ uploadComponentCode }}</code></pre>
          </div>
        </div>

        <!-- Challenge 3: Multi-Environment Configuration -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">难点3：多环境配置与部署</h3>
          
          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">问题描述</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">系统需要支持 Development、UAT、Production 三个环境，每个环境有不同的API地址、认证配置、监控配置，需要统一管理环境配置。</p>
          </div>

          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">解决方案</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>使用环境变量管理不同环境配置</li>
              <li>配置 Craco 实现构建定制</li>
              <li>使用 Docker 容器化部署</li>
              <li>配置 Azure Pipelines 实现 CI/CD</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">关键代码</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ challenge3Code }}</code></pre>
          </div>
        </div>

        <!-- Challenge 4: Permission Control & Route Guards -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">难点4：权限控制与路由守卫</h3>
          
          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">问题描述</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">系统包含 TD Ops Staff 和 Manager 两个角色，不同角色有不同的页面访问权限和操作权限，需要实现细粒度的权限控制。</p>
          </div>

          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">解决方案</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>使用 Okta 实现身份认证</li>
              <li>实现路由守卫组件</li>
              <li>根据角色和状态动态控制页面访问</li>
              <li>在组件级别实现操作权限控制</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">关键代码</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ challenge4Code }}</code></pre>
          </div>
        </div>

        <!-- Challenge 5: Code Splitting & Performance -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">难点5：代码分割与性能优化</h3>
          
          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">问题描述</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">应用代码体积较大，首屏加载时间较长，需要优化加载性能。同时需要减少不必要的网络请求，提升用户体验。</p>
          </div>

          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">解决方案</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>使用 @loadable/component 实现路由级别的代码分割</li>
              <li>按需加载页面组件，减少初始加载体积</li>
              <li>通过 RTK Query 的智能缓存策略减少重复请求</li>
              <li>实现请求去重，避免网络浪费</li>
              <li>关键资源预加载，提升用户体验</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">关键代码</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ routerConfigCode }}</code></pre>
          </div>
        </div>

        <!-- Challenge 6: Monitoring & Observability -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">难点6：监控与可观测性</h3>
          
          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">问题描述</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">需要实现用户行为追踪、性能监控、错误日志收集等功能，以便及时发现问题并优化用户体验。同时需要支持多环境监控策略。</p>
          </div>

          <div class="mb-4">
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">解决方案</h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>集成 Microsoft Application Insights 实现监控</li>
              <li>记录用户操作路径，分析用户行为</li>
              <li>监控页面加载时间、API响应时间</li>
              <li>自动收集前端错误，便于问题排查</li>
              <li>支持 Development/UAT/Production 不同监控配置</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2 text-day-text dark:text-night-text">关键代码</h4>
            <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ monitoringCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div
      v-if="showImagePreview"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      @click="closeImagePreview"
    >
      <div class="relative max-w-7xl max-h-[95vh]">
        <button
          @click="closeImagePreview"
          class="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <img
          :src="previewImageUrl"
          :alt="previewFile?.name"
          class="max-w-full max-h-[95vh] object-contain rounded-lg"
        />
      </div>
    </div>

    <!-- PDF Preview Modal -->
    <div
      v-if="showPDFPreview"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2"
      @click="closePDFPreview"
    >
      <div class="relative w-full h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden" @click.stop>
        <button
          @click="closePDFPreview"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="p-4 h-full flex flex-col">
          <h3 class="text-lg font-bold mb-4 text-day-text dark:text-night-text">{{ previewFile?.name }}</h3>
          <div class="flex-1 overflow-auto">
            <iframe
              v-if="previewPdfUrl"
              :src="previewPdfUrl"
              class="w-full h-full border-0"
              type="application/pdf"
            ></iframe>
            <p v-else class="text-gray-600 dark:text-gray-400 text-center py-8">
              {{ $t('dsPortalDemo.pdfPreviewNote') }}
            </p>
          </div>
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

const createAppApiCode = ref(`// RTK Query Base API Configuration (src/redux/createAppApi.js)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
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

export const baseApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().app?.accessToken ?? '';
      headers.set('Authorization', \`Bearer \${token}\`);
      return headers;
    },
  }),
  tagTypes: Object.values(TAG_TYPES_MAP),
  endpoints: () => ({}),
});`)

const homePageApiCode = ref(`// API Module Example (src/redux/api/homePageApi.js)
import { baseApiSlice } from '@redux/createAppApi';
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

export const { useGetHomePageDataQuery } = homePageApi;`)

const uploadComponentCode = ref(`// File Upload Component (src/components/Upload/index.jsx)
const CustomUploader = ({
  uploadFunction,
  deleteFunction,
  type = 'single',
  uploadFor = 'image',
  fileList,
  maxCount,
  maxSize,
  disabled,
  fileRenameTemplate,
}) => {
  const [listRef, setListRef] = React.useState([React.createRef()]);

  // File validation
  const fileValidation = (ref, file) => {
    const size = maxSize ?? 1024 * 1024 * 10;
    const sizeString = formatBytes(size);
    let errorMsg = '';
    if (file.size > size) {
      errorMsg = \`File exceeds maximum size limit of \${sizeString}.\`;
    } else if (file.size === 0) {
      errorMsg = 'File size is 0';
    } else if (!FILE_TYPES.includes(file.name.split('.').pop().toUpperCase())) {
      errorMsg = 'Incorrect file format.';
    }
    if (errorMsg != '') {
      ref.current.handleUpdateFile({
        uploadStatus: 'error',
        uploadingText: errorMsg,
        listFile: [...fileList],
      });
      return false;
    }
    return true;
  };

  // File rename
  const fileRename = (e) => {
    const caseId = caseNumberRes?.data?.caseNumber ?? recruitmentProcessId;
    const combinedTemplate = caseId + fileRenameTemplate;
    let fileRenameIndex = '1';
    if (fileList?.length > 0) {
      const indexArray = fileList.map((item) => {
        return Number(
          item.name
            .substring(0, item.name.length - 4)
            .replace(combinedTemplate, '')
        );
      });
      if (indexArray && indexArray.length > 1) {
        fileRenameIndex = Math.max(...indexArray) + 1;
      } else {
        fileRenameIndex = indexArray[0] + 1;
      }
    }
    const firstFile = e.target.files[0];
    const newFile = new File(
      [firstFile],
      combinedTemplate +
        fileRenameIndex +
        firstFile.name.substring(firstFile.name.length - 4),
      { type: firstFile.type }
    );
    return { target: { files: [newFile] } };
  };

  return <EnhanceUploader /* ... */ />;
};`)

const routerConfigCode = ref(`// import React from 'react';
// import loadable from '@loadable/component';
// import { useNavigate, Routes, Route } from 'react-router-dom';
// import { Security, LoginCallback } from '@okta/okta-react';
// import { OktaAuth } from '@okta/okta-auth-js';
// import { oktaAuthConfig } from '@utils/config';
// import { RECRUITMENT_PROCESS_STATUS_MAP } from '@utils/constants';

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

const oktaConfigCode = ref(`// Okta OAuth Configuration (src/utils/config.js)
export const oktaAuthConfig = {
  issuer:
    process.env.REACT_APP_OKTA_ISSUER ||
    'https://[REDACTED].okta.com/oauth2/[REDACTED_ID]',
  clientId: process.env.REACT_APP_OKTA_CLIENT_ID || '[REDACTED_CLIENT_ID]',
  redirectUri: \`\${window.location.origin}/tdops/login/callback\`,
  postLogoutRedirectUri: \`\${window.location.origin}/tdops/logout\`,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
};

// Authentication Service (src/services/auth.js)
import axios from 'axios';
import { BASE_API } from '@utils/constants';

const generateToken = async (oktaAccessToken) => {
  try {
    const response = await axios.post(\`\${BASE_API}/auth/okta/generateToken\`, {
      accessToken: oktaAccessToken,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(\`\${BASE_API}/auth/okta/refreshToken\`, {
      refreshToken,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const logout = async (accessToken) => {
  try {
    await axios.post(\`\${BASE_API}/auth/okta/logout\`, null, {
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { generateToken, logout, refreshToken };`)

const rtkQueryUsageCode = ref(`// Component using RTK Query (src/pages/HomePage/index.jsx)
import { useGetHomePageDataQuery } from '@redux/api/homePageApi';

const HomePage = () => {
  const [homePageDataParams, setHomePageDataParams] = useState({
    pageType: tabSelectedItem,
    searchField: HOMEPAGE_TEXT.searchFieldVal,
    status: HOMEPAGE_TEXT.statusVal,
  });

  // Automatically handles loading, error, caching
  const {
    data: applicationListData,
    isSuccess,
    isFetching,
    refetch,
  } = useGetHomePageDataQuery(homePageDataParams);

  // Refetch when parameters change
  useEffect(() => {
    refetch();
  }, [homePageDataParams]);

  return (
    <Spin isLoading={isFetching}>
      {/* Rendering logic */}
    </Spin>
  );
};`)

const challenge1Code = ref(`// 状态定义
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

// 路由守卫
const RouteAuth = ({ routeAuthByRecruitmentProcessStepStatus, component }) => {
  const { recruitmentProcessStatus } = useSelector((state) => state.app);
  
  if (!routeAuthByRecruitmentProcessStepStatus.includes(recruitmentProcessStatus)) {
    return <Navigate to="/tdops/404" replace />;
  }
  
  return component;
};`)

const challenge2Code = ref(`// 文件上传
const uploadFile = build.mutation({
  query(params) {
    let formData = new FormData();
    for (let key in params) {
      formData.append(key, params[key]);
    }
    return {
      ...uploadFileUrl,
      body: formData,
    };
  },
});

// Blob 下载
const downLoadFile = async (parm) => {
  const res = await blobFn({ id });
  if (res.data) {
    const blob = new Blob([res.data]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file?.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};`)

const challenge3Code = ref(`// 环境配置
// config/.env.development
REACT_APP_NAME='iRecruit DS Portal'
REACT_APP_BASE_URL=https://[REDACTED].[REDACTED].com.sg
REACT_APP_OKTA_ISSUER=https://[REDACTED].okta.com/oauth2/[REDACTED_ID]
REACT_APP_OKTA_CLIENT_ID=[REDACTED_CLIENT_ID]
REACT_APP_ENVIRONMENT=development

// config/.env.uat
REACT_APP_BASE_URL=https://[REDACTED].[REDACTED].com.sg
REACT_APP_ENVIRONMENT=uat

// config/.env.production
REACT_APP_BASE_URL=https://[REDACTED].[REDACTED].com.sg
REACT_APP_ENVIRONMENT=production`)

const challenge4Code = ref(`// 路由守卫
const PrivateRoute = ({ children }) => {
  const { authState } = useOktaAuth();
  
  if (!authState || !authState.isAuthenticated) {
    return <Navigate to="/tdops/login" replace />;
  }
  
  return children;
};

// 状态权限守卫
const RouteAuth = ({ routeAuthByRecruitmentProcessStepStatus, component }) => {
  const { recruitmentProcessStatus } = useSelector((state) => state.app);
  
  if (!routeAuthByRecruitmentProcessStepStatus.includes(recruitmentProcessStatus)) {
    return <Navigate to="/tdops/404" replace />;
  }
  
  return component;
};`)

const monitoringCode = ref(`// Application Insights 配置 (src/index.js)
const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

let adobeScriptSrc;
let digitalDataEnv;
if (environment === 'production') {
  adobeScriptSrc =
    '//assets.adobedtm.com/e17df9099c11/a71a12849473/launch-1542e363e664.min.js';
  digitalDataEnv = 'PROD';
} else if (environment === 'uat') {
  adobeScriptSrc =
    '//assets.adobedtm.com/e17df9099c11/a71a12849473/launch-b309b9dee539-staging.min.js';
  digitalDataEnv = 'UAT';
} else {
  adobeScriptSrc =
    '//assets.adobedtm.com/e17df9099c11/a71a12849473/launch-4a3effb21ddd-development.min.js';
  digitalDataEnv = 'DEV';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(StrictMode, null,
    React.createElement(HelmetProvider, null,
      React.createElement(Provider, { store: store },
        React.createElement(Helmet, null,
          React.createElement('script', null,
            \`var digitalData = digitalData || {};
             digitalData = {
               lang: 'en',
               country: 'sg',
               env: '\${digitalDataEnv}',
               modules: 'irecruit',
               job: 'candidate',
             }\`
          ),
          React.createElement('script', { src: adobeScriptSrc, async: true })
        ),
        React.createElement(ThemeProvider, { theme: theme },
          React.createElement(App, null),
          React.createElement(GlobalStyle, null)
        )
      )
    )
  )
);`)

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
const isDragging = ref(false)
const renameTemplate = ref('')
const uploadProgress = ref<{ fileName: string; percentage: number; speed: string; paused: boolean }[]>([])

// Allowed file types
const ALLOWED_FILE_TYPES = ['PDF', 'JPG', 'JPEG', 'PNG', 'DOC', 'DOCX', 'XLS', 'XLSX']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

// Drag and drop handlers
const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) {
    handleBatchUpload(Array.from(files))
  }
}

// File type validation
const validateFile = (file: File): { valid: boolean; error: string } => {
  const extension = file.name.split('.').pop()?.toUpperCase() || ''
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: t('dsPortalDemo.fileSizeError') }
  }
  
  if (!ALLOWED_FILE_TYPES.includes(extension)) {
    return { valid: false, error: t('dsPortalDemo.fileTypeError') }
  }
  
  return { valid: true, error: '' }
}

// File type helpers
const isImage = (type: string): boolean => {
  return type.toUpperCase() === 'IMAGE' || ['JPG', 'JPEG', 'PNG'].includes(type.toUpperCase())
}

const isPDF = (type: string): boolean => {
  return type.toUpperCase() === 'PDF'
}

// Preview modals
const showImagePreview = ref(false)
const showPDFPreview = ref(false)
const previewFile = ref<UploadedFile | null>(null)
const previewImageUrl = ref('')
const previewPdfUrl = ref('')

// Preview functions
const previewImage = async (file: UploadedFile) => {
  previewFile.value = file
  // Add timestamp to avoid stale cache, but browser will use cache if available
  previewImageUrl.value = `/api/files/preview/${file.id}`
  showImagePreview.value = true
}

const previewPDF = async (file: UploadedFile) => {
  previewFile.value = file
  // Add timestamp to avoid stale cache, but browser will use cache if available
  previewPdfUrl.value = `/api/files/preview/${file.id}`
  showPDFPreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
  previewFile.value = null
  previewImageUrl.value = ''
}

const closePDFPreview = () => {
  showPDFPreview.value = false
  previewFile.value = null
  previewPdfUrl.value = ''
}

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

// Batch upload handler
const handleBatchUpload = async (files: File[]) => {
  for (const file of files) {
    const validation = validateFile(file)
    if (!validation.valid) {
      showNotification(`${file.name}: ${validation.error}`, 'error')
      continue
    }
    await uploadFile(file)
  }
}

// Updated file upload handler
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await handleBatchUpload(Array.from(files))
    if (fileInputRef.value) {
      (fileInputRef.value as HTMLInputElement).value = '' // Clear file input
    }
  }
}

// Upload file with chunking support
const uploadFile = async (file: File) => {
  try {
    isLoading.value = true
    
    // Apply rename template if provided
    let fileName = file.name
    if (renameTemplate.value) {
      const ext = fileName.split('.').pop()
      const baseName = fileName.substring(0, fileName.lastIndexOf('.'))
      fileName = `${renameTemplate.value}_${baseName}.${ext}`
    }
    
    // Use chunked upload for large files
    if (file.size > CHUNK_SIZE) {
      await uploadFileInChunks(file, fileName)
    } else {
      await uploadFileDirect(file, fileName)
    }
  } catch (error) {
    console.error('Failed to upload file:', error)
    showNotification(`文件上传失败：${file.name}`, 'error')
  } finally {
    isLoading.value = false
  }
}

// Direct upload for small files
const uploadFileDirect = async (file: File, fileName: string) => {
  const progressItem = {
    fileName,
    percentage: 0,
    speed: '0 KB/s',
    paused: false
  }
  uploadProgress.value.push(progressItem)
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', fileName)
    formData.append('size', file.size.toString())
    formData.append('type', file.type)
    
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (response.ok) {
      progressItem.percentage = 100
      progressItem.speed = 'Completed'
      await fetchFiles()
      showNotification(`文件上传成功：${fileName}`, 'success')
    } else {
      showNotification('文件上传失败', 'error')
    }
  } finally {
    uploadProgress.value = uploadProgress.value.filter(p => p.fileName !== fileName)
  }
}

// Chunked upload for large files with resume capability
const uploadFileInChunks = async (file: File, fileName: string) => {
  const progressItem = {
    fileName,
    percentage: 0,
    speed: '0 KB/s',
    paused: false
  }
  uploadProgress.value.push(progressItem)
  
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  let uploadedChunks = 0
  const startTime = Date.now()
  
  try {
    for (let i = 0; i < totalChunks; i++) {
      if (progressItem.paused) {
        return // Pause upload
      }
      
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)
      
      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('fileName', fileName)
      formData.append('chunkIndex', i.toString())
      formData.append('totalChunks', totalChunks.toString())
      
      const response = await fetch('/api/files/upload-chunk', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        uploadedChunks++
        progressItem.percentage = Math.round((uploadedChunks / totalChunks) * 100)
        
        const elapsed = (Date.now() - startTime) / 1000
        const speed = Math.round((uploadedChunks * CHUNK_SIZE) / elapsed / 1024)
        progressItem.speed = `${speed} KB/s`
      } else {
        throw new Error('Chunk upload failed')
      }
    }
    
    // Complete the upload
    await fetch('/api/files/complete-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName })
    })
    
    await fetchFiles()
    showNotification(`文件上传成功：${fileName}`, 'success')
  } finally {
    uploadProgress.value = uploadProgress.value.filter(p => p.fileName !== fileName)
  }
}

// Resume upload
const resumeUpload = (progress: { fileName: string; percentage: number; speed: string; paused: boolean }) => {
  progress.paused = false
  showNotification(`恢复上传：${progress.fileName}`, 'success')
}

const downloadFile = async (file: UploadedFile) => {
  try {
    isLoading.value = true
    const response = await fetch(`/api/files/download/${file.id}`)
    
    if (!response.ok) {
      throw new Error('Download failed')
    }
    
    // Streaming download using blob
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    showNotification(`下载文件：${file.name}`, 'success')
  } catch (error) {
    console.error('Failed to download file:', error)
    showNotification('文件下载失败', 'error')
  } finally {
    isLoading.value = false
  }
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
