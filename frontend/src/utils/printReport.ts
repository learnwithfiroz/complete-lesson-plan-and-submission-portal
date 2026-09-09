import type { SundayReportData } from '../types/submissionTracking';

export const getBangladeshLiveTime = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value || '';

  return `${weekday}, ${day} ${month} ${year} - ${hour}:${minute} ${dayPeriod}`;
};

export const printOfficialSundayReport = (data: SundayReportData) => {
  const liveTime = getBangladeshLiveTime();
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Popup blocker is preventing print window. Please allow popups for this site.');
    return;
  }

  const missingRows = data.not_submitted_teachers.length > 0
    ? data.not_submitted_teachers.map((t, idx) => `
      <tr>
        <td style="text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
        <td>
          <strong style="color: #0f172a;">${t.name}</strong>
          ${t.salutation ? `<span style="color: #64748b; font-size: 11px;"> (${t.salutation})</span>` : ''}
        </td>
        <td>${t.designation || 'Teacher'}</td>
        <td><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; border: 1px solid #e2e8f0;">${t.department || 'General'}</span></td>
        <td style="font-family: monospace; font-weight: bold; color: #dc2626;">${t.phone && t.phone !== '0' ? t.phone : 'N/A'}</td>
        <td style="text-align: center;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #fca5a5;">NOT SUBMITTED</span></td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="6" style="text-align: center; padding: 15px; color: #15803d; background: #f0fdf4;">
          🎉 আলহামদুলিল্লাহ! সকল সম্মানিত শিক্ষক পাঠ পরিকল্পনা যথা সময়ে জমা দিয়েছেন।
        </td>
      </tr>
    `;

  const submittedRows = data.submitted_teachers.length > 0
    ? data.submitted_teachers.map((t, idx) => {
      const filesHtml = t.files && t.files.length > 0
        ? t.files.map(f => `<span style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; display: inline-block;">📎 ${f.name}</span>`).join('')
        : '<span style="color: #94a3b8;">—</span>';

      return `
        <tr>
          <td style="text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
          <td><strong style="color: #0f172a;">${t.name}</strong></td>
          <td>${t.designation} <span style="color: #64748b; font-size: 11px;">(${t.department})</span></td>
          <td style="color: #475569; font-size: 11px; font-family: monospace;">${t.submitted_at || '—'}</td>
          <td>${filesHtml}</td>
          <td style="text-align: center;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #86efac;">SUBMITTED</span></td>
        </tr>
      `;
    }).join('')
    : `
      <tr>
        <td colspan="6" style="text-align: center; padding: 15px; color: #64748b;">
          এখনও কোনো শিক্ষক ফাইল জমা দেননি।
        </td>
      </tr>
    `;

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>${data.batch.title} - Official Sunday Report</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm 15mm 10mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Segoe UI', Arial, 'SolaimanLipi', sans-serif;
          color: #1e293b;
          background: #fff;
          font-size: 12px;
          line-height: 1.4;
          padding: 10px;
        }
        .report-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-img {
          width: 75px;
          height: 75px;
          object-fit: contain;
        }
        .school-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .school-title-bn {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 2px;
        }
        .school-address {
          font-size: 11px;
          color: #64748b;
        }
        .header-right {
          text-align: right;
          font-size: 11px;
          font-family: monospace;
        }
        .id-badges {
          margin-bottom: 4px;
        }
        .id-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 2px 5px;
          border-radius: 3px;
          display: inline-block;
          margin-left: 3px;
          font-size: 10px;
          color: #1e3a8a;
          font-weight: bold;
        }
        .report-banner {
          text-align: center;
          margin: 10px 0 14px 0;
        }
        .banner-title {
          display: inline-block;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 5px 18px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          color: #0f172a;
        }
        .banner-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 3px;
        }
        .meta-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
        }
        .meta-col strong {
          color: #334155;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
          text-align: center;
        }
        .kpi-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          background: #fff;
        }
        .kpi-card.green {
          background: #f0fdf4;
          border-color: #86efac;
          color: #166534;
        }
        .kpi-card.red {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #991b1b;
        }
        .kpi-card.blue {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1e40af;
        }
        .kpi-num {
          font-size: 20px;
          font-weight: 800;
          margin-top: 2px;
        }
        .kpi-label {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .section-title {
          font-size: 12.5px;
          font-weight: bold;
          margin: 14px 0 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-title.red {
          color: #dc2626;
        }
        .section-title.green {
          color: #16a34a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          text-align: left;
        }
        thead {
          display: table-header-group;
        }
        tr {
          page-break-inside: avoid;
        }
        th {
          font-weight: bold;
          font-size: 10.5px;
          text-transform: uppercase;
        }
        .th-red {
          background: #fee2e2;
          color: #991b1b;
        }
        .th-green {
          background: #dcfce7;
          color: #166534;
        }
        .signatures {
          margin-top: 35px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: center;
          page-break-inside: avoid;
        }
        .signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr 1.3fr;
          gap: 15px;
          text-align: center;
          page-break-inside: avoid;
        }
        .sig-line {
          border-top: 1.5px dotted #94a3b8;
          width: 85%;
          margin: 45px auto 6px auto;
        }
        .sig-name {
          font-weight: 700;
          font-size: 11.5px;
          color: #0f172a;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .sig-desig {
          font-size: 11px;
          font-weight: 600;
          color: #334155;
        }
        .sig-desig.principal {
          color: #1e3a8a;
          font-weight: 700;
        }
        .footer-note {
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          color: #94a3b8;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <!-- Institutional Header -->
      <div class="report-header">
        <div class="header-left">
          <img src="/logo.png" alt="BSISC Logo" class="logo-img" onerror="this.src='/logo.svg';" />
          <div>
            <div class="school-title">${data.school_name}</div>
            <div class="school-title-bn">${data.school_name_bn || 'বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ'}</div>
            <div class="school-address">${data.address} | Web: ${data.website || 'www.bsisc.edu.bd'}</div>
          </div>
        </div>
        <div class="header-right">
          <div class="id-badges">
            <span class="id-badge">EIIN: ${data.eiin}</span>
            <span class="id-badge">School: ${data.school_code}</span>
            <span class="id-badge">College: ${data.college_code}</span>
          </div>
          <div style="color: #64748b;">Ref: <strong>${data.ref_no || 'BSISC/ACAD/' + data.batch.id}</strong></div>
        </div>
      </div>

      <!-- Banner -->
      <div class="report-banner">
        <div class="banner-title">${data.batch.category.replace('_', ' ')} Submission & Monitoring Report</div>
        <div class="banner-sub">পাঠ পরিকল্পনা ও কার্যবিবরণী ট্র্যাকিং রিপোর্ট (রবিবার সকালের বিশেষ মনিটরিং)</div>
      </div>

      <!-- Metadata Box -->
      <div class="meta-box">
        <div class="meta-col">
          <div><strong>ব্যাচ নাম:</strong> ${data.batch.title}</div>
          <div><strong>শ্রেণি:</strong> ${data.batch.class_name}</div>
          <div><strong>কার্যকাল:</strong> ${data.batch.date_range}</div>
        </div>
        <div class="meta-col" style="text-align: right;">
          <div><strong style="color: #dc2626;">ডেডলাইন:</strong> ${data.batch.deadline_display}</div>
          <div><strong>রিপোর্ট প্রস্তুতের সময়:</strong> ${liveTime || data.generated_at}</div>
          <div><strong>সম্পূর্ণতার হার:</strong> <strong style="color: #1e40af;">${data.summary.completion_percent}%</strong></div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">মোট শিক্ষক</div>
          <div class="kpi-num">${data.summary.total_teachers}</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-label">জমা দিয়েছেন</div>
          <div class="kpi-num">${data.summary.submitted_count}</div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-label">জমা দেননি (বাকি)</div>
          <div class="kpi-num">${data.summary.not_submitted_count}</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-label">অগ্রগতি হার</div>
          <div class="kpi-num">${data.summary.completion_percent}%</div>
        </div>
      </div>

      <!-- Section A: Missing Teachers -->
      <div class="section-title red">
        ⚠️ SECTION A: যে সকল শিক্ষক শনিবার রাতের মধ্যে জমা দেননি (অনুপস্থিত তালিকা: ${data.not_submitted_teachers.length} জন)
      </div>
      <table>
        <thead>
          <tr class="th-red">
            <th style="width: 35px; text-align: center;">#</th>
            <th>শিক্ষকের নাম</th>
            <th>পদবি</th>
            <th>বিভাগ / বিষয়</th>
            <th>মোবাইল নম্বর</th>
            <th style="width: 110px; text-align: center;">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${missingRows}
        </tbody>
      </table>

      <!-- Section B: Submitted Teachers -->
      <div class="section-title green">
        ✔ SECTION B: যথা সময়ে জমা দেওয়া শিক্ষক তালিকা (${data.submitted_teachers.length} জন)
      </div>
      <table>
        <thead>
          <tr class="th-green">
            <th style="width: 35px; text-align: center;">#</th>
            <th>শিক্ষকের নাম</th>
            <th>পদবি ও বিভাগ</th>
            <th>জমা দেওয়ার সময়</th>
            <th>সংযুক্ত ফাইলসমূহ</th>
            <th style="width: 100px; text-align: center;">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${submittedRows}
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="signatures">
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Aklima Begum</div>
          <div class="sig-desig">VP (Jr. Div)</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Masuma Mamataz</div>
          <div class="sig-desig">VP (Sr. Div)</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Brig Gen Akhter Shahid, SUP (BAR), ndc, psc, G+, MPhil (LPR)</div>
          <div class="sig-desig principal">Principal</div>
        </div>
      </div>

      <!-- Confidential Footer -->
      <div class="footer-note">
        <div>🔒 <strong>Confidential:</strong> Internal Academic Monitoring & Institutional Quality Audit Record.</div>
        <div>Generated Automatically by BSISC Academic ERP System | ${liveTime || data.generated_at}</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};