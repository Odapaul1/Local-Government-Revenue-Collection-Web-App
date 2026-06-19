/**
 * In-memory mock data store for local development without a MySQL database.
 * Automatically used when DATABASE_URL is not reachable.
 */

const now = new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

export const mockLGAs = [
  { id: 1, name: "Ikeja", state: "Lagos", code: "LG-IKJ", createdAt: daysAgo(120), updatedAt: daysAgo(10) },
  { id: 2, name: "Eti-Osa", state: "Lagos", code: "LG-ETO", createdAt: daysAgo(120), updatedAt: daysAgo(10) },
  { id: 3, name: "Alimosho", state: "Lagos", code: "LG-ALM", createdAt: daysAgo(120), updatedAt: daysAgo(10) },
  { id: 4, name: "Nassarawa", state: "Kano", code: "KN-NSS", createdAt: daysAgo(100), updatedAt: daysAgo(5) },
  { id: 5, name: "Fagge", state: "Kano", code: "KN-FAG", createdAt: daysAgo(100), updatedAt: daysAgo(5) },
  { id: 6, name: "Garki", state: "Abuja FCT", code: "AB-GRK", createdAt: daysAgo(90), updatedAt: daysAgo(3) },
  { id: 7, name: "Wuse", state: "Abuja FCT", code: "AB-WUS", createdAt: daysAgo(90), updatedAt: daysAgo(3) },
];

export const mockCategories = [
  { id: 1, name: "Market Levy", description: "Daily/weekly levy for market traders", amountType: "fixed" as const, fixedAmount: 500, calculationLogic: null, applicableLgas: null, isActive: true, createdAt: daysAgo(100), updatedAt: daysAgo(5) },
  { id: 2, name: "Shop Rent", description: "Monthly rent for government-owned shops", amountType: "fixed" as const, fixedAmount: 15000, calculationLogic: null, applicableLgas: null, isActive: true, createdAt: daysAgo(100), updatedAt: daysAgo(5) },
  { id: 3, name: "Business Permit", description: "Annual permit for operating a business", amountType: "fixed" as const, fixedAmount: 25000, calculationLogic: null, applicableLgas: null, isActive: true, createdAt: daysAgo(100), updatedAt: daysAgo(5) },
  { id: 4, name: "Signage & Advertisement", description: "Fee for commercial signage and outdoor ads", amountType: "variable" as const, fixedAmount: null, calculationLogic: "Based on board size and placement", applicableLgas: null, isActive: true, createdAt: daysAgo(90), updatedAt: daysAgo(2) },
  { id: 5, name: "Land Use Charge", description: "Annual charge on property/land use", amountType: "variable" as const, fixedAmount: null, calculationLogic: "0.5% of assessed property value", applicableLgas: null, isActive: true, createdAt: daysAgo(90), updatedAt: daysAgo(2) },
  { id: 6, name: "Refuse Disposal Fee", description: "Monthly fee for solid waste collection", amountType: "fixed" as const, fixedAmount: 2000, calculationLogic: null, applicableLgas: null, isActive: true, createdAt: daysAgo(80), updatedAt: daysAgo(1) },
  { id: 7, name: "Vehicle Parking Levy", description: "Fee for commercial vehicle parking permits", amountType: "fixed" as const, fixedAmount: 3500, calculationLogic: null, applicableLgas: null, isActive: true, createdAt: daysAgo(80), updatedAt: daysAgo(1) },
];

