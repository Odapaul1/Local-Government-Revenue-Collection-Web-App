import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import {
  users,
  lgas,
  revenueCategories,
  payers,
  transactions,
  transactionStatusHistory,
  receipts,
  auditLogs,
  notifications,
} from "../drizzle/schema";
import {
  mockLGAs,
  mockCategories,
  mockUsers,
  mockPayers,
  mockTransactions,
  mockReceipts,
  mockNotifications,
  mockAuditLogs,
  mockStatusHistory,
} from "./mockData";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function main() {
  console.log("🌱 Starting full database seed...\n");

  // Disable foreign key checks
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

  // Truncate tables
  const tables = [
    { name: "audit_logs", table: auditLogs },
    { name: "notifications", table: notifications },
    { name: "receipts", table: receipts },
    { name: "transaction_status_history", table: transactionStatusHistory },
    { name: "transactions", table: transactions },
    { name: "payers", table: payers },
    { name: "revenue_categories", table: revenueCategories },
    { name: "users", table: users },
    { name: "lgas", table: lgas },
  ];

  for (const { name, table } of tables) {
    console.log(`🧹 Cleaning table ${name}...`);
    try {
      await db.delete(table);
    } catch (err: any) {
      console.warn(`  ⚠ Failed to clean ${name}:`, err.message);
    }
  }

  // 1. Seed LGAs
  console.log(`📍 Seeding ${mockLGAs.length} LGAs...`);
  await db.insert(lgas).values(mockLGAs.map(l => ({
    id: l.id,
    name: l.name,
    state: l.state,
    code: l.code,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  })));

  // 2. Seed Revenue Categories
  console.log(`💰 Seeding ${mockCategories.length} revenue categories...`);
  await db.insert(revenueCategories).values(mockCategories.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    amountType: c.amountType,
    fixedAmount: c.fixedAmount ? c.fixedAmount.toString() : null,
    calculationLogic: c.calculationLogic,
    applicableLgas: c.applicableLgas,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  })));

  // 3. Seed Users
  console.log(`👤 Seeding ${mockUsers.length} users...`);
  await db.insert(users).values(mockUsers.map(u => ({
    id: u.id,
    openId: u.openId,
    name: u.name,
    email: u.email,
    role: u.role,
    lgaId: u.lgaId,
    isActive: u.isActive,
    loginMethod: u.loginMethod,
    lastSignedIn: u.lastSignedIn,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  })));

  // 4. Seed Payers
  console.log(`🏢 Seeding ${mockPayers.length} payers...`);
  await db.insert(payers).values(mockPayers.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    contactDetails: p.contactDetails,
    taxpayerId: p.taxpayerId,
    lgaId: p.lgaId,
    payerType: p.payerType,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  })));

  // 5. Seed Transactions
  console.log(`💸 Seeding ${mockTransactions.length} transactions...`);
  await db.insert(transactions).values(mockTransactions.map(t => ({
    id: t.id,
    payerId: t.payerId,
    revenueCategoryId: t.revenueCategoryId,
    amountDue: t.amountDue.toString(),
    amountPaid: t.amountPaid.toString(),
    status: t.status,
    paymentReference: t.paymentReference,
    remitaRRR: t.remitaRRR,
    collectorId: t.collectorId,
    lgaId: t.lgaId,
    description: t.description,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    paidAt: t.paidAt,
  })));

  // 6. Seed Receipts
  console.log(`📄 Seeding ${mockReceipts.length} receipts...`);
  await db.insert(receipts).values(mockReceipts.map(r => ({
    id: r.id,
    transactionId: r.transactionId,
    receiptNumber: r.receiptNumber,
    pdfUrl: r.pdfUrl,
    generatedAt: r.generatedAt,
    downloadedAt: r.downloadedAt,
    downloadCount: r.downloadCount,
  })));

  // 7. Seed Notifications
  console.log(`🔔 Seeding ${mockNotifications.length} notifications...`);
  await db.insert(notifications).values(mockNotifications.map(n => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    isRead: n.isRead,
    createdAt: n.createdAt,
    readAt: n.readAt,
  })));

  // 8. Seed Audit Logs
  console.log(`🔍 Seeding ${mockAuditLogs.length} audit logs...`);
  await db.insert(auditLogs).values(mockAuditLogs.map(a => ({
    id: a.id,
    userId: a.userId,
    action: a.action,
    entityType: a.entityType,
    entityId: a.entityId,
    oldValues: a.oldValues,
    newValues: a.newValues,
    ipAddress: a.ipAddress,
    userAgent: a.userAgent,
    timestamp: a.timestamp,
  })));

  // 9. Seed Status History
  console.log(`⏳ Seeding ${mockStatusHistory.length} status history...`);
  await db.insert(transactionStatusHistory).values(mockStatusHistory.map(h => ({
    id: h.id,
    transactionId: h.transactionId,
    oldStatus: h.oldStatus,
    newStatus: h.newStatus,
    changedBy: h.changedBy,
    reason: h.reason,
    changedAt: h.changedAt,
  })));

  // Re-enable foreign key checks
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  console.log("\n🎉 Full database seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
