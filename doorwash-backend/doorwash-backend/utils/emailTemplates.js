exports.bookingConfirmedEmail = (customerName, bookingId, scheduledAt, packageName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
  <div style="background:#0f172a;padding:24px;text-align:center;">
    <h1 style="color:#38bdf8;margin:0;">DoorWash</h1>
    <p style="color:#94a3b8;margin:4px 0 0;">Premium Door-Step Car Wash</p>
  </div>
  <div style="padding:32px 24px;background:#fff;">
    <h2>Booking Confirmed!</h2>
    <p>Hi <strong>${customerName}</strong>, your booking is confirmed.</p>
    <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:4px 0;"><strong>Booking ID:</strong> #${bookingId}</p>
      <p style="margin:4px 0;"><strong>Service:</strong> ${packageName}</p>
      <p style="margin:4px 0;"><strong>Scheduled:</strong> ${new Date(scheduledAt).toLocaleString('en-IN')}</p>
    </div>
    <p>Our worker will arrive at your doorstep on time.</p>
    <a href="${process.env.CLIENT_URL}/bookings" style="background:#38bdf8;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Track Booking</a>
  </div>
</div>`;
