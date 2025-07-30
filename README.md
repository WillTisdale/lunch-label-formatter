# Lunch Label Formatter

A Node.js tool for generating Avery label PDFs for school lunch orders using pdf-lib with built-in templates and manual layout control. Perfect for school lunch ordering systems where restaurants need labels to identify each student's order.

## 🎯 Features

- **🍽️ Lunch Orders Only**: Focused specifically on school lunch orders
- **🎨 Built-in Avery Templates**: Pre-configured templates for common Avery labels (5160, 5162, 5163, 5164, 5167, etc.)
- **📏 Manual Layout Control**: Specify exact label dimensions for any template using `--manual-layout`

- **📝 Dynamic Font Sizing**: Automatically adjusts font sizes based on label dimensions
- **🖨️ Printable Borders**: All labels include borders for easy cutting and identification
- **📊 Multiple Input Formats**: Support for CSV and JSON file input
- **📱 Interactive Mode**: Enter data interactively through the command line
- **🔄 Programmatic API**: Use in your own Node.js applications
- **📁 Flexible Output**: Specify output directory, add timestamps, file info
- **🔒 Enterprise Security**: Comprehensive input validation and error handling
- **📊 Performance Monitoring**: Timing and logging for all operations

## Installation

### Option 1: Install from GitHub

```bash
# Install globally
npm install -g github:WillTisdale/lunch-label-formatter

# Or install locally in your project
npm install github:WillTisdale/lunch-label-formatter
```

### Option 2: Local Installation

```bash
# Clone the repository
git clone https://github.com/WillTisdale/lunch-label-formatter.git
cd lunch-label-formatter

# Install dependencies
npm install

# Use the tool
node src/index.js generate --file examples/lunch-orders.csv --template-name 5160 --output labels.pdf
```

## Usage

### Command Structure

```bash
./run.sh <command> [options]
```

### Available Commands

| Command | Description | Required/Optional |
|---------|-------------|-------------------|
| `generate` | Create lunch order labels | **Required** - Main command |

| `templates` | List built-in templates | **Optional** - For reference |

### Generate Labels - Detailed Options

#### **Initial Command** (Required)
```bash
./run.sh generate
```

#### **Data Source** (Choose One - Required)
```bash
--file orders.csv          # Use CSV file with lunch data
--file orders.json         # Use JSON file with lunch data  
--interactive              # Enter data manually via prompts
```

#### **Template Selection** (Choose One - Required)
```bash
--template-name 5160       # Use built-in Avery 5160 template
--template-name 8160       # Use built-in Avery 8160 template
--template-name 5162       # Use built-in Avery 5162 template
--template-name 5163       # Use built-in Avery 5163 template (shipping labels)
--template-name 8163       # Use built-in Avery 8163 template (shipping labels)
--template-name 5164       # Use built-in Avery 5164 template
--template-name 8164       # Use built-in Avery 8164 template
--template-name 5167       # Use built-in Avery 5167 template (return address labels)
--manual-layout "2:5:4:2"  # Use manual layout specification
```

#### **Output Control** (All Optional)
```bash
--output labels.pdf        # Specify output filename (default: lunch-labels.pdf)
--output-dir ./daily      # Specify output directory (default: current directory)
--timestamp               # Add timestamp to filename (e.g., labels-2025-01-15.pdf)
```

#### **Advanced Options** (All Optional)
```bash
--debug                   # Enable detailed logging for troubleshooting
--cleanup                 # Remove temporary files after generation
```

### Complete Examples

#### **Basic Usage with Built-in Template**
```bash
# Required: Command + Data + Template
./run.sh generate --file orders.csv --template-name 5160
```

#### **Custom Template with Output Directory**
```bash
# Required: Command + Data + Template
# Optional: Output directory + Timestamp
./run.sh generate --file orders.csv --template custom.pdf --output-dir ./daily --timestamp
```

#### **Interactive Mode**
```bash
# Required: Command + Interactive flag + Template
./run.sh generate --interactive --template-name 5160
```

#### **Debug Mode for Troubleshooting**
```bash
# Required: Command + Data + Template
# Optional: Debug logging
./run.sh generate --file orders.csv --template-name 5160 --debug
```

### Template Analysis

#### **Analyze Custom Template** (Optional)
```bash
# Required: Command + Template file
./run.sh analyze-template custom.pdf
```

