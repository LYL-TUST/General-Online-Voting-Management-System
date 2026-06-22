<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="vote-form">
    <el-card class="form-section precheck-panel" shadow="never">
      <template #header>
        <div class="section-head precheck-head">
          <div>
            <h3>提交前预检查面板</h3>
            <p>先看清楚哪些信息没填、哪些选项有重复，避免提交后再返工</p>
          </div>
          <el-tag :type="precheckStatus.type" effect="light">{{ precheckStatus.label }}</el-tag>
        </div>
      </template>

      <div v-if="precheckIssues.length" class="issue-list">
        <div v-for="issue in precheckIssues" :key="issue.key" class="issue-item" :class="`issue-${issue.level}`">
          <el-icon class="issue-icon"><component :is="issue.icon" /></el-icon>
          <div class="issue-content">
            <div class="issue-title">{{ issue.title }}</div>
            <div class="issue-desc">{{ issue.description }}</div>
          </div>
        </div>
      </div>

      <el-empty v-else description="当前已满足提交条件">
        <template #image>
          <div class="precheck-ok">✓</div>
        </template>
      </el-empty>
    </el-card>

    <el-card class="form-section" shadow="never">
      <template #header>
        <div class="section-head">
          <div>
            <h3>基础投票信息</h3>
            <p>用于描述投票事件、规则与投票类型</p>
          </div>
        </div>
      </template>

      <div class="grid-2">
        <el-form-item label="投票标题" prop="title">
          <el-input v-model="form.title" maxlength="60" show-word-limit placeholder="例：团建日期选择、项目方案评选、聚餐地点投票" />
        </el-form-item>

        <el-form-item label="投票类型" prop="voteType">
          <el-select v-model="form.voteType" placeholder="请选择投票类型" style="width: 100%" @change="handleTypeChange">
            <el-option label="时间类投票" value="time" />
            <el-option label="文本选项单选" value="text-single" />
            <el-option label="文本选项多选" value="text-multi" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="投票简介" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="填写投票背景、规则、说明，帮助参与者快速理解本次投票" />
      </el-form-item>

      <div class="grid-2">
        <el-form-item label="投票截止时间" prop="deadlineAt">
          <el-date-picker v-model="form.deadlineAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="可选，超过该时间后投票关闭" style="width: 100%" />
        </el-form-item>

        <el-form-item label="重复投票限制" prop="participationRule">
          <el-select v-model="form.participationRule" placeholder="请选择重复投票限制" style="width: 100%">
            <el-option label="允许重复投票" value="repeatable" />
            <el-option label="每人仅可投票一次" value="once" />
          </el-select>
        </el-form-item>
      </div>
    </el-card>

    <el-card class="form-section" shadow="never">
      <template #header>
        <div class="section-head">
          <div>
            <h3>投票候选选项</h3>
            <p>{{ optionHint }}</p>
          </div>
        </div>
      </template>

      <transition-group name="slot-list" tag="div" class="slot-list">
        <div v-for="(slot, index) in form.options" :key="slot.id" class="slot-row">
          <div class="slot-main">
            <el-form-item :label="`投票选项 ${index + 1}`" :prop="`options.${index}.label`" :rules="optionItemRules(index)" class="slot-item">
              <el-input v-model="slot.label" maxlength="80" show-word-limit :placeholder="optionPlaceholder" />
            </el-form-item>

            <el-form-item label="补充备注" :prop="`options.${index}.note`" class="slot-item">
              <el-input v-model="slot.note" maxlength="60" show-word-limit placeholder="例如：预算 5w、线下 302、方案 A" />
            </el-form-item>
          </div>

          <el-button circle text type="danger" :disabled="form.options.length === 1" @click="removeOption(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </transition-group>

      <el-alert v-if="duplicateHint" :title="duplicateHint" type="error" show-icon :closable="false" style="margin-top: 12px" />

      <div class="toolbar">
        <el-button plain @click="addOption">新增选项</el-button>
      </div>
    </el-card>

    <div class="toolbar bottom-toolbar">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" :disabled="submitDisabled" @click="submit">发起投票</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { Delete, CircleCheckFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue';

const emit = defineEmits(['submit', 'reset']);
const formRef = ref();
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createOption = () => ({ id: uid(), label: '', note: '' });
const form = reactive({
  title: '',
  description: '',
  deadlineAt: '',
  voteType: 'text-single',
  participationRule: 'repeatable',
  options: [createOption(), createOption(), createOption()]
});

const optionPlaceholder = computed(() => {
  if (form.voteType === 'time') return '例：周六 14:00、11月20日、活动档期 A';
  return '例：方案 A、餐厅 B、张三、礼品套装';
});

const optionHint = computed(() => {
  const map = {
    time: '可填写时间、档期、日期等内容，适合时间类投票。',
    'text-single': '适合活动奖品、方案选型、人选评选、餐厅选择等单选场景。',
    'text-multi': '预留多选能力，可先按多选场景录入候选项。'
  };
  return map[form.voteType];
});

const optionItemRules = (index) => [
  {
    validator: (_rule, value, callback) => {
      if (!String(value || '').trim()) return callback(new Error('投票选项不能为空'));
      const normalized = form.options.map((item) => item.label.trim());
      const key = normalized[index];
      if (key && normalized.filter((item) => item === key).length > 1) return callback(new Error('投票选项存在重复，请修改'));
      callback();
    },
    trigger: ['blur', 'change']
  }
];

