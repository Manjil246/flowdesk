import mongoose, { Schema, type InferSchemaType } from "mongoose";

const contactInquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    subject: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
    },
  },
  { timestamps: true, collection: "contact_inquiries" },
);

contactInquirySchema.index({ status: 1, createdAt: -1 });
contactInquirySchema.index({ email: 1, createdAt: -1 });

export type ContactInquiryDoc = InferSchemaType<typeof contactInquirySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ContactInquiry =
  mongoose.models.ContactInquiry ??
  mongoose.model("ContactInquiry", contactInquirySchema);
