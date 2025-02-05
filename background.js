// Check for new deals when browser starts
chrome.runtime.onStartup.addListener(() => {
  checkForNewDeals();
});

// Also check periodically (every hour)
chrome.alarms.create('checkDeals', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkDeals') {
    checkForNewDeals();
  }
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
    
    // Use regex to extract the information instead of DOMParser
    const dealsRegex = /<aside id="recent-posts-2"[\s\S]*?<ul>([\s\S]*?)<\/ul>/;
    const dealsMatch = text.match(dealsRegex);
    
    if (!dealsMatch) return;
    
    // Get first link using regex
    const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/;
    const linkMatch = dealsMatch[1].match(linkRegex);
    
    if (!linkMatch) return;
    
    const href = linkMatch[1];
    const dealText = linkMatch[2];
    const dateMatch = href.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    
    if (!dateMatch) return;

    const dealDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    const today = new Date().toISOString().split('T')[0];

    // Check if deal is from today
    if (dealDate === today) {
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'New Flight Deal!',
        message: dealText
      });
    }

  } catch (error) {
    console.error('Error checking deals:', error);
  }
}

// Trigger check immediately when loaded
checkForNewDeals();