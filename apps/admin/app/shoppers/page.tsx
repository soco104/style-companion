import { ApiNotice } from "../components/api-notice";
import { EmptyState } from "../components/empty-state";
import { StatusBadge } from "../components/status-badge";
import { adminApi, formatMoney } from "../lib/api";

export default async function ShopperProfilesPage() {
  const shoppers = await adminApi.shoppers();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Supply</p>
          <h1>Shopper profiles</h1>
        </div>
      </header>

      <ApiNotice error={shoppers.error} />

      <section className="cards-grid">
        {shoppers.data.length === 0 ? (
          <EmptyState message="No shopper profiles found." />
        ) : (
          shoppers.data.map((shopper) => (
            <article className="card" key={shopper.id}>
              <div className="card-header">
                <div>
                  <h2>{shopper.user.name}</h2>
                  <p>{shopper.headline}</p>
                </div>
                <StatusBadge>{shopper.isActive ? "APPROVED" : "HIDDEN"}</StatusBadge>
              </div>
              <dl className="details">
                <div>
                  <dt>Location</dt>
                  <dd>
                    {shopper.city}, {shopper.state} · {shopper.serviceRadiusMiles} mi
                  </dd>
                </div>
                <div>
                  <dt>Rate</dt>
                  <dd>{formatMoney(shopper.hourlyRateCents, shopper.currency)}/hr</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>
                    {shopper.averageRating ?? "No rating"} ({shopper.reviewCount} reviews)
                  </dd>
                </div>
                <div>
                  <dt>Specialties</dt>
                  <dd>{shopper.specialties.map((specialty) => specialty.name).join(", ") || "None listed"}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
