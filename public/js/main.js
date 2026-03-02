/* ========================================
   MAIN APPLICATION LOGIC
   ======================================== */

// ─── STATE ───────────────────────────────────────────────
let generatedDoc = null;
let generatedFilename = 'tai-lieu.docx';
let logoBase64 = null;
let logoMimeType = null;
let readmeContent = null;

// Make them globally accessible for upload handlers
window.logoBase64 = null;
window.logoMimeType = null;
window.readmeContent = null;

// ─── INIT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  if (typeof window.docx === 'undefined') {
    console.error('❌ docx library failed to load');
    showError('Lỗi: Thư viện tạo file Word chưa được tải. Vui lòng refresh trang.');
  } else {
    console.log('✓ docx library loaded');
  }
  if (typeof saveAs === 'undefined') {
    console.error('❌ FileSaver library failed to load');
  } else {
    console.log('✓ FileSaver library loaded');
  }

  // Setup character counters
  setupCharacterCounters();

  // Setup realtime validation
  setupFormValidation();

  // Setup preset buttons
  setupPresetButtons();

  // Setup structure preview
  document.getElementById('structure').addEventListener('input', function() {
    updateStructurePreview(this.value);
  });
});

// ─── START GENERATE ──────────────────────────────────────
async function startGenerate() {
  clearError();

  if (!validateForm()) { return; }

  const topic = document.getElementById('topic').value.trim();
  const docType = document.getElementById('docType').value;
  const major = document.getElementById('major').value.trim();
  const description = document.getElementById('description').value.trim();
  const structure = document.getElementById('structure').value.trim();

  const coverInfo = {
    university: document.getElementById('universityName').value.trim(),
    faculty: document.getElementById('facultyName').value.trim(),
    studentName: document.getElementById('studentName').value.trim(),
    studentId: document.getElementById('studentId').value.trim(),
    supervisor: document.getElementById('supervisorName').value.trim(),
    classInfo: document.getElementById('classInfo').value.trim(),
    logo: window.logoBase64,
    logoMime: window.logoMimeType,
  };

  const fmt = {
    fontName: document.getElementById('fontName').value,
    fontSize: parseFloat(document.getElementById('fontSize').value) || 13,
    marginLeft: parseFloat(document.getElementById('marginLeft').value) || 3.5,
    marginRight: parseFloat(document.getElementById('marginRight').value) || 2,
    marginTop: parseFloat(document.getElementById('marginTop').value) || 3,
    marginBottom: parseFloat(document.getElementById('marginBottom').value) || 3,
    lineSpacing: parseFloat(document.getElementById('lineSpacing').value) || 1.5,
    spacingAfter: parseInt(document.getElementById('spacingAfter').value) || 6,
  };

  document.getElementById('form-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'block';

  try {
    await stepProgress(1, 'Phân tích cấu trúc tài liệu...');

    const docTypeLabel = {
      luan_van: 'Luận văn / Khóa luận tốt nghiệp đại học',
      do_an: 'Báo cáo đồ án môn học',
      tieu_luan: 'Tiểu luận học phần',
      thuc_tap: 'Báo cáo thực tập'
    }[docType];

    const defaultStructure = getDefaultStructure(docType);
    const structureText = structure || defaultStructure;

    const chapters = parseStructureIntoChapters(structureText);

    if (chapters.length === 0) {
      throw new Error('Không thể phân tích cấu trúc. Vui lòng kiểm tra lại.');
    }

    const context = { topic, docTypeLabel, major, description, readme: window.readmeContent };

    await stepProgress(2, `Đang viết chương 1/${chapters.length}...`);

    const allSections = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapterNum = i + 1;
      document.getElementById('progress-sub').textContent = `Đang viết: ${chapters[i].title} (${chapterNum}/${chapters.length})`;

      try {
        const chapterSections = await generateChapter(chapters[i], context);
        allSections.push(...chapterSections);

        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`Error generating chapter ${i + 1}:`, err);
        showError(`Lỗi khi tạo chương ${chapterNum}, tiếp tục với các chương còn lại...`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log(`✓ Generated ${allSections.length} sections total`);

    if (allSections.length === 0) {
      throw new Error('Không thể tạo nội dung. Vui lòng thử lại.');
    }

    const parsed = {
      title: topic,
      docType: docTypeLabel,
      sections: allSections
    };

    await stepProgress(3, 'Áp dụng format Word...');

    const docBlob = await buildDocx(parsed, fmt, coverInfo);

    await stepProgress(4, 'Hoàn tất!');

    generatedDoc = docBlob;
    generatedFilename = slugify(topic) + '.docx';

    await new Promise(r => setTimeout(r, 600));
    showResult(parsed, fmt);

  } catch(err) {
    console.error(err);
    document.getElementById('progress-section').style.display = 'none';
    document.getElementById('form-section').style.display = 'block';
    showError('Lỗi: ' + (err.message || 'Không thể tạo tài liệu. Vui lòng thử lại.'));
  }
}

// ─── DOWNLOAD ────────────────────────────────────────────
function downloadFile() {
  if (generatedDoc) {
    saveAs(generatedDoc, generatedFilename);
  }
}

// ─── RESET ───────────────────────────────────────────────
function resetForm() {
  document.getElementById('result-section').style.display = 'none';
  document.getElementById('form-section').style.display = 'block';
  generatedDoc = null;
  clearError();
}

// ─── UTILS ───────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim().replace(/\s+/g, '-')
    .substring(0, 50) || 'tai-lieu';
}
