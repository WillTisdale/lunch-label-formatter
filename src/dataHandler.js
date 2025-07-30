const fs = require('fs').promises;
const path = require('path');

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
  isValidFilePath: (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    if (filePath.length === 0) return false;
    if (filePath.includes('\0')) return false; // Null byte injection protection
    if (filePath.includes('..')) return false; // Path traversal protection
    return true;
  },
  
  isValidFileExtension: (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return ['.json', '.csv'].includes(ext);
  },
  
  validateCSVContent: (content) => {
    if (!content || typeof content !== 'string') {
      throw new Error('CSV content must be a non-empty string');
    }
    
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }
    
    // Check for empty lines
    const emptyLines = lines.filter(line => line.trim() === '');
    if (emptyLines.length > 0) {
      throw new Error('CSV file contains empty lines');
    }
    
    return true;
  },
  
  validateJSONContent: (content) => {
    if (!content || typeof content !== 'string') {
      throw new Error('JSON content must be a non-empty string');
    }
    
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON content must be an array of objects');
      }
      if (parsed.length === 0) {
        throw new Error('JSON array cannot be empty');
      }
      return true;
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  }
};

async function loadDataFromFile(filePath) {
  try {
    log.debug(`Loading data from: ${filePath}`);
    
    // Validate file path
    if (!validateInput.isValidFilePath(filePath)) {
      throw new Error('Invalid file path provided');
    }
    
    // Validate file extension
    if (!validateInput.isValidFileExtension(filePath)) {
      throw new Error(`Unsupported file format. Supported formats: .json, .csv`);
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    if (!content || content.trim().length === 0) {
      throw new Error('File is empty');
    }
    
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.json':
        log.debug('Processing JSON file');
        validateInput.validateJSONContent(content);
        const jsonData = JSON.parse(content);
        log.success(`Loaded ${jsonData.length} records from JSON file`);
        return jsonData;
      
      case '.csv':
        log.debug('Processing CSV file');
        validateInput.validateCSVContent(content);
        const csvData = parseCSV(content);
        log.success(`Loaded ${csvData.length} records from CSV file`);
        return csvData;
      
      default:
        throw new Error(`Unsupported file format: ${ext}. Supported formats: .json, .csv`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${filePath}`);
    } else if (error.code === 'EISDIR') {
      throw new Error(`Path is a directory: ${filePath}`);
    }
    throw error;
  }
}

async function saveDataToFile(data, filePath) {
  try {
    log.debug(`Saving data to: ${filePath}`);
    
    // Validate file path
    if (!validateInput.isValidFilePath(filePath)) {
      throw new Error('Invalid file path provided');
    }
    
    // Validate file extension
    if (!validateInput.isValidFileExtension(filePath)) {
      throw new Error(`Unsupported file format. Supported formats: .json, .csv`);
    }
    
    // Validate data
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    if (data.length === 0) {
      throw new Error('Data array cannot be empty');
    }
    
    let content;
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.json':
        log.debug('Converting data to JSON format');
        content = JSON.stringify(data, null, 2);
        break;
      
      case '.csv':
        log.debug('Converting data to CSV format');
        content = convertToCSV(data);
        break;
      
      default:
        throw new Error(`Unsupported file format: ${ext}. Supported formats: .json, .csv`);
    }
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (dir !== '.') {
      await fs.mkdir(dir, { recursive: true });
    }
    
    // Write file
    await fs.writeFile(filePath, content, 'utf8');
    log.success(`Data saved successfully to: ${filePath}`);
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${filePath}`);
    } else if (error.code === 'ENOSPC') {
      throw new Error(`No space left on device: ${filePath}`);
    }
    throw new Error(`Failed to save file: ${error.message}`);
  }
}

function parseCSV(content) {
  try {
    const lines = content.trim().split('\n');
    
    // Validate minimum requirements
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers
    if (headers.length === 0) {
      throw new Error('CSV file has no headers');
    }
    
    const requiredHeaders = ['orderId', 'studentName', 'grade', 'contents'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue; // Skip empty lines
      
      const values = line.split(',').map(v => v.trim());
      
      // Validate row length
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
      }
      
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Validate required fields
      const missingFields = requiredHeaders.filter(field => !row[field] || row[field].trim() === '');
      if (missingFields.length > 0) {
        throw new Error(`Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
      }
      
      data.push(row);
    }
    
    if (data.length === 0) {
      throw new Error('No valid data rows found in CSV file');
    }
    
    return data;
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
}

function convertToCSV(data) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }
    
    // Validate all objects have the same structure
    const firstObject = data[0];
    if (!firstObject || typeof firstObject !== 'object') {
      throw new Error('Data must be an array of objects');
    }
    
    const headers = Object.keys(firstObject);
    if (headers.length === 0) {
      throw new Error('Data objects must have at least one property');
    }
    
    // Validate all objects have the same properties
    for (let i = 1; i < data.length; i++) {
      const obj = data[i];
      if (!obj || typeof obj !== 'object') {
        throw new Error(`Item ${i + 1} is not an object`);
      }
      
      const objKeys = Object.keys(obj);
      if (objKeys.length !== headers.length || !headers.every(h => objKeys.includes(h))) {
        throw new Error(`Item ${i + 1} has different properties than the first item`);
      }
    }
    
    const csvLines = [headers.join(',')];
    
    data.forEach((row, index) => {
      const values = headers.map(header => {
        const value = row[header] || '';
        
        // Escape special characters in CSV
        if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvLines.push(values.join(','));
    });
    
    return csvLines.join('\n');
  } catch (error) {
    throw new Error(`CSV conversion error: ${error.message}`);
  }
}

// Helper function to validate address data structure (legacy - no longer used)
function validateAddressData(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  const requiredFields = ['name', 'address', 'city', 'state', 'zip'];
  
  data.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Item ${index + 1} is not an object`);
    }
    
    const missingFields = requiredFields.filter(field => !item[field]);
    if (missingFields.length > 0) {
      throw new Error(`Item ${index + 1} missing required fields: ${missingFields.join(', ')}`);
    }
  });
  
  return true;
}

// Helper function to validate shipping data structure (legacy - no longer used)
function validateShippingData(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }
  
  const requiredFields = ['recipient', 'address', 'city', 'state', 'zip', 'weight'];
  
  data.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Item ${index + 1} is not an object`);
    }
    
    const missingFields = requiredFields.filter(field => !item[field]);
    if (missingFields.length > 0) {
      throw new Error(`Item ${index + 1} missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate weight is a number
    if (isNaN(parseFloat(item.weight))) {
      throw new Error(`Item ${index + 1} weight must be a number`);
    }
  });
  
  return true;
}

module.exports = {
  loadDataFromFile,
  saveDataToFile,
  parseCSV,
  convertToCSV,
  validateAddressData,
  validateShippingData
}; 