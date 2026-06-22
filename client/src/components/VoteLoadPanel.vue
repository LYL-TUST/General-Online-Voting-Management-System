<template>
  <section class="card">
    <div class="section-title">
      <h2>参与投票</h2>
    </div>
    <p class="subtext">输入投票 ID 后加载投票详情，再进行投票。</p>

    <div class="join-row">
      <input v-model.trim="localVoteId" type="text" placeholder="请输入投票 ID" />
      <button class="secondary" type="button" @click="onLoad" :disabled="loading">
        {{ loading ? '加载中...' : '加载投票' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  loading: Boolean,
  modelValue: String
});

const emit = defineEmits(['update:modelValue', 'load']);

const localVoteId = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (value) => {
    localVoteId.value = value || '';
  },
  { immediate: true }
);

watch(localVoteId, (value) => {
  emit('update:modelValue', value);
});

const onLoad = () => emit('load', localVoteId.value.trim());
</script>
