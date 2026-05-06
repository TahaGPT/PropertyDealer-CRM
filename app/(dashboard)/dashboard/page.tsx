'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getLeads } from '@/lib/actions/lead.actions';
import { getReminders } from '@/lib/actions/reminder.actions';
import { Card, Button } from '@/components/ui';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/animations';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Phone,
  Calendar,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AgentDashboard() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [reminders, setReminders] = useState({ overdue: [] as any[], stale: [] as any[] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      const [leadsData, remindersData] = await Promise.all([
        getLeads({ assignedTo: session.user.id }),
        getReminders(session.user.id, session.user.role),
      ]);
      setLeads(leadsData);
      setReminders(remindersData);
      setIsLoading(false);
    };
    fetchData();
  }, [session]);

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#517561] border-t-transparent" />
    </div>
  );

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'NEW').length;
  const closedLeads = leads.filter(l => l.status === 'CLOSED').length;
  const followUps = leads.filter(l => l.status === 'FOLLOW_UP').length;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-black text-[#262f2a] tracking-tight">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-[#3b5d49] mt-1 font-semibold">Here's your lead pipeline overview</p>
        </div>
      </FadeIn>

      {/* Stats */}
      <StaggerContainer>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard title="My Leads" value={totalLeads} icon={Users} color="teal" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="New" value={newLeads} icon={Clock} color="charcoal" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="Follow-ups" value={followUps} icon={Phone} color="pine" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="Closed" value={closedLeads} icon={CheckCircle2} color="seagrass" />
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* Reminders & Recent Leads */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Overdue & Stale Leads */}
        <FadeIn delay={0.2}>
          <Card className="p-0 overflow-hidden h-full">
            <div className="p-6 border-b border-[#517561]/10">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-500" />
                <h3 className="text-lg font-bold text-[#262f2a]">Needs Attention</h3>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
              {reminders.overdue.length === 0 && reminders.stale.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">🎉 All caught up! No pending follow-ups.</p>
              )}
              {reminders.overdue.map((item: any) => (
                <Link key={item._id} href={`/leads/${item._id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-[#262f2a] text-sm group-hover:text-red-700 transition-colors">{item.name}</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Overdue: {item.followUpDate ? format(new Date(item.followUpDate), 'MMM d') : 'N/A'}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
              {reminders.stale.map((item: any) => (
                <Link key={item._id} href={`/leads/${item._id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-[#262f2a] text-sm group-hover:text-orange-700 transition-colors">{item.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5">No activity for 3+ days</p>
                  </div>
                  <ArrowRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </Card>
        </FadeIn>

        {/* Recent Leads */}
        <FadeIn delay={0.3}>
          <Card className="p-0 overflow-hidden h-full">
            <div className="p-6 border-b border-[#517561]/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#262f2a]">Recent Leads</h3>
              <Link href="/leads">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-[#517561]/5">
              {leads.slice(0, 5).map((lead: any) => (
                <Link key={lead._id} href={`/leads/${lead._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#629c7c]/5 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-[#262f2a] text-sm group-hover:text-[#517561] transition-colors">{lead.name}</p>
                    <p className="text-xs text-[#3b5d49] mt-0.5">{lead.propertyInterest}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#517561]">{formatCurrency(lead.budget)}</p>
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-wider',
                      lead.score === 'HIGH' ? 'text-red-600' :
                      lead.score === 'MEDIUM' ? 'text-orange-600' : 'text-blue-600'
                    )}>{lead.score}</span>
                  </div>
                </Link>
              ))}
              {leads.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No leads assigned yet.</div>
              )}
            </div>
          </Card>
        </FadeIn>
      </div>
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
