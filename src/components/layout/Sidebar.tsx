import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/app/plannings', label: 'Planejamentos' },
  { path: '/app/diary', label: 'Diário' },
  { path: '/app/matrices', label: 'Matriz' },
  { path: '/app/reports', label: 'Relatórios' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Conexa V2</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
