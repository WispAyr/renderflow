import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Package,
  MessageSquare,
  BarChart3,
  Image,
  Upload,
} from 'lucide-react';
import { Button, Card, Input, Modal, Badge, Select, EmptyState, PageSpinner } from '@/components/ui';
import { useContent, useClients, useCreateContent, useUpdateContent, useDeleteContent } from '@/hooks/useApi';
import { cn, formatDate, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ContentItem, ContentType, Client } from '@/api/types';

const contentTypes: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'event', label: 'Event', icon: <Calendar className="w-4 h-4" /> },
  { value: 'product', label: 'Product', icon: <Package className="w-4 h-4" /> },
  { value: 'message', label: 'Message', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'stat', label: 'Stat', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'media', label: 'Media', icon: <Image className="w-4 h-4" /> },
];

export default function Content() {
  const { data: clients = [] } = useClients();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const { data: content, isLoading } = useContent(selectedClient);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | ''>('');
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const filteredContent = useMemo(() => {
    return (content || []).filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [content, search, typeFilter]);

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  if (isLoading && selectedClient) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <Select
          options={clientOptions}
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-48"
        />

        <Select
          options={[
            { value: '', label: 'All Types' },
            ...contentTypes.map((t) => ({ value: t.value, label: t.label })),
          ]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ContentType | '')}
          className="w-40"
        />

        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" onClick={() => setShowBulkImport(true)}>
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button onClick={() => setShowCreate(true)} disabled={!selectedClient}>
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Content Type Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter('')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            !typeFilter ? 'bg-gold-500 text-dark-400' : 'bg-dark-100 text-gray-400 hover:text-white'
          )}
        >
          All
        </button>
        {contentTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setTypeFilter(type.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              typeFilter === type.value
                ? 'bg-gold-500 text-dark-400'
                : 'bg-dark-100 text-gray-400 hover:text-white'
            )}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {!selectedClient ? (
        <EmptyState
          title="Select a client"
          description="Choose a client to view and manage their content"
          icon={<FileText className="w-12 h-12" />}
        />
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onEdit={() => setEditItem(item)}
              onDelete={() => setDeleteItem(item)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No content found"
          description="Create your first content item"
          icon={<FileText className="w-12 h-12" />}
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Add Content
            </Button>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <ContentModal
        open={showCreate || !!editItem}
        item={editItem}
        clientId={selectedClient}
        onClose={() => {
          setShowCreate(false);
          setEditItem(null);
        }}
      />

      {/* Delete Confirmation */}
      <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={showBulkImport}
        clientId={selectedClient}
        onClose={() => setShowBulkImport(false)}
      />
    </div>
  );
}

function ContentCard({
  item,
  onEdit,
  onDelete,
}: {
  item: ContentItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const typeInfo = contentTypes.find((t) => t.value === item.type);

  return (
    <Card hover className="relative group">
      {/* Image */}
      {item.image && (
        <div className="aspect-video -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl bg-dark-100">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">{typeInfo?.label || item.type}</Badge>
            {item.category && (
              <Badge variant="gray">{item.category}</Badge>
            )}
          </div>
          <h3 className="font-semibold text-white truncate">{item.title}</h3>
          {item.subtitle && (
            <p className="text-sm text-gray-400 truncate">{item.subtitle}</p>
          )}
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
      {item.description && (
        <p className="mt-2 text-sm text-gray-400 truncate-2">
          {item.description}
        </p>
      )}

      {/* Type-specific info */}
      <div className="mt-4 pt-4 border-t border-dark-50 text-sm">
        {item.type === 'event' && item.date && (
          <p className="text-gray-400">
            <Calendar className="w-4 h-4 inline mr-1.5" />
            {formatDate(item.date)}
            {item.venue && ` • ${item.venue}`}
          </p>
        )}
        {item.type === 'product' && item.price && (
          <p className="text-gold-500 font-medium">{item.price}</p>
        )}
        {item.type === 'stat' && item.value !== undefined && (
          <p className="text-2xl font-bold text-gold-500">
            {item.value}
            {item.unit && <span className="text-sm text-gray-400 ml-1">{item.unit}</span>}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Updated {formatDate(item.updatedAt)}</span>
        <Badge variant={item.active !== false ? 'success' : 'gray'} size="sm">
          {item.active !== false ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </Card>
  );
}

function ContentModal({
  open,
  item,
  clientId,
  onClose,
}: {
  open: boolean;
  item: ContentItem | null;
  clientId: string;
  onClose: () => void;
}) {
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const isEditing = !!item;

  const [form, setForm] = useState({
    clientId: item?.clientId || clientId,
    type: item?.type || 'message' as ContentType,
    title: item?.title || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    image: item?.image || '',
    category: item?.category || '',
    date: item?.date || '',
    venue: item?.venue || '',
    price: item?.price || '',
    value: item?.value || 0,
    unit: item?.unit || '',
    active: item?.active !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateContent.mutateAsync({ id: item!.id, data: form });
        toast.success('Content updated');
      } else {
        await createContent.mutateAsync(form);
        toast.success('Content created');
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
      title={isEditing ? 'Edit Content' : 'Create Content'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div>
          <label className="label">Content Type</label>
          <div className="grid grid-cols-5 gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm({ ...form, type: type.value })}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                  form.type === type.value
                    ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                    : 'border-dark-50 text-gray-400 hover:text-white hover:border-gray-600'
                )}
              >
                {type.icon}
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Content title"
            required
          />
          <Input
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Optional subtitle"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Content description..."
            rows={3}
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
          />
        </div>

        {/* Type-specific fields */}
        {form.type === 'event' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Venue"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="Event location"
            />
          </div>
        )}

        {form.type === 'product' && (
          <Input
            label="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="£9.99"
          />
        )}

        {form.type === 'stat' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Value"
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
            <Input
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="%, users, etc."
            />
          </div>
        )}

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
            Active (visible for renders)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-50">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createContent.isPending || updateContent.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Content'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({
  item,
  onClose,
}: {
  item: ContentItem | null;
  onClose: () => void;
}) {
  const deleteContent = useDeleteContent();

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteContent.mutateAsync(item.id);
      toast.success('Content deleted');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Modal open={!!item} onClose={onClose} title="Delete Content" size="sm">
      <div className="space-y-4">
        <p className="text-gray-300">
          Are you sure you want to delete <strong className="text-white">{item?.title}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteContent.isPending}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function BulkImportModal({
  open,
  clientId,
  onClose,
}: {
  open: boolean;
  clientId: string;
  onClose: () => void;
}) {
  const [jsonData, setJsonData] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Bulk Import Content" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Paste JSON array of content items to import them at once.
        </p>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          placeholder={`[\n  { "type": "event", "title": "Event 1", ... },\n  { "type": "product", "title": "Product 1", ... }\n]`}
          rows={12}
          className="input resize-none font-mono text-sm"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!jsonData || !clientId}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
