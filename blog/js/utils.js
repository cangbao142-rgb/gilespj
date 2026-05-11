// ========== 工具模块 ==========

const Utils = {
  // Toast 提示
  toast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },

  // 确认对话框
  confirm(message) {
    return window.confirm(message);
  },

  // 获取 URL 参数
  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  // 渲染分页
  renderPagination(container, { total, page, pageSize, onChange }) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    html += `<button ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">上一页</button>`;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === page - 3 || i === page + 3) {
        html += `<button disabled>...</button>`;
      }
    }

    html += `<button ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">下一页</button>`;

    container.innerHTML = html;
    container.querySelectorAll('button:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (p && p !== page) onChange(p);
      });
    });
  },

  // 简易 HTML 编辑器工具栏
  createEditorToolbar(textarea) {
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:4px;padding:8px;background:#fafafa;border:1px solid #e8e8e8;border-bottom:none;border-radius:6px 6px 0 0;flex-wrap:wrap;';

    const buttons = [
      { label: 'B', title: '加粗', action: () => wrapText(textarea, '<b>', '</b>') },
      { label: 'I', title: '斜体', action: () => wrapText(textarea, '<i>', '</i>') },
      { label: 'H2', title: '标题2', action: () => wrapText(textarea, '<h2>', '</h2>') },
      { label: 'H3', title: '标题3', action: () => wrapText(textarea, '<h3>', '</h3>') },
      { label: 'P', title: '段落', action: () => wrapText(textarea, '<p>', '</p>') },
      { label: '图片', title: '插入图片', action: () => insertImage(textarea) },
      { label: '链接', title: '插入链接', action: () => insertLink(textarea) },
      { label: '列表', title: '无序列表', action: () => wrapText(textarea, '<ul>\n<li>', '</li>\n</ul>') },
    ];

    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b.label;
      btn.title = b.title;
      btn.style.cssText = 'padding:4px 10px;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;font-size:13px;';
      btn.addEventListener('click', b.action);
      toolbar.appendChild(btn);
    });

    textarea.parentNode.insertBefore(toolbar, textarea);
    textarea.style.borderRadius = '0 0 6px 6px';

    function wrapText(el, before, after) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = el.value.substring(start, end);
      el.value = el.value.substring(0, start) + before + selected + after + el.value.substring(end);
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    }

    async function insertImage(el) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        try {
          Utils.toast('上传中...', 'warning');
          const url = await Articles.uploadImage(file);
          const imgHtml = `<img src="${url}" alt="图片" style="max-width:100%;">`;
          const pos = el.selectionStart;
          el.value = el.value.substring(0, pos) + imgHtml + el.value.substring(pos);
          Utils.toast('图片上传成功');
        } catch (err) {
          Utils.toast('图片上传失败: ' + err.message, 'error');
        }
      };
      input.click();
    }

    function insertLink(el) {
      const url = prompt('请输入链接地址:');
      if (!url) return;
      const text = el.value.substring(el.selectionStart, el.selectionEnd) || '链接文字';
      const linkHtml = `<a href="${url}" target="_blank">${text}</a>`;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.value = el.value.substring(0, start) + linkHtml + el.value.substring(end);
      el.focus();
    }
  },

  // 初始化导航栏
  initNav() {
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('show');
      });
    }

    // 高亮当前页
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }
};
