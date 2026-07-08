import { ApiNotice } from "../components/api-notice";
import { EmptyState } from "../components/empty-state";
import { StatusBadge } from "../components/status-badge";
import { adminApi, formatDateTime, formatMoney } from "../lib/api";

export default async function BookingsPage() {
  const bookings = await adminApi.bookings();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sessions</p>
          <h1>Bookings</h1>
        </div>
      </header>

      <ApiNotice error={bookings.error} />

      <section className="table-wrap">
        {bookings.data.length === 0 ? (
          <EmptyState message="No bookings found." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Customer</th>
                <th>Shopper</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.data.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatDateTime(booking.scheduledStartAt)}</td>
                  <td>{booking.customerProfile.user.name}</td>
                  <td>{booking.shopperProfile.user.name}</td>
                  <td>{booking.goal}</td>
                  <td>
                    <StatusBadge>{booking.status}</StatusBadge>
                  </td>
                  <td>{formatMoney(booking.totalPriceCents, booking.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
