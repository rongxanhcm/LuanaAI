/* ========================================
   STRUCTURE PARSER
   ======================================== */

// ─── STRUCTURAL SECTIONS (không cần AI viết nội dung) ───
// Các section này chỉ là định dạng tài liệu, không phải nội dung
const STRUCTURAL_SECTION_KEYWORDS = [
  'mục lục', 'danh sách hình', 'danh sách bảng',
  'danh mục hình', 'danh mục bảng', 'danh mục từ viết tắt',
  'danh mục ký hiệu', 'list of figures', 'list of tables', 'table of contents'
];

function isStructuralSection(title) {
  if (!title) return false;
  const normalized = title.toLowerCase().trim();
  return STRUCTURAL_SECTION_KEYWORDS.some(kw => normalized.startsWith(kw) || normalized === kw);
}

// ─── PARSE STRUCTURE INTO CHAPTERS ──────────────────────
function parseStructureIntoChapters(structureText) {
  const lines = structureText.split('\n').filter(l => l.trim());
  const chapters = [];
  let currentChapter = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)[1].length;

    const isMainChapter = indent === 0 || /^(chương|mở đầu|kết luận|phần|lời|giới thiệu)/i.test(trimmed);

    if (isMainChapter) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        title: trimmed,
        sections: [{ heading: trimmed, level: 1 }]
      };
    } else if (currentChapter) {
      const level = indent > 0 ? 2 : 1;
      currentChapter.sections.push({ heading: trimmed, level });
    }
  }

  if (currentChapter) chapters.push(currentChapter);

  console.log(`📋 Parsed ${chapters.length} chapters with ${chapters.reduce((sum, ch) => sum + ch.sections.length, 0)} total sections`);
  return chapters;
}

