// supabase/functions/check-deposits/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TRONGRID_API_KEY = Deno.env.get('TRONGRID_API_KEY')!;
const WALLET_ADDRESS = Deno.env.get('TRON_WALLET_ADDRESS')!;

// এই function service_role key দিয়ে চলে - RLS bypass করতে পারে,
// তাই এটা user-এর browser-এ কখনো যাবে না, শুধু Supabase-এর নিজস্ব server-এ চলে
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async () => {
  try {
    // ১. TronGrid থেকে আপনার wallet-এর সাম্প্রতিক TRC20 transaction গুলো আনা হচ্ছে
    const tronResponse = await fetch(
      `https://api.trongrid.io/v1/accounts/${WALLET_ADDRESS}/transactions/trc20?limit=30&only_confirmed=true`,
      { headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY } }
    );

    if (!tronResponse.ok) {
      throw new Error(`TronGrid API error: ${tronResponse.status}`);
    }

    const tronData = await tronResponse.json();
    const transactions = tronData.data ?? [];

    // ২. শুধু "incoming" (আমার wallet-এ আসা) transaction গুলো ফিল্টার করা হচ্ছে
    const incomingTxs = transactions.filter((tx: any) => tx.to === WALLET_ADDRESS);

    let confirmedCount = 0;
    let reviewCount = 0;

    for (const tx of incomingTxs) {
      // Tron-এ USDT-র decimal 6, তাই raw value-কে ভাগ করতে হয়
      const receivedAmount = Number(tx.value) / 1_000_000;
      const txHash = tx.transaction_id;

      // ৩. এই tx_hash আগেই process হয়ে গেছে কিনা check করা হচ্ছে (duplicate আটকানোর জন্য)
      const { data: alreadyProcessed } = await supabase
        .from('deposits')
        .select('id')
        .eq('tx_hash', txHash)
        .maybeSingle();

      if (alreadyProcessed) continue; // আগেই handle হয়ে গেছে, skip

      // ৪. exact_amount দিয়ে matching pending deposit খোঁজা হচ্ছে
      const { data: matches, error: matchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('exact_amount', receivedAmount)
        .eq('status', 'validating');

      if (matchError) {
        console.error('Match query error:', matchError);
        continue;
      }

      if (!matches || matches.length === 0) {
        // কোনো matching request নেই - হয়তো ভুল amount কেউ পাঠিয়েছে, বা আগেই expire হয়ে গেছে
        continue;
      }

      if (matches.length > 1) {
        // Collision - একাধিক pending request একই amount-এর, admin review লাগবে
        for (const m of matches) {
          await supabase
            .from('deposits')
            .update({ status: 'needs_review', tx_hash: txHash })
            .eq('id', m.id);
        }
        reviewCount++;
        continue;
      }

      // ৫. নিশ্চিত single match - deposit confirm করা হচ্ছে
      const match = matches[0];

      await supabase
        .from('deposits')
        .update({
          status: 'confirmed',
          tx_hash: txHash,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', match.id);

      // ৬. balance বাড়ানো হচ্ছে (আসল requested amount দিয়ে, exact_amount না)
      await supabase.rpc('increment_deposit_balance', {
        p_user_id: match.user_id,
        p_amount: match.expected_amount,
      });

      confirmedCount++;
    }

    return new Response(
      JSON.stringify({ success: true, confirmed: confirmedCount, needsReview: reviewCount, checked: incomingTxs.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('check-deposits error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});