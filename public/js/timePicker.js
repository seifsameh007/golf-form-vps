// ==========================================
// iPhone-Style Time Picker (Scroll Wheel)
// ==========================================

(function() {
  const container = document.getElementById('timePicker');
  if (!container) return;

  // Generate time slots from 9:00 AM to 10:00 PM (30 min intervals)
  const times = [];
  for (let h = 9; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break; // Stop at 10:00 PM
      
      let hour = h;
      let period = 'صباحاً';
      
      if (h === 12) {
        period = 'ظهراً';
      } else if (h > 12) {
        hour = h - 12;
        if (h < 17) {
          period = 'ظهراً';
        } else {
          period = 'مساءاً';
        }
      }
      
      const timeStr = `${hour}:${m.toString().padStart(2, '0')} ${period}`;
      times.push(timeStr);
    }
  }

  // Render time items
  times.forEach((time, index) => {
    const item = document.createElement('div');
    item.className = 'time-picker-item';
    item.textContent = time;
    item.dataset.index = index;
    
    item.addEventListener('click', () => {
      scrollToItem(index);
    });
    
    container.appendChild(item);
  });

  const items = container.querySelectorAll('.time-picker-item');
  const itemHeight = 44;

  // Default selection (12:00 PM)
  let selectedIndex = times.findIndex(t => t.includes('12:00'));
  if (selectedIndex === -1) selectedIndex = 6;

  function scrollToItem(index) {
    const scrollTop = index * itemHeight;
    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }

  function updateSelection() {
    const scrollTop = container.scrollTop;
    const centerIndex = Math.round(scrollTop / itemHeight);
    
    items.forEach((item, i) => {
      item.classList.remove('selected', 'near');
      
      if (i === centerIndex) {
        item.classList.add('selected');
        selectedIndex = i;
      } else if (Math.abs(i - centerIndex) === 1) {
        item.classList.add('near');
      }
    });
  }

  // Scroll event with debounce
  let scrollTimeout;
  container.addEventListener('scroll', () => {
    updateSelection();
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Snap to nearest item
      const scrollTop = container.scrollTop;
      const nearestIndex = Math.round(scrollTop / itemHeight);
      container.scrollTo({
        top: nearestIndex * itemHeight,
        behavior: 'smooth'
      });
    }, 100);
  });

  // Initial scroll to default time
  setTimeout(() => {
    scrollToItem(selectedIndex);
    updateSelection();
  }, 200);

  // Expose getter for form.js
  window.getSelectedTime = function() {
    const selected = container.querySelector('.time-picker-item.selected');
    return selected ? selected.textContent.trim() : times[selectedIndex];
  };
})();
