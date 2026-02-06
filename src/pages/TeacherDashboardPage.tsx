import { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthProvider';
import { getPlannings, type Planning } from '../api/plannings';
import { getCurriculumEntries, type CurriculumEntry } from '../api/curriculumEntries';

type DashboardState = 'loading' | 'blocked' | 'ready';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>('loading');
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [entry, setEntry] = useState<CurriculumEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setState('loading');
      setError(null);

      // 1. Buscar planning EM_EXECUCAO
      const plannings = await getPlannings({ status: 'EM_EXECUCAO' });

      if (!plannings || plannings.length === 0) {
        setState('blocked');
        setError('Nenhum planejamento ativo encontrado. Entre em contato com a coordenação.');
        return;
      }

      // Se houver múltiplos, usar o primeiro e avisar
      const activePlanning = plannings[0];
      setPlanning(activePlanning);

      if (plannings.length > 1) {
        console.warn(`Múltiplos planejamentos ativos encontrados (${plannings.length}). Usando o primeiro.`);
      }

      // 2. Buscar CurriculumMatrixEntry do dia
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const entries = await getCurriculumEntries({
        matrixId: activePlanning.curriculumMatrixId,
        startDate: today,
        endDate: today,
      });

      if (!entries || entries.length === 0) {
        setState('blocked');
        setError('Não há entrada curricular programada para hoje. Verifique o calendário letivo.');
        return;
      }

      // Usar a primeira entry do dia
      const todayEntry = entries[0];
      setEntry(todayEntry);

      setState('ready');
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setState('blocked');
      setError(err.response?.data?.message || 'Erro ao carregar informações do dia. Tente novamente.');
    }
  }

  function handleRegisterDiary() {
    if (!planning || !entry) {
      alert('Dados insuficientes para registrar diário.');
      return;
    }

    // TODO: Implementar formulário de criação de diário
    // Por enquanto, apenas preparar o DTO
    const dtoStub = {
      planningId: planning.id,
      curriculumEntryId: entry.id,
      classroomId: planning.classroomId,
      // Outros campos serão preenchidos no formulário
    };

    console.log('DTO preparado:', dtoStub);
    alert('Funcionalidade de registro de diário será implementada em breve.');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard do Professor - Hoje</h1>

      {/* Loading State */}
      {state === 'loading' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <p className="text-gray-600 mt-4">Carregando informações do dia...</p>
        </div>
      )}

      {/* Blocked State */}
      {state === 'blocked' && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">⚠️ Trava Pedagógica Ativa</h2>
          <p className="text-yellow-700 mb-4">{error}</p>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
          >
            Registrar Diário (Bloqueado)
          </button>
          <p className="text-sm text-gray-600 mt-4">
            O registro de diário só é permitido quando há um planejamento ativo e uma entrada curricular programada para o dia.
          </p>
        </div>
      )}

      {/* Ready State */}
      {state === 'ready' && planning && entry && (
        <div className="space-y-6">
          {/* Planejamento Ativo */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Planejamento Ativo</h2>
            <p className="text-green-700">
              <strong>{planning.title}</strong>
              {planning.description && <span> - {planning.description}</span>}
            </p>
          </div>

          {/* Entrada Curricular do Dia */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">📚 Objetivo do Dia</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Objetivo BNCC:</h3>
                <p className="text-gray-900">{entry.objetivoBNCC}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Objetivo Currículo:</h3>
                <p className="text-gray-900">{entry.objetivoCurriculo}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Intencionalidade:</h3>
                <p className="text-gray-900">{entry.intencionalidade}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Exemplo de Atividade:</h3>
                <p className="text-gray-900">{entry.exemploAtividade}</p>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="flex justify-center">
            <button
              onClick={handleRegisterDiary}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              📝 Registrar Diário
            </button>
          </div>

          {/* Informações de Debug (remover em produção) */}
          <details className="bg-gray-50 p-4 rounded text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700">
              🔍 Informações Técnicas (Debug)
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify({ user: user?.user, planning, entry }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
