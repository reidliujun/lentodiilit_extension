# Lentodiilit Flight Deals Notifier

A Chrome extension that monitors and notifies you about new flight deals from lentodiilit.fi.

## Features

- 🔔 Real-time notifications for new flight deals
- 🕒 Hourly checks for updates
- 💡 Runs silently in the background
- 🔄 Automatic updates when browser starts

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Allow the required permissions

### For Development
1. Clone this repository
```bash
git clone https://github.com/reidliujun/lentodiilit_extension
cd lentodiilit_extension
```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension directory
## Permissions Used
- notifications : To show deal alerts
- storage : To store last check date
- alarms : For periodic checks
- host_permissions : Access to lentodiilit.fi

## Development

### Generate Icons
```bash
npm install canvas
node generate-icons.js
```

### Create Distribution Package
```bash
zip -r lentodiilit_extension.zip manifest.json background.js icon48.png icon128.png README.md
```

## License
MIT License

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.