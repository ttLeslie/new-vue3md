<script setup lang="ts">
import hljs from 'highlight.js';
import { ref, onMounted } from 'vue';
import { SUPPORTED_LANGUAGES } from './md/utils';
import renderMarkdown from './md/index';
import Mermaid from './Mermaids.vue';
import ECharts from './ECharts.vue';

// 原始完整内容
const fullContent = `
### 代码块

\`\`\`javascript
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
\`\`\`

### Mermaid图表示例

\`\`\`mermaid
pie
    "传媒及文化相关" : 35
    "广告与市场营销" : 8
    "游戏开发" : 15
    "影视动画与特效" : 12
    "互联网产品设计" : 10
    "VR/AR开发" : 5
    "其他" : 15
\`\`\`

### 代码块

\`\`\`javascript
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';
import { h, type VNode } from 'vue';
import MarkdownIt, { type Token } from 'markdown-it';

\`\`\`


\`\`\`echarts
option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ]
};
\`\`\`



`;

// 用于展示的内容（打字机效果）
const content = ref('');
// 打字机状态
const isTyping = ref(false);
const typingSpeed = ref(10); // 打字速度，毫秒/字符
const currentPosition = ref(0);
const timer = ref<number | null>(null);

// 开始打字
const startTyping = () => {
  if (isTyping.value) return;

  isTyping.value = true;

  // 如果已经完成，从头开始
  if (currentPosition.value >= fullContent.length) {
    content.value = '';
    currentPosition.value = 0;
  }

  typeNextCharacter();
};

// 逐字显示
const typeNextCharacter = () => {
  if (currentPosition.value < fullContent.length && isTyping.value) {
    content.value += fullContent.charAt(currentPosition.value);
    currentPosition.value++;

    // 根据字符类型调整速度，让体验更自然
    let delay = typingSpeed.value;
    const char = fullContent.charAt(currentPosition.value);
    if (['\n', '.', ',', ';', '!', '?'].includes(char)) {
      delay = typingSpeed.value * 5; // 标点符号后稍作停顿
    } else if (char === ' ') {
      delay = typingSpeed.value * 2; // 空格停顿短一些
    }

    timer.value = window.setTimeout(typeNextCharacter, delay);
  } else {
    isTyping.value = false;
  }
};

// 重新开始
const restartTyping = () => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
  content.value = '';
  currentPosition.value = 0;
  startTyping();
};

// 代码样式处理
const setCodeStyle = (rawCode: string, lang: string) => {
  // 检查是否为特殊处理的语言
  if (['mermaid', 'echarts'].includes(lang)) return rawCode;
  // 检查是否为支持的语言，否则使用plaintext
  const language = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'plaintext';
  try {
    return hljs.highlight(rawCode, { language }).value;
  } catch (e) {
    return hljs.highlight(rawCode, { language: 'plaintext' }).value;
  }
};

// 初始显示全部内容
onMounted(() => {
  content.value = fullContent;
});
</script>

<template>
  <div class="container">
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="startTyping" :disabled="isTyping" class="control-btn start-btn">
        <i class="fas fa-play"></i> {{ isTyping ? '正在打字...' : '开始打字' }}
      </button>
      <button @click="restartTyping" class="control-btn restart-btn">
        <i class="fas fa-redo"></i> 重新开始
      </button>
    </div>

    <!-- Markdown内容渲染 -->
    <div class="markdown-content">
      <renderMarkdown :content="content">
        <template #javascript="{ lang, rawCode }">
          <div class="custom-js-code">
            <pre class="code-content" v-html="setCodeStyle(rawCode, lang)"></pre>
          </div>
        </template>

        <template #mermaid="{ rawCode }">
          <Mermaid :code="rawCode" />
        </template>

        <template #echarts="{ rawCode }">
          <ECharts :code="rawCode" />
        </template>
      </renderMarkdown>
    </div>
  </div>
</template>

<style>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

/* 控制按钮样式 */
.controls {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
}

.control-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.start-btn {
  background-color: #4caf50;
  color: white;
}

.start-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.restart-btn {
  background-color: #2196f3;
  color: white;
}

.control-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 原有样式保持不变 */
span[aria-hidden='true'] {
  display: none;
}

.code-content {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 2rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
