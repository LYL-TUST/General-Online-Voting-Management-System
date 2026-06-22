<template>
  <div class="empty-state">
    <el-empty :description="description || '暂无数据'">
      <template #image>
        <div style="font-size: 42px;">{{ icon }}</div>
      </template>
      <template #default>
        <div v-if="title" style="font-weight: 600; margin-bottom: 6px;">{{ title }}</div>
        <slot />
      </template>
    </el-empty>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  icon: {
    type: String,
    default: '📭'
  }
});
</script>