#### **List Built-in Templates** (Optional)
```bash
# Required: Command only
./run.sh templates
```

### Command Options Reference

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `-f, --file <path>` | String | **Required** (unless `--interactive`) | Input CSV/JSON file with lunch order data |
| `-t, --template <path>` | String | Optional (deprecated) | PDF template file (use --template-name or --manual-layout instead) |
| `-o, --output <path>` | String | Optional | Output PDF filename (default: lunch-labels.pdf) |
| `-d, --output-dir <path>` | String | Optional | Output directory for PDF files |
| `-i, --interactive` | Flag | **Required** (unless `--file`) | Enter data interactively via prompts |
| `--template-name <name>` | String | **Required** (unless `--manual-layout`) | Built-in template: 5160, 8160, 5162, 5163, 8163, 5164, 8164, 5167 |
| `--manual-layout <spec>` | String | **Required** (unless `--template-name`) | Manual layout: "rows:cols:width:height" (e.g., "2:5:4:2") |
| `--timestamp` | Flag | Optional | Add timestamp to output filename |
| `--cleanup` | Flag | Optional | Remove temporary files after generation |
| `--debug` | Flag | Optional | Enable debug logging for troubleshooting |

## File Output Handling

### Output Location Options

The tool provides flexible file output handling:

#### 1. Current Directory (Default)
```bash
./run.sh generate --file orders.csv --output labels.pdf
# Creates: ./labels.pdf
```

#### 2. Specified Output Directory
```bash
./run.sh generate --file orders.csv --output-dir ./output --output labels.pdf
# Creates: ./output/labels.pdf
```

#### 3. With Timestamp
```bash
./run.sh generate --file orders.csv --output-dir ./output --timestamp
# Creates: ./output/lunch-labels-2025-07-30T03-56-10.pdf
```

#### 4. Full Path Specification
```bash
./run.sh generate --file orders.csv --output /path/to/my-labels.pdf
# Creates: /path/to/my-labels.pdf
```

### File Management Best Practices

#### For Development/Testing
```bash
# Output to current directory with timestamp
./run.sh generate --file orders.csv --timestamp
```

#### For Production Systems
```bash
# Output to dedicated directory with timestamp
./run.sh generate --file orders.csv --output-dir /var/labels --timestamp
```

#### For Integration with Other Systems
```bash
# Output to specific location for processing
./run.sh generate --file orders.csv --output /tmp/labels.pdf
```

### File Cleanup

The tool automatically:
- **Creates output directories** if they don't exist
- **Shows file information** (size and location) after generation
- **Uses absolute paths** in output messages for clarity

For automated systems, consider:
```bash
# Clean up old files (example)
find ./output -name "*.pdf" -mtime +7 -delete
```

## Data Formats

### CSV Format

```csv
orderId,studentName,grade,contents,specialInstructions
LUNCH001,Emma Johnson,3rd,Chicken Sandwich + Apple + Milk,No nuts
LUNCH002,Michael Chen,5th,Pizza + Carrots + Juice,Vegetarian
LUNCH003,Sarah Williams,2nd,Turkey Wrap + Grapes + Water,Gluten-free
```

### JSON Format

```json
[
  {
    "orderId": "LUNCH001",
    "studentName": "Emma Johnson",
    "grade": "3rd",
    "contents": "Chicken Sandwich + Apple + Milk",
    "specialInstructions": "No nuts"
  },
  {
    "orderId": "LUNCH002",
    "studentName": "Michael Chen",
    "grade": "5th",
    "contents": "Pizza + Carrots + Juice",
    "specialInstructions": "Vegetarian"
  }
]
```

## Template Detection

The tool can automatically analyze any PDF template:

1. **Upload any PDF template** (Avery, custom, etc.)
2. **Tool analyzes page dimensions** and layout
3. **Detects label positions** and spacing
4. **Generates labels** in the exact same format

### Example Template Analysis

```bash
./run.sh analyze-template my-template.pdf
```

**Output:**
```
Detected template: 5160
Template Analysis Results:
Template Name: 5160
Label Width: 2.625"
Label Height: 1"
Labels per Row: 3
Labels per Column: 10
Total Labels per Sheet: 30
Top Margin: 0.5"
Left Margin: 0.1875"
Horizontal Gap: 0.125"
Vertical Gap: 0"
```

