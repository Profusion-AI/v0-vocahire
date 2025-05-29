#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const clientDir = path.join(__dirname, '..', 'prisma', 'generated', 'client');
const mainFilePath = path.join(clientDir, 'index.d.ts');

function fixPrismaFile(file) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the malformed enum const declarations only
    // Only fix lines that look like enum declarations
    content = content.replace(/export const (UserRole|InterviewStatus): \{/g, 'export const $1 = {');
    
    // Add "as const" only after enum objects
    content = content.replace(/(export const UserRole = \{[^}]+\});/g, '$1 as const;');
    content = content.replace(/(export const InterviewStatus = \{[^}]+\});/g, '$1 as const;');
    
    fs.writeFileSync(file, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix Prisma types in ${file}:`, error.message);
    return false;
  }
}

try {
  // 1. Clean up duplicate files
  const duplicateFiles = glob.sync(path.join(clientDir, 'index.d *.ts'));
  duplicateFiles.forEach(file => {
    if (file !== mainFilePath) { // Ensure we don't delete the primary file
      try {
        fs.unlinkSync(file);
        console.log(`🗑️ Removed duplicate Prisma file: ${path.basename(file)}`);
      } catch (err) {
        console.warn(`⚠️ Could not remove duplicate file ${file}:`, err.message);
      }
    }
  });
  
  // Also clean up other duplicate patterns
  const otherDuplicates = glob.sync(path.join(clientDir, '* 2.*'))
    .concat(glob.sync(path.join(clientDir, '* 3.*')))
    .concat(glob.sync(path.join(clientDir, '* 4.*')))
    .concat(glob.sync(path.join(clientDir, '* 5.*')));
    
  otherDuplicates.forEach(file => {
    try {
      fs.unlinkSync(file);
      console.log(`🗑️ Removed duplicate file: ${path.basename(file)}`);
    } catch (err) {
      console.warn(`⚠️ Could not remove duplicate file ${file}:`, err.message);
    }
  });

  // 2. Fix the main generated file
  if (fs.existsSync(mainFilePath)) {
    if (fixPrismaFile(mainFilePath)) {
      console.log('✅ Fixed main Prisma generated types');
    } else {
      // If fixing fails, exit with an error
      process.exit(1);
    }
  } else {
    console.error(`❌ Main Prisma generated file not found: ${mainFilePath}`);
    process.exit(1);
  }

} catch (error) {
  console.error('❌ An unexpected error occurred during Prisma type fixing:', error.message);
  process.exit(1);
}