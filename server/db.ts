import { eq, desc, sql, and, gte, lte, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  lgas,
  revenueCategories,
  InsertRevenueCategory,
  payers,
  InsertPayer,
  transactions,
  InsertTransaction,
  transactionStatusHistory,
  auditLogs,
  InsertAuditLog,
  notifications,
  InsertNotification,
  receipts,
  InsertReceipt,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
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

let _db: ReturnType<typeof drizzle> | null = null;
let _dbChecked = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_dbChecked) return _db;

  if (process.env.DATABASE_URL) {
    try {
      const dbInstance = drizzle(process.env.DATABASE_URL);
      // Run a simple test query to verify connection
      await dbInstance.execute(sql`SELECT 1`);
      _db = dbInstance;
      console.log("[Database] Connected successfully to MySQL");
    } catch (error: any) {
      console.warn("[Database] Failed to connect to MySQL. Falling back to mock data.", error?.message || error);
      _db = null;
    }
  }
  _dbChecked = true;
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "password", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "Super Admin";
      updateSet.role = "Super Admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return mockUsers.find((u) => u.openId === openId);

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return mockUsers.find((u) => u.email === email);

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return mockUsers.find((u) => u.id === id);
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return mockUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return db.select().from(users).orderBy(users.name);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set(data).where(eq(users.id, id));
}

/**
 * LGA Queries
 */
export async function getAllLGAs() {
  const db = await getDb();
  if (!db) return mockLGAs;
  return db.select().from(lgas).orderBy(lgas.state, lgas.name);
}

export async function getLGAById(id: number) {
  const db = await getDb();
  if (!db) return mockLGAs.find((l) => l.id === id);
  const result = await db
    .select()
    .from(lgas)
    .where(eq(lgas.id, id))
    .limit(1);
  return result[0];
}

export async function createLGA(data: { name: string; state: string; code: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(lgas).values(data);
}

/**
 * Revenue Category Queries
 */
export async function getAllRevenueCategories() {
  const db = await getDb();
  if (!db) return mockCategories.filter((c) => c.isActive);
  return db
    .select()
    .from(revenueCategories)
    .where(eq(revenueCategories.isActive, true))
    .orderBy(revenueCategories.name);
}

export async function getRevenueCategoryById(id: number) {
  const db = await getDb();
  if (!db) return mockCategories.find((c) => c.id === id);
  const result = await db
    .select()
    .from(revenueCategories)
    .where(eq(revenueCategories.id, id))
    .limit(1);
  return result[0];
}

export async function createRevenueCategory(data: InsertRevenueCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(revenueCategories).values(data);
}

export async function updateRevenueCategory(
  id: number,
  data: Partial<InsertRevenueCategory>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(revenueCategories).set(data).where(eq(revenueCategories.id, id));
}

export async function deleteRevenueCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(revenueCategories)
    .set({ isActive: false })
    .where(eq(revenueCategories.id, id));
}

/**
 * Payer Queries
 */
export async function getAllPayers(lgaId?: number) {
  const db = await getDb();
  if (!db) {
    const result = lgaId ? mockPayers.filter((p) => p.lgaId === lgaId) : mockPayers;
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }
  let query: any = db
    .select({
      id: payers.id,
      name: payers.name,
      address: payers.address,
      contactDetails: payers.contactDetails,
      taxpayerId: payers.taxpayerId,
      lgaId: payers.lgaId,
      payerType: payers.payerType,
      createdAt: payers.createdAt,
      updatedAt: payers.updatedAt,
      lgaName: lgas.name,
      lgaState: lgas.state,
    })
    .from(payers)
    .leftJoin(lgas, eq(payers.lgaId, lgas.id));
  if (lgaId) {
    query = query.where(eq(payers.lgaId, lgaId));
  }
  return query.orderBy(payers.name);
}