## Supported Templates

### Built-in Templates

- **5160**: 1" x 2-5/8" (30 per sheet) - **Recommended for lunch orders**
- **8160**: 1" x 2-5/8" (30 per sheet)
- **5164**: 3-1/3" x 4" (6 per sheet)
- **8164**: 3-1/3" x 4" (6 per sheet)
- **custom**: Auto-detected from provided template

## Customization

### Adding New Avery Templates

To add a new Avery template, edit `src/templates.js` and add a new entry to the `templates` object:

```javascript
// Add a new template to the templates object:
'5168': {
  name: '5168',
  labelWidth: 3.5,        // Label width in inches
  labelHeight: 1.5,       // Label height in inches
  labelsPerRow: 2,        // Labels per row
  labelsPerColumn: 8,     // Labels per column
  marginTop: 0.5,         // Top margin in inches
  marginLeft: 0.25,       // Left margin in inches
  horizontalGap: 0.25,    // Gap between columns
  verticalGap: 0.125,     // Gap between rows
  description: '3.5" x 1.5" (16 per sheet) - Custom labels'
}
```

### Modifying Required Fields

To change the required fields for lunch orders, edit `src/dataHandler.js`:

```javascript
// In the parseCSV function, modify the requiredHeaders array:
const requiredHeaders = ['orderId', 'studentName', 'grade', 'contents'];

// In the validateLunchOrder function, modify the required fields:
const requiredFields = ['orderId', 'studentName', 'grade', 'contents'];
```

### Customizing Label Styling

The tool now uses **dynamic font sizing** that automatically adjusts based on label dimensions and includes **printable borders**:

#### Dynamic Font Sizing
Font sizes automatically adjust based on label dimensions:
- **Small labels** (like 5167): 6-7pt fonts for compact text
- **Medium labels** (like 5160): 7-9pt fonts for standard text  
- **Large labels** (like 5164): 8-12pt fonts for prominent text

#### Label Borders
All labels include **black borders** for easy cutting and identification when printed.

#### Customizing Font Sizes
To modify font sizes, edit `src/utils.js`:

```javascript
// Adjust font sizes for different label categories
const fontSizes = {
  small: {
    orderId: 6,
    studentName: 7,
    grade: 6,
    contents: 6,
    specialInstructions: 5
  },
  medium: {
    orderId: 7,
    studentName: 9,
    grade: 7,
    contents: 7,
    specialInstructions: 6
  },
  large: {
    orderId: 8,
    studentName: 12,
    grade: 8,
    contents: 8,
    specialInstructions: 7
  }
};
```

#### Layout Adjustments
```javascript
// Adjust padding (space around text)
const padding = 0.08 * 72; // 0.08 inch padding

// Adjust line height (space between lines)
const lineHeight = 10;

// Adjust maximum width for text wrapping
const maxWidth = labelWidth - (padding * 2);
```

#### Adding New Fields
To add a new field to the labels:

1. **Update data validation** in `src/dataHandler.js`:
```javascript
const requiredHeaders = ['orderId', 'studentName', 'grade', 'contents', 'newField'];
```

2. **Add field rendering** in `src/labelGenerator.js`:
```javascript
// Add new field rendering
if (order.newField) {
  const newFieldText = `New Field: ${order.newField}`;
  const newFieldWidth = font.widthOfTextAtSize(newFieldText, 7);
  if (newFieldWidth <= maxWidth) {
    page.drawText(newFieldText, {
      x: x + padding,
      y: currentY,
      size: 7,
      font: font,
      color: rgb(0, 0, 0)
    });
    currentY -= lineHeight;
  }
}
```

3. **Update interactive prompts** in `src/index.js`:
```javascript
{
  type: 'input',
  name: 'newField',
  message: 'New field:',
  validate: (input) => {
    if (!input.trim()) return 'New field is required';
    return true;
  }
}
```

## Programmatic Usage

### In Your Node.js Project

```javascript
const { createLunchLabels } = require('lunch-label-formatter');

// Generate lunch labels programmatically
const lunchOrders = [
  {
    orderId: "LUNCH001",
    studentName: "Emma Johnson",
    grade: "3rd",
    contents: "Chicken Sandwich + Apple + Milk",
    specialInstructions: "No nuts"
  }
];

// Use built-in template
const template = {
  name: '5160',
  labelWidth: 2.625,
  labelHeight: 1.0,
  labelsPerRow: 3,
  labelsPerColumn: 10,
  marginTop: 0.5,
  marginLeft: 0.1875,
  horizontalGap: 0.125,
  verticalGap: 0.0
};

await createLunchLabels(lunchOrders, template, './lunch-labels.pdf');
```

