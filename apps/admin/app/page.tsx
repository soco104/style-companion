import Link from "next/link";

import { ApiNotice } from "./components/api-notice";
import { StatusBadge } from "./components/status-badge";
import { adminApi, formatDateTime, formatMoney } from "./lib/api";

export default async function DashboardPage() {
  const [health, users, shoppers, bookings, reviews, safetyReports] = await Promise.all([
    adminApi.health(),
    adminApi.users(),
    adminApi.shoppers(),
    adminApi.bookings(),
    adminApi.reviews(),
    adminApi.safetyReports()
  ]);

  const apiError = health.error ?? users.error ?? shoppers.error ?? bookings.error ?? reviews.error ?? safetyReports.error;
  const openReports = safetyReports.data.filter((report) => report.status === "OPEN" || report.status === "IN_REVIEW");
  const pendingReviews = reviews.data.filter((review) => review.moderationStatus === "PENDING");
  const requestedBookings = bookings.data.filter((booking) => booking.status === "REQUESTED");

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Dashboard</h1>
        </div>
        <StatusBadge>{health.error ? "OPEN" : "APPROVED"}</StatusBadge>
      </header>

      <ApiNotice error={apiError} />

      <section className="stats-grid" aria-label="Admin summary">
        <Link className="stat-card" href="/users">
          <span>Users</span>
          <strong>{users.data.length}</strong>
        </Link>
        <Link className="stat-card" href="/shoppers">
          <span>Active shoppers</span>
          <strong>{shoppers.data.filter((shopper) => shopper.isActive).length}</strong>
        </Link>
        <Link className="stat-card" href="/bookings">
          <span>Requested bookings</span>
          <strong>{requestedBookings.length}</strong>
        </Link>
        <Link className="stat-card" href="/reviews">
          <span>Pending reviews</span>
          <strong>{pendingReviews.length}</strong>
        </Link>
        <Link className="stat-card" href="/safety-reports">
          <span>Open safety reports</span>
          <strong>{openReports.length}</strong>
        </Link>
      </section>

      <section className="two-column">
        <div className="section">
          <div className="section-header">
            <h2>Latest bookings</h2>
            <Link href="/bookings">View all</Link>
          </div>
          <div className="list">
            {bookings.data.slice(0, 5).map((booking) => (
              <article className="list-row" key={booking.id}>
                <div>
                  <strong>{booking.customerProfile.user.name}</strong>
                  <p>
                    with {booking.shopperProfile.user.name} · {formatDateTime(booking.scheduledStartAt)}
                  </p>
                </div>
                <div className="row-meta">
                  <StatusBadge>{booking.status}</StatusBadge>
                  <span>{formatMoney(booking.totalPriceCents, booking.currency)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Moderation queue</h2>
            <Link href="/reviews">Review</Link>
          </div>
          <div className="list">
            {pendingReviews.slice(0, 5).map((review) => (
              <article className="list-row" key={review.id}>
                <div>
                  <strong>{review.rating}/5 from {review.customerProfile.user.name}</strong>
                  <p>{review.body}</p>
                </div>
                <StatusBadge>{review.moderationStatus}</StatusBadge>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
