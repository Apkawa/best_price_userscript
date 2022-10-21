export function GM_addStyle(css: string): void {
  const style =
    (document.getElementById('GM_addStyleBy8626') as HTMLStyleElement) ||
    (function (): HTMLStyleElement {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'GM_addStyleBy8626';
      document.head.appendChild(style);
      return style;
    })();
  const sheet = style.sheet;
  sheet?.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}
