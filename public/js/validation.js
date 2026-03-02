/* ========================================
   VALIDATION
   ======================================== */

// ─── REALTIME VALIDATION ────────────────────────────────
function setupFormValidation() {
  const requiredFields = ['topic', 'universityName'];

  requiredFields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (!el) return;

    const validateField = () => {
      const field = el.closest('.field');
      if (el.value.trim()) {
        field?.classList.remove('invalid');
      } else {
        field?.classList.add('invalid');
      }
    };

    el.addEventListener('blur', validateField);
    el.addEventListener('input', () => {
      const field = el.closest('.field');
      if (field?.classList.contains('invalid') && el.value.trim()) {
        field.classList.remove('invalid');
      }
    });
  });
}

// ─── VALIDATE FORM ──────────────────────────────────────
function validateForm() {
  const requiredFields = [
    { id: 'topic', name: 'Tên đề tài' },
    { id: 'universityName', name: 'Tên trường' }
  ];

  const errors = [];
  let isValid = true;

  requiredFields.forEach(({ id, name }) => {
    const field = document.getElementById(id);
    const fieldWrapper = field.closest('.field');
    if (!field.value.trim()) {
      errors.push(`${name} không được để trống`);
      fieldWrapper?.classList.add('invalid');
      isValid = false;
    } else {
      fieldWrapper?.classList.remove('invalid');
    }
  });

  if (!isValid) {
    showError(errors.join(' · '));
  }

  return isValid;
}

// ─── ERROR DISPLAY ──────────────────────────────────────
function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError() {
  document.getElementById('error-msg').style.display = 'none';
}
