/**
 * Admin navigation, grouped by how often a school office actually uses each screen.
 * `roles` gates visibility — it mirrors the RBAC on the API so the UI never offers
 * an action the server will reject.
 */
export const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', roles: ['super_admin', 'admin', 'principal'] },
    ],
  },
  {
    section: 'Every day',
    items: [
      { label: 'Admission Enquiries', href: '/admin/admissions', icon: 'Inbox', roles: ['super_admin', 'admin', 'principal'], badge: 'newEnquiries' },
      { label: 'Messages', href: '/admin/messages', icon: 'MessageSquare', roles: ['super_admin', 'admin', 'principal'], badge: 'unreadMessages' },
      { label: 'Attendance', href: '/admin/attendance', icon: 'CalendarCheck', roles: ['super_admin', 'admin', 'principal', 'teacher'] },
      { label: 'Notices', href: '/admin/notices', icon: 'Megaphone', roles: ['super_admin', 'admin', 'principal'] },
    ],
  },
  {
    section: 'Every week',
    items: [
      { label: 'Gallery', href: '/admin/gallery', icon: 'Images', roles: ['super_admin', 'admin', 'principal'] },
      { label: 'Events', href: '/admin/events', icon: 'CalendarDays', roles: ['super_admin', 'admin', 'principal'] },
    ],
  },
  {
    section: 'Not yet built',
    note: 'The API supports these — the screens are still to come.',
    items: [
      { label: 'Students', href: '/admin/students', icon: 'GraduationCap', roles: ['super_admin', 'admin', 'principal', 'teacher'], disabled: true },
      { label: 'Results', href: '/admin/results', icon: 'ClipboardList', roles: ['super_admin', 'admin', 'principal', 'teacher'], disabled: true },
      { label: 'Homework', href: '/admin/homework', icon: 'BookOpen', roles: ['super_admin', 'admin', 'principal', 'teacher'], disabled: true },
      { label: 'Fees & Payments', href: '/admin/fees', icon: 'IndianRupee', roles: ['super_admin', 'admin', 'accountant'], disabled: true },
      { label: 'Staff', href: '/admin/staff', icon: 'Users', roles: ['super_admin', 'admin', 'principal'], disabled: true },
      { label: 'Downloads', href: '/admin/downloads', icon: 'FileDown', roles: ['super_admin', 'admin', 'principal'], disabled: true },
      { label: 'Page Content', href: '/admin/pages', icon: 'FileText', roles: ['super_admin', 'admin', 'principal'], disabled: true },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings', roles: ['super_admin', 'admin'], disabled: true },
    ],
  },
];

export const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  principal: 'Principal',
  teacher: 'Teacher',
  accountant: 'Accountant',
};
