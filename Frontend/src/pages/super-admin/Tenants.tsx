import { useEffect, useState } from 'react';
import { Plus, MoreVertical, Building, Loader2, Search, Filter, Eye, Edit2, X, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import type { Tenant, TenantCreateRequest, TenantUpdateRequest, UserResponse } from '../../types';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormLabel, FormControl, FormMessage, FormItem } from "../../components/forms/form";
import { useToast } from "../../context/ToastContext";
import { handleApiValidationErrors } from '../../utils/errorHandler';

const tenantSchema = z.object({
  name: z.string().min(1, "School Name is required"),
  code: z.string().min(1, "School Code is required"),
  type: z.enum(['PRIVATE', 'GOVERNMENT', 'GOVERNMENT_AIDED']),
  board: z.enum(['CBSE', 'ICSE', 'BSE_ODISHA', 'CHSE_ODISHA', 'OTHER']),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pinCode: z.string().regex(/^\d{6}$/, "Must be a 6 digit PIN code").optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number").optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  website: z.string().url("Invalid URL").optional().or(z.literal(''))
});

export type TenantFormValues = z.infer<typeof tenantSchema>;

const adminSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
  username: z.string().min(1, "Username is required"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number").min(1, "Mobile Number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AdminFormValues = z.infer<typeof adminSchema>;

const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Admin Form state
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<UserResponse | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');

  const { showToast } = useToast();

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      code: '', name: '', type: 'PRIVATE', board: 'CBSE', address: '', city: '', district: '', state: '', pinCode: '', phone: '', email: '', website: ''
    }
  });

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '', username: '', mobileNumber: '', email: '', password: '', confirmPassword: ''
    }
  });

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const openCreateModal = () => {
    setModalMode('CREATE');
    form.reset({
      code: '', name: '', type: 'PRIVATE', board: 'CBSE', address: '', city: '', district: '', state: '', pinCode: '', phone: '', email: '', website: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setModalMode('EDIT');
    setSelectedTenant(tenant);
    form.reset({
      code: tenant.code,
      name: tenant.name,
      type: (tenant.type as any) || 'PRIVATE',
      board: (tenant.board as any) || 'CBSE',
      address: tenant.address || '',
      city: tenant.city || '',
      district: tenant.district || '',
      state: tenant.state || '',
      pinCode: tenant.pinCode || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      website: tenant.website || ''
    });
    setFormError('');
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const openViewModal = (tenant: Tenant) => {
    setModalMode('VIEW');
    setSelectedTenant(tenant);
    setIsAdminFormOpen(false);
    setCreatedAdmin(null);
    setAdminFormError('');
    adminForm.reset({ name: '', username: '', mobileNumber: '', email: '', password: '', confirmPassword: '' });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const onSubmitTenant = async (data: TenantFormValues) => {
    setFormError('');
    setIsSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        const createData: TenantCreateRequest = { ...data, code: data.code.toUpperCase() };
        await tenantService.createTenant(createData);
        showToast('School created successfully', 'success');
      } else if (modalMode === 'EDIT' && selectedTenant) {
        const updateData: TenantUpdateRequest = { ...data, code: data.code.toUpperCase() };
        await tenantService.updateTenant(selectedTenant.id, updateData);
        showToast('School updated successfully', 'success');
      }
      
      fetchTenants();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err: any) {
      if (!handleApiValidationErrors(err, form, showToast)) {
        setFormError(err.response?.data?.message || `Failed to ${modalMode.toLowerCase()} school. Ensure code is unique.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidTenant = (errors: any) => {
    const fieldLabels: Record<string, string> = { name: 'School Name', code: 'School Code', type: 'School Type', board: 'Board' };
    const errorFields = Object.keys(errors).map(key => fieldLabels[key] || key);
    showToast(`Please complete the required fields: ${errorFields.join(", ")}`, 'error');
  };

  const toggleStatus = async (tenant: Tenant) => {
    if (!window.confirm(`Are you sure you want to ${tenant.active ? 'deactivate' : 'activate'} this school? Users belonging to a deactivated school will not be able to log in.`)) {
      return;
    }
    setActiveDropdown(null);
    try {
      await tenantService.updateTenantStatus(tenant.id, !tenant.active);
      fetchTenants();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (tenant: Tenant) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${tenant.name}? This will permanently remove the school and ALL its users. This action cannot be undone.`)) {
      return;
    }
    setActiveDropdown(null);
    try {
      await tenantService.deleteTenant(tenant.id);
      showToast('School deleted successfully', 'success');
      fetchTenants();
    } catch (err: any) {
      console.error('Failed to delete tenant', err);
      showToast(err.response?.data?.message || 'Failed to delete school', 'error');
    }
  };

  const onSubmitAdmin = async (data: AdminFormValues) => {
    setAdminFormError('');
    if (!selectedTenant) return;

    setIsAdminSubmitting(true);
    try {
      const { confirmPassword, ...adminData } = data;
      const newAdmin = await tenantService.createSchoolAdmin(selectedTenant.id, adminData);
      setCreatedAdmin(newAdmin);
      setIsAdminFormOpen(false);
      showToast('School administrator created successfully', 'success');
    } catch (err: any) {
      if (!handleApiValidationErrors(err, adminForm, showToast)) {
        setAdminFormError(err.response?.data?.message || 'Failed to create admin');
      }
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const onInvalidAdmin = (errors: any) => {
    const fieldLabels: Record<string, string> = { name: 'Full Name', username: 'Username', mobileNumber: 'Mobile Number', password: 'Password', confirmPassword: 'Confirm Password' };
    const errorFields = Object.keys(errors).map(key => fieldLabels[key] || key);
    showToast(`Please complete the required fields: ${errorFields.join(", ")}`, 'error');
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' ? true : 
                          filterStatus === 'ACTIVE' ? t.active : !t.active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Schools</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage schools in your ERP network.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors w-full sm:w-auto shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add School
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search schools by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition duration-150 ease-in-out appearance-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-lg mx-auto mt-8">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-500 mb-6">
            {tenants.length === 0 ? "Create your first school to start managing your School ERP network." : "No schools match your search or filter criteria."}
          </p>
          {tenants.length === 0 && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add School
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white shadow-sm rounded-xl border border-gray-200 overflow-visible">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Board</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tenant.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.type?.replace(/_/g, ' ') || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{tenant.board?.replace(/_/g, ' ') || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.city || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{tenant.state || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tenant.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tenant.active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {tenant.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === tenant.id ? null : tenant.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeDropdown === tenant.id && (
                        <div className="absolute right-8 top-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => openViewModal(tenant)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button
                              onClick={() => openEditModal(tenant)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => toggleStatus(tenant)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2"
                            >
                              <AlertTriangle className="w-4 h-4" /> {tenant.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(tenant)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-4">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-dark)]">{tenant.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{tenant.code}</p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === tenant.id ? null : tenant.id)}
                      className="text-gray-400 p-1 -mr-1"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeDropdown === tenant.id && (
                      <div className="absolute right-0 top-8 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => openViewModal(tenant)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                          <button
                            onClick={() => openEditModal(tenant)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(tenant)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <AlertTriangle className="w-4 h-4" /> {tenant.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(tenant)}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3 mt-3">
                  <div>
                    <p className="text-gray-500 text-xs">Type / Board</p>
                    <p className="font-medium text-gray-800">{tenant.board?.replace(/_/g, ' ')} · {tenant.type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Location</p>
                    <p className="font-medium text-gray-800">{tenant.city || 'N/A'}, {tenant.state || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    tenant.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tenant.active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    {tenant.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-gray-50 sm:bg-black/40 sm:backdrop-blur-sm overflow-hidden">
          <div className="w-full h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-xl shadow-2xl flex flex-col sm:max-w-3xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'CREATE' ? 'Add New School' : modalMode === 'EDIT' ? 'Edit School' : 'School Details'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              
              {formError && (
                <div className="mb-6 flex items-start gap-2 bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  {formError}
                </div>
              )}

              {modalMode === 'VIEW' && selectedTenant ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">School Name</p>
                        <p className="font-medium text-gray-900">{selectedTenant.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">School Code</p>
                        <p className="font-medium text-gray-900">{selectedTenant.code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{selectedTenant.type?.replace(/_/g, ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Board</p>
                        <p className="font-medium text-gray-900">{selectedTenant.board?.replace(/_/g, ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                          selectedTenant.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedTenant.active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                          {selectedTenant.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Location</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">{selectedTenant.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium text-gray-900">{selectedTenant.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">District</p>
                        <p className="font-medium text-gray-900">{selectedTenant.district || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">State</p>
                        <p className="font-medium text-gray-900">{selectedTenant.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PIN Code</p>
                        <p className="font-medium text-gray-900">{selectedTenant.pinCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{selectedTenant.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedTenant.email || 'N/A'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-500">Website</p>
                        <p className="font-medium text-gray-900">{selectedTenant.website || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Administrator</h3>
                      {!isAdminFormOpen && !createdAdmin && (
                        <button
                          onClick={() => setIsAdminFormOpen(true)}
                          className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Create Admin
                        </button>
                      )}
                    </div>

                    {createdAdmin ? (
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-green-100 text-green-600 p-2 rounded-full">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Admin Account Created</p>
                            <p className="text-sm text-gray-500">The administrator can now log in using these credentials.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{createdAdmin.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Username</p>
                            <p className="font-medium text-gray-900">{createdAdmin.username}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Mobile Number</p>
                            <p className="font-medium text-gray-900">{createdAdmin.mobileNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Role</p>
                            <p className="font-medium text-gray-900">{createdAdmin.role.replace(/_/g, ' ')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className="font-medium text-green-600">Active</p>
                          </div>
                        </div>
                      </div>
                    ) : isAdminFormOpen ? (
                      <form onSubmit={adminForm.handleSubmit(onSubmitAdmin, onInvalidAdmin)} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                        {adminFormError && (
                          <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            {adminFormError}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormItem>
                            <FormLabel required>Full Name</FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...adminForm.register("name")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </FormControl>
                            {adminForm.formState.errors.name && <FormMessage>{adminForm.formState.errors.name.message}</FormMessage>}
                          </FormItem>
                          <FormItem>
                            <FormLabel required>Username</FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...adminForm.register("username")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </FormControl>
                            {adminForm.formState.errors.username && <FormMessage>{adminForm.formState.errors.username.message}</FormMessage>}
                          </FormItem>
                          <FormItem>
                            <FormLabel required>Mobile Number</FormLabel>
                            <FormControl>
                              <input
                                type="tel"
                                {...adminForm.register("mobileNumber")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="10-digit number"
                              />
                            </FormControl>
                            {adminForm.formState.errors.mobileNumber && <FormMessage>{adminForm.formState.errors.mobileNumber.message}</FormMessage>}
                          </FormItem>
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <input
                                type="email"
                                {...adminForm.register("email")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </FormControl>
                            {adminForm.formState.errors.email && <FormMessage>{adminForm.formState.errors.email.message}</FormMessage>}
                          </FormItem>
                          <FormItem>
                            <FormLabel required>Password</FormLabel>
                            <FormControl>
                              <input
                                type="password"
                                {...adminForm.register("password")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </FormControl>
                            {adminForm.formState.errors.password && <FormMessage>{adminForm.formState.errors.password.message}</FormMessage>}
                          </FormItem>
                          <FormItem>
                            <FormLabel required>Confirm Password</FormLabel>
                            <FormControl>
                              <input
                                type="password"
                                {...adminForm.register("confirmPassword")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </FormControl>
                            {adminForm.formState.errors.confirmPassword && <FormMessage>{adminForm.formState.errors.confirmPassword.message}</FormMessage>}
                          </FormItem>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAdminFormOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isAdminSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex items-center"
                          >
                            {isAdminSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create Admin
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        No administrator created yet for this school.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <form id="school-form" onSubmit={form.handleSubmit(onSubmitTenant, onInvalidTenant)} className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormItem>
                        <FormLabel required>School Name</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("name")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. Lincoln High School"
                          />
                        </FormControl>
                        {form.formState.errors.name && <FormMessage>{form.formState.errors.name.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel required>School Code</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("code")}
                            disabled={modalMode === 'EDIT'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none uppercase disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="e.g. LINCOLN01"
                          />
                        </FormControl>
                        {form.formState.errors.code && <FormMessage>{form.formState.errors.code.message}</FormMessage>}
                        {modalMode === 'EDIT' && <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation.</p>}
                      </FormItem>
                      <FormItem>
                        <FormLabel required>School Type</FormLabel>
                        <FormControl>
                          <select
                            {...form.register("type")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-white"
                          >
                            <option value="PRIVATE">Private</option>
                            <option value="GOVERNMENT">Government</option>
                            <option value="GOVERNMENT_AIDED">Government Aided</option>
                          </select>
                        </FormControl>
                        {form.formState.errors.type && <FormMessage>{form.formState.errors.type.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel required>Board</FormLabel>
                        <FormControl>
                          <select
                            {...form.register("board")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-white"
                          >
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="BSE_ODISHA">BSE Odisha</option>
                            <option value="CHSE_ODISHA">CHSE Odisha</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </FormControl>
                        {form.formState.errors.board && <FormMessage>{form.formState.errors.board.message}</FormMessage>}
                      </FormItem>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                      Location
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("address")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="e.g. 123 Main Street"
                          />
                        </FormControl>
                        {form.formState.errors.address && <FormMessage>{form.formState.errors.address.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("city")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                          />
                        </FormControl>
                        {form.formState.errors.city && <FormMessage>{form.formState.errors.city.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("district")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                          />
                        </FormControl>
                        {form.formState.errors.district && <FormMessage>{form.formState.errors.district.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("state")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                          />
                        </FormControl>
                        {form.formState.errors.state && <FormMessage>{form.formState.errors.state.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel>PIN Code</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            {...form.register("pinCode")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="6 digits"
                          />
                        </FormControl>
                        {form.formState.errors.pinCode && <FormMessage>{form.formState.errors.pinCode.message}</FormMessage>}
                      </FormItem>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <input
                            type="tel"
                            {...form.register("phone")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="10-digit number"
                          />
                        </FormControl>
                        {form.formState.errors.phone && <FormMessage>{form.formState.errors.phone.message}</FormMessage>}
                      </FormItem>
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <input
                            type="email"
                            {...form.register("email")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                          />
                        </FormControl>
                        {form.formState.errors.email && <FormMessage>{form.formState.errors.email.message}</FormMessage>}
                      </FormItem>
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <input
                            type="url"
                            {...form.register("website")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            placeholder="https://"
                          />
                        </FormControl>
                        {form.formState.errors.website && <FormMessage>{form.formState.errors.website.message}</FormMessage>}
                      </FormItem>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none"
              >
                {modalMode === 'VIEW' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'VIEW' && (
                <button
                  type="submit"
                  form="school-form"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex justify-center items-center px-6 py-3 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    modalMode === 'CREATE' ? 'Create School' : 'Save Changes'
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
