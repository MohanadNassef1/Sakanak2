import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PAYMOB_HMAC_SECRET = Deno.env.get('PAYMOB_HMAC_SECRET');

// Paymob HMAC verification - fields in specific order as per Paymob docs
const HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
];

function getNestedValue(obj: any, path: string): string {
  const parts = path.split('.');
  let value = obj;
  for (const part of parts) {
    if (value === null || value === undefined) return '';
    value = value[part];
  }
  return String(value ?? '');
}

function verifyPaymobHmac(data: any, receivedHmac: string): boolean {
  if (!PAYMOB_HMAC_SECRET) {
    console.warn('PAYMOB_HMAC_SECRET not configured - skipping HMAC verification');
    return true; // Allow if not configured (for backwards compatibility during setup)
  }

  if (!receivedHmac) {
    console.error('No HMAC received in callback');
    return false;
  }

  // Concatenate values in the specified order
  const concatenated = HMAC_FIELDS.map(field => getNestedValue(data, field)).join('');
  
  // Calculate HMAC
  const calculatedHmac = createHmac('sha512', PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest('hex');

  const isValid = calculatedHmac === receivedHmac;
  
  if (!isValid) {
    console.error('HMAC verification failed');
    console.log('Expected:', calculatedHmac);
    console.log('Received:', receivedHmac);
  }

  return isValid;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Paymob sends the callback as query parameters or POST body
    let callbackData: any;
    let receivedHmac: string = '';
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      callbackData = Object.fromEntries(url.searchParams);
      receivedHmac = callbackData.hmac || '';
    } else {
      callbackData = await req.json();
      // For POST, HMAC might be in the obj field
      if (callbackData.obj) {
        receivedHmac = callbackData.hmac || '';
        callbackData = callbackData.obj;
      } else {
        receivedHmac = callbackData.hmac || '';
      }
    }

    console.log('Payment callback received:', JSON.stringify(callbackData));

    // Verify HMAC signature to prevent forged callbacks
    if (!verifyPaymobHmac(callbackData, receivedHmac)) {
      console.error('HMAC verification failed - rejecting callback');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('HMAC verification passed');

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

    // Additional validation: verify amount matches
    if (amount_cents) {
      const expectedAmountCents = Math.round(payment.amount * 100);
      const receivedAmountCents = parseInt(amount_cents, 10);
      if (receivedAmountCents !== expectedAmountCents) {
        console.error(`Amount mismatch: expected ${expectedAmountCents}, received ${receivedAmountCents}`);
        return new Response(
          JSON.stringify({ error: 'Amount mismatch' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
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
