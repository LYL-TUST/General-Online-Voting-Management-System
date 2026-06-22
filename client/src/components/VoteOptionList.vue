<template>
  <section class="page-card">
    <div class="section-title">
      <h2>投票选项</h2>
      <span class="muted">{{ votingId ? '可重复投票' : '请选择投票' }}</span>
    </div>
    <div class="page-grid">
      <el-card v-for="item in sortedOptions" :key="item.id" shadow="never">
        <div class="detail-header">
          <div>
            <h3>{{ item.label || item.time }}</h3>
            <div class="muted">票数：{{ item.votes }}</div>
          </div>
          <el-button type="primary" @click="$emit('vote', item.id)">
            👍 投票
          </el-button>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  vote: Object,
  votedIds: { type: Array, default: () => [] },
  votingId: String
});

defineEmits(['vote']);

const sortedOptions = computed(() => {
  if (!props.vote) return [];
  return [...props.vote.options].sort((a, b) => (b.votes - a.votes) || (a.id - b.id));
});
</script>
