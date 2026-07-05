import { DbNotReadyError, NotFoundError, BadRequestError } from "../errors/service.errors";
import { isMongoReady } from "../lib/db-ready";
import {
  ContactInquiryRepository,
  type ContactInquiryLean,
  type ContactInquiryStatus,
} from "../repositories/contact-inquiry.repository";
import type {
  ContactCreateBody,
  ContactListQuery,
} from "../validationSchemas/contact.VSchema";

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

export class ContactInquiryService {
  constructor(
    private readonly repo = new ContactInquiryRepository(),
  ) {}

  private normalizePhone(raw: string | undefined): string {
    const digits = (raw ?? "").replace(/\D/g, "").replace(/^977/, "");
    if (!digits) return "";
    if (!/^9\d{9}$/.test(digits)) {
      throw new BadRequestError(
        "Phone must be a 10-digit Nepal mobile number starting with 9",
      );
    }
    return digits;
  }

  private assertDb(): void {
    if (!isMongoReady()) {
      throw new DbNotReadyError("Database is not ready");
    }
  }

  private toDto(row: ContactInquiryLean): ContactInquiryDto {
    return {
      id: String(row._id),
      name: row.name,
      email: row.email,
      phone: row.phone ?? "",
      subject: row.subject ?? "",
      message: row.message,
      status: row.status as ContactInquiryStatus,
      createdAt: row.createdAt?.toISOString?.() ?? null,
      updatedAt: row.updatedAt?.toISOString?.() ?? null,
    };
  }

  async submit(body: ContactCreateBody): Promise<ContactInquiryDto> {
    this.assertDb();
    const row = await this.repo.create({
      name: body.name,
      email: body.email,
      phone: this.normalizePhone(body.phone),
      subject: body.subject ?? "",
      message: body.message,
    });
    return this.toDto(row);
  }

  async listForAdmin(
    query: ContactListQuery,
  ): Promise<{ inquiries: ContactInquiryDto[]; total: number; skip: number; limit: number }> {
    this.assertDb();
    const { rows, total } = await this.repo.list({
      status: query.status,
      skip: query.skip,
      limit: query.limit,
    });
    return {
      inquiries: rows.map((r) => this.toDto(r)),
      total,
      skip: query.skip,
      limit: query.limit,
    };
  }

  async getForAdmin(id: string): Promise<ContactInquiryDto> {
    this.assertDb();
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundError("Contact inquiry not found");
    return this.toDto(row);
  }

  async patchStatus(
    id: string,
    status: ContactInquiryStatus,
  ): Promise<ContactInquiryDto> {
    this.assertDb();
    const row = await this.repo.updateStatus(id, status);
    if (!row) throw new NotFoundError("Contact inquiry not found");
    return this.toDto(row);
  }
}
