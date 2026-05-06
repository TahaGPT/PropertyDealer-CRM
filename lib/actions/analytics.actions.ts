'use server';

import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';

export async function getAnalytics() {
  try {
    await dbConnect();

    const totalLeads = await Lead.countDocuments();
    
    const statusDistribution = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityDistribution = await Lead.aggregate([
      { $group: { _id: '$score', count: { $sum: 1 } } }
    ]);

    const agentPerformance = await User.aggregate([
      { $match: { role: 'AGENT' } },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'leads'
        }
      },
      {
        $project: {
          name: 1,
          leadCount: { $size: '$leads' },
          closedLeads: {
            $size: {
              $filter: {
                input: '$leads',
                as: 'lead',
                cond: { $eq: ['$$lead.status', 'CLOSED'] }
              }
            }
          }
        }
      }
    ]);

    return JSON.parse(JSON.stringify({
      totalLeads,
      statusDistribution: statusDistribution.map(item => ({ name: item._id, value: item.count })),
      priorityDistribution: priorityDistribution.map(item => ({ name: item._id, value: item.count })),
      agentPerformance
    }));
  } catch (error) {
    console.error('Analytics Error:', error);
    return null;
  }
}
