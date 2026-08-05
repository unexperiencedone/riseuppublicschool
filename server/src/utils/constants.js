export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  STUDENT: 'student',
  PARENT: 'parent',
});

export const STAFF_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.ACCOUNTANT];
export const CMS_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRINCIPAL];

export const CLASS_LEVELS = [
  'Play Group', 'Nursery', 'LKG', 'UKG',
  'I', 'II', 'III', 'IV', 'V',
  'VI', 'VII', 'VIII',
  'IX', 'X', 'XI', 'XII',
];

export const STREAMS = ['Science', 'Commerce', 'Arts', 'NA'];

export const ADMISSION_STATUS = ['new', 'contacted', 'documents_pending', 'shortlisted', 'admitted', 'rejected', 'withdrawn'];
export const PAYMENT_STATUS = ['created', 'pending', 'paid', 'failed', 'refunded'];
export const NOTICE_CATEGORIES = ['general', 'academic', 'examination', 'holiday', 'admission', 'event', 'circular', 'result', 'vacancy'];
export const EVENT_CATEGORIES = ['academic', 'cultural', 'sports', 'holiday', 'exam', 'ptm', 'celebration', 'trip'];
export const ATTENDANCE_STATUS = ['present', 'absent', 'late', 'half_day', 'leave', 'holiday'];
export const EXAM_TYPES = ['unit_test_1', 'unit_test_2', 'unit_test_3', 'unit_test_4', 'half_yearly', 'annual', 'pre_board'];
