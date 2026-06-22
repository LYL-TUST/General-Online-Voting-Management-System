<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title">
        <h2>投票结果排行</h2>
        <el-tag v-if="currentId" type="info">{{ currentId }}</el-tag>
      </div>
      <div class="toolbar">
        <el-input v-model.trim="voteId" placeholder="请输入投票 ID" style="max-width: 320px" />
        <el-button type="primary" :loading="loading" @click="loadVote">加载结果</el-button>
      </div>
      <p class="muted">下面的事件列表可点击切换可视化结果。</p>
    </section>

    <section class="page-card">
      <div class="section-title"><h2>投票事件列表</h2></div>
      <div v-if="eventItems.length" class="event-list">
        <el-button
          v-for="item in eventItems"
          :key="item.id"
          :type="currentId === item.id ? 'primary' : 'default'"
          plain
          @click="selectVote(item.id)"
        >
          {{ item.label }}
        </el-button>
      </div>
      <EmptyState v-else title="暂无投票事件" description="先到发起投票页面创建几个投票，再回到这里查看可视化结果。" />
    </section>

    <EmptyState v-if="!vote" title="暂无排行数据" description="点击上方事件列表，或输入投票 ID 加载对应投票数据。" />

    <template v-else>
      <VoteRankChart :vote="vote" :active-option-id="activeEventId" />
      <VoteRankList :vote="vote" />
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import http from '../api/http';
import EmptyState from '../components/EmptyState.vue';
import VoteRankChart from '../components/VoteRankChart.vue';
import VoteRankList from '../components/VoteRankList.vue';
import { useAppStore } from '../store/app';

const store = useAppStore();
const voteId = ref('');
const loading = ref(false);
const vote = ref(null);
const currentId = computed(() => voteId.value.trim());
const activeEventId = ref(null);

const eventItems = computed(() => store.createdVotes.map((item) => ({ id: item.id, label: `${item.topic} · ${item.id}` })));

const selectVote = async (id) => {
  voteId.value = id;
  await loadVote();
};

const loadVote = async () => {
  if (!currentId.value) return ElMessage.error('投票 ID 不能为空');
  loading.value = true;
  try {
    const { data } = await http.get(`/votes/${currentId.value}`);
    vote.value = data.data;
    activeEventId.value = data.data?.options?.[0]?.id || null;
  } finally {
    loading.value = false;
  }
};

watch(vote, (val) => {
  if (val?.options?.length && activeEventId.value == null) {
    activeEventId.value = val.options[0].id;
  }
});
</script>
