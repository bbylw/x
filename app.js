// 统一获取元素
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// 控件
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
const templateSel = $('#template');
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
const imageDimensions = $('#image-dimensions');
const fullscreenBtn = $('#fullscreen-btn');
const zoomFitBtn = $('#zoom-fit-btn');

// 预览区域
const captureArea = $('#capture-area');
const contentText = $('#content-text');
const brandLogo = $('#brand-logo');
const brandName = $('#brand-name');
let brandNameVisible = true; // 控制是否显示用户名

// 应用状态
let isGenerating = false;
let settings = {
  fontSize: 20,
  lineHeight: 1.7,
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, Arial, sans-serif",
  textColor: "#111111",
  bgColor: "#ffffff",
  template: "template-default",
  cardWidth: 960,
  contentPadding: 32,
  exportScale: 3,
  exportFormat: "png",
  xUsername: "",
  inputText: ""
};

// 本地存储相关函数
function saveSettings() {
  localStorage.setItem('textToImageSettings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem('textToImageSettings');
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
    applySettingsToUI();
  }
}

function applySettingsToUI() {
  fontSize.value = settings.fontSize;
  lineHeight.value = settings.lineHeight;
  fontFamily.value = settings.fontFamily;
  textColor.value = settings.textColor;
  bgColor.value = settings.bgColor;
  templateSel.value = settings.template;
  cardWidth.value = settings.cardWidth;
  contentPadding.value = settings.contentPadding;
  exportScale.value = settings.exportScale;
  exportFormat.value = settings.exportFormat;
  xUsername.value = settings.xUsername;
  inputText.value = settings.inputText;
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
    exportScale: 3,
    exportFormat: "png",
    xUsername: "",
    inputText: ""
  };
  applySettingsToUI();
  updatePreview();
  saveSettings();
}

// 显示通知
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    ${type === 'success' ? 'background: var(--success);' : ''}
    ${type === 'error' ? 'background: var(--danger);' : ''}
    ${type === 'info' ? 'background: var(--primary);' : ''}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// 更新图片尺寸显示
function updateImageDimensions() {
  const width = parseInt(cardWidth.value);
  const scale = parseInt(exportScale.value);
  const height = Math.round(width * 0.5625); // 16:9 比例的粗略估算
  const finalWidth = width * scale;
  const finalHeight = height * scale;
  imageDimensions.textContent = `预计尺寸：${finalWidth} × ${finalHeight}px`;
}
// 将当前 UI 状态同步到预览
function updatePreview() {
  // 文本内容
  const text = inputText.value || '在左侧输入你的内容，右侧将实时更新预览。';
  contentText.textContent = text;

  // 字体系列
  const family = fontFamily.value;
  captureArea.style.setProperty('font-family', family);
  contentText.style.setProperty('font-family', family);

  // 字号
  const size = Number(fontSize.value);
  fontSizeVal.textContent = size + 'px';
  contentText.style.fontSize = `${size}px`;

  // 行高
  const lh = Number(lineHeight.value);
  lineHeightVal.textContent = lh.toFixed(2).replace(/\.00$/, '');
  contentText.style.lineHeight = lh;

  // 颜色
  const tColor = textColor.value;
  const bColor = bgColor.value;
  captureArea.style.color = tColor;
  captureArea.style.backgroundColor = bColor;

  // 卡片宽度
  const width = Number(cardWidth.value);
  cardWidthVal.textContent = width + 'px';
  captureArea.style.width = `${width}px`;
  document.documentElement.style.setProperty('--preview-width', `${width}px`);

  // 内边距
  const padding = Number(contentPadding.value);
  contentPaddingVal.textContent = padding + 'px';
  document.documentElement.style.setProperty('--preview-padding', `${padding}px`);

  // 用户名（可选显示）
  const handle = xUsername.value?.trim();
  if (!handle) {
    brandName.textContent = '';
    brandName.style.display = 'none';
    brandNameVisible = false;
  } else {
    brandName.textContent = handle.startsWith('@') ? handle : `@${handle}`;
    brandName.style.display = 'inline-block';
    brandNameVisible = true;
  }

  // 模板：通过类名控制
  applyTemplate(templateSel.value);
  
  // 更新设置对象
  settings.fontSize = size;
  settings.lineHeight = lh;
  settings.fontFamily = family;
  settings.textColor = tColor;
  settings.bgColor = bColor;
  settings.cardWidth = width;
  settings.contentPadding = padding;
  settings.template = templateSel.value;
  settings.xUsername = handle;
  settings.inputText = text;
  
  // 更新尺寸显示
  updateImageDimensions();
  
  // 保存设置
  saveSettings();
}

// 应用模板（确保只有一个模板类存在）
function applyTemplate(templateClass) {
  const templates = [
    'template-default', 
    'template-code', 
    'template-letter', 
    'template-neon', 
    'template-magazine', 
    'template-sticky',
    'template-glass',
    'template-terminal'
  ];
  templates.forEach(c => captureArea.classList.remove(c));
  
  // 若仍旧从存量数据加载到黑金模板，则回退到默认模板
  if (templateClass === 'template-blackgold') {
    templateClass = 'template-default';
  }
  
  captureArea.classList.add(templateClass);
}

// 处理 Logo 上传
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

