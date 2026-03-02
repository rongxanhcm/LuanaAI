/* ========================================
   UI FUNCTIONS
   ======================================== */

// ─── CHARACTER COUNTERS ─────────────────────────────────
function setupCharacterCounters() {
  const textareas = [
    { id: 'topic', countId: 'topic-count', maxLength: 300 },
    { id: 'description', countId: 'description-count', maxLength: 1000 },
    { id: 'structure', countId: 'structure-count', maxLength: 2000 }
  ];

  textareas.forEach(({ id, countId, maxLength }) => {
    const el = document.getElementById(id);
    const counter = document.getElementById(countId);
    if (!el || !counter) return;

    const updateCount = () => {
      const len = el.value.length;
      counter.textContent = len;
      const field = el.closest('.field');
      const counterEl = counter.parentElement;

      if (len > maxLength * 0.85) {
        field?.classList.add('warning');
        counterEl.classList.add('warning');
      } else {
        field?.classList.remove('warning');
        counterEl.classList.remove('warning');
      }
    };

    el.addEventListener('input', updateCount);
    updateCount();
  });
}

// ─── STRUCTURE PREVIEW ───────────────────────────────────
function updateStructurePreview(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const preview = document.getElementById('structure-preview');
  const items = document.getElementById('structure-items');
  if (!lines.length) { preview.style.display = 'none'; return; }

  preview.style.display = 'block';
  const displayLines = lines.slice(0, 30);
  const hasMore = lines.length > 30;

  items.innerHTML = displayLines.map(line => {
    const isChapter = /^(chương|mở đầu|kết luận|phần|\d+\.?\s+[A-ZÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ])/i.test(line.trim());
    const indent = line.match(/^(\s+)/)?.[1]?.length || 0;
    return `<div class="struct-item ${isChapter && indent === 0 ? 'chapter' : ''}" style="padding-left:${Math.min(indent * 8, 32)}px">
      <div class="dot"></div>
      <span>${line.trim()}</span>
    </div>`;
  }).join('') + (hasMore ? `<div class="struct-item" style="color:var(--text3);font-size:11px;margin-top:8px;">... và ${lines.length - 30} mục khác</div>` : '');
}

// ─── PRESET BUTTONS ──────────────────────────────────────
function setupPresetButtons() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = PRESETS[btn.dataset.preset];
      if (p) {
        document.getElementById('fontName').value = p.font;
        document.getElementById('fontSize').value = p.size;
        document.getElementById('marginLeft').value = p.left;
        document.getElementById('marginRight').value = p.right;
        document.getElementById('marginTop').value = p.top;
        document.getElementById('marginBottom').value = p.bottom;
        document.getElementById('lineSpacing').value = p.spacing;
        document.getElementById('spacingAfter').value = p.spAfter;
      }
    });
  });
}

// ─── STEP PROGRESS ───────────────────────────────────────
async function stepProgress(step, msg) {
  const progressPercent = [25, 50, 75, 100];
  const percent = progressPercent[step - 1] || 0;

  const progressBar = document.getElementById('progress-bar');
  const progressPercentEl = document.getElementById('progress-percent');
  if (progressBar) {
    progressBar.style.width = percent + '%';
  }
  if (progressPercentEl) {
    progressPercentEl.textContent = percent + '%';
  }

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step-${i}`);
    if (i < step) {
      el.className = 'progress-step done';
      el.querySelector('.step-icon').textContent = '✓';
    } else if (i === step) {
      el.className = 'progress-step active';
      el.querySelector('.step-icon').textContent = '◉';
    } else {
      el.className = 'progress-step';
      el.querySelector('.step-icon').textContent = '○';
    }
  }
  document.getElementById('progress-sub').textContent = msg;
  await new Promise(r => setTimeout(r, step < 3 ? 300 : 200));
}

// ─── SHOW RESULT ─────────────────────────────────────────
function showResult(content, fmt) {
  document.getElementById('progress-section').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';

  document.getElementById('result-title').textContent = '📄 ' + (content.title || 'Tài liệu đã sẵn sàng!');
  document.getElementById('result-sub').textContent =
    `Font ${fmt.fontName} ${fmt.fontSize}pt · Lề T${fmt.marginLeft}/P${fmt.marginRight} · Giãn dòng ${fmt.lineSpacing}`;

  const preview = document.getElementById('preview-box');
  const previewSections = (content.sections || []).slice(0, 8);
  preview.innerHTML = previewSections.map(s => `
    <div class="preview-section-title" style="padding-left:${(s.level-1)*16}px">${s.heading}</div>
    ${s.content ? `<div class="preview-section-content" style="padding-left:${(s.level-1)*16}px">${s.content.substring(0,200)}${s.content.length > 200 ? '...' : ''}</div>` : ''}
  `).join('') + (content.sections?.length > 8 ? `<div class="preview-section-content" style="margin-top:8px;color:var(--text3);">... và ${content.sections.length - 8} mục khác</div>` : '');
}
