<template>
  <main class="page">
    <VoteCreateForm :loading="loading" @submit="createVote">
      <template #extra>
        <RouterLink class="secondary link-btn" to="/">返回首页</RouterLink>
      </template>
    </VoteCreateForm>

    <section v-if="message" class="card">
      <p class="message" :class="messageType">{{ message }}</p>
      <p v-if="createdId" class="subtext">创建成功，投票 ID：{{ createdId }}</p>
      <RouterLink v-if="createdId" class="primary link-btn" :to="`/vote/${createdId}`">前往详情页</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import VoteCreateForm from '../components/VoteCreateForm.vue';
import request from '../utils/api';
import { useVoteStore } from '../store/vote';

const store = useVoteStore();
const router = useRouter();
const loading = ref(false);
const message = ref('');
const messageType = ref('info');
const createdId = ref('');

const createVote = async (form) => {
  if (!form.topic?.trim()) return (message.value = '会议主题不能为空', messageType.value = 'error');
  if (form.options.some((item) => !item.trim())) return (message.value = '3个候选时间都必须填写', messageType.value = 'error');

  loading.value = true;
  try {
    const { data } = await request.post('/votes', form);
    createdId.value = data.voteId;
    message.value = `创建成功，投票 ID：${data.voteId}`;
    messageType.value = 'success';
    store.addCreatedVote({ id: data.voteId, topic: form.topic, options: form.options });
    router.push(`/vote/${data.voteId}`);
  } catch (err) {
    message.value = err?.response?.data?.message || '提交失败，请稍后再试';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>
