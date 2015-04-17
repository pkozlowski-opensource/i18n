import * as stringUtils from './stringUtils';

function escapeHtmlAttributePart(value) {
  return value.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
}

export function quoteHtmlAttribute(value) {
  return stringUtils.quoteString(escapeHtmlAttributePart(value), '&quot;');
}
