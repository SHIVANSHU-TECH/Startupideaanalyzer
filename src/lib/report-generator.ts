import puppeteer from 'puppeteer';
import { IIdea } from '@/models/Idea';

interface ReportData {
  idea: IIdea;
  userInfo: {
    name: string;
    email: string;
  };
}

export async function generateHTMLReport(data: ReportData): Promise<string> {
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
        }
        
        .meta-info h3 {
            margin-top: 0;
            color: #374151;
        }
        
        .success-score {
            text-align: center;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
        }
        
        .score-value {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
        }
        
        .section h2 {
            color: #1F2937;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 10px;
        }
        
        .swot-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .swot-item {
            padding: 15px;
            border-radius: 8px;
        }
        
        .strengths { background: #ECFDF5; border-left: 4px solid #10B981; }
        .weaknesses { background: #FEF2F2; border-left: 4px solid #EF4444; }
        .opportunities { background: #EFF6FF; border-left: 4px solid #3B82F6; }
        .threats { background: #FFFBEB; border-left: 4px solid #F59E0B; }
        
        .swot-item h4 {
            margin-top: 0;
            font-weight: bold;
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
        <h3>Idea Information</h3>
        <p><strong>Title:</strong> ${idea.title}</p>
        <p><strong>Category:</strong> ${idea.category}</p>
        <p><strong>Submitted by:</strong> ${userInfo.name} (${userInfo.email})</p>
        <p><strong>Analysis Date:</strong> ${analysis.generatedAt ? new Date(analysis.generatedAt).toLocaleDateString() : 'N/A'}</p>
    </div>

    <div class="section">
        <h2>📝 Idea Description</h2>
        <p>${idea.description}</p>
    </div>

    <div class="success-score">
        <h3>Success Score</h3>
        <div class="score-value">${analysis.successScore}%</div>
        <p>Overall viability and potential for success</p>
    </div>

    <div class="section">
        <h2>📊 Market Analysis</h2>
        <p>${analysis.marketAnalysis}</p>
        
        ${analysis.targetAudience ? `
        <h3>🎯 Target Audience</h3>
        <p>${analysis.targetAudience}</p>
        ` : ''}
        
        ${analysis.competitorAnalysis ? `
        <h3>🏆 Competitor Analysis</h3>
        <p>${analysis.competitorAnalysis}</p>
        ` : ''}
    </div>

    <div class="section">
        <h2>🔍 SWOT Analysis</h2>
        <div class="swot-grid">
            <div class="swot-item strengths">
                <h4>💪 Strengths</h4>
                <ul>
                    ${analysis.swot.strengths.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="swot-item weaknesses">
                <h4>⚠️ Weaknesses</h4>
                <ul>
                    ${analysis.swot.weaknesses.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="swot-item opportunities">
                <h4>🎯 Opportunities</h4>
                <ul>
                    ${analysis.swot.opportunities.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="swot-item threats">
                <h4>⚡ Threats</h4>
                <ul>
                    ${analysis.swot.threats.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>

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

export async function generatePDFReport(data: ReportData): Promise<Buffer> {
  const html = await generateHTMLReport(data);
  
  // Launch puppeteer in headless mode
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export function generateReportFilename(ideaTitle: string, format: 'html' | 'pdf' = 'pdf'): string {
  const sanitizedTitle = ideaTitle
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().split('T')[0];
  return `startup_analysis_${sanitizedTitle}_${timestamp}.${format}`;
}