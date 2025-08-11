import { h, defineComponent, type PropType, type VNode } from 'vue';
import type { RendererToken, ExtendedToken } from '../utils';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import { katex } from '@mdit/plugin-katex';

const markdownParser = MarkdownIt({}).use(katex);

// 直接创建Vue的VNode
const createVNode = (
  node: RendererToken,
  index: number,
  mdInstance: MarkdownIt,
): VNode | string | null => {
  const { ComponentType } = node;

  // 文本节点
  if (ComponentType === 'text') {
    return (node as ExtendedToken).content || '';
  }

  // 软换行
  if (ComponentType === 'softbreak') {
    return h('br', { key: index });
  }

  // 内联节点
  if (ComponentType === 'inline') {
    const children = (node as any).children
      .map((child: RendererToken, i: number) => createVNode(child, i, mdInstance))
      .filter(Boolean);

    return h('div', { key: index }, children);
  }

  // 图片节点
  if (ComponentType === 'image') {
    return h('img', {
      key: index,
      class: 'markdown-image',
      src: getImageSrc(node as ExtendedToken),
      alt: getImageAlt(node as ExtendedToken),
      title: getImageTitle(node as ExtendedToken),
    });
  }

  // HTML块
  if (ComponentType === 'html_block') {
    return h('div', {
      key: index,
      innerHTML: (node as ExtendedToken).content || '',
    });
  }

  if (ComponentType === 'code_inline') {
    const content = (node as ExtendedToken).content || '';
    return h('code', {
      key: index,
      class: 'code-inline', // 用于样式化的类名
      // 转义内容以确保特殊字符正确显示
      innerHTML: escapeHtml(content),
    });
  }

  if (ComponentType === 'math_inline') {
    const formula = (node as ExtendedToken).content || '';
    // 使用 KaTeX 渲染公式为 HTML
    const html = markdownParser.render(
      `${(node as ExtendedToken).markup}${formula}${(node as ExtendedToken).markup}`,
    );

    console.log(`${(node as ExtendedToken).markup}${formula}${(node as ExtendedToken).markup}`);

    return h('span', {
      key: index,
      class: 'math-inline', // 行内公式样式类
      innerHTML: html, // 插入渲染后的公式 HTML
    });
  }

  // 代码块处理 (fence类型)
  if (ComponentType && ComponentType.startsWith('fence:')) {
    // 提取语言信息 (例如 "fence:javascript" -> "javascript")
    const language = ComponentType.split(':')[1] || 'plaintext';
    const content = (node as ExtendedToken).content || '';

    // 尝试高亮代码，如果语言不支持则回退到普通文本
    let highlightedContent = '';
    try {
      highlightedContent = hljs.highlight(content, { language }).value;
    } catch (e) {
      highlightedContent = escapeHtml(content);
    }

    // 创建代码块容器
    return h(
      'div',
      {
        key: index,
        class: 'code-block-container',
      },
      [
        // 语言标签
        h('div', { class: 'code-language' }, language),
        // 代码块主体
        h('pre', { class: `language-${language}` }, [
          h('code', {
            class: `language-${language}`,
            innerHTML: highlightedContent,
          }),
        ]),
      ],
    );
  }

  // 默认类型节点
  if (ComponentType === 'default') {
    const tagNode = node as any;
    const { tag, children } = tagNode;

    // 处理子节点
    const childNodes = children
      .map((child: RendererToken, i: number) => createVNode(child, i, mdInstance))
      .filter(Boolean);

    // 构建基础属性
    const baseProps: Record<string, any> = { key: index };

    // 根据标签类型添加不同的类名
    switch (tag) {
      case isHeadingTag(tag):
        baseProps.class = 'markdown-heading';
        break;
      case 'ul':
        baseProps.class = 'markdown-ul';
        break;
      case 'ol':
        baseProps.class = 'markdown-ol';
        break;
      case 'li':
        baseProps.class = 'markdown-li';
        break;
      case 'p':
        baseProps.class = 'markdown-p';
        break;
      case 'a':
        baseProps.class = 'markdown-a';
        baseProps.href = getHref(tagNode);
        break;
      case 'strong':
        baseProps.class = 'markdown-strong';
        break;
      case 'em':
        baseProps.class = 'markdown-em';
        break;
      case 's':
        baseProps.class = 'markdown-del';
        break;
      case 'blockquote':
        baseProps.class = 'markdown-blockquote';
        break;
      case 'table':
        baseProps.class = 'markdown-table';
        break;
      case 'thead':
        baseProps.class = 'markdown-thead';
        break;
      case 'tbody':
        baseProps.class = 'markdown-tbody';
        break;
      case 'tr':
        baseProps.class = 'markdown-tr';
        break;
      case 'th':
        baseProps.class = 'markdown-th';
        break;
      case 'td':
        baseProps.class = 'markdown-td';
        break;
    }

    return h(tag, baseProps, childNodes);
  }

  // 默认返回空
  return null;
};

// HTML 转义函数，防止XSS和确保代码正确显示
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 获取图片的src属性
const getImageSrc = (node: ExtendedToken) => {
  if (node.attrs) {
    const srcAttr = node.attrs.find((attr: [string, string]) => attr[0] === 'src');
    return srcAttr ? srcAttr[1] : '';
  }
  return '';
};

// 获取图片的alt属性
const getImageAlt = (node: ExtendedToken) => {
  if (node.attrs) {
    const altAttr = node.attrs.find((attr: [string, string]) => attr[0] === 'alt');
    return altAttr ? altAttr[1] : '';
  }
  return '';
};

// 获取图片的title属性
const getImageTitle = (node: ExtendedToken) => {
  if (node.attrs) {
    const titleAttr = node.attrs.find((attr: [string, string]) => attr[0] === 'title');
    return titleAttr ? titleAttr[1] : '';
  }
  return '';
};

// 获取链接的href属性
const getHref = (node: any) => {
  if (node.open && node.open.attrs) {
    const hrefAttr = node.open.attrs.find((attr: [string, string]) => attr[0] === 'href');
    return hrefAttr ? hrefAttr[1] : '';
  }
  return '';
};

// 判断是否为标题标签（h1-h6）
const isHeadingTag = (tag: string): boolean => {
  return /^h[1-6]$/.test(tag);
};

const MarkdownRenderer = defineComponent({
  name: 'MarkdownRenderer',
  props: {
    tokenTree: {
      type: Array as PropType<RendererToken[]>,
      default: () => [],
    },
    mdInstance: {
      type: Object as PropType<MarkdownIt>,
      default: () => null,
    },
  },
  setup(props) {
    // 主渲染函数 - 直接生成VNode
    return (): VNode => {
      const vNodes = props.tokenTree
        .map((node, index) => createVNode(node, index, props.mdInstance))
        .filter(Boolean) as (VNode | string)[];

      return h('div', { class: 'markdown-renderer' }, vNodes);
    };
  },
});

export default MarkdownRenderer;
