const escaped = {
  '"': '&quot;',
  "'": '&#39;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

const regex_html_characters_to_escape = /["'&<>]/g;

export function escapeHtml(html) {
  return String(html).replace(
    regex_html_characters_to_escape,
    match => escaped[match]
  );
}
