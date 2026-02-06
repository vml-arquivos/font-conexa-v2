import http from './http';

export interface ReportData {
  [key: string]: any;
}

export async function getDiaryByClassroom(): Promise<ReportData[]> {
  const response = await http.get('/reports/diary/by-classroom');
  return response.data;
}

export async function getDiaryByPeriod(): Promise<ReportData[]> {
  const response = await http.get('/reports/diary/by-period');
  return response.data;
}

export async function getDiaryUnplanned(): Promise<ReportData[]> {
  const response = await http.get('/reports/diary/unplanned');
  return response.data;
}
