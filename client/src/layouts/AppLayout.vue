<template>
  <div class="app-shell">
    <LoadingMask :loading="store.loading" />
    <aside class="sidebar" :class="{ 'is-collapsed': store.sidebarCollapsed }">
      <div class="sidebar__brand">
        <div class="sidebar__brand-row">
          <div class="sidebar__brand-text">
            <h1 v-if="!store.sidebarCollapsed">通用在线投票管理系统</h1>
          </div>
          <button class="sidebar__collapse-btn" :aria-label="store.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'" @click="store.toggleSidebar">
            <span class="sidebar__collapse-icon" :class="{ 'is-collapsed': store.sidebarCollapsed }">❮</span>
          </button>
        </div>
      </div>
      <div class="sidebar__menu">
        <div class="sidebar__group-title">核心功能菜单</div>
        <nav>
          <RouterLink
            v-for="item in coreMenus"
            :key="item.name"
            :to="item.path"
            class="sidebar__item"
            :class="{ 'is-active': route.name === item.name }"
            :title="store.sidebarCollapsed ? item.label : ''"
          >
            <span class="sidebar__icon">{{ item.icon }}</span>
            <span class="sidebar__label">{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="sidebar__group-title">拓展功能菜单</div>
        <nav>
          <RouterLink
            v-for="item in extraMenus"
            :key="item.name"
            :to="item.path"
            class="sidebar__item"
            :class="{ 'is-active': route.name === item.name }"
            :title="store.sidebarCollapsed ? item.label : ''"
          >
            <span class="sidebar__icon">{{ item.icon }}</span>
            <span class="sidebar__label">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </aside>

    <section class="main">
      <header class="main__topbar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="toolbar">
          <el-tag type="info">{{ currentTitle }}</el-tag>
          <CopyInput v-if="shareText" :model-value="shareText" prefix="分享链接" button-text="复制链接" />
        </div>
      </header>

      <main class="main__content">
        <router-view />
      </main>

      <footer class="main__footer">© 2026 通用在线投票管理系统</footer>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAppStore } from '../store/app';
import LoadingMask from '../components/LoadingMask.vue';
import CopyInput from '../components/CopyInput.vue';

const route = useRoute();
const store = useAppStore();

const coreMenus = [
  { name: 'create', path: '/create', label: '发起投票', icon: '📝' },
  { name: 'join', path: '/join', label: '参与投票', icon: '🧑‍🤝‍🧑' },
  { name: 'rank', path: '/rank', label: '投票结果排行', icon: '📊' }
];
const extraMenus = [
  { name: 'my-created', path: '/my-created', label: '我创建的投票', icon: '📁' },
  { name: 'my-records', path: '/my-records', label: '我的投票记录', icon: '🧾' },
  { name: 'guide', path: '/guide', label: '使用说明', icon: 'ℹ️' }
];

const currentTitle = computed(() => {
  const map = {
    home: '首页',
    create: '发起投票',
    join: '参与投票',
    rank: '投票结果排行',
    'my-created': '我创建的投票',
    'my-records': '我的投票记录',
    guide: '使用说明'
  };
  return map[route.name] || '通用在线投票管理系统';
});

const shareText = computed(() => (typeof window !== 'undefined' && (route.name === 'join' || route.name === 'rank') ? window.location.href : ''));
</script>

<style scoped>
.sidebar__brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sidebar__collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.sidebar__collapse-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.3);
}

.sidebar__collapse-icon {
  color: #fff;
  font-size: 14px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.sidebar__collapse-icon.is-collapsed {
  transform: rotate(180deg);
}
</style>
