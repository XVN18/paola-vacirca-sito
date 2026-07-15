import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  try {
    const body = await request.json();
    const { items, email, shipping } = body;

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Il carrello è vuoto' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image && item.image.startsWith('http') ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const shippingCost = subtotal >= 80 ? 0 : 5.90;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Spedizione standard',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const origin = 'https://paola-vacirca.pages.dev';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email || undefined,
      shipping_address_collection: {
        allowed_countries: ['IT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Spedizione gratuita',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      success_url: origin + '/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/cancel',
      metadata: {
        orderItems: JSON.stringify(items.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
        }))),
        customerName: shipping ? `${shipping.firstName} ${shipping.lastName}` : '',
        customerAddress: shipping ? `${shipping.address} ${shipping.civic}, ${shipping.city} (${shipping.province})` : '',
        customerPhone: shipping?.phone || '',
        customerNotes: shipping?.notes || '',
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