// 生成图片并下载
async function generateImage() {
  if (isGenerating) return;
  
  try {
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>🔄 生成中...</span>';
    document.body.classList.add('generating');

    // 读取导出倍率和格式
    const scale = Number(exportScale.value) || 3;
    const format = exportFormat.value || 'png';

    // html2canvas 配置
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

    // 滚动到顶部避免滚动条截断
    captureArea.scrollTop = 0;

    // 生成
    const canvas = await html2canvas(captureArea, opts);
    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const quality = format === 'jpeg' ? 0.9 : undefined;
    const dataURL = canvas.toDataURL(mimeType, quality);

    // 触发下载
    const a = document.createElement('a');
    const time = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const templateName = templateSel.options[templateSel.selectedIndex].text;
    a.href = dataURL;
    a.download = `share-image-${templateName}-${time}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    showNotification('图片生成成功！', 'success');
  } catch (error) {
    console.error('生成图片失败:', error);
    showNotification('生成图片失败，请重试', 'error');
  } finally {
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>🖼️ 生成图片并下载</span>';
    document.body.classList.remove('generating');
  }
}

// 复制图片到剪贴板
async function copyImageToClipboard() {
  if (isGenerating) return;
  
  if (!navigator.clipboard || !navigator.clipboard.write) {
    showNotification('当前浏览器不支持复制到剪贴板', 'error');
    return;
  }
  
  try {
    isGenerating = true;
    copyBtn.disabled = true;
    copyBtn.innerHTML = '<span>🔄 复制中...</span>';

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
    
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showNotification('图片已复制到剪贴板！', 'success');
      } catch (error) {
        console.error('复制失败:', error);
        showNotification('复制失败，请重试', 'error');
      } finally {
        isGenerating = false;
        copyBtn.disabled = false;
        copyBtn.innerHTML = '<span>📋 复制到剪贴板</span>';
      }
    }, 'image/png');
  } catch (error) {
    console.error('生成图片失败:', error);
    showNotification('复制失败，请重试', 'error');
    isGenerating = false;
    copyBtn.disabled = false;
    copyBtn.innerHTML = '<span>📋 复制到剪贴板</span>';
  }
}

// 事件绑定（实时更新）
['input', 'change'].forEach(evt => {
  inputText.addEventListener(evt, updatePreview);
  fontFamily.addEventListener(evt, updatePreview);
  fontSize.addEventListener(evt, updatePreview);
  lineHeight.addEventListener(evt, updatePreview);
  textColor.addEventListener(evt, updatePreview);
  bgColor.addEventListener(evt, updatePreview);
  xUsername.addEventListener(evt, updatePreview);
  cardWidth.addEventListener(evt, updatePreview);
  contentPadding.addEventListener(evt, updatePreview);
  templateSel.addEventListener(evt, () => {
    applyTemplate(templateSel.value);
    updatePreview();
  });
});

logoUpload.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  handleLogoUpload(file);
});

// 导出相关事件
exportScale.addEventListener('input', () => {
  exportScaleVal.textContent = String(exportScale.value) + 'x';
  settings.exportScale = Number(exportScale.value);
  updateImageDimensions();
  saveSettings();
});

exportFormat.addEventListener('change', () => {
  settings.exportFormat = exportFormat.value;
  saveSettings();
});

// 按钮事件
generateBtn.addEventListener('click', () => {
  updatePreview();
  generateImage();
});

copyBtn.addEventListener('click', () => {
  updatePreview();
  copyImageToClipboard();
});

resetBtn.addEventListener('click', () => {
  if (confirm('确定要重置所有设置吗？这将清除当前的所有配置。')) {
    resetSettings();
    showNotification('设置已重置', 'info');
  }
});

// 全屏预览功能
fullscreenBtn.addEventListener('click', () => {
  const previewCard = $('.preview-card');
  if (document.fullscreenElement) {
    document.exitFullscreen();
    fullscreenBtn.innerHTML = '<span>⛶</span>';
    fullscreenBtn.title = '全屏预览';
  } else {
    previewCard.requestFullscreen().then(() => {
      fullscreenBtn.innerHTML = '<span>⛷</span>';
      fullscreenBtn.title = '退出全屏';
    }).catch(() => {
      showNotification('全屏功能不可用', 'error');
    });
  }
});

// 适应窗口功能
zoomFitBtn.addEventListener('click', () => {
  const container = $('.container');
  const currentCols = container.style.gridTemplateColumns;
  
  if (currentCols === '1fr') {
    container.style.gridTemplateColumns = '380px 1fr';
    zoomFitBtn.innerHTML = '<span>⊞</span>';
    zoomFitBtn.title = '适应窗口';
  } else {
    container.style.gridTemplateColumns = '1fr';
    zoomFitBtn.innerHTML = '<span>⊡</span>';
    zoomFitBtn.title = '显示侧边栏';
  }
});

// 键盘快捷键
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

// 初始化默认状态
window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  exportScaleVal.textContent = String(exportScale.value) + 'x';
  updatePreview();
  updateImageDimensions();
  
  // 显示快捷键提示
  setTimeout(() => {
    showNotification('快捷键：Ctrl+S 生成图片，Ctrl+Shift+C 复制，Ctrl+Shift+R 重置', 'info');
  }, 1000);
});