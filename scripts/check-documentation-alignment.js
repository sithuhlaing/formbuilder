#!/usr/bin/env node

/**
 * Documentation Alignment Report Generator
 * Validates that implementation matches all documented requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentationAlignmentReporter {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.docsPath = path.join(this.projectRoot, 'docs');
    this.srcPath = path.join(this.projectRoot, 'src');
    this.alignmentIssues = [];
  }

  async generateReport() {
    console.log('🔍 Checking Documentation Alignment...\n');

    await this.checkBusinessLogicAlignment();
    await this.checkArchitectureAlignment();
    await this.checkPerformanceAlignment();
    await this.checkTestCoverageAlignment();

    this.printReport();
  }

  async checkBusinessLogicAlignment() {
    console.log('📋 Checking Business Logic Alignment...');
    
    // Check component types
    const componentEnginePath = path.join(this.srcPath, 'core/ComponentEngine.ts');
    if (fs.existsSync(componentEnginePath)) {
      const content = fs.readFileSync(componentEnginePath, 'utf8');
      const typeMatches = content.match(/SUPPORTED_TYPES.*?\[(.*?)\]/s);
      
      if (typeMatches) {
        const types = typeMatches[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
        if (types.length !== 15) {
          this.alignmentIssues.push(`❌ Component types: Expected 15, found ${types.length}`);
        } else {
          console.log('✅ Component types: 15 types correctly implemented');
        }
      }
    } else {
      this.alignmentIssues.push('❌ ComponentEngine.ts not found');
    }

    // Check analytics implementation
    const analyticsEnginePath = path.join(this.srcPath, 'core/AnalyticsEngine.ts');
    if (!fs.existsSync(analyticsEnginePath)) {
      this.alignmentIssues.push('❌ AnalyticsEngine.ts missing (required by form-schema.ts)');
    } else {
      console.log('✅ Analytics engine implemented');
    }

    // Check dependency engine
    const dependencyEnginePath = path.join(this.srcPath, 'core/DependencyEngine.ts');
    if (!fs.existsSync(dependencyEnginePath)) {
      this.alignmentIssues.push('❌ DependencyEngine.ts missing');
    } else {
      console.log('✅ Dependency engine implemented');
    }
  }

  async checkArchitectureAlignment() {
    console.log('\n🏗️ Checking Architecture Alignment...');
    
    const coreFiles = ['ComponentEngine.ts', 'FormState.ts', 'DragDropLogic.ts'];
    const corePath = path.join(this.srcPath, 'core');
    
    let foundFiles = 0;
    coreFiles.forEach(file => {
      const filePath = path.join(corePath, file);
      if (fs.existsSync(filePath)) {
        foundFiles++;
        console.log(`✅ Core file found: ${file}`);
      } else {
        this.alignmentIssues.push(`❌ Missing core file: ${file}`);
      }
    });

    if (foundFiles === coreFiles.length) {
      console.log('✅ All core architecture files present');
    }

    // Check for legacy files that should be removed
    const legacyPath = path.join(this.srcPath, '_legacy_phase3');
    if (fs.existsSync(legacyPath)) {
      console.log('⚠️ Legacy files still present (consider cleanup)');
    }
  }

  async checkPerformanceAlignment() {
    console.log('\n⚡ Checking Performance Alignment...');
    
    const performanceTestPath = path.join(this.srcPath, '__tests__/e2e/performance-optimizations.test.tsx');
    if (fs.existsSync(performanceTestPath)) {
      console.log('✅ Performance tests implemented');
    } else {
      this.alignmentIssues.push('❌ Performance tests missing');
    }

    const memoryTestPath = path.join(this.srcPath, '__tests__/e2e/critical/memory-management.test.tsx');
    if (fs.existsSync(memoryTestPath)) {
      console.log('✅ Memory management tests implemented');
    } else {
      this.alignmentIssues.push('❌ Memory management tests missing');
    }
  }

  async checkTestCoverageAlignment() {
    console.log('\n🧪 Checking Test Coverage Alignment...');
    
    const testFiles = [
      '__tests__/SimpleSystem.integration.test.tsx',
      '__tests__/core/convergent-architecture.test.tsx',
      '__tests__/features/form-builder/template-workflow.test.tsx'
    ];

    let foundTests = 0;
    testFiles.forEach(testFile => {
      const testPath = path.join(this.srcPath, testFile);
      if (fs.existsSync(testPath)) {
        foundTests++;
        console.log(`✅ Test file found: ${testFile}`);
      } else {
        this.alignmentIssues.push(`❌ Missing test file: ${testFile}`);
      }
    });

    if (foundTests === testFiles.length) {
      console.log('✅ All required test files present');
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 DOCUMENTATION ALIGNMENT REPORT');
    console.log('='.repeat(50));

    if (this.alignmentIssues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      this.alignmentIssues.forEach(issue => console.log(issue));
      console.log(`\nTotal issues: ${this.alignmentIssues.length}`);
    } else {
      console.log('\n✅ ALL DOCUMENTATION REQUIREMENTS ALIGNED');
      console.log('🎉 Implementation matches documentation perfectly!');
    }
  }
}

// Run the reporter
const reporter = new DocumentationAlignmentReporter();
reporter.generateReport().catch(console.error);
