'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeadById, updateLead, deleteLead } from '@/lib/actions/lead.actions';
import { Button, Card, Input } from '@/components/ui';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  History,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  Target,
  Trash2,
  Save
} from 'lucide-react';
import { formatCurrency, cn, getWhatsAppLink } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import axios from 'axios';

export default function LeadDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getLeadById(id as string);
      setData(result);
      if (result?.lead) {
        setEditNotes(result.lead.notes || '');
      }
      
      if (session?.user?.role === 'ADMIN') {
        try {
          const agentsRes = await axios.get('/api/admin/agents');
          setAgents(agentsRes.data);
        } catch (err) {
          console.error('Failed to fetch agents:', err);
        }
      }
      
      setIsLoading(false);
    };
    if (session) fetchData();
  }, [id, session]);

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    await updateLead(id as string, { status }, session?.user?.id || '');
    const result = await getLeadById(id as string);
    setData(result);
    setIsUpdating(false);
  };

  const handleAssignment = async (agentId: string) => {
    setIsUpdating(true);
    await updateLead(id as string, { assignedTo: agentId }, session?.user?.id || '');
    const result = await getLeadById(id as string);
    setData(result);
    setIsUpdating(false);
  };

  const handleFollowUp = async (date: string) => {
    setIsUpdating(true);
    await updateLead(id as string, { followUpDate: new Date(date) }, session?.user?.id || '');
    const result = await getLeadById(id as string);
    setData(result);
    setIsUpdating(false);
  };

  const handleNotesUpdate = async () => {
    setIsUpdating(true);
    await updateLead(id as string, { notes: editNotes }, session?.user?.id || '');
    const result = await getLeadById(id as string);
    setData(result);
    setIsEditingNotes(false);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this lead? This action cannot be undone.')) return;
    const res = await deleteLead(id as string, session?.user?.id || '');
    if (res.success) {
      router.push('/leads');
    }
  };

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#517561] border-t-transparent" />
    </div>
  );
  if (!data) return <div>Lead not found</div>;

  const { lead, activities } = data;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
          <span>Back to Leads</span>
        </button>
        <div className="flex space-x-3">
          <a 
            href={getWhatsAppLink(lead.phone)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-50">
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </Button>
          </a>
          {session?.user?.role === 'ADMIN' && (
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Lead Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
                <p className="mt-1 text-gray-500 italic">{lead.propertyInterest}</p>
              </div>
              <div className={cn(
                "rounded-full px-4 py-1 text-sm font-bold uppercase",
                lead.score === 'HIGH' ? 'bg-red-100 text-red-700' : 
                lead.score === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              )}>
                {lead.score} Priority
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <InfoItem icon={Mail} label="Email" value={lead.email} />
              <InfoItem icon={Phone} label="Phone" value={lead.phone} />
              <InfoItem icon={Target} label="Budget" value={formatCurrency(lead.budget)} />
              <InfoItem 
                icon={Calendar} 
                label="Created At" 
                value={format(new Date(lead.createdAt), 'PPP')} 
              />
            </div>

            <div className="mt-8 border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Internal Notes</h3>
                {!isEditingNotes ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)}>
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setIsEditingNotes(false); setEditNotes(lead.notes || ''); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleNotesUpdate} isLoading={isUpdating} className="flex items-center space-x-1">
                      <Save size={14} />
                      <span>Save</span>
                    </Button>
                  </div>
                )}
              </div>
              {isEditingNotes ? (
                <textarea
                  className="w-full rounded-xl border border-[#517561]/20 p-4 text-sm text-[#262f2a] focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561] min-h-[120px]"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                />
              ) : (
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg min-h-[100px]">
                  {lead.notes || 'No notes added yet.'}
                </p>
              )}
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="p-8">
            <div className="flex items-center space-x-2 mb-8">
              <History size={20} className="text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
            </div>
            
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-100">
              {activities.length === 0 && (
                <p className="pl-10 text-sm text-gray-400">No activity recorded yet.</p>
              )}
              {activities.map((activity: any) => (
                <div key={activity._id} className="relative pl-10">
                  <div className={cn(
                    "absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-white",
                    activity.action === 'CREATED' ? 'bg-green-500' :
                    activity.action === 'DELETED' ? 'bg-red-500' :
                    'bg-blue-500'
                  )} />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-400">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy • h:mm a')}
                    </span>
                    <span className="font-semibold text-gray-900">{activity.action}</span>
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    <span className="text-xs text-gray-400 mt-1">by {activity.userId?.name || 'System'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Meta */}
        <div className="space-y-8">
          {/* Status Update */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h3>
            <div className="grid grid-cols-1 gap-2">
              {['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED', 'LOST'].map((status) => (
                <button
                  key={status}
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(status)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg border transition-all",
                    lead.status === status 
                      ? "bg-[#517561] border-[#517561] text-white shadow-md" 
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#517561]/40"
                  )}
                >
                  <span className="text-sm font-medium">{status.replace('_', ' ')}</span>
                  {lead.status === status && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
          </Card>

          {/* Follow-up Reminder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Reminder</h3>
            <div className="space-y-4">
              {lead.followUpDate ? (
                <div className={cn(
                  "p-3 rounded-lg flex items-center space-x-3",
                  new Date(lead.followUpDate) < new Date() 
                    ? "bg-red-50 text-red-700 border border-red-100" 
                    : "bg-blue-50 text-blue-700 border border-blue-100"
                )}>
                  <Clock size={18} />
                  <span className="text-sm font-medium">
                    {new Date(lead.followUpDate) < new Date() ? 'OVERDUE: ' : 'Scheduled: '}
                    {format(new Date(lead.followUpDate), 'PPP')}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No follow-up scheduled</p>
              )}
              <Input 
                type="date" 
                onChange={(e) => handleFollowUp(e.target.value)}
                className="w-full"
              />
            </div>
          </Card>

          {/* AI Suggestions (Bonus) */}
          <Card className="p-6 bg-gradient-to-br from-[#f4f7f5] to-[#629c7c]/10 border-[#517561]/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#517561] rounded-xl text-white shadow-lg shadow-[#517561]/20">
                <Target size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-[#262f2a]">AI Strategy Insight</h3>
            </div>
            <p className="text-sm text-[#3b5d49] leading-relaxed font-bold">
              {lead.status === 'NEW' 
                ? `Based on the client's interest in ${lead.propertyInterest}, we recommend an immediate introductory call to qualify their budget of ${formatCurrency(lead.budget)}.`
                : lead.status === 'FOLLOW_UP'
                ? `The client is currently in the follow-up stage. Since they are interested in ${lead.propertyInterest}, consider sending them similar listings to keep the momentum.`
                : lead.status === 'CONTACTED'
                ? `Client has been contacted. Schedule a follow-up within 48 hours to discuss ${lead.propertyInterest} options within their ${formatCurrency(lead.budget)} range.`
                : lead.status === 'CLOSED'
                ? `Great work! This lead has been successfully closed. Consider asking for referrals from ${lead.name}.`
                : 'Keep the client engaged with regular updates on market trends in their area of interest.'}
            </p>
          </Card>

          {/* Assignment (Admin only) */}
          {session?.user?.role === 'ADMIN' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Agent</h3>
              <select
                disabled={isUpdating}
                value={lead.assignedTo?._id || ''}
                onChange={(e) => handleAssignment(e.target.value)}
                className="w-full rounded-xl border border-[#517561]/20 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561]"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center space-x-4 p-3 bg-white/40 rounded-xl border border-[#517561]/5 shadow-sm">
      <div className="p-2.5 bg-[#517561]/10 rounded-xl text-[#517561]">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-black tracking-widest text-[#517561]">{label}</p>
        <p className="text-sm font-black text-[#262f2a] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
