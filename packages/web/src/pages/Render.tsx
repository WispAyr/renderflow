import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Button, Card, CardHeader, Badge, Select, Modal, Input, Progress, EmptyState, PageSpinner } from '@/components/ui';
import { useRenderJobs, useClients, useContent, useTemplates, useCreateRender } from '@/hooks/useApi';
import { cn, formatDateTime, formatDuration, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { RenderJob, RenderStatus, OutputFormat, Client, ContentItem, Template } from '@/api/types';

const statusIcons: Record<RenderStatus, React.ReactNode> = {
  queued: <Clock className="w-4 h-4" />,
  processing: <Play className="w-4 h-4 animate-pulse" />,
  rendering: <Sparkles className="w-4 h-4 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />,
};

const formatLabels: Record<string, string> = {
  landscape_1920x1080: '1920×1080 HD',
  portrait_1080x1920: '1080×1920 Portrait',
  square_1080x1080: '1080×1080 Square',
  ultrawide_2560x1080: '2560×1080 Ultrawide',
  social_1200x628: '1200×628 Social',
  story_1080x1920: '1080×1920 Story',
};

export default function Render() {
  const { data: clients = [] } = useClients();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const { data: renders, isLoading } = useRenderJobs(selectedClient);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RenderStatus | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const [previewJob, setPreviewJob] = useState<RenderJob | null>(null);

  const filteredRenders = useMemo(() => {
    return (renders || []).filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.templateId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [renders, search, statusFilter]);

  const activeJobs = filteredRenders.filter(
    (r) => r.status === 'queued' || r.status === 'processing' || r.status === 'rendering'
  );
  const completedJobs = filteredRenders.filter((r) => r.status === 'completed');
  const failedJobs = filteredRenders.filter((r) => r.status === 'failed');

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatPill
          label="Total Jobs"
          value={filteredRenders.length}
          onClick={() => setStatusFilter('')}
          active={!statusFilter}
        />
        <StatPill
          label="Active"
          value={activeJobs.length}
          variant="info"
          onClick={() => setStatusFilter('rendering')}
          active={statusFilter === 'rendering' || statusFilter === 'processing' || statusFilter === 'queued'}
        />
        <StatPill
          label="Completed"
          value={completedJobs.length}
          variant="success"
          onClick={() => setStatusFilter('completed')}
          active={statusFilter === 'completed'}
        />
        <StatPill
          label="Failed"
          value={failedJobs.length}
          variant="error"
          onClick={() => setStatusFilter('failed')}
          active={statusFilter === 'failed'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search renders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <Select
          options={[
            { value: '', label: 'All Clients' },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-48"
        />

        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'queued', label: 'Queued' },
            { value: 'processing', label: 'Processing' },
            { value: 'rendering', label: 'Rendering' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RenderStatus)}
          className="w-40"
        />

        <Button onClick={() => setShowCreate(true)} className="ml-auto">
          <Plus className="w-4 h-4" />
          New Render
        </Button>
      </div>

      {/* Active Jobs Section */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader
            title="Active Renders"
            description={`${activeJobs.length} jobs in progress`}
          />
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <ActiveJobCard key={job.id} job={job} />
            ))}
          </div>
        </Card>
      )}

      {/* All Jobs Table */}
      <Card padding="none">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-white">Render Queue</h3>
        </div>
        {filteredRenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Template</th>
                  <th>Format</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredRenders.map((job) => (
                  <tr key={job.id}>
                    <td className="font-mono text-sm text-gray-300">{job.id.slice(0, 8)}</td>
                    <td>{job.templateId}</td>
                    <td className="text-gray-400 text-sm">{formatLabels[job.format] || job.format}</td>
                    <td className="text-gray-400">{formatDuration(job.duration)}</td>
                    <td>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="w-32">
                      <Progress
                        value={job.progress}
                        size="sm"
                        variant={job.status === 'failed' ? 'error' : 'gold'}
                      />
                    </td>
                    <td className="text-gray-400 text-sm">{formatDateTime(job.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {job.status === 'completed' && job.outputUrl && (
                          <>
                            <button
                              onClick={() => setPreviewJob(job)}
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-100 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={job.outputUrl}
                              download
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-100 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        {job.status === 'failed' && (
                          <button className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-100 rounded">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No render jobs"
              description="Create your first render to get started"
              icon={<Play className="w-12 h-12" />}
              action={
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4" />
                  New Render
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* Create Render Modal */}
      <CreateRenderModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Preview Modal */}
      <PreviewModal
        job={previewJob}
        onClose={() => setPreviewJob(null)}
      />
    </div>
  );
}

function StatPill({
  label,
  value,
  variant = 'gray',
  onClick,
  active,
}: {
  label: string;
  value: number;
  variant?: 'gray' | 'info' | 'success' | 'error';
  onClick: () => void;
  active: boolean;
}) {
  const variants = {
    gray: 'border-dark-50',
    info: 'border-info/30',
    success: 'border-success/30',
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

function ActiveJobCard({ job }: { job: RenderJob }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-dark-100 rounded-lg">
      <div className="w-12 h-12 bg-gold-500/10 rounded-lg flex items-center justify-center text-gold-500">
        {statusIcons[job.status]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-white truncate">{job.templateId}</p>
          <StatusBadge status={job.status} />
        </div>
        <p className="text-sm text-gray-400">
          {formatLabels[job.format] || job.format} • {formatDuration(job.duration)}
        </p>
      </div>
      <div className="w-32 text-right">
        <Progress value={job.progress} showLabel size="md" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RenderStatus }) {
  return (
    <Badge variant={getStatusColor(status) as any} dot>
      {statusIcons[status]}
      {status}
    </Badge>
  );
}

function CreateRenderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: clients = [] } = useClients();
  const [selectedClient, setSelectedClient] = useState('');
  const { data: content = [] } = useContent(selectedClient);
  const { data: templates = [] } = useTemplates();
  const createRender = useCreateRender();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    clientId: '',
    contentId: '',
    templateId: '',
    format: 'landscape_1920x1080' as OutputFormat,
    duration: 15,
    aiOptions: {
      enabled: false,
      generateBackground: false,
      enhanceImage: false,
      generateCopy: false,
    },
  });

  const selectedTemplate = templates.find((t) => t.id === form.templateId);

  const handleSubmit = async () => {
    try {
      await createRender.mutateAsync(form);
      toast.success('Render job created');
      onClose();
      setStep(1);
      setForm({
        clientId: '',
        contentId: '',
        templateId: '',
        format: 'landscape_1920x1080',
        duration: 15,
        aiOptions: { enabled: false, generateBackground: false, enhanceImage: false, generateCopy: false },
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!form.clientId;
      case 2: return !!form.contentId;
      case 3: return !!form.templateId;
      case 4: return !!form.format;
      default: return true;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Render"
      description={`Step ${step} of 5`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1 rounded-full transition-colors',
                s <= step ? 'bg-gold-500' : 'bg-dark-100'
              )}
            />
          ))}
        </div>

        {/* Step 1: Select Client */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Client</h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setForm({ ...form, clientId: client.id });
                    setSelectedClient(client.id);
                  }}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    form.clientId === client.id
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-dark-50 hover:border-gray-600'
                  )}
                >
                  <p className="font-medium text-white">{client.name}</p>
                  <p className="text-sm text-gray-400">@{client.slug}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Content */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Content</h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {content.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setForm({ ...form, contentId: item.id })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    form.contentId === item.id
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-dark-50 hover:border-gray-600'
                  )}
                >
                  <Badge variant="gold" size="sm">{item.type}</Badge>
                  <p className="font-medium text-white mt-2">{item.title}</p>
                  {item.subtitle && <p className="text-sm text-gray-400">{item.subtitle}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Template */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Template</h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setForm({ ...form, templateId: template.id, duration: template.defaultDuration })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    form.templateId === template.id
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-dark-50 hover:border-gray-600'
                  )}
                >
                  <p className="font-medium text-white">{template.name}</p>
                  <p className="text-sm text-gray-400 truncate">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Format & Duration */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Output Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {(selectedTemplate?.formats || Object.keys(formatLabels) as OutputFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setForm({ ...form, format })}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      form.format === format
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-dark-50 hover:border-gray-600'
                    )}
                  >
                    <p className="text-sm text-white">{formatLabels[format] || format}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Duration</h3>
              <div className="flex gap-2">
                {(selectedTemplate?.durations || [10, 15, 20, 30, 60]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm({ ...form, duration: d })}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 transition-all',
                      form.duration === d
                        ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                        : 'border-dark-50 text-gray-400 hover:border-gray-600'
                    )}
                  >
                    {formatDuration(d)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: AI Options */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">AI Enhancement</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-dark-100 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.aiOptions.enabled}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      aiOptions: { ...form.aiOptions, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded border-dark-50 bg-dark-200 text-gold-500 focus:ring-gold-500"
                />
                <div>
                  <p className="font-medium text-white">Enable AI Enhancement</p>
                  <p className="text-sm text-gray-400">Use AI to generate and enhance content</p>
                </div>
                <Sparkles className="w-5 h-5 text-gold-500 ml-auto" />
              </label>

              {form.aiOptions.enabled && (
                <>
                  <label className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.aiOptions.generateBackground}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aiOptions: { ...form.aiOptions, generateBackground: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-dark-50 bg-dark-200 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-gray-300">Generate AI background</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.aiOptions.enhanceImage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aiOptions: { ...form.aiOptions, enhanceImage: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-dark-50 bg-dark-200 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-gray-300">Enhance images</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.aiOptions.generateCopy}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aiOptions: { ...form.aiOptions, generateCopy: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-dark-50 bg-dark-200 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-gray-300">Generate copy text</span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-dark-50">
          <Button
            variant="secondary"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={createRender.isPending}>
              <Play className="w-4 h-4" />
              Start Render
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function PreviewModal({
  job,
  onClose,
}: {
  job: RenderJob | null;
  onClose: () => void;
}) {
  if (!job) return null;

  return (
    <Modal open={!!job} onClose={onClose} title="Render Preview" size="xl">
      <div className="space-y-4">
        {/* Preview */}
        <div className="aspect-video bg-dark-100 rounded-lg overflow-hidden">
          {job.outputUrl ? (
            <video
              src={job.outputUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : job.thumbnailUrl ? (
            <img
              src={job.thumbnailUrl}
              alt="Render preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-16 h-16 text-gray-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              {formatLabels[job.format] || job.format} • {formatDuration(job.duration)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created {formatDateTime(job.createdAt)}
              {job.completedAt && ` • Completed ${formatDateTime(job.completedAt)}`}
            </p>
          </div>
          {job.outputUrl && (
            <a
              href={job.outputUrl}
              download
              className="btn-primary"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
