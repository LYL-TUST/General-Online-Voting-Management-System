<template>
  <section class="page-card">
    <div class="section-title">
      <h2>榜单列表</h2>
    </div>
    <el-table :data="sortedOptions" border style="width: 100%">
      <el-table-column type="index" label="#" width="80" />
      <el-table-column prop="time" label="候选时间" />
      <el-table-column prop="votes" label="票数" width="120" />
    </el-table>
  </section>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ vote: Object });
const sortedOptions = computed(() => {
  if (!props.vote) return [];
  return [...props.vote.options].sort((a, b) => (b.votes - a.votes) || (a.id - b.id));
});
</script>
