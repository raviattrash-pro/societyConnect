export const getServiceImage = (categoryName, seedValue = 0) => {
  const cat = (categoryName || '').toLowerCase();
  
  // Robust hashing for string seeds
  let lock = 1;
  if (typeof seedValue === 'number') {
    lock = Math.max(1, seedValue % 1000);
  } else if (typeof seedValue === 'string') {
    let hash = 0;
    for (let i = 0; i < seedValue.length; i++) {
      hash = ((hash << 5) - hash) + seedValue.charCodeAt(i);
      hash |= 0;
    }
    lock = Math.max(1, Math.abs(hash) % 1000);
  }

  // Specific overrides for premium/direct matches
  if (cat.includes('salon') || cat.includes('grooming') || cat.includes('beaut')) return `https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80`;
  if (cat.includes('pest')) return `https://images.unsplash.com/photo-1587393855524-087f83d95bc9?auto=format&fit=crop&w=600&q=80`;
  if (cat.includes('purifier') || cat.includes('water') || /\bro\b/.test(cat)) {
    if (!cat.includes('car')) {
      return `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80`;
    }
  }

  if (cat.includes('car wash')) return `https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
  if (cat.includes('pack') || cat.includes('mov')) return `https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
  if (cat.includes('maid') || cat.includes('clean')) return `https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
  if (cat.includes('grocer')) return `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
  if (cat.includes('medic') || cat.includes('pharm') || cat.includes('health') || cat.includes('doctor')) return `https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
  
  // Extremely broad laundry match to ensure it never fails
  if (cat.includes('laundry') || cat.includes('dry') || cat.includes('wash') || cat.includes('cloth')) {
    if (!cat.includes('car')) {
      return `https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
    }
  }
  if (cat.includes('baby') || cat.includes('nanny') || cat.includes('child')) return `https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80&sig=${lock}`;
  if (cat.includes('appliance')) return `https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80&sig=${lock}`;

  // Keyword mapping for LoremFlickr (Fallbacks)
  let keyword = 'service,worker';

  if (cat.includes('plumb')) keyword = 'plumber,repair';
  else if (cat.includes('elect')) keyword = 'electrician,wires';
  else if (cat.includes('carpent')) keyword = 'carpenter,wood';
  else if (cat.includes('paint')) keyword = 'painter,wall';
  else if (cat.includes('ac ') || cat.includes('air condition')) keyword = 'technician,ac,repair';
  else if (cat.includes('tutor') || cat.includes('teach')) keyword = 'teacher,books';
  else if (cat.includes('driv')) keyword = 'driver,car';
  else if (cat.includes('mechanic')) keyword = 'mechanic,tools';
  else if (cat.includes('garden')) keyword = 'gardener,plants';
  else if (cat.includes('locksmith')) keyword = 'keys,lock';
  else if (cat.includes('cook') || cat.includes('chef')) keyword = 'chef,cooking';
  else if (cat.includes('pet')) keyword = 'pet,dog';
  else if (cat.includes('fitness') || cat.includes('yoga')) keyword = 'yoga,fitness';
  else if (cat.includes('shop')) keyword = 'store,shop';

  return `https://loremflickr.com/600/400/${keyword}?lock=${lock}`;
};
