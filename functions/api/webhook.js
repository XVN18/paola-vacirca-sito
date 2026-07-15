import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('✅ Pagamento completato!');
    console.log('📧 Email:', session.customer_email);
    console.log('💰 Totale:', session.amount_total / 100, 'EUR');
    console.log('📦 Spedizione:', session.shipping_details?.address);
    console.log('📝 Note:', session.metadata?.customerNotes);
  }

  return new Response('OK', { status: 200 });
}

export async function onRequestGet() {
  return new Response('Webhook endpoint attivo', { status: 200 });
}
