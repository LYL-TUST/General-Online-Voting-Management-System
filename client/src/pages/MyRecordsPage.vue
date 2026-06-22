<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title"><h2>我的投票记录</h2></div>
      <EmptyState v-if="!store.voteRecords.length" title="暂无投票记录" description="先参与一次投票，就会显示记录。" />
      <el-table v-else :data="store.voteRecords" border style="width: 100%">
        <el-table-column prop="votedAt" label="投票时间" width="220" />
        <el-table-column prop="topic" label="会议主题" />
        <el-table-column prop="voteId" label="投票ID" width="180" />
        <el-table-column prop="optionText" label="投票选项" />
      </el-table>
    </section>
  </div>
</template>

<script setup>
import EmptyState from '../components/EmptyState.vue';
import { useAppStore } from '../store/app';
const store = useAppStore();
</script>
