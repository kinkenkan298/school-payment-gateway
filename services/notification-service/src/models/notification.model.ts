import mongoose, { Document, Schema } from 'mongoose';

export type NotificationChannel = 'email' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationType =
  | 'payment_success'
  | 'payment_failed'
  | 'payment_reminder'
  | 'bill_created';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  billId?: mongoose.Types.ObjectId;
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string; // email atau FCM token
  subject?: string;
  body: string;
  status: NotificationStatus;
  sentAt?: Date;
  failedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    schoolId: { type: Schema.Types.ObjectId, required: true },
    studentId: { type: Schema.Types.ObjectId, required: true },
    paymentId: { type: Schema.Types.ObjectId },
    billId: { type: Schema.Types.ObjectId },
    channel: { type: String, enum: ['email', 'push'], required: true },
    type: {
      type: String,
      enum: ['payment_success', 'payment_failed', 'payment_reminder', 'bill_created'],
      required: true,
    },
    recipient: { type: String, required: true },
    subject: { type: String },
    body: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: { type: Date },
    failedReason: { type: String },
  },
  { timestamps: true },
);

notificationSchema.index({ schoolId: 1, status: 1 });
notificationSchema.index({ studentId: 1 });
notificationSchema.index({ paymentId: 1 });

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
