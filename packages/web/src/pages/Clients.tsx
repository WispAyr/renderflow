import { useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Building2,
  Palette,
} from 'lucide-react';
import { Button, Card, Input, Modal, Badge, EmptyState, PageSpinner } from '@/components/ui';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useApi';
import { cn, getInitials, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Client, ClientBranding } from '@/api/types';

const defaultBranding: ClientBranding = {
  colors: {
    primary: '#FFD700',
    secondary: '#1a1a1f',
    background: '#0a0a0f',
    text: '#ffffff',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  theme: 'dark',
};

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const filteredClients = clients?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => setEditClient(client)}
              onDelete={() => setDeleteClient(client)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No clients found"
          description="Create your first client to get started with RenderFlow"
          icon={<Building2 className="w-12 h-12" />}
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <ClientModal
        open={showCreate || !!editClient}
        client={editClient}
        onClose={() => {
          setShowCreate(false);
          setEditClient(null);
        }}
      />

      {/* Delete Confirmation */}
      <DeleteModal
        client={deleteClient}
        onClose={() => setDeleteClient(null)}
      />
    </div>
  );
}

function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card hover className="relative group">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Logo/Avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
          style={{
            background: `linear-gradient(135deg, ${client.branding.colors.primary}, ${client.branding.colors.secondary})`,
            color: client.branding.colors.text,
          }}
        >
          {client.branding.logo ? (
            <img
              src={client.branding.logo}
              alt={client.name}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            getInitials(client.name)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{client.name}</h3>
          <p className="text-sm text-gray-500 truncate">@{client.slug}</p>
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

      {/* Branding Preview */}
      <div className="mt-4 pt-4 border-t border-dark-50">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Brand Colors</span>
        </div>
        <div className="flex gap-1.5">
          {Object.entries(client.branding.colors).slice(0, 4).map(([key, color]) => (
            <div
              key={key}
              className="w-8 h-8 rounded-lg border border-dark-50"
              style={{ backgroundColor: color }}
              title={key}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <Badge variant={client.settings.aiEnabled ? 'gold' : 'gray'}>
          {client.settings.aiEnabled ? 'AI Enabled' : 'AI Disabled'}
        </Badge>
        <span className="text-gray-500">Created {formatDate(client.createdAt)}</span>
      </div>
    </Card>
  );
}

function ClientModal({
  open,
  client,
  onClose,
}: {
  open: boolean;
  client: Client | null;
  onClose: () => void;
}) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const isEditing = !!client;

  const [form, setForm] = useState({
    name: client?.name || '',
    slug: client?.slug || '',
    branding: client?.branding || defaultBranding,
    settings: client?.settings || { aiEnabled: true },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateClient.mutateAsync({ id: client!.id, data: form });
        toast.success('Client updated');
      } else {
        await createClient.mutateAsync(form);
        toast.success('Client created');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateColor = (key: string, value: string) => {
    setForm({
      ...form,
      branding: {
        ...form.branding,
        colors: { ...form.branding.colors, [key]: value },
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Client' : 'Create Client'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Client Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme Corp"
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="acme-corp"
            required
          />
        </div>

        {/* Branding Colors */}
        <div>
          <h4 className="label mb-3">Brand Colors</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['primary', 'secondary', 'background', 'text'].map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1.5 capitalize">{key}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(form.branding.colors as any)[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-dark-50 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(form.branding.colors as any)[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="input flex-1 text-sm font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heading Font"
            value={form.branding.fonts.heading}
            onChange={(e) =>
              setForm({
                ...form,
                branding: {
                  ...form.branding,
                  fonts: { ...form.branding.fonts, heading: e.target.value },
                },
              })
            }
            placeholder="Inter"
          />
          <Input
            label="Body Font"
            value={form.branding.fonts.body}
            onChange={(e) =>
              setForm({
                ...form,
                branding: {
                  ...form.branding,
                  fonts: { ...form.branding.fonts, body: e.target.value },
                },
              })
            }
            placeholder="Inter"
          />
        </div>

        {/* Settings */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="aiEnabled"
            checked={form.settings.aiEnabled}
            onChange={(e) =>
              setForm({
                ...form,
                settings: { ...form.settings, aiEnabled: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border-dark-50 bg-dark-100 text-gold-500 focus:ring-gold-500"
          />
          <label htmlFor="aiEnabled" className="text-sm text-gray-300">
            Enable AI features for this client
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-50">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createClient.isPending || updateClient.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({
  client,
  onClose,
}: {
  client: Client | null;
  onClose: () => void;
}) {
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (!client) return;
    try {
      await deleteClient.mutateAsync(client.id);
      toast.success('Client deleted');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal open={!!client} onClose={onClose} title="Delete Client" size="sm">
      <div className="space-y-4">
        <p className="text-gray-300">
          Are you sure you want to delete <strong className="text-white">{client?.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteClient.isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
