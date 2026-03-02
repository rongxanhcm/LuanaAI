/* ========================================
   STRUCTURE PARSER
   ======================================== */

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
    do_an: `Mở đầu
Chương 1: Tổng quan đề tài
  1.1 Giới thiệu bài toán
  1.2 Yêu cầu và mục tiêu
  1.3 Công nghệ sử dụng
Chương 2: Phân tích và thiết kế
  2.1 Phân tích yêu cầu
  2.2 Thiết kế hệ thống
Chương 3: Triển khai và kết quả
  3.1 Cài đặt và triển khai
  3.2 Kết quả đạt được
  3.3 Đánh giá và hướng phát triển
Kết luận`,
    tieu_luan: `Mở đầu
Nội dung
  1. Cơ sở lý thuyết
  2. Phân tích và bình luận
  3. Liên hệ thực tiễn
Kết luận`,
    thuc_tap: `Giới thiệu doanh nghiệp
  1.1 Lịch sử hình thành
  1.2 Lĩnh vực hoạt động
  1.3 Cơ cấu tổ chức
Nội dung thực tập
  2.1 Công việc được giao
  2.2 Kết quả thực hiện
  2.3 Bài học kinh nghiệm
Đánh giá và kiến nghị
Kết luận`
  };
  return structures[docType] || structures.tieu_luan;
}
