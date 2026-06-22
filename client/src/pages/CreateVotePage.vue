<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title">
        <h2>发起投票</h2>
        <el-button type="primary" plain @click="showExample">查看示例</el-button>
      </div>
      <VoteCreateForm @submit="handleSubmit" />
    </section>

    <el-dialog v-model="dialogVisible" title="投票创建成功" width="520px">
      <div class="page-grid">
        <el-alert type="success" :title="successText" show-icon :closable="false" />
        <CopyInput :model-value="createdVoteId" />
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goDetail">前往详情</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import VoteCreateForm from '../components/VoteCreateForm.vue';
import CopyInput from '../components/CopyInput.vue';
import http from '../api/http';
import { useAppStore } from '../store/app';

const store = useAppStore();
const router = useRouter();
const dialogVisible = ref(false);
const createdVoteId = ref('');
const successText = ref('');

const handleSubmit = async (form) => {
  if (!form.topic?.trim()) return ElMessage.error('会议主题不能为空');
  if (form.options.some((item) => !item.trim())) return ElMessage.error('3个候选时间都必须填写');
  const { data } = await http.post('/votes', form);
  createdVoteId.value = data.voteId;
  successText.value = `投票创建成功，ID：${data.voteId}`;
  store.addCreatedVote({ id: data.voteId, topic: form.topic, options: form.options, createdAt: new Date().toISOString(), participants: 0 });
  dialogVisible.value = true;
};

const goDetail = () => router.push(`/vote/${createdVoteId.value}`);
const showExample = () => ElMessage.info('请输入会议主题与3个候选时间后提交。');
</script>
