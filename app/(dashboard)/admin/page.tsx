'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/lib/actions/analytics.actions';
import { Card } from '@/components/ui';
import { 
  Users, 
  Target, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend 
} from 'recharts';

import { FadeIn } from '@/components/ui/animations';

const COLORS = ['#517561', '#629c7c', '#3b5d49', '#324b3a', '#262f2a'];

export default function AdminDashboard() {
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
  if (!data) return <div>Error loading data</div>;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-black text-[#262f2a] tracking-tight">Admin Dashboard</h1>
          <p className="text-[#3b5d49] mt-1 font-semibold">Overview of system performance and lead distribution</p>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={data.totalLeads} icon={Users} color="teal" />
        <StatCard title="High Priority" value={data.priorityDistribution.find((p: any) => p.name === 'HIGH')?.value || 0} icon={Target} color="pine" />
        <StatCard title="Closed" value={data.statusDistribution.find((s: any) => s.name === 'CLOSED')?.value || 0} icon={CheckCircle2} color="seagrass" />
        <StatCard title="New Leads" value={data.statusDistribution.find((s: any) => s.name === 'NEW')?.value || 0} icon={Clock} color="charcoal" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="p-6 h-full">
          <h3 className="mb-6 text-lg font-bold text-[#262f2a]">Lead Status Distribution</h3>
          <div className="flex justify-center">
            <PieChart width={350} height={250}>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
          <h3 className="mb-6 text-lg font-bold text-[#262f2a]">Priority Levels</h3>
          <div className="flex justify-center">
            <BarChart width={350} height={250} data={data.priorityDistribution}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f4f7f5' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(38,47,42,0.1)' }} />
              <Bar dataKey="value" fill="#517561" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-[#517561]/10">
          <h3 className="text-lg font-bold text-[#262f2a]">Agent Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f4f7f5]/80 text-[#517561] uppercase text-[11px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-5">Agent Name</th>
                <th className="px-6 py-5">Total Leads</th>
                <th className="px-6 py-5">Closed</th>
                <th className="px-6 py-5">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#517561]/5">
              {data.agentPerformance.map((agent: any) => (
                <tr key={agent._id} className="hover:bg-[#629c7c]/5 transition-colors group">
                  <td className="px-6 py-5 font-bold text-[#262f2a] group-hover:text-[#517561] transition-colors">{agent.name}</td>
                  <td className="px-6 py-5 text-[#3b5d49] font-medium">{agent.leadCount}</td>
                  <td className="px-6 py-5 text-[#3b5d49] font-medium">{agent.closedLeads}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-[#517561]">
                        {agent.leadCount > 0 
                          ? `${Math.round((agent.closedLeads / agent.leadCount) * 100)}%`
                          : '0%'}
                      </span>
                      <div className="w-20 h-2 bg-[#f4f7f5] rounded-full overflow-hidden border border-[#517561]/5">
                        <div 
                          className="h-full bg-gradient-to-r from-[#517561] to-[#629c7c] rounded-full"
                          style={{ width: agent.leadCount > 0 ? `${(agent.closedLeads / agent.leadCount) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {data.agentPerformance.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">No agents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    teal: 'bg-[#517561]/10 text-[#517561]',
    seagrass: 'bg-[#629c7c]/10 text-[#629c7c]',
    pine: 'bg-[#3b5d49]/10 text-[#3b5d49]',
    charcoal: 'bg-[#262f2a]/10 text-[#262f2a]',
  };

  return (
    <Card className="p-6 border-none hover:translate-y-[-4px] transition-transform">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#517561]/60">{title}</p>
          <h3 className="mt-1 text-3xl font-black text-[#262f2a]">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3.5 shadow-sm ${colorClasses[color]}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </Card>
  );
}
