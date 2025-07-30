const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// Import font sizing function from utils
const { calculateFontSizes } = require('./utils');

// Enterprise-level logging
const log = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  warning: (msg) => console.log(`⚠ ${msg}`),
  error: (msg) => console.error(`✗ ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log(`🔍 ${msg}`)
};

// Input validation utilities
const validateInput = {
  isValidTemplate: (template) => {
    if (!template || typeof template !== 'object') {
      throw new Error('Template must be a valid object');
    }
    
    const requiredFields = ['labelWidth', 'labelHeight', 'labelsPerRow', 'labelsPerColumn', 'marginTop', 'marginLeft'];
    const missingFields = requiredFields.filter(field => typeof template[field] !== 'number' || template[field] <= 0);
    
    if (missingFields.length > 0) {
      throw new Error(`Template missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate reasonable ranges
    if (template.labelWidth > 10 || template.labelHeight > 10) {
      throw new Error('Label dimensions too large (max 10 inches)');
    }
    
    if (template.labelsPerRow > 10 || template.labelsPerColumn > 20) {
      throw new Error('Too many labels per page');
    }
    
    return true;
  },
  
  isValidLunchOrder: (order) => {
    if (!order || typeof order !== 'object') {
      throw new Error('Order must be a valid object');
    }
    
    const requiredFields = ['orderId', 'studentName', 'grade', 'contents'];
    const missingFields = requiredFields.filter(field => !order[field] || order[field].trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error(`Order missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  },
  
  isValidOutputPath: (outputPath) => {
    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error('Output path must be a valid string');
    }
    
    if (outputPath.length === 0) {
      throw new Error('Output path cannot be empty');
    }
    
    if (outputPath.includes('\0')) {
      throw new Error('Output path contains invalid characters');
    }
    
    return true;
  }
};

// Page dimensions (8.5" x 11")
const PAGE_WIDTH = 8.5 * 72; // Convert to points
const PAGE_HEIGHT = 11 * 72; // Convert to points

async function createLunchLabels(lunchOrders, template, outputPath) {
  const startTime = Date.now();
  
  try {
    log.debug('Starting lunch label generation...');
    
    // Validate inputs
    if (!Array.isArray(lunchOrders)) {
      throw new Error('Lunch orders must be an array');
    }
    
    if (lunchOrders.length === 0) {
      throw new Error('Lunch orders array cannot be empty');
    }
    
    validateInput.isValidTemplate(template);
    validateInput.isValidOutputPath(outputPath);
    
    // Validate all orders
    log.debug('Validating lunch orders...');
    for (let i = 0; i < lunchOrders.length; i++) {
      try {
        validateInput.isValidLunchOrder(lunchOrders[i]);
      } catch (error) {
        throw new Error(`Order ${i + 1}: ${error.message}`);
      }
    }
    
    log.info(`Generating PDF with ${lunchOrders.length} labels...`);
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let currentPage = null;
    let labelIndex = 0;
    let labelsOnCurrentPage = 0;
    let pageCount = 0;

    for (const order of lunchOrders) {
      if (labelIndex % (template.labelsPerRow * template.labelsPerColumn) === 0) {
        currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        labelsOnCurrentPage = 0;
        pageCount++;
        log.debug(`Created page ${pageCount}`);
      }

      const row = Math.floor(labelsOnCurrentPage / template.labelsPerRow);
      const col = labelsOnCurrentPage % template.labelsPerRow;

      // Calculate label position in points
      const labelWidthPoints = template.labelWidth * 72;
      const labelHeightPoints = template.labelHeight * 72;
      const marginLeftPoints = template.marginLeft * 72;
      const marginTopPoints = template.marginTop * 72;
      const horizontalGapPoints = template.horizontalGap * 72;
      const verticalGapPoints = template.verticalGap * 72;
      
      const x = marginLeftPoints + col * (labelWidthPoints + horizontalGapPoints);
      const y = PAGE_HEIGHT - (marginTopPoints + row * (labelHeightPoints + verticalGapPoints)) - labelHeightPoints;

      // Validate label position with more detailed error message
      if (x < 0) {
        throw new Error(`Label ${labelIndex + 1} would be positioned too far left (x=${x} points)`);
      }
      if (y < 0) {
        throw new Error(`Label ${labelIndex + 1} would be positioned too far down (y=${y} points)`);
      }
      if (x + labelWidthPoints > PAGE_WIDTH) {
        throw new Error(`Label ${labelIndex + 1} would extend beyond right edge (x=${x}, width=${labelWidthPoints}, page width=${PAGE_WIDTH})`);
      }
      if (y + labelHeightPoints > PAGE_HEIGHT) {
        throw new Error(`Label ${labelIndex + 1} would extend beyond top edge (y=${y}, height=${labelHeightPoints}, page height=${PAGE_HEIGHT})`);
      }

      // Draw lunch label content
      await drawLunchLabel(currentPage, order, x, y, template, font, boldFont);

      labelIndex++;
      labelsOnCurrentPage++;
    }

    log.debug('Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (outputDir !== '.') {
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    await fs.writeFile(outputPath, pdfBytes);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log.success(`PDF generated successfully in ${duration}s`);
    log.info(`Total pages: ${pageCount}`);
    log.info(`Total labels: ${labelIndex}`);
    
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log.error(`PDF generation failed after ${duration}s`);
    throw error;
  }
}

async function drawLunchLabel(page, order, x, y, template, font, boldFont) {
  try {
              const labelWidth = template.labelWidth * 72;
          const labelHeight = template.labelHeight * 72;
          
          // Dynamic padding based on label size
          let padding;
          if (template.labelWidth < 2 || template.labelHeight < 0.75) {
            // Small labels (like 5167) - minimal padding
            padding = 0.05 * 72; // 0.05 inch padding
          } else if (template.labelWidth > 3.5 || template.labelHeight > 2) {
            // Large labels (like 5164) - generous padding
            padding = 0.2 * 72; // 0.2 inch padding
          } else {
            // Medium labels (like 5160) - standard padding
            padding = 0.12 * 72; // 0.12 inch padding
          }

    // Calculate dynamic font sizes based on label dimensions
    const fontSizes = calculateFontSizes(template);
    
              // Calculate dynamic line height based on label height
          const availableHeight = labelHeight - (padding * 2);
          
          // Use tighter line spacing for better field grouping
          let lineHeight;
          if (template.labelWidth < 2 || template.labelHeight < 0.75) {
            // Small labels - very tight spacing
            lineHeight = 8;
          } else if (template.labelWidth > 3.5 || template.labelHeight > 2) {
            // Large labels - comfortable spacing
            lineHeight = 12;
          } else {
            // Medium labels - standard spacing
            lineHeight = 10;
          }

    // Draw label border for printing
    page.drawRectangle({
      x, y, width: labelWidth, height: labelHeight,
      borderColor: rgb(0, 0, 0), // Black border
      borderWidth: 0.5 // Thin border
    });

              let currentY = y + labelHeight - padding - (lineHeight * 0.5); // Start closer to top
    const maxWidth = labelWidth - (padding * 2);

    // Order ID (small, at top)
    if (order.orderId) {
      const orderIdText = `#${order.orderId}`;
      const orderIdWidth = font.widthOfTextAtSize(orderIdText, fontSizes.orderId);
      if (orderIdWidth <= maxWidth) {
        page.drawText(orderIdText, {
          x: x + padding,
          y: currentY,
          size: fontSizes.orderId,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.3)
        });
        currentY -= lineHeight;
      } else {
        log.warning(`Order ID "${orderIdText}" too long for label width`);
      }
    }

    // Student name (larger, prominent)
    if (order.studentName) {
      const nameText = order.studentName;
      const nameWidth = boldFont.widthOfTextAtSize(nameText, fontSizes.studentName);
      if (nameWidth <= maxWidth) {
        page.drawText(nameText, {
          x: x + padding,
          y: currentY,
          size: fontSizes.studentName,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        currentY -= lineHeight;
      } else {
        // Truncate name if too long
        let truncatedName = nameText;
        while (boldFont.widthOfTextAtSize(truncatedName + '...', fontSizes.studentName) > maxWidth && truncatedName.length > 0) {
          truncatedName = truncatedName.slice(0, -1);
        }
        if (truncatedName.length > 0) {
          page.drawText(truncatedName + '...', {
            x: x + padding,
            y: currentY,
            size: fontSizes.studentName,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
        }
        currentY -= lineHeight;
        log.warning(`Student name "${nameText}" truncated to fit label`);
      }
    }

    // Grade
    if (order.grade) {
      const gradeText = `Grade: ${order.grade}`;
      const gradeWidth = font.widthOfTextAtSize(gradeText, fontSizes.grade);
      if (gradeWidth <= maxWidth) {
        page.drawText(gradeText, {
          x: x + padding,
          y: currentY,
          size: fontSizes.grade,
          font: font,
          color: rgb(0, 0, 0)
        });
        currentY -= lineHeight;
      } else {
        log.warning(`Grade text "${gradeText}" too long for label width`);
      }
    }

    // Contents (may need to wrap)
    if (order.contents) {
      const contentsText = order.contents;
      const words = contentsText.split(' ');
      let currentLine = '';
      let linesDrawn = 0;
      const maxLines = 3; // Limit to 3 lines for contents
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSizes.contents);
        
        if (testWidth <= maxWidth && linesDrawn < maxLines) {
          currentLine = testLine;
        } else {
          if (currentLine && linesDrawn < maxLines) {
            page.drawText(currentLine, {
              x: x + padding,
              y: currentY,
              size: fontSizes.contents,
              font: font,
              color: rgb(0, 0, 0)
            });
            currentY -= lineHeight;
            linesDrawn++;
          }
          currentLine = word;
        }
      }
      
      // Draw remaining line
      if (currentLine && linesDrawn < maxLines) {
        page.drawText(currentLine, {
          x: x + padding,
          y: currentY,
          size: fontSizes.contents,
          font: font,
          color: rgb(0, 0, 0)
        });
        currentY -= lineHeight;
      }
      
      if (linesDrawn >= maxLines && words.length > 0) {
        log.warning(`Contents for order ${order.orderId} truncated to fit label`);
      }
    }

    // Special instructions (if space allows)
    if (order.specialInstructions && order.specialInstructions.trim()) {
      const instructionsText = `* ${order.specialInstructions}`;
      const instructionsWidth = font.widthOfTextAtSize(instructionsText, fontSizes.specialInstructions);
      if (instructionsWidth <= maxWidth && currentY > y + padding) {
        page.drawText(instructionsText, {
          x: x + padding,
          y: currentY,
          size: fontSizes.specialInstructions,
          font: font,
          color: rgb(0.5, 0, 0)
        });
      } else if (order.specialInstructions.trim()) {
        log.warning(`Special instructions for order ${order.orderId} omitted due to space constraints`);
      }
    }
    
  } catch (error) {
    throw new Error(`Failed to draw label for order ${order.orderId}: ${error.message}`);
  }
}

module.exports = {
  createLunchLabels
}; 