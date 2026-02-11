import { useState } from 'react';
import { useAuth } from '../app/AuthProvider';
import { normalizeRoles } from '../app/RoleProtectedRoute';
import {
  getUnitDashboard,
  getTeacherDashboard,
  type UnitDashboardData,
  type TeacherDashboardData,
} from '../api/reports';

export function DashboardPage() {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user);

  // Estado do Dashboard da Unidade
  const [unitData, setUnitData] = useState<UnitDashboardData | null>(null);
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitError, setUnitError] = useState<string | null>(null);
  const [unitId, setUnitId] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Estado do Dashboard do Professor
  const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [teacherDate, setTeacherDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [classroomId, setClassroomId] = useState('');

  // Debug toggle
  const [showDebug, setShowDebug] = useState(false);

  // Verificar roles
  const canViewUnitDashboard = userRoles.some((role) =>
    ['UNIDADE', 'STAFF_CENTRAL', 'MANTENEDORA', 'DEVELOPER'].includes(role)
  );

  const canViewTeacherDashboard = userRoles.some((role) =>
    ['PROFESSOR', 'UNIDADE', 'STAFF_CENTRAL', 'MANTENEDORA', 'DEVELOPER'].includes(role)
  );

  const isProfessor = userRoles.includes('PROFESSOR');
  const isDeveloper = userRoles.includes('DEVELOPER');

  // Handlers
  const handleLoadUnitDashboard = async () => {
    try {
      setUnitLoading(true);
      setUnitError(null);

      const params: Record<string, string> = {
        from: fromDate,
        to: toDate,
      };

      // Roles globais precisam de unitId
      if (!['UNIDADE', 'STAFF_CENTRAL'].some((r) => userRoles.includes(r))) {
        if (!unitId) {
          setUnitError('unitId é obrigatório para sua role');
          setUnitLoading(false);
          return;
        }
        params.unitId = unitId;
      }

      const data = await getUnitDashboard(params);
      setUnitData(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setUnitError(error.response?.data?.message || 'Erro ao carregar dashboard da unidade');
    } finally {
      setUnitLoading(false);
    }
  };

  const handleLoadTeacherDashboard = async () => {
    try {
      setTeacherLoading(true);
      setTeacherError(null);

      const params: Record<string, string> = {
        date: teacherDate,
      };

      // Roles não-professor precisam de classroomId
      if (!isProfessor) {
        if (!classroomId) {
          setTeacherError('classroomId é obrigatório para sua role');
          setTeacherLoading(false);
          return;
        }
        params.classroomId = classroomId;
      } else if (classroomId) {
        // Professor pode filtrar por turma específica
        params.classroomId = classroomId;
      }

      const data = await getTeacherDashboard(params);
      setTeacherData(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setTeacherError(error.response?.data?.message || 'Erro ao carregar dashboard do professor');
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard - Hub de Gestão</h1>

      {/* Informações do Usuário */}
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Email:</span> {user?.email}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Roles:</span> {userRoles.join(', ')}
        </p>
      </div>

      {/* Dashboard da Unidade */}
      {canViewUnitDashboard && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            📊 Painel da Unidade
          </h2>

          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {!['UNIDADE', 'STAFF_CENTRAL'].some((r) => userRoles.includes(r)) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit ID *
                </label>
                <input
                  type="text"
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  placeholder="UUID da unidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                De
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Até
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleLoadUnitDashboard}
                disabled={unitLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {unitLoading ? 'Carregando...' : 'Carregar'}
              </button>
            </div>
          </div>

          {/* Erro */}
          {unitError && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md mb-4">
              {unitError}
            </div>
          )}

          {/* KPIs */}
          {unitData && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Período: {unitData.period.from} até {unitData.period.to}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Eventos Criados</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {unitData.kpis.diaryCreatedTotal}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600">Não Planejados</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {unitData.kpis.unplannedCount}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600">Planejamentos Pendentes</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {unitData.kpis.planningsDraftOrPending}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Turmas Ativas</p>
                  <p className="text-2xl font-bold text-green-700">
                    {unitData.kpis.classroomsCount}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Crianças Ativas</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {unitData.kpis.activeChildrenCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dashboard do Professor */}
      {canViewTeacherDashboard && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            👨‍🏫 Dashboard do Professor (KPIs do dia)
          </h2>

          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={teacherDate}
                onChange={(e) => setTeacherDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom ID {!isProfessor && '*'}
              </label>
              <input
                type="text"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder={isProfessor ? 'Opcional' : 'UUID da turma'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleLoadTeacherDashboard}
                disabled={teacherLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {teacherLoading ? 'Carregando...' : 'Carregar'}
              </button>
            </div>
          </div>

          {/* Erro */}
          {teacherError && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md mb-4">
              {teacherError}
            </div>
          )}

          {/* KPIs por Turma */}
          {teacherData && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Data: {teacherData.date}
              </p>
              {teacherData.classrooms.length === 0 && (
                <p className="text-gray-500">Nenhuma turma encontrada.</p>
              )}
              <div className="space-y-4">
                {teacherData.classrooms.map((classroom) => (
                  <div
                    key={classroom.classroomId}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <h3 className="font-semibold text-lg mb-3">
                      {classroom.classroomName}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Total Eventos</p>
                        <p className="text-xl font-bold">{classroom.totalDiaryEvents}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Não Planejados</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {classroom.unplannedEvents}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Microgestos</p>
                        <p className="text-xl font-bold text-blue-600">
                          {classroom.microGesturesFilled}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Status Planejamento</p>
                        <p className="text-sm font-semibold text-green-600">
                          {classroom.activePlanningStatus || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug JSON (apenas para DEVELOPER) */}
      {(isDeveloper || true) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-gray-700 font-medium hover:text-gray-900"
          >
            {showDebug ? '▼' : '▶'} Show Debug JSON
          </button>
          {showDebug && (
            <div className="mt-2 space-y-2">
              {unitData && (
                <details className="bg-white p-3 rounded border">
                  <summary className="cursor-pointer font-medium">Unit Dashboard Data</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(unitData, null, 2)}
                  </pre>
                </details>
              )}
              {teacherData && (
                <details className="bg-white p-3 rounded border">
                  <summary className="cursor-pointer font-medium">Teacher Dashboard Data</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(teacherData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
