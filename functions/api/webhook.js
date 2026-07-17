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
    
    const customerName = session.metadata?.customerName || session.shipping_details?.name || 'Cliente';
    const customerEmail = session.customer_email || session.customer_details?.email || 'Non disponibile';
    const customerPhone = session.metadata?.customerPhone || 'Non fornito';
    const customerAddress = session.metadata?.customerAddress || 'Non fornito';
    const shippingNotes = session.metadata?.customerNotes || 'Nessuna nota';
    const total = (session.amount_total / 100).toFixed(2);

    let orderItems = [];
    try {
      orderItems = JSON.parse(session.metadata?.orderItems || '[]');
    } catch (e) {}

    let itemsHtml = orderItems.map(item => {
      let itemNotes = item.notes ? `<br><em style="color: #C4923A; font-size: 13px;">📝 Note: ${item.notes}</em>` : '';
      return `<li style="padding: 6px 0; border-bottom: 1px solid #eee;"><strong>${item.name}</strong> x${item.quantity}${itemNotes}</li>`;
    }).join('');

    let notesSection = '';
    if (shippingNotes && shippingNotes !== 'Nessuna nota') {
      notesSection = `
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; color: #856404;">📝 Note del Cliente</h3>
          <p style="margin: 0; color: #856404; font-size: 16px;">${shippingNotes}</p>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B6914, #C4923A); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🛒 Nuovo Ordine Ricevuto!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 12px 12px;">
          <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #333;">👤 Dati Cliente</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Nome:</strong> ${customerName}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${customerEmail}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Telefono:</strong> ${customerPhone}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Indirizzo:</strong> ${customerAddress}</p>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #333;">📦 Prodotti Ordinati</h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${itemsHtml}
            </ul>
            <div style="border-top: 2px solid #C4923A; margin-top: 12px; padding-top: 12px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #8B6914;">💰 Totale: €${total}</p>
            </div>
          </div>
          ${notesSection}
        </div>
      </div>
    `;

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Ordini Paola Vacirca <onboarding@resend.dev>',
          to: ['paolavacirca09@gmail.com'],
          subject: `🛒 Nuovo Ordine da ${customerName} - €${total}`,
          html: html,
        }),
      });

      if (emailResponse.ok) {
        console.log('✅ Email di notifica inviata con successo!');
      } else {
        const error = await emailResponse.text();
        console.error('❌ Errore invio email:', error);
      }
    } catch (emailError) {
      console.error('❌ Errore invio email:', emailError.message);
    }
  }

  return new Response('OK', { status: 200 });
}

export async function onRequestGet() {
  return new Response('Webhook endpoint attivo', { status: 200 });
}