// ─── DEFAULT STRUCTURES ──────────────────────────────────
function getDefaultStructure(docType) {
  const structures = {
    luan_van: `Mở đầu
  1. Lý do chọn đề tài
  2. Mục tiêu nghiên cứu
  3. Phạm vi và đối tượng nghiên cứu
  4. Phương pháp nghiên cứu
Chương 1: Cơ sở lý luận
  1.1 Các khái niệm cơ bản
  1.2 Lý thuyết nền tảng
  1.3 Tổng quan nghiên cứu trước
Chương 2: Thực trạng và phân tích
  2.1 Tổng quan đối tượng nghiên cứu
  2.2 Phân tích thực trạng
  2.3 Đánh giá kết quả
Chương 3: Giải pháp và kiến nghị
  3.1 Định hướng phát triển
  3.2 Các giải pháp đề xuất
  3.3 Kiến nghị
Kết luận`,
    
    do_an: `Mục lục
Danh sách hình
Danh sách bảng
Chương 1: Giới thiệu đề tài
  1.1 Lý do chọn đề tài
    - Bối cảnh thực tế
    - Tính cấp thiết
    - Xu hướng công nghệ
  1.2 Mục tiêu đề tài
    - Mục tiêu tổng quát
    - Mục tiêu cụ thể
  1.3 Ý nghĩa của đề tài
    - Ý nghĩa học thuật
    - Ý nghĩa thực tiễn
  1.4 Đối tượng và phạm vi nghiên cứu
    - Đối tượng nghiên cứu
    - Phạm vi kỹ thuật
    - Phạm vi triển khai
Chương 2: Cơ sở lý luận và phương pháp nghiên cứu
  2.1 Cơ sở lý luận
    - Khái niệm liên quan
    - Công nghệ nền tảng
    - Mô hình / kiến trúc áp dụng
  2.2 Phương pháp nghiên cứu
    2.2.1 Phương pháp thu thập dữ liệu
    2.2.2 Phương pháp phân tích
    2.2.3 Phương pháp thiết kế
    2.2.4 Phương pháp kiểm thử
  2.3 Công cụ và công nghệ sử dụng
    2.3.1 Công cụ phát triển
    2.3.2 Công nghệ lập trình
    2.3.3 Công nghệ cơ sở dữ liệu
    2.3.4 Công nghệ triển khai
Chương 3: Tổng quan hệ thống
  3.1 Giới thiệu tổng quan hệ thống
    - Mô tả bài toán
    - Giải pháp đề xuất
  3.2 Phân tích yêu cầu hệ thống
    3.2.1 Yêu cầu chức năng
    3.2.2 Yêu cầu phi chức năng
  3.3 Mô hình hệ thống
    - Kiến trúc tổng thể
    - Sơ đồ tổng quan
Chương 4: Phân tích và thiết kế hệ thống
  4.1 Phân tích hệ thống
    4.1.1 Phân tích dữ liệu
    4.1.2 Phân tích chức năng
  4.2 Thiết kế hệ thống
    4.2.1 Sơ đồ Use Case
    4.2.2 Sơ đồ ERD
    4.2.3 Lược đồ cơ sở dữ liệu
    4.2.4 Sơ đồ DFD (Cấp 0, 1, 2)
    4.2.5 Sơ đồ Sequence
Chương 5: Triển khai và giao diện hệ thống
  5.1 Môi trường cài đặt
  5.2 Các chức năng chính
    5.2.1 Chức năng 1
    5.2.2 Chức năng 2
    5.2.3 Chức năng 3
  5.3 Giao diện hệ thống
    - Hình ảnh minh họa
    - Mô tả hoạt động
Chương 6: Kiểm thử và đánh giá
  6.1 Kiểm thử hệ thống
    - Kiểm thử chức năng
    - Kiểm thử hiệu năng
  6.2 Kết quả đạt được
  6.3 Hạn chế
  6.4 Hướng phát triển
Kết luận
Tài liệu tham khảo`,
    
    tieu_luan: `Mở đầu
Phần 1: Cơ sở lý thuyết
  1.1 Khái niệm và định nghĩa
  1.2 Các nghiên cứu liên quan
Phần 2: Phân tích và bình luận
  2.1 Phân tích vấn đề
  2.2 Đánh giá và nhận xét
Phần 3: Liên hệ thực tiễn
  3.1 Ứng dụng thực tế
  3.2 Bài học kinh nghiệm
Kết luận`,
    
    thuc_tap: `Giới thiệu doanh nghiệp
  1.1 Lịch sử hình thành
  1.2 Lĩnh vực hoạt động
  1.3 Cơ cấu tổ chức
Chương 1: Quá trình thực tập
  1.1 Vị trí thực tập
  1.2 Nhiệm vụ được giao
  1.3 Quy trình làm việc
Chương 2: Kết quả và đánh giá
  2.1 Kết quả công việc
  2.2 Khó khăn gặp phải
  2.3 Bài học kinh nghiệm
Chương 3: Kiến nghị
  3.1 Đối với doanh nghiệp
  3.2 Đối với trường học
Kết luận`,
    
    bao_cao: `Tóm tắt
Giới thiệu
  1. Bối cảnh
  2. Mục tiêu báo cáo
  3. Phạm vi nghiên cứu
Nội dung chính
  1. Phương pháp tiếp cận
  2. Kết quả và phân tích
  3. Thảo luận
Kết luận và khuyến nghị
  1. Kết luận chính
  2. Khuyến nghị
  3. Hạn chế và hướng phát triển`,
    
    nghien_cuu: `Tóm tắt
Chương 1: Giới thiệu
  1.1 Bối cảnh nghiên cứu
  1.2 Vấn đề nghiên cứu
  1.3 Câu hỏi và giả thuyết nghiên cứu
  1.4 Ý nghĩa nghiên cứu
Chương 2: Tổng quan tài liệu
  2.1 Cơ sở lý thuyết
  2.2 Các nghiên cứu trước đây
  2.3 Khoảng trống nghiên cứu
Chương 3: Phương pháp nghiên cứu
  3.1 Thiết kế nghiên cứu
  3.2 Mẫu nghiên cứu
  3.3 Công cụ thu thập dữ liệu
  3.4 Phương pháp phân tích
Chương 4: Kết quả nghiên cứu
  4.1 Thống kê mô tả
  4.2 Kiểm định giả thuyết
  4.3 Phân tích chuyên sâu
Chương 5: Thảo luận và kết luận
  5.1 Thảo luận kết quả
  5.2 Hàm ý lý thuyết và thực tiễn
  5.3 Hạn chế nghiên cứu
  5.4 Hướng nghiên cứu tương lai
Kết luận`
  };
  return structures[docType] || structures.tieu_luan;
}
