#!/usr/bin/env node

/**
 * Comprehensive Coverage Analysis Script
 * 
 * This script provides detailed analysis of test coverage including:
 * - Overall project coverage metrics
 * - Per-module coverage breakdown
 * - Performance optimization component analysis
 * - Uncovered code identification
 * - Coverage trend analysis
 */

import fs from 'fs';
import path from 'path';

const COVERAGE_DIR = './coverage';
const COVERAGE_SUMMARY = path.join(COVERAGE_DIR, 'coverage-summary.json');

// Coverage thresholds for different component types
const THRESHOLDS = {
  critical: { statements: 90, branches: 85, functions: 90, lines: 90 },
  important: { statements: 85, branches: 80, functions: 85, lines: 85 },
  standard: { statements: 80, branches: 70, functions: 75, lines: 80 },
  utility: { statements: 70, branches: 60, functions: 70, lines: 70 }
};

// Component categories for analysis
const COMPONENT_CATEGORIES = {
  'Performance Optimization': {
    threshold: 'critical',
    files: [
      'src/shared/components/LazyFormRenderer.tsx',
      'src/shared/components/VirtualizedList.tsx',
      'src/shared/components/PerformanceTestSuite.tsx',
      'src/shared/hooks/usePerformanceMonitor.ts'
    ]
  },
  'Core Engines': {
    threshold: 'critical',
    files: [
      'src/core/ComponentEngine.ts',
      'src/core/FormStateEngine.ts',
      'src/core/ComponentRenderer.ts',
      'src/core/CanvasManager.ts'
    ]
  },
  'Form Builder Components': {
    threshold: 'important',
    files: [
      'src/features/form-builder/components/ComponentPalette.tsx',
      'src/features/form-builder/components/PropertiesPanel.tsx',
      'src/features/form-builder/hooks/useFormBuilder.ts'
    ]
  },
  'Shared Components': {
    threshold: 'standard',
    files: [
      'src/shared/components/ComponentRenderer.tsx',
      'src/shared/components/FormCanvas.tsx',
      'src/shared/components/Input.tsx'
    ]
  },
  'Utilities': {
    threshold: 'utility',
    files: [
      'src/shared/utils/classNames.ts',
      'src/shared/utils/generateId.ts',
      'src/shared/utils/deepClone.ts',
      'src/shared/utils/debounce.ts'
    ]
  }
};

class CoverageAnalyzer {
  constructor() {
    this.coverage = null;
    this.loadCoverage();
  }

  loadCoverage() {
    if (!fs.existsSync(COVERAGE_SUMMARY)) {
      console.error('❌ Coverage summary not found. Run tests with coverage first.');
      process.exit(1);
    }

    try {
      this.coverage = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to parse coverage summary:', error.message);
      process.exit(1);
    }
  }

  formatPercentage(value) {
    if (value >= 90) return `🟢 ${value}%`;
    if (value >= 80) return `🟡 ${value}%`;
    if (value >= 60) return `🟠 ${value}%`;
    return `🔴 ${value}%`;
  }

  checkThreshold(actual, threshold, metric) {
    const passed = actual >= threshold;
    const emoji = passed ? '✅' : '❌';
    return { passed, emoji, message: `${emoji} ${metric}: ${actual}% (threshold: ${threshold}%)` };
  }

  analyzeOverallCoverage() {
    console.log('📊 OVERALL PROJECT COVERAGE');
    console.log('============================');
    
    const total = this.coverage.total;
    const metrics = ['statements', 'branches', 'functions', 'lines'];
    
    metrics.forEach(metric => {
      const pct = total[metric].pct;
      const covered = total[metric].covered;
      const totalCount = total[metric].total;
      
      console.log(`${metric.padEnd(12)}: ${this.formatPercentage(pct)} (${covered}/${totalCount})`);
    });
    
    console.log('');
  }

  analyzeCategoryGroup(categoryName, categoryData) {
    console.log(`📁 ${categoryName.toUpperCase()}`);
    console.log('='.repeat(categoryName.length + 3));
    
    const threshold = THRESHOLDS[categoryData.threshold];
    let categoryStats = { covered: 0, total: 0, files: 0 };
    let allPassed = true;

    categoryData.files.forEach(file => {
      if (this.coverage[file]) {
        categoryStats.files++;
        const fileCov = this.coverage[file];
        
        console.log(`\n${file}:`);
        
        ['statements', 'branches', 'functions', 'lines'].forEach(metric => {
          const actual = fileCov[metric].pct;
          const thresholdValue = threshold[metric];
          const result = this.checkThreshold(actual, thresholdValue, metric);
          
          console.log(`  ${result.message}`);
          
          if (!result.passed) allPassed = false;
        });

        categoryStats.covered += fileCov.statements.covered;
        categoryStats.total += fileCov.statements.total;
      } else {
        console.log(`\n${file}: ⚠️  No coverage data found`);
        allPassed = false;
      }
    });

    const categoryPercentage = categoryStats.total > 0 
      ? ((categoryStats.covered / categoryStats.total) * 100).toFixed(2)
      : 0;

    console.log(`\n📈 Category Summary: ${this.formatPercentage(categoryPercentage)} overall`);
    console.log(`📊 Files analyzed: ${categoryStats.files}/${categoryData.files.length}`);
    console.log(`${allPassed ? '🎉 All thresholds met!' : '⚠️  Some thresholds not met'}`);
    console.log('');
  }

