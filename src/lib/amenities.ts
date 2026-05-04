export interface AmenityEntry {
  icon: string;
  label: string;
}

const ICON_ALIASES: Record<string, string> = {
  wifi: 'wifi',
  'wi-fi': 'wifi',
  pool: 'pool',
  'bể bơi': 'pool',
  'hồ bơi': 'pool',
  restaurant: 'restaurant',
  'nhà hàng': 'restaurant',
  meal: 'meal',
  meals: 'meal',
  'ăn sáng': 'meal',
  'ăn trưa': 'meal',
  'ăn 3 bữa': 'meal',
  breakfast: 'meal',
  lunch: 'meal',
  transfer: 'transfer',
  'đưa đón': 'transfer',
  'xe đưa đón': 'transfer',
  shuttle: 'transfer',
  'electric shuttle': 'transfer',
  guide: 'guide',
  'hướng dẫn viên': 'guide',
  'tour guide': 'guide',
  kayak: 'kayak',
  kayaking: 'kayak',
  bike: 'bike',
  bicycle: 'bike',
  bicycles: 'bike',
  'xe đạp': 'bike',
  car: 'car',
  cruise: 'cruise',
  ship: 'cruise',
  spa: 'spa',
  bar: 'bar',
  beach: 'beach',
  bbq: 'bbq',
  ticket: 'ticket',
};

export function inferAmenityIcon(label: string) {
  const normalized = label.trim().toLowerCase();
  return ICON_ALIASES[normalized] || Object.entries(ICON_ALIASES).find(([key]) => normalized.includes(key))?.[1] || 'sparkle';
}

export function parseAmenity(value: string): AmenityEntry {
  const [maybeIcon, ...labelParts] = value.split('::');
  const label = labelParts.join('::').trim();

  if (label) {
    return {
      icon: maybeIcon.trim() || inferAmenityIcon(label),
      label,
    };
  }

  return {
    icon: inferAmenityIcon(value),
    label: value.trim(),
  };
}

export function encodeAmenity(icon: string, label: string) {
  const cleanLabel = label.trim();
  if (!cleanLabel) return '';
  return `${icon || inferAmenityIcon(cleanLabel)}::${cleanLabel}`;
}

export function getAmenityLabel(value: string) {
  return parseAmenity(value).label;
}
