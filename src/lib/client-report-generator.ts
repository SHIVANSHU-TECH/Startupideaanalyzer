/**
 * Client-side Report Generator for Firebase-based Startup Idea Analyzer
 * 
 * This module provides client-side report generation capabilities for analyzed startup ideas.
 * It supports multiple output formats:
 * 
 * - HTML: Direct download of styled HTML report
 * - PDF: Opens browser print dialog with print-optimized styling 
 * - Image (PNG): Converts HTML to image using html2canvas
 * 
 * All reports are generated entirely client-side, eliminating the need for server-side
 * PDF generation and reducing infrastructure complexity.
 */

import { FirebaseIdea } from './firebase';

interface ClientReportData {
  idea: FirebaseIdea;
  userInfo: {
    name: string;
    email: string;
  };
}

export function generateHTMLReport(data: ClientReportData): string {
  const { idea, userInfo } = data;
  const analysis = idea.analysis;

  if (!analysis) {
    throw new Error('No analysis data available for report generation');
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Startup Idea Analysis Report - ${idea.title}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            color: #4F46E5;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 28px;
            font-weight: bold;
            color: #1F2937;
            margin: 10px 0;
        }
        
        .meta-info {
            background: #F9FAFB;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #E5E7EB;
        }
        
        .meta-info h3 {
            margin-top: 0;
            color: #374151;
        }
        
        .section {
            margin: 30px 0;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #1F2937;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .score-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        
        .score-number {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .swot-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .swot-box {
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #D1D5DB;
        }
        
        .swot-strengths {
            background: #ECFDF5;
            border-color: #10B981;
        }
        
        .swot-weaknesses {
            background: #FEF2F2;
            border-color: #EF4444;
        }
        
        .swot-opportunities {
            background: #EFF6FF;
            border-color: #3B82F6;
        }
        
        .swot-threats {
            background: #FFFBEB;
            border-color: #F59E0B;
        }
        
        .swot-box h4 {
            margin-top: 0;
            font-size: 16px;
            font-weight: bold;
        }
        
        .swot-box ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
        }
        
        .swot-box li {
            margin: 5px 0;
        }
        
        .recommendations {
            background: #F0F9FF;
            border-left: 4px solid #0EA5E9;
            padding: 20px;
            border-radius: 8px;
        }
        
        .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .recommendations li {
            margin: 8px 0;
        }
        
        .financial-box {
            background: #F9FAFB;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        
        .financial-box h4 {
            margin-top: 0;
            color: #374151;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
        }
        
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🚀 Startup Idea Analyzer</div>
        <h1 class="report-title">Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="meta-info">
        <h3>📋 Idea Information</h3>
        <p><strong>Title:</strong> ${idea.title}</p>
        <p><strong>Category:</strong> ${idea.category}</p>
        <p><strong>Description:</strong> ${idea.description}</p>
        <p><strong>Analyzed by:</strong> ${userInfo.name} (${userInfo.email})</p>
        <p><strong>Analysis Date:</strong> ${analysis.generatedAt ? new Date(analysis.generatedAt).toLocaleDateString() : 'N/A'}</p>
    </div>

    <div class="section">
        <h2>🎯 Success Score</h2>
        <div class="score-box">
            <div class="score-number">${analysis.successScore}/100</div>
            <p>Overall Success Probability</p>
        </div>
    </div>

    <div class="section">
        <h2>📊 Market Analysis</h2>
        <p>${analysis.marketAnalysis}</p>
    </div>

    <div class="section">
        <h2>🔍 SWOT Analysis</h2>
        <div class="swot-grid">
            <div class="swot-box swot-strengths">
                <h4>💪 Strengths</h4>
                <ul>
                    ${analysis.swot.strengths.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="swot-box swot-weaknesses">
                <h4>⚠️ Weaknesses</h4>
                <ul>
                    ${analysis.swot.weaknesses.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="swot-box swot-opportunities">
                <h4>🚀 Opportunities</h4>
                <ul>
                    ${analysis.swot.opportunities.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="swot-box swot-threats">
                <h4>⚡ Threats</h4>
                <ul>
                    ${analysis.swot.threats.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>

    ${analysis.targetAudience ? `
    <div class="section">
        <h2>👥 Target Audience</h2>
        <p>${analysis.targetAudience}</p>
    </div>
    ` : ''}

    ${analysis.competitorAnalysis ? `
    <div class="section">
        <h2>🏆 Competitor Analysis</h2>
        <p>${analysis.competitorAnalysis}</p>
    </div>
    ` : ''}

    ${analysis.financialProjections ? `
    <div class="section">
        <h2>💰 Financial Projections</h2>
        <div class="financial-box">
            <h4>💵 Revenue Projection</h4>
            <p>${analysis.financialProjections.revenueProjection}</p>
        </div>
        <div class="financial-box">
            <h4>💸 Cost Estimate</h4>
            <p>${analysis.financialProjections.costEstimate}</p>
        </div>
        <div class="financial-box">
            <h4>⚖️ Break-even Analysis</h4>
            <p>${analysis.financialProjections.breakEvenAnalysis}</p>
        </div>
    </div>
    ` : ''}

    <div class="recommendations">
        <h2>💡 Recommendations</h2>
        <ul>
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div class="footer">
        <p>This report was generated by Startup Idea Analyzer</p>
        <p>© ${new Date().getFullYear()} Startup Idea Analyzer. All rights reserved.</p>
    </div>
</body>
</html>
  `;

  return html;
}

export function downloadHTMLReport(data: ClientReportData): void {
  const html = generateHTMLReport(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = generateReportFilename(data.idea.title, 'html');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

export async function downloadPDFReport(data: ClientReportData): Promise<void> {
  const html = generateHTMLReport(data);
  
  // Create a new window/tab with the HTML content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups and try again.');
  }
  
  // Add some CSS to make the print version look better
  const printHTML = html.replace(
    '</head>',
    `
    <style media="print">
      body { margin: 0; padding: 15px; font-size: 12px; }
      .section { page-break-inside: avoid; margin-bottom: 20px; }
      .swot-grid { display: block !important; }
      .swot-box { margin-bottom: 15px; display: block; width: 100%; }
      .score-box { background: #4F46E5 !important; -webkit-print-color-adjust: exact; }
    </style>
    </head>`
  );
  
  printWindow.document.write(printHTML);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (user can cancel)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 500);
  };
}

export async function generateReportImage(data: ClientReportData): Promise<void> {
  try {
    // Create a temporary container with the HTML content
    const container = document.createElement('div');
    container.innerHTML = generateHTMLReport(data);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.background = 'white';
    
    document.body.appendChild(container);
    
    // Use html2canvas to convert to image
    const { default: html2canvas } = await import('html2canvas');
    
    const canvas = await html2canvas(container, {
      backgroundColor: 'white',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateReportFilename(data.idea.title, 'png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
    
    // Clean up
    document.body.removeChild(container);
  } catch (error) {
    console.error('Failed to generate image:', error);
    throw new Error('Failed to generate report image. Please try the PDF option instead.');
  }
}

export function generateReportFilename(ideaTitle: string, format: 'html' | 'pdf' | 'png' = 'pdf'): string {
  const sanitizedTitle = ideaTitle
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().split('T')[0];
  return `startup_analysis_${sanitizedTitle}_${timestamp}.${format}`;
}