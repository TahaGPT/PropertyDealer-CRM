'use client';

import { useEffect, useState, useRef } from 'react';
import LeadTable from '@/components/leads/LeadTable';
import CreateLeadModal from '@/components/leads/CreateLeadModal';
import { Button } from '@/components/ui';
import { Plus, Filter, Download, X, RefreshCw, Search } from 'lucide-react';
import { getLeads } from '@/lib/actions/lead.actions';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const { data: session } = useSession();

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const prevCountRef = useRef(0);

  const fetchLeads = async () => {
    setIsLoading(true);
    const query = session?.user?.role === 'AGENT' ? { assignedTo: session.user.id } : {};
    const data = await getLeads(query);

    // Detect changes for real-time update banner
    if (prevCountRef.current > 0 && data.length !== prevCountRef.current) {
      setHasNewUpdates(true);
    }
    prevCountRef.current = data.length;

    setLeads(data);
    setFilteredLeads(data);
    setIsLoading(false);
    setHasNewUpdates(false);
  };

  useEffect(() => {
    if (session) {
      fetchLeads();
    }
  }, [session]);

  // Polling: re-fetch leads every 10 seconds for real-time updates
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(async () => {
      const query = session?.user?.role === 'AGENT' ? { assignedTo: session.user.id } : {};
      const data = await getLeads(query);
      
      if (data.length !== prevCountRef.current) {
        setHasNewUpdates(true);
      }
      // Don't overwrite immediately — let user click "Refresh" to avoid jarring UI
    }, 10000);

    return () => clearInterval(interval);
  }, [session]);

  // Apply filters whenever filter state or leads change
  useEffect(() => {
    let result = [...leads];

    if (statusFilter !== 'ALL') {
      result = result.filter((lead: any) => lead.status === statusFilter);
    }
    if (priorityFilter !== 'ALL') {
      result = result.filter((lead: any) => lead.score === priorityFilter);
    }
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter((lead: any) => {
        const createdAt = new Date(lead.createdAt);
        return createdAt >= filterDate;
      });
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((lead: any) =>
        lead.name?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.phone?.includes(q) ||
        lead.propertyInterest?.toLowerCase().includes(q)
      );
    }

    setFilteredLeads(result);
  }, [statusFilter, priorityFilter, dateFilter, searchText, leads]);

  const handleExport = () => {
    if (filteredLeads.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Property Interest', 'Budget', 'Status', 'Priority', 'Assigned To', 'Created At'];
    const csvRows = [
      headers.join(','),
      ...filteredLeads.map((lead: any) =>
        [
          `"${lead.name || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.propertyInterest || ''}"`,
          lead.budget || 0,
          lead.status || '',
          lead.score || '',
          `"${lead.assignedTo?.name || 'Unassigned'}"`,
          lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDateFilter('');
    setSearchText('');
  };

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || dateFilter !== '' || searchText.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#262f2a] tracking-tight">Leads Management</h1>
          <p className="text-[#3b5d49] font-semibold">Track and manage your property inquiries</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            className="flex items-center space-x-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                !
              </span>
            )}
          </Button>
          <Button variant="outline" className="flex items-center space-x-2" onClick={handleExport}>
            <Download size={18} />
            <span>Export</span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Real-time update banner */}
      <AnimatePresence>
        {hasNewUpdates && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3 rounded-xl bg-[#517561]/10 border border-[#517561]/20"
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-[#517561] animate-pulse" />
              <span className="text-sm font-bold text-[#517561]">New updates available</span>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="flex items-center space-x-1"
              onClick={fetchLeads}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-4 p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-[#517561]/20 shadow-sm">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#517561]/60 mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Name, email, phone..."
                    className="h-10 rounded-xl border border-[#517561]/20 bg-white pl-9 pr-4 text-sm text-[#262f2a] focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561] w-52"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#517561]/60 mb-1.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#517561]/20 bg-white px-4 text-sm text-[#262f2a] focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="CLOSED">Closed</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#517561]/60 mb-1.5">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#517561]/20 bg-white px-4 text-sm text-[#262f2a] focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#517561]/60 mb-1.5">Created After</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-10 rounded-xl border border-[#517561]/20 bg-white px-4 text-sm text-[#262f2a] focus:outline-none focus:ring-2 focus:ring-[#517561]/10 focus:border-[#517561]"
                />
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center space-x-1 text-red-600 hover:bg-red-50">
                  <X size={14} />
                  <span>Clear</span>
                </Button>
              )}
              <div className="ml-auto text-xs font-medium text-[#3b5d49]">
                Showing {filteredLeads.length} of {leads.length} leads
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#517561] border-t-transparent" />
        </div>
      ) : (
        <LeadTable leads={filteredLeads} onRefresh={fetchLeads} />
      )}

      <CreateLeadModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchLeads();
        }} 
      />
    </div>
  );
}
