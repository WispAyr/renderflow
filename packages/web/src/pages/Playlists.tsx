import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ListVideo,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  Pause,
  GripVertical,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Card, CardHeader, Badge, Input, Modal, Select, EmptyState, PageSpinner } from '@/components/ui';
import { usePlaylists, useCreatePlaylist, useUpdatePlaylist, useDeletePlaylist, useRenderJobs, useClients } from '@/hooks/useApi';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Playlist, PlaylistItem, PlaylistSchedule, RenderJob } from '@/api/types';

export default function Playlists() {
  const { data: playlists, isLoading } = usePlaylists();
  const { data: clients = [] } = useClients();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [deletePlaylist, setDeletePlaylist] = useState<Playlist | null>(null);

  const filteredPlaylists = useMemo(() => {
    return (playlists || []).filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [playlists, search]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search playlists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Create Playlist
        </Button>
      </div>

      {/* Playlists Grid */}
      {filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              client={clients.find((c) => c.id === playlist.clientId)}
              onEdit={() => setEditPlaylist(playlist)}
              onDelete={() => setDeletePlaylist(playlist)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No playlists found"
          description="Create your first playlist to organize your content"
          icon={<ListVideo className="w-12 h-12" />}
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Create Playlist
            </Button>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <PlaylistModal
        open={showCreate || !!editPlaylist}
        playlist={editPlaylist}
        onClose={() => {
          setShowCreate(false);
          setEditPlaylist(null);
        }}
      />

      {/* Delete Confirmation */}
      <DeleteModal
        playlist={deletePlaylist}
        onClose={() => setDeletePlaylist(null)}
      />
    </div>
  );
}

function PlaylistCard({
  playlist,
  client,
  onEdit,
  onDelete,
}: {
  playlist: Playlist;
  client?: { name: string };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalDuration = playlist.items.reduce((acc, item) => acc + item.duration, 0);

  return (
    <Card hover className="relative group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{playlist.name}</h3>
            {client && <p className="text-sm text-gray-400">{client.name}</p>}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="dropdown right-0 min-w-[140px] z-50">
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
                <button
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {playlist.description && (
        <p className="mt-3 text-sm text-gray-400 truncate-2">
          {playlist.description}
        </p>
      )}

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Play className="w-4 h-4" />
          {playlist.items.length} items
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDuration(totalDuration)}
        </div>
      </div>

      {/* Schedule Badge */}
      {playlist.schedule?.enabled && (
        <div className="mt-3 p-2 bg-dark-100 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="text-gray-300">
              {playlist.schedule.startTime} - {playlist.schedule.endTime}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-dark-50 flex items-center justify-between">
        <Badge variant={playlist.active ? 'success' : 'gray'}>
          {playlist.active ? 'Active' : 'Inactive'}
        </Badge>
        <span className="text-xs text-gray-500">
          Updated {formatDate(playlist.updatedAt)}
        </span>
      </div>
    </Card>
  );
}

function PlaylistModal({
  open,
  playlist,
  onClose,
}: {
  open: boolean;
  playlist: Playlist | null;
  onClose: () => void;
}) {
  const { data: clients = [] } = useClients();
  const { data: renders = [] } = useRenderJobs();
  const createPlaylist = useCreatePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const isEditing = !!playlist;

  const completedRenders = renders.filter((r) => r.status === 'completed' && r.outputUrl);

  const [form, setForm] = useState({
    name: playlist?.name || '',
    clientId: playlist?.clientId || '',
    description: playlist?.description || '',
    items: playlist?.items || [] as PlaylistItem[],
    schedule: playlist?.schedule || {
      enabled: false,
      startTime: '09:00',
      endTime: '21:00',
      daysOfWeek: [1, 2, 3, 4, 5],
    } as PlaylistSchedule,
    active: playlist?.active ?? true,
  });

  const [showSchedule, setShowSchedule] = useState(form.schedule.enabled);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = form.items.findIndex((i) => i.id === active.id);
      const newIndex = form.items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(form.items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      }));
      setForm({ ...form, items: newItems });
    }
  };

  const addItem = (render: RenderJob) => {
    const newItem: PlaylistItem = {
      id: `item-${Date.now()}`,
      renderJobId: render.id,
      mediaUrl: render.outputUrl,
      duration: render.duration,
      sortOrder: form.items.length,
    };
    setForm({ ...form, items: [...form.items, newItem] });
  };

  const removeItem = (id: string) => {
    setForm({
      ...form,
      items: form.items.filter((i) => i.id !== id).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      })),
    });
  };

  const updateItemDuration = (id: string, duration: number) => {
    setForm({
      ...form,
      items: form.items.map((i) => (i.id === id ? { ...i, duration } : i)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        schedule: showSchedule ? form.schedule : { enabled: false },
      };
      if (isEditing) {
        await updatePlaylist.mutateAsync({ id: playlist!.id, data });
        toast.success('Playlist updated');
      } else {
        await createPlaylist.mutateAsync(data);
        toast.success('Playlist created');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Playlist' : 'Create Playlist'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Playlist Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="My Playlist"
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
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description..."
            rows={2}
            className="input resize-none"
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Playlist Items</label>
            <span className="text-sm text-gray-500">
              {form.items.length} items • {formatDuration(form.items.reduce((a, i) => a + i.duration, 0))} total
            </span>
          </div>

          {/* Drag and drop items */}
          {form.items.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={form.items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 mb-4">
                  {form.items.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      render={renders.find((r) => r.id === item.renderJobId)}
                      onRemove={() => removeItem(item.id)}
                      onDurationChange={(d) => updateItemDuration(item.id, d)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Add items */}
          <div className="p-4 bg-dark-100 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">Add renders to playlist:</p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {completedRenders.map((render) => (
                <button
                  key={render.id}
                  type="button"
                  onClick={() => addItem(render)}
                  disabled={form.items.some((i) => i.renderJobId === render.id)}
                  className={cn(
                    'p-2 rounded-lg border text-left text-sm transition-all',
                    form.items.some((i) => i.renderJobId === render.id)
                      ? 'border-dark-50 opacity-50 cursor-not-allowed'
                      : 'border-dark-50 hover:border-gold-500 hover:bg-gold-500/5'
                  )}
                >
                  <p className="text-white truncate">{render.templateId}</p>
                  <p className="text-xs text-gray-500">{formatDuration(render.duration)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Schedule Rules
          </button>

          {showSchedule && (
            <div className="mt-3 p-4 bg-dark-100 rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="scheduleEnabled"
                  checked={form.schedule.enabled}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      schedule: { ...form.schedule, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded border-dark-50 bg-dark-200 text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="scheduleEnabled" className="text-sm text-gray-300">
                  Enable schedule
                </label>
              </div>

              {form.schedule.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Time"
                      type="time"
                      value={form.schedule.startTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule: { ...form.schedule, startTime: e.target.value },
                        })
                      }
                    />
                    <Input
                      label="End Time"
                      type="time"
                      value={form.schedule.endTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          schedule: { ...form.schedule, endTime: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="label">Days of Week</label>
                    <div className="flex gap-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const days = form.schedule.daysOfWeek || [];
                            const newDays = days.includes(idx)
                              ? days.filter((d) => d !== idx)
                              : [...days, idx];
                            setForm({
                              ...form,
                              schedule: { ...form.schedule, daysOfWeek: newDays },
                            });
                          }}
                          className={cn(
                            'w-10 h-10 rounded-lg font-medium transition-colors',
                            form.schedule.daysOfWeek?.includes(idx)
                              ? 'bg-gold-500 text-dark-400'
                              : 'bg-dark-200 text-gray-400 hover:text-white'
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="w-4 h-4 rounded border-dark-50 bg-dark-100 text-gold-500 focus:ring-gold-500"
          />
          <label htmlFor="active" className="text-sm text-gray-300">
            Active playlist
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-50">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createPlaylist.isPending || updatePlaylist.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Playlist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SortableItem({
  item,
  render,
  onRemove,
  onDurationChange,
}: {
  item: PlaylistItem;
  render?: RenderJob;
  onRemove: () => void;
  onDurationChange: (d: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-dark-100 rounded-lg',
        isDragging && 'opacity-50'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-500 hover:text-white"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          {render?.templateId || 'Unknown render'}
        </p>
        <p className="text-xs text-gray-500">{render?.format || item.mediaUrl}</p>
      </div>

      <input
        type="number"
        value={item.duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        className="w-20 input text-sm py-1"
        min={1}
      />
      <span className="text-xs text-gray-500">sec</span>

      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-gray-500 hover:text-error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function DeleteModal({
  playlist,
  onClose,
}: {
  playlist: Playlist | null;
  onClose: () => void;
}) {
  const deletePlaylist = useDeletePlaylist();

  const handleDelete = async () => {
    if (!playlist) return;
    try {
      await deletePlaylist.mutateAsync(playlist.id);
      toast.success('Playlist deleted');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal open={!!playlist} onClose={onClose} title="Delete Playlist" size="sm">
      <div className="space-y-4">
        <p className="text-gray-300">
          Are you sure you want to delete <strong className="text-white">{playlist?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deletePlaylist.isPending}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
