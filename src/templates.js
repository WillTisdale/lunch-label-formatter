// Avery label template configurations
// This file contains all built-in Avery label template specifications
// To add new templates, simply add them to this object

const templates = {
  // 1" x 2-5/8" labels (30 per sheet) - Recommended for lunch orders
  '5160': {
    name: '5160',
    labelWidth: 2.625,
    labelHeight: 1.0,
    labelsPerRow: 3,
    labelsPerColumn: 10,
    marginTop: 0.5,
    marginLeft: 0.1875,
    horizontalGap: 0.125,
    verticalGap: 0.0,
    description: '1" x 2-5/8" (30 per sheet) - Recommended for lunch orders'
  },
  '8160': {
    name: '8160',
    labelWidth: 2.625,
    labelHeight: 1.0,
    labelsPerRow: 3,
    labelsPerColumn: 10,
    marginTop: 0.5,
    marginLeft: 0.1875,
    horizontalGap: 0.125,
    verticalGap: 0.0,
    description: '1" x 2-5/8" (30 per sheet)'
  },
  // 1-1/3" x 4" labels (14 per sheet) - Address labels
  '5162': {
    name: '5162',
    labelWidth: 4.0,
    labelHeight: 1.333,
    labelsPerRow: 2,
    labelsPerColumn: 7,
    marginTop: 0.5,
    marginLeft: 0.25,
    horizontalGap: 0.25,
    verticalGap: 0.125,
    description: '1-1/3" x 4" (14 per sheet) - Address labels'
  },
  // 2" x 4" labels (10 per sheet) - Shipping labels
  '5163': {
    name: '5163',
    labelWidth: 4.0,
    labelHeight: 2.0,
    labelsPerRow: 2,
    labelsPerColumn: 5,
    marginTop: 0.25,
    marginLeft: 0.25,
    horizontalGap: 0.25,
    verticalGap: 0.125,
    description: '2" x 4" (10 per sheet) - Shipping labels'
  },
  '8163': {
    name: '8163',
    labelWidth: 4.0,
    labelHeight: 2.0,
    labelsPerRow: 2,
    labelsPerColumn: 5,
    marginTop: 0.25,
    marginLeft: 0.25,
    horizontalGap: 0.25,
    verticalGap: 0.125,
    description: '2" x 4" (10 per sheet) - Shipping labels'
  },
  // 3-1/3" x 4" labels (6 per sheet)
  '5164': {
    name: '5164',
    labelWidth: 3.5,
    labelHeight: 3.0,
    labelsPerRow: 2,
    labelsPerColumn: 3,
    marginTop: 0.5,
    marginLeft: 0.5,
    horizontalGap: 0.25,
    verticalGap: 0.25,
    description: '3-1/3" x 4" (6 per sheet)'
  },
  '8164': {
    name: '8164',
    labelWidth: 3.5,
    labelHeight: 3.0,
    labelsPerRow: 2,
    labelsPerColumn: 3,
    marginTop: 0.5,
    marginLeft: 0.5,
    horizontalGap: 0.25,
    verticalGap: 0.25,
    description: '3-1/3" x 4" (6 per sheet)'
  },
  // 1/2" x 1-3/4" labels (80 per sheet) - Return address labels
  '5167': {
    name: '5167',
    labelWidth: 1.75,
    labelHeight: 0.5,
    labelsPerRow: 4,
    labelsPerColumn: 20,
    marginTop: 0.25,
    marginLeft: 0.125,
    horizontalGap: 0.125,
    verticalGap: 0.0625,
    description: '1/2" x 1-3/4" (80 per sheet) - Return address labels'
  }
};

// Helper functions
function getTemplateByName(templateName) {
  if (!templates[templateName]) {
    throw new Error(`Unknown template: ${templateName}. Use './run.sh templates' to see available options.`);
  }
  return templates[templateName];
}

function getAllTemplates() {
  return templates;
}

function getTemplateNames() {
  return Object.keys(templates);
}

function isValidTemplateName(name) {
  return Object.keys(templates).includes(name) || name === 'custom';
}

module.exports = {
  templates,
  getTemplateByName,
  getAllTemplates,
  getTemplateNames,
  isValidTemplateName
}; 