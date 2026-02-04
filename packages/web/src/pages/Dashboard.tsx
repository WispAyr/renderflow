import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Play,
  Monitor,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, StatCard, Badge, Progress } from '@/components/ui';
import { useClients, useContent, useRenderJobs, useScreens } from '@/hooks/useApi';
import { cn, formatDateTime, getStatusColor } from '@/lib/utils';
import type { RenderJob, Screen } from '@/api/types';

export default function Dashboard() {
  const { data: clients = [] } = useClients();
  const { data: content = [] } = useContent();
  const { data: renders = [] } = useRenderJobs();
  const { data: screens = [] } = useScreens();

  const activeScreens = screens.filter((s) => s.status === 'online').length;
  const recentRenders = renders.slice(0, 5);
  const activeRenders = renders.filter(
    (r) => r.status === 'queued' || r.status === 'processing' || r.status === 'rendering'
  );

  const screenStats = {
    online: screens.filter((s) => s.status === 'online').length,
    offline: screens.filter((s) => s.status === 'offline').length,
    idle: screens.filter((s) => s.status === 'idle').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={clients.length}
          icon={<Users className="w-6 h-6" />}
          trend="up"
          change={12}
        />
        <StatCard
          label="Content Items"
          value={content.length}
          icon={<FileText className="w-6 h-6" />}
          trend="up"
          change={8}
        />
        <StatCard
          label="Render Jobs"
          value={renders.length}
          icon={<Play className="w-6 h-6" />}
          trend="up"
          change={24}
        />
        <StatCard
          label="Active Screens"
          value={`${activeScreens}/${screens.length}`}
          icon={<Monitor className="w-6 h-6" />}
          trend={activeScreens > 0 ? 'up' : 'flat'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Renders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Active Renders"
              description={`${activeRenders.length} jobs in progress`}
              action={
                <Link to="/render" className="btn-ghost text-sm flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
            {activeRenders.length > 0 ? (
              <div className="space-y-4">
                {activeRenders.slice(0, 3).map((job) => (
                  <ActiveRenderCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Play className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No active renders</p>
              </div>
            )}
          </Card>
        </div>

        {/* Screen Status */}
        <Card>
          <CardHeader
            title="Screen Status"
            action={
              <Link to="/screens" className="btn-ghost text-sm flex items-center gap-1">
                Manage <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
          <div className="space-y-4">
            <ScreenStatusBar
              label="Online"
              count={screenStats.online}
              total={screens.length}
              variant="success"
            />
            <ScreenStatusBar
              label="Idle"
              count={screenStats.idle}
              total={screens.length}
              variant="warning"
            />
            <ScreenStatusBar
              label="Offline"
              count={screenStats.offline}
              total={screens.length}
              variant="error"
            />
          </div>
        </Card>
      </div>

      {/* Recent Renders Table */}
      <Card>
        <CardHeader
          title="Recent Renders"
          action={
            <Link to="/render" className="btn-ghost text-sm flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
        {recentRenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Template</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentRenders.map((job) => (
                  <tr key={job.id}>
                    <td className="font-mono text-sm text-gray-300">{job.id.slice(0, 8)}</td>
                    <td>{job.templateId}</td>
                    <td className="text-gray-400">{job.format}</td>
                    <td>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="w-32">
                      <Progress value={job.progress} size="sm" />
                    </td>
                    <td className="text-gray-400 text-sm">{formatDateTime(job.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No recent renders</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ActiveRenderCard({ job }: { job: RenderJob }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-dark-100 rounded-lg">
      <div className="w-12 h-12 bg-gold-500/10 rounded-lg flex items-center justify-center">
        <Play className="w-5 h-5 text-gold-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-white truncate">{job.templateId}</p>
          <StatusBadge status={job.status} />
        </div>
        <p className="text-sm text-gray-400">{job.format}</p>
      </div>
      <div className="w-24">
        <Progress value={job.progress} showLabel size="sm" />
      </div>
    </div>
  );
}

function ScreenStatusBar({
  label,
  count,
  total,
  variant,
}: {
  label: string;
  count: number;
  total: number;
  variant: 'success' | 'warning' | 'error';
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium text-white">{count}</span>
      </div>
      <Progress value={total > 0 ? count : 0} max={total || 1} variant={variant} size="sm" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    processing: <Clock className="w-3 h-3 animate-spin" />,
    rendering: <Play className="w-3 h-3" />,
    queued: <AlertCircle className="w-3 h-3" />,
  };

  return (
    <Badge variant={getStatusColor(status) as any} dot>
      {status}
    </Badge>
  );
}
