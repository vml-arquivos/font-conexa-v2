import { useEffect, useState } from 'react';
import { useAuth } from '../app/AuthProvider';
import { getPlannings, type Planning } from '../api/plannings';
import { getCurriculumEntries, type CurriculumEntry } from '../api/curriculumEntries';
import { getPedagogicalToday } from '../utils/pedagogicalDate';
import { OneTouchDiaryPanel } from '../components/dashboard/OneTouchDiaryPanel';
import { QuickObservationInput } from '../components/dashboard/QuickObservationInput';
import { ClassroomFeedMini } from '../components/dashboard/ClassroomFeedMini';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PageShell } from '../components/ui/PageShell';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { toast } from 'sonner';
import { BookOpen, Users, CheckCircle, Info, Calendar } from 'lucide-react';

type DashboardState = 'loading' | 'blocked' | 'ready';

// Mock de alunos para o MVP (deve ser substituído por API real de alunos quando disponível)
const studentsMock = [
  { id: 'student-1', name: 'Ana Silva' },
  { id: 'student-2', name: 'Bruno Oliveira' },
  { id: 'student-3', name: 'Carla Santos' },
  { id: 'student-4', name: 'Daniel Lima' },
  { id: 'student-5', name: 'Eduarda Costa' },
];

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>('loading');
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [entry, setEntry] = useState<CurriculumEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classroomId = user?.user?.classrooms?.[0]?.id;
  const today = getPedagogicalToday();

  useEffect(() => {
    if (classroomId) {
      loadDashboardData();
    } else {
      setState('blocked');
      setError('Nenhuma turma atribuída ao seu perfil.');
    }
  }, [classroomId]);

  const loadDashboardData = async () => {
    try {
      setState('loading');
      
      // 1. Buscar planejamento ativo para a turma
      const plannings = await getPlannings({ 
        status: 'EM_EXECUCAO', 
        classroomId 
      });
      
      const activePlanning = plannings[0];
      
      if (!activePlanning) {
        setState('blocked');
        setError('Não há planejamento ativo (EM_EXECUCAO) para sua turma hoje.');
        return;
      }

      setPlanning(activePlanning);

      // 2. Buscar entrada curricular do dia (Sequência 2026)
      const entries = await getCurriculumEntries({
        matrixId: activePlanning.curriculumMatrixId,
        startDate: today,
        endDate: today
      });

      const todayEntry = entries[0];

      if (!todayEntry) {
        setState('blocked');
        setError(`Fora da sequência pedagógica: não existe entrada curricular para hoje (${today}).`);
        return;
      }

      setEntry(todayEntry);
      setState('ready');
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.message || 'Falha ao carregar dados do dashboard.');
      setState('blocked');
      toast.error("Erro de Conexão", {
        description: "Não foi possível carregar os dados pedagógicos."
      });
    }
  };

  if (state === 'loading') return <LoadingState />;
  if (state === 'blocked') return (
    <PageShell title="Dashboard do Professor" description="Gestão de sala de aula">
      <ErrorState 
        title="Acesso Bloqueado" 
        message={error || "Trava pedagógica ativa."} 
        onRetry={loadDashboardData}
      />
    </PageShell>
  );

  return (
    <PageShell 
      title="Dashboard do Professor" 
      description="Gerencie as atividades da sua turma para hoje."
      headerActions={
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm">
          <Calendar className="h-4 w-4" />
          {today}
        </div>
      }
    >
      {planning && entry && classroomId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status e Objetivo (Sequência 2026) */}
            <Card className="border-primary/10 bg-primary/5 shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    Planejamento: {planning.title}
                  </CardTitle>
                  <span className="text-[10px] font-black bg-primary text-primary-foreground px-2 py-1 rounded uppercase tracking-tighter">
                    Sequência 2026
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-xl border border-primary/10 shadow-sm">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <BookOpen className="h-3 w-3" /> Objetivo BNCC do Dia
                    </h3>
                    <p className="text-sm font-bold leading-relaxed">{entry.objetivoBNCC}</p>
                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div>
                        <span className="font-black uppercase tracking-tighter text-muted-foreground">Intencionalidade</span>
                        <p className="text-foreground mt-1 font-medium">{entry.intencionalidade}</p>
                      </div>
                      <div>
                        <span className="font-black uppercase tracking-tighter text-muted-foreground">Atividade Sugerida</span>
                        <p className="text-foreground mt-1 font-medium">{entry.exemploAtividade}</p>
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
            <Card className="shadow-sm border-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Sua Turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Total de Alunos:</span>
                    <span className="font-bold">{studentsMock.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">ID da Turma:</span>
                    <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{classroomId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed de Atividades */}
            <ClassroomFeedMini classroomId={classroomId} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
