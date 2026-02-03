import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Paymob sends the callback as query parameters or POST body
    let callbackData: any;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      callbackData = Object.fromEntries(url.searchParams);
    } else {
      callbackData = await req.json();
    }

    console.log('Payment callback received:', JSON.stringify(callbackData));

    const {
      order: orderId,
      success,
      id: transactionId,
      pending,
      amount_cents,
      error_occured,
    } = callbackData;

    if (!orderId) {
      console.error('Missing order ID in callback');
      return new Response(JSON.stringify({ error: 'Missing order ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the payment by Paymob order ID
    const { data: payment, error: paymentFetchError } = await supabase
      .from('payments')
      .select('*, reservations(*)')
      .eq('paymob_order_id', orderId.toString())
      .single();

    if (paymentFetchError || !payment) {
      console.error('Payment not found:', paymentFetchError);
      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isSuccess = success === 'true' || success === true;
    const isPending = pending === 'true' || pending === true;
    const hasError = error_occured === 'true' || error_occured === true;

    let paymentStatus = 'pending';
    let reservationStatus = 'pending_payment';

    if (isSuccess && !hasError) {
      paymentStatus = 'completed';
      reservationStatus = 'paid';
      console.log('Payment successful for order:', orderId);
    } else if (hasError) {
      paymentStatus = 'failed';
      reservationStatus = 'payment_failed';
      console.log('Payment failed for order:', orderId);
    } else if (isPending) {
      paymentStatus = 'pending';
      reservationStatus = 'pending_payment';
      console.log('Payment pending for order:', orderId);
    }

    // Update payment record
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        paymob_transaction_id: transactionId?.toString() || null,
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('Failed to update payment:', paymentUpdateError);
    }

    // Update reservation status
    const { error: reservationUpdateError } = await supabase
      .from('reservations')
      .update({ status: reservationStatus })
      .eq('id', payment.reservation_id);

    if (reservationUpdateError) {
      console.error('Failed to update reservation:', reservationUpdateError);
    }

    // If payment successful, create a pending payout for the owner
    if (isSuccess && !hasError) {
      const reservation = payment.reservations;
      const ownerPayout = reservation.room_price - reservation.platform_fee + reservation.insurance_amount;

      // Get room's payout method
      const { data: room } = await supabase
        .from('rooms')
        .select('owner_payout_method')
        .eq('id', reservation.room_id)
        .single();

      const { error: payoutError } = await supabase
        .from('payouts')
        .insert({
          reservation_id: reservation.id,
          owner_id: reservation.owner_id,
          amount: ownerPayout,
          payout_method: room?.owner_payout_method || 'instapay',
          status: 'pending',
        });

      if (payoutError) {
        console.error('Failed to create payout record:', payoutError);
      } else {
        console.log('Payout record created for owner:', reservation.owner_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_status: paymentStatus,
        reservation_status: reservationStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Payment callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
