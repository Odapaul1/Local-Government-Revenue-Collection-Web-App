import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow with extended role-based access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["Super Admin", "LGA Admin", "Revenue Collector", "Auditor"]).default("Revenue Collector").notNull(),
  lgaId: int("lgaId"), // NULL for Super Admin, set for LGA Admin and Revenue Collector
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Local Government Areas (LGAs) table
 */
export const lgas = mysqlTable("lgas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  state: varchar("state", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LGA = typeof lgas.$inferSelect;
export type InsertLGA = typeof lgas.$inferInsert;

/**
 * Revenue Categories table
 */
export const revenueCategories = mysqlTable("revenue_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  amountType: mysqlEnum("amountType", ["fixed", "variable"]).notNull(),
  fixedAmount: decimal("fixedAmount", { precision: 12, scale: 2 }),
  calculationLogic: text("calculationLogic"), // For variable amounts, e.g., "percentage_of_property_value"
  applicableLgas: json("applicableLgas").$type<number[]>(), // Array of LGA IDs or null for all
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueCategory = typeof revenueCategories.$inferSelect;
export type InsertRevenueCategory = typeof revenueCategories.$inferInsert;

/**
 * Payers/Taxpayers table
 */
export const payers = mysqlTable("payers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  contactDetails: varchar("contactDetails", { length: 255 }),
  taxpayerId: varchar("taxpayerId", { length: 50 }).unique(),
  lgaId: int("lgaId"),
  payerType: mysqlEnum("payerType", ["individual", "business", "organization"]).default("individual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payer = typeof payers.$inferSelect;
export type InsertPayer = typeof payers.$inferInsert;

/**
 * Transactions table
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  payerId: int("payerId").notNull(),
  revenueCategoryId: int("revenueCategoryId").notNull(),
  amountDue: decimal("amountDue", { precision: 12, scale: 2 }).notNull(),
  amountPaid: decimal("amountPaid", { precision: 12, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["pending", "paid", "failed"]).default("pending").notNull(),
  paymentReference: varchar("paymentReference", { length: 100 }),
  remitaRRR: varchar("remitaRRR", { length: 50 }), // Remita Retrieval Reference
  collectorId: int("collectorId").notNull(),
  lgaId: int("lgaId").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Transaction Status History for audit trail
 */
export const transactionStatusHistory = mysqlTable("transaction_status_history", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  oldStatus: mysqlEnum("oldStatus", ["pending", "paid", "failed"]),
  newStatus: mysqlEnum("newStatus", ["pending", "paid", "failed"]).notNull(),
  changedBy: int("changedBy").notNull(),
  reason: text("reason"),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type TransactionStatusHistory = typeof transactionStatusHistory.$inferSelect;
export type InsertTransactionStatusHistory = typeof transactionStatusHistory.$inferInsert;

/**
 * Receipts table
 */
export const receipts = mysqlTable("receipts", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull().unique(),
  receiptNumber: varchar("receiptNumber", { length: 50 }).notNull().unique(),
  pdfUrl: text("pdfUrl"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  downloadedAt: timestamp("downloadedAt"),
  downloadCount: int("downloadCount").default(0),
});

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;

/**
 * Audit Logs table for immutable transaction and user action logging
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // e.g., "CREATE", "UPDATE", "DELETE", "PAYMENT_INITIATED", "PAYMENT_CONFIRMED"
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "transaction", "payer", "revenue_category"
  entityId: int("entityId"),
  oldValues: json("oldValues").$type<Record<string, unknown>>(),
  newValues: json("newValues").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["payment_confirmation", "payment_failure", "daily_summary", "system_alert"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // e.g., "transaction"
  relatedEntityId: int("relatedEntityId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Relations for foreign keys
 */
export const usersRelations = relations(users, ({ one }) => ({
  lga: one(lgas, {
    fields: [users.lgaId],
    references: [lgas.id],
  }),
}));

export const payersRelations = relations(payers, ({ one, many }) => ({
  lga: one(lgas, {
    fields: [payers.lgaId],
    references: [lgas.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  payer: one(payers, {
    fields: [transactions.payerId],
    references: [payers.id],
  }),
  revenueCategory: one(revenueCategories, {
    fields: [transactions.revenueCategoryId],
    references: [revenueCategories.id],
  }),
  collector: one(users, {
    fields: [transactions.collectorId],
    references: [users.id],
  }),
  lga: one(lgas, {
    fields: [transactions.lgaId],
    references: [lgas.id],
  }),
  receipt: one(receipts, {
    fields: [transactions.id],
    references: [receipts.transactionId],
  }),
  statusHistory: many(transactionStatusHistory),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  transaction: one(transactions, {
    fields: [receipts.transactionId],
    references: [transactions.id],
  }),
}));