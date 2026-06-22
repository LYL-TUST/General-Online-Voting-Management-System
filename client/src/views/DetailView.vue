<template>
  <main class="page">
    <section class="card">
      <div class="section-title">
        <h2>投票详情</h2>
        <RouterLink class="secondary link-btn" to="/">返回首页</RouterLink>
      </div>
      <div class="join-row">
        <input v-model.trim="voteId" type="text" placeholder="请输入投票 ID" />
        <button class="secondary" type="button" @click="loadVote" :disabled="loading">
          {{ loading ? '加载中...' : '加载投票' }}
        </button>
      </div>
      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
    </section>

    <VoteRankList v-if="store.currentVote" :vote="store.currentVote" :voting="voting" :voted="isVoted" @vote="submitVote" />

    <section v-if="voteHistory.length" class="card">
      <div class="section-title">
        <h2>投票历史</h2>
        <span class="badge">共 {{ voteHistory.length }} 次</span>
      </div>
      <div class="record-list">
        <article v-for="item in voteHistory" :key="`${item.voteId}-${item.votedAt}-${item.optionId}`" class="record-item">
          <div>
            <strong>{{ item.topic }}</strong>
            <p>投票 ID：{{ item.voteId }} · 选项：{{ item.optionText || item.optionId }}</p>
          </div>
          <span class="badge muted">{{ formatTime(item.votedAt) }}</span>
        </article>
      </div>
    </section>

    <section v-else class="card empty-panel">
      <h2>暂无投票详情</h2>
      <p>请输入一个有效的投票 ID 来加载详情。</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import VoteRankList from '../components/VoteRankList.vue';
import request from '../utils/api';
import { useVoteStore } from '../store/vote';

const route = useRoute();
const store = useVoteStore();
const voteId = ref(route.params.id || '');
const loading = ref(false);
const voting = ref(false);
const message = ref('');
const messageType = ref('info');

const isVoted = computed(() => false);
const voteHistory = computed(() => store.votedRecords.filter((item) => item.voteId === voteId.value.trim()));

const setMsg = (text, type = 'info') => {
  message.value = text;
  messageType.value = type;
};

const formatTime = (value) => {
  if (!value) return '暂无时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadVote = async () => {
  if (!voteId.value.trim()) return setMsg('投票 ID 不能为空', 'error');
  loading.value = true;
  try {
    const { data } = await request.get(`/votes/${voteId.value.trim()}`);
    store.setCurrentVote(data.data);
    setMsg('投票信息加载成功', 'success');
  } catch (err) {
    store.clearCurrentVote();
    setMsg(err?.response?.data?.message || '加载失败，请检查网络或投票 ID', 'error');
  } finally {
    loading.value = false;
  }
};

const submitVote = async (optionId) => {
  const currentId = voteId.value.trim();
  if (!currentId) return setMsg('请先输入投票 ID', 'error');

  voting.value = true;
  try {
    const { data } = await request.post(`/votes/${currentId}/vote`, { optionId });
    store.setCurrentVote(data.data);
    store.addVotedRecord({
      voteId: currentId,
      topic: data.data.topic,
      optionId,
      optionText: data.data.options.find((item) => item.id === optionId)?.time || '',
      voteSnapshot: data.data
    });
    setMsg('投票成功', 'success');
  } catch (err) {
    setMsg(err?.response?.data?.message || '投票失败，请稍后再试', 'error');
  } finally {
    voting.value = false;
  }
};

onMounted(() => {
  const currentId = voteId.value.trim();
  if (currentId && currentId !== 'demo') loadVote();
  if (currentId === 'demo') setMsg('请先输入真实投票 ID 再加载详情。', 'info');
});
</script>