export const mockUsers = [
  { id: 1, openId: "dev-admin-open-id", name: "Dev Admin", email: "admin@local.dev", password: null, role: "Super Admin" as const, lgaId: null, isActive: true, loginMethod: "local", lastSignedIn: now, createdAt: daysAgo(120), updatedAt: now },
  { id: 2, openId: "lga-admin-lagos", name: "Adebola Akinwale", email: "adebola@lagos.gov.ng", password: null, role: "LGA Admin" as const, lgaId: 1, isActive: true, loginMethod: "email", lastSignedIn: daysAgo(1), createdAt: daysAgo(100), updatedAt: daysAgo(1) },
  { id: 3, openId: "collector-ikeja-1", name: "Emeka Okonkwo", email: "emeka@lagos.gov.ng", password: null, role: "Revenue Collector" as const, lgaId: 1, isActive: true, loginMethod: "email", lastSignedIn: daysAgo(0), createdAt: daysAgo(90), updatedAt: daysAgo(0) },
  { id: 4, openId: "collector-eti-osa-1", name: "Fatimah Bello", email: "fatimah@lagos.gov.ng", password: null, role: "Revenue Collector" as const, lgaId: 2, isActive: true, loginMethod: "email", lastSignedIn: daysAgo(2), createdAt: daysAgo(85), updatedAt: daysAgo(2) },
  { id: 5, openId: "auditor-central", name: "Chukwudi Eze", email: "auditor@revenue.gov.ng", password: null, role: "Auditor" as const, lgaId: null, isActive: true, loginMethod: "email", lastSignedIn: daysAgo(3), createdAt: daysAgo(80), updatedAt: daysAgo(3) },
  { id: 6, openId: "lga-admin-kano", name: "Musa Haruna", email: "musa@kano.gov.ng", password: null, role: "LGA Admin" as const, lgaId: 4, isActive: true, loginMethod: "email", lastSignedIn: daysAgo(1), createdAt: daysAgo(70), updatedAt: daysAgo(1) },
];

export const mockPayers = [
  { id: 1, name: "Alhaji Suleiman Traders", address: "15 Balogun Market, Ikeja", contactDetails: "08012345678", taxpayerId: "TIN-001-IKJ", lgaId: 1, payerType: "business" as const, lgaName: "Ikeja", lgaState: "Lagos", createdAt: daysAgo(80), updatedAt: daysAgo(5) },
  { id: 2, name: "Grace Adeyemi", address: "22 Allen Avenue, Ikeja", contactDetails: "07023456789", taxpayerId: "TIN-002-IKJ", lgaId: 1, payerType: "individual" as const, lgaName: "Ikeja", lgaState: "Lagos", createdAt: daysAgo(75), updatedAt: daysAgo(4) },
  { id: 3, name: "Zenith Supermarket Ltd", address: "5 Ozumba Mbadiwe, Eti-Osa", contactDetails: "01-2345678", taxpayerId: "TIN-003-ETO", lgaId: 2, payerType: "business" as const, lgaName: "Eti-Osa", lgaState: "Lagos", createdAt: daysAgo(70), updatedAt: daysAgo(3) },
  { id: 4, name: "Victoria Traders Association", address: "VI Market Complex, Eti-Osa", contactDetails: "08034567890", taxpayerId: "TIN-004-ETO", lgaId: 2, payerType: "organization" as const, lgaName: "Eti-Osa", lgaState: "Lagos", createdAt: daysAgo(65), updatedAt: daysAgo(2) },
  { id: 5, name: "Dangote Properties", address: "Kano City, Nassarawa", contactDetails: "09045678901", taxpayerId: "TIN-005-KAN", lgaId: 4, payerType: "business" as const, lgaName: "Nassarawa", lgaState: "Kano", createdAt: daysAgo(60), updatedAt: daysAgo(1) },
  { id: 6, name: "Ibrahim Musa", address: "Hausawa Quarters, Fagge", contactDetails: "08056789012", taxpayerId: "TIN-006-KAN", lgaId: 5, payerType: "individual" as const, lgaName: "Fagge", lgaState: "Kano", createdAt: daysAgo(55), updatedAt: daysAgo(1) },
  { id: 7, name: "FCT Properties Ltd", address: "Central Business District, Garki", contactDetails: "09067890123", taxpayerId: "TIN-007-FCT", lgaId: 6, payerType: "business" as const, lgaName: "Garki", lgaState: "Abuja FCT", createdAt: daysAgo(50), updatedAt: daysAgo(1) },
  { id: 8, name: "Amaka Obi Enterprises", address: "Wuse Zone 5, Abuja", contactDetails: "08078901234", taxpayerId: "TIN-008-FCT", lgaId: 7, payerType: "business" as const, lgaName: "Wuse", lgaState: "Abuja FCT", createdAt: daysAgo(45), updatedAt: daysAgo(1) },
  { id: 9, name: "Olumide Akande", address: "10 Toyin Street, Ikeja", contactDetails: "07089012345", taxpayerId: null, lgaId: 1, payerType: "individual" as const, lgaName: "Ikeja", lgaState: "Lagos", createdAt: daysAgo(40), updatedAt: daysAgo(0) },
  { id: 10, name: "Alimosho Markets Cooperative", address: "Ikotun Market, Alimosho", contactDetails: "08090123456", taxpayerId: "TIN-010-ALM", lgaId: 3, payerType: "organization" as const, lgaName: "Alimosho", lgaState: "Lagos", createdAt: daysAgo(35), updatedAt: daysAgo(0) },
];

