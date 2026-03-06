/* ========================================
   WORD DOCUMENT GENERATOR
   ======================================== */

// Note: The docx library v8.5.0 supports page numbering via footer insertion,
// but does NOT support Roman numeral formatting through its API.
// Current implementation uses Arabic numbers (1, 2, 3...) for all page numbers.
// Future enhancement: Implement Roman numeral support via field codes or manual conversion.

// ─── CREATE PAGE NUMBER FOOTER ──────────────────────────
function createPageNumberFooter(fmt, numberFormat, alignment = 'center') {
  const { Footer, Paragraph, TextRun, AlignmentType, PageNumber } = window.docx;
  
  const alignMap = {
    'center': AlignmentType.CENTER,
    'left': AlignmentType.LEFT,
    'right': AlignmentType.RIGHT
  };

  return new Footer({
    children: [
      new Paragraph({
        alignment: alignMap[alignment] || AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            font: fmt.fontName,
            size: Math.round(fmt.fontSize * 2)
          })
        ]
      })
    ]
  });
}

// ─── BUILD DOCX ──────────────────────────────────────────
async function buildDocx(content, fmt, cover) {
  if (typeof window.docx === 'undefined') {
    throw new Error('docx library not loaded. Please refresh the page and try again.');
  }

  const {
    Document, Packer, Paragraph, TextRun,
    HeadingLevel, AlignmentType, TableOfContents,
    ImageRun, PageBreak, Tab, PageNumber, Footer
  } = window.docx;

  const cmToTwip = cm => Math.round(cm * 566.93);
  const ptToHalfPt = pt => Math.round(pt * 2);
  const lineSpacingVal = Math.round(fmt.lineSpacing * 240);
  const spacingAfterVal = Math.round(fmt.spacingAfter * 20);

  const defaultRun = { font: fmt.fontName, size: ptToHalfPt(fmt.fontSize) };
  const paraSpacing = { line: lineSpacingVal, lineRule: 'auto', after: spacingAfterVal };

  // Get page numbering rules for this document type
  const docTypeKey = content.docTypeKey || 'luan_van'; // fallback to luan_van
  const pageRules = PAGE_NUMBERING_RULES[docTypeKey] || PAGE_NUMBERING_RULES.luan_van;

  // ─── SECTION 1: COVER PAGE (No numbering) ───
  const coverChildren = [];

  // ─── COVER PAGE ───
  if (cover.logo) {
    try {
      const logoBytes = Uint8Array.from(atob(cover.logo), c => c.charCodeAt(0));
      const ext = (cover.logoMime || 'image/png').split('/')[1].toUpperCase();
      const imgType = ext === 'JPG' ? 'JPEG' : (ext === 'SVG' ? 'PNG' : ext);
      coverChildren.push(new Paragraph({
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
    coverChildren.push(new Paragraph({ spacing: { before: 0, after: 600 }, children: [new TextRun({ text: '' })] }));
  }

  if (cover.university) {
    coverChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: cover.university.toUpperCase(), font: fmt.fontName, size: ptToHalfPt(14), bold: true })]
    }));
  }

  if (cover.faculty) {
    coverChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: cover.faculty, font: fmt.fontName, size: ptToHalfPt(13), bold: false })]
    }));
  } else {
    coverChildren.push(new Paragraph({ spacing: { after: 600 }, children: [new TextRun('')] }));
  }

  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: content.docType?.toUpperCase() || 'TÀI LIỆU HỌC THUẬT', font: fmt.fontName, size: ptToHalfPt(16), bold: true, allCaps: true })]
  }));

  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: '─────────────────────────────', font: fmt.fontName, size: ptToHalfPt(11), color: 'AAAAAA' })]
  }));

  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'ĐỀ TÀI:', font: fmt.fontName, size: ptToHalfPt(13), bold: true, color: '2C3E50' })]
  }));
  coverChildren.push(new Paragraph({
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
    coverChildren.push(new Paragraph({
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
  coverChildren.push(new Paragraph({ spacing: { before: 600, after: 0 }, children: [new TextRun('')] }));
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `TP. Hồ Chí Minh, ${year}`, font: fmt.fontName, size: ptToHalfPt(13) })]
  }));

  // ─── SECTION 2: FRONT MATTER (Table of Contents - Roman numerals or no numbering) ───
  const frontMatterChildren = [];

  // ─── TABLE OF CONTENTS (thực sự, với page numbers placeholder) ───
  frontMatterChildren.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'MỤC LỤC' })]
  }));

  for (const section of (content.sections || [])) {
    if (section.isStructural) continue; // bỏ qua structural sections trong TOC render
    const level = section.level || 1;
    const indent = (level - 1) * cmToTwip(0.8);
    frontMatterChildren.push(new Paragraph({
      indent: { left: indent },
      spacing: { after: 60 },
      children: [new TextRun({ text: section.heading || '', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize - 0.5), bold: level === 1, color: level === 1 ? '000000' : '333333' })]
    }));
  }

  // ─── DANH SÁCH HÌNH & BẢNG (placeholder đúng chuẩn) ───
  const hinhSections = (content.sections || []).filter(s =>
    s.isStructural && s.heading?.toLowerCase().includes('hình')
  );
  const bangSections = (content.sections || []).filter(s =>
    s.isStructural && s.heading?.toLowerCase().includes('bảng')
  );

  if (hinhSections.length > 0) {
    frontMatterChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 480, after: 200 },
      children: [new TextRun({ text: 'DANH SÁCH HÌNH' })]
    }));
    frontMatterChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Hình 1.1: ...', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize), color: '888888', italics: true })]
    }));
    frontMatterChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Hình 2.1: ...', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize), color: '888888', italics: true })]
    }));
  }

  if (bangSections.length > 0) {
    frontMatterChildren.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 480, after: 200 },
      children: [new TextRun({ text: 'DANH SÁCH BẢNG' })]
    }));
    frontMatterChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Bảng 1.1: ...', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize), color: '888888', italics: true })]
    }));
    frontMatterChildren.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Bảng 2.1: ...', font: fmt.fontName, size: ptToHalfPt(fmt.fontSize), color: '888888', italics: true })]
    }));
  }

  // ─── SECTION 3: MAIN CONTENT (Arabic numbers starting from 1) ───
  const mainContentChildren = [];


  // ─── CONTENT SECTIONS ───
  for (const section of (content.sections || [])) {
    // Bỏ qua structural sections trong main content
    // (Mục lục đã ở frontMatter; Danh sách hình/bảng xử lý riêng bên dưới)
    if (section.isStructural) continue;

    const level = section.level || 1;
    const headingMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };

    // QUAN TRỌNG: Không set bold/size/font trong TextRun của heading
    // Để Word/docx tự áp dụng heading style → TOC mới nhận diện đúng
    mainContentChildren.push(new Paragraph({
      heading: headingMap[level] || HeadingLevel.HEADING_2,
      spacing: { before: level === 1 ? 480 : 240, after: 120 },
      children: [new TextRun({
        text: section.heading || '',
      })]
    }));

    if (section.content?.trim()) {
      const paragraphs = section.content.split('\n').filter(p => p.trim());
      for (const para of paragraphs) {
        mainContentChildren.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: cmToTwip(1.25) },
          spacing: paraSpacing,
          children: [new TextRun({ text: para.trim(), ...defaultRun })]
        }));
      }
    }
  }

  // ─── CREATE DOCUMENT WITH MULTIPLE SECTIONS ───
  const sections = [];

  // Section 1: Cover page (no page numbers)
  sections.push({
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
    children: coverChildren
  });

  // Section 2: Front matter (TOC - Roman numerals or no numbering)
  const frontMatterFooter = pageRules.frontMatter.numbering 
    ? (pageRules.frontMatter.format === 'lowerRoman' 
        ? {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      font: fmt.fontName,
                      size: ptToHalfPt(fmt.fontSize)
                    })
                  ]
                })
              ]
            })
          }
        : undefined)
    : undefined;

  sections.push({
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
    footers: frontMatterFooter ? frontMatterFooter : undefined,
    children: frontMatterChildren
  });

  // Section 3: Main content (Arabic numbers starting from 1)
  sections.push({
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
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                font: fmt.fontName,
                size: ptToHalfPt(fmt.fontSize)
              })
            ]
          })
        ]
      })
    },
    children: mainContentChildren
  });

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: fmt.fontName, size: ptToHalfPt(fmt.fontSize) } }
      },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: fmt.fontName, size: ptToHalfPt(fmt.fontSize + 1), bold: true, color: '1A252F' },
          paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 }
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: fmt.fontName, size: ptToHalfPt(fmt.fontSize), bold: true, color: '2C3E50' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: fmt.fontName, size: ptToHalfPt(fmt.fontSize), bold: false, italics: true, color: '2C3E50' },
          paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 }
        },
      ]
    },
    sections
  });

  return await Packer.toBlob(doc);
}
