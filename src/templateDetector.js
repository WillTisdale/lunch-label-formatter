const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;

class TemplateDetector {
  constructor() {
    this.detectedTemplate = null;
  }

  async analyzeTemplate(templatePath) {
    try {
      const templateBytes = await fs.readFile(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      const pages = pdfDoc.getPages();
      
      if (pages.length === 0) {
        throw new Error('Template PDF has no pages');
      }

      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      // Analyze the page to detect label layout
      const template = await this.detectLabelLayout(firstPage, width, height);
      
      this.detectedTemplate = template;
      return template;
    } catch (error) {
      throw new Error(`Failed to analyze template: ${error.message}`);
    }
  }

  async detectLabelLayout(page, pageWidth, pageHeight) {
    // Convert page dimensions to inches for easier analysis
    const pageWidthInches = pageWidth / 72;
    const pageHeightInches = pageHeight / 72;

    // Common Avery label dimensions and layouts
    const knownTemplates = {
      // 1" x 2-5/8" labels (30 per sheet)
      '5160': {
        labelWidth: 2.625,
        labelHeight: 1.0,
        labelsPerRow: 3,
        labelsPerColumn: 10,
        marginTop: 0.5,
        marginLeft: 0.1875,
        horizontalGap: 0.125,
        verticalGap: 0.0
      },
      '8160': {
        labelWidth: 2.625,
        labelHeight: 1.0,
        labelsPerRow: 3,
        labelsPerColumn: 10,
        marginTop: 0.5,
        marginLeft: 0.1875,
        horizontalGap: 0.125,
        verticalGap: 0.0
      },
      // 3-1/3" x 4" labels (6 per sheet)
      '5164': {
        labelWidth: 4.0,
        labelHeight: 3.333,
        labelsPerRow: 2,
        labelsPerColumn: 3,
        marginTop: 0.5,
        marginLeft: 0.5,
        horizontalGap: 0.25,
        verticalGap: 0.25
      },
      '8164': {
        labelWidth: 4.0,
        labelHeight: 3.333,
        labelsPerRow: 2,
        labelsPerColumn: 3,
        marginTop: 0.5,
        marginLeft: 0.5,
        horizontalGap: 0.25,
        verticalGap: 0.25
      }
    };

    // Try to match the page dimensions to known templates
    const detectedTemplate = this.matchTemplateToPage(pageWidthInches, pageHeightInches, knownTemplates);
    
    if (detectedTemplate) {
      console.log(`Detected template: ${detectedTemplate.name}`);
      return detectedTemplate;
    }

    // If no known template matches, create a custom template
    console.log('No known template detected, creating custom template...');
    return this.createCustomTemplate(pageWidthInches, pageHeightInches);
  }

  matchTemplateToPage(pageWidth, pageHeight, knownTemplates) {
    // Standard page sizes
    const standardPageSizes = {
      'letter': { width: 8.5, height: 11 },
      'a4': { width: 8.27, height: 11.69 }
    };

    // Check if page matches standard sizes
    for (const [sizeName, size] of Object.entries(standardPageSizes)) {
      if (Math.abs(pageWidth - size.width) < 0.1 && Math.abs(pageHeight - size.height) < 0.1) {
        // For letter/A4 pages, assume 5160 template (most common for lunch labels)
        return {
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
      }
    }

    return null;
  }

  createCustomTemplate(pageWidth, pageHeight) {
    // Create a custom template based on page dimensions
    // This is a simplified approach - in a real implementation, you might want
    // to analyze the PDF content to detect actual label boundaries
    
    const margin = 0.5; // 0.5 inch margins
    const availableWidth = pageWidth - (2 * margin);
    const availableHeight = pageHeight - (2 * margin);
    
    // Estimate label size based on common ratios
    const estimatedLabelWidth = Math.min(availableWidth / 3, 3); // Max 3 labels per row
    const estimatedLabelHeight = Math.min(availableHeight / 10, 1.5); // Max 10 labels per column
    
    const labelsPerRow = Math.floor(availableWidth / estimatedLabelWidth);
    const labelsPerColumn = Math.floor(availableHeight / estimatedLabelHeight);
    
    return {
      name: 'custom',
      labelWidth: estimatedLabelWidth,
      labelHeight: estimatedLabelHeight,
      labelsPerRow: labelsPerRow,
      labelsPerColumn: labelsPerColumn,
      marginTop: margin,
      marginLeft: margin,
      horizontalGap: 0.125,
      verticalGap: 0.125
    };
  }

  getDetectedTemplate() {
    return this.detectedTemplate;
  }

  // Helper method to validate template dimensions
  validateTemplate(template) {
    const requiredFields = ['labelWidth', 'labelHeight', 'labelsPerRow', 'labelsPerColumn', 'marginTop', 'marginLeft'];
    
    for (const field of requiredFields) {
      if (typeof template[field] !== 'number' || template[field] <= 0) {
        throw new Error(`Invalid template: missing or invalid ${field}`);
      }
    }
    
    return true;
  }
}

module.exports = TemplateDetector; 