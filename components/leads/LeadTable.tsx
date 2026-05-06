'use client';

import { formatCurrency, cn, getWhatsAppLink } from '@/lib/utils';
import { 
  Mail, 
  MessageCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { deleteLead } from '@/lib/actions/lead.actions';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface LeadTableProps {
  leads: any[];
  onRefresh?: () => void;
}

const scoreColors: any = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-orange-500',
  LOW: 'bg-blue-500',
};

const LeadTable = ({ leads, onRefresh }: LeadTableProps) => {
  const { data: session } = useSession();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    const res = await deleteLead(id, session?.user?.id || '');
    if (res.success && onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#517561]/20 bg-white/70 backdrop-blur-md shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f4f7f5]/80 text-[#3b5d49] uppercase text-[11px] font-black tracking-widest">
          <tr>
            <th className="px-6 py-5">Client Information</th>
            <th className="px-6 py-5">Property & Budget</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5">Priority</th>
            <th className="px-6 py-5">Assigned Agent</th>
            <th className="px-6 py-5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#517561]/10">
          {leads.map((lead, index) => (
            <motion.tr 
              key={lead._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-[#629c7c]/10 transition-colors group"
            >
              <td className="px-6 py-5">
                <div className="font-bold text-[#262f2a] group-hover:text-[#517561] transition-colors">{lead.name}</div>
                <div className="flex items-center space-x-2 text-xs text-[#3b5d49] mt-1 font-medium">
                  <Mail size={12} />
                  <span>{lead.email}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="text-slate-700 font-semibold">{lead.propertyInterest}</div>
                <div className="text-blue-600 font-bold mt-0.5">{formatCurrency(lead.budget)}</div>
              </td>
              <td className="px-6 py-5">
                <span className={cn(
                  'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border',
                  lead.status === 'NEW' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  lead.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  lead.status === 'FOLLOW_UP' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                  lead.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  lead.status === 'LOST' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-slate-50 text-slate-600 border-slate-100'
                )}>
                  {lead.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center space-x-2">
                  <div className={cn('h-2 w-2 rounded-full animate-pulse', scoreColors[lead.score])} />
                  <span className="text-xs font-bold text-slate-700">{lead.score}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-slate-600">
                {lead.assignedTo ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                      {lead.assignedTo.name.charAt(0)}
                    </div>
                    <span className="font-medium">{lead.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center space-x-2">
                  <Link href={`/leads/${lead._id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all">View</Button>
                  </Link>
                  <a 
                    href={getWhatsAppLink(lead.phone)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110"
                  >
                    <MessageCircle size={18} />
                  </a>
                  {session?.user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all hover:scale-110"
                      title="Delete lead"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="p-20 text-center text-slate-400 font-medium">
          No leads found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default LeadTable;
