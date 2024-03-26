const normalizeDate = (date: string) => {
  const rawDate = new Date(date)
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = rawDate.getDate();
  const monthName = czechMonthNames[rawDate.getMonth()];
  const year = rawDate.getFullYear();
  return `${dayOfMonth}. ${monthName} ${year}`;
}

const normalizeDateHours = (date: string) => {
  const rawDate = new Date(date)
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = rawDate.getDate();
  const monthName = czechMonthNames[rawDate.getMonth()];
  const hour = rawDate.getHours();
  const minute = rawDate.getMinutes();
  const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);
  return `${dayOfMonth}. ${monthName} v ${hour}:${addLeadingZero(minute)}`;
}

export {
  normalizeDate,
  normalizeDateHours
};