const rules = {
  title: [
    { required: true, message: '投票标题不能为空', trigger: ['blur', 'change'] },
    { min: 2, max: 60, message: '长度需在 2-60 个字符之间', trigger: ['blur', 'change'] }
  ],
  description: [{ max: 300, message: '投票简介最多 300 字', trigger: ['blur', 'change'] }],
  deadlineAt: [{ trigger: ['change', 'blur'] }],
  voteType: [{ required: true, message: '请选择投票类型', trigger: ['change', 'blur'] }],
  participationRule: [{ required: true, message: '请选择重复投票限制', trigger: ['change', 'blur'] }]
};

const duplicateHint = computed(() => {
  const seen = new Set();
  for (const item of form.options) {
    const key = item.label.trim();
    if (!key) continue;
    if (seen.has(key)) return `存在重复投票选项：${key}`;
    seen.add(key);
  }
  return '';
});

const missingFields = computed(() => {
  const list = [];
  if (!form.title.trim()) list.push('投票标题');
  if (!form.voteType) list.push('投票类型');
  if (!form.participationRule) list.push('重复投票限制');
  const emptyOptions = form.options.reduce((count, item) => count + (!item.label.trim() ? 1 : 0), 0);
  if (emptyOptions > 0) list.push(`还有 ${emptyOptions} 个投票选项未填写`);
  return list;
});

const precheckIssues = computed(() => {
  const issues = [];
  if (missingFields.value.length) {
    issues.push({
      key: 'missing-fields',
      level: 'warning',
      icon: WarningFilled,
      title: '还有字段没填',
      description: missingFields.value.join('，')
    });
  }
  if (duplicateHint.value) {
    issues.push({
      key: 'duplicate-options',
      level: 'error',
      icon: CircleCloseFilled,
      title: '存在重复选项',
      description: duplicateHint.value
    });
  }
  if (!issues.length) {
    issues.push({
      key: 'ready',
      level: 'success',
      icon: CircleCheckFilled,
      title: '可以提交',
      description: '所有必填项已完成，当前表单没有重复选项。'
    });
  }
  return issues;
});

const precheckStatus = computed(() => {
  if (duplicateHint.value) return { type: 'danger', label: '提交受阻' };
  if (missingFields.value.length) return { type: 'warning', label: '待完善' };
  return { type: 'success', label: '已通过' };
});

const submitDisabled = computed(() => Boolean(missingFields.value.length || duplicateHint.value));

watch(
  () => [form.title, form.description, form.deadlineAt, form.voteType, form.participationRule, form.options.map((item) => `${item.label}-${item.note}`)],
  async () => {
    if (!formRef.value) return;
    try {
      await formRef.value.validate();
    } catch {
      // 由表单本身展示错误
    }
  },
  { deep: true }
);

const addOption = () => form.options.push(createOption());
const removeOption = (index) => {
  if (form.options.length === 1) return;
  form.options.splice(index, 1);
};

const handleTypeChange = () => {
  form.options = [createOption(), createOption(), createOption()];
  formRef.value?.clearValidate?.();
};

const reset = () => {
  form.title = '';
  form.description = '';
  form.deadlineAt = '';
  form.voteType = 'text-single';
  form.participationRule = 'repeatable';
  form.options = [createOption(), createOption(), createOption()];
  formRef.value?.clearValidate?.();
  emit('reset');
};

const submit = async () => {
  await formRef.value?.validate();
  emit('submit', JSON.parse(JSON.stringify(form)));
};

defineExpose({ reset });
</script>

<style scoped>
.vote-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-section {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
}

.precheck-panel {
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.85), rgba(255, 255, 255, 1));
}

.precheck-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.issue-warning {
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(255, 251, 235, 0.9);
}

.issue-error {
  border-color: rgba(239, 68, 68, 0.24);
  background: rgba(254, 242, 242, 0.95);
}

.issue-success {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(240, 253, 244, 0.95);
}

.issue-icon {
  margin-top: 2px;
}

.issue-title {
  font-weight: 700;
}

.issue-desc {
  margin-top: 4px;
  color: #64748b;
  line-height: 1.5;
}

.precheck-ok {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  font-size: 28px;
  font-weight: 800;
}

.section-head h3 {
  margin: 0;
  font-size: 16px;
}

.section-head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slot-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 1));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.slot-main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.slot-picker {
  display: flex;
  gap: 10px;
}

.weekday-select {
  width: 110px;
}

.time-select {
  flex: 1;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
}

.bottom-toolbar {
  justify-content: space-between;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  border-radius: 12px;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.28) inset;
}

:deep(.el-input.is-focus .el-input__wrapper),
:deep(.el-textarea.is-focus .el-textarea__inner),
:deep(.el-select.is-focus .el-select__wrapper) {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.45) inset, 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.slot-list-enter-active,
.slot-list-leave-active {
  transition: all 0.25s ease;
}

.slot-list-enter-from,
.slot-list-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.slot-list-leave-active {
  position: absolute;
}

@media (max-width: 900px) {
  .grid-2,
  .slot-main {
    grid-template-columns: 1fr;
  }

  .slot-row {
    grid-template-columns: 1fr;
  }

  .bottom-toolbar {
    flex-direction: column-reverse;
    gap: 12px;
  }
}
</style>
