import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fetcher } from '@/api/client';
import type {
  Client,
  ContentItem,
  Template,
  RenderJob,
  Screen,
  Playlist,
  AIJob,
  DashboardStats,
} from '@/api/types';

// ============================================
// Clients
// ============================================

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => fetcher<Client[]>('/clients'),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => fetcher<Client>(`/clients/${id}`),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Client>) => api.post('/clients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      api.patch(`/clients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// ============================================
// Content
// ============================================

export function useContent(clientId?: string) {
  return useQuery({
    queryKey: ['content', clientId],
    queryFn: () => fetcher<ContentItem[]>(`/content${clientId ? `?clientId=${clientId}` : ''}`),
  });
}

export function useContentItem(id: string) {
  return useQuery({
    queryKey: ['content', 'item', id],
    queryFn: () => fetcher<ContentItem>(`/content/${id}`),
    enabled: !!id,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContentItem>) => api.post('/content', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      api.patch(`/content/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

// ============================================
// Templates
// ============================================

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => fetcher<Template[]>('/templates'),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => fetcher<Template>(`/templates/${id}`),
    enabled: !!id,
  });
}

// ============================================
// Render Jobs
// ============================================

export function useRenderJobs(clientId?: string) {
  return useQuery({
    queryKey: ['renders', clientId],
    queryFn: () => fetcher<RenderJob[]>(`/render${clientId ? `?clientId=${clientId}` : ''}`),
    refetchInterval: 5000, // Poll every 5 seconds for active jobs
  });
}

export function useRenderJob(id: string) {
  return useQuery({
    queryKey: ['renders', id],
    queryFn: () => fetcher<RenderJob>(`/render/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'queued' || status === 'processing' || status === 'rendering'
        ? 2000
        : false;
    },
  });
}

export function useCreateRender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      clientId: string;
      contentId: string;
      templateId: string;
      format: string;
      duration?: number;
      aiOptions?: Record<string, unknown>;
    }) => api.post('/render', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renders'] });
    },
  });
}

// ============================================
// Screens
// ============================================

export function useScreens() {
  return useQuery({
    queryKey: ['screens'],
    queryFn: () => fetcher<Screen[]>('/screens'),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useScreen(id: string) {
  return useQuery({
    queryKey: ['screens', id],
    queryFn: () => fetcher<Screen>(`/screens/${id}`),
    enabled: !!id,
  });
}

export function useUpdateScreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Screen> }) =>
      api.patch(`/screens/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens'] });
    },
  });
}

export function usePushToScreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ screenId, contentUrl }: { screenId: string; contentUrl: string }) =>
      api.post(`/screens/${screenId}/push`, { contentUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens'] });
    },
  });
}

// ============================================
// Playlists
// ============================================

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => fetcher<Playlist[]>('/playlists'),
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ['playlists', id],
    queryFn: () => fetcher<Playlist>(`/playlists/${id}`),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Playlist>) => api.post('/playlists', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Playlist> }) =>
      api.patch(`/playlists/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/playlists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

// ============================================
// AI Jobs
// ============================================

export function useAIJobs(clientId?: string) {
  return useQuery({
    queryKey: ['ai-jobs', clientId],
    queryFn: () => fetcher<AIJob[]>(`/ai/generate${clientId ? `?clientId=${clientId}` : ''}`),
  });
}

export function useCreateAIJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: string;
      provider: string;
      prompt: string;
      clientId?: string;
    }) => api.post('/ai/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-jobs'] });
    },
  });
}

// ============================================
// Dashboard Stats
// ============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetcher<DashboardStats>('/stats'),
  });
}
