import prefixSelector from 'postcss-prefix-selector';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

function frameworkScope(prefix: string, file: RegExp) {
  return prefixSelector({
    prefix,
    includeFiles: [file],
    transform(prefix, selector, prefixedSelector) {
      // Framework document defaults belong on the preview wrapper, not the page.
      if (/^(html|body|:root|:host)(?=[\s.#[:]|$)/.test(selector)) {
        return selector.replace(
          /^(html\s+body|:root\s+body|html|body|:root|:host)/,
          prefix,
        );
      }
      if (
        selector === '*' ||
        selector === '::before' ||
        selector === '::after'
      ) {
        return `${prefix}${selector === '*' ? '' : selector}, ${prefixedSelector}`;
      }
      // Bootstrap theme variables must also work when set on the wrapper itself.
      if (selector.startsWith('[data-bs-theme=')) {
        return `${prefix}${selector}, ${prefixedSelector}`;
      }
      return prefixedSelector;
    },
  });
}

export default {
  plugins: [
    tailwindcss(),
    frameworkScope(
      '.bootstrap-preview',
      /playground[\\/]styles[\\/]bootstrap\.css/,
    ),
    frameworkScope(
      '.tailwind-preview',
      /playground[\\/]styles[\\/]tailwind\.css/,
    ),
    autoprefixer(),
  ],
};
