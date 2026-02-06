import http from './http';

export interface ReportData {
  [key: string]: any;
}

export async function getAttendanceReport(): Promise<ReportData[]> {
  const response = await http.get('/reports/attendance');
  return response.data;
}

export async function getPerformanceReport(): Promise<ReportData[]> {
  const response = await http.get('/reports/performance');
  return response.data;
}

export async function getActivityReport(): Promise<ReportData[]> {
  const response = await http.get('/reports/activity');
  return response.data;
}