export async function getPayerById(id: number) {
  const db = await getDb();
  if (!db) return mockPayers.find((p) => p.id === id);
  const result = await db
    .select({
      id: payers.id,
      name: payers.name,
      address: payers.address,
      contactDetails: payers.contactDetails,
      taxpayerId: payers.taxpayerId,
      lgaId: payers.lgaId,
      payerType: payers.payerType,
      createdAt: payers.createdAt,
      updatedAt: payers.updatedAt,
      lgaName: lgas.name,
      lgaState: lgas.state,
    })
    .from(payers)
    .leftJoin(lgas, eq(payers.lgaId, lgas.id))
    .where(eq(payers.id, id))
    .limit(1);
  return result[0];
}

export async function createPayer(data: InsertPayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(payers).values(data);
}

export async function updatePayer(id: number, data: Partial<InsertPayer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(payers).set(data).where(eq(payers.id, id));
}

export async function deletePayer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(payers).where(eq(payers.id, id));
}

/**
 * Transaction Queries
 */
export async function getAllTransactions(filters?: {
  lgaId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) {
    let result = [...mockTransactions];
    if (filters?.lgaId) result = result.filter((t) => t.lgaId === filters.lgaId);
    if (filters?.status) result = result.filter((t) => t.status === filters.status);
    if (filters?.startDate) result = result.filter((t) => t.createdAt >= filters.startDate!);
    if (filters?.endDate) result = result.filter((t) => t.createdAt <= filters.endDate!);
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const conditions: any[] = [];
  if (filters?.lgaId) conditions.push(eq(transactions.lgaId, filters.lgaId));
  if (filters?.status) conditions.push(eq(transactions.status, filters.status as any));
  if (filters?.startDate) conditions.push(gte(transactions.createdAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(transactions.createdAt, filters.endDate));

  const query = db
    .select({
      id: transactions.id,
      payerId: transactions.payerId,
      revenueCategoryId: transactions.revenueCategoryId,
      amountDue: transactions.amountDue,
      amountPaid: transactions.amountPaid,
      status: transactions.status,
      paymentReference: transactions.paymentReference,
      remitaRRR: transactions.remitaRRR,
      collectorId: transactions.collectorId,
      lgaId: transactions.lgaId,
      description: transactions.description,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      paidAt: transactions.paidAt,
      // Joined fields
      payerName: payers.name,
      payerType: payers.payerType,
      categoryName: revenueCategories.name,
      lgaName: lgas.name,
      collectorName: users.name,
    })
    .from(transactions)
    .leftJoin(payers, eq(transactions.payerId, payers.id))
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .leftJoin(users, eq(transactions.collectorId, users.id));

  if (conditions.length > 0) {
    return (query as any).where(and(...conditions)).orderBy(desc(transactions.createdAt));
  }
  return query.orderBy(desc(transactions.createdAt));
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return mockTransactions.find((t) => t.id === id);
  const result = await db
    .select({
      id: transactions.id,
      payerId: transactions.payerId,
      revenueCategoryId: transactions.revenueCategoryId,
      amountDue: transactions.amountDue,
      amountPaid: transactions.amountPaid,
      status: transactions.status,
      paymentReference: transactions.paymentReference,
      remitaRRR: transactions.remitaRRR,
      collectorId: transactions.collectorId,
      lgaId: transactions.lgaId,
      description: transactions.description,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      paidAt: transactions.paidAt,
      // Joined fields
      payerName: payers.name,
      payerType: payers.payerType,
      categoryName: revenueCategories.name,
      lgaName: lgas.name,
      collectorName: users.name,
    })
    .from(transactions)
    .leftJoin(payers, eq(transactions.payerId, payers.id))
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .leftJoin(users, eq(transactions.collectorId, users.id))
    .where(eq(transactions.id, id))
    .limit(1);
  return result[0];
}

export async function getTransactionsByPayerId(payerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: transactions.id,
      amountDue: transactions.amountDue,
      amountPaid: transactions.amountPaid,
      status: transactions.status,
      paymentReference: transactions.paymentReference,
      createdAt: transactions.createdAt,
      paidAt: transactions.paidAt,
      categoryName: revenueCategories.name,
      lgaName: lgas.name,
    })
    .from(transactions)
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .where(eq(transactions.payerId, payerId))
    .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}

