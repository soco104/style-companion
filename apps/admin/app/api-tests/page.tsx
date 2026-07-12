import { ApiNotice } from "../components/api-notice";
import { StatusBadge } from "../components/status-badge";
import { adminApi, formatDateTime } from "../lib/api";

export default async function ApiTestsPage() {
  const run = await adminApi.apiTests();
  const apiError = run.failed > 0 ? "One or more API diagnostics failed. Check the details below." : undefined;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h1>API tests</h1>
          <p>
            Admin-side smoke checks for shopper search, weighted match explanations, availability filters, and the
            configured shopper profile endpoint.
          </p>
        </div>
      </header>

      <ApiNotice error={apiError} />

      <section className="stats-grid">
        <article className="stat-card">
          <span>Passed</span>
          <strong>{run.passed}</strong>
        </article>
        <article className="stat-card">
          <span>Failed</span>
          <strong>{run.failed}</strong>
        </article>
        <article className="stat-card">
          <span>API</span>
          <p>{run.apiUrl}</p>
        </article>
        <article className="stat-card">
          <span>Run time</span>
          <p>{formatDateTime(run.generatedAt)}</p>
        </article>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Checks</h2>
            <p>These checks call the same backend API the admin portal uses.</p>
          </div>
        </div>

        <div className="cards-grid">
          {run.checks.map((check) => (
            <article className="card" key={check.name}>
              <div className="card-header">
                <div>
                  <h2>{check.name}</h2>
                  <p>
                    <code>{check.endpoint}</code>
                  </p>
                </div>
                <StatusBadge>{check.status}</StatusBadge>
              </div>
              <dl className="details">
                <div>
                  <dt>Expected</dt>
                  <dd>{check.expected}</dd>
                </div>
                <div>
                  <dt>Result</dt>
                  <dd>{check.detail}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
