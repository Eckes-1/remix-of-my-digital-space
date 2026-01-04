// Export data utility functions

export const exportToJSON = (data: unknown, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
};

export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = val.replace(/"/g, '""');
        return /[,\n"]/.test(val) ? `"${escaped}"` : escaped;
      }
      if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return String(val);
    });
    csvRows.push(values.join(','));
  }
  
  const csvStr = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvStr], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${filename}.csv`);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
