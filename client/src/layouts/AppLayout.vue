<template>
  <div class="app-shell">
    <LoadingMask :loading="store.loading" />
    <aside class="sidebar" :class="{ 'is-collapsed': store.sidebarCollapsed }">
      <div class="sidebar__brand">
        <h1 v-if="!store.sidebarCollapsed">会议投票系统</h1>
        <p v-if="!store.sidebarCollapsed">Vue3 + Vite + Pinia + Router + Element Plus</p>
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
          >
            <span v-if="!store.sidebarCollapsed" class="sidebar__label">{{ item.label }}</span>
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
          >
            <span v-if="!store.sidebarCollapsed" class="sidebar__label">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
      <div class="sidebar__footer">
        <el-button size="small" @click="store.toggleSidebar()">{{ store.sidebarCollapsed ? '展开' : '收起' }}</el-button>
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

      <footer class="main__footer">© 2026 会议投票系统</footer>
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
  { name: 'create', path: '/create', label: '发起投票' },
  { name: 'join', path: '/join', label: '参与投票' },
  { name: 'rank', path: '/rank', label: '投票结果排行' }
];
const extraMenus = [
  { name: 'my-created', path: '/my-created', label: '我创建的投票' },
  { name: 'my-records', path: '/my-records', label: '我的投票记录' },
  { name: 'guide', path: '/guide', label: '使用说明' }
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
  return map[route.name] || '会议投票系统';
});

const shareText = computed(() => (typeof window !== 'undefined' && (route.name === 'join' || route.name === 'rank') ? window.location.href : ''));
</script>
