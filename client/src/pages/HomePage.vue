<template>
  <div class="home-page">
    <section class="hero card-surface">
      <div class="hero__content">
        <div class="hero__badge">SaaS · Smart Voting Platform</div>
        <h1>让每一次投票，都更高效、更透明、更有数据感</h1>
        <p>
          面向通用场景的在线投票系统，支持快速发起、参与投票、结果可视化与全过程管理，
          让组织协作更轻盈，让数据呈现更专业。
        </p>

        <div class="hero__actions">
          <el-button type="primary" size="large" @click="go('create')">立即发起投票</el-button>
          <el-button size="large" @click="go('guide')">查看使用教程</el-button>
        </div>

        <div class="hero__meta">
          <span>Vue 3</span>
          <span>Element Plus</span>
          <span>Pinia</span>
          <span>ECharts</span>
        </div>
      </div>

      <div class="hero__preview" @mouseenter="pauseFloat = true" @mouseleave="pauseFloat = false">
        <div class="preview-orb preview-orb--one"></div>
        <div class="preview-orb preview-orb--two"></div>
        <div class="preview-stack" :class="{ 'is-paused': pauseFloat }">
          <el-card class="preview-card preview-card--main" shadow="never">
            <div class="preview-card__title">今日概览</div>
            <div class="preview-card__value">{{ totalVotes }}</div>
            <div class="preview-card__desc">系统投票总览与趋势追踪</div>
          </el-card>
          <el-card class="preview-card preview-card--chart" shadow="never">
            <div ref="miniChartRef" class="mini-chart"></div>
          </el-card>
          <el-card class="preview-card preview-card--list" shadow="never">
            <div class="preview-list__item" v-for="item in previewList" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </el-card>
        </div>
      </div>
    </section>

    <section class="feature-grid">
      <article class="feature-card card-surface" v-for="item in features" :key="item.title" @click="go(item.route)">
        <div class="feature-card__icon">{{ item.icon }}</div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </article>
    </section>

    <section class="dashboard card-surface">
      <div class="section-head">
        <div>
          <span class="section-head__tag">Intelligent Dashboard</span>
          <h2>智能数据看板</h2>
        </div>
        <el-button text type="primary" @click="go('create')">创建你的第一个投票</el-button>
      </div>

      <div v-if="hasData" class="dashboard__body">
        <div class="stat-grid">
          <el-card v-for="item in stats" :key="item.label" class="stat-card" shadow="never">
            <div class="stat-card__label">{{ item.label }}</div>
            <div class="stat-card__value">{{ item.value }}</div>
            <div class="stat-card__hint">{{ item.hint }}</div>
          </el-card>
        </div>

        <div class="trend-card">
          <div class="trend-card__header">
            <strong>近 7 天投票趋势</strong>
            <span>基于当前本地投票数据</span>
          </div>
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>
      </div>

      <el-empty v-else description="当前还没有投票数据">
        <el-button type="primary" @click="go('create')">立即发起投票</el-button>
      </el-empty>
    </section>

    <footer class="footer card-surface">
      <div>
        <strong>通用在线投票管理系统</strong>
        <p>Vue 3 + Vite + Pinia + Element Plus + ECharts</p>
      </div>
      <span>© 2026</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { useAppStore } from '../store/app';

const store = useAppStore();
const router = useRouter();
const pauseFloat = ref(false);
const miniChartRef = ref(null);
const trendChartRef = ref(null);
let miniChart = null;
let trendChart = null;

const features = [
  { title: '智能创建', desc: '清晰表单与校验机制，帮助快速完成投票创建。', icon: '✦', route: 'create' },
  { title: '全场景投票', desc: '支持多种投票方式，适配通用业务与活动场景。', icon: '◌', route: 'join' },
  { title: '数据可视化', desc: '通过图表直观展示投票结果与变化趋势。', icon: '▣', route: 'rank' },
  { title: '全流程管理', desc: '覆盖创建、参与、记录与结果查看的完整链路。', icon: '◎', route: 'my-created' }
];

const totalVotes = computed(() => store.createdVotes.length);
const hasData = computed(() => store.createdVotes.length > 0 || store.voteRecords.length > 0);
const totalParticipants = computed(() => store.createdVotes.reduce((sum, item) => sum + (item.participants || 0), 0));
const ongoingVotes = computed(() => store.createdVotes.filter((item) => item.status !== 'closed' && item.status !== 'ended').length);
const endedVotes = computed(() => store.createdVotes.filter((item) => item.status === 'closed' || item.status === 'ended').length);

const stats = computed(() => [
  { label: '总创建投票', value: totalVotes.value, hint: '当前系统内所有投票' },
  { label: '总参与人次', value: totalParticipants.value, hint: '累计参与与响应数据' },
  { label: '进行中投票', value: ongoingVotes.value, hint: '仍可参与的投票' },
  { label: '已结束投票', value: endedVotes.value, hint: '已关闭的投票' }
]);

const previewList = computed(() => [
  { label: '创建投票', value: totalVotes.value },
  { label: '参与人次', value: totalParticipants.value },
  { label: '趋势天数', value: 7 }
]);

const trendData = computed(() => {
  const days = Array.from({ length: 7 }, (_, i) => `D-${6 - i}`);
  const counts = days.map((_, idx) => Math.max(0, Math.round((store.createdVotes.length * (idx + 1)) / 7)));
  return { days, counts };
});

