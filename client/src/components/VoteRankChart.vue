<template>
  <section class="page-card chart-box">
    <div class="section-title">
      <h2>可视化结果</h2>
      <el-tag v-if="activeOptionId" type="success">当前选中：{{ activeLabel }}</el-tag>
    </div>
    <div ref="chartRef" style="width: 100%; height: 320px;"></div>
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

const activeLabel = computed(() => {
  const option = props.vote?.options?.find((item) => item.id === props.activeOptionId);
  return option ? option.time : '全部选项';
});

const renderChart = () => {
  if (!chart || !props.vote) return;
  const options = [...props.vote.options].sort((a, b) => (b.votes - a.votes) || (a.id - b.id));
  chart.setOption({
    tooltip: {},
    xAxis: { type: 'category', data: options.map((item) => item.time) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: options.map((item) => ({
          value: item.votes,
          itemStyle: {
            color: props.activeOptionId && item.id === props.activeOptionId ? '#2563eb' : '#93c5fd'
          }
        }))
      }
    ]
  });
};

onMounted(() => {
  chart = echarts.init(chartRef.value);
  renderChart();
});

watch(() => props.vote, renderChart, { deep: true });
watch(() => props.activeOptionId, renderChart);

onBeforeUnmount(() => {
  chart?.dispose();
});
</script>
