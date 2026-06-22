<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title">
        <h2>我创建的投票</h2>
      </div>
      <el-table v-if="store.createdVotes.length" :data="store.createdVotes" border style="width: 100%">
        <el-table-column prop="id" label="投票ID" width="180" />
        <el-table-column prop="topic" label="会议主题" />
        <el-table-column prop="createdAt" label="创建时间" width="210" />
        <el-table-column prop="participants" label="总参与人数" width="120" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <div class="cell-actions">
              <el-button type="primary" plain size="small" @click="viewDetail(row.id)">查看详情</el-button>
              <el-button type="danger" plain size="small" @click="remove(row.id)">删除投票</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <EmptyState v-else title="暂无创建记录" description="你还没有创建任何投票。" />
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import { useAppStore } from '../store/app';

const store = useAppStore();
const router = useRouter();
const viewDetail = (id) => router.push(`/vote/${id}`);
const remove = (id) => store.removeCreatedVote(id);
</script>
