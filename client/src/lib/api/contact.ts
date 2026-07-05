import { adminFetch } from "@/lib/api/admin-fetch";
import { apiBaseUrl } from "@/lib/api/base";

const base = apiBaseUrl;

async function parseErr(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  return `HTTP ${res.status}`;
}

export type ContactInquiryStatus = "new" | "read" | "archived";

export type ContactInquiryDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactInquiryStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ContactInquiriesListResponse = {
  inquiries: ContactInquiryDto[];
  total: number;
  skip: number;
  limit: number;
};

export async function submitContactInquiry(body: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<ContactInquiryDto> {
  const res = await fetch(`${base()}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { inquiry: ContactInquiryDto };
  return data.inquiry;
}

export async function fetchContactInquiries(params: {
  status?: ContactInquiryStatus;
  skip?: number;
  limit?: number;
}): Promise<ContactInquiriesListResponse> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.skip != null) q.set("skip", String(params.skip));
  if (params.limit != null) q.set("limit", String(params.limit));
  const url = `${base()}/api/v1/contact${q.toString() ? `?${q}` : ""}`;
  const res = await adminFetch(url);
  if (!res.ok) throw new Error(await parseErr(res));
  return res.json() as Promise<ContactInquiriesListResponse>;
}

export async function fetchContactInquiry(
  inquiryId: string,
): Promise<ContactInquiryDto> {
  const res = await adminFetch(
    `${base()}/api/v1/contact/${encodeURIComponent(inquiryId)}`,
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { inquiry: ContactInquiryDto };
  return data.inquiry;
}

export async function updateContactInquiryStatus(
  inquiryId: string,
  status: ContactInquiryStatus,
): Promise<ContactInquiryDto> {
  const res = await adminFetch(
    `${base()}/api/v1/contact/${encodeURIComponent(inquiryId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (!res.ok) throw new Error(await parseErr(res));
  const data = (await res.json()) as { inquiry: ContactInquiryDto };
  return data.inquiry;
}