### Integration with School Lunch System

```javascript
const { createLunchLabels } = require('lunch-label-formatter');
const path = require('path');

async function generateLunchLabels(orders, outputDir = './output') {
  try {
    // Transform your order data to the expected format
    const lunchOrders = orders.map(order => ({
      orderId: order.id,
      studentName: order.studentName,
      grade: order.grade,
      contents: order.lunchItems.join(' + '),
      specialInstructions: order.dietaryRestrictions || ''
    }));

    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = path.join(outputDir, `lunch-labels-${timestamp}.pdf`);

    // Generate labels
    await createLunchLabels(lunchOrders, '5160', outputPath);
    
    console.log('Labels generated successfully!');
    return outputPath;
  } catch (error) {
    console.error('Error generating labels:', error);
    throw error;
  }
}

// Usage in your system
const todaysOrders = await getTodaysLunchOrders();
const labelFile = await generateLunchLabels(todaysOrders, '/var/labels');
```

### Automated Daily Process

```javascript
// Cron job or scheduled task
const cron = require('node-cron');
const { createLunchLabels } = require('lunch-label-formatter');
const path = require('path');

// Run every morning at 6 AM
cron.schedule('0 6 * * *', async () => {
  try {
    // Get today's orders
    const todaysOrders = await getTodaysOrders();
    
    // Create output directory
    const outputDir = '/var/labels/daily';
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `labels-${timestamp}.pdf`);
    
    // Generate labels
    await createLunchLabels(todaysOrders, '5160', outputPath);
    
    console.log('Daily labels generated successfully');
    
    // Optional: Clean up old files (older than 30 days)
    const fs = require('fs').promises;
    const files = await fs.readdir(outputDir);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stats = await fs.stat(filePath);
      if (stats.mtime < thirtyDaysAgo) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error generating daily labels:', error);
  }
});
```

## Generated Label Layout

Each lunch label includes:

```
#LUNCH001
Emma Johnson
Grade: 3rd
Chicken Sandwich + Apple + Milk
* No nuts
```

## Examples

### Example 1: Generate Labels from CSV

Create a file `orders.csv`:
```csv
orderId,studentName,grade,contents,specialInstructions
LUNCH001,Emma Johnson,3rd,Chicken Sandwich + Apple + Milk,No nuts
LUNCH002,Michael Chen,5th,Pizza + Carrots + Juice,Vegetarian
LUNCH003,Sarah Williams,2nd,Turkey Wrap + Grapes + Water,Gluten-free
```

Run the command:
```bash
./run.sh generate --file orders.csv --template-name 5160 --output lunch-labels.pdf
```

### Example 2: Generate Labels from JSON

Create a file `orders.json`:
```json
[
  {
    "orderId": "LUNCH001",
    "studentName": "Emma Johnson",
    "grade": "3rd",
    "contents": "Chicken Sandwich + Apple + Milk",
    "specialInstructions": "No nuts"
  },
  {
    "orderId": "LUNCH002",
    "studentName": "Michael Chen",
    "grade": "5th",
    "contents": "Pizza + Carrots + Juice",
    "specialInstructions": "Vegetarian"
  }
]
```

Run the command:
```bash
./run.sh generate --file orders.json --template-name 5160 --output my-labels.pdf
```

### Example 3: Use Custom Template

```bash
# Analyze your custom template
./run.sh analyze-template my-custom-template.pdf

# Generate labels using the analyzed template
./run.sh generate --file orders.csv --template my-custom-template.pdf --output labels.pdf
```

### Example 4: Output with Timestamp

```bash
# Generate labels with timestamp in output directory
./run.sh generate --file orders.csv --output-dir ./daily-labels --timestamp
# Creates: ./daily-labels/lunch-labels-2025-07-30T03-56-10.pdf
```

## School Lunch Order Workflow

This tool is specifically designed for school lunch ordering systems:

