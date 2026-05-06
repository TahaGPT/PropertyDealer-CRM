'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/lib/actions/analytics.actions';
import { Card } from '@/components/ui';
import { FadeIn } from '@/components/ui/animations';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

const COLORS = ['#517561', '#629c7c', '#3b5d49', '#324b3a', '#262f2a'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getAnalytics();
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#517561] border-t-transparent" />
    </div>
  );

  if (!data) return <div>Error loading analytics data</div>;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-black text-[#262f2a] tracking-tight">Analytics</h1>
          <p className="text-[#3b5d49] mt-1 font-semibold">Deep dive into your CRM performance metrics</p>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-none hover:translate-y-[-4px] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#517561]/60">Total Leads</p>
              <h3 className="mt-1 text-3xl font-black text-[#262f2a]">{data.totalLeads}</h3>
            </div>
            <div className="rounded-2xl p-3.5 shadow-sm bg-[#517561]/10 text-[#517561]">
              <Users size={24} strokeWidth={2.5} />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-none hover:translate-y-[-4px] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#517561]/60">High Priority</p>
              <h3 className="mt-1 text-3xl font-black text-[#262f2a]">
                {data.priorityDistribution.find((p: any) => p.name === 'HIGH')?.value || 0}
              </h3>
            </div>
            <div className="rounded-2xl p-3.5 shadow-sm bg-red-100 text-red-600">
              <Target size={24} strokeWidth={2.5} />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-none hover:translate-y-[-4px] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#517561]/60">Avg. Conversion</p>
              <h3 className="mt-1 text-3xl font-black text-[#262f2a]">
                {data.agentPerformance.length > 0
                  ? `${Math.round(
                      data.agentPerformance.reduce((sum: number, a: any) =>
                        sum + (a.leadCount > 0 ? (a.closedLeads / a.leadCount) * 100 : 0), 0
                      ) / data.agentPerformance.length
                    )}%`
                  : '0%'}
              </h3>
            </div>
            <div className="rounded-2xl p-3.5 shadow-sm bg-[#629c7c]/10 text-[#629c7c]">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-none hover:translate-y-[-4px] transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#517561]/60">Active Agents</p>
              <h3 className="mt-1 text-3xl font-black text-[#262f2a]">{data.agentPerformance.length}</h3>
            </div>
            <div className="rounded-2xl p-3.5 shadow-sm bg-[#262f2a]/10 text-[#262f2a]">
              <BarChart3 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="p-6 h-full">
          <h3 className="mb-6 text-lg font-bold text-[#262f2a]">Lead Status Distribution</h3>
          <div className="flex justify-center">
            <PieChart width={380} height={280}>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.statusDistribution.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(38,47,42,0.1)' }} />
              <Legend />
            </PieChart>
          </div>
        </Card>

        <Card className="p-6 h-full">
          <h3 className="mb-6 text-lg font-bold text-[#262f2a]">Priority Breakdown</h3>
          <div className="flex justify-center">
            <BarChart width={380} height={280} data={data.priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f4f7f5' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(38,47,42,0.1)' }} />
              <Bar dataKey="value" fill="#517561" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </div>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <FadeIn delay={0.3}>
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-[#517561]/10">
            <h3 className="text-lg font-bold text-[#262f2a]">Agent Performance Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f7f5]/80 text-[#517561] uppercase text-[11px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-5">Agent Name</th>
                  <th className="px-6 py-5">Leads Assigned</th>
                  <th className="px-6 py-5">Leads Closed</th>
                  <th className="px-6 py-5">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#517561]/5">
                {data.agentPerformance.map((agent: any) => {
                  const rate = agent.leadCount > 0 ? Math.round((agent.closedLeads / agent.leadCount) * 100) : 0;
                  return (
                    <tr key={agent._id} className="hover:bg-[#629c7c]/5 transition-colors group">
                      <td className="px-6 py-5 font-bold text-[#262f2a] group-hover:text-[#517561] transition-colors">{agent.name}</td>
                      <td className="px-6 py-5 text-[#3b5d49] font-medium">{agent.leadCount}</td>
                      <td className="px-6 py-5 text-[#3b5d49] font-medium">{agent.closedLeads}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-[#517561]">{rate}%</span>
                          <div className="w-24 h-2.5 bg-[#f4f7f5] rounded-full overflow-hidden border border-[#517561]/5">
                            <div
                              className="h-full bg-gradient-to-r from-[#517561] to-[#629c7c] rounded-full transition-all duration-500"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.agentPerformance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">No agents found in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
