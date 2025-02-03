// Check for new deals when browser starts
chrome.runtime.onStartup.addListener(() => {
  checkForNewDeals();
});

// Initialize alarm when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
  chrome.alarms.create('checkDeals', { periodInMinutes: 60 });
  checkForNewDeals(); // Initial check
});

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkDeals') {
    checkForNewDeals();
  }
  if (alarm.name === 'keepAlive') {
    // Keep the service worker alive
    console.log('Keeping service worker alive');
  }
});

async function checkForNewDeals() {
  try {
    const response = await fetch('https://lentodiilit.fi/');
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    const deals = doc.querySelector('#recent-posts-2 ul');
    if (!deals) return;

    const latestDeal = deals.querySelector('li a');
    if (!latestDeal) return;

    const href = latestDeal.getAttribute('href');
    const dateMatch = href.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    
    if (!dateMatch) return;

    const dealDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    const today = new Date().toISOString().split('T')[0];

    // Get last checked date from storage
    const storage = await chrome.storage.local.get('lastCheckedDate');
    const lastCheckedDate = storage.lastCheckedDate || '2000-01-01';

    if (dealDate > lastCheckedDate) {
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'New Flight Deal!',
        message: latestDeal.textContent
      });

      // Update last checked date
      await chrome.storage.local.set({ lastCheckedDate: today });
    }
  } catch (error) {
    console.error('Error checking deals:', error);
  }
}

// Trigger check immediately when loaded
checkForNewDeals();