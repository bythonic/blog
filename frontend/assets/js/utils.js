const UTILS = {
  formatDate(ds) {
    if (!ds) return '';
    return new Date(ds).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).replace(/\.\s*/g, '.').replace(/\.$/, '');
  },

  param(name) {
    return new URLSearchParams(location.search).get(name);
  },

  slugify(str) {
    const ascii = str.replace(/[^\x00-\x7F]/g, '').trim();
    if (!ascii) return `post-${Date.now()}`;
    return ascii.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-|-$/g, '')
      || `post-${Date.now()}`;
  },

  uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  },

  // UTF-8 안전 base64 인코딩
  b64Encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  },

  // UTF-8 안전 base64 디코딩
  b64Decode(str) {
    return decodeURIComponent(
      Array.from(atob(str.replace(/\n/g, '')),
        c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
      ).join('')
    );
  },

  escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  msg(id, text, type = 'error') {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div class="${type}-msg">${text}</div>`;
  },
};
