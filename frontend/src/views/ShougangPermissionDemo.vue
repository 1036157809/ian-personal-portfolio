<template>
  <div class="pt-20 max-w-6xl mx-auto px-4">
    <div class="mb-6">
      <router-link to="/projects" class="inline-flex items-center gap-2 text-day-primary dark:text-night-primary hover:underline">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ $t('shougangDemo.backToProjects') }}
      </router-link>
    </div>
    
    <h1 class="section-title text-center mb-8">{{ $t('shougangDemo.title') }}</h1>
    
    <!-- Role Selector -->
    <div class="card mb-8">
      <h2 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('shougangDemo.selectRole') }}</h2>
      <div class="flex gap-4">
        <button
          v-for="role in roles"
          :key="role.id"
          @click="switchRole(role.id)"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-colors',
            currentRole === role.id
              ? 'btn-primary'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ role.name }}
        </button>
      </div>
      <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          {{ $t('shougangDemo.currentRole') }}: <strong>{{ currentRoleName }}</strong>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Dynamic Menu -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('shougangDemo.menuPermissions') }}</h2>
        <div class="space-y-2">
          <div
            v-for="menu in visibleMenus"
            :key="menu.id"
            class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-3"
          >
            <span class="text-2xl">{{ menu.icon }}</span>
            <div>
              <h3 class="font-semibold text-day-text dark:text-night-text">{{ menu.name }}</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ menu.path }}</p>
            </div>
          </div>
        </div>
        <div v-if="visibleMenus.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
          {{ $t('shougangDemo.noMenus') }}
        </div>
      </div>

      <!-- Button Permissions -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('shougangDemo.buttonPermissions') }}</h2>
        <div class="space-y-3">
          <div
            v-for="btn in buttons"
            :key="btn.id"
            class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-day-text dark:text-night-text">{{ btn.name }}</span>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs',
                  hasButtonPermission(btn.permission)
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                ]"
              >
                {{ hasButtonPermission(btn.permission) ? $t('shougangDemo.allowed') : $t('shougangDemo.denied') }}
              </span>
            </div>
            <button
              :disabled="!hasButtonPermission(btn.permission)"
              :class="[
                'w-full py-2 rounded text-sm transition-colors',
                hasButtonPermission(btn.permission)
                  ? 'btn-primary'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              ]"
            >
              {{ btn.action }}
            </button>
          </div>
        </div>
      </div>

      <!-- Data Permissions -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('shougangDemo.dataPermissions') }}</h2>
        <div class="space-y-3">
          <div
            v-for="item in dataItems"
            :key="item.id"
            class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-day-text dark:text-night-text">{{ item.name }}</span>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs',
                  hasDataPermission(item.department)
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                ]"
              >
                {{ hasDataPermission(item.department) ? $t('shougangDemo.visible') : $t('shougangDemo.hidden') }}
              </span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ item.department }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dynamic Routes Info -->
    <div class="card mt-8">
      <h2 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">{{ $t('shougangDemo.dynamicRoutes') }}</h2>
      <div class="space-y-2">
        <div
          v-for="route in visibleRoutes"
          :key="route.path"
          class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-3"
        >
          <span class="font-mono text-sm bg-day-primary/10 dark:bg-night-primary/10 px-2 py-1 rounded text-day-primary dark:text-night-primary">
            {{ route.path }}
          </span>
          <span class="text-day-text dark:text-night-text">{{ route.name }}</span>
        </div>
      </div>
      <div v-if="visibleRoutes.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
        {{ $t('shougangDemo.noRoutes') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Role {
  id: string
  name: string
  permissions: string[]
  menuIds: string[]
  dataDepartments: string[]
}

interface Menu {
  id: string
  name: string
  path: string
  icon: string
  requiredPermission: string
}

interface Button {
  id: string
  name: string
  permission: string
  action: string
}

interface DataItem {
  id: string
  name: string
  department: string
}

interface Route {
  path: string
  name: string
  requiredPermission: string
}

const roles: Role[] = [
  {
    id: 'admin',
    name: '管理员',
    permissions: ['*'],
    menuIds: ['*'],
    dataDepartments: ['*']
  },
  {
    id: 'manager',
    name: '经理',
    permissions: ['view', 'create', 'update'],
    menuIds: ['dashboard', 'equipment', 'users'],
    dataDepartments: ['engineering', 'maintenance']
  },
  {
    id: 'operator',
    name: '操作员',
    permissions: ['view'],
    menuIds: ['dashboard', 'equipment'],
    dataDepartments: ['maintenance']
  }
]

const menus: Menu[] = [
  { id: 'dashboard', name: '仪表盘', path: '/dashboard', icon: '📊', requiredPermission: 'view' },
  { id: 'equipment', name: '设备管理', path: '/equipment', icon: '⚙️', requiredPermission: 'view' },
  { id: 'users', name: '用户管理', path: '/users', icon: '👥', requiredPermission: 'user:manage' },
  { id: 'settings', name: '系统设置', path: '/settings', icon: '🔧', requiredPermission: 'system:config' },
  { id: 'reports', name: '报表中心', path: '/reports', icon: '📈', requiredPermission: 'report:view' }
]

const buttons: Button[] = [
  { id: 'add', name: '添加设备', permission: 'create', action: '添加' },
  { id: 'edit', name: '编辑设备', permission: 'update', action: '编辑' },
  { id: 'delete', name: '删除设备', permission: 'delete', action: '删除' },
  { id: 'export', name: '导出数据', permission: 'export', action: '导出' }
]

const dataItems: DataItem[] = [
  { id: '1', name: '工程部数据', department: 'engineering' },
  { id: '2', name: '维护部数据', department: 'maintenance' },
  { id: '3', name: '财务部数据', department: 'finance' },
  { id: '4', name: '人事部数据', department: 'hr' }
]

const routes: Route[] = [
  { path: '/dashboard', name: '仪表盘', requiredPermission: 'view' },
  { path: '/equipment', name: '设备管理', requiredPermission: 'view' },
  { path: '/equipment/create', name: '添加设备', requiredPermission: 'create' },
  { path: '/users', name: '用户管理', requiredPermission: 'user:manage' },
  { path: '/settings', name: '系统设置', requiredPermission: 'system:config' }
]

const currentRole = ref('admin')

const currentRoleName = computed(() => {
  return roles.find(r => r.id === currentRole.value)?.name || ''
})

const visibleMenus = computed(() => {
  const role = roles.find(r => r.id === currentRole.value)
  if (!role) return []
  
  if (role.menuIds.includes('*')) return menus
  
  return menus.filter(menu => role.menuIds.includes(menu.id))
})

const visibleRoutes = computed(() => {
  const role = roles.find(r => r.id === currentRole.value)
  if (!role) return []
  
  if (role.permissions.includes('*')) return routes
  
  return routes.filter(route => 
    role.permissions.some(perm => {
      if (perm === '*') return true
      if (perm === 'view' && route.requiredPermission === 'view') return true
      if (perm === 'create' && route.requiredPermission === 'create') return true
      return false
    })
  )
})

const hasButtonPermission = (permission: string): boolean => {
  const role = roles.find(r => r.id === currentRole.value)
  if (!role) return false
  
  if (role.permissions.includes('*')) return true
  return role.permissions.includes(permission)
}

const hasDataPermission = (department: string): boolean => {
  const role = roles.find(r => r.id === currentRole.value)
  if (!role) return false
  
  if (role.dataDepartments.includes('*')) return true
  return role.dataDepartments.includes(department)
}

const switchRole = (roleId: string) => {
  currentRole.value = roleId
}
</script>
