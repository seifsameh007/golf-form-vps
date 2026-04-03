// ==========================================
// Multi-Step Form Logic
// ==========================================

let formData = {
  projectId: document.getElementById('projectId') ? document.getElementById('projectId').value : null,
  rooms: '',
  name: '',
  phone: '',
  hasWhatsApp: true,
  whatsappNumber: '',
  email: '',
  jobTitle: '',
  preferredDay: 'النهارده',
  preferredTime: '12:00 ظهراً',
  isImmediate: false
};

let currentStep = 1;

// Select Room
function selectRoom(room) {
  formData.rooms = room;
  
  // Visual feedback
  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.textContent.trim() === room) {
      btn.classList.add('selected');
    }
  });
  
  // Auto-advance after short delay
  setTimeout(() => goToStep(2), 400);
}

// Select Day
function selectDay(day, btn) {
  formData.preferredDay = day;
  document.querySelectorAll('.day-btn').forEach(b => {
    b.classList.remove('active-day');
    // Remove the selected gradient and styling completely
    b.classList.remove('bg-gradient-to-l', 'from-gold-300', 'via-gold-400', 'to-gold-300', 'text-dark-900', 'shadow-gold-400/20');
    // Add default styling back
    b.classList.add('bg-dark-500/60', 'text-dark-200', 'border', 'border-dark-400/50');
  });
  
  btn.classList.add('active-day');
  btn.classList.remove('bg-dark-500/60', 'text-dark-200', 'border', 'border-dark-400/50');
  btn.classList.add('bg-gradient-to-l', 'from-gold-300', 'via-gold-400', 'to-gold-300', 'text-dark-900', 'shadow-gold-400/20');
  
  // Reset state if someone switches back to day/time from immediate call
  formData.isImmediate = false;
  const immediateBtn = document.getElementById('immediateCallBtn');
  if (immediateBtn) {
    immediateBtn.classList.remove('bg-gradient-to-r', 'from-green-600', 'to-green-500', 'text-white', 'shadow-green-500/30');
    immediateBtn.classList.add('bg-gradient-to-l', 'from-green-500/20', 'via-green-600/10', 'to-green-500/20', 'text-green-100');
  }
}

