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


// Sprint 6: Dashboard Unificado - Radar de Gestão
export interface DashboardData {
  pedagogical: {
    adherenceRate: number;
    status: 'OK' | 'WARNING' | 'CRITICAL';
    totalEvents: number;
    eventsWithoutMatrix: number;
  };
  operational: {
    criticalBottlenecks: number;
  };
}

export async function fetchUnifiedDashboard(unitId?: string): Promise<DashboardData> {
  const params = unitId ? { unitId } : {};
  const response = await http.get('/reports/dashboard/unified', { params });
  return response.data;
}
