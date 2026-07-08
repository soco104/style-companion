import { ApiNotice } from "../components/api-notice";
import { EmptyState } from "../components/empty-state";
import { StatusBadge } from "../components/status-badge";
import { updateSafetyReportAction } from "../lib/actions";
import { adminApi, formatDateTime } from "../lib/api";
import type { SafetyReportStatus } from "../lib/types";

const statuses: SafetyReportStatus[] = ["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"];

export default async function SafetyReportsPage() {
  const reports = await adminApi.safetyReports();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Safety</p>
          <h1>Safety reports</h1>
        </div>
      </header>

      <ApiNotice error={reports.error} />

      <section className="cards-grid">
        {reports.data.length === 0 ? (
          <EmptyState message="No safety reports found." />
        ) : (
          reports.data.map((report) => (
            <article className="card" key={report.id}>
              <div className="card-header">
                <div>
                  <h2>{report.category.replaceAll("_", " ")}</h2>
                  <p>
                    Reported by {report.reporterUser.name} · {formatDateTime(report.createdAt)}
                  </p>
                </div>
                <StatusBadge>{report.status}</StatusBadge>
              </div>
              <p>{report.description}</p>
              <dl className="details compact">
                <div>
                  <dt>Reported user</dt>
                  <dd>{report.reportedUser?.name ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Booking</dt>
                  <dd>{report.booking?.id ?? "No booking linked"}</dd>
                </div>
                <div>
                  <dt>Resolution</dt>
                  <dd>{report.resolutionNotes ?? "No notes yet"}</dd>
                </div>
              </dl>
              <form action={updateSafetyReportAction} className="action-form">
                <input name="id" type="hidden" value={report.id} />
                <label>
                  Status
                  <select defaultValue={report.status} name="status">
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Resolution notes
                  <textarea name="resolutionNotes" placeholder="Add internal notes" rows={3} />
                </label>
                <button type="submit">Update report</button>
              </form>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
