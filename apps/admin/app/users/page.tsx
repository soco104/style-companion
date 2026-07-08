import { ApiNotice } from "../components/api-notice";
import { EmptyState } from "../components/empty-state";
import { StatusBadge } from "../components/status-badge";
import { adminApi, formatDateTime } from "../lib/api";

export default async function UsersPage() {
  const users = await adminApi.users();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Users</h1>
        </div>
      </header>

      <ApiNotice error={users.error} />

      <section className="table-wrap">
        {users.data.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Profiles</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <StatusBadge>{user.role}</StatusBadge>
                  </td>
                  <td>
                    {user.customerProfile ? "Customer" : ""}
                    {user.customerProfile && user.shopperProfile ? ", " : ""}
                    {user.shopperProfile ? "Shopper" : ""}
                    {!user.customerProfile && !user.shopperProfile ? "None" : ""}
                  </td>
                  <td>{formatDateTime(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
