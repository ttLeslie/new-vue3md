import { h, type VNode, Fragment } from 'vue';
import type { RendererToken, ExtendedToken, TagToken } from './types';
import { escapeHtml, stripOuterPTag, getAttribute, getAAttr } from './utils';
import MarkdownIt from 'markdown-it';

// 处理子节点的通用函数
const processChildren = (children: RendererToken[], mdIt: MarkdownIt): (VNode | string)[] => {
  return children.map((child, index) => createVNode(child, index, mdIt)).filter(Boolean) as (
    | VNode
    | string
  )[];
};

// 处理fence类型节点
const handleFenceNode = (node: RendererToken, index: number, ComponentType: string) => {
  // 1. 提取语言（如"fence:javascript" -> "javascript"，默认"plaintext"）
  const lang = ComponentType.split(':')[1] || 'plaintext';
  // 2. 提取代码内容（注意转义原始内容，避免XSS）
  const rawCode = (node as ExtendedToken).content || '';
  const escapedCode = escapeHtml(rawCode); // 使用已有escapeHtml函数转义

  // 4. 返回一个包含代码块信息的VNode，供插槽使用
  return h(
    'div',
    {
      key: index,
      class: `markdown-code-block language-${lang}`, // 方便全局样式控制
      // 存储核心信息（供插槽消费）
      'data-lang': lang,
      'data-raw-code': escapedCode,
    },
    // 默认内容（未使用插槽时展示高亮代码）
    h('pre', { class: '' }, [h('code', rawCode)]),
  );
};

export default function createVNode(
  node: RendererToken,
  index: number,
  mdIt: MarkdownIt,
): VNode | string | null {
  const { ComponentType } = node;

  if (!ComponentType) return null;

  if (ComponentType.startsWith('fence:')) {
    return handleFenceNode(node, index, ComponentType);
  }

  switch (ComponentType) {
    case 'text':
      return (node as ExtendedToken).content || '';

    case 'emoji':
      return (node as ExtendedToken).content || '';

    case 'softbreak':
      return h('br', { key: index });

    case 'inline': {
      const children = processChildren((node as any).children, mdIt);
      return h(Fragment, { key: index }, children);
    }

    case 'image': {
      const imgNode = node as ExtendedToken;
      return h('img', {
        key: index,
        class: 'markdown-image',
        src: getAttribute(imgNode, 'src'),
        alt: getAttribute(imgNode, 'alt'),
        title: getAttribute(imgNode, 'title'),
      });
    }

    case 'html_block':
      return h('div', { key: index, innerHTML: (node as ExtendedToken).content || '' });

    case 'code_inline':
      return h('code', {
        key: index,
        class: 'code-inline',
        innerHTML: escapeHtml((node as ExtendedToken).content || ''),
      });

    case 'math_inline':
      const formula = (node as ExtendedToken).content || '';

      const html = mdIt.render(
        `${(node as ExtendedToken).markup}${formula}${(node as ExtendedToken).markup}`,
      );

      return h('span', {
        key: index,
        class: 'math-inline', // 行内公式样式类
        innerHTML: stripOuterPTag(html), // 插入渲染后的公式 HTML
      });

    case 'math_block':
      const blockFormula = (node as ExtendedToken).content || '';
      const blockHtml = mdIt.render(
        `${(node as ExtendedToken).markup}${blockFormula}${(node as ExtendedToken).markup}`,
      );
      return h('div', {
        key: index,
        class: 'math-block', // 块级公式样式类
        innerHTML: blockHtml, // 插入渲染后的公式 HTML
      });

    case 'default': {
      // 处理默认标签节点
      const tagNode = node as TagToken;
      const { tag, children } = tagNode;
      const childNodes = processChildren(children, mdIt);
      const baseProps: Record<string, string | number> = { key: index };

      baseProps.class = `markdown-${tag}`;

      if (tag === 'a') {
        baseProps.href = 'javascript:void(0)';
        baseProps.title = getAAttr(tagNode, 'title');
        baseProps['data-href'] = getAAttr(tagNode, 'href');
      }

      return h(tag, baseProps, childNodes);
    }

    default:
      return null;
  }
}
