import { ApiNotice } from "../components/api-notice";
import { EmptyState } from "../components/empty-state";
import { StatusBadge } from "../components/status-badge";
import { adminApi, formatDateTime } from "../lib/api";
import { updateCustomerFeeWaiverAction, updateShopperFeeWaiverAction } from "../lib/actions";

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
                <th>Fee waivers</th>
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
                  <td>
                    <div className="stacked-actions">
                      {user.customerProfile ? (
                        <form action={updateCustomerFeeWaiverAction} className="inline-form">
                          <input name="id" type="hidden" value={user.customerProfile.id} />
                          <input name="feeWaivedByUserId" type="hidden" value={user.id} />
                          <input
                            name="feesWaived"
                            type="hidden"
                            value={user.customerProfile.feesWaived ? "false" : "true"}
                          />
                          <label>
                            Buyer fee waiver
                            <input
                              name="feeWaiverReason"
                              placeholder="Reason"
                              defaultValue={user.customerProfile.feeWaiverReason ?? ""}
                            />
                          </label>
                          <button type="submit">
                            {user.customerProfile.feesWaived ? "Remove buyer waiver" : "Waive buyer fees"}
                          </button>
                          {user.customerProfile.feesWaived ? <StatusBadge>WAIVED</StatusBadge> : null}
                        </form>
                      ) : null}
                      {user.shopperProfile ? (
                        <form action={updateShopperFeeWaiverAction} className="inline-form">
                          <input name="id" type="hidden" value={user.shopperProfile.id} />
                          <input name="feeWaivedByUserId" type="hidden" value={user.id} />
                          <input
                            name="feesWaived"
                            type="hidden"
                            value={user.shopperProfile.feesWaived ? "false" : "true"}
                          />
                          <label>
                            Shopper fee waiver
                            <input
                              name="feeWaiverReason"
                              placeholder="Reason"
                              defaultValue={user.shopperProfile.feeWaiverReason ?? ""}
                            />
                          </label>
                          <button type="submit">
                            {user.shopperProfile.feesWaived ? "Remove shopper waiver" : "Waive shopper fees"}
                          </button>
                          {user.shopperProfile.feesWaived ? <StatusBadge>WAIVED</StatusBadge> : null}
                        </form>
                      ) : null}
                    </div>
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
