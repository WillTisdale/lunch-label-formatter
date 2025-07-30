#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { createLunchLabels } = require('./labelGenerator');
const { loadDataFromFile } = require('./dataHandler');
// Template detector removed - using built-in templates only
const { getTemplateByName, getAllTemplates, isValidTemplateName } = require('./templates');
const fs = require('fs').promises;
const path = require('path');

const log = {
  info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
  success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
  error: (msg) => console.error(chalk.red(`✗ ${msg}`)),
  debug: (msg) => process.env.DEBUG && console.log(chalk.gray(`🔍 ${msg}`))
};

const validateInput = {
  fileExists: async (filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },
  
  isValidPath: (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    if (filePath.length === 0) return false;
    if (filePath.includes('\0')) return false;
    return true;
  },
  
  isValidTemplateName: (name) => {
    return isValidTemplateName(name);
  },
  
  validateLunchOrder: (order) => {
    const required = ['orderId', 'studentName', 'grade', 'contents'];
    const missing = required.filter(field => !order[field] || order[field].trim() === '');
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    if (order.orderId && order.orderId.length > 20) {
      throw new Error('Order ID too long (max 20 characters)');
    }
    
    if (order.studentName && order.studentName.length > 50) {
      throw new Error('Student name too long (max 50 characters)');
    }
    
    if (order.contents && order.contents.length > 200) {
      throw new Error('Contents too long (max 200 characters)');
    }
    
    return true;
  }
};

const program = new Command();

program
  .name('lunch-label-formatter')
  .description('Generate Avery label PDFs for school lunch orders with built-in templates and manual layout control')
  .version('1.0.0')
  .option('--debug', 'Enable debug logging')
  .hook('preAction', (thisCommand) => {
    if (thisCommand.opts().debug) {
      process.env.DEBUG = 'true';
      log.debug('Debug mode enabled');
    }
  });

program
  .command('generate')
  .description('Generate school lunch order labels')
  .option('-f, --file <path>', 'Input CSV/JSON file with lunch order data')
  .option('-t, --template <path>', 'PDF template file (deprecated - use --template-name or --manual-layout)')
  .option('-o, --output <path>', 'Output PDF file path', './lunch-labels.pdf')
  .option('-d, --output-dir <path>', 'Output directory for PDF files')
  .option('-i, --interactive', 'Enter data interactively')
  .option('--template-name <name>', 'Use specific template (5160, 8160, 5162, 5163, 8163, 5164, 8164, 5167, custom)', '5160')
  .option('--manual-layout <spec>', 'Manual layout: "rows:cols:width:height" (e.g., "2:5:4:2" for 2x5 labels 4"x2")')
  .option('--timestamp', 'Add timestamp to output filename')
  .option('--cleanup', 'Remove temporary files after generation')
  .action(async (options) => {
    const startTime = Date.now();
    
    try {
      log.info('Starting lunch label generation...');
      
      if (!options.interactive && !options.file) {
        throw new Error('Please provide a file path or use --interactive');
      }
      
      if (options.file && !validateInput.isValidPath(options.file)) {
        throw new Error('Invalid file path provided');
      }
      
      if (options.template && !validateInput.isValidPath(options.template)) {
        throw new Error('Invalid template path provided');
      }
      
      if (!validateInput.isValidTemplateName(options.templateName)) {
        throw new Error(`Invalid template name: ${options.templateName}. Use './run.sh templates' to see available options.`);
      }
      
      let data;
      let template;
      
      if (options.interactive) {
        log.info('Starting interactive data entry...');
        data = await getLunchDataInteractive();
        log.success(`Collected ${data.length} lunch orders interactively`);
      } else if (options.file) {
        log.info(`Loading data from: ${options.file}`);
        
        if (!(await validateInput.fileExists(options.file))) {
          throw new Error(`File not found: ${options.file}`);
        }
        
        data = await loadDataFromFile(options.file);
        log.success(`Loaded ${data.length} lunch orders from file`);
        
        log.info('Validating lunch order data...');
        for (let i = 0; i < data.length; i++) {
          try {
            validateInput.validateLunchOrder(data[i]);
          } catch (error) {
            throw new Error(`Row ${i + 1}: ${error.message}`);
          }
        }
        log.success('All lunch orders validated successfully');
      }

      // Handle manual layout specification
      if (options.manualLayout) {
        const layoutParts = options.manualLayout.split(':');
        if (layoutParts.length !== 4) {
          throw new Error('Manual layout must be in format "rows:cols:width:height" (e.g., "2:5:4:2")');
        }
        
        template = {
          name: 'manual',
          labelWidth: parseFloat(layoutParts[2]),
          labelHeight: parseFloat(layoutParts[3]),
          labelsPerRow: parseInt(layoutParts[0]),
          labelsPerColumn: parseInt(layoutParts[1]),
          marginTop: 0.5,
          marginLeft: 0.5,
          horizontalGap: 0.125,
          verticalGap: 0.125
        };
        
        if (isNaN(template.labelsPerRow) || isNaN(template.labelsPerColumn) || 
            isNaN(template.labelWidth) || isNaN(template.labelHeight)) {
          throw new Error('Invalid manual layout values. All values must be numbers.');
        }
        
        log.info(`Using manual layout: ${template.labelsPerRow}x${template.labelsPerColumn}`);
      } else {
        log.info(`Using built-in template: ${options.templateName}`);
        template = getTemplateByName(options.templateName);
      }

      let outputPath = options.output;
      
      if (!validateInput.isValidPath(outputPath)) {
        throw new Error('Invalid output path provided');
      }
      
      if (options.outputDir) {
        log.info(`Creating output directory: ${options.outputDir}`);
        
        if (!validateInput.isValidPath(options.outputDir)) {
          throw new Error('Invalid output directory path');
        }
        
        await fs.mkdir(options.outputDir, { recursive: true });
        
        const filename = path.basename(outputPath);
        outputPath = path.join(options.outputDir, filename);
      }

      if (options.timestamp) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const ext = path.extname(outputPath);
        const base = path.basename(outputPath, ext);
        const dir = path.dirname(outputPath);
        outputPath = path.join(dir, `${base}-${timestamp}${ext}`);
        log.info(`Adding timestamp to filename`);
      }

      if (await validateInput.fileExists(outputPath)) {
        log.warning(`Output file already exists: ${outputPath}`);
      }

      log.info(`Generating PDF with ${data.length} labels...`);
      await createLunchLabels(data, template, outputPath);
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      log.success(`Lunch labels generated successfully in ${duration}s`);
      log.success(`Output: ${outputPath}`);
      
      const stats = await fs.stat(outputPath);
      log.info(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
      log.info(`Location: ${path.resolve(outputPath)}`);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      log.error(`Generation failed after ${duration}s`);
      log.error(error.message);
      
      if (error.message.includes('File not found')) {
        log.info('💡 Tip: Check the file path and ensure the file exists');
      } else if (error.message.includes('Invalid template')) {
        log.info('💡 Tip: Use "./run.sh templates" to see available templates');
      } else if (error.message.includes('Missing required fields')) {
        log.info('💡 Tip: Ensure your CSV/JSON has all required fields: orderId, studentName, grade, contents');
      }
      
      process.exit(1);
    }
  });