// Toggle WhatsApp Input
function toggleWhatsAppInput() {
  const container = document.getElementById('whatsappInputContainer');
  const isChecked = document.getElementById('noWhatsApp').checked;
  if (isChecked) {
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

// Select Immediate Call as a toggle Switch
function toggleImmediateCall(btn) {
  formData.isImmediate = !formData.isImmediate;
  
  const scheduleContainer = document.getElementById('regularScheduleContainer');
  const timePickerContainer = document.getElementById('timePickerContainer');
  const notice = document.getElementById('immediateNotice');
  
  if (formData.isImmediate) {
    formData.preferredDay = 'مكالمة فورية';
    formData.preferredTime = 'الآن';
    
    // Switch to full colored
    btn.classList.remove('bg-gradient-to-l', 'from-green-500/20', 'via-green-600/10', 'to-green-500/20', 'text-green-100');
    btn.classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-500', 'text-white', 'shadow-green-500/30');
    
    // Hide schedule, time picker and show notice
    if (scheduleContainer) scheduleContainer.classList.add('hidden');
    if (timePickerContainer) timePickerContainer.classList.add('hidden');
    if (notice) notice.classList.remove('hidden');
    
    // Disselect days just in case
    document.querySelectorAll('.day-btn').forEach(b => {
      b.classList.remove('active-day');
      b.classList.add('bg-dark-500/60', 'text-dark-200', 'border', 'border-dark-400/50');
    });
    const selected = document.querySelector('.time-picker-item.selected');
    if (selected) selected.classList.remove('selected');
    
  } else {
    // Reset back to normal view
    formData.preferredDay = 'النهارده';
    formData.preferredTime = '12:00 ظهراً'; // Or leave it alone to require selection
    
    // Switch back to outlined
    btn.classList.remove('bg-gradient-to-r', 'from-green-600', 'to-green-500', 'text-white', 'shadow-green-500/30');
    btn.classList.add('bg-gradient-to-l', 'from-green-500/20', 'via-green-600/10', 'to-green-500/20', 'text-green-100');
    
    // Show schedule, time picker and hide notice
    if (scheduleContainer) scheduleContainer.classList.remove('hidden');
    if (timePickerContainer) timePickerContainer.classList.remove('hidden');
    if (notice) notice.classList.add('hidden');
  }
}

// Validate Step 2 and go to Step 3
function validateAndGoToStep3() {
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const isNoWhatsApp = document.getElementById('noWhatsApp').checked;
  const whatsappNumber = document.getElementById('clientWhatsApp') ? document.getElementById('clientWhatsApp').value.trim() : '';
  
  if (!name) {
    shakeInput('clientName');      
    return;
  }
  
  if (!phone || phone.length < 10) {
    shakeInput('clientPhone');
    return;
  }

  if (isNoWhatsApp && (!whatsappNumber || whatsappNumber.length < 10)) {
    shakeInput('clientWhatsApp');
    return;
  }
  
  formData.name = name;
  formData.phone = phone;
  formData.hasWhatsApp = !isNoWhatsApp;
  formData.whatsappNumber = isNoWhatsApp ? whatsappNumber : '';
  formData.email = document.getElementById('clientEmail').value.trim();
  formData.jobTitle = document.getElementById('clientJob').value.trim();
  
  goToStep(3);
}

// Shake animation for invalid inputs
function shakeInput(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#ef4444';
  el.style.animation = 'shake 0.5s ease';
  el.focus();
  
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 1000);
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

// Go to Step
function goToStep(step) {
  // Get selected time before leaving step 3
  if (currentStep === 3 && step !== 3 && !formData.isImmediate) {
    const selected = document.querySelector('.time-picker-item.selected');
    if (selected) {
      formData.preferredTime = selected.textContent.trim();
    }
  }
  
  // Hide current step
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  
  // Show target step
  const targetStep = document.getElementById('step' + step);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  
  // Update progress bar
  updateProgress(step);
  
  // Update summary if going to step 4
  if (step === 4) {
    updateSummary();
  }
  
  currentStep = step;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update Progress Bar
function updateProgress(step) {
  for (let i = 1; i <= 4; i++) {
    const icon = document.querySelector(`.step-icon[data-step="${i}"]`);
    const line = document.querySelector(`.step-line[data-line="${i}"]`);
    
    if (i < step) {
      icon?.classList.add('completed');
      icon?.classList.remove('active');
      line?.classList.add('active');
    } else if (i === step) {
      icon?.classList.add('active');
      icon?.classList.remove('completed');
    } else {
      icon?.classList.remove('active', 'completed');
      line?.classList.remove('active');
    }
  }
}

// Update Summary
function updateSummary() {
  document.getElementById('summaryRooms').textContent = formData.rooms;
  document.getElementById('summaryName').textContent = formData.name;
  document.getElementById('summaryPhone').textContent = formData.phone;
  
  const emailEl = document.getElementById('summaryEmail');
  if (formData.email) {
    emailEl.textContent = formData.email;
    emailEl.style.display = 'block';
  } else {
    emailEl.style.display = 'none';
  }
  
  const jobEl = document.getElementById('summaryJob');
  if (formData.jobTitle) {
    jobEl.textContent = formData.jobTitle;
    jobEl.style.display = 'block';
  } else {
    jobEl.style.display = 'none';
  }
  
  document.getElementById('summaryDay').textContent = formData.preferredDay;
  document.getElementById('summaryTime').textContent = formData.preferredTime;
}

// Submit Form
async function submitForm() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="w-5 h-5 animate-spin inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
    جاري الإرسال...
  `;
  
  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success
      document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
      document.getElementById('stepSuccess').classList.add('active');
      
      const successMsgEl = document.getElementById('successMessageText');
      if (formData.isImmediate) {
        successMsgEl.textContent = 'تم أستلام طلبك و حد من تيم السيلز هيتصل بحضرتك خلال 5-15 دقيقة كحد أقصي ان شاء الله';
      } else {
        successMsgEl.textContent = 'هنتواصل مع حضرتك في أقرب وقت';
      }
      
      // Update all progress to completed
      for (let i = 1; i <= 4; i++) {
        document.querySelector(`.step-icon[data-step="${i}"]`)?.classList.add('completed');
        document.querySelector(`.step-line[data-line="${i}"]`)?.classList.add('active');
      }
      
      if (formData.isImmediate) {
        setTimeout(() => {
          window.location.href = 'https://golfhousedevelopment.com/';
        }, 5000);
      }
    } else {
      throw new Error(data.error || 'حدث خطأ');
    }
  } catch (error) {
    btn.disabled = false;
    btn.innerHTML = 'إرسال الطلب ✨';
    alert('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
    console.error(error);
  }
}
