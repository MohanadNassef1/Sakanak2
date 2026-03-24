import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// SECURITY: Restrict CORS to specific allowed origins
const ALLOWED_ORIGINS = [
  'https://sakanakeg.com',
  'https://id-preview--075b3489-daa0-4b32-ba8c-8ea0a6df1c8c.lovable.app',
  'https://lmjivfayjyskriikcyzg.supabase.co',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

const PAYMOB_API_KEY = Deno.env.get('PAYMOB_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%

// Input validation schema
const PaymentInputSchema = z.object({
  room_id: z.string().uuid('Invalid room ID format'),
  check_in_date: z.string().refine((date) => {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // Check-in must be today or in the future, and within 1 year
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    return parsed >= now && parsed <= maxDate;
  }, 'Check-in date must be a valid date between today and 1 year from now'),
  duration_months: z.number().int('Duration must be a whole number').min(1, 'Minimum duration is 1 month').max(24, 'Maximum duration is 24 months'),
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
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

    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = PaymentInputSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { room_id, check_in_date, duration_months } = validation.data;

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

    // Prevent owners from booking their own rooms
    if (userId === room.owner_id) {
      return new Response(
        JSON.stringify({ error: 'You cannot book your own listing' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
     // Platform fee is 5% of ONE month's rent only, not the total duration
     const platformFee = Math.round(room.price_per_month * PLATFORM_FEE_PERCENTAGE * 100) / 100;
     const totalAmount = roomPrice + insuranceAmount + platformFee;
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
