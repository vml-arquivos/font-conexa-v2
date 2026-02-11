import { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthProvider';
import { fetchUnifiedDashboard, type DashboardData } from '../api/reports';

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar unitId do usuário (assumindo que está no token)
        const unitId = (user as any)?.unitId;
        const data = await fetchUnifiedDashboard(unitId);
        
        setDashboardData(data);
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err.response?.data?.message || 'Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboard();
    }
  }, [user]);

  // Função para renderizar roles (pode ser array de strings ou objetos)
  const renderRoles = () => {
    if (!user?.roles || user.roles.length === 0) {
      return null;
    }

    // Se roles é array de objetos com propriedade 'level' ou 'roleId'
    if (typeof user.roles[0] === 'object') {
      return user.roles
        .map((role: any) => role.level || role.roleId || JSON.stringify(role))
        .join(', ');
    }

    // Se roles é array de strings
    return user.roles.join(', ');
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Função para obter cor do gauge
  const getGaugeColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard - Radar de Gestão</h1>

      {/* Informações do Usuário */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          {user?.roles && user.roles.length > 0 && (
            <p>
              <span className="font-medium">Roles:</span> {renderRoles()}
            </p>
          )}
        </div>
      </div>

      {/* Dashboard Unificado */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg">
          <p className="font-semibold">Erro ao carregar dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Pedagógico - Aderência à Matriz */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              📚 Radar Pedagógico
            </h2>
            
            {/* Gauge de Aderência */}
            <div className="text-center mb-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className={getGaugeColor(dashboardData.pedagogical.adherenceRate)}
                    strokeWidth="10"
                    strokeDasharray={`${(dashboardData.pedagogical.adherenceRate / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <span className={`absolute text-2xl font-bold ${getGaugeColor(dashboardData.pedagogical.adherenceRate)}`}>
                  {dashboardData.pedagogical.adherenceRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Aderência à Matriz Curricular</p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(dashboardData.pedagogical.status)}`}>
                Status: {dashboardData.pedagogical.status}
              </span>
            </div>

            {/* Estatísticas */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Eventos:</span>
                <span className="font-semibold">{dashboardData.pedagogical.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sem Vínculo de Matriz:</span>
                <span className="font-semibold text-red-600">
                  {dashboardData.pedagogical.eventsWithoutMatrix}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Com Vínculo:</span>
                <span className="font-semibold text-green-600">
                  {dashboardData.pedagogical.totalEvents - dashboardData.pedagogical.eventsWithoutMatrix}
                </span>
              </div>
            </div>
          </div>

          {/* Card Operacional - Gargalos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-orange-700">
              ⚙️ Saúde Operacional
            </h2>
            
            {/* Alertas Críticos */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-orange-100">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-600">
                    {dashboardData.operational.criticalBottlenecks}
                  </p>
                  <p className="text-xs text-orange-800 mt-1">Alertas</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Gargalos Críticos</p>
            </div>

            {/* Descrição */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Gargalos Críticos:</span> Solicitações de material
                pendentes há mais de 48 horas.
              </p>
              {dashboardData.operational.criticalBottlenecks > 0 && (
                <p className="text-sm text-orange-700 mt-2 font-semibold">
                  ⚠️ Atenção necessária! Existem solicitações aguardando há mais de 2 dias.
                </p>
              )}
              {dashboardData.operational.criticalBottlenecks === 0 && (
                <p className="text-sm text-green-700 mt-2 font-semibold">
                  ✅ Excelente! Nenhum gargalo crítico detectado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (pode ser removido em produção) */}
      {!loading && !error && dashboardData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700">
              🔍 Dados Técnicos (Debug)
            </summary>
            <pre className="mt-2 text-xs bg-white p-4 rounded overflow-auto">
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