export async function updateTransactionStatus(
  id: number,
  newStatus: string,
  changedBy: number,
  reason?: string,
  amountPaid?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const transaction = await getTransactionRaw(id);
  if (!transaction) throw new Error("Transaction not found");

  // Record status change in history
  await db.insert(transactionStatusHistory).values({
    transactionId: id,
    oldStatus: transaction.status as any,
    newStatus: newStatus as any,
    changedBy,
    reason,
  });

  // Update transaction status
  const updateData: any = { status: newStatus };
  if (newStatus === "paid") {
    updateData.paidAt = new Date();
    updateData.amountPaid = amountPaid ?? transaction.amountDue;
  }

  return db.update(transactions).set(updateData).where(eq(transactions.id, id));
}

export async function getTransactionStatusHistory(transactionId: number) {
  const db = await getDb();
  if (!db) return mockStatusHistory.filter((h) => h.transactionId === transactionId).sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  return db
    .select({
      id: transactionStatusHistory.id,
      oldStatus: transactionStatusHistory.oldStatus,
      newStatus: transactionStatusHistory.newStatus,
      reason: transactionStatusHistory.reason,
      changedAt: transactionStatusHistory.changedAt,
      changedByName: users.name,
    })
    .from(transactionStatusHistory)
    .leftJoin(users, eq(transactionStatusHistory.changedBy, users.id))
    .where(eq(transactionStatusHistory.transactionId, transactionId))
    .orderBy(desc(transactionStatusHistory.changedAt));
}

// Raw transaction fetch (no joins) for internal use
async function getTransactionRaw(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);
  return result[0];
}

/**
 * KPI / Reporting Queries
 */
