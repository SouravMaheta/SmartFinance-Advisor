/**
 * AI Finance Visualizer - Light Theme Edition
 * Wraps Chart.js to render modern, high-contrast financial comparison charts.
 */

class FinanceCharts {
  static budgetChartInstance = null;
  static debtChartInstance = null;
  static compoundingChartInstance = null;

  /**
   * Renders Budget Comparison (Actual vs 50/30/20 Ideal)
   */
  static renderBudgetChart(canvasId, budgetData, currencySymbol = '$') {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.budgetChartInstance) {
      this.budgetChartInstance.destroy();
    }

    const { actual, recommended } = budgetData;

    this.budgetChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Needs (50%)', 'Wants (30%)', 'Savings & Investments (20%)'],
        datasets: [
          {
            label: 'Your Current Spending',
            data: [actual.needs, actual.wants, actual.savings],
            backgroundColor: [
              'rgba(37, 99, 235, 0.85)',   // Rich Blue
              'rgba(217, 119, 6, 0.85)',   // Amber
              'rgba(5, 150, 105, 0.85)'    // Emerald
            ],
            borderColor: [
              'rgba(37, 99, 235, 1)',
              'rgba(217, 119, 6, 1)',
              'rgba(5, 150, 105, 1)'
            ],
            borderWidth: 1.5,
            borderRadius: 8,
            barPercentage: 0.6
          },
          {
            label: '50/30/20 Optimal Target',
            data: [recommended.needs, recommended.wants, recommended.savings],
            backgroundColor: 'rgba(226, 232, 240, 0.6)',
            borderColor: 'rgba(100, 116, 139, 0.8)',
            borderWidth: 1.5,
            borderDash: [4, 4],
            borderRadius: 8,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#475569',
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' },
              usePointStyle: true,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const val = context.parsed.y || 0;
                return ` ${context.dataset.label}: ${currencySymbol}${val.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { family: "'Inter', sans-serif", size: 11, weight: '500' }
            }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#64748b',
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: function(value) {
                return currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Renders Debt Payoff timeline comparing Minimum Payments vs Accelerated Payoff
   */
  static renderDebtChart(canvasId, debtData, currencySymbol = '$') {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.debtChartInstance) {
      this.debtChartInstance.destroy();
    }

    if (!debtData.hasDebt) {
      return;
    }

    // Prepare unified labels based on whichever timeline is longer
    const minTimeline = debtData.minimumOnly?.timeline || [];
    const accTimeline = debtData.avalanche?.timeline || [];

    const allMonths = Array.from(new Set([
      ...minTimeline.map(t => t.month),
      ...accTimeline.map(t => t.month)
    ])).sort((a, b) => a - b);

    // Build data series
    const minMap = new Map(minTimeline.map(t => [t.month, t.remaining]));
    const accMap = new Map(accTimeline.map(t => [t.month, t.remaining]));

    const minSeries = [];
    const accSeries = [];

    let lastMin = debtData.totalBalance;
    let lastAcc = debtData.totalBalance;

    allMonths.forEach(m => {
      if (minMap.has(m)) lastMin = minMap.get(m);
      if (accMap.has(m)) lastAcc = accMap.get(m);
      minSeries.push(lastMin);
      accSeries.push(lastAcc);
    });

    const labels = allMonths.map(m => `Month ${m}`);

    this.debtChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Minimum Payments (Slow & Expensive)',
            data: minSeries,
            borderColor: 'rgba(220, 38, 38, 0.85)',
            backgroundColor: 'rgba(220, 38, 38, 0.04)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: true,
            tension: 0.2,
            pointRadius: 0
          },
          {
            label: 'Accelerated Payoff (AI Strategy)',
            data: accSeries,
            borderColor: 'rgba(5, 150, 105, 1)',
            backgroundColor: 'rgba(5, 150, 105, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.2,
            pointRadius: 2,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#475569',
              font: { family: "'Inter', sans-serif", size: 12, weight: '600' },
              usePointStyle: true,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const val = context.parsed.y || 0;
                return ` ${context.dataset.label}: ${currencySymbol}${val.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 8,
              font: { family: "'Inter', sans-serif", size: 11 }
            }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#64748b',
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: function(value) {
                return currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Renders SIP Wealth Compounding Stacked Growth Chart
   */
  static renderCompoundingChart(canvasId, sipData, currencySymbol = '$') {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.compoundingChartInstance) {
      this.compoundingChartInstance.destroy();
    }

    const labels = sipData.progression.map(d => `Year ${d.year}`);
    const investedData = sipData.progression.map(d => d.invested);
    const wealthData = sipData.progression.map(d => d.totalWealth);

    this.compoundingChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Estimated Wealth',
            data: wealthData,
            borderColor: 'rgba(5, 150, 105, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: '#059669'
          },
          {
            label: 'Total Principal Invested',
            data: investedData,
            borderColor: 'rgba(79, 70, 229, 0.8)',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            fill: true,
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: "'Inter', sans-serif", size: 11, weight: '600' },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const val = context.parsed.y || 0;
                return ` ${context.dataset.label}: ${currencySymbol}${val.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: function(value) {
                if (value >= 10000000) return currencySymbol + (value / 10000000).toFixed(1) + ' Cr';
                if (value >= 1000000) return currencySymbol + (value / 1000000).toFixed(1) + 'M';
                if (value >= 100000) return currencySymbol + (value / 100000).toFixed(1) + 'L';
                if (value >= 1000) return currencySymbol + (value / 1000).toFixed(0) + 'k';
                return currencySymbol + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FinanceCharts;
}
