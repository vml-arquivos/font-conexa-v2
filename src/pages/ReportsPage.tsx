import { useState } from 'react';
import { getDiaryByClassroom, getDiaryByPeriod, getDiaryUnplanned } from '../api/reports';
import type { ReportData } from '../api/reports';
import { getErrorMessage } from '../utils/errorMessage';

type ReportType = 'by-classroom' | 'by-period' | 'unplanned';

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
        case 'by-classroom':
          data = await getDiaryByClassroom();
          break;
        case 'by-period':
          data = await getDiaryByPeriod();
          break;
        case 'unplanned':
          data = await getDiaryUnplanned();
          break;
      }
      setReportData(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar relatório'));
    } finally {
      setLoading(false);
    }
  };

  const reportTitles = {
    'by-classroom': 'Relatório de Diário por Turma',
    'by-period': 'Relatório de Diário por Período',
    'unplanned': 'Relatório de Diário Não Planejado',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => loadReport('by-classroom')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Por Turma
        </button>
        <button
          onClick={() => loadReport('by-period')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Por Período
        </button>
        <button
          onClick={() => loadReport('unplanned')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Não Planejado
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