export const mockTransactions = [
  { id: 1, payerId: 1, revenueCategoryId: 2, amountDue: 15000, amountPaid: 15000, status: "paid" as const, paymentReference: "PAY-2024-0001", remitaRRR: null, collectorId: 3, lgaId: 1, description: "Shop rent - January 2024", createdAt: daysAgo(60), updatedAt: daysAgo(55), paidAt: daysAgo(55), payerName: "Alhaji Suleiman Traders", payerType: "business", categoryName: "Shop Rent", lgaName: "Ikeja", collectorName: "Emeka Okonkwo" },
  { id: 2, payerId: 2, revenueCategoryId: 1, amountDue: 500, amountPaid: 500, status: "paid" as const, paymentReference: "PAY-2024-0002", remitaRRR: null, collectorId: 3, lgaId: 1, description: "Market levy - week 1", createdAt: daysAgo(58), updatedAt: daysAgo(57), paidAt: daysAgo(57), payerName: "Grace Adeyemi", payerType: "individual", categoryName: "Market Levy", lgaName: "Ikeja", collectorName: "Emeka Okonkwo" },
  { id: 3, payerId: 3, revenueCategoryId: 3, amountDue: 25000, amountPaid: 25000, status: "paid" as const, paymentReference: "PAY-2024-0003", remitaRRR: null, collectorId: 4, lgaId: 2, description: "Annual business permit 2024", createdAt: daysAgo(50), updatedAt: daysAgo(48), paidAt: daysAgo(48), payerName: "Zenith Supermarket Ltd", payerType: "business", categoryName: "Business Permit", lgaName: "Eti-Osa", collectorName: "Fatimah Bello" },
  { id: 4, payerId: 4, revenueCategoryId: 4, amountDue: 45000, amountPaid: 0, status: "pending" as const, paymentReference: null, remitaRRR: null, collectorId: 4, lgaId: 2, description: "Signage fees - 3 billboards", createdAt: daysAgo(40), updatedAt: daysAgo(40), paidAt: null, payerName: "Victoria Traders Association", payerType: "organization", categoryName: "Signage & Advertisement", lgaName: "Eti-Osa", collectorName: "Fatimah Bello" },
  { id: 5, payerId: 5, revenueCategoryId: 5, amountDue: 120000, amountPaid: 120000, status: "paid" as const, paymentReference: "PAY-2024-0005", remitaRRR: null, collectorId: 3, lgaId: 4, description: "Land use charge - commercial plot", createdAt: daysAgo(35), updatedAt: daysAgo(30), paidAt: daysAgo(30), payerName: "Dangote Properties", payerType: "business", categoryName: "Land Use Charge", lgaName: "Nassarawa", collectorName: "Emeka Okonkwo" },
  { id: 6, payerId: 6, revenueCategoryId: 6, amountDue: 2000, amountPaid: 0, status: "failed" as const, paymentReference: null, remitaRRR: null, collectorId: 3, lgaId: 5, description: "Refuse disposal fee - March", createdAt: daysAgo(30), updatedAt: daysAgo(28), paidAt: null, payerName: "Ibrahim Musa", payerType: "individual", categoryName: "Refuse Disposal Fee", lgaName: "Fagge", collectorName: "Emeka Okonkwo" },
  { id: 7, payerId: 7, revenueCategoryId: 2, amountDue: 15000, amountPaid: 15000, status: "paid" as const, paymentReference: "PAY-2024-0007", remitaRRR: null, collectorId: 3, lgaId: 6, description: "Office space rent Q1", createdAt: daysAgo(25), updatedAt: daysAgo(22), paidAt: daysAgo(22), payerName: "FCT Properties Ltd", payerType: "business", categoryName: "Shop Rent", lgaName: "Garki", collectorName: "Emeka Okonkwo" },
  { id: 8, payerId: 8, revenueCategoryId: 7, amountDue: 3500, amountPaid: 0, status: "pending" as const, paymentReference: null, remitaRRR: null, collectorId: 4, lgaId: 7, description: "Parking levy - 1 commercial vehicle", createdAt: daysAgo(20), updatedAt: daysAgo(20), paidAt: null, payerName: "Amaka Obi Enterprises", payerType: "business", categoryName: "Vehicle Parking Levy", lgaName: "Wuse", collectorName: "Fatimah Bello" },
  { id: 9, payerId: 9, revenueCategoryId: 1, amountDue: 500, amountPaid: 500, status: "paid" as const, paymentReference: "PAY-2024-0009", remitaRRR: null, collectorId: 3, lgaId: 1, description: null, createdAt: daysAgo(15), updatedAt: daysAgo(14), paidAt: daysAgo(14), payerName: "Olumide Akande", payerType: "individual", categoryName: "Market Levy", lgaName: "Ikeja", collectorName: "Emeka Okonkwo" },
  { id: 10, payerId: 10, revenueCategoryId: 3, amountDue: 25000, amountPaid: 0, status: "pending" as const, paymentReference: null, remitaRRR: null, collectorId: 4, lgaId: 3, description: "Annual business permit 2024", createdAt: daysAgo(10), updatedAt: daysAgo(10), paidAt: null, payerName: "Alimosho Markets Cooperative", payerType: "organization", categoryName: "Business Permit", lgaName: "Alimosho", collectorName: "Fatimah Bello" },
  { id: 11, payerId: 1, revenueCategoryId: 6, amountDue: 2000, amountPaid: 2000, status: "paid" as const, paymentReference: "PAY-2024-0011", remitaRRR: null, collectorId: 3, lgaId: 1, description: "Refuse disposal - April", createdAt: daysAgo(7), updatedAt: daysAgo(6), paidAt: daysAgo(6), payerName: "Alhaji Suleiman Traders", payerType: "business", categoryName: "Refuse Disposal Fee", lgaName: "Ikeja", collectorName: "Emeka Okonkwo" },
  { id: 12, payerId: 3, revenueCategoryId: 7, amountDue: 3500, amountPaid: 0, status: "pending" as const, paymentReference: null, remitaRRR: null, collectorId: 4, lgaId: 2, description: "Delivery van parking permit", createdAt: daysAgo(3), updatedAt: daysAgo(3), paidAt: null, payerName: "Zenith Supermarket Ltd", payerType: "business", categoryName: "Vehicle Parking Levy", lgaName: "Eti-Osa", collectorName: "Fatimah Bello" },
];

