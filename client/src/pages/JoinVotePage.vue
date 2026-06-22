<template>
  <div class="page-grid">
    <section class="page-card">
      <div class="section-title">
        <h2>参与投票</h2>
        <el-tag v-if="currentId" type="info">当前 ID：{{ currentId }}</el-tag>
      </div>
      <div class="toolbar">
        <el-input v-model.trim="voteId" placeholder="请输入投票 ID" style="max-width: 320px" />
        <el-button type="primary" :loading="loading" @click="loadVote">查询投票</el-button>
      </div>
    </section>

    <section v-if="!vote" class="page-card">
      <EmptyState title="暂无投票详情" description="请先选择一个投票事件，或输入正确的投票 ID 加载投票。" />
      <div v-if="recentVotes.length" class="recent-vote-list">
        <div class="section-title"><h2>可选投票事件</h2></div>
        <el-card v-for="item in recentVotes" :key="item.id" shadow="hover" class="recent-vote-card">
          <div class="detail-header">
            <div>
              <h3>{{ item.topic }}</h3>
              <div class="muted">投票 ID：{{ item.id }}</div>
            </div>
            <el-button type="primary" plain @click="goVote(item.id)">进入投票</el-button>
          </div>
        </el-card>
      </div>
    </section>

    <template v-else>
      <section class="page-card">
        <div class="detail-header">
          <div>
            <h2>{{ vote.topic }}</h2>
            <div class="muted">投票 ID：{{ vote.id }}</div>
          </div>
          <el-tag v-if="alreadyVoted" type="success">已投过票，可继续投票</el-tag>
        </div>
      </section>

      <VoteOptionList :vote="vote" :voted-ids="votedIds" :voting-id="currentId" @vote="submitVote" />

      <section class="page-card">
        <div class="section-title"><h2>投票历史</h2></div>
        <EmptyState v-if="history.length === 0" title="暂无投票历史" description="每次投票后，这里都会新增一条记录。" />
        <el-table v-else :data="history" border style="width: 100%">
          <el-table-column prop="votedAt" label="投票时间" width="220" />
          <el-table-column prop="optionText" label="投票选项" />
          <el-table-column prop="voteId" label="投票 ID" width="180" />
        </el-table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import http from '../api/http';
import VoteOptionList from '../components/VoteOptionList.vue';
import EmptyState from '../components/EmptyState.vue';
import { useAppStore } from '../store/app';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const voteId = ref(String(route.params.id || ''));
const loading = ref(false);
const vote = ref(null);
const currentId = computed(() => voteId.value.trim());
const votedIds = computed(() => store.voteRecords.map((item) => item.voteId));
const alreadyVoted = computed(() => votedIds.value.includes(currentId.value));
const history = computed(() => store.voteRecords.filter((item) => item.voteId === currentId.value));
const recentVotes = computed(() => store.createdVotes.slice(0, 5));

const goVote = (id) => {
  voteId.value = id;
  loadVote();
  router.push(`/vote/${id}`);
};

const loadVote = async () => {
  if (!currentId.value) return ElMessage.error('投票 ID 不能为空');
  loading.value = true;
  try {
    const { data } = await http.get(`/votes/${currentId.value}`);
    vote.value = data.data;
    store.setCurrentVote(data.data);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (currentId.value) loadVote();
});

const submitVote = async (optionId) => {
  const { data } = await http.post(`/votes/${currentId.value}/vote`, { optionId });
  vote.value = data.data;
  store.setCurrentVote(data.data);
  const optionText = data.data.options.find((item) => item.id === optionId)?.time || '';
  store.addVoteRecord({
    voteId: currentId.value,
    topic: data.data.topic,
    optionId,
    optionText,
    votedAt: new Date().toLocaleString('zh-CN')
  });
  ElMessage.success('投票成功');
};
</script>
