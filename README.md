# 🏭 WorCoor - Warehouse Management System

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

**WorCoor** is a professional, enterprise-grade warehouse management system designed for modern logistics operations. Built with React and featuring advanced organizational unit management, sequential SKU tracking, and intuitive drag-and-drop layout design.

![WorCoor Dashboard](https://via.placeholder.com/800x400/2563eb/ffffff?text=WorCoor+Warehouse+Management+System)

## 🌟 Key Features

### 🏢 **Organizational Unit Management**
- **Multi-Unit Support**: Manage multiple warehouses, distribution centers, and storage facilities
- **Professional Dropdown**: Intuitive org unit selector in top navigation
- **Auto-Naming**: Automatic layout naming based on selected organizational unit
- **10 Pre-configured Units**: Warehouses, Distribution Centers, Cold Storage, Processing Facilities

### 📦 **Advanced SKU Management**
- **Sequential ID System**: Professional SKU IDs (SKU ID 001, 002, 003...)
- **Smart Dropdown Selector**: Choose from available sequential or custom IDs
- **Duplicate Prevention**: Automatic tracking and conflict prevention
- **Universal Access**: Consistent interface across Properties Panel and direct canvas interaction

### 🎨 **Professional Layout Designer**
- **Drag & Drop Interface**: Intuitive component placement and arrangement
- **Storage Components**: Specialized Storage Units and Storage Racks
- **Zone Management**: Functional area containers (Storage, Receiving, Dispatch)
- **Grid-Based Precision**: 60px grid system for professional alignment

### 🔧 **Enhanced User Experience**
- **Modern UI/UX**: Clean, professional interface with glass-morphism effects
- **Responsive Design**: Works seamlessly across different screen sizes
- **Real-time Updates**: Live inventory tracking and status management
- **Export Capabilities**: Multiple export formats (PNG, SVG, PDF)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.0 or higher
- **npm** 8.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yash-surviantllc/WorCoor.git
   cd WorCoor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Production Build
```bash
npm run build
```

## 📖 Usage Guide

### Getting Started

1. **Select Organizational Unit**
   - Click the dropdown in the top navigation bar
   - Choose from 10 pre-configured organizational units
   - Layout will be automatically named (e.g., "Warehouse 1 Layout")

2. **Design Your Layout**
   - Drag components from the left panel to the canvas
   - Use Storage Components for inventory management
   - Add boundaries and zones for organization

3. **Manage SKUs**
   - Click on Storage Rack compartments
   - Select from sequential SKU IDs (SKU ID 001, 002, 003...)
   - Or enter custom SKU identifiers

4. **Save and Export**
   - Save layouts with organizational context
   - Export to multiple formats for documentation

### Component Categories

| Category | Components | Purpose |
|----------|------------|---------|
| **Floor Plan** | Square Boundary | Main layout definition |
| **Boundaries** | Solid/Dotted Boundaries | Area separation |
| **Storage Components** | Storage Unit, Storage Racks | Inventory management |
| **Zone Types** | Storage, Receiving, Dispatch Zones | Functional areas |
| **Unit Types** | Storage Bay, Pallet Position | Individual units |

## 🏗️ Architecture

### Project Structure
```
WorCoor/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── SkuIdSelector.js       # Sequential SKU ID management
│   │   ├── TopNavbar.js           # Enhanced navigation with org units
│   │   ├── WarehouseCanvas.js     # Main design canvas
│   │   ├── PropertiesPanel.js     # Component properties management
│   │   └── ...
│   ├── constants/          # Application constants
│   │   └── warehouseComponents.js # Component definitions
│   ├── utils/              # Utility functions
│   │   ├── layoutCropper.js       # Layout optimization
│   │   ├── exportUtils.js         # Export functionality
│   │   └── ...
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

### Key Technologies
- **Frontend**: React 18.2.0, React DnD for drag-and-drop
- **Styling**: CSS3 with custom properties, modern animations
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Build Tools**: Create React App, Webpack
- **Deployment**: Netlify/Vercel ready

## 🎯 Core Features Deep Dive

### Organizational Unit System
```javascript
// 10 Pre-configured Organizational Units
const orgUnits = [
  { id: 'warehouse-1', name: 'Warehouse 1', location: 'Building A' },
  { id: 'warehouse-2', name: 'Warehouse 2', location: 'Building B' },
  { id: 'warehouse-3', name: 'Warehouse 3', location: 'Building C' },
  { id: 'distribution-center-1', name: 'Distribution Center 1', location: 'Building D' },
  { id: 'distribution-center-2', name: 'Distribution Center 2', location: 'Building E' },
  { id: 'cold-storage-1', name: 'Cold Storage 1', location: 'Building F' },
  { id: 'cold-storage-2', name: 'Cold Storage 2', location: 'Building G' },
  { id: 'processing-facility', name: 'Processing Facility', location: 'Building H' },
  { id: 'returns-center', name: 'Returns Center', location: 'Building I' },
  { id: 'cross-dock', name: 'Cross Dock', location: 'Building J' }
];
```

### Sequential SKU Management
- **Range**: SKU ID 001 to SKU ID 999
- **Auto-tracking**: Prevents duplicate assignments
- **Custom IDs**: Support for custom naming conventions
- **Real-time validation**: Immediate feedback on ID availability

### Professional Grid System
- **Base Grid**: 60px × 60px for perfect alignment
- **Component Sizes**: All components designed in grid multiples
- **Snap-to-Grid**: Automatic alignment for professional layouts
- **Precision**: CAD-like accuracy for warehouse design

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=your-api-endpoint
REACT_APP_ENVIRONMENT=production
```

### Deployment Configuration

#### Netlify (`netlify.toml`)
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
```bash
npm run test:e2e
```

## 📈 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for performance
- **Efficient Rendering**: Optimized re-renders with useCallback
- **Bundle Optimization**: Webpack optimizations for production

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

## 🔒 Security

### Security Features
- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Token-based request validation
- **Secure Headers**: Security headers configured for deployment

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow React best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes ESLint checks

## 📝 API Documentation

### Core Methods

#### Organizational Unit Management
```javascript
// Select organizational unit
handleOrgUnitSelect(selection)

// Get current org unit
getCurrentOrgUnit()
```

#### SKU Management
```javascript
// Request SKU ID selection
handleSkuIdRequest(itemId, compartmentId, row, col)

// Get existing SKU IDs
getExistingSkuIds(itemId)

// Generate sequential SKU ID
generateSequentialSkuId(existingIds)
```

#### Layout Management
```javascript
// Save layout with org unit context
handleSave()

// Export layout
handleExportLayout(format) // 'png', 'svg', 'pdf'

// Load layout
handleLoad(layoutData)
```

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Fails
```bash
# Check for ESLint errors
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Performance Issues
- Check browser console for errors
- Verify React DevTools for unnecessary re-renders
- Monitor network tab for large asset loads

## 📊 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release with full warehouse management system
- ✅ Organizational unit dropdown system
- ✅ Sequential SKU ID management
- ✅ Enhanced Storage Racks with professional interface
- ✅ Streamlined component categories
- ✅ Modern UI/UX with professional styling

### Upcoming Features
- 🔄 Real-time collaboration
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app support
- 🔄 API integration for external systems
- 🔄 Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Core Contributors
- **Yash Raj Jaiswal** - Lead Developer & Project Owner
- **Surviant LLC** - Development Partner

### Acknowledgments
- React team for the amazing framework
- Open source community for inspiration
- Beta testers for valuable feedback

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Contact Information
- **GitHub**: [@yash-surviantllc](https://github.com/yash-surviantllc)
- **Repository**: [WorCoor](https://github.com/yash-surviantllc/WorCoor)
- **Website**: [Coming Soon]

---

<div align="center">

**Built with ❤️ for modern warehouse management**

[⭐ Star this repo](https://github.com/yash-surviantllc/WorCoor) | [🐛 Report Bug](https://github.com/yash-surviantllc/WorCoor/issues) | [💡 Request Feature](https://github.com/yash-surviantllc/WorCoor/issues)

</div>
