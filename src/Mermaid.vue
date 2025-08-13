<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});
// 接收Mermaid图表代码作为props
const props = defineProps<{
  code: string; // Mermaid图表定义代码
}>();

// 图表容器引用
const container = ref<HTMLDivElement | null>(null);

// 渲染Mermaid图表的方法
const renderMermaid = async () => {
  if (!container.value || !props.code.trim()) return;

  try {
    // 清空容器
    container.value.innerHTML = '';

    // 生成唯一ID避免冲突
    const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 调用Mermaid渲染方法
    const { svg } = await mermaid.render(uniqueId, props.code);

    // 将渲染结果插入容器
    container.value.innerHTML = svg;
  } catch (error) {
    // 处理渲染错误
    container.value.innerHTML = `
      <div class="mermaid-error">
        <p>❌ Mermaid渲染错误：</p>
      </div>
    `;
  }
};

// 监听代码变化重新渲染
watch(() => props.code, renderMermaid, { immediate: true });

// 组件挂载后渲染
onMounted(renderMermaid);
</script>

<template>
  <div class="mermaid-container" ref="container" />
</template>

<style scoped>
.mermaid-container {
  margin: 1rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  overflow: auto;
}

.mermaid-error {
  color: #dc3545;
  font-size: 0.9rem;
}

.mermaid-error pre {
  margin: 0.5rem 0 0;
  padding: 0.5rem;
  background: #ffebee;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>
