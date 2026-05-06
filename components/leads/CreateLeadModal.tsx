'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createLead } from '@/lib/actions/lead.actions';
import { useSession } from 'next-auth/react';

const CreateLeadModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyInterest: '',
    budget: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const res = await createLead(
      { ...formData, budget: Number(formData.budget) },
      session?.user?.id || ''
    );

    if (res.success) {
      onClose();
      setFormData({ name: '', email: '', phone: '', propertyInterest: '', budget: '', notes: '' });
      setError('');
    } else {
      setError(res.error || 'Failed to create lead');
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Add New Lead</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Client Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                  <Input
                    required
                    placeholder="923001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Property Interest</label>
                <Input
                  required
                  placeholder="e.g. DHA Phase 6 - 1 Kanal Plot"
                  value={formData.propertyInterest}
                  onChange={(e) => setFormData({ ...formData, propertyInterest: e.target.value })}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Budget (PKR)</label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 15000000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Notes</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isLoading}>
                  Create Lead
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateLeadModal;
