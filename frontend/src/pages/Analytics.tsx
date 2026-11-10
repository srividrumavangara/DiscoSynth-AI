import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDatasets, getDatasetAnalytics, getDatasetQuality } from '../api/client';
import type { Dataset, AnalyticsData, QualityReport } from '../types';

const COLORS = ['#1a2846', '#34508c', '#4164af', '#6783bf', '#8da2cf', '#6641ff', '#8567ff', '#a38dff'];

export default function Analytics() {
  const { datasetId } = useParams<{ datasetId: string }>();
  if (!datasetId) return <DatasetPicker />;
  return <AnalyticsView datasetId={datasetId} />;
}

function DatasetPicker() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDatasets(1, 50)
      .then((res) => setDatasets(res.items.filter((d) => d.status === 'completed')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Analytics</h1>
      {datasets.length === 0 ? (
        <EmptyState title="No datasets" description="Generate a dataset to see analytics." action={
          <Link to="/generate" className="px-5 py-2.5 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-700">Generate Dataset</Link>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((ds) => (
            <Link key={ds.id} to={`/analytics/${ds.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-accent-300 transition-colors">
              <h3 className="font-semibold text-navy-800 mb-1">{ds.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{ds.scenario.replace(/_/g, ' ')}</p>
              <p className="text-xs text-gray-400 mt-2">{ds.num_records.toLocaleString()} records</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ datasetId }: { datasetId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDatasetAnalytics(datasetId),
      getDatasetQuality(datasetId),
    ])
      .then(([a, q]) => { setAnalytics(a); setQuality(q); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [datasetId]);

  if (loading) return <LoadingSpinner message="Computing analytics..." />;
  if (!analytics) return <EmptyState title="No data" description="Analytics unavailable." />;

  const toArr = (obj: Record<string, number>) => Object.entries(obj).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  const docTypeData = toArr(analytics.document_type_distribution);
  const responsiveData = toArr(analytics.responsive_distribution);
  const privilegeData = toArr(analytics.privilege_distribution);
  const confData = toArr(analytics.confidentiality_distribution);
  const reviewData = toArr(analytics.review_status_distribution);
  const issueData = Object.entries(analytics.issue_tag_frequency).slice(0, 10).map(([name, value]) => ({ name, value }));

  const scoreColor = (v: number) => v >= 80 ? 'text-green-600' : v >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Analytics</h1>

      {/* Quality Score */}
      {quality && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Quality Score</h3>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="text-center">
              <p className={`text-4xl font-bold ${scoreColor(quality.overall_score * 100)}`}>{(quality.overall_score * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">Overall</p>
            </div>
            {[
              { label: 'Schema', value: quality.schema_validity },
              { label: 'Completeness', value: quality.completeness },
              { label: 'Uniqueness', value: quality.uniqueness },
              { label: 'Consistency', value: quality.logical_consistency },
              { label: 'Distribution', value: quality.distribution_adherence },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 min-w-[120px]">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{label}</span>
                  <span>{((value ?? 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy-600 rounded-full" style={{ width: `${(value ?? 0) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Document Type Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={docTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a2846" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Responsive vs Non-Responsive">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={responsiveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                <Cell fill="#1a2846" />
                <Cell fill="#b3c1df" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Privilege Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={privilegeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {privilegeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Confidentiality Levels">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6641ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Document Creation Timeline">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1a2846" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Issue Tag Frequency (Top 10)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={issueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#34508c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Review Status Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={reviewData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {reviewData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Metadata Completeness">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <p className={`text-5xl font-bold ${scoreColor(analytics.metadata_completeness * 100)}`}>
                {(analytics.metadata_completeness * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">Fields populated</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}
