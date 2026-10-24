const nf = new Intl.NumberFormat('ru-RU');
const money = (n) => `${nf.format(n)} ₸`;
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export async function tgCall(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    signal: AbortSignal.timeout(6000),
  });
  const data = await r.json().catch(() => ({}));
  if (!data.ok) throw Object.assign(new Error(data.description || 'Telegram error'), { status: 400 });
  return data.result;
}

export function orderText(o) {
  const lines = [
    `🍯 <b>Жаңа тапсырыс ${esc(o.code)}</b>`,
    '',
    ...o.items.map((i) => `• ${esc(i.name)} × ${i.quantity} = ${money(i.price * i.quantity)}`),
    '',
    `<b>Барлығы: ${money(o.total)}</b>`,
    '',
    `👤 ${esc(o.name)}`,
    `📞 ${esc(o.phone)}`,
    o.method === 'delivery' ? `🚚 Жеткізу: ${esc(o.address)}` : '📍 Өзі алып кетеді',
  ];
  if (o.comment) lines.push(`💬 ${esc(o.comment)}`);
  return lines.join('\n');
}

export async function notifyOrder(tg, order) {
  if (!tg?.token || !tg?.chatId) return;
  const digits = String(order.phone).replace(/\D/g, '').replace(/^8/, '7');
  await tgCall(tg.token, 'sendMessage', {
    chat_id: tg.chatId,
    text: orderText(order),
    parse_mode: 'HTML',
    reply_markup: digits.length >= 10
      ? { inline_keyboard: [[{ text: 'WhatsApp-қа жазу', url: `https://wa.me/${digits}` }]] }
      : undefined,
  });
}
