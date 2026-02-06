import { useState } from 'react';
import { getAttendanceReport, getPerformanceReport, getActivityReport } from '../api/reports';
import type { ReportData } from '../api/reports';

type ReportType = 'attendance' | 'performance' | 'activity';

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (type: ReportType) => {
    setReportType(type);
    setLoading(true);
    setError('');
    setReportData([]);

    try {
      let data: ReportData[] = [];
      switch (type) {
        case 'attendance':
          data = await getAttendanceReport();
          break;
        case 'performance':
          data = await getPerformanceReport();
          break;
        case 'activity':
          data = await getActivityReport();
          break;
      }
      setReportData(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const reportTitles = {
    attendance: 'Relatório de Frequência',
    performance: 'Relatório de Desempenho',
    activity: 'Relatório de Atividades',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => loadReport('attendance')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Frequência
        </button>
        <button
          onClick={() => loadReport('performance')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Desempenho
        </button>
        <button
          onClick={() => loadReport('activity')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Atividades
        </button>
      </div>

      {loading && <div className="text-center py-8">Carregando relatório...</div>}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!loading && !error && reportType && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{reportTitles[reportType]}</h2>
          {reportData.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhum dado encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(reportData[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
