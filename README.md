# Equipment Inventory Manager

A web-based inventory management system for tracking hospital equipment, patient slings, and other medical devices. Features step-by-step data entry, search functionality, pivot tables, and CSV/Excel import/export.

## Features

### ✨ Key Features
- **Step-by-Step Data Entry**: 4-step wizard prevents data entry mistakes
- **Import/Export**: Upload existing Excel/CSV files and export your data
- **Search**: Quick search across all fields
- **Pivot Tables**: Group and analyze data by location, equipment type, condition, or pass status
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Data persists in your browser
- **Multi-Device Access**: Deploy to web hosting for access anywhere

### 📋 Data Fields
- Serial Number
- Equipment Type (e.g., MAXIMOVE 3, SARA STEDY)
- Location (e.g., T12 NORTH, T16 SOUTH)
- S.W.L (Safe Working Load)
- Y.O.M (Year of Manufacture)
- Condition (Excellent/Good/Fair/Poor)
- Use Hours
- Last Service Date
- This Service Date
- Time
- Pass Status (✔️/❌/⚠️)
- Strap Kit Due
- Notes

## Getting Started

### Local Development
1. Extract all files to a folder
2. Open `index.html` in a web browser
3. Start adding equipment or import existing data

### Import Your Existing Data
1. Click "📤 Import Excel/CSV"
2. Select your .xlsx or .csv file
3. Confirm the import
4. Your data will be added to the system

## Deployment Options

### Option 1: Netlify (Recommended)
1. Create a free account at [netlify.com](https://netlify.com)
2. Drag and drop these files into the Netlify deployment zone:
   - index.html
   - styles.css
   - app.js
3. Your site will be live in seconds with a URL like `your-site.netlify.app`
4. Optional: Add a custom domain in Netlify settings

### Option 2: Cloudflare Pages
1. Create a free account at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project" > "Upload assets"
3. Drag and drop all three files
4. Deploy and get your URL

### Option 3: GitHub Pages
1. Create a GitHub repository
2. Upload all three files
3. Go to Settings > Pages
4. Select "main" branch as source
5. Your site will be at `username.github.io/repository-name`

### Option 4: Vercel
1. Create account at [vercel.com](https://vercel.com)
2. Import project or drag and drop files
3. Deploy instantly

## Usage Guide

### Adding New Items
1. Click "➕ Add New Item"
2. Follow the 4-step wizard:
   - **Step 1**: Serial number, equipment type, location
   - **Step 2**: Specifications (SWL, YOM, condition, hours)
   - **Step 3**: Service information and dates
   - **Step 4**: Additional notes
3. Click "💾 Save Item"

### Editing Items
1. Find the item in the list
2. Click "✏️ Edit"
3. Make changes
4. Click "💾 Save Item"

### Searching
1. Enter search term (serial number, location, equipment, etc.)
2. Click "🔍 Search" or press Enter
3. Click "✕ Clear" to show all items again

### Pivot Tables
1. Click "📈 Pivot Table"
2. Select grouping: Location, Equipment Type, Condition, or Pass Status
3. View summary with item counts
4. Export pivot data with "📥 Export Pivot CSV"

### Exporting Data
- **CSV**: Compatible with Excel, Google Sheets, Numbers
- **Excel**: Native .xlsx format with proper formatting
- Exports include the location/title header

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Data Storage

- **Local Storage**: Data is saved in your browser automatically
- **Browser-Specific**: Each browser has separate data
- **Backup**: Export regularly to CSV/Excel for backups
- **Multi-Device**: Deploy to web hosting to access from anywhere

## Customization

### Changing Colors
Edit `styles.css` and modify the CSS variables:
```css
:root {
    --primary-color: #2563eb;  /* Main color */
    --success-color: #10b981;  /* Success buttons */
    --danger-color: #ef4444;   /* Delete buttons */
}
```

### Adding Equipment Types
Open `index.html` and find the `<datalist id="equipmentList">` section:
```html
<datalist id="equipmentList">
    <option value="MAXIMOVE 3">
    <option value="SARA STEDY">
    <option value="YOUR NEW TYPE">
</datalist>
```

## Technical Details

### Files
- **index.html**: Main structure and layout
- **styles.css**: Styling and responsive design
- **app.js**: All functionality and logic

### Libraries Used
- **SheetJS (XLSX.js)**: Excel file handling
- CDN hosted, no local installation needed

### Data Format
Data is stored as JSON in browser's localStorage:
```json
{
  "inventory": [
    {
      "serialNumber": "300361201",
      "equipment": "MAXIMOVE 3",
      "location": "T12 NORTH",
      ...
    }
  ],
  "locationTitle": "UCLH NOVEMBER 2025 - EGA"
}
```

## Support

### Common Issues

**Q: My data disappeared**
- Data is stored per browser. Use the same browser or export/import data
- Export regularly to CSV/Excel as backup

**Q: Import not working**
- Ensure first row contains headers
- Check file format (.xlsx or .csv)
- Try exporting a sample and use as template

**Q: Can't access on other devices**
- Deploy to Netlify/Cloudflare for multi-device access
- Or export/import data between devices

**Q: Need to share with team**
- Deploy to web hosting
- Share the deployment URL with team members
- Each person can export their own data

## Future Enhancements

Possible additions:
- [ ] User authentication
- [ ] Cloud database sync
- [ ] Barcode scanning
- [ ] Photo attachments
- [ ] Service reminders/alerts
- [ ] PDF report generation
- [ ] Advanced filtering
- [ ] Data validation rules

## License

Free to use and modify for your organization.

## Credits

Built with modern web technologies:
- HTML5
- CSS3
- JavaScript (ES6+)
- SheetJS (XLSX.js)

---

**Need Help?** Contact your IT department or web developer for deployment assistance.

**Backup Reminder**: Export your data regularly to CSV/Excel as a backup!
