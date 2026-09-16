import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async () => {
  try {
    const { data: pending, error } = await supabase
      .from('limit_orders')
      .select('id, symbol, type, target_price')
      .eq('status', 'PENDING');

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ success: true, checked: 0, filled: 0 }), { headers: { 'Content-Type': 'application/json' } });
    }

    const uniqueSymbols = [...new Set(pending.map((o) => o.symbol))];
    const priceMap: Record<string, number> = {};

    for (const symbol of uniqueSymbols) {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      if (res.ok) {
        const data = await res.json();
        priceMap[symbol] = parseFloat(data.price);
      }
    }

    let filledCount = 0;
    for (const order of pending) {
      const currentPrice = priceMap[order.symbol];
      if (!currentPrice) continue;

      const { data: result } = await supabase.rpc('process_limit_order_check', {
        p_order_id: order.id,
        p_current_price: currentPrice,
      });

      if (result?.status === 'FILLED') filledCount++;
    }

    return new Response(JSON.stringify({ success: true, checked: pending.length, filled: filledCount }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});