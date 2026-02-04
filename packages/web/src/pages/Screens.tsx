import { useState } from 'react';
import {
  Plus,
  Search,
  Monitor,
  Wifi,
  WifiOff,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  RefreshCw,
  ListVideo,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button, Card, Badge, Input, Modal, Select, EmptyState, PageSpinner } from '@/components/ui';
import { useScreens, useUpdateScreen, usePushToScreen, usePlaylists, useRenderJobs, useClients } from '@/hooks/useApi';
import { cn, formatDateTime, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Screen, Playlist, RenderJob } from '@/api/types';

const statusConfig = {
  online: { icon: Wifi, color: 'success', label: 'Online' },
  offline: { icon: WifiOff, color: 'error', label: 'Offline' },
  idle: { icon: Monitor, color: 'warning', label: 'Idle' },
};

export default function Screens() {
  const { data: screens, isLoading, refetch } = useScreens();
  const { data: clients = [] } = useClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [showPush, setShowPush] = useState<Screen | null>(null);
  const [showPlaylist, setShowPlaylist] = useState<Screen | null>(null);

  const filteredScreens = (screens || []).filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const screenStats = {
    total: screens?.length || 0,
    online: screens?.filter((s) => s.status === 'online').length || 0,
    offline: screens?.filter((s) => s.status === 'offline').length || 0,
    idle: screens?.filter((s) => s.status === 'idle').length || 0,
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Screens"
          value={screenStats.total}
          onClick={() => setStatusFilter('')}
          active={!statusFilter}
        />
        <StatCard
          label="Online"
          value={screenStats.online}
          variant="success"
          onClick={() => setStatusFilter('online')}
          active={statusFilter === 'online'}
        />
        <StatCard
          label="Idle"
          value={screenStats.idle}
          variant="warning"
          onClick={() => setStatusFilter('idle')}
          active={statusFilter === 'idle'}
        />
        <StatCard
          label="Offline"
          value={screenStats.offline}
          variant="error"
          onClick={() => setStatusFilter('offline')}
          active={statusFilter === 'offline'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search screens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>

        <Button>
          <Plus className="w-4 h-4" />
          Add Screen
        </Button>
      </div>

      {/* Screens Grid */}
      {filteredScreens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScreens.map((screen) => (
            <ScreenCard
              key={screen.id}
              screen={screen}
              client={clients.find((c) => c.id === screen.clientId)}
              onPush={() => setShowPush(screen)}
              onPlaylist={() => setShowPlaylist(screen)}
              onEdit={() => setSelectedScreen(screen)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No screens found"
          description="Add your first screen to start displaying content"
          icon={<Monitor className="w-12 h-12" />}
          action={
            <Button>
              <Plus className="w-4 h-4" />
              Add Screen
            </Button>
          }
        />
      )}

      {/* Push Content Modal */}
      <PushContentModal
        screen={showPush}
        onClose={() => setShowPush(null)}
      />

      {/* Assign Playlist Modal */}
      <AssignPlaylistModal
        screen={showPlaylist}
        onClose={() => setShowPlaylist(null)}
      />

      {/* Edit Screen Modal */}
      <EditScreenModal
        screen={selectedScreen}
        clients={clients}
        onClose={() => setSelectedScreen(null)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = 'gray',
  onClick,
  active,
}: {
  label: string;
  value: number;
  variant?: 'gray' | 'success' | 'warning' | 'error';
  onClick: () => void;
  active: boolean;
}) {
  const variants = {
    gray: 'border-dark-50',
    success: 'border-success/30',
    warning: 'border-warning/30',
    error: 'border-error/30',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border-2 text-left transition-all',
        active ? 'bg-dark-100 border-gold-500' : `bg-dark-200 ${variants[variant]} hover:border-gray-600`
      )}
    >
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </button>
  );
}

function ScreenCard({
  screen,
  client,
  onPush,
  onPlaylist,
  onEdit,
}: {
  screen: Screen;
  client?: { name: string };
  onPush: () => void;
  onPlaylist: () => void;
  onEdit: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusConfig[screen.status];
  const StatusIcon = status.icon;

  return (
    <Card className="relative group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            screen.status === 'online' ? 'bg-success/10 text-success' :
            screen.status === 'idle' ? 'bg-warning/10 text-warning' :
            'bg-dark-100 text-gray-500'
          )}>
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{screen.name}</h3>
            {client && <p className="text-sm text-gray-400">{client.name}</p>}
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={status.color as any} dot>
          {status.label}
        </Badge>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-2 text-sm">
        {screen.location && (
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="w-4 h-4" />
            {screen.location}
          </div>
        )}
        {screen.resolution && (
          <div className="flex items-center gap-2 text-gray-400">
            <Monitor className="w-4 h-4" />
            {screen.resolution} • {screen.orientation || 'landscape'}
          </div>
        )}
        {screen.lastSeen && (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            Last seen: {formatDateTime(screen.lastSeen)}
          </div>
        )}
      </div>

      {/* Current Content */}
      {screen.currentContent && (
        <div className="mt-4 p-3 bg-dark-100 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Now Playing</p>
          <p className="text-sm text-white truncate">{screen.currentContent}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-dark-50 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onPush}
          disabled={screen.status === 'offline'}
        >
          <Send className="w-4 h-4" />
          Push
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onPlaylist}
        >
          <ListVideo className="w-4 h-4" />
          Playlist
        </Button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-gray-500 hover:text-white hover:bg-dark-100 rounded-lg"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Menu Dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="dropdown right-4 bottom-16 min-w-[140px] z-50">
            <button
              onClick={() => {
                onEdit();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-100"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10">
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

function PushContentModal({
  screen,
  onClose,
}: {
  screen: Screen | null;
  onClose: () => void;
}) {
  const { data: renders = [] } = useRenderJobs();
  const pushToScreen = usePushToScreen();
  const [selectedContent, setSelectedContent] = useState('');

  const completedRenders = renders.filter((r) => r.status === 'completed' && r.outputUrl);

  const handlePush = async () => {
    if (!screen || !selectedContent) return;
    try {
      await pushToScreen.mutateAsync({ screenId: screen.id, contentUrl: selectedContent });
      toast.success('Content pushed to screen');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      open={!!screen}
      onClose={onClose}
      title={`Push to ${screen?.name}`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-400">Select content to push to this screen:</p>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {completedRenders.map((render) => (
            <button
              key={render.id}
              onClick={() => setSelectedContent(render.outputUrl!)}
              className={cn(
                'w-full p-3 rounded-lg border-2 text-left transition-all',
                selectedContent === render.outputUrl
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-dark-50 hover:border-gray-600'
              )}
            >
              <p className="font-medium text-white">{render.templateId}</p>
              <p className="text-sm text-gray-400">{render.format}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePush}
            disabled={!selectedContent}
            loading={pushToScreen.isPending}
          >
            <Send className="w-4 h-4" />
            Push Content
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AssignPlaylistModal({
  screen,
  onClose,
}: {
  screen: Screen | null;
  onClose: () => void;
}) {
  const { data: playlists = [] } = usePlaylists();
  const updateScreen = useUpdateScreen();
  const [selectedPlaylist, setSelectedPlaylist] = useState(screen?.playlistId || '');

  const handleAssign = async () => {
    if (!screen) return;
    try {
      await updateScreen.mutateAsync({
        id: screen.id,
        data: { playlistId: selectedPlaylist || undefined },
      });
      toast.success('Playlist assigned');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      open={!!screen}
      onClose={onClose}
      title={`Assign Playlist to ${screen?.name}`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-400">Select a playlist for this screen:</p>

        <div className="max-h-64 overflow-y-auto space-y-2">
          <button
            onClick={() => setSelectedPlaylist('')}
            className={cn(
              'w-full p-3 rounded-lg border-2 text-left transition-all',
              !selectedPlaylist
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-dark-50 hover:border-gray-600'
            )}
          >
            <p className="font-medium text-white">No Playlist</p>
            <p className="text-sm text-gray-400">Manual control only</p>
          </button>

          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist.id)}
              className={cn(
                'w-full p-3 rounded-lg border-2 text-left transition-all',
                selectedPlaylist === playlist.id
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-dark-50 hover:border-gray-600'
              )}
            >
              <p className="font-medium text-white">{playlist.name}</p>
              <p className="text-sm text-gray-400">{playlist.items.length} items</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} loading={updateScreen.isPending}>
            <ListVideo className="w-4 h-4" />
            Assign Playlist
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditScreenModal({
  screen,
  clients,
  onClose,
}: {
  screen: Screen | null;
  clients: { id: string; name: string }[];
  onClose: () => void;
}) {
  const updateScreen = useUpdateScreen();
  const [form, setForm] = useState({
    name: screen?.name || '',
    clientId: screen?.clientId || '',
    location: screen?.location || '',
    resolution: screen?.resolution || '',
    orientation: screen?.orientation || 'landscape',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screen) return;
    try {
      await updateScreen.mutateAsync({ id: screen.id, data: form });
      toast.success('Screen updated');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal open={!!screen} onClose={onClose} title="Edit Screen" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Screen Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <Select
          label="Client"
          options={[
            { value: '', label: 'No Client' },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
        />

        <Input
          label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g., Main Lobby"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Resolution"
            value={form.resolution}
            onChange={(e) => setForm({ ...form, resolution: e.target.value })}
            placeholder="1920x1080"
          />
          <Select
            label="Orientation"
            options={[
              { value: 'landscape', label: 'Landscape' },
              { value: 'portrait', label: 'Portrait' },
            ]}
            value={form.orientation}
            onChange={(e) => setForm({ ...form, orientation: e.target.value as any })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-50">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={updateScreen.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
