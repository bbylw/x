const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const inputText = $('#input-text');
const fontFamily = $('#font-family');
const fontSize = $('#font-size');
const fontSizeVal = $('#font-size-val');
const lineHeight = $('#line-height');
const lineHeightVal = $('#line-height-val');
const textColor = $('#text-color');
const bgColor = $('#bg-color');
const logoUpload = $('#logo-upload');
const xUsername = $('#x-username');
const generateBtn = $('#generate-btn');
const copyBtn = $('#copy-btn');
const resetBtn = $('#reset-btn');
const exportScale = $('#export-scale');
const exportScaleVal = $('#export-scale-val');
const exportFormat = $('#export-format');
const cardWidth = $('#card-width');
const cardWidthVal = $('#card-width-val');
const contentPadding = $('#content-padding');
const contentPaddingVal = $('#content-padding-val');
const letterSpacing = $('#letter-spacing');
const letterSpacingVal = $('#letter-spacing-val');
const imageDimensions = $('#image-dimensions');
const fullscreenBtn = $('#fullscreen-btn');
const zoomFitBtn = $('#zoom-fit-btn');
const themeToggle = $('#theme-toggle');
const charCount = $('#char-count');
const showWatermark = $('#show-watermark');
const templateGrid = $('#template-grid');
const advancedToggle = $('#advanced-toggle');
const advancedContent = $('#advanced-content');

const captureArea = $('#capture-area');
const contentText = $('#content-text');
const brandLogo = $('#brand-logo');
const brandName = $('#brand-name');
const brandFooter = $('#brand-footer');

let isGenerating = false;

const TEMPLATES = [
  'template-default', 'template-minimal', 'template-code', 'template-letter',
  'template-neon', 'template-magazine', 'template-sticky', 'template-glass',
  'template-terminal', 'template-cyberpunk', 'template-newspaper', 'template-handwritten'
];

const HANDWRITING_FONTS = [
  "'Ma Shan Zheng', cursive",
  "'Long Cang', cursive",
  "'Zhi Mang Xing', cursive",
  "'Liu Jian Mao Cao', cursive",
  "'ZCOOL XiaoWei', cursive"
];

let settings = {
  fontSize: 20,
  lineHeight: 1.7,
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
  textColor: "#111111",
  bgColor: "#ffffff",
  template: "template-default",
  cardWidth: 960,
  contentPadding: 32,
  letterSpacing: 0,
  exportScale: 3,
  exportFormat: "png",
  xUsername: "",
  inputText: "",
  textAlign: "left",
  showWatermark: true,
  theme: "light"
};

function saveSettings() {
  try {
    localStorage.setItem('textCardSettings', JSON.stringify(settings));
  } catch (e) { /* quota exceeded, ignore */ }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('textCardSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings = { ...settings, ...parsed };
      if (!TEMPLATES.includes(settings.template)) {
        settings.template = 'template-default';
      }
    }
  } catch (e) { /* corrupted data, use defaults */ }
}

function applySettingsToUI() {
  fontSize.value = settings.fontSize;
  lineHeight.value = settings.lineHeight;
  fontFamily.value = settings.fontFamily;
  textColor.value = settings.textColor;
  bgColor.value = settings.bgColor;
  cardWidth.value = settings.cardWidth;
  contentPadding.value = settings.contentPadding;
  letterSpacing.value = settings.letterSpacing;
  exportScale.value = settings.exportScale;
  exportFormat.value = settings.exportFormat;
  xUsername.value = settings.xUsername;
  inputText.value = settings.inputText;
  showWatermark.checked = settings.showWatermark;

  setActiveTemplate(settings.template);
  setActiveAlign(settings.textAlign);
  applyTheme(settings.theme);
}

function resetSettings() {
  settings = {
    fontSize: 20,
    lineHeight: 1.7,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
    textColor: "#111111",
    bgColor: "#ffffff",
    template: "template-default",
    cardWidth: 960,
    contentPadding: 32,
    letterSpacing: 0,
    exportScale: 3,
    exportFormat: "png",
    xUsername: "",
    inputText: "",
    textAlign: "left",
    showWatermark: true,
    theme: settings.theme
  };
  applySettingsToUI();
  updatePreview();
  saveSettings();
}

