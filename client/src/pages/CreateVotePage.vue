<template>
  <div class="page-grid create-vote-page">
    <section class="page-card page-hero">
      <div class="section-title hero-head">
        <div>
          <span class="eyebrow">通用在线投票管理系统</span>
          <h2>发起投票</h2>
          <p>支持时间类投票、文本选项单选与多选预留，统一管理所有投票场景。</p>
        </div>
      </div>
      <VoteCreateForm ref="formRef" @submit="handleSubmit" />
    </section>

    <el-dialog v-model="dialogVisible" title="投票创建成功" width="720px" class="success-dialog-wrap">
      <div class="success-dialog">
        <div class="success-banner">
          <div>
            <div class="success-title">投票已创建</div>
            <div class="success-subtitle">投票ID、标题、选项、截止时间与规则已同步到「我创建的投票」</div>
          </div>
          <el-tag type="success" effect="light">创建成功</el-tag>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="投票ID">{{ createdVoteId }}</el-descriptions-item>
          <el-descriptions-item label="投票类型">{{ createdVote.voteTypeText }}</el-descriptions-item>
          <el-descriptions-item label="投票标题" :span="2">{{ createdVote.title }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ createdVote.deadlineAt || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="重复投票限制">{{ createdVote.participationRuleText }}</el-descriptions-item>
        </el-descriptions>

        <el-card shadow="never" class="slot-summary">
          <template #header>
            <div class="summary-head">投票选项列表</div>
          </template>
          <div v-for="option in createdVote.options" :key="option.id" class="created-slot">
            <div class="created-slot-time">{{ option.label }}</div>
            <div class="created-slot-note">{{ option.note || '暂无备注' }}</div>
          </div>
        </el-card>
      </div>
      <template #footer>
        <div class="dialog-actions">
          <div class="dialog-actions-left">
            <el-button @click="copyVoteId">复制投票ID</el-button>
            <el-button @click="copyShareLink">复制分享链接</el-button>
          </div>
          <div class="dialog-actions-right">
            <el-button @click="dialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="goDetail">跳转投票详情页面</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import VoteCreateForm from '../components/VoteCreateForm.vue';
import http from '../api/http';
import { useAppStore } from '../store/app';

const store = useAppStore();
const router = useRouter();
const formRef = ref();
const dialogVisible = ref(false);
const createdVoteId = ref('');
const successText = ref('');
const createdVote = reactive({ title: '', deadlineAt: '', participationRuleText: '', voteTypeText: '', options: [] });

const copyVoteId = async () => {
  await navigator.clipboard.writeText(createdVoteId.value);
  ElMessage.success('投票ID已复制');
};

const copyShareLink = async () => {
  await navigator.clipboard.writeText(`${window.location.origin}/vote/${createdVoteId.value}`);
  ElMessage.success('分享链接已复制');
};

const handleSubmit = async (form) => {
  const payload = {
    topic: form.title,
    options: form.options.map((item) => item.label || item.timeValue || '').map((item) => String(item).trim()).filter(Boolean)
  };

  if (payload.options.length !== form.options.length) {
    ElMessage.warning(`请先填完 ${form.options.length} 个投票选项后再提交`);
    return;
  }

  if (payload.options.length < 3) {
    ElMessage.warning('至少需要 3 个有效选项才能创建投票');
    return;
  }

  try {
    if (form.deadlineAt) {
      await ElMessageBox.confirm('你设置了投票截止时间，提交后将进入自动关闭规则，是否继续？', '二次确认', {
        confirmButtonText: '继续提交',
        cancelButtonText: '取消',
        type: 'warning'
      });
    }

    const { data } = await http.post('/votes', payload);
    createdVoteId.value = data.voteId;
    successText.value = `投票创建成功，ID：${data.voteId}`;
    createdVote.title = form.title;
    createdVote.deadlineAt = form.deadlineAt;
    createdVote.participationRuleText = form.participationRule === 'once' ? '每人仅可投一次' : '允许重复投票';
    createdVote.voteTypeText = {
      time: '时间类投票',
      'text-single': '文本选项单选',
      'text-multi': '文本选项多选'
    }[form.voteType] || '文本选项单选';
    createdVote.options = form.options.map((item, index) => ({
      id: index + 1,
      label: (item.label || item.timeValue || '').trim(),
      time: (item.label || item.timeValue || '').trim(),
      note: item.note
    }));
    store.addCreatedVote({
      id: data.voteId,
      title: form.title,
      description: form.description,
      deadlineAt: form.deadlineAt,
      participationRule: form.participationRule,
      voteType: form.voteType,
      options: createdVote.options,
      createdAt: new Date().toISOString(),
      participants: 0
    });
    dialogVisible.value = true;
  } catch (error) {
    if (error === 'cancel' || error === 'close') return;
  }
};

const goDetail = () => router.push(`/vote/${createdVoteId.value}`);
</script>

<style scoped>
.create-vote-page {
  position: relative;
}

.page-hero {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.dialog-actions-left {
  display: flex;
  gap: 12px;
}

.hero-head h2 {
  margin-top: 8px;
  margin-bottom: 8px;
}

.hero-head p,
.eyebrow {
  color: #64748b;
}

.eyebrow {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.success-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.success-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.08));
}

.success-title {
  font-size: 18px;
  font-weight: 700;
}

.success-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.slot-summary {
  border-radius: 16px;
}

.summary-head {
  font-weight: 600;
}

.created-slot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.created-slot:last-child {
  border-bottom: 0;
}

.created-slot-time {
  font-weight: 600;
}

.created-slot-note {
  color: #64748b;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.dialog-actions-right {
  display: flex;
  gap: 12px;
}

:global(.success-dialog-wrap .el-dialog__body) {
  padding-top: 8px;
}
</style>
