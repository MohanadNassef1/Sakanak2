import { supabase } from '@/integrations/supabase/client';

type NotificationType = 'new_viewing_request' | 'counter_proposal' | 'viewing_confirmed' | 'viewing_cancelled' | 'viewing_declined';

interface SendNotificationParams {
  type: NotificationType;
  viewing_id: string;
  recipient_id: string;
  sender_name: string;
  room_title: string;
  proposed_date?: string;
  proposed_time?: string;
  counter_date?: string;
  counter_time?: string;
  decline_reason?: string;
}

/**
 * Send email notification for viewing-related events
 * This is a fire-and-forget function that logs errors but doesn't block
 */
export async function sendViewingNotification(params: SendNotificationParams): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-viewing-notification', {
      body: params,
    });

    if (error) {
      console.error('Failed to send viewing notification:', error);
    } else {
      console.log('Viewing notification sent:', data);
    }
  } catch (err) {
    // Log but don't throw - email notifications should not block the main flow
    console.error('Error sending viewing notification:', err);
  }
}

/**
 * Format date for display in emails
 */
export function formatDateForEmail(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format time for display in emails (HH:MM:SS -> H:MM AM/PM)
 */
export function formatTimeForEmail(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
}
