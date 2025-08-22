import type { Token } from 'markdown-it';
import MarkdownIt from 'markdown-it';

/**
 * 扩展的Token类型，增加组件类型标识
 */
export interface ExtendedToken extends Token {
  ComponentType?: string;
}

/**
 * 标签类型的Token，包含开闭标签和子节点
 */
export interface TagToken {
  tag: string;
  open: ExtendedToken;
  close?: ExtendedToken;
  children: RendererToken[];
  ComponentType: string;
  content?: string;
}

/**
 * 渲染器可用的Token类型（联合类型）
 */
export type RendererToken = ExtendedToken | TagToken;

/**
 * 代码块信息类型（供插槽使用）
 */
export interface FenceInfo {
  lang: string;
  rawCode: string;
}

/**
 * Markdown渲染器组件的属性类型
 */
export interface MarkdownRendererProps {
  content?: string;
  mdIt?: MarkdownIt;
  breaks?: boolean;
  html?: boolean;
  href?: boolean;
}

/**
 * Markdown渲染器的事件类型
 */
export interface MarkdownRendererEmits {
  (e: 'link-click', href: string | undefined, title: string | undefined): void;
}
