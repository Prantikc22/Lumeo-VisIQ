// Utility functions for collect-visitor route
export async function ipInList(ip: string, file: string): Promise<boolean> {
  try {
    const { readFile } = await import('fs/promises');
    const data = await readFile(file, 'utf8');
    const set = new Set(data.split('\n').map(l => l.trim()).filter(Boolean));
    return set.has(ip);
  } catch { return false; }
}

export async function emailIsDisposable(email: string, file: string): Promise<boolean> {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  try {
    const { readFile } = await import('fs/promises');
    const data = await readFile(file, 'utf8');
    if (domain === 'zzz.com' || domain === 'gmail.com') {
      // Log first and last 20 lines
      const lines = data.split('\n');
    }
    // Defensive: trim domain and all set values
    // Remove invisible characters and normalize lines
    const clean = (s: string) => s.replace(/[\u200B-\u200D\uFEFF\r\n\t ]+/g, '').toLowerCase();
    const set = new Set(data.split('\n').map(l => clean(l)).filter(Boolean));
    return set.has(clean(domain));
  } catch { return false; }
}
