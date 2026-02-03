import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYMOB_API_KEY = Deno.env.get('PAYMOB_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!PAYMOB_API_KEY) {
      throw new Error('PAYMOB_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { room_id, check_in_date, duration_months } = await req.json();

    if (!room_id || !check_in_date || !duration_months) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, owner:profiles!rooms_owner_id_fkey(full_name, email)')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      console.error('Room fetch error:', roomError);
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch seeker profile
    const { data: seekerProfile, error: seekerError } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('user_id', userId)
      .single();

    if (seekerError || !seekerProfile) {
      console.error('Seeker profile error:', seekerError);
      return new Response(JSON.stringify({ error: 'Seeker profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate amounts
    const roomPrice = room.price_per_month * duration_months;
    const insuranceAmount = room.insurance_amount || 0;
    const platformFee = Math.round(roomPrice * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const totalAmount = roomPrice + insuranceAmount;
    const totalAmountCents = Math.round(totalAmount * 100);

    console.log('Payment calculation:', { roomPrice, insuranceAmount, platformFee, totalAmount });

    // Step 1: Get Paymob auth token
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });

    const authResult = await authResponse.json();
    if (!authResponse.ok || !authResult.token) {
      console.error('Paymob auth error:', authResult);
      throw new Error('Failed to authenticate with Paymob');
    }

    const paymobToken = authResult.token;
    console.log('Paymob auth successful');

    // Step 2: Register order
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: paymobToken,
        delivery_needed: false,
        amount_cents: totalAmountCents,
        currency: 'EGP',
        items: [
          {
            name: `Room Reservation - ${room.title}`,
            amount_cents: Math.round(roomPrice * 100),
            quantity: 1,
          },
          {
            name: 'Security Deposit',
            amount_cents: Math.round(insuranceAmount * 100),
            quantity: 1,
          },
        ],
      }),
    });

    const orderResult = await orderResponse.json();
    if (!orderResponse.ok || !orderResult.id) {
      console.error('Paymob order error:', orderResult);
      throw new Error('Failed to create Paymob order');
    }

    const paymobOrderId = orderResult.id;
    console.log('Paymob order created:', paymobOrderId);

    // Step 3: Create reservation in database
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        room_id,
        seeker_id: userId,
        owner_id: room.owner_id,
        check_in_date,
        duration_months,
        room_price: roomPrice,
        insurance_amount: insuranceAmount,
        platform_fee: platformFee,
        total_paid: totalAmount,
        status: 'pending_payment',
      })
      .select()
      .single();

    if (reservationError || !reservation) {
      console.error('Reservation creation error:', reservationError);
      throw new Error('Failed to create reservation');
    }

    // Step 4: Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        reservation_id: reservation.id,
        user_id: userId,
        amount: totalAmount,
        platform_fee: platformFee,
        payment_type: 'reservation',
        status: 'pending',
        paymob_order_id: paymobOrderId.toString(),
      });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    // Step 5: Get payment key (integration ID should be from Paymob dashboard)
    // For now, we'll return the order ID and the client can use the payment iframe
    // The actual integration ID needs to be configured in Paymob

    return new Response(
      JSON.stringify({
        success: true,
        reservation_id: reservation.id,
        paymob_order_id: paymobOrderId,
        amount: totalAmount,
        room_title: room.title,
        message: 'Reservation created. Proceed to payment.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Payment creation error:', error);
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