1. **Parents place orders** through your ordering system
2. **Export order data** to CSV or JSON format
3. **Generate labels** using this tool
4. **Print labels** on Avery 5160 sheets
5. **Restaurants attach labels** to each lunch order
6. **School staff easily identify** each student's lunch

## Enterprise-Level Features

### 🔒 Security & Input Validation

- **Path traversal protection** (null bytes, `..` paths)
- **Input sanitization** and field length limits
- **File extension validation** (`.json`, `.csv` only)
- **Comprehensive data validation** for all inputs

### 📊 Error Handling & Logging

- **Structured logging** with icons and timing
- **Debug mode** for troubleshooting
- **Helpful error tips** and suggestions
- **Performance monitoring** for all operations

### 🏗️ Code Quality & Standards

- **ESLint configuration** for code standards
- **Prettier formatting** for consistency
- **Modular architecture** with clear separation
- **Comprehensive `.gitignore`** file

### 📁 File Management

- **Flexible output handling** with directories
- **Timestamped files** for versioning
- **Clean project structure** (removed unnecessary files)
- **Automatic directory creation**

### 🚀 Performance & Efficiency

- **Optimized PDF generation** (~0.03s for 10 labels)
- **Smart text truncation** for long content
- **Memory-efficient** operations
- **Scalable** for large datasets

## Project Structure

```
Label Formatter/
├── src/
│   ├── index.js              # Main CLI entry point
│   ├── labelGenerator.js     # PDF generation logic (customize styling here)
│   ├── dataHandler.js        # File I/O and data validation (modify fields here)
│   ├── templates.js          # Built-in template definitions
│   └── utils.js              # Utility functions
├── examples/
│   ├── lunch-orders.csv      # Sample lunch order data
│   └── lunch-orders.json     # Sample lunch order data
├── example-output/
│   ├── 5160-example.pdf      # Sample 5160 labels
│   ├── 5167-example.pdf      # Sample 5167 labels
│   └── 5164-example.pdf      # Sample 5164 labels
├── package.json
├── README.md
├── run.sh                    # Simple script to run the tool
├── .gitignore               # Comprehensive ignore file
├── .eslintrc.js             # Code quality rules
└── .prettierrc              # Code formatting rules
```

## Development

### Quality Assurance

```bash
# Run all quality checks
npm run validate

# Individual checks
npm run lint          # Code quality
npm run test          # Unit tests
npm run security      # Security audit
npm run format        # Code formatting
```

### Adding New Templates

To add support for new templates, edit the `templates` object in `src/templates.js`:

```javascript
// Add a new template to the templates object:
'NEW_TEMPLATE': {
  name: 'NEW_TEMPLATE',
  labelWidth: 2.625,
  labelHeight: 1.0,
  labelsPerRow: 3,
  labelsPerColumn: 10,
  marginTop: 0.5,
  marginLeft: 0.1875,
  horizontalGap: 0.125,
  verticalGap: 0.0,
  description: '2-5/8" x 1" (30 per sheet) - Custom labels'
}
```

### Debug Mode

To enable debug logging, use the `--debug` flag:

```bash
./run.sh generate --file orders.csv --template-name 5160 --debug
```

This will show detailed information about the generation process, including timing and validation steps.

## Troubleshooting

### Common Issues

1. **"Command not found"**: Use `./run.sh` instead of `lunch-label-formatter`
2. **"File not found"**: Check file paths and permissions
3. **"Template not supported"**: Use `./run.sh templates` to see available options
4. **"Missing required field"**: Ensure all required fields are present in your data
5. **PDF generation fails**: Check that the output directory is writable
6. **Permission denied**: Ensure you have write permissions to the output directory

### Getting Help

```bash
# Show help for specific command
./run.sh generate --help

# List available templates
./run.sh templates

# Test with sample data
./run.sh generate --file examples/lunch-orders.csv --template-name 5160 --output test.pdf

# Test with debug mode
./run.sh generate --file examples/lunch-orders.csv --debug
```

## Performance Metrics

### Current Performance
- **PDF generation**: ~0.03s for 10 labels
- **Memory usage**: Minimal (no memory leaks)
- **File I/O**: Optimized with async/await
- **Error recovery**: Immediate with helpful messages

### Scalability
- **Supports large datasets** (tested with 100+ labels)
- **Efficient template analysis**
- **Smart text truncation**
- **Optimized font handling**

## License

MIT License - see LICENSE file for details. 