<script setup lang="ts">
import hljs from 'highlight.js';
import { ref, onMounted } from 'vue';
import { SUPPORTED_LANGUAGES } from './md/utils';
import renderMarkdown from './md/MarkdownRenderer.vue';
import Mermaid from './Mermaid.vue';

// 原始完整内容
const fullContent = `

子列表项1  <span data-type="quto" data-content="这是自定义的内联vue组件"></span> 子列表项1

`;

// ### emoji
// :neutral_face:无论是园林的精致、水乡的温婉，还是金鸡湖的现代。
// :no_mouth:苏州都能让你在三天内感受到 “双面绣” 般的独特魅力。
// :innocent:愿你在姑苏城的时光，如诗如画，回味无穷！

// ### 自定义组件
// <span data-type="quto">这是自定义的内联vue组件</span>

// ### 静态段落
// <p>这是一个静态段落</p>

// ### 无序列表
// - 列表项1
//   - 子列表项1  <span data-type="quto" data-content="这是自定义的内联vue组件"></span> 子列表项1
// - 列表项2
//   - 子列表项2
// - 列表项3
//   - 子列表项3

// 用于展示的内容（打字机效果）
const content = ref('');
// 打字机状态
const isTyping = ref(false);
const typingSpeed = ref(10);
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
      <renderMarkdown
        :content="content"
        :mdOptions="{
          breaks: true,
          html: true,
        }"
        :sanitize="true"
      >
        <template #inline="{ originalContent, content, tags, attrs }">
          <span>
            {{ content }}
            <span v-if="tags === 'span'" style="background-color: aliceblue">{{
              attrs[0].content
            }}</span>
          </span>
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