export const mockReceipts = [
  { id: 1, transactionId: 1, receiptNumber: "RCP-2024-01234567", pdfUrl: null, generatedAt: daysAgo(55), downloadedAt: daysAgo(54), downloadCount: 2, amountPaid: 15000, amountDue: 15000, status: "paid", paymentReference: "PAY-2024-0001", payerName: "Alhaji Suleiman Traders", payerType: "business", categoryName: "Shop Rent", lgaName: "Ikeja", paidAt: daysAgo(55) },
  { id: 2, transactionId: 2, receiptNumber: "RCP-2024-12345678", pdfUrl: null, generatedAt: daysAgo(57), downloadedAt: null, downloadCount: 0, amountPaid: 500, amountDue: 500, status: "paid", paymentReference: "PAY-2024-0002", payerName: "Grace Adeyemi", payerType: "individual", categoryName: "Market Levy", lgaName: "Ikeja", paidAt: daysAgo(57) },
  { id: 3, transactionId: 3, receiptNumber: "RCP-2024-23456789", pdfUrl: null, generatedAt: daysAgo(48), downloadedAt: daysAgo(47), downloadCount: 1, amountPaid: 25000, amountDue: 25000, status: "paid", paymentReference: "PAY-2024-0003", payerName: "Zenith Supermarket Ltd", payerType: "business", categoryName: "Business Permit", lgaName: "Eti-Osa", paidAt: daysAgo(48) },
  { id: 4, transactionId: 5, receiptNumber: "RCP-2024-34567890", pdfUrl: null, generatedAt: daysAgo(30), downloadedAt: daysAgo(29), downloadCount: 3, amountPaid: 120000, amountDue: 120000, status: "paid", paymentReference: "PAY-2024-0005", payerName: "Dangote Properties", payerType: "business", categoryName: "Land Use Charge", lgaName: "Nassarawa", paidAt: daysAgo(30) },
  { id: 5, transactionId: 7, receiptNumber: "RCP-2024-45678901", pdfUrl: null, generatedAt: daysAgo(22), downloadedAt: null, downloadCount: 0, amountPaid: 15000, amountDue: 15000, status: "paid", paymentReference: "PAY-2024-0007", payerName: "FCT Properties Ltd", payerType: "business", categoryName: "Shop Rent", lgaName: "Garki", paidAt: daysAgo(22) },
  { id: 6, transactionId: 9, receiptNumber: "RCP-2024-56789012", pdfUrl: null, generatedAt: daysAgo(14), downloadedAt: null, downloadCount: 0, amountPaid: 500, amountDue: 500, status: "paid", paymentReference: "PAY-2024-0009", payerName: "Olumide Akande", payerType: "individual", categoryName: "Market Levy", lgaName: "Ikeja", paidAt: daysAgo(14) },
  { id: 7, transactionId: 11, receiptNumber: "RCP-2024-67890123", pdfUrl: null, generatedAt: daysAgo(6), downloadedAt: null, downloadCount: 0, amountPaid: 2000, amountDue: 2000, status: "paid", paymentReference: "PAY-2024-0011", payerName: "Alhaji Suleiman Traders", payerType: "business", categoryName: "Refuse Disposal Fee", lgaName: "Ikeja", paidAt: daysAgo(6) },
];

