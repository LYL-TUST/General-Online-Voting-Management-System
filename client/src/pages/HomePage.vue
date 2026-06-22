<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title"><h2>系统概览</h2></div>
      <div class="rank-grid">
        <el-card shadow="never"><div class="muted">创建记录</div><div style="font-size:28px;font-weight:700;">{{ store.createdVotes.length }}</div></el-card>
        <el-card shadow="never"><div class="muted">投票记录</div><div style="font-size:28px;font-weight:700;">{{ store.voteRecords.length }}</div></el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAppStore } from '../store/app';
const store = useAppStore();
</script>
