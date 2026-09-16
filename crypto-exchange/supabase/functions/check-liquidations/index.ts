// supabase/functions/check-liquidations/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async () => {
  try {
    // ১. সব OPEN position আনা হচ্ছে
    const { data: openPositions, error: posError } = await supabase
      .from('positions')
      .select('id, symbol, type, liquidation_price')
      .eq('status', 'OPEN');

    if (posError) throw posError;
    if (!openPositions || openPositions.length === 0) {
      return new Response(JSON.stringify({ success: true, checked: 0, liquidated: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ২. যেসব symbol-এ position আছে, শুধু সেগুলোর current price আনা হচ্ছে (Binance REST থেকে)
    const uniqueSymbols = [...new Set(openPositions.map((p) => p.symbol))];
    const priceMap: Record<string, number> = {};

    for (const symbol of uniqueSymbols) {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      if (res.ok) {
        const data = await res.json();
        priceMap[symbol] = parseFloat(data.price);
      }
    }

    let liquidatedCount = 0;

    // ৩. প্রতিটা position-এ liquidation check চালানো হচ্ছে
    for (const pos of openPositions) {
      const currentPrice = priceMap[pos.symbol];
      if (!currentPrice) continue;

      const { data: result, error: liqError } = await supabase.rpc('process_liquidation_check', {
        p_position_id: pos.id,
        p_current_price: currentPrice,
      });

      if (liqError) {
        console.error('Liquidation check error for position', pos.id, liqError);
        continue;
      }

      if (result?.status === 'LIQUIDATED') {
        liquidatedCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, checked: openPositions.length, liquidated: liquidatedCount }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('check-liquidations error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});