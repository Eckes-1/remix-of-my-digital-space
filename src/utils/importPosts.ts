// Import posts from JSON/CSV utility functions

export interface ImportPost {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  read_time?: string;
  published?: boolean;
  cover_image?: string | null;
}

export const parseJSONImport = (content: string): ImportPost[] => {
  const data = JSON.parse(content);
  const posts = Array.isArray(data) ? data : [data];
  
  return posts.map((item: any) => ({
    title: item.title || '',
    slug: item.slug || generateSlug(item.title || ''),
    excerpt: item.excerpt || item.description || item.summary || '',
    content: item.content || item.body || '',
    category: item.category || '技术',
    read_time: item.read_time || item.readTime || '5分钟',
    published: item.published ?? false,
    cover_image: item.cover_image || item.coverImage || null,
  }));
};

export const parseCSVImport = (content: string): ImportPost[] => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const posts: ImportPost[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header.toLowerCase().trim()] = values[idx] || '';
    });

    posts.push({
      title: row.title || '',
      slug: row.slug || generateSlug(row.title || ''),
      excerpt: row.excerpt || row.description || row.summary || '',
      content: row.content || row.body || '',
      category: row.category || '技术',
      read_time: row.read_time || row.readtime || '5分钟',
      published: row.published === 'true' || row.published === '1',
      cover_image: row.cover_image || row.coverimage || null,
    });
  }

  return posts;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

const generateSlug = (text: string): string => {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base + '-' + Date.now().toString(36);
};

export const parseImportFile = (file: File): Promise<ImportPost[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const isJSON = file.name.endsWith('.json');
        const posts = isJSON ? parseJSONImport(content) : parseCSVImport(content);
        resolve(posts);
      } catch (err) {
        reject(new Error('无法解析导入文件'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
};
