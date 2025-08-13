import { h, defineComponent, type PropType, type VNode, type Slots } from 'vue';
import MarkdownIt, { type Options } from 'markdown-it';
import { katex } from '@mdit/plugin-katex';
import { full as emoji } from 'markdown-it-emoji';
import { getCompontentTree } from './tokens-to-tree';
import createVNode from './createVNode';
import { isFenceNode, getFenceInfo } from './utils';

const MarkdownRenderer = defineComponent({
  name: 'MarkdownRenderer',
  emit: ['link-click'],
  props: {
    content: {
      type: String,
      default: '',
    },
    mdIt: {
      type: Object as PropType<MarkdownIt>,
      default: () => null,
      required: false,
    },
    breaks: {
      type: Boolean,
      default: true,
      required: false,
    },
    html: {
      type: Boolean,
      default: true,
      required: false,
    },
    href: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  setup(props, { emit, slots }) {
    return (): VNode => {
      const mdIt = props.mdIt || getMarkdownItInstance({ breaks: props.breaks, html: props.html });
      const tree = getCompontentTree(props.content, mdIt);

      const vNodes = tree.map((node, index) => {
        return getSlotCodeVnode(createVNode(node, index, mdIt), slots);
      });

      return h(
        'div',
        {
          class: 'markdown',
          onClick: (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A') {
              const anchor = target as HTMLAnchorElement;
              emit('link-click', anchor.dataset.href, anchor.title);
            }
          },
        },
        vNodes,
      );
    };
  },
});

const getSlotCodeVnode = (vnode: VNode | string | null, slots: Slots) => {
  if (typeof vnode !== 'string' && vnode && isFenceNode(vnode)) {
    const { lang, rawCode } = getFenceInfo(vnode);

    // 1. 优先使用命名插槽（如#mermaid、#javascript）
    const namedSlot = slots[lang];

    if (namedSlot) {
      return namedSlot({ lang, rawCode });
    }
    // 2. 其次使用默认代码块插槽（#code）
    const codeSlot = slots.code;
    if (codeSlot) {
      return codeSlot({ lang, rawCode });
    }
    // 3. 最后使用默认渲染（高亮代码）
    return vnode;
  }
  return vnode;
};

const getMarkdownItInstance = (options: Options) => {
  const markdownParser = MarkdownIt({
    ...options,
  })
    .use(katex)
    .use(emoji);
  return markdownParser;
};
export default MarkdownRenderer;
