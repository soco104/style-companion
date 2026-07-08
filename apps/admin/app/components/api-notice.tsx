import { getApiBaseUrl } from "../lib/api";

type ApiNoticeProps = {
  error?: string;
};

export function ApiNotice({ error }: ApiNoticeProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="notice" role="status">
      <strong>Backend unavailable.</strong> {error} Set <code>API_URL</code> if the Nest API is running somewhere other than{" "}
      <code>{getApiBaseUrl()}</code>.
    </div>
  );
}
