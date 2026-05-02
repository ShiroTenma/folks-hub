export const parseAmount = (val: any) => {
  if (!val) return 0;
  let raw = val.toString().replace(/[Rp\s]/g, '');
  if (raw.includes(',') && raw.includes('.')) {
    const first = raw.indexOf(',');
    const second = raw.indexOf('.');
    if (first < second) raw = raw.replace(/,/g, '');
    else raw = raw.replace(/\./g, '').replace(',', '.');
  } else {
    const parts = raw.split(/[.,]/);
    if (parts.length === 2 && parts[1].length === 3) raw = raw.replace(/[.,]/g, '');
    else if (parts.length === 2) raw = raw.replace(',', '.');
    else raw = raw.replace(/[.,]/g, '');
  }
  return Math.abs(parseFloat(raw)) || 0;
};

export const parseFinanceCSV = (text: string, canApprove: boolean) => {
  // Strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
  const rawHeaders = lines[0].split(delimiter).map(h => 
    h.trim().toLowerCase().replace(/"/g, '').replace(/\s+/g, '_')
  );

  const data = lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else current += char;
    }
    values.push(current.trim());

    const obj: any = {};
    rawHeaders.forEach((h, i) => { 
      obj[h] = values[i]?.replace(/"/g, ''); 
    });

    // Detect Type
    let type: 'income' | 'expense' = 'expense';
    const typeVal = (obj.type || '').toLowerCase();
    const creditVal = parseAmount(obj.credit || obj.credit_amount);
    const debtVal = parseAmount(obj.debt || obj.debt_amount);

    if (typeVal.includes('in')) type = 'income';
    else if (typeVal.includes('ex')) type = 'expense';
    else if (creditVal > 0) type = 'income';
    else if (debtVal > 0) type = 'expense';

    const amount = parseAmount(obj.amount || obj.total || obj.nilai || (type === 'income' ? creditVal : debtVal));

    // Date format help
    let dateStr = obj.date || new Date().toISOString();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
      const parts = dateStr.split('/');
      dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    const itemName = obj.item_name || obj.item || obj.description || 'Imported';
    const division = obj.division_target || obj.division || obj.category || 'General';

    return {
      type,
      amount,
      debt_amount: type === 'expense' ? amount : 0,
      credit_amount: type === 'income' ? amount : 0,
      date: dateStr,
      item_name: itemName,
      description: itemName,
      event_type: obj.event_type || obj.event || 'General',
      division_target: division,
      category: division,
      payment_type: obj.payment_type || obj.payment || 'Cash',
      from_entity: obj.from_entity || obj.from || '',
      to_entity: obj.to_entity || obj.to || '',
      location: obj.location || obj.place || '',
      notes: obj.notes || '',
      status: canApprove ? 'approved' : 'pending'
    };
  });

  return data;
};
