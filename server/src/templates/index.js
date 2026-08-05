const wrap = (title, inner) => `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#1f2937">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
  <tr><td style="background:#0B5D34;padding:20px 24px;color:#fff">
    <div style="font-size:20px;font-weight:700;letter-spacing:.5px">RISE UP PUBLIC SCHOOL</div>
    <div style="font-size:12px;opacity:.85">English Medium &nbsp;|&nbsp; CBSE Pattern &nbsp;|&nbsp; Pipargaon, Aurai, Bhadohi</div>
  </td></tr>
  <tr><td style="padding:28px 24px">
    <h2 style="margin:0 0 16px;font-size:18px;color:#0B5D34">${title}</h2>
    ${inner}
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#6b7280;border-top:1px solid #eee">
    Rise UP Public School, Pipargaon, Aurai, Sant Ravidas Nagar (Bhadohi), Uttar Pradesh 221301<br/>
    Phone: 9170285353 &nbsp;•&nbsp; Email: riseuppublicschool48@gmail.com
  </td></tr>
</table></td></tr></table></body></html>`;

const p = (t) => `<p style="margin:0 0 12px;line-height:1.6;font-size:14px">${t}</p>`;
const row = (k, v) => `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px">${k}</td><td style="padding:6px 0;font-size:13px;font-weight:600">${v ?? '—'}</td></tr>`;

const templates = {
  'admission-received': (d) => wrap('Admission enquiry received', `
    ${p(`Dear <strong>${d.guardianName || 'Parent'}</strong>,`)}
    ${p('Thank you for your interest in Rise UP Public School. We have received your enquiry and our admissions team will contact you within 2 working days.')}
    <table style="margin:8px 0 16px">
      ${row('Application No.', d.applicationNo)}
      ${row('Student', d.studentName)}
      ${row('Class applied for', d.classApplyingFor)}
    </table>
    ${p('Please keep the application number handy for all future correspondence.')}
    ${p('Warm regards,<br/><strong>Admissions Office</strong>')}`),

  'contact-message': (d) => wrap('New website enquiry', `
    <table>
      ${row('Name', d.name)}${row('Phone', d.phone)}${row('Email', d.email)}
      ${row('Category', d.category)}${row('Subject', d.subject)}
    </table>
    ${p(`<strong>Message</strong><br/>${String(d.message || '').replace(/\n/g, '<br/>')}`)}`),

  'payment-receipt': (d) => wrap('Payment receipt', `
    ${p('We have received your payment. This email serves as your receipt.')}
    <table>
      ${row('Receipt No.', d.receiptNo)}${row('Amount', `₹ ${d.amount}`)}
      ${row('Purpose', d.purpose)}${row('Payment ID', d.gatewayPaymentId)}
      ${row('Date', new Date(d.paidAt || Date.now()).toLocaleString('en-IN'))}
    </table>`),

  'portal-credentials': (d) => wrap('Your parent portal login', `
    ${p(`Dear ${d.name},`)}
    ${p('Your login for the Rise UP Public School parent portal has been created.')}
    <table>${row('Portal', d.portalUrl)}${row('Username', d.email)}${row('Temporary password', `<code>${d.password}</code>`)}</table>
    ${p('For your security, please change this password immediately after your first login.')}`),

  'password-reset': (d) => wrap('Reset your password', `
    ${p('We received a request to reset your password. This link is valid for 30 minutes.')}
    ${p(`<a href="${d.resetUrl}" style="background:#0B5D34;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Reset password</a>`)}
    ${p('If you did not request this, you can safely ignore this email.')}`),

  'notice-published': (d) => wrap(d.title, `${p(d.excerpt || '')}${p(`<a href="${d.url}">Read the full notice →</a>`)}`),
};

export const renderTemplate = (name, data = {}) =>
  (templates[name] ? templates[name](data) : wrap('Notification', `<pre>${JSON.stringify(data, null, 2)}</pre>`));

export default renderTemplate;
