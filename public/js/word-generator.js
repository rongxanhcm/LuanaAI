/* ========================================
   WORD DOCUMENT GENERATOR
   ======================================== */

// ─── BUILD DOCX ──────────────────────────────────────────
async function buildDocx(content, fmt, cover) {
  if (typeof window.docx === 'undefined') {
    throw new Error('docx library not loaded. Please refresh the page and try again.');
  }

  const {
    Document, Packer, Paragraph, TextRun,
    HeadingLevel, AlignmentType, TableOfContents,
    ImageRun, PageBreak, Tab
  } = window.docx;

  const cmToTwip = cm => Math.round(cm * 566.93);
  const ptToHalfPt = pt => Math.round(pt * 2);
  const lineSpacingVal = Math.round(fmt.lineSpacing * 240);
  const spacingAfterVal = Math.round(fmt.spacingAfter * 20);

  const defaultRun = { font: fmt.fontName, size: ptToHalfPt(fmt.fontSize) };
  const paraSpacing = { line: lineSpacingVal, lineRule: 'auto', after: spacingAfterVal };

  const children = [];

  // ─── COVER PAGE ───
  if (cover.logo) {
    try {
      const logoBytes = Uint8Array.from(atob(cover.logo), c => c.charCodeAt(0));
      const ext = (cover.logoMime || 'image/png').split('/')[1].toUpperCase();
      const imgType = ext === 'JPG' ? 'JPEG' : (ext === 'SVG' ? 'PNG' : ext);
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new ImageRun({
          data: logoBytes,
          transformation: { width: 100, height: 100 },
          type: imgType,
        })]
      }));
    } catch(e) { console.warn('Logo error:', e); }
  } else {
    children.push(new Paragraph({ spacing: { before: 0, after: 600 }, children: [new TextRun({ text: '' })] }));
  }

  if (cover.university) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: cover.university.toUpperCase(), font: fmt.fontName, size: ptToHalfPt(14), bold: true })]
    }));
  }

  if (cover.faculty) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: cover.faculty, font: fmt.fontName, size: ptToHalfPt(13), bold: false })]
    }));
  } else {
    children.push(new Paragraph({ spacing: { after: 600 }, children: [new TextRun('')] }));
  }

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: content.docType?.toUpperCase() || 'TÀI LIỆU HỌC THUẬT', font: fmt.fontName, size: ptToHalfPt(16), bold: true, allCaps: true })]
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: '─────────────────────────────', font: fmt.fontName, size: ptToHalfPt(11), color: 'AAAAAA' })]
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'ĐỀ TÀI:', font: fmt.fontName, size: ptToHalfPt(13), bold: true, color: '2C3E50' })]
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
    children: [new TextRun({ text: content.title || '', font: fmt.fontName, size: ptToHalfPt(17), bold: true, color: '1A252F' })]
  }));

  const infoLines = [];
  if (cover.studentName) infoLines.push({ label: 'Sinh viên thực hiện:', value: cover.studentName });
  if (cover.studentId)   infoLines.push({ label: 'MSSV:', value: cover.studentId });
  if (cover.supervisor)  infoLines.push({ label: 'Giảng viên hướng dẫn:', value: cover.supervisor });
  if (cover.classInfo)   infoLines.push({ label: 'Lớp / Khóa:', value: cover.classInfo });

  for (const line of infoLines) {
    children.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: cmToTwip(4) },
      spacing: { after: 80 },
      children: [
        new TextRun({ text: line.label + ' ', font: fmt.fontName, size: ptToHalfPt(13), bold: true }),
        new TextRun({ text: line.value, font: fmt.fontName, size: ptToHalfPt(13) }),
      ]
    }));
  }

  const year = new Date().getFullYear();
  children.push(new Paragraph({ spacing: { before: 600, after: 0 }, children: [new TextRun('')] }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `TP. Hồ Chí Minh, ${year}`, font: fmt.fontName, size: ptToHalfPt(13) })]
  }));

  children.push(new Paragraph({ pageBreakBefore: true, children: [new TextRun('')] }));

  // ─── TABLE OF CONTENTS ───
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'MỤC LỤC', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize + 2), bold: true, allCaps: true })]
  }));

  for (const section of (content.sections || [])) {
    const level = section.level || 1;
    const indent = (level - 1) * cmToTwip(0.8);
    children.push(new Paragraph({
      indent: { left: indent },
      spacing: { after: 60 },
      children: [new TextRun({ text: section.heading || '', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize - 0.5), bold: level === 1, color: level === 1 ? '000000' : '333333' })]
    }));
  }

  children.push(new Paragraph({ pageBreakBefore: true, children: [new TextRun('')] }));

  // ─── CONTENT SECTIONS ───
  for (const section of (content.sections || [])) {
    const level = section.level || 1;
    const headingMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };

    children.push(new Paragraph({
      heading: headingMap[level] || HeadingLevel.HEADING_2,
      spacing: { before: level === 1 ? 480 : 240, after: 120 },
      children: [new TextRun({
        text: section.heading || '',
        font: fmt.fontName,
        size: ptToHalfPt(level === 1 ? fmt.fontSize + 1 : fmt.fontSize),
        bold: true,
        color: level === 1 ? '1A252F' : '2C3E50',
      })]
    }));

    if (section.content?.trim()) {
      const paragraphs = section.content.split('\n').filter(p => p.trim());
      for (const para of paragraphs) {
        children.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: cmToTwip(1.25) },
          spacing: paraSpacing,
          children: [new TextRun({ text: para.trim(), ...defaultRun })]
        }));
      }
    }
  }

  // ─── CREATE DOCUMENT ───
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: cmToTwip(fmt.marginTop),
            bottom: cmToTwip(fmt.marginBottom),
            left: cmToTwip(fmt.marginLeft),
            right: cmToTwip(fmt.marginRight),
          }
        }
      },
      children
    }]
  });

  return await Packer.toBlob(doc);
}
