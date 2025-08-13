// src/utils.ts
import type { ExtendedToken, TagToken, FenceInfo } from './types'; // 导入所需类型
import type { VNode } from 'vue';
import { escape, unescape } from 'es-toolkit/string';
/**
 * 通用属性获取函数
 * @param node 节点对象
 * @param attrName 要获取的属性名
 * @param fromOpen 是否从open标签获取属性
 * @returns 属性值或空字符串
 */
export const getAttribute = (
  node: ExtendedToken | TagToken,
  attrName: string,
  fromOpen?: boolean,
): string => {
  const attrs = fromOpen ? (node as TagToken).open?.attrs : (node as ExtendedToken).attrs;

  if (attrs) {
    const attr = attrs.find(([name]: [string, string]) => name === attrName);
    return attr?.[1] || '';
  }
  return '';
};

/**
 * 获取a标签属性
 * @param node 标签节点
 * @param attrName 要获取的属性名
 * @returns 属性值或空字符串
 */
export const getAAttr = (node: TagToken, attrName: string) => {
  if (node.open && node.open.attrs) {
    const hrefAttr = node.open.attrs.find((attr: [string, string]) => attr[0] === attrName);
    return hrefAttr ? hrefAttr[1] : '';
  }
  return '';
};

export const escapeHtml = (str: string): string => {
  return escape(str);
};

export const unescapeHtml = (str: string): string => {
  return unescape(str);
};

export const isFenceNode = (vnode: VNode): boolean => {
  return vnode.props?.class?.includes('markdown-code-block') ?? false;
};

export const getFenceInfo = (vnode: VNode): FenceInfo => {
  const props = vnode.props || {};
  return {
    lang: props['data-lang'] as string,
    rawCode: unescapeHtml(props['data-raw-code'] as string),
  };
};

export const stripOuterPTag = (html: string): string => {
  let processed = html.replace(/^<p\b[^>]*>/i, '');
  processed = processed.replace(/<\/p\s*>$/i, '');
  return processed.trim();
};
