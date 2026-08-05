import sendEmail from './email.service.js';
import sendSMS from './sms.service.js';
import sendWhatsApp from './whatsapp.service.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Fan-out orchestrator. Every channel is best-effort and never throws,
 * so a failing SMS provider can never fail an admission submission.
 */
export async function notify({ email, sms, whatsapp } = {}) {
  const results = await Promise.allSettled([
    email ? sendEmail(email) : null,
    sms ? sendSMS(sms) : null,
    whatsapp ? sendWhatsApp(whatsapp) : null,
  ].filter(Boolean));
  results.filter((r) => r.status === 'rejected').forEach((r) => logger.warn(`notify() channel failed: ${r.reason}`));
  return results;
}

/* ---- Domain-specific notification recipes ---- */

export const notifyAdmissionReceived = (admission) => notify({
  email: {
    to: admission.parent.email || env.mail.adminInbox,
    cc: env.mail.adminInbox,
    subject: `Admission enquiry received — ${admission.applicationNo}`,
    template: 'admission-received',
    data: {
      guardianName: admission.parent.guardianName,
      studentName: `${admission.student.firstName} ${admission.student.lastName || ''}`.trim(),
      classApplyingFor: admission.student.classApplyingFor,
      applicationNo: admission.applicationNo,
    },
  },
  sms: {
    to: admission.parent.phone,
    templateId: env.sms.templates.enquiry,
    message: `Rise UP Public School: Enquiry ${admission.applicationNo} received for ${admission.student.firstName}. We will contact you shortly. Ph 9170285353`,
    variables: { NAME: admission.parent.guardianName, APPNO: admission.applicationNo },
  },
});

export const notifyContactMessage = (msg) => notify({
  email: {
    to: env.mail.adminInbox,
    subject: `[Website] ${msg.subject} — ${msg.name}`,
    template: 'contact-message',
    data: msg,
  },
});

export const notifyResultPublished = (student, result) => notify({
  sms: {
    to: student.father?.phone || student.guardian?.phone,
    templateId: env.sms.templates.result,
    message: `Rise UP Public School: ${result.examName} result for ${student.firstName} is now available on the parent portal.`,
    variables: { NAME: student.firstName, EXAM: result.examName },
  },
});

export const notifyPaymentSuccess = (payment) => notify({
  email: payment.payerEmail ? {
    to: payment.payerEmail,
    subject: `Payment receipt ${payment.receiptNo} — Rise UP Public School`,
    template: 'payment-receipt',
    data: payment,
  } : null,
  sms: {
    to: payment.payerPhone,
    templateId: env.sms.templates.fee,
    message: `Rise UP Public School: Payment of Rs.${payment.amount} received. Receipt ${payment.receiptNo}. Thank you.`,
    variables: { AMOUNT: payment.amount, RECEIPT: payment.receiptNo },
  },
});
