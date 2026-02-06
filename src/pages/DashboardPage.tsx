import { useAuth } from '../app/AuthProvider';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          {user?.roles && user.roles.length > 0 && (
            <p>
              <span className="font-medium">Roles:</span> {user.roles.join(', ')}
            </p>
          )}
          <div className="mt-4">
            <p className="font-medium mb-2">Dados completos do usuário:</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