export const mockNotifications = [
  { id: 1, userId: 3, type: "payment_confirmation", title: "Payment Confirmed", message: "Transaction #1 for Alhaji Suleiman Traders has been marked as paid.", relatedEntityType: "transaction", relatedEntityId: 1, isRead: true, readAt: daysAgo(54), createdAt: daysAgo(55) },
  { id: 2, userId: 3, type: "payment_confirmation", title: "Payment Confirmed", message: "Transaction #2 for Grace Adeyemi has been marked as paid.", relatedEntityType: "transaction", relatedEntityId: 2, isRead: true, readAt: daysAgo(56), createdAt: daysAgo(57) },
  { id: 3, userId: 4, type: "payment_confirmation", title: "Payment Confirmed", message: "Transaction #3 for Zenith Supermarket Ltd has been marked as paid.", relatedEntityType: "transaction", relatedEntityId: 3, isRead: false, readAt: null, createdAt: daysAgo(48) },
  { id: 4, userId: 3, type: "payment_failure", title: "Payment Failed", message: "Transaction #6 for Ibrahim Musa has been marked as failed.", relatedEntityType: "transaction", relatedEntityId: 6, isRead: false, readAt: null, createdAt: daysAgo(28) },
  { id: 5, userId: 1, type: "payment_confirmation", title: "Payment Confirmed", message: "Transaction #5 for Dangote Properties has been marked as paid.", relatedEntityType: "transaction", relatedEntityId: 5, isRead: false, readAt: null, createdAt: daysAgo(30) },
];