function showNotification(message, type = 'info') {
  const existing = $$('.notification');
  existing.forEach(n => n.remove());

  const el = document.createElement('div');
  el.className = `notification notification-${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add('show');
    });
  });

  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

function updateCharCount() {
  const text = inputText.value;
  const len = text.length;
  charCount.textContent = `${len} 字`;
}

function updateImageDimensions() {
  const width = parseInt(cardWidth.value);
  const scale = parseInt(exportScale.value);
  const areaHeight = captureArea ? captureArea.scrollHeight : Math.round(width * 0.5625);
  const finalWidth = width * scale;
  const finalHeight = areaHeight * scale;
  imageDimensions.textContent = `预计尺寸：${finalWidth} × ${finalHeight}px`;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  settings.theme = theme;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  saveSettings();
}

function setActiveTemplate(templateClass) {
  $$('.template-item').forEach(item => {
    item.classList.toggle('active', item.dataset.template === templateClass);
  });
}

function setActiveAlign(align) {
  $$('.align-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === align);
  });
}

function applyTemplate(templateClass) {
  TEMPLATES.forEach(c => captureArea.classList.remove(c));

  if (templateClass === 'template-blackgold') {
    templateClass = 'template-default';
  }
  if (!TEMPLATES.includes(templateClass)) {
    templateClass = 'template-default';
  }

  captureArea.classList.add(templateClass);
  setActiveTemplate(templateClass);
}

function switchToHandwritingFont() {
  const currentIndex = HANDWRITING_FONTS.indexOf(fontFamily.value);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % HANDWRITING_FONTS.length : 0;
  fontFamily.value = HANDWRITING_FONTS[nextIndex];
}

function updatePreview() {
  const text = inputText.value || '在左侧输入你的内容，右侧将实时更新预览。';
  contentText.textContent = text;

  const family = fontFamily.value;
  contentText.style.fontFamily = family;

  const size = Number(fontSize.value);
  fontSizeVal.textContent = size + 'px';
  contentText.style.fontSize = `${size}px`;

  const lh = Number(lineHeight.value);
  lineHeightVal.textContent = lh.toFixed(2).replace(/0$/, '').replace(/\.$/, '');
  contentText.style.lineHeight = lh;

  const ls = Number(letterSpacing.value);
  letterSpacingVal.textContent = ls.toFixed(2) + 'em';
  contentText.style.letterSpacing = `${ls}em`;

  const tColor = textColor.value;
  const bColor = bgColor.value;
  captureArea.style.color = tColor;
  captureArea.style.backgroundColor = bColor;

  const width = Number(cardWidth.value);
  cardWidthVal.textContent = width + 'px';
  captureArea.style.width = `${width}px`;
  document.documentElement.style.setProperty('--preview-width', `${width}px`);

  const padding = Number(contentPadding.value);
  contentPaddingVal.textContent = padding + 'px';
  document.documentElement.style.setProperty('--preview-padding', `${padding}px`);

  contentText.style.textAlign = settings.textAlign;

  const handle = xUsername.value?.trim();
  if (!handle) {
    brandName.textContent = '';
    brandName.style.display = 'none';
  } else {
    brandName.textContent = handle.startsWith('@') ? handle : `@${handle}`;
    brandName.style.display = 'inline-block';
  }

  brandFooter.style.display = settings.showWatermark ? '' : 'none';

  applyTemplate(settings.template);

  settings.fontSize = size;
  settings.lineHeight = lh;
  settings.letterSpacing = ls;
  settings.fontFamily = family;
  settings.textColor = tColor;
  settings.bgColor = bColor;
  settings.cardWidth = width;
  settings.contentPadding = padding;
  settings.xUsername = handle || '';
  settings.inputText = inputText.value;

  updateCharCount();
  updateImageDimensions();
  saveSettings();
}

function handleLogoUpload(file) {
  if (!file) {
    brandLogo.src = '';
    brandLogo.style.display = 'none';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    brandLogo.src = e.target.result;
    brandLogo.style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}

async function generateImage() {
  if (isGenerating) return;

  try {
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.querySelector('span').textContent = '生成中…';
    document.body.classList.add('generating');

    const scale = Number(exportScale.value) || 3;
    const format = exportFormat.value || 'png';

    const opts = {
      backgroundColor: null,
      scale: Math.min(Math.max(scale, 1), 4),
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: captureArea.scrollWidth,
      windowHeight: captureArea.scrollHeight,
      imageTimeout: 15000
    };

    captureArea.scrollTop = 0;

    const canvas = await html2canvas(captureArea, opts);
    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const quality = format === 'jpeg' ? 0.92 : undefined;
    const dataURL = canvas.toDataURL(mimeType, quality);

    const a = document.createElement('a');
    const time = new Date().toISOString().split('T')[0];
    a.href = dataURL;
    a.download = `textcard-${time}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    showNotification('图片已生成并下载', 'success');
  } catch (error) {
    console.error('Generate failed:', error);
    showNotification('生成失败，请重试', 'error');
  } finally {
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.querySelector('span').textContent = '生成图片并下载';
    document.body.classList.remove('generating');
  }
}

