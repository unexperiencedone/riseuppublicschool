/** Academic Calendar 2026-27 — mirrors server/src/seed/data/calendar.js */
export const ACADEMIC_CALENDAR = [
  { date: '2026-04-01', title: 'New Session Begins', category: 'academic' },
  { date: '2026-04-14', title: 'Dr. B. R. Ambedkar Jayanti', category: 'holiday' },
  { date: '2026-05-01', title: 'Buddha Purnima', category: 'holiday' },
  { date: '2026-05-04', endDate: '2026-05-08', title: 'Unit Test–I', category: 'exam' },
  { date: '2026-05-18', title: 'PTM–I', category: 'ptm' },
  { date: '2026-05-21', endDate: '2026-06-26', title: 'Summer Break', category: 'holiday' },
  { date: '2026-06-26', title: 'Muharram (subject to moon sighting)', category: 'holiday' },
  { date: '2026-06-27', title: 'Session Resumes After Break', category: 'academic' },
  { date: '2026-07-13', endDate: '2026-07-17', title: 'Unit Test–II', category: 'exam' },
  { date: '2026-07-25', title: 'PTM–II', category: 'ptm' },
  { date: '2026-08-04', title: 'Chehalum', category: 'holiday' },
  { date: '2026-08-15', title: 'Independence Day', category: 'celebration' },
  { date: '2026-08-26', title: 'Id-Ul-Milad (subject to moon sighting)', category: 'holiday' },
  { date: '2026-08-28', title: 'Raksha Bandhan', category: 'holiday' },
  { date: '2026-08-29', title: 'National Sports Day Activity', category: 'sports' },
  { date: '2026-09-04', title: 'Krishna Janmashtami', category: 'holiday' },
  { date: '2026-09-05', title: "Teacher's Day", category: 'celebration' },
  { date: '2026-09-07', endDate: '2026-09-15', title: 'Half Yearly Examination', category: 'exam' },
  { date: '2026-09-14', title: 'Ganesh Chaturthi', category: 'holiday' },
  { date: '2026-09-17', title: 'Vishwakarma Puja', category: 'celebration' },
  { date: '2026-10-01', title: 'PTM–III / Half Yearly Result Declaration', category: 'ptm' },
  { date: '2026-10-02', title: 'Mahatma Gandhi Jayanti', category: 'celebration' },
  { date: '2026-10-17', title: 'Dandiya Night', category: 'celebration' },
  { date: '2026-10-20', title: 'Dussehra', category: 'holiday' },
  { date: '2026-10-26', title: 'Maharishi Valmiki Jayanti', category: 'holiday' },
  { date: '2026-11-06', title: 'Dhanteras', category: 'holiday' },
  { date: '2026-11-08', title: 'Dipawali', category: 'holiday' },
  { date: '2026-11-09', title: 'Govardhan Puja', category: 'holiday' },
  { date: '2026-11-11', title: 'Bhai Dooj', category: 'holiday' },
  { date: '2026-11-14', title: "Children's Day / Science Exhibition", category: 'celebration' },
  { date: '2026-11-15', title: 'Chhath Puja', category: 'holiday' },
  { date: '2026-11-17', endDate: '2026-11-21', title: 'Unit Test–III', category: 'exam' },
  { date: '2026-11-24', title: 'Guru Nanak Birthday / Kartik Poornima', category: 'holiday' },
  { date: '2026-11-28', title: 'PTM–IV', category: 'ptm' },
  { date: '2026-11-30', endDate: '2026-12-04', title: 'Sports Week', category: 'sports' },
  { date: '2026-12-05', title: 'Annual Sports Day', category: 'sports' },
  { date: '2026-12-25', title: 'Christmas Day', category: 'holiday' },
  { date: '2026-12-26', endDate: '2027-01-10', title: 'Winter Break', category: 'holiday' },
  { date: '2027-01-14', title: 'Makar Sankranti', category: 'holiday' },
  { date: '2027-01-18', endDate: '2027-01-22', title: 'Unit Test–IV', category: 'exam' },
  { date: '2027-01-26', title: 'Republic Day', category: 'celebration' },
  { date: '2027-01-30', title: 'PTM–IV', category: 'ptm' },
  { date: '2027-02-11', title: 'Basant Panchami', category: 'celebration' },
  { date: '2027-02-15', endDate: '2027-03-03', title: 'Annual Examination', category: 'exam' },
  { date: '2027-02-20', title: 'Sant Ravidas Jayanti', category: 'holiday' },
  { date: '2027-03-06', title: 'Mahashivratri', category: 'holiday' },
  { date: '2027-03-10', title: 'Id-Ul-Fitr', category: 'holiday' },
  { date: '2027-03-15', title: 'Annual Result Declaration', category: 'academic' },
  { date: '2027-03-17', title: 'New Session Begins (2027-28)', category: 'academic' },
  { date: '2027-03-22', title: 'Holi', category: 'holiday' },
  { date: '2027-03-26', title: 'Good Friday', category: 'holiday' },
];

export const CATEGORY_STYLES = {
  academic:    { label: 'Academic',    dot: 'bg-navy-600',   chip: 'bg-navy-50 text-navy-700 ring-navy-200' },
  exam:        { label: 'Examination', dot: 'bg-red-500',    chip: 'bg-red-50 text-red-700 ring-red-200' },
  ptm:         { label: 'PTM',         dot: 'bg-amber-500',  chip: 'bg-amber-50 text-amber-800 ring-amber-200' },
  holiday:     { label: 'Holiday',     dot: 'bg-slate-400',  chip: 'bg-slate-100 text-slate-700 ring-slate-200' },
  celebration: { label: 'Celebration', dot: 'bg-brand-600',  chip: 'bg-brand-50 text-brand-700 ring-brand-200' },
  sports:      { label: 'Sports',      dot: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700 ring-orange-200' },
  trip:        { label: 'Trip',        dot: 'bg-teal-500',   chip: 'bg-teal-50 text-teal-700 ring-teal-200' },
  cultural:    { label: 'Cultural',    dot: 'bg-fuchsia-500',chip: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200' },
};

export const MONTHS = [
  { key: '2026-04', label: 'April 2026' },   { key: '2026-05', label: 'May 2026' },
  { key: '2026-06', label: 'June 2026' },    { key: '2026-07', label: 'July 2026' },
  { key: '2026-08', label: 'August 2026' },  { key: '2026-09', label: 'September 2026' },
  { key: '2026-10', label: 'October 2026' }, { key: '2026-11', label: 'November 2026' },
  { key: '2026-12', label: 'December 2026' },{ key: '2027-01', label: 'January 2027' },
  { key: '2027-02', label: 'February 2027' },{ key: '2027-03', label: 'March 2027' },
];

export const formatEventDate = (start, end) => {
  const opts = { day: '2-digit', month: 'short' };
  const s = new Date(`${start}T00:00:00`);
  if (!end) return s.toLocaleDateString('en-IN', { ...opts, year: 'numeric' });
  const e = new Date(`${end}T00:00:00`);
  return `${s.toLocaleDateString('en-IN', opts)} – ${e.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`;
};
