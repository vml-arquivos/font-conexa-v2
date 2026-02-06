import { useEffect, useState } from 'react';
import { getPlannings } from '../api/plannings';
import type { Planning } from '../api/plannings';

export function PlanningsPage() {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlannings()
      .then((data) => {
        setPlannings(data || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Erro ao carregar planejamentos');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Planejamentos</h1>
      {plannings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          Nenhum planejamento encontrado
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plannings.map((planning) => (
                <tr key={planning.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {planning.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {planning.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {planning.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
