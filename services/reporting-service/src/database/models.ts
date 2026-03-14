import { Schema } from 'mongoose';
import {
  paymentConn,
  studentConn,
  transactionConn,
  settlementConn,
  schoolConn,
} from './connections';

// ── Payment ──────────────────────────────────────────────────────────────────
const paymentSchema = new Schema({}, { strict: false, timestamps: true, collection: 'payments' });
export const PaymentModel = paymentConn.model('Payment', paymentSchema);

// ── Student & SPPBill ─────────────────────────────────────────────────────────
const studentSchema = new Schema({}, { strict: false, timestamps: true, collection: 'students' });
export const StudentModel = studentConn.model('Student', studentSchema);

const billSchema = new Schema({}, { strict: false, timestamps: true, collection: 'sppbills' });
export const BillModel = studentConn.model('SPPBill', billSchema);

// ── Transaction ───────────────────────────────────────────────────────────────
const txnSchema = new Schema({}, { strict: false, timestamps: true, collection: 'transactions' });
export const TransactionModel = transactionConn.model('Transaction', txnSchema);

// ── Settlement ────────────────────────────────────────────────────────────────
const settlementSchema = new Schema({}, { strict: false, timestamps: true, collection: 'settlements' });
export const SettlementModel = settlementConn.model('Settlement', settlementSchema);

// ── School ────────────────────────────────────────────────────────────────────
const schoolSchema = new Schema({}, { strict: false, timestamps: true, collection: 'schools' });
export const SchoolModel = schoolConn.model('School', schoolSchema);
