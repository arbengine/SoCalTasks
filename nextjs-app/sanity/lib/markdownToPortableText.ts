import { marked } from 'marked';

export function convertMarkdownToPortableText(markdown: string) {
  const html = marked(markdown);
  return [{
    _type: 'block',
    children: [{
      _type: 'span',
      text: html
    }],
    markDefs: [],
    style: 'normal'
  }];
}