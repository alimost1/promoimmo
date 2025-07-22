import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and roles
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"), // admin, owner, staff
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Properties table for rental units
export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  type: text("type").notNull(), // apartment, house, studio, etc.
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  maxGuests: integer("max_guests").notNull(),
  basePrice: real("base_price").notNull(),
  cleaningFee: real("cleaning_fee").default(0),
  ownerId: integer("owner_id").references(() => users.id),
  images: text("images"), // JSON string for SQLite
  amenities: text("amenities"), // JSON string for SQLite
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  airbnbId: text("airbnb_id"),
  bookingComId: text("booking_com_id"),
  vrboId: text("vrbo_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Bookings table for reservations
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").references(() => properties.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  checkInDate: integer("check_in_date", { mode: 'timestamp' }).notNull(),
  checkOutDate: integer("check_out_date", { mode: 'timestamp' }).notNull(),
  guests: integer("guests").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, checked_in, checked_out, cancelled
  source: text("source").notNull().default("direct"), // direct, airbnb, booking_com, vrbo
  externalBookingId: text("external_booking_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, refunded
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  specialRequests: text("special_requests"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Messages table for guest communication
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  propertyId: integer("property_id").references(() => properties.id),
  sender: text("sender").notNull(), // guest, host, system, ai
  senderName: text("sender_name"),
  senderEmail: text("sender_email"),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  source: text("source").default("direct"), // direct, airbnb, booking_com, whatsapp
  externalMessageId: text("external_message_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Housekeeping tasks
export const housekeepingTasks = sqliteTable("housekeeping_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").references(() => properties.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  taskType: text("task_type").notNull(), // cleaning, maintenance, inspection
  status: text("status").default("pending"), // pending, in_progress, completed
  dueDate: integer("due_date", { mode: 'timestamp' }),
  notes: text("notes"),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Payments table
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"), // stripe, cash, bank_transfer
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  processingFee: real("processing_fee"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// OTA integrations
export const otaIntegrations = sqliteTable("ota_integrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("platform").notNull(), // airbnb, booking_com, vrbo
  propertyId: integer("property_id").references(() => properties.id),
  externalPropertyId: text("external_property_id").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  lastSyncAt: integer("last_sync_at", { mode: 'timestamp' }),
  syncSettings: text("sync_settings"), // JSON string
  credentials: text("credentials"), // JSON string
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Analytics data
export const analytics = sqliteTable("analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").references(() => properties.id),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  occupancyRate: real("occupancy_rate"),
  revenue: real("revenue"),
  bookingsCount: integer("bookings_count").default(0),
  averageStay: real("average_stay"),
  source: text("source"), // daily, weekly, monthly
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  housekeepingTasks: many(housekeepingTasks),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  bookings: many(bookings),
  messages: many(messages),
  housekeepingTasks: many(housekeepingTasks),
  otaIntegrations: many(otaIntegrations),
  analytics: many(analytics),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  messages: many(messages),
  housekeepingTasks: many(housekeepingTasks),
  payments: many(payments),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  property: one(properties, {
    fields: [messages.propertyId],
    references: [properties.id],
  }),
}));

export const housekeepingTasksRelations = relations(housekeepingTasks, ({ one }) => ({
  property: one(properties, {
    fields: [housekeepingTasks.propertyId],
    references: [properties.id],
  }),
  booking: one(bookings, {
    fields: [housekeepingTasks.bookingId],
    references: [bookings.id],
  }),
  assignedUser: one(users, {
    fields: [housekeepingTasks.assignedTo],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const otaIntegrationsRelations = relations(otaIntegrations, ({ one }) => ({
  property: one(properties, {
    fields: [otaIntegrations.propertyId],
    references: [properties.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  property: one(properties, {
    fields: [analytics.propertyId],
    references: [properties.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertHousekeepingTaskSchema = createInsertSchema(housekeepingTasks).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertOtaIntegrationSchema = createInsertSchema(otaIntegrations).omit({ id: true, createdAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type HousekeepingTask = typeof housekeepingTasks.$inferSelect;
export type InsertHousekeepingTask = z.infer<typeof insertHousekeepingTaskSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type OtaIntegration = typeof otaIntegrations.$inferSelect;
export type InsertOtaIntegration = z.infer<typeof insertOtaIntegrationSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;