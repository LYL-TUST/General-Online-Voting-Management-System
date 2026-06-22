<template>
  <div class="app-shell" :class="{ 'is-home': isHomePage }">
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
            v-for="item in menus"
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
      <header class="main__topbar" :class="{ 'is-home': isHomePage, 'is-scrolled': isScrolled }">
        <div class="topbar__left">
          <div class="topbar__brand">
            <span class="topbar__logo">V</span>
            <div>
              <strong>通用在线投票管理系统</strong>
              <p>Smart Voting SaaS</p>
            </div>
          </div>
          <el-breadcrumb separator="/" class="topbar__breadcrumb">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <nav v-if="isHomePage" class="topbar__nav">
          <RouterLink v-for="item in quickLinks" :key="item.name" :to="item.path" class="topbar__link">{{ item.label }}</RouterLink>
        </nav>

        <div class="toolbar">
          <el-tag v-if="!isHomePage" type="info">{{ currentTitle }}</el-tag>
          <el-button v-if="isHomePage" type="primary" @click="router.push({ name: 'create' })">快速发起投票</el-button>
          <el-button v-if="isHomePage" @click="router.push({ name: 'my-created' })">我的投票</el-button>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../store/app';
import LoadingMask from '../components/LoadingMask.vue';
import CopyInput from '../components/CopyInput.vue';

const route = useRoute();
const router = useRouter();
const store = useAppStore();
const isScrolled = ref(false);

const menus = [
  { name: 'home', path: '/', label: '首页', icon: '🏠' },
  { name: 'create', path: '/create', label: '发起投票', icon: '📝' },
  { name: 'join', path: '/join', label: '参与投票', icon: '🧑‍🤝‍🧑' },
  { name: 'rank', path: '/rank', label: '投票结果排行', icon: '📊' }
];
const extraMenus = [
  { name: 'my-created', path: '/my-created', label: '我创建的投票', icon: '📁' },
  { name: 'my-records', path: '/my-records', label: '我的投票记录', icon: '🧾' },
  { name: 'guide', path: '/guide', label: '使用说明', icon: 'ℹ️' }
];
const quickLinks = [
  { name: 'create', path: '/create', label: '快速发起投票' },
  { name: 'my-created', path: '/my-created', label: '我的投票' },
  { name: 'guide', path: '/guide', label: '使用说明' }
];

const isHomePage = computed(() => route.name === 'home');

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

const handleScroll = () => {
  isScrolled.value = window.scrollY > 12;
};

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

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

.main__topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(248, 251, 255, 0.72);
  backdrop-filter: blur(18px);
  transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.main__topbar.is-home {
  background: rgba(255, 255, 255, 0.38);
  border-bottom-color: transparent;
}

.main__topbar.is-scrolled {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar__logo {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #4096ff, #7ab8ff);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(64, 150, 255, 0.24);
}

.topbar__brand strong {
  display: block;
  color: #0f172a;
}

.topbar__brand p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

.topbar__nav {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.topbar__link {
  color: #475569;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.topbar__link:hover {
  color: #4096ff;
}

.topbar__breadcrumb {
  margin-left: 6px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
