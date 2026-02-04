import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Play,
  Clock,
  Monitor,
  Layers,
  Tag,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button, Card, Badge, Select, Modal, EmptyState, PageSpinner } from '@/components/ui';
import { useTemplates } from '@/hooks/useApi';
import { cn, formatDuration } from '@/lib/utils';
import type { Template, TemplateCategory, ContentType, OutputFormat } from '@/api/types';

const categoryLabels: Record<TemplateCategory, string> = {
  promo: 'Promotional',
  countdown: 'Countdown',
  branding: 'Branding',
  menu: 'Menu Board',
  event: 'Events',
  social: 'Social Media',
  stats: 'Statistics',
  generic: 'Generic',
};

const formatLabels: Record<string, string> = {
  landscape_1920x1080: '1920×1080 Landscape',
  portrait_1080x1920: '1080×1920 Portrait',
  square_1080x1080: '1080×1080 Square',
  ultrawide_2560x1080: '2560×1080 Ultrawide',
  social_1200x628: '1200×628 Social',
  story_1080x1920: '1080×1920 Story',
};

export default function Templates() {
  const { data: templates, isLoading } = useTemplates();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | ''>('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = useMemo(() => {
    return (templates || []).filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      const matchesContentType = !contentTypeFilter || t.contentTypes.includes(contentTypeFilter);
      return matchesSearch && matchesCategory && matchesContentType;
    });
  }, [templates, search, categoryFilter, contentTypeFilter]);

  const categories = useMemo(() => {
    const cats = new Set(templates?.map((t) => t.category) || []);
    return Array.from(cats);
  }, [templates]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <Select
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: c, label: categoryLabels[c as TemplateCategory] || c })),
          ]}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory)}
          className="w-44"
        />

        <Select
          options={[
            { value: '', label: 'All Content Types' },
            { value: 'event', label: 'Events' },
            { value: 'product', label: 'Products' },
            { value: 'message', label: 'Messages' },
            { value: 'stat', label: 'Stats' },
            { value: 'media', label: 'Media' },
          ]}
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value as ContentType)}
          className="w-44"
        />

        <div className="flex gap-1 ml-auto bg-dark-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded',
              viewMode === 'grid' ? 'bg-dark-200 text-white' : 'text-gray-500 hover:text-white'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded',
              viewMode === 'list' ? 'bg-dark-200 text-white' : 'text-gray-500 hover:text-white'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            !categoryFilter ? 'bg-gold-500 text-dark-400' : 'bg-dark-100 text-gray-400 hover:text-white'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat as TemplateCategory)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              categoryFilter === cat
                ? 'bg-gold-500 text-dark-400'
                : 'bg-dark-100 text-gray-400 hover:text-white'
            )}
          >
            {categoryLabels[cat as TemplateCategory] || cat}
          </button>
        ))}
      </div>

      {/* Templates */}
      {filteredTemplates.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No templates found"
          description="Try adjusting your filters"
          icon={<Layers className="w-12 h-12" />}
        />
      )}

      {/* Template Detail Modal */}
      <TemplateDetailModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  return (
    <Card hover onClick={onClick} className="overflow-hidden">
      {/* Preview Image */}
      <div className="aspect-video -mx-6 -mt-6 mb-4 bg-dark-100 overflow-hidden relative group">
        {template.previewImage ? (
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-12 h-12 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="gold">{categoryLabels[template.category] || template.category}</Badge>
        </div>
        <h3 className="font-semibold text-white">{template.name}</h3>
        <p className="text-sm text-gray-400 truncate-2 mt-1">{template.description}</p>
      </div>

      {/* Meta */}
      <div className="mt-4 pt-4 border-t border-dark-50 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Monitor className="w-4 h-4" />
          {template.formats.length} formats
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDuration(template.defaultDuration)}
        </div>
      </div>
    </Card>
  );
}

function TemplateRow({ template, onClick }: { template: Template; onClick: () => void }) {
  return (
    <Card
      hover
      onClick={onClick}
      padding="sm"
      className="flex items-center gap-4"
    >
      {/* Preview */}
      <div className="w-32 aspect-video bg-dark-100 rounded-lg overflow-hidden shrink-0">
        {template.previewImage ? (
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white">{template.name}</h3>
          <Badge variant="gold" size="sm">
            {categoryLabels[template.category] || template.category}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 truncate">{template.description}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Monitor className="w-4 h-4" />
          {template.formats.length}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDuration(template.defaultDuration)}
        </div>
        <ChevronRight className="w-5 h-5" />
      </div>
    </Card>
  );
}

function TemplateDetailModal({
  template,
  onClose,
}: {
  template: Template | null;
  onClose: () => void;
}) {
  if (!template) return null;

  return (
    <Modal open={!!template} onClose={onClose} size="xl">
      <div className="flex gap-6">
        {/* Preview */}
        <div className="w-1/2">
          <div className="aspect-video bg-dark-100 rounded-lg overflow-hidden mb-4">
            {template.previewImage ? (
              <img
                src={template.previewImage}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Layers className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </div>
          {template.previewVideo && (
            <Button variant="secondary" className="w-full">
              <Play className="w-4 h-4" />
              Watch Preview
            </Button>
          )}
        </div>

        {/* Details */}
        <div className="w-1/2">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="gold" size="md">
              {categoryLabels[template.category] || template.category}
            </Badge>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{template.name}</h2>
          <p className="text-gray-400 mb-6">{template.description}</p>

          {/* Supported Content Types */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Content Types</h4>
            <div className="flex flex-wrap gap-2">
              {template.contentTypes.map((type) => (
                <Badge key={type} variant="gray">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Formats */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Output Formats</h4>
            <div className="flex flex-wrap gap-2">
              {template.formats.map((format) => (
                <Badge key={format} variant="info">
                  {formatLabels[format] || format}
                </Badge>
              ))}
            </div>
          </div>

          {/* Duration Options */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Duration Options</h4>
            <div className="flex flex-wrap gap-2">
              {template.durations.map((d) => (
                <Badge
                  key={d}
                  variant={d === template.defaultDuration ? 'gold' : 'gray'}
                >
                  {formatDuration(d)}
                  {d === template.defaultDuration && ' (default)'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Slots */}
          {template.slots.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Template Slots</h4>
              <div className="space-y-2">
                {template.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 bg-dark-100 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white">{slot.name}</span>
                      <Badge variant="gray" size="sm">
                        {slot.type}
                      </Badge>
                      {slot.required && (
                        <Badge variant="warning" size="sm">
                          Required
                        </Badge>
                      )}
                    </div>
                    {slot.aiGenerable && (
                      <Badge variant="gold" size="sm">
                        AI
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1">
              Use Template
            </Button>
            <Button variant="secondary">
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
