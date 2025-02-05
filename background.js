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
    // Get already notified deals for today
    const today = new Date();
    const todayString = today.toDateString(); // Fixed: added () to call the function
    //const yesterday = new Date(today); // for testing
    //yesterday.setDate(today.getDate() - 1); // for testing
    const storage = await chrome.storage.local.get('notifiedDeals');
    const notifiedDeals = storage.notifiedDeals || {};
    
    // Clear old notifications (keep only today's)
    for (let date in notifiedDeals) {
      if (date !== todayString) {
        delete notifiedDeals[date];
      }
    }

    const response = await fetch('https://lentodiilit.fi/');
    const text = await response.text();
    
    // Use regex to extract the information instead of DOMParser
    const dealsRegex = /<aside id="recent-posts-2"[\s\S]*?<ul>([\s\S]*?)<\/ul>/;
    const dealsMatch = text.match(dealsRegex);
    
    if (!dealsMatch) return;
    
    // 修改为全局匹配所有链接
    const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const dealsContent = dealsMatch[1];
    let linkMatch;
    let todayDeals = [];
    let todayUrls = []; // Add array to store URLs
    
    while ((linkMatch = linkRegex.exec(dealsContent)) !== null) {
      const href = linkMatch[1];
      const dealText = linkMatch[2];
      
      // Fixed: use todayString instead of today object
      if (notifiedDeals[todayString]?.includes(href)) {
        console.log('Skip already notified deal:', href);
        continue;
      }

      const dateMatch = href.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
      if (!dateMatch) continue;

      const dealDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      if (dealDate.toDateString() === todayString) {
        try {
          const translateResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fi&tl=en&dt=t&q=${encodeURIComponent(dealText)}`);
          const translation = await translateResponse.json();
          const translatedText = translation[0][0][0];
          todayDeals.push(`${translatedText}`);
          todayUrls.push(href); // Store the URL
        } catch (translateError) {
          todayDeals.push(dealText);
          todayUrls.push(href); // Store the URL even if translation fails
          console.error('Translation error:', translateError);
        }
      }
    }

    if (todayDeals.length > 0) {
      const message = todayDeals.join('\n\n');
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: `Today's Flight Deals (${todayDeals.length})`,
        message: message
      });

      // Store the notified deals using the collected URLs
      // Fixed: initialize array if undefined
      notifiedDeals[todayString] = notifiedDeals[todayString] || [];
      notifiedDeals[todayString].push(...todayUrls);
      
      // Debug log
      console.log('Storing notified deals:', notifiedDeals);
      
      await chrome.storage.local.set({ notifiedDeals });
    }

  } catch (error) {
    console.error('Error checking deals:', error);
  }
}

// Trigger check immediately when loaded
checkForNewDeals();