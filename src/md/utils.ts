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

export // 支持的语言数组（基于highlight.js的SUPPORTED_LANGUAGES.md整理）
const SUPPORTED_LANGUAGES = [
  // 基础语言及常用语言
  'plaintext',
  'txt',
  'text',
  'markdown',
  'md',
  'mkdown',
  'mkd',
  'xml',
  'html',
  'xhtml',
  'rss',
  'atom',
  'xjb',
  'xsd',
  'xsl',
  'plist',
  'svg',
  'css',
  'scss',
  'less',
  'javascript',
  'js',
  'jsx',
  'typescript',
  'ts',
  'tsx',
  'mts',
  'cts',
  'java',
  'python',
  'py',
  'gyp',
  'python-repl',
  'pycon',
  'ruby',
  'rb',
  'gemspec',
  'podspec',
  'thor',
  'irb',
  'php',
  'c',
  'cpp',
  'c++',
  'c#',
  'cs',
  'go',
  'golang',
  'rust',
  'rs',
  'swift',
  'kotlin',
  'scala',
  'perl',
  'pl',
  'pm',
  'perl6',
  'raku',
  'r',
  'matlab',
  'octave',

  // 标记语言及文档格式
  'markdown',
  'md',
  'mkdown',
  'mkd',
  'asciidoc',
  'adoc',
  'latex',
  'tex',
  'bibtex',
  'rst',
  'restructuredtext',

  // 脚本及配置文件
  'bash',
  'sh',
  'shell',
  'console',
  'batch',
  'bat',
  'powershell',
  'ps',
  'ps1',
  'json',
  'json5',
  'jsonc',
  'yaml',
  'yml',
  'toml',
  'ini',
  'properties',

  // 框架及库相关
  'react',
  'vue',
  'svelte',
  'angular',
  'ember',
  'hbs',
  'glimmer',
  'html.hbs',
  'html.handlebars',
  'htmlbars',

  // 数据库相关
  'sql',
  'mysql',
  'postgresql',
  'pgsql',
  'postgres',
  'sqlite',
  'tsql',
  'plsql',

  // 其他语言
  'clojure',
  'clj',
  'elixir',
  'elm',
  'erlang',
  'erl',
  'fsharp',
  'fs',
  'fsx',
  'fsi',
  'fsscript',
  'haskell',
  'hs',
  'lua',
  'pluto',
  'luau',
  'ocaml',
  'ml',
  'pascal',
  'pawn',
  'php',
  'prolog',
  'scala',
  'scheme',
  'smalltalk',
  'st',
  'solidity',
  'sol',
  'swift',
  'tcl',
  'tk',
  'vb',
  'visual-basic',
  'dart',
  'go',
  'groovy',
  'kotlin',
  'nim',
  'rust',
  'scala',
  'swift',
  'zig',
];

export const isImageNode = (vnode: VNode): boolean => {
  return !!(vnode.props && vnode.props['data-type'] === 'image');
};

export const getImageInfo = (vnode: VNode) => {
  if (!vnode.props) return null;

  return {
    src: vnode.props['data-src'] as string,
    alt: vnode.props['data-alt'] as string,
    title: vnode.props['data-title'] as string,
  };
};
