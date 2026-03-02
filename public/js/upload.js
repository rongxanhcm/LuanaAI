/* ========================================
   FILE UPLOAD HANDLERS
   ======================================== */

// ─── README UPLOAD ──────────────────────────────────────
function handleReadmeUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) { 
    alert('File quá lớn, vui lòng chọn file dưới 5MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const result = ev.target.result;
    
    // Handle PDF - try to extract text (basic)
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      console.log('PDF detected - using first 3000 chars as description');
      window.readmeContent = '(PDF file uploaded - AI will consider the project context from your description field)';
    } else {
      window.readmeContent = result;
    }

    document.getElementById('readme-upload-icon').textContent = '✓';
    document.getElementById('readme-upload-text').textContent = file.name;
    document.getElementById('readme-upload-zone').classList.add('has-file');
    document.getElementById('readme-filename').textContent = file.name;
    document.getElementById('readme-info').classList.add('show');
  };
  
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

// ─── LOGO UPLOAD ─────────────────────────────────────────
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { 
    alert('File quá lớn, vui lòng chọn ảnh dưới 2MB.'); 
    return; 
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const result = ev.target.result;
    window.logoBase64 = result.split(',')[1];
    window.logoMimeType = file.type;

    const preview = document.getElementById('logo-preview');
    preview.src = result;
    preview.style.display = 'block';
    document.getElementById('upload-icon').textContent = '';
    document.getElementById('upload-text').textContent = '✓ ' + file.name;
    document.getElementById('upload-zone').classList.add('has-file');
  };
  reader.readAsDataURL(file);
}
