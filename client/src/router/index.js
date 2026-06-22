import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../layouts/AppLayout.vue';
import HomePage from '../pages/HomePage.vue';
import CreateVotePage from '../pages/CreateVotePage.vue';
import JoinVotePage from '../pages/JoinVotePage.vue';
import RankPage from '../pages/RankPage.vue';
import MyCreatedPage from '../pages/MyCreatedPage.vue';
import MyRecordsPage from '../pages/MyRecordsPage.vue';
import GuidePage from '../pages/GuidePage.vue';
import NotFoundPage from '../pages/NotFoundPage.vue';
import { useAppStore } from '../store/app';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'home', component: HomePage },
        { path: 'create', name: 'create', component: CreateVotePage },
        { path: 'join', name: 'join', component: JoinVotePage },
        { path: 'rank', name: 'rank', component: RankPage },
        { path: 'my-created', name: 'my-created', component: MyCreatedPage },
        { path: 'my-records', name: 'my-records', component: MyRecordsPage },
        { path: 'guide', name: 'guide', component: GuidePage },
        { path: 'vote/:id', name: 'vote-detail', component: JoinVotePage, props: true }
      ]
    },
    { path: '/404', name: '404', component: NotFoundPage },
    { path: '/:pathMatch(.*)*', redirect: '/404' }
  ]
});

router.beforeEach((to) => {
  const store = useAppStore();
  if (to.path.startsWith('/vote/')) {
    const id = String(to.params.id || '').trim();
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) return '/404';
  }
  store.setLoading(true);
});

router.afterEach(() => {
  const store = useAppStore();
  store.setLoading(false);
});

export default router;