program
  .command('templates')
  .description('List available built-in templates')
  .action(() => {
    log.info('Available Built-in Templates:');
    const allTemplates = getAllTemplates();
    
    Object.entries(allTemplates).forEach(([name, template]) => {
      console.log(chalk.yellow(`${name}:`), template.description);
    });
    
               console.log(chalk.yellow('custom:'), 'Manual layout specification');
    console.log('');
               console.log(chalk.blue('Usage Examples:'));
           console.log('  ./run.sh generate --file orders.csv --template-name 5160');
           console.log('  ./run.sh generate --file orders.csv --manual-layout "2:5:4:2"');
           console.log('  ./run.sh generate --file orders.csv --output-dir ./output --timestamp');
  });

// Template functions are now imported from ./templates.js

async function getLunchDataInteractive() {
  const lunchOrders = [];
  let continueAdding = true;

  while (continueAdding) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'orderId',
        message: 'Order ID:',
        validate: (input) => {
          if (!input.trim()) return 'Order ID is required';
          if (input.length > 20) return 'Order ID too long (max 20 characters)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'studentName',
        message: 'Student name:',
        validate: (input) => {
          if (!input.trim()) return 'Student name is required';
          if (input.length > 50) return 'Student name too long (max 50 characters)';
          return true;
        }
      },
      {
        type: 'list',
        name: 'grade',
        message: 'Student grade:',
        choices: ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
        default: '5th'
      },
      {
        type: 'input',
        name: 'contents',
        message: 'Lunch contents:',
        validate: (input) => {
          if (!input.trim()) return 'Contents are required';
          if (input.length > 200) return 'Contents too long (max 200 characters)';
          return true;
        }
      },
      {
        type: 'input',
        name: 'specialInstructions',
        message: 'Special instructions (optional):',
        validate: (input) => {
          if (input && input.length > 100) return 'Special instructions too long (max 100 characters)';
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'addAnother',
        message: 'Add another lunch order?',
        default: false
      }
    ]);

    lunchOrders.push({
      orderId: answers.orderId.trim(),
      studentName: answers.studentName.trim(),
      grade: answers.grade,
      contents: answers.contents.trim(),
      specialInstructions: answers.specialInstructions ? answers.specialInstructions.trim() : ''
    });

    continueAdding = answers.addAnother;
  }

  return lunchOrders;
}

program.parse(); 