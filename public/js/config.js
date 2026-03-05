/* ========================================
   CONFIG & CONSTANTS
   ======================================== */

const PRESETS = {
  standard: { 
    font: 'Times New Roman', 
    size: 13, 
    left: 3.5, 
    right: 2, 
    top: 3, 
    bottom: 3, 
    spacing: 1.5, 
    spAfter: 6 
  },
  bk: { 
    font: 'Times New Roman', 
    size: 13, 
    left: 3.5, 
    right: 2, 
    top: 3.5, 
    bottom: 3, 
    spacing: 1.5, 
    spAfter: 6 
  },
  ueh: { 
    font: 'Times New Roman', 
    size: 14, 
    left: 3, 
    right: 2.5, 
    top: 3, 
    bottom: 3, 
    spacing: 1.5, 
    spAfter: 0 
  },
  custom: null
};

// ─── PAGE NUMBERING RULES BY DOCUMENT TYPE ──────────────
// NOTE: The 'format' field defines the intended numbering style.
// Current implementation supports 'decimal' (1, 2, 3...) only.
// 'lowerRoman' (i, ii, iii...) is reserved for future enhancement.
// The docx library v8.5.0 does not natively support Roman numeral formatting.
const PAGE_NUMBERING_RULES = {
  // Luận văn / Khóa luận: Bắt đầu đánh số từ Chương 1
  luan_van: {
    cover: { numbering: false }, // Bìa: không đánh số
    frontMatter: { 
      numbering: false,  // Mục lục không đánh số
      sections: ['Lời cam đoan', 'Lời cảm ơn', 'Tóm tắt', 'Mục lục', 'Danh sách hình', 'Danh sách bảng']
    },
    mainContent: { 
      numbering: true, 
      format: 'decimal', // 1, 2, 3...
      start: 1,  // Bắt đầu từ 1 từ Chương 1
      sections: ['Mở đầu', 'Chương', 'Kết luận', 'Tài liệu tham khảo', 'Phụ lục']
    }
  },

  // Đồ án môn học: Giống luận văn
  do_an: {
    cover: { numbering: false },
    frontMatter: { 
      numbering: false,  // Mục lục không đánh số
      sections: ['Lời cam đoan', 'Lời cảm ơn', 'Tóm tắt', 'Mục lục', 'Danh sách hình', 'Danh sách bảng']
    },
    mainContent: { 
      numbering: true, 
      format: 'decimal',
      start: 1,  // Bắt đầu từ 1 từ Chương 1
      sections: ['Chương', 'Kết luận', 'Tài liệu tham khảo', 'Phụ lục']
    }
  },

  // Tiểu luận: Đơn giản hơn
  tieu_luan: {
    cover: { numbering: false },
    frontMatter: { 
      numbering: false, // Không đánh số phần mục lục
      sections: ['Mục lục']
    },
    mainContent: { 
      numbering: true, 
      format: 'decimal',
      start: 1, // Bắt đầu từ 1 ngay sau bìa
      sections: ['Mở đầu', 'Phần', 'Kết luận', 'Tài liệu tham khảo']
    }
  },

  // Báo cáo thực tập: Bắt đầu đánh số từ Chương 1
  thuc_tap: {
    cover: { numbering: false },
    frontMatter: { 
      numbering: false,  // Mục lục không đánh số
      sections: ['Lời cảm ơn', 'Mục lục']
    },
    mainContent: { 
      numbering: true, 
      format: 'decimal',
      start: 1,  // Bắt đầu từ 1 từ nội dung chính
      sections: ['Giới thiệu', 'Chương', 'Kết luận', 'Tài liệu tham khảo']
    }
  }
};
