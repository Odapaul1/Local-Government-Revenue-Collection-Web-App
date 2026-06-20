import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  router,
  protectedProcedure,
  superAdminProcedure,
  lgaAdminProcedure,
  auditorProcedure,
} from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { scryptSync, randomBytes, randomUUID } from "crypto";
import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";
import { sendEmail } from "./email";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const [salt, key] = user.password.split(":");
        if (!salt || !key) {
           throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid account configuration" });
        }
        
        const hashedBuffer = scryptSync(input.password, salt, 64);
        if (hashedBuffer.toString("hex") !== key) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { success: true };
      }),
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["Super Admin", "LGA Admin", "Revenue Collector", "Auditor"]),
        lgaId: z.number().optional().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email is already registered" });
        }

        const salt = randomBytes(16).toString("hex");
        const hashedBuffer = scryptSync(input.password, salt, 64);
        const hashedPassword = `${salt}:${hashedBuffer.toString("hex")}`;
        
        const openId = randomUUID();
        
        await db.upsertUser({
          openId,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          loginMethod: "local",
          role: input.role,
          lgaId: input.lgaId || null,
        });
        
        return { success: true };
      }),
  }),

  /**
   * LGA Management
   */
  lga: router({
    list: publicProcedure.query(async () => {
      return db.getAllLGAs();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLGAById(input.id);
      }),
    create: superAdminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          state: z.string().min(1),
          code: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createLGA(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "lga",
          newValues: input,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
  }),

  /**
   * Revenue Category Management
   */
  revenueCategory: router({
    list: protectedProcedure.query(async () => {
      return db.getAllRevenueCategories();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getRevenueCategoryById(input.id);
      }),
    create: superAdminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          amountType: z.enum(["fixed", "variable"]),
          fixedAmount: z.string().optional(),
          calculationLogic: z.string().optional(),
          applicableLgas: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createRevenueCategory({
          name: input.name,
          description: input.description || null,
          amountType: input.amountType,
          fixedAmount: input.fixedAmount ? parseFloat(input.fixedAmount) : (null as any),
          calculationLogic: input.calculationLogic || null,
          applicableLgas: input.applicableLgas || (null as any),
          isActive: true,
        });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "revenue_category",
          newValues: input,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
    update: superAdminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          amountType: z.enum(["fixed", "variable"]).optional(),
          fixedAmount: z.string().optional(),
          calculationLogic: z.string().optional(),
          applicableLgas: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getRevenueCategoryById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined)
          updateData.description = input.description || null;
        if (input.amountType) updateData.amountType = input.amountType;
        if (input.fixedAmount !== undefined)
          updateData.fixedAmount = input.fixedAmount ? parseFloat(input.fixedAmount) : null;
        if (input.calculationLogic !== undefined)
          updateData.calculationLogic = input.calculationLogic || null;
        if (input.applicableLgas !== undefined)
          updateData.applicableLgas = input.applicableLgas || null;

        const result = await db.updateRevenueCategory(input.id, updateData);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "revenue_category",
          entityId: input.id,
          oldValues: existing,
          newValues: updateData,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
    delete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getRevenueCategoryById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        const result = await db.deleteRevenueCategory(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "revenue_category",
          entityId: input.id,
          oldValues: existing,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
  }),

  /**
   * Payer Management
   */
  payer: router({
    list: protectedProcedure
      .input(z.object({ lgaId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        let lgaId = input.lgaId;
        if (
          ctx.user.role === "LGA Admin" ||
          ctx.user.role === "Revenue Collector"
        ) {
          if (ctx.user.lgaId && input.lgaId && input.lgaId !== ctx.user.lgaId) {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          lgaId = ctx.user.lgaId || undefined;
        }
        return db.getAllPayers(lgaId);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const payer = await db.getPayerById(input.id);
        if (!payer) throw new TRPCError({ code: "NOT_FOUND" });

        if (
          (ctx.user.role === "LGA Admin" ||
            ctx.user.role === "Revenue Collector") &&
          ctx.user.lgaId &&
          payer.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return payer;
      }),
    getPaymentHistory: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const payer = await db.getPayerById(input.id);
        if (!payer) throw new TRPCError({ code: "NOT_FOUND" });

        if (
          (ctx.user.role === "LGA Admin" ||
            ctx.user.role === "Revenue Collector") &&
          ctx.user.lgaId &&
          payer.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getTransactionsByPayerId(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          address: z.string().optional(),
          contactDetails: z.string().optional(),
          taxpayerId: z.string().optional(),
          lgaId: z.number().optional().nullable(),
          payerType: z.enum(["individual", "business", "organization"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role === "Revenue Collector" || ctx.user.role === "Auditor") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (
          ctx.user.role === "LGA Admin" &&
          ctx.user.lgaId &&
          input.lgaId &&
          input.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.createPayer({
          name: input.name,
          address: input.address || null,
          contactDetails: input.contactDetails || null,
          taxpayerId: input.taxpayerId || null,
          lgaId: input.lgaId || null,
          payerType: input.payerType,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "payer",
          newValues: input,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });

        return result;
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          address: z.string().optional(),
          contactDetails: z.string().optional(),
          taxpayerId: z.string().optional(),
          payerType: z.enum(["individual", "business", "organization"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getPayerById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        if (ctx.user.role === "Revenue Collector" || ctx.user.role === "Auditor") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (
          ctx.user.role === "LGA Admin" &&
          ctx.user.lgaId &&
          existing.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.address !== undefined) updateData.address = input.address || null;
        if (input.contactDetails !== undefined)
          updateData.contactDetails = input.contactDetails || null;
        if (input.taxpayerId !== undefined)
          updateData.taxpayerId = input.taxpayerId || null;
        if (input.payerType) updateData.payerType = input.payerType;

        const result = await db.updatePayer(input.id, updateData);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "payer",
          entityId: input.id,
          oldValues: existing,
          newValues: updateData,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });

        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getPayerById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        if (ctx.user.role === "Revenue Collector" || ctx.user.role === "Auditor") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (
          ctx.user.role === "LGA Admin" &&
          ctx.user.lgaId &&
          existing.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.deletePayer(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "payer",
          entityId: input.id,
          oldValues: existing,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });

        return result;
      }),
  }),

  /**
   * Transaction Management
   */
  transaction: router({
    list: protectedProcedure
      .input(
        z.object({
          lgaId: z.number().optional(),
          status: z.enum(["pending", "paid", "failed"]).optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        let lgaId = input.lgaId;
        if (
          ctx.user.role === "LGA Admin" ||
          ctx.user.role === "Revenue Collector"
        ) {
          if (ctx.user.lgaId && input.lgaId && input.lgaId !== ctx.user.lgaId) {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          lgaId = ctx.user.lgaId || undefined;
        }

        return db.getAllTransactions({
          lgaId,
          status: input.status,
        });
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const transaction = await db.getTransactionById(input.id);
        if (!transaction) throw new TRPCError({ code: "NOT_FOUND" });

        if (
          (ctx.user.role === "LGA Admin" ||
            ctx.user.role === "Revenue Collector") &&
          ctx.user.lgaId &&
          transaction.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return transaction;
      }),
    getStatusHistory: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTransactionStatusHistory(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          payerId: z.number(),
          revenueCategoryId: z.number(),
          amountDue: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "Revenue Collector" && ctx.user.role !== "LGA Admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const payer = await db.getPayerById(input.payerId);
        if (!payer) throw new TRPCError({ code: "NOT_FOUND" });
        if (payer.lgaId === null || payer.lgaId === undefined) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Payer LGA is required to create a transaction." });
        }

        if (
          ctx.user.role === "Revenue Collector" &&
          ctx.user.lgaId &&
          payer.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const revenueCategory = await db.getRevenueCategoryById(
          input.revenueCategoryId
        );
        if (!revenueCategory) throw new TRPCError({ code: "NOT_FOUND" });

        const result = await db.createTransaction({
          payerId: input.payerId,
          revenueCategoryId: input.revenueCategoryId,
          amountDue: parseFloat(input.amountDue) as any,
          amountPaid: 0 as any,
          status: "pending",
          collectorId: ctx.user.id,
          lgaId: payer.lgaId,
          description: input.description || null,
        });

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "transaction",
          newValues: input as any,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });

        return result;
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "paid", "failed"]),
          reason: z.string().optional(),
          amountPaid: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only LGA Admin and Super Admin can update status
        if (ctx.user.role === "Revenue Collector" || ctx.user.role === "Auditor") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const transaction = await db.getTransactionById(input.id);
        if (!transaction) throw new TRPCError({ code: "NOT_FOUND" });

        if (
          ctx.user.role === "LGA Admin" &&
          ctx.user.lgaId &&
          transaction.lgaId !== ctx.user.lgaId
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.updateTransactionStatus(
          input.id,
          input.status,
          ctx.user.id,
          input.reason,
          input.amountPaid
        );

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE_STATUS",
          entityType: "transaction",
          entityId: input.id,
          oldValues: { status: transaction.status } as any,
          newValues: { status: input.status } as any,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });

        // Trigger notifications for paid/failed transactions
        if (input.status === "paid" || input.status === "failed") {
          // Notify the collector
          const message = input.status === "paid"
            ? `Transaction #${input.id} for ${transaction.payerName || "payer"} has been marked as paid.`
            : `Transaction #${input.id} for ${transaction.payerName || "payer"} has been marked as failed.${input.reason ? ` Reason: ${input.reason}` : ""}`;

          await db.createNotification({
            userId: transaction.collectorId,
            type: input.status === "paid" ? "payment_confirmation" : "payment_failure",
            title: input.status === "paid" ? "Payment Confirmed" : "Payment Failed",
            message,
            relatedEntityType: "transaction",
            relatedEntityId: input.id,
          });

          // Fetch the collector user to get their email address and send notification email
          try {
            const collector = await db.getUserById(transaction.collectorId);
            if (collector && collector.email) {
              await sendEmail({
                to: collector.email,
                subject: input.status === "paid" ? "Payment Confirmed" : "Payment Failed",
                text: message,
              });
            }
          } catch (err) {
            console.error("Failed to send notification email:", err);
          }
        }

        return result;
      }),
  }),

  /**
   * Report & Analytics
   */
  report: router({
    kpi: protectedProcedure
      .input(
        z.object({
          lgaId: z.number().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        // LGA-scoped users can only see their LGA
        let lgaId = input.lgaId;
        if (ctx.user.role === "LGA Admin" || ctx.user.role === "Revenue Collector") {
          lgaId = ctx.user.lgaId || undefined;
        }

        return db.getKPIStats({
          lgaId,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
      }),
  }),

  /**
   * User Management
   */
  user: router({
    list: superAdminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getUserById(input.id);
      }),
    create: superAdminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          role: z
            .enum(["Super Admin", "LGA Admin", "Revenue Collector", "Auditor"])
            .default("Revenue Collector"),
          lgaId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const tempOpenId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = await db.upsertUser({
          openId: tempOpenId,
          name: input.name,
          email: input.email || null,
          role: input.role,
          lgaId: input.lgaId || null,
        });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "user",
          newValues: input,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
    update: superAdminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z
            .enum(["Super Admin", "LGA Admin", "Revenue Collector", "Auditor"])
            .optional(),
          lgaId: z.number().optional().nullable(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.role) updateData.role = input.role;
        if (input.lgaId !== undefined) updateData.lgaId = input.lgaId;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const result = await db.updateUser(input.id, updateData);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "user",
          entityId: input.id,
          oldValues: existing,
          newValues: updateData,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });

        return result;
      }),
    delete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        if (existing.id === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete your own user account",
          });
        }

        const result = await db.updateUser(input.id, { isActive: false });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "user",
          entityId: input.id,
          oldValues: existing,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
  }),

  /**
   * Audit Logs
   */
  auditLog: router({
    list: auditorProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          entityType: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getAuditLogs({
          userId: input.userId,
          entityType: input.entityType,
        });
      }),
  }),

  /**
   * Receipts
   */
  receipt: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getReceiptsByUser(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getReceiptById(input.id);
      }),
    getByTransactionId: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(async ({ input }) => {
        return db.getReceiptByTransactionId(input.transactionId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          transactionId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if receipt already exists
        const existing = await db.getReceiptByTransactionId(input.transactionId);
        if (existing) return existing;

        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction) throw new TRPCError({ code: "NOT_FOUND" });
        if (transaction.status !== "paid") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Receipts can only be generated for paid transactions.",
          });
        }

        const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-8).toUpperCase()}`;
        const result = await db.createReceipt({
          transactionId: input.transactionId,
          receiptNumber,
          generatedAt: new Date(),
        });
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "receipt",
          newValues: { receiptNumber, transactionId: input.transactionId },
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        });
        return result;
      }),
  }),

  /**
   * Notifications
   */
  notification: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserNotifications(ctx.user.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.markNotificationAsRead(input.id);
      }),
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return db.markAllNotificationsAsRead(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