export const mockAuditLogs = [
  { id: 1, userId: 1, action: "CREATE", entityType: "lga", entityId: null, oldValues: null, newValues: { name: "Ikeja", state: "Lagos", code: "LG-IKJ" }, timestamp: daysAgo(120), userName: "Dev Admin", ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0" },
  { id: 2, userId: 1, action: "CREATE", entityType: "revenue_category", entityId: null, oldValues: null, newValues: { name: "Market Levy", amountType: "fixed", fixedAmount: 500 }, timestamp: daysAgo(100), userName: "Dev Admin", ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0" },
  { id: 3, userId: 2, action: "CREATE", entityType: "payer", entityId: null, oldValues: null, newValues: { name: "Alhaji Suleiman Traders", payerType: "business" }, timestamp: daysAgo(80), userName: "Adebola Akinwale", ipAddress: "192.168.1.10", userAgent: "Mozilla/5.0" },
  { id: 4, userId: 3, action: "CREATE", entityType: "transaction", entityId: null, oldValues: null, newValues: { payerId: 1, amountDue: 15000 }, timestamp: daysAgo(60), userName: "Emeka Okonkwo", ipAddress: "192.168.1.11", userAgent: "Mozilla/5.0" },
  { id: 5, userId: 2, action: "UPDATE_STATUS", entityType: "transaction", entityId: 1, oldValues: { status: "pending" }, newValues: { status: "paid" }, timestamp: daysAgo(55), userName: "Adebola Akinwale", ipAddress: "192.168.1.10", userAgent: "Mozilla/5.0" },
  { id: 6, userId: 4, action: "CREATE", entityType: "transaction", entityId: null, oldValues: null, newValues: { payerId: 4, amountDue: 45000 }, timestamp: daysAgo(40), userName: "Fatimah Bello", ipAddress: "192.168.1.12", userAgent: "Mozilla/5.0" },
  { id: 7, userId: 2, action: "UPDATE_STATUS", entityType: "transaction", entityId: 6, oldValues: { status: "pending" }, newValues: { status: "failed" }, timestamp: daysAgo(28), userName: "Adebola Akinwale", ipAddress: "192.168.1.10", userAgent: "Mozilla/5.0" },
  { id: 8, userId: 1, action: "CREATE", entityType: "user", entityId: null, oldValues: null, newValues: { name: "Chukwudi Eze", role: "Auditor" }, timestamp: daysAgo(80), userName: "Dev Admin", ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0" },
];

export const mockStatusHistory = [
  { id: 1, transactionId: 1, oldStatus: "pending", newStatus: "paid", reason: "Bank transfer confirmed", changedBy: 2, changedAt: daysAgo(55), changedByName: "Adebola Akinwale" },
  { id: 2, transactionId: 2, oldStatus: "pending", newStatus: "paid", reason: null, changedBy: 2, changedAt: daysAgo(57), changedByName: "Adebola Akinwale" },
  { id: 3, transactionId: 3, oldStatus: "pending", newStatus: "paid", reason: "POS payment confirmed", changedBy: 2, changedAt: daysAgo(48), changedByName: "Adebola Akinwale" },
  { id: 4, transactionId: 5, oldStatus: "pending", newStatus: "paid", reason: "Bank draft verified", changedBy: 6, changedAt: daysAgo(30), changedByName: "Musa Haruna" },
  { id: 5, transactionId: 6, oldStatus: "pending", newStatus: "failed", reason: "Cheque bounced", changedBy: 6, changedAt: daysAgo(28), changedByName: "Musa Haruna" },
  { id: 6, transactionId: 7, oldStatus: "pending", newStatus: "paid", reason: "Cash payment received", changedBy: 2, changedAt: daysAgo(22), changedByName: "Adebola Akinwale" },
  { id: 7, transactionId: 9, oldStatus: "pending", newStatus: "paid", reason: null, changedBy: 2, changedAt: daysAgo(14), changedByName: "Adebola Akinwale" },
  { id: 8, transactionId: 11, oldStatus: "pending", newStatus: "paid", reason: "Mobile transfer confirmed", changedBy: 2, changedAt: daysAgo(6), changedByName: "Adebola Akinwale" },
];
