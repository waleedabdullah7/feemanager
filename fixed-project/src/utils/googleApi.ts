import { getStudents, getTeachers, getSchoolInfo, getFeeRecords } from '../store';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

interface GoogleCredentials {
  client_email: string;
  private_key: string;
}

/**
 * Exchange JWT for Access Token using Web Crypto
 */
async function getAccessToken(creds: GoogleCredentials): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: creds.client_email,
    sub: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const sHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const sPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signatureInput = `${sHeader}.${sPayload}`;

  const pemContents = creds.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const sSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${signatureInput}.${sSignature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'Authentication failed');
  return data.access_token;
}

/**
 * MANDATORY ACTION: Hardcoded Write Test using .append
 */
export async function performHardWriteTest(spreadsheetId: string, credentialsJson: string): Promise<boolean> {
  console.log('[DEBUG] EXECUTING HARD WRITE TEST (APPEND)');
  const creds: GoogleCredentials = JSON.parse(credentialsJson);
  const token = await getAccessToken(creds);

  const testRow = [
    `TEST_${new Date().toISOString()}`,
    "API_WRITE_CONFIRMED",
    "MWA_SOFTWARE"
  ];

  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/Settings!A1:append?valueInputOption=RAW`;
  
  console.log('[DEBUG] URL:', url);
  console.log('[DEBUG] Token:', token.substring(0, 10) + "...");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [testRow] })
    });

    const result = await response.json();
    console.log('[DEBUG] Status:', response.status);
    console.log('[DEBUG] Body:', result);

    if (!response.ok) {
      throw new Error(`Google Sheets API Error: ${result.error?.message || response.statusText}`);
    }

    return true;
  } catch (err: any) {
    console.error('[DEBUG] Test Write Logic Failure:', err);
    throw err;
  }
}

/**
 * Sync logic: Clear + PUT (Overwrite)
 */
export async function syncAllData(spreadsheetId: string, credentialsJson: string) {
  const creds: GoogleCredentials = JSON.parse(credentialsJson);
  const token = await getAccessToken(creds);

  const syncSheet = async (name: string, rows: any[][]) => {
    // 1. Clear
    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${name}!A:Z/clear`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // 2. Write
    const resp = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${name}!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows })
    });
    if (!resp.ok) {
      const errData = await resp.json();
      throw new Error(`Write failed for ${name}: ${errData.error?.message || 'Unknown'}`);
    }
    return rows.length - 1;
  };

  const results = { students: 0, teachers: 0, feeRecords: 0, settings: 0 };

  const students = getStudents();
  results.students = await syncSheet('Students', [
    ['ID', 'Name', 'Status'],
    ...students.map(s => [s.studentId, `${s.firstName} ${s.lastName || ''}`, s.status])
  ]);

  const teachers = getTeachers();
  results.teachers = await syncSheet('Teachers', [
    ['ID', 'Name', 'Designation'],
    ...teachers.map(t => [t.teacherId, `${t.firstName} ${t.lastName || ''}`, t.designation])
  ]);

  const feeRecords = getFeeRecords();
  results.feeRecords = await syncSheet('FeeRecords', [
    ['Receipt No', 'Student ID', 'Amount', 'Date', 'Status'],
    ...feeRecords.map(r => [r.receiptNumber, r.studentId, r.totalFee, r.paymentDate, r.status])
  ]);

  const school = getSchoolInfo();
  results.settings = await syncSheet('Settings', [
    ['Key', 'Value'],
    ['Name', school?.schoolName || 'N/A'],
    ['Last Sync', new Date().toISOString()]
  ]);

  return results;
}
