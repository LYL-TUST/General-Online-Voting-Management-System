<template>
  <div class="copy-field">
    <el-input :model-value="modelValue" :placeholder="placeholder" readonly>
      <template v-if="prefix" #prepend>{{ prefix }}</template>
    </el-input>
    <el-button type="primary" @click="copy">{{ buttonText }}</el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: String,
  prefix: String,
  placeholder: {
    type: String,
    default: '暂无内容'
  },
  buttonText: {
    type: String,
    default: '复制'
  }
});

const copy = async () => {
  const text = props.modelValue || '';
  if (!text) return ElMessage.warning('暂无可复制内容');
  await navigator.clipboard.writeText(text);
  ElMessage.success('已复制');
};
</script>
