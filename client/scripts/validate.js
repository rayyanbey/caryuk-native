#!/usr/bin/env node

/**
 * Frontend validation script
 * Checks that all critical files and paths exist
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'app/_layout.tsx',
  'app/splash.tsx',
  'app/onboarding.tsx',
  'app/sign-in.tsx',
  'app/sign-up.tsx',
  'app/(auth)/_layout.tsx',
  'app/(main)/_layout.tsx',
  'app/(main)/home.tsx',
  'app/(main)/search.tsx',
  'app/(main)/car-detail.tsx',
  'app/(main)/favorites.tsx',
  'app/(main)/payment.tsx',
  'app/(main)/profile.tsx',
  'components/CarCard.tsx',
  'components/TabBar.tsx',
  'components/ErrorBoundary.tsx',
  'components/Loading.tsx',
  'components/EmptyState.tsx',
  'constants/colors.ts',
  'store/authStore.ts',
  'store/carStore.ts',
  'store/cartStore.ts',
  'services/api.ts',
  'utils/validation.ts',
  'utils/errors.ts',
  'hooks/index.ts',
  'types/index.ts',
  'tsconfig.json',
  '.eslintrc.js',
];

console.log('🔍 Checking frontend project structure...\n');

let allFilesExist = true;
const missingFiles = [];

requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    missingFiles.push(file);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('✅ All required files found!');
  console.log('\n📱 Frontend is ready for development.');
  console.log('\nNext steps:');
  console.log('1. npm install');
  console.log('2. npm start');
  console.log('3. Press "a" for Android or "i" for iOS');
  process.exit(0);
} else {
  console.log('❌ Missing files:');
  missingFiles.forEach((file) => console.log(`   - ${file}`));
  console.log('\nPlease create the missing files before continuing.');
  process.exit(1);
}
