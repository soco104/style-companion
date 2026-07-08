import { ApiNotice } from "../components/api-notice";
import { EmptyState } from "../components/empty-state";
import { StatusBadge } from "../components/status-badge";
import { moderateReviewAction } from "../lib/actions";
import { adminApi, formatDateTime } from "../lib/api";

export default async function ReviewsPage() {
  const reviews = await adminApi.reviews();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Trust</p>
          <h1>Reviews moderation</h1>
        </div>
      </header>

      <ApiNotice error={reviews.error} />

      <section className="cards-grid">
        {reviews.data.length === 0 ? (
          <EmptyState message="No reviews found." />
        ) : (
          reviews.data.map((review) => (
            <article className="card" key={review.id}>
              <div className="card-header">
                <div>
                  <h2>
                    {review.rating}/5 for {review.shopperProfile.user.name}
                  </h2>
                  <p>
                    From {review.customerProfile.user.name} · {formatDateTime(review.createdAt)}
                  </p>
                </div>
                <StatusBadge>{review.moderationStatus}</StatusBadge>
              </div>
              <p className="quote">{review.body}</p>
              {review.response ? (
                <div className="inline-note">
                  <strong>Shopper response:</strong> {review.response.body}
                </div>
              ) : null}
              <form action={moderateReviewAction} className="action-form">
                <input name="id" type="hidden" value={review.id} />
                <label>
                  Moderation note
                  <input name="moderationNotes" placeholder="Optional note for audit trail" />
                </label>
                <div className="button-row">
                  <button name="moderationStatus" type="submit" value="APPROVED">
                    Approve
                  </button>
                  <button className="secondary" name="moderationStatus" type="submit" value="HIDDEN">
                    Hide
                  </button>
                </div>
              </form>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
