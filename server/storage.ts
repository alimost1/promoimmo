import { 
  users, properties, bookings, messages, housekeepingTasks, payments, otaIntegrations, analytics,
  type User, type InsertUser, type Property, type InsertProperty, type Booking, type InsertBooking,
  type Message, type InsertMessage, type HousekeepingTask, type InsertHousekeepingTask,
  type Payment, type InsertPayment, type OtaIntegration, type InsertOtaIntegration,
  type Analytics, type InsertAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, avg } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId?: string): Promise<User>;

  // Property methods
  getAllProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByOwner(ownerId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;

  // Booking methods
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  getRecentBookings(limit?: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;

  // Message methods
  getAllMessages(): Promise<Message[]>;
  getUnreadMessages(): Promise<Message[]>;
  getMessagesByBooking(bookingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;

  // Housekeeping methods
  getAllHousekeepingTasks(): Promise<HousekeepingTask[]>;
  getPendingHousekeepingTasks(): Promise<HousekeepingTask[]>;
  createHousekeepingTask(task: InsertHousekeepingTask): Promise<HousekeepingTask>;
  updateHousekeepingTask(id: number, task: Partial<InsertHousekeepingTask>): Promise<HousekeepingTask>;

  // Payment methods
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment>;

  // OTA Integration methods
  getAllOtaIntegrations(): Promise<OtaIntegration[]>;
  getOtaIntegrationsByProperty(propertyId: number): Promise<OtaIntegration[]>;
  createOtaIntegration(integration: InsertOtaIntegration): Promise<OtaIntegration>;
  updateOtaIntegration(id: number, integration: Partial<InsertOtaIntegration>): Promise<OtaIntegration>;

  // Analytics methods
  getAnalytics(propertyId?: number, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  getDashboardStats(): Promise<{
    totalProperties: number;
    activeBookings: number;
    occupancyRate: number;
    monthlyRevenue: number;
    unreadMessages: number;
    pendingTasks: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        ...(subscriptionId && { stripeSubscriptionId: subscriptionId })
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Property methods
  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.isActive, true));
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set(property)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.propertyId, propertyId));
  }

  async getRecentBookings(limit: number = 10): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Message methods
  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getUnreadMessages(): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.isRead, false));
  }

  async getMessagesByBooking(bookingId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.bookingId, bookingId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  // Housekeeping methods
  async getAllHousekeepingTasks(): Promise<HousekeepingTask[]> {
    return await db.select().from(housekeepingTasks).orderBy(desc(housekeepingTasks.createdAt));
  }

  async getPendingHousekeepingTasks(): Promise<HousekeepingTask[]> {
    return await db.select().from(housekeepingTasks).where(eq(housekeepingTasks.status, "pending"));
  }

  async createHousekeepingTask(task: InsertHousekeepingTask): Promise<HousekeepingTask> {
    const [newTask] = await db.insert(housekeepingTasks).values(task).returning();
    return newTask;
  }

  async updateHousekeepingTask(id: number, task: Partial<InsertHousekeepingTask>): Promise<HousekeepingTask> {
    const [updatedTask] = await db
      .update(housekeepingTasks)
      .set(task)
      .where(eq(housekeepingTasks.id, id))
      .returning();
    return updatedTask;
  }

  // Payment methods
  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // OTA Integration methods
  async getAllOtaIntegrations(): Promise<OtaIntegration[]> {
    return await db.select().from(otaIntegrations);
  }

  async getOtaIntegrationsByProperty(propertyId: number): Promise<OtaIntegration[]> {
    return await db.select().from(otaIntegrations).where(eq(otaIntegrations.propertyId, propertyId));
  }

  async createOtaIntegration(integration: InsertOtaIntegration): Promise<OtaIntegration> {
    const [newIntegration] = await db.insert(otaIntegrations).values(integration).returning();
    return newIntegration;
  }

  async updateOtaIntegration(id: number, integration: Partial<InsertOtaIntegration>): Promise<OtaIntegration> {
    const [updatedIntegration] = await db
      .update(otaIntegrations)
      .set(integration)
      .where(eq(otaIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  // Analytics methods
  async getAnalytics(propertyId?: number, startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    let query = db.select().from(analytics);
    
    const conditions = [];
    if (propertyId) conditions.push(eq(analytics.propertyId, propertyId));
    if (startDate) conditions.push(gte(analytics.date, startDate));
    if (endDate) conditions.push(lte(analytics.date, endDate));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(analytics.date));
    }
    
    return await query.orderBy(desc(analytics.date));
  }

  async getDashboardStats(): Promise<{
    totalProperties: number;
    activeBookings: number;
    occupancyRate: number;
    monthlyRevenue: number;
    unreadMessages: number;
    pendingTasks: number;
  }> {
    // Get total properties
    const [totalPropertiesResult] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.isActive, true));

    // Get active bookings (confirmed and checked_in)
    const [activeBookingsResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        eq(bookings.status, "confirmed"),
        gte(bookings.checkOutDate, new Date())
      ));

    // Get unread messages
    const [unreadMessagesResult] = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.isRead, false));

    // Get pending housekeeping tasks
    const [pendingTasksResult] = await db
      .select({ count: count() })
      .from(housekeepingTasks)
      .where(eq(housekeepingTasks.status, "pending"));

    // Get monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const [monthlyRevenueResult] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(
        eq(payments.status, "completed"),
        gte(payments.createdAt, currentMonth),
        lte(payments.createdAt, nextMonth)
      ));

    // Calculate occupancy rate (simplified)
    const occupancyRate = activeBookingsResult.count > 0 
      ? (activeBookingsResult.count / totalPropertiesResult.count) * 100 
      : 0;

    return {
      totalProperties: totalPropertiesResult.count,
      activeBookings: activeBookingsResult.count,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      monthlyRevenue: Number(monthlyRevenueResult.total || 0),
      unreadMessages: unreadMessagesResult.count,
      pendingTasks: pendingTasksResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
