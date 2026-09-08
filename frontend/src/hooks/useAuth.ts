import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { LoginPayload } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, logout, setUser, hasRole, hasPermission } = useAuthStore();

  const userQuery = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await authApi.getAuthUser();
      setUser(res.data);
      return res.data;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      return await authApi.login(payload);
    },
    onSuccess: (data) => {
      login({ user: data.data.user, token: data.data.token });
      queryClient.setQueryData(['authUser'], data.data.user);
      toast.success(data.message || 'Login successful!');
      navigate('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await authApi.logout();
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      toast.info('Logged out successfully.');
      navigate('/login');
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || userQuery.isLoading,
    loginMutation,
    logoutMutation,
    setUser,
    hasRole,
    hasPermission,
  };
};