async function copyImageToClipboard() {
  if (isGenerating) return;

  if (!navigator.clipboard || !navigator.clipboard.write) {
    showNotification('当前浏览器不支持复制到剪贴板', 'error');
    return;
  }

  try {
    isGenerating = true;
    copyBtn.disabled = true;
    copyBtn.querySelector('span').textContent = '复制中…';

    const scale = Number(exportScale.value) || 3;
    const opts = {
      backgroundColor: null,
      scale: Math.min(Math.max(scale, 1), 4),
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: captureArea.scrollWidth,
      windowHeight: captureArea.scrollHeight
    };

    captureArea.scrollTop = 0;
    const canvas = await html2canvas(captureArea, opts);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    showNotification('已复制到剪贴板', 'success');
  } catch (error) {
    console.error('Copy failed:', error);
    showNotification('复制失败，请重试', 'error');
  } finally {
    isGenerating = false;
    copyBtn.disabled = false;
    copyBtn.querySelector('span').textContent = '复制到剪贴板';
  }
}

let debounceTimer = null;
function debouncedUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updatePreview, 60);
}

['input', 'change'].forEach(evt => {
  inputText.addEventListener(evt, debouncedUpdate);
  fontFamily.addEventListener(evt, updatePreview);
  fontSize.addEventListener(evt, updatePreview);
  lineHeight.addEventListener(evt, updatePreview);
  letterSpacing.addEventListener(evt, updatePreview);
  textColor.addEventListener(evt, updatePreview);
  bgColor.addEventListener(evt, updatePreview);
  xUsername.addEventListener(evt, updatePreview);
  cardWidth.addEventListener(evt, updatePreview);
  contentPadding.addEventListener(evt, updatePreview);
});

showWatermark.addEventListener('change', () => {
  settings.showWatermark = showWatermark.checked;
  updatePreview();
});

templateGrid.addEventListener('click', (e) => {
  const item = e.target.closest('.template-item');
  if (!item) return;
  const tmpl = item.dataset.template;

  if (tmpl === 'template-handwritten') {
    switchToHandwritingFont();
  }

  settings.template = tmpl;
  applyTemplate(tmpl);
  updatePreview();
});

$$('.align-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    settings.textAlign = btn.dataset.align;
    setActiveAlign(btn.dataset.align);
    updatePreview();
  });
});

logoUpload.addEventListener('change', (e) => {
  handleLogoUpload(e.target.files?.[0]);
});

inputText.addEventListener('dragover', (e) => {
  e.preventDefault();
  inputText.classList.add('drag-over');
});
inputText.addEventListener('dragleave', () => {
  inputText.classList.remove('drag-over');
});
inputText.addEventListener('drop', (e) => {
  e.preventDefault();
  inputText.classList.remove('drag-over');
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith('text/')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      inputText.value = ev.target.result;
      updatePreview();
    };
    reader.readAsText(file);
  }
});

exportScale.addEventListener('input', () => {
  exportScaleVal.textContent = exportScale.value + 'x';
  settings.exportScale = Number(exportScale.value);
  updateImageDimensions();
  saveSettings();
});

exportFormat.addEventListener('change', () => {
  settings.exportFormat = exportFormat.value;
  saveSettings();
});

generateBtn.addEventListener('click', () => {
  updatePreview();
  generateImage();
});

copyBtn.addEventListener('click', () => {
  updatePreview();
  copyImageToClipboard();
});

resetBtn.addEventListener('click', () => {
  if (confirm('确定要重置所有设置吗？')) {
    resetSettings();
    showNotification('已重置', 'info');
  }
});

themeToggle.addEventListener('click', toggleTheme);

advancedToggle.addEventListener('click', () => {
  const section = advancedToggle.closest('.collapsible');
  section.classList.toggle('collapsed');
});

fullscreenBtn.addEventListener('click', () => {
  const previewCard = $('.preview-card');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    previewCard.requestFullscreen().catch(() => {
      showNotification('全屏功能不可用', 'error');
    });
  }
});

zoomFitBtn.addEventListener('click', () => {
  const container = $('.container');
  const isHidden = container.style.gridTemplateColumns === '1fr';
  container.style.gridTemplateColumns = isHidden ? '380px 1fr' : '1fr';
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 's':
        e.preventDefault();
        generateImage();
        break;
      case 'c':
        if (e.shiftKey) {
          e.preventDefault();
          copyImageToClipboard();
        }
        break;
      case 'r':
        if (e.shiftKey) {
          e.preventDefault();
          resetSettings();
        }
        break;
      case 'f':
        if (e.shiftKey) {
          e.preventDefault();
          fullscreenBtn.click();
        }
        break;
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettingsToUI();
  exportScaleVal.textContent = exportScale.value + 'x';
  updatePreview();
  updateImageDimensions();
});
