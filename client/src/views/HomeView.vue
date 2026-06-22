<template>
  <main class="page">
    <section class="hero card">
      <div class="hero-copy">
        <span class="eyebrow">会议投票系统</span>
        <h1>一个页面拆成组件、路由和状态管理</h1>
        <p>支持创建投票、加载投票、参与投票和结果排行，并通过本地持久化保留当前状态。</p>
      </div>
      <div class="hero-stats">
        <div>
          <strong>{{ store.createdVotes.length }}</strong>
          <span>创建记录</span>
        </div>
        <div>
          <strong>{{ store.votedRecords.length }}</strong>
          <span>已投票记录</span>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>快速入口</h2>
      </div>
      <div class="actions">
        <RouterLink class="primary link-btn" to="/create">去创建投票</RouterLink>
        <RouterLink
          v-if="store.createdVotes.length"
          class="secondary link-btn"
          :to="`/vote/${store.createdVotes[0].id}`"
        >
          查看最近创建的投票
        </RouterLink>
        <span v-else class="secondary link-btn is-disabled">暂无可查看的投票</span>
      </div>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>创建记录列表</h2>
      </div>
      <div v-if="recentCreatedVotes.length" class="record-list">
        <article v-for="item in recentCreatedVotes" :key="item.id" class="record-item">
          <div>
            <strong>{{ item.topic }}</strong>
            <p>投票 ID：{{ item.id }}</p>
            <p>创建时间：{{ formatTime(item.createdAt) }}</p>
          </div>
          <RouterLink class="secondary link-btn small" :to="`/vote/${item.id}`">查看详情</RouterLink>
        </article>
      </div>
      <p v-else class="empty-state">暂无创建记录，先去发起一个投票吧。</p>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>已投票记录列表</h2>
      </div>
      <div v-if="recentVotedRecords.length" class="record-list">
        <article v-for="item in recentVotedRecords" :key="`${item.voteId}-${item.votedAt}`" class="record-item">
          <div>
            <strong>{{ item.topic }}</strong>
            <p>投票 ID：{{ item.voteId }} · 选项：{{ item.optionText || item.optionId }}</p>
            <p>投票时间：{{ formatTime(item.votedAt) }}</p>
          </div>
          <span class="badge muted">{{ formatTime(item.votedAt) }}</span>
        </article>
      </div>
      <p v-else class="empty-state">暂无投票记录，加载一个投票并参与一次即可看到记录。</p>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useVoteStore } from '../store/vote';

const store = useVoteStore();
const recentCreatedVotes = computed(() => store.createdVotes.slice(0, 5));
const recentVotedRecords = computed(() => store.votedRecords.slice(0, 5));

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
</script>