export async function getKPIStats(filters?: { lgaId?: number; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) {
    let txs = [...mockTransactions];
    if (filters?.lgaId) txs = txs.filter((t) => t.lgaId === filters.lgaId);
    if (filters?.startDate) txs = txs.filter((t) => t.createdAt >= filters.startDate!);
    if (filters?.endDate) txs = txs.filter((t) => t.createdAt <= filters.endDate!);

    const totalCollected = txs.filter((t) => t.status === "paid").reduce((s, t) => s + parseFloat(t.amountPaid?.toString() || "0"), 0);
    const totalPending = txs.filter((t) => t.status === "pending").reduce((s, t) => s + parseFloat(t.amountDue?.toString() || "0"), 0);
    const totalFailed = txs.filter((t) => t.status === "failed").reduce((s, t) => s + parseFloat(t.amountDue?.toString() || "0"), 0);
    const totalDue = txs.reduce((s, t) => s + parseFloat(t.amountDue?.toString() || "0"), 0);

    // Revenue by category
    const byCategory: Record<string, { value: number; count: number }> = {};
    txs.filter((t) => t.status === "paid").forEach((t) => {
      const key = t.categoryName || "Unknown";
      if (!byCategory[key]) byCategory[key] = { value: 0, count: 0 };
      byCategory[key].value += parseFloat(t.amountPaid?.toString() || "0");
      byCategory[key].count++;
    });

    // Revenue by LGA
    const byLGA: Record<string, { value: number; count: number }> = {};
    txs.filter((t) => t.status === "paid").forEach((t) => {
      const key = t.lgaName || "Unknown";
      if (!byLGA[key]) byLGA[key] = { value: 0, count: 0 };
      byLGA[key].value += parseFloat(t.amountPaid?.toString() || "0");
      byLGA[key].count++;
    });

    return {
      totalCollected,
      totalPending,
      totalFailed,
      totalTransactions: txs.length,
      collectionRate: totalDue > 0 ? Math.round((totalCollected / totalDue) * 1000) / 10 : 0,
      revenueByCategory: Object.entries(byCategory).map(([name, v]) => ({ name, ...v })),
      revenueByLGA: Object.entries(byLGA).map(([name, v]) => ({ name, ...v })),
    };
  }

  const conditions: any[] = [];
  if (filters?.lgaId) conditions.push(eq(transactions.lgaId, filters.lgaId));
  if (filters?.startDate) conditions.push(gte(transactions.createdAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(transactions.createdAt, filters.endDate));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get all transactions with filter
  const allTxQuery = db.select({
    amountDue: transactions.amountDue,
    amountPaid: transactions.amountPaid,
    status: transactions.status,
  }).from(transactions);

  const allTx = whereClause
    ? await (allTxQuery as any).where(whereClause)
    : await allTxQuery;

  const totalCollected = allTx
    .filter((t: any) => t.status === "paid")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amountPaid?.toString() || "0"), 0);

  const totalPending = allTx
    .filter((t: any) => t.status === "pending")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amountDue?.toString() || "0"), 0);

  const totalFailed = allTx
    .filter((t: any) => t.status === "failed")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amountDue?.toString() || "0"), 0);

  const totalDue = allTx.reduce((sum: number, t: any) => sum + parseFloat(t.amountDue?.toString() || "0"), 0);
  const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

  // Revenue by Category
  const byCategoryQuery = db
    .select({
      categoryName: revenueCategories.name,
      totalAmount: sql<number>`SUM(CASE WHEN ${transactions.status} = 'paid' THEN CAST(${transactions.amountPaid} AS DECIMAL(12,2)) ELSE 0 END)`,
      transactionCount: sql<number>`COUNT(${transactions.id})`,
    })
    .from(transactions)
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .groupBy(revenueCategories.id, revenueCategories.name);

  const revenueByCategory = whereClause
    ? await (byCategoryQuery as any).where(whereClause)
    : await byCategoryQuery;

  // Revenue by LGA
  const byLGAQuery = db
    .select({
      lgaName: lgas.name,
      totalAmount: sql<number>`SUM(CASE WHEN ${transactions.status} = 'paid' THEN CAST(${transactions.amountPaid} AS DECIMAL(12,2)) ELSE 0 END)`,
      transactionCount: sql<number>`COUNT(${transactions.id})`,
    })
    .from(transactions)
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .groupBy(lgas.id, lgas.name);

  const revenueByLGA = whereClause
    ? await (byLGAQuery as any).where(whereClause)
    : await byLGAQuery;

  return {
    totalCollected,
    totalPending,
    totalFailed,
    totalTransactions: allTx.length,
    collectionRate: Math.round(collectionRate * 10) / 10,
    revenueByCategory: revenueByCategory.map((r: any) => ({
      name: r.categoryName || "Unknown",
      value: parseFloat(r.totalAmount?.toString() || "0"),
      count: Number(r.transactionCount),
    })),
    revenueByLGA: revenueByLGA.map((r: any) => ({
      name: r.lgaName || "Unknown",
      value: parseFloat(r.totalAmount?.toString() || "0"),
      count: Number(r.transactionCount),
    })),
  };
}

/**
 * Audit Log Queries
 */
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Audit log skipped — no DB connection");
    return;
  }
  return db.insert(auditLogs).values(data);
}

export async function getAuditLogs(filters?: {
  userId?: number;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) {
    let result = [...mockAuditLogs];
    if (filters?.userId) result = result.filter((l) => l.userId === filters.userId);
    if (filters?.entityType) result = result.filter((l) => l.entityType === filters.entityType);
    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  const conditions: any[] = [];
  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters?.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));

  const query = db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      timestamp: auditLogs.timestamp,
      userName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id));

  const result = conditions.length > 0
    ? await (query as any).where(and(...conditions)).orderBy(desc(auditLogs.timestamp))
    : await query.orderBy(desc(auditLogs.timestamp));

  return result;
}

/**
 * Notification Queries
 */
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Notification skipped — no DB connection");
    return;
  }
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return mockNotifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 50);
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return mockNotifications.filter((n) => n.userId === userId && !n.isRead).length;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(result[0]?.count || 0);
}

