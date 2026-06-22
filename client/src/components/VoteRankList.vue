<template>
  <section class="page-card">
    <div class="section-title">
      <div>
        <h2>榜单列表</h2>
        <p class="muted">{{ listHint }}</p>
      </div>
      <el-tag v-if="vote?.voteType === 'text-multi'" type="warning" effect="light">可选多个</el-tag>
    </div>
    <el-table :data="sortedOptions" border style="width: 100%">
      <el-table-column type="index" label="#" width="80" />
      <el-table-column prop="label" label="候选项" />
      <el-table-column prop="votes" label="票数" width="120" />
    </el-table>
  </section>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ vote: Object });
const listHint = computed(() => {
  const type = props.vote?.voteType || 'text-single';
  return {
    time: '时间类投票按候选时段直接排行，越靠前代表越适合当前安排。',
    'text-single': '单选场景直接按得票排序，方便一眼判断最终首选。',
    'text-multi': '多选场景会保留前排热度，查看前几名更有参考价值。'
  }[type];
});
const sortedOptions = computed(() => {
  if (!props.vote) return [];
  return [...(props.vote.options || [])].sort((a, b) => (b.votes - a.votes) || (a.id - b.id));
});
</script>
