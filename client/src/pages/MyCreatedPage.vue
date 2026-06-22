<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title">
        <h2 class="page-title">投票事件列表</h2>
      </div>

      <div v-if="store.createdVotes.length" class="vote-event-list">
        <article v-for="row in store.createdVotes" :key="row.id" class="vote-event-card" @mouseenter="syncRow(row)">
          <header class="vote-event-card__header">
            <div class="vote-event-card__title-wrap">
              <h3 class="vote-event-card__title">{{ row.topic }}</h3>
              <span class="id-tag" @click="copyText(row.id)">投票ID：{{ row.id }} <span class="id-tag__icon">⧉</span></span>
            </div>

            <div class="vote-event-card__actions">
              <el-button link type="primary" size="small" @click="viewDetail(row.id)">查看详情</el-button>
              <el-button link type="info" size="small" @click="copyText(row.id)">复制ID</el-button>
              <el-button link type="danger" size="small" @click="remove(row.id)">删除</el-button>
            </div>
          </header>

          <div class="vote-event-card__body">
            <div class="vote-event-card__left">
              <p><span class="meta-icon">🗓️</span><span class="meta-label">创建时间：</span>{{ formatTime(row.createdAt) }}</p>
              <p><span class="meta-icon">👥</span><span class="meta-label">总参与人数：</span>{{ row.participants ?? 0 }}</p>
              <p><span class="meta-icon">🗳️</span><span class="meta-label">投票ID：</span>{{ row.id }}</p>
            </div>

            <div class="vote-event-card__right">
              <div class="highlight-box">
                <div class="highlight-box__label">最高票数选项</div>
                <div class="highlight-box__value">{{ topOption(row).time || '暂无' }}</div>
                <div class="highlight-box__sub muted">{{ topOption(row).votes ?? 0 }} 票</div>
              </div>
              <div class="highlight-box highlight-box--soft">
                <div class="highlight-box__label">总票数统计</div>
                <div class="highlight-box__value">{{ totalVotes(row) }}</div>
                <div class="highlight-box__sub muted">所有候选项票数之和</div>
              </div>
            </div>
          </div>

          <footer class="vote-event-card__footer">
            <CopyInput :model-value="shareLink(row.id)" prefix="复制投票链接" button-text="复制链接" />
            <el-button type="primary" plain @click="share(row.id)">分享</el-button>
          </footer>
        </article>
      </div>

      <EmptyState
        v-else
        title="暂无创建的投票，去发起投票创建第一个"
        description="创建后会自动出现在这里，支持查看详情、复制 ID 和删除。"
        icon="📭"
      >
        <template #default>
          <el-button type="primary" @click="router.push('/create')">去发起投票</el-button>
        </template>
      </EmptyState>
    </section>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import CopyInput from '../components/CopyInput.vue';
import { useAppStore } from '../store/app';

const store = useAppStore();
const router = useRouter();

const formatTime = (value) => {
  if (!value) return '暂无时间';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('zh-CN');
};

const topOption = (row) => {
  const options = [...(row.options || [])].sort((a, b) => (b.votes - a.votes) || (a.id - b.id));
  return options[0] || {};
};

const totalVotes = (row) => (row.options || []).reduce((sum, item) => sum + (item.votes || 0), 0);
const syncRow = (row) => store.syncCreatedVote(row);
const viewDetail = (id) => router.push(`/vote/${id}`);
const remove = (id) => store.removeCreatedVote(id);
const shareLink = (id) => `${window.location.origin}/vote/${id}`;
const copyText = async (text) => {
  await navigator.clipboard.writeText(text);
  ElMessage.success('已复制');
};
const share = async (id) => {
  const text = shareLink(id);
  if (navigator.share) {
    try {
      await navigator.share({ title: '会议投票', text, url: text });
      return;
    } catch {
      // ignore
    }
  }
  await copyText(text);
};
</script>
