<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
    <el-form-item label="会议主题" prop="topic">
      <el-input v-model="form.topic" placeholder="请输入会议主题" />
    </el-form-item>
    <el-form-item label="候选时间 1" prop="options.0">
      <el-input v-model="form.options[0]" placeholder="例如：周一10:00" />
    </el-form-item>
    <el-form-item label="候选时间 2" prop="options.1">
      <el-input v-model="form.options[1]" placeholder="例如：周一14:00" />
    </el-form-item>
    <el-form-item label="候选时间 3" prop="options.2">
      <el-input v-model="form.options[2]" placeholder="例如：周二10:00" />
    </el-form-item>
    <div class="toolbar">
      <el-button type="primary" @click="submit">发起投票</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue';

const emit = defineEmits(['submit']);
const formRef = ref();
const form = reactive({ topic: '', options: ['', '', ''] });
const rules = {
  topic: [{ required: true, message: '会议主题不能为空', trigger: 'blur' }],
  'options.0': [{ required: true, message: '候选时间不能为空', trigger: 'blur' }],
  'options.1': [{ required: true, message: '候选时间不能为空', trigger: 'blur' }],
  'options.2': [{ required: true, message: '候选时间不能为空', trigger: 'blur' }]
};

const submit = async () => {
  await formRef.value?.validate();
  emit('submit', JSON.parse(JSON.stringify(form)));
};
const reset = () => formRef.value?.resetFields();
</script>
