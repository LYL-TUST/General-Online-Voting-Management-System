<template>
  <section class="page-card rank-visual-card rank-visual-card--luxury">
    <header class="rank-visual-card__header rank-visual-card__header--luxury">
      <div>
        <h2 class="rank-visual-card__title rank-visual-card__title--luxury">投票结果可视化</h2>
      </div>
      <el-tag v-if="activeLabel" type="success" effect="dark" class="rank-active-tag">
        当前选中投票：{{ activeLabel }}
      </el-tag>
    </header>

    <section class="rank-metrics">
      <el-card v-for="item in metrics" :key="item.label" shadow="never" class="rank-metric-card rank-metric-card--luxury">
        <div class="muted rank-metric-card__label">{{ item.label }}</div>
        <div class="rank-metric-card__value">{{ item.value }}</div>
      </el-card>
    </section>

    <div class="rank-chart-shell">
      <div ref="chartRef" class="rank-chart"></div>
    </div>

    <section class="rank-list-panel rank-list-panel--luxury">
      <div class="section-title">
        <h3 class="rank-list-panel__title">投票排行</h3>
      </div>
      <div class="rank-list">
        <div
          v-for="(item, index) in rankedOptions"
          :key="item.id"
          class="rank-list-item"
          :class="[`rank-list-item--${Math.min(index + 1, 3)}`]"
        >
          <div class="rank-list-item__left">
            <span class="rank-list-item__index">{{ index + 1 }}</span>
            <div>
              <div class="rank-list-item__time">{{ item.label }}</div>
              <div class="muted rank-list-item__meta">{{ item.votes }} 票 · {{ votePercent(item.votes) }}%</div>
            </div>
          </div>
          <div class="rank-list-item__bar">
            <el-progress :percentage="votePercent(item.votes)" :show-text="false" :stroke-width="12" />
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  vote: Object,
  activeOptionId: [String, Number]
});

const chartRef = ref();
let chart;

const rankedOptions = computed(() => {
  const list = props.vote?.options ? [...props.vote.options] : [];
  return list.sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return a.id - b.id;
  });
});

const activeLabel = computed(() => {
  const option = props.vote?.options?.find((item) => item.id === props.activeOptionId);
  return option ? option.label : '全部选项';
});

const totalVotes = computed(() => rankedOptions.value.reduce((sum, item) => sum + item.votes, 0));
const maxVotes = computed(() => Math.max(0, ...rankedOptions.value.map((item) => item.votes)));
const topLabel = computed(() => rankedOptions.value[0]?.label || '暂无');
const avgVotes = computed(() => (rankedOptions.value.length ? (totalVotes.value / rankedOptions.value.length).toFixed(1) : '0.0'));

const metrics = computed(() => [
  { label: '总参与人数', value: `${props.vote?.participants || 0} 人` },
  { label: '最高得票', value: `${maxVotes.value} 票` },
  { label: '平均票数', value: `${avgVotes.value} 票` },
  { label: '当前领先', value: topLabel.value }
]);

const votePercent = (votes) => {
  if (!totalVotes.value) return 0;
  return Math.round((votes / totalVotes.value) * 100);
};

const colors = ['#4080ff', '#722ed1', '#13c2c2'];

const renderChart = () => {
  if (!chart || !props.vote) return;
  const options = [...(props.vote.options || [])];
  const total = Math.max(1, totalVotes.value);

  chart.setOption({
    animationDuration: 800,
    animationEasing: 'cubicOut',
    grid: { left: 36, right: 24, top: 78, bottom: 38, containLabel: true },
    legend: {
      top: 18,
      left: 18,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#64748b', fontSize: 12 },
      data: options.map((item) => item.label)
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(64, 128, 255, 0.08)' }
      },
      backgroundColor: 'rgba(17, 24, 39, 0.96)',
      borderWidth: 0,
      textStyle: { color: '#fff' },
      padding: [12, 14],
      formatter: (params) => {
        const p = params?.[0];
        if (!p) return '';
        const item = options[p.dataIndex];
        const percent = ((item.votes / total) * 100).toFixed(1);
        return [`<div style="font-weight:600;margin-bottom:6px;">${item.label}</div>`, `得票数：<b>${item.votes}</b> 票`, `占总票数：<b>${percent}%</b>`].join('<br/>');
      }
    },
    xAxis: {
      type: 'category',
      data: options.map((item) => item.label),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        margin: 16,
        rotate: 0,
        interval: 0,
        formatter: (value) => value
      }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    series: [
      {
        name: '票数',
        type: 'bar',
        barWidth: 36,
        barMaxWidth: 48,
        barCategoryGap: '30%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 24,
            shadowColor: 'rgba(15, 23, 42, 0.2)',
            borderColor: '#fff',
            borderWidth: 1,
            color: '#2563eb'
          }
        },
        data: options.map((item, index) => ({
          value: item.votes,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: colors[index % 3] },
                { offset: 1, color: `${colors[index % 3]}33` }
              ]
            },
            shadowBlur: props.activeOptionId && item.id === props.activeOptionId ? 18 : 8,
            shadowColor: 'rgba(15, 23, 42, 0.12)',
            shadowOffsetY: 4
          }
        }))
      }
    ]
  });
};

const resizeChart = () => chart?.resize();

onMounted(() => {
  chart = echarts.init(chartRef.value);
  renderChart();
  window.addEventListener('resize', resizeChart);
});

watch(() => [props.vote, props.activeOptionId], () => {
  renderChart();
  resizeChart();
}, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  chart?.dispose();
});
</script>
