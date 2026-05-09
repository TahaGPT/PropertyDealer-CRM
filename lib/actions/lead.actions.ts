'use server';

import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { revalidatePath } from 'next/cache';
import { sendEmailNotification, sendDirectEmail } from './email.actions';
import { EMAIL_TEMPLATES } from '@/lib/constants/email-templates';
import { createLeadSchema, updateLeadSchema, validateData } from '@/lib/validations';

export async function createLead(formData: any, userId: string) {
  try {
    // Validate input
    const validation = validateData(createLeadSchema, formData);
    if (!validation.success) {
      return { success: false, error: validation.errors.join(', ') };
    }

    await dbConnect();
    const lead = await Lead.create(validation.data);
    
    await ActivityLog.create({
      leadId: lead._id,
      userId,
      action: 'CREATED',
      details: `Lead created by ${userId}`,
    });

    // Notify Admin about new lead (email + in-app notification)
    await sendEmailNotification('admin', 'New Lead Created', EMAIL_TEMPLATES.NEW_LEAD, {
      leadName: lead.name,
      interest: lead.propertyInterest,
      budget: lead.budget,
      email: lead.email,
      phone: lead.phone,
    });

    revalidatePath('/leads');
    return { success: true, lead: JSON.parse(JSON.stringify(lead)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLeads(query: any = {}) {
  try {
    await dbConnect();
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    return [];
  }
}

export async function updateLead(id: string, updates: any, userId: string) {
  try {
    // Validate updates
    const validation = validateData(updateLeadSchema, updates);
    if (!validation.success) {
      return { success: false, error: validation.errors.join(', ') };
    }

    await dbConnect();
    const oldLead = await Lead.findById(id).populate('assignedTo');
    const lead = await Lead.findByIdAndUpdate(id, validation.data, { new: true }).populate('assignedTo');
    
    let actionDetails = 'Updated lead details';
    if (updates.status && updates.status !== oldLead.status) {
      actionDetails = `Status updated from ${oldLead.status} to ${updates.status}`;
    } else if (updates.assignedTo && updates.assignedTo !== oldLead.assignedTo?._id?.toString()) {
      actionDetails = `Lead assigned/reassigned`;
      
      // Notify Agent about assignment (direct email to agent)
      if (lead.assignedTo) {
        await sendDirectEmail(lead.assignedTo.email, EMAIL_TEMPLATES.ASSIGNMENT, {
          leadName: lead.name,
          interest: lead.propertyInterest,
        });

        // Notify Admin about client assignment to agent (email + in-app notification)
        await sendEmailNotification('admin', 'Client Assigned', EMAIL_TEMPLATES.CLIENT_ASSIGNED, {
          leadName: lead.name,
          agentName: lead.assignedTo.name,
          agentEmail: lead.assignedTo.email,
          interest: lead.propertyInterest,
        });
      }
    } else if (updates.followUpDate) {
      actionDetails = `Follow-up date set`;
    } else if (updates.notes !== undefined) {
      actionDetails = `Notes updated`;
    }

    await ActivityLog.create({
      leadId: id,
      userId,
      action: 'UPDATED',
      details: actionDetails,
    });

    revalidatePath('/leads');
    revalidatePath(`/leads/${id}`);
    return { success: true, lead: JSON.parse(JSON.stringify(lead)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLead(id: string, userId: string) {
  try {
    await dbConnect();
    
    // Fetch lead details before deleting for the notification
    const lead = await Lead.findById(id);
    const deletingUser = await User.findById(userId).select('name');
    
    await Lead.findByIdAndDelete(id);
    
    // Log the deletion (using a general log entry)
    await ActivityLog.create({
      leadId: id,
      userId,
      action: 'DELETED',
      details: `Lead deleted by ${userId}`,
    });

    // Notify Admin about customer deletion (email + in-app notification)
    if (lead) {
      await sendEmailNotification('admin', 'Customer Deleted', EMAIL_TEMPLATES.CUSTOMER_DELETED, {
        leadName: lead.name,
        deletedBy: deletingUser?.name || 'Unknown User',
        email: lead.email,
        interest: lead.propertyInterest,
      });
    }
    
    revalidatePath('/leads');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLeadById(id: string) {
  try {
    await dbConnect();
    const lead = await Lead.findById(id).populate('assignedTo', 'name email');
    const activities = await ActivityLog.find({ leadId: id })
      .populate('userId', 'name')
      .sort({ timestamp: -1 });
    
    return {
      lead: JSON.parse(JSON.stringify(lead)),
      activities: JSON.parse(JSON.stringify(activities)),
    };
  } catch (error) {
    return null;
  }
}
