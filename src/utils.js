// Utility functions for the label formatter

// Dynamic font sizing based on label dimensions
function calculateFontSizes(template) {
  const labelWidth = template.labelWidth;
  const labelHeight = template.labelHeight;
  
  // Base font sizes for different label sizes
  const fontSizes = {
    // Small labels (like 5167: 1.75" x 0.5")
    small: {
      orderId: 6,
      studentName: 7,
      grade: 6,
      contents: 6,
      specialInstructions: 5
    },
    // Medium labels (like 5160: 2.625" x 1")
    medium: {
      orderId: 7,
      studentName: 9,
      grade: 7,
      contents: 7,
      specialInstructions: 6
    },
    // Large labels (like 5164: 4" x 3.333")
    large: {
      orderId: 8,
      studentName: 12,
      grade: 8,
      contents: 8,
      specialInstructions: 7
    }
  };
  
  // Determine label size category
  let sizeCategory = 'medium';
  if (labelWidth < 2 || labelHeight < 0.75) {
    sizeCategory = 'small';
  } else if (labelWidth > 3.5 || labelHeight > 2) {
    sizeCategory = 'large';
  }
  
  return fontSizes[sizeCategory];
}

module.exports = {
  calculateFontSizes
}; 