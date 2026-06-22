<template>
  <transition name="fade">
    <div v-if="loading" class="loading-mask">
      <div class="loading-mask__panel">
        <el-icon class="is-loading" size="24"><Loading /></el-icon>
        <div style="margin-top: 10px; text-align: center;">加载中，请稍候...</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue';

defineProps({ loading: Boolean });
</script>