/**
 * Receipt Queries
 */
export async function createReceipt(data: InsertReceipt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(receipts).values(data);
}

export async function getReceiptByTransactionId(transactionId: number) {
  const db = await getDb();
  if (!db) return mockReceipts.find((r) => r.transactionId === transactionId);
  const result = await db
    .select({
      id: receipts.id,
      transactionId: receipts.transactionId,
      receiptNumber: receipts.receiptNumber,
      pdfUrl: receipts.pdfUrl,
      generatedAt: receipts.generatedAt,
      downloadedAt: receipts.downloadedAt,
      downloadCount: receipts.downloadCount,
      // Enriched fields from joined tables
      amountPaid: transactions.amountPaid,
      amountDue: transactions.amountDue,
      status: transactions.status,
      paymentReference: transactions.paymentReference,
      payerName: payers.name,
      payerType: payers.payerType,
      categoryName: revenueCategories.name,
      lgaName: lgas.name,
      collectorId: transactions.collectorId,
      paidAt: transactions.paidAt,
    })
    .from(receipts)
    .leftJoin(transactions, eq(receipts.transactionId, transactions.id))
    .leftJoin(payers, eq(transactions.payerId, payers.id))
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .where(eq(receipts.transactionId, transactionId))
    .limit(1);
  return result[0];
}

export async function updateReceiptDownloadCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(receipts)
    .set({
      downloadedAt: new Date(),
      downloadCount: sql`${receipts.downloadCount} + 1`,
    })
    .where(eq(receipts.id, id));
}

export async function getReceiptById(id: number) {
  const db = await getDb();
  if (!db) return mockReceipts.find((r) => r.id === id);
  const result = await db
    .select({
      id: receipts.id,
      transactionId: receipts.transactionId,
      receiptNumber: receipts.receiptNumber,
      pdfUrl: receipts.pdfUrl,
      generatedAt: receipts.generatedAt,
      downloadedAt: receipts.downloadedAt,
      downloadCount: receipts.downloadCount,
      // Enriched fields
      amountPaid: transactions.amountPaid,
      amountDue: transactions.amountDue,
      status: transactions.status,
      paymentReference: transactions.paymentReference,
      payerName: payers.name,
      payerType: payers.payerType,
      categoryName: revenueCategories.name,
      lgaName: lgas.name,
      paidAt: transactions.paidAt,
    })
    .from(receipts)
    .leftJoin(transactions, eq(receipts.transactionId, transactions.id))
    .leftJoin(payers, eq(transactions.payerId, payers.id))
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .where(eq(receipts.id, id))
    .limit(1);
  return result[0];
}

export async function getReceiptsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [...mockReceipts].sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  // Return all receipts with enriched data — no user filter needed (all users can view receipts)
  return db
    .select({
      id: receipts.id,
      transactionId: receipts.transactionId,
      receiptNumber: receipts.receiptNumber,
      pdfUrl: receipts.pdfUrl,
      generatedAt: receipts.generatedAt,
      downloadedAt: receipts.downloadedAt,
      downloadCount: receipts.downloadCount,
      // Enriched fields
      amountPaid: transactions.amountPaid,
      amountDue: transactions.amountDue,
      status: transactions.status,
      paymentReference: transactions.paymentReference,
      payerName: payers.name,
      payerType: payers.payerType,
      categoryName: revenueCategories.name,
      lgaName: lgas.name,
      paidAt: transactions.paidAt,
    })
    .from(receipts)
    .leftJoin(transactions, eq(receipts.transactionId, transactions.id))
    .leftJoin(payers, eq(transactions.payerId, payers.id))
    .leftJoin(revenueCategories, eq(transactions.revenueCategoryId, revenueCategories.id))
    .leftJoin(lgas, eq(transactions.lgaId, lgas.id))
    .orderBy(desc(receipts.generatedAt));
}