const renderMiniChart = () => {
  if (!miniChartRef.value) return;
  miniChart ||= echarts.init(miniChartRef.value);
  miniChart.setOption({
    grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: true },
    xAxis: { type: 'category', data: ['一', '二', '三', '四', '五', '六', '日'], show: false },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data: [2, 4, 3, 6, 7, 5, 8],
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: '#4096ff' },
      areaStyle: { color: 'rgba(64,150,255,0.12)' }
    }]
  });
};

const renderTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChart ||= echarts.init(trendChartRef.value);
  trendChart.setOption({
    grid: { left: 18, right: 12, top: 24, bottom: 18 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: trendData.value.days, boundaryGap: false, axisLine: { lineStyle: { color: '#dbeafe' } } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#eef2ff' } } },
    series: [{
      name: '投票数量',
      type: 'line',
      data: trendData.value.counts,
      smooth: true,
      symbolSize: 8,
      itemStyle: { color: '#4096ff' },
      lineStyle: { width: 3, color: '#4096ff' },
      areaStyle: { color: 'rgba(64,150,255,0.14)' }
    }]
  });
};

const resizeCharts = () => {
  miniChart?.resize();
  trendChart?.resize();
};

const go = (name) => router.push({ name });

onMounted(async () => {
  await nextTick();
  renderMiniChart();
  renderTrendChart();
  window.addEventListener('resize', resizeCharts);
});

watch(
  () => [store.createdVotes.length, store.voteRecords.length],
  async () => {
    await nextTick();
    renderMiniChart();
    renderTrendChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  miniChart?.dispose();
  trendChart?.dispose();
});
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 20px;
}

.card-surface {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 10px 30px rgba(64, 150, 255, 0.08);
  border: 1px solid rgba(64, 150, 255, 0.08);
  backdrop-filter: blur(14px);
}

.hero {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, rgba(233, 243, 255, 0.95), rgba(248, 251, 255, 0.82));
  overflow: hidden;
}

.hero__badge,
.section-head__tag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  color: #4096ff;
  background: rgba(64, 150, 255, 0.12);
  font-size: 12px;
  font-weight: 600;
}

.hero h1 {
  margin: 16px 0 12px;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.1;
  color: #0f172a;
}

.hero p {
  max-width: 640px;
  margin: 0;
  color: #475569;
  line-height: 1.8;
}

.hero__actions, .hero__meta { display: flex; flex-wrap: wrap; gap: 12px; }
.hero__actions { margin-top: 24px; }
.hero__meta { margin-top: 18px; color: #64748b; font-size: 13px; }
.hero__meta span { padding-right: 12px; border-right: 1px solid rgba(148, 163, 184, 0.35); }
.hero__meta span:last-child { border-right: 0; }

.hero__preview {
  position: relative;
  min-height: 360px;
}

.preview-stack {
  position: relative;
  width: 100%;
  height: 100%;
  animation: floatUp 5s ease-in-out infinite;
}
.preview-stack.is-paused { animation-play-state: paused; }

.preview-card {
  position: absolute;
  border-radius: 12px;
}
.preview-card--main { left: 8%; top: 8%; width: 68%; }
.preview-card--chart { right: 0; top: 24%; width: 54%; }
.preview-card--list { left: 18%; bottom: 0; width: 58%; }
.preview-card__title { color: #64748b; font-size: 13px; }
.preview-card__value { margin-top: 8px; font-size: 40px; font-weight: 700; color: #0f172a; }
.preview-card__desc { margin-top: 6px; color: #64748b; }
.preview-list__item { display: flex; justify-content: space-between; padding: 10px 0; color: #334155; }
.mini-chart { width: 100%; height: 120px; }
.preview-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  background: radial-gradient(circle, rgba(64,150,255,.28), rgba(64,150,255,0));
}
.preview-orb--one { width: 160px; height: 160px; top: -12px; right: 10%; }
.preview-orb--two { width: 120px; height: 120px; bottom: 10px; left: -8px; }

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.feature-card { padding: 22px; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(64,150,255,.12); }
.feature-card__icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 12px; background: rgba(64,150,255,.12); color: #4096ff; font-size: 22px; }
.feature-card h3 { margin: 14px 0 8px; color: #0f172a; }
.feature-card p { margin: 0; color: #64748b; line-height: 1.75; }

.dashboard, .footer { padding: 24px; }
.section-head, .footer { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.section-head h2 { margin: 8px 0 0; color: #0f172a; }
.dashboard__body { margin-top: 18px; display: grid; gap: 18px; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.stat-card { border-radius: 12px; }
.stat-card__label { color: #64748b; font-size: 13px; }
.stat-card__value { margin-top: 10px; font-size: 30px; font-weight: 700; color: #0f172a; }
.stat-card__hint { margin-top: 6px; color: #94a3b8; font-size: 12px; }
.trend-card { padding: 18px; border-radius: 12px; background: #fff; border: 1px solid #e2e8f0; }
.trend-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #64748b; }
.trend-card__header strong { color: #0f172a; }
.trend-chart { width: 100%; height: 280px; }
.footer p { margin: 6px 0 0; color: #64748b; }
.footer span { color: #94a3b8; }

@keyframes floatUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 1200px) {
  .hero, .feature-grid, .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .hero, .feature-grid, .stat-grid { grid-template-columns: 1fr; }
  .section-head, .footer { flex-direction: column; align-items: flex-start; }
  .preview-card--main, .preview-card--chart, .preview-card--list { position: relative; left: auto; right: auto; top: auto; bottom: auto; width: 100%; margin-bottom: 12px; }
  .hero__preview { min-height: auto; }
}
</style>
