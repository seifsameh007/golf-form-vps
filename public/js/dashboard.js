// ==========================================
// Dashboard JavaScript - Stats & Charts
// ==========================================

// Load Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    
    animateCounter('statVisits', data.totalVisits || 0);
    animateCounter('statRequests', data.totalRequests || 0);
    animateCounter('statNotBought', data.notBought || 0);
    animateCounter('statBought', data.bought || 0);
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Animate counter
function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  
  const duration = 1000;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    
    el.textContent = current.toLocaleString('ar-EG');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Load Chart
let visitsChart = null;

async function loadChart() {
  const daysSelect = document.getElementById('chartDays');
  const days = daysSelect ? daysSelect.value : 7;
  
  try {
    const res = await fetch(`/api/visits/chart?days=${days}`);
    const data = await res.json();
    
    const labels = data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    });
    const values = data.map(d => d.count);
    
    const ctx = document.getElementById('visitsChart');
    if (!ctx) return;
    
    if (visitsChart) {
      visitsChart.destroy();
    }
    
    visitsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'الزيارات',
          data: values,
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#d4af37',
          pointBorderColor: '#d4af37',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#252525',
            titleColor: '#fff',
            bodyColor: '#b0b0b0',
            borderColor: 'rgba(212, 175, 55, 0.2)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            titleFont: { family: 'Tajawal', size: 14 },
            bodyFont: { family: 'Tajawal', size: 13 },
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => `${item.raw} زيارة`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(80, 80, 80, 0.15)', drawBorder: false },
            ticks: {
              color: '#808080',
              font: { family: 'Tajawal', size: 12 }
            }
          },
          y: {
            grid: { color: 'rgba(80, 80, 80, 0.15)', drawBorder: false },
            ticks: {
              color: '#808080',
              font: { family: 'Tajawal', size: 12 },
              stepSize: 1
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  } catch (err) {
    console.error('Error loading chart:', err);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadChart();
});
