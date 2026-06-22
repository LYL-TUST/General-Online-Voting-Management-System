<template>
  <div class="page-grid rank-page">
    <section class="page-card rank-hero">
      <div class="section-title rank-hero__head">
        <div>
          <h2>投票结果排行</h2>
          <p class="muted">左边看事件列表，右边看可视化与榜单。</p>
        </div>
        <el-tag v-if="currentId" type="info" effect="light">当前 ID：{{ currentId }}</el-tag>
      </div>
      <div class="toolbar rank-hero__toolbar">
        <el-input v-model.trim="voteId" placeholder="请输入投票 ID" class="rank-search" />
        <el-button type="primary" :loading="loading" @click="loadVote">加载结果</el-button>
      </div>
    </section>

    <section class="page-card rank-layout">
      <aside class="rank-sidebar">
        <div class="section-title rank-sidebar__head">
          <div>
            <h2>投票事件列表</h2>
            <p class="muted">新建、删除或修改的投票会自动同步到这里。</p>
          </div>
          <el-button size="small" plain :loading="refreshing" @click="refreshEvents">刷新事件列表</el-button>
        </div>

        <div class="event-summary">
          <div class="event-summary__item">
            <span class="event-summary__label">事件总数</span>
            <strong>{{ eventItems.length }}</strong>
          </div>
          <div class="event-summary__item">
            <span class="event-summary__label">当前选中</span>
            <strong>{{ activeEventTitle }}</strong>
          </div>
        </div>

        <div v-if="eventItems.length" class="event-list event-list--stack">
          <button
            v-for="item in eventItems"
            :key="item.id"
            class="event-item"
            :class="{ 'is-active': currentId === item.id }"
            @click="selectVote(item.id)"
          >
            <div class="event-item__top">
              <span class="event-item__title">{{ item.title }}</span>
              <el-tag size="small" :type="currentId === item.id ? 'primary' : 'info'" effect="light">{{ item.state }}</el-tag>
            </div>
            <div class="event-item__meta">ID：{{ item.id }}</div>
            <div class="event-item__footer">
              <span>{{ item.optionCount }} 个选项</span>
              <span>{{ item.participants }} 人参与</span>
            </div>
          </button>
        </div>
        <EmptyState v-else title="暂无投票事件" description="先到发起投票页面创建几个投票，再回到这里查看可视化结果。" />
      </aside>

      <main class="rank-content">
        <EmptyState v-if="!vote" title="暂无排行数据" description="点击左侧事件列表，或输入投票 ID 加载对应投票数据。" />

        <template v-else>
          <VoteRankChart :vote="vote" :active-option-id="activeEventId" />
          <VoteRankList :vote="vote" />
        </template>
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import http from '../api/http';
import EmptyState from '../components/EmptyState.vue';
import VoteRankChart from '../components/VoteRankChart.vue';
import VoteRankList from '../components/VoteRankList.vue';
import { useAppStore } from '../store/app';

const store = useAppStore();
const voteId = ref('');
const loading = ref(false);
const refreshing = ref(false);
const vote = ref(null);
const currentId = computed(() => voteId.value.trim());
const activeEventId = ref(null);

const normalizeVote = (source) => {
  const options = Array.isArray(source?.options) ? source.options.map((item, index) => ({
    id: item.id ?? index + 1,
    label: item.label ?? item.time ?? `选项 ${index + 1}`,
    time: item.time ?? item.label ?? `选项 ${index + 1}`,
    votes: Number(item.votes || 0)
  })) : [];
  return {
    ...source,
    options,
    participants: source?.participants ?? options.reduce((sum, item) => sum + item.votes, 0)
  };
};

const eventItems = computed(() => store.createdVotes.map((item) => ({
  id: item.id,
  title: item.title || item.topic || '未命名投票',
  state: item.participants ? '有投票' : '待开始',
  optionCount: Array.isArray(item.options) ? item.options.length : 0,
  participants: item.participants ?? 0
})));

const activeEventTitle = computed(() => eventItems.value.find((item) => item.id === currentId.value)?.title || '未选择');

const selectVote = async (id) => {
  voteId.value = id;
  await loadVote();
};

const refreshEvents = async () => {
  refreshing.value = true;
  try {
    vote.value = null;
    await nextTick();
    if (currentId.value) {
      await loadVote();
    }
    ElMessage.success('事件列表已刷新');
  } finally {
    refreshing.value = false;
  }
};

const loadVote = async () => {
  if (!currentId.value) return ElMessage.error('投票 ID 不能为空');
  loading.value = true;
  try {
    const created = store.createdVotes.find((item) => item.id === currentId.value);
    if (created) {
      vote.value = normalizeVote(created);
      activeEventId.value = vote.value.options[0]?.id || null;
      return;
    }
    const { data } = await http.get(`/votes/${currentId.value}`);
    vote.value = normalizeVote(data.data);
    activeEventId.value = vote.value.options[0]?.id || null;
  } catch {
    const created = store.createdVotes.find((item) => item.id === currentId.value);
    if (created) {
      vote.value = normalizeVote(created);
      activeEventId.value = vote.value.options[0]?.id || null;
      ElMessage.warning('接口暂未返回该投票，已切换为本地创建的数据');
    }
  } finally {
    loading.value = false;
    await nextTick();
    window.dispatchEvent(new Event('resize'));
  }
};

watch(vote, (val) => {
  if (val?.options?.length && activeEventId.value == null) {
    activeEventId.value = val.options[0].id;
  }
});
</script>

<style scoped>
.rank-page {
  display: grid;
  gap: 18px;
}

.rank-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.rank-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.rank-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.rank-hero,
.event-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.rank-hero__head,
.rank-sidebar__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.rank-hero__toolbar {
  margin-top: 10px;
}

.rank-search {
  max-width: 320px;
}

.event-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.event-summary__item {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 1));
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.event-summary__label {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
}

.event-summary strong {
  font-size: 16px;
  color: #0f172a;
}

.event-list--stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.94));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  transition: all 0.22s ease;
  cursor: pointer;
}

.event-item:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.28);
}

.event-item.is-active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(168, 85, 247, 0.14), rgba(255, 255, 255, 1));
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.14);
}

.event-item__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.event-item__title {
  font-weight: 700;
  color: #0f172a;
}

.event-item__meta,
.event-item__footer {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.event-item__footer {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 1024px) {
  .rank-layout {
    grid-template-columns: 1fr;
  }
}
</style>
