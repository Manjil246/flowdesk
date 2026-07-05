import mongoose from "mongoose";
import {
  ContactInquiry,
  type ContactInquiryDoc,
} from "../models/contact-inquiry.model";

export type ContactInquiryLean = ContactInquiryDoc & {
  _id: mongoose.Types.ObjectId;
};

export type ContactInquiryStatus = "new" | "read" | "archived";

export class ContactInquiryRepository {
  async create(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<ContactInquiryLean> {
    const doc = await ContactInquiry.create(data);
    return doc.toObject() as ContactInquiryLean;
  }

  async list(params: {
    status?: ContactInquiryStatus;
    skip: number;
    limit: number;
  }): Promise<{ rows: ContactInquiryLean[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.status) filter.status = params.status;

    const [rows, total] = await Promise.all([
      ContactInquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(params.skip)
        .limit(params.limit)
        .lean<ContactInquiryLean[]>(),
      ContactInquiry.countDocuments(filter),
    ]);

    return { rows, total };
  }

  async findById(id: string): Promise<ContactInquiryLean | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    return ContactInquiry.findById(id).lean<ContactInquiryLean>();
  }

  async updateStatus(
    id: string,
    status: ContactInquiryStatus,
  ): Promise<ContactInquiryLean | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    return ContactInquiry.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    ).lean<ContactInquiryLean>();
  }
}
