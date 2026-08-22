import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormLabel, FormControl, FormMessage, FormItem } from "../../components/forms/form";
import { useToast } from "../../context/ToastContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SuperAdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const responseData = await authService.login(data);
      login(responseData.accessToken, responseData.refreshToken, responseData.user);
      navigate('/super-admin');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid username or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    const fieldLabels: Record<string, string> = { username: 'Username', password: 'Password' };
    const errorFields = Object.keys(errors).map(key => fieldLabels[key] || key);
    showToast(`Please complete the required fields: ${errorFields.join(", ")}`, 'error');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-dark)]">
          School ERP
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          Super Administrator <br/>
          Manage your schools
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormItem>
              <FormLabel required>Username</FormLabel>
              <FormControl>
                <input
                  type="text"
                  autoComplete="username"
                  {...form.register("username")}
                  className="appearance-none block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-base sm:text-sm"
                />
              </FormControl>
              {form.formState.errors.username && <FormMessage>{form.formState.errors.username.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel required>Password</FormLabel>
              <FormControl>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...form.register("password")}
                    className="appearance-none block w-full px-3 py-3 sm:py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-base sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormControl>
              {form.formState.errors.password && <FormMessage>{form.formState.errors.password.message}</FormMessage>}
            </FormItem>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
