<script setup lang="ts">
import hljs from 'highlight.js';
import { ref, onMounted } from 'vue';
import { SUPPORTED_LANGUAGES } from './md/utils';
import renderMarkdown from './md/index';
import Mermaid from './Mermaid.vue';

// 原始完整内容
const fullContent = `
### 行内公式
$e^{i\\pi} + 1 = 0$

### 块级公式
$$
F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt
$$

### mermaid 饼状图

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

\`\`\`localvue
\`\`\`

\`\`\`javascript
const useAgent = ''
\`\`\`

![示例图片](https://element-plus-x.com/logo.png "一张示例图")

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
  if (rawCode.trim() === '') return rawCode;
  // 检查是否为特殊处理的语言
  if (['mermaid', 'echarts', 'localvue'].includes(lang)) return rawCode;
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
        <!-- 1. 代码块相关插槽 -->
        <!-- 1.1 特定语言的代码块插槽（动态，如mermaid、javascript、vue等） -->
        <template #mermaid="{ rawCode }">
          <Mermaid :content="rawCode" />
          <!-- 示例：渲染mermaid流程图 -->
        </template>
        <template #javascript="{ lang, rawCode }">
          <div class="js-code" v-if="rawCode !== ''">
            <pre><code class="language-js" v-html="setCodeStyle(rawCode, lang)"></code></pre>
          </div>
        </template>
        <template #localvue="{ rawCode }">
          <!-- 自定义lang=localvue的代码块 -->
          <div class="local-vue">
            <p>自定义Vue组件代码：</p>
            <pre>{{ rawCode }}</pre>
          </div>
        </template>

        <!-- 1.2 通用代码块插槽（所有未匹配特定语言的代码块会走这里） -->
        <template #code="{ lang, rawCode }">
          <div class="default-code">
            <p>语言：{{ lang }}</p>
            <pre>{{ rawCode }}</pre>
          </div>
        </template>

        <!-- 2. 文本相关插槽 -->
        <!-- 2.1 普通文本插槽 -->
        <template #text="{ content }">
          <span class="custom-text" style="color: blue">{{ content }}</span>
        </template>

        <!-- 2.2 表情符号插槽 -->
        <template #emoji="{ content }">
          <span class="custom-emoji" style="font-size: 1.2em">{{ content }}</span>
        </template>

        <!-- 3. 图片插槽 -->
        <template #image="{ src, alt, title }">
          <div class="custom-image-wrapper">
            <img
              :src="src"
              :alt="alt"
              :title="title"
              class="custom-img"
              style="border: 2px solid #ccc"
            />
            <p class="img-desc">{{ alt || title }}</p>
          </div>
        </template>

        <!-- 4. HTML块插槽 -->
        <template #htmlBlock="{ content }">
          <div class="custom-html">
            <p>自定义HTML块：</p>
            <div v-html="content"></div>
          </div>
        </template>

        <!-- 5. 行内代码插槽 -->
        <template #codeInline="{ content }">
          <code class="custom-code-inline" style="background: #f5f5f5; padding: 2px 4px">{{
            content
          }}</code>
        </template>

        <!-- 6. 数学公式插槽 -->
        <!-- 6.1 行内数学公式 -->
        <template #mathInline="{ content }">
          <span class="custom-math-inline"> 公式：{{ content }} </span>
        </template>

        <!-- 6.2 块级数学公式 -->
        <template #mathBlock="{ content }">
          <div class="custom-math-block" style="margin: 10px 0; padding: 10px; background: #f9f9f9">
            块级公式：{{ content }}
          </div>
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
