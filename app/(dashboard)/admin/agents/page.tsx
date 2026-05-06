'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAnalytics } from '@/lib/actions/analytics.actions';
import { Card } from '@/components/ui';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { Users, Mail, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, analytics] = await Promise.all([
          axios.get('/api/admin/agents'),
          getAnalytics(),
        ]);
        setAgents(agentsRes.data);
        setPerformance(analytics?.agentPerformance || []);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#517561] border-t-transparent" />
    </div>
  );

  // Merge agent info with performance data
  const agentsWithPerformance = agents.map(agent => {
    const perf = performance.find((p: any) => p._id === agent._id);
    return {
      ...agent,
      leadCount: perf?.leadCount || 0,
      closedLeads: perf?.closedLeads || 0,
    };
  });

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#262f2a] tracking-tight">Agents</h1>
            <p className="text-[#3b5d49] mt-1 font-semibold">Manage your sales team and track their performance</p>
          </div>
          <div className="flex items-center space-x-2 bg-[#517561]/10 px-4 py-2 rounded-xl">
            <Users size={18} className="text-[#517561]" />
            <span className="font-bold text-[#517561]">{agents.length} agents</span>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agentsWithPerformance.map((agent) => {
            const rate = agent.leadCount > 0 ? Math.round((agent.closedLeads / agent.leadCount) * 100) : 0;
            return (
              <StaggerItem key={agent._id}>
                <Card className="p-6 hover:translate-y-[-4px] transition-transform">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#517561] to-[#629c7c] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#517561]/20">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#262f2a] text-lg">{agent.name}</h3>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <Mail size={12} className="text-[#3b5d49]" />
                        <p className="text-xs text-[#3b5d49]">{agent.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="bg-[#f4f7f5] rounded-xl p-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#517561]/60">Leads</p>
                      <p className="text-xl font-black text-[#262f2a] mt-0.5">{agent.leadCount}</p>
                    </div>
                    <div className="bg-[#f4f7f5] rounded-xl p-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#517561]/60">Closed</p>
                      <p className="text-xl font-black text-[#262f2a] mt-0.5">{agent.closedLeads}</p>
                    </div>
                    <div className="bg-[#f4f7f5] rounded-xl p-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#517561]/60">Rate</p>
                      <p className={cn(
                        "text-xl font-black mt-0.5",
                        rate >= 50 ? 'text-emerald-600' : rate >= 25 ? 'text-orange-600' : 'text-[#262f2a]'
                      )}>{rate}%</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full h-2 bg-[#f4f7f5] rounded-full overflow-hidden border border-[#517561]/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#517561] to-[#629c7c] rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </div>
      </StaggerContainer>

      {agents.length === 0 && (
        <Card className="p-16 text-center">
          <Users size={48} className="mx-auto text-[#517561]/30 mb-4" />
          <h3 className="text-lg font-bold text-[#262f2a]">No Agents Found</h3>
          <p className="text-sm text-[#3b5d49] mt-2">Agents will appear here when they sign up with the Agent role.</p>
        </Card>
      )}
    </div>
  );
}
