import { useEffect, useState } from 'react';
import { School, Building, Clock } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types';

const SuperAdminDashboard = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await tenantService.getTenants();
        setTenants(data);
      } catch (error) {
        console.error('Failed to fetch tenants', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const totalSchools = tenants.length;
  const activeSchools = tenants.filter(t => t.active).length;
  const inactiveSchools = totalSchools - activeSchools;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Overview of your School ERP network.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Total Schools</p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-text-dark)]">{totalSchools}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <School className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Active Schools</p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-success)]">{activeSchools}</p>
              </div>
              <div className="p-3 bg-green-50 text-[var(--color-success)] rounded-lg">
                <Building className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Inactive Schools</p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-danger)]">{inactiveSchools}</p>
              </div>
              <div className="p-3 bg-red-50 text-[var(--color-danger)] rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[var(--color-text-dark)] mb-4">Recent Schools</h2>
            
            {tenants.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <School className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No schools</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new school.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {tenants.slice(0, 5).map((tenant) => (
                    <li key={tenant.id} className="p-4 sm:px-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-dark)]">{tenant.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">Code: {tenant.code}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tenant.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
