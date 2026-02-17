import { useState } from 'react';
import { useAuth } from '../app/AuthProvider';
import { normalizeRoles } from '../app/RoleProtectedRoute';
import { getPlannings, type Planning } from '../api/plannings';
import { getCurriculumEntries, type CurriculumEntry } from '../api/curriculumEntries';
import { getPedagogicalToday } from '../utils/pedagogicalDate';
import { OneTouchDiaryPanel } from '../components/dashboard/OneTouchDiaryPanel';
import { QuickObservationInput } from '../components/dashboard/QuickObservationInput';
import { ClassroomFeedMini } from '../components/dashboard/ClassroomFeedMini';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { UnitSelect } from '../components/select/UnitSelect';
import { ClassroomSelect } from '../components/select/ClassroomSelect';
import { useToast } from '../hooks/use-toast';
import { BookOpen, Calendar, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { getErrorMessage } from '../utils/errorMessage';

type DashboardState = 'idle' | 'loading' | 'select-required' | 'blocked' | 'ready';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user);
  const { toast } = useToast();
  const [state, setState] = useState<DashboardState>('idle');
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [entry, setEntry] = useState<CurriculumEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [classroomId, setClassroomId] = useState<string>('');

  // Roles
  const isProfessor = userRoles.some((role) => role.startsWith('PROFESSOR'));
  const isGlobalLevel = userRoles.some((role) =>
    ['MANTENEDORA', 'DEVELOPER'].includes(role)
  );

  // Estado para select de unidade (global)
  const [unitId, setUnitId] = useState('');

  // Mock de alunos para o MVP (Em produção viria de uma API)
  const studentsMock = [
    { id: 'std-1', name: 'Ana Silva' },
    { id: 'std-2', name: 'Bruno Oliveira' },
    { id: 'std-3', name: 'Carla Santos' },
    { id: 'std-4', name: 'Daniel Lima' },
    { id: 'std-5', name: 'Eduarda Costa' },
  ];

  const loadDashboard = async (targetId?: string) => {
    const effectiveClassroomId = targetId || classroomId;

    if (!effectiveClassroomId && !isProfessor) {
      setState('select-required');
      return;
    }

    try {
      setState('loading');
      setError(null);

      if (!effectiveClassroomId && !isProfessor) {
        setState('select-required');
        setError('Selecione uma turma para visualizar o dashboard.');
        return;
      }

      const plannings = await getPlannings({
        status: 'EM_EXECUCAO',
        ...(effectiveClassroomId && { classroomId: effectiveClassroomId }),
      });

      if (!plannings || plannings.length === 0) {
        setState('blocked');
        setError('Nenhum planejamento ativo encontrado para esta turma. Entre em contato com a coordenação.');
        return;
      }

      const activePlanning = plannings[0];
      setPlanning(activePlanning);

      const today = getPedagogicalToday();
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

      setEntry(entries[0]);
      setState('ready');
    } catch (err: unknown) {
      console.error('Erro ao carregar dashboard:', err);
      setState('blocked');
      const errorMessage = getErrorMessage(err, 'Erro ao carregar informações do dia.');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro de Carregamento",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard do Professor</h1>
          <p className="text-muted-foreground">Gerencie as atividades da sua turma para hoje.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium">
          <Calendar className="h-4 w-4" />
          {getPedagogicalToday()}
        </div>
      </header>

      {/* Seleção de Unidade e Turma (para roles globais) */}
      {!isProfessor && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Selecionar Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isGlobalLevel && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <UnitSelect
                    value={unitId}
                    onChange={(id) => {
                      setUnitId(id);
                      setClassroomId('');
                    }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turma *
                </label>
                <ClassroomSelect
                  unitId={unitId || undefined}
                  value={classroomId}
                  onChange={setClassroomId}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => loadDashboard()}
                  disabled={!classroomId || state === 'loading'}
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400 text-sm font-medium"
                >
                  {state === 'loading' ? 'Carregando...' : 'Carregar Dashboard'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professor: select de turma (se tem mais de 1 turma acessível) */}
      {isProfessor && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sua Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turma
                </label>
                <ClassroomSelect
                  value={classroomId}
                  onChange={(id) => {
                    setClassroomId(id);
                    // Auto-load when professor selects a classroom
                    loadDashboard(id);
                  }}
                  autoSelectSingle
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => loadDashboard()}
                  disabled={!classroomId || state === 'loading'}
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400 text-sm font-medium"
                >
                  {state === 'loading' ? 'Carregando...' : 'Carregar Dashboard'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {state === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 h-64 animate-pulse bg-gray-50" />
          <Card className="h-64 animate-pulse bg-gray-50" />
        </div>
      )}

      {(state === 'idle' || state === 'select-required') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="h-5 w-5" />
              {isProfessor ? 'Aguardando Turma' : 'Selecione uma Turma'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              {isProfessor
                ? 'Sua turma será carregada automaticamente. Se tiver mais de uma, selecione acima.'
                : isGlobalLevel
                  ? 'Selecione uma unidade e uma turma acima para visualizar o dashboard pedagógico.'
                  : 'Selecione uma turma acima para visualizar o dashboard pedagógico.'}
            </p>
          </CardContent>
        </Card>
      )}

      {state === 'blocked' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Trava Pedagógica Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">{error}</p>
            <p className="text-sm text-yellow-600 mt-4">
              O registro de diário só é permitido quando há um planejamento ativo e uma entrada curricular programada para o dia.
            </p>
          </CardContent>
        </Card>
      )}

      {state === 'ready' && planning && entry && classroomId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status e Objetivo */}
            <Card className="border-green-100 bg-green-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Planejamento Ativo: {planning.title}
                  </CardTitle>
                  <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded uppercase">Em Execução</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Objetivo do Dia
                    </h3>
                    <p className="text-gray-900 font-medium leading-relaxed">{entry.objetivoBNCC}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Intencionalidade:</span>
                        <p className="text-gray-700 mt-1">{entry.intencionalidade}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Atividade Sugerida:</span>
                        <p className="text-gray-700 mt-1">{entry.exemploAtividade}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* One-Touch Panel */}
            <OneTouchDiaryPanel
              planningId={planning.id}
              curriculumEntryId={entry.id}
              classroomId={classroomId}
              students={studentsMock}
            />

            {/* Quick Observation */}
            <QuickObservationInput
              planningId={planning.id}
              curriculumEntryId={entry.id}
              classroomId={classroomId}
              students={studentsMock}
            />
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-8">
            {/* Info da Turma */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Turma Selecionada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de Alunos:</span>
                    <span className="font-bold">{studentsMock.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed de Atividades */}
            <ClassroomFeedMini classroomId={classroomId} />
          </div>
        </div>
      )}
    </div>
  );
}