  identifyUncoveredCode() {
    console.log('🔍 UNCOVERED CODE ANALYSIS');
    console.log('==========================');
    
    const uncoveredFiles = [];
    
    Object.entries(this.coverage).forEach(([file, data]) => {
      if (file === 'total') return;
      
      if (data.statements.pct < 50) {
        uncoveredFiles.push({
          file,
          coverage: data.statements.pct,
          uncovered: data.statements.total - data.statements.covered
        });
      }
    });

    if (uncoveredFiles.length === 0) {
      console.log('🎉 No files with critically low coverage found!');
    } else {
      console.log('Files with <50% statement coverage:');
      uncoveredFiles
        .sort((a, b) => a.coverage - b.coverage)
        .forEach(({ file, coverage, uncovered }) => {
          console.log(`  🔴 ${file}: ${coverage}% (${uncovered} uncovered statements)`);
        });
    }
    console.log('');
  }

  generateRecommendations() {
    console.log('💡 COVERAGE IMPROVEMENT RECOMMENDATIONS');
    console.log('=======================================');
    
    const recommendations = [];
    const total = this.coverage.total;

    if (total.statements.pct < 80) {
      recommendations.push('📝 Add more unit tests to improve statement coverage');
    }
    
    if (total.branches.pct < 70) {
      recommendations.push('🌿 Add tests for conditional branches (if/else, switch cases)');
    }
    
    if (total.functions.pct < 75) {
      recommendations.push('🔧 Ensure all functions are tested, especially edge cases');
    }

    // Performance-specific recommendations
    const perfFiles = COMPONENT_CATEGORIES['Performance Optimization'].files;
    let perfCoverage = 0;
    let perfCount = 0;

    perfFiles.forEach(file => {
      if (this.coverage[file]) {
        perfCoverage += this.coverage[file].statements.pct;
        perfCount++;
      }
    });

    const avgPerfCoverage = perfCount > 0 ? perfCoverage / perfCount : 0;

    if (avgPerfCoverage < 90) {
      recommendations.push('🚀 Performance optimization components need more comprehensive testing');
    }

    if (recommendations.length === 0) {
      console.log('🎉 Coverage looks great! No immediate recommendations.');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    console.log('');
  }

  generateCoverageBadge() {
    const total = this.coverage.total;
    const overallPct = Math.round(
      (total.statements.pct + total.branches.pct + total.functions.pct + total.lines.pct) / 4
    );

    let color = 'red';
    if (overallPct >= 90) color = 'brightgreen';
    else if (overallPct >= 80) color = 'green';
    else if (overallPct >= 70) color = 'yellow';
    else if (overallPct >= 60) color = 'orange';

    const badgeUrl = `https://img.shields.io/badge/coverage-${overallPct}%25-${color}`;
    
    console.log('🏆 COVERAGE BADGE');
    console.log('================');
    console.log(`Badge URL: ${badgeUrl}`);
    console.log(`Markdown: ![Coverage](${badgeUrl})`);
    console.log('');

    return { percentage: overallPct, color, url: badgeUrl };
  }

  exportSummary() {
    const total = this.coverage.total;
    const timestamp = new Date().toISOString();
    
    const summary = {
      timestamp,
      overall: {
        statements: total.statements.pct,
        branches: total.branches.pct,
        functions: total.functions.pct,
        lines: total.lines.pct
      },
      categories: {},
      badge: this.generateCoverageBadge()
    };

    // Calculate category summaries
    Object.entries(COMPONENT_CATEGORIES).forEach(([name, data]) => {
      let totalStatements = 0;
      let coveredStatements = 0;
      let fileCount = 0;

      data.files.forEach(file => {
        if (this.coverage[file]) {
          totalStatements += this.coverage[file].statements.total;
          coveredStatements += this.coverage[file].statements.covered;
          fileCount++;
        }
      });

      summary.categories[name] = {
        coverage: totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0,
        filesAnalyzed: fileCount,
        totalFiles: data.files.length,
        threshold: data.threshold
      };
    });

    const summaryPath = path.join(COVERAGE_DIR, 'analysis-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('📄 COVERAGE SUMMARY EXPORTED');
    console.log('============================');
    console.log(`Summary exported to: ${summaryPath}`);
    console.log('');
  }

  run() {
    console.log('🎯 COMPREHENSIVE COVERAGE ANALYSIS');
    console.log('==================================');
    console.log(`Generated: ${new Date().toLocaleString()}\n`);

    this.analyzeOverallCoverage();

    Object.entries(COMPONENT_CATEGORIES).forEach(([name, data]) => {
      this.analyzeCategoryGroup(name, data);
    });

    this.identifyUncoveredCode();
    this.generateRecommendations();
    this.generateCoverageBadge();
    this.exportSummary();

    console.log('✨ Analysis complete! Check the coverage report for detailed information.');
  }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new CoverageAnalyzer();
  analyzer.run();
}