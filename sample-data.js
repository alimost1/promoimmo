// Sample data insertion script for CloudStay
import { db } from './server/db.js';
import { properties, bookings, messages, payments, housekeepingTasks, users, otaIntegrations, analytics } from './shared/schema.js';

async function insertSampleData() {
  console.log('Inserting sample data...');

  // Sample Properties
  const sampleProperties = await db.insert(properties).values([
    {
      name: "Downtown Luxury Loft",
      address: "123 Main St, Downtown, CA 90210",
      description: "Modern 2-bedroom loft in the heart of downtown with stunning city views, premium amenities, and walking distance to restaurants and entertainment.",
      type: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      basePrice: "189.00",
      cleaningFee: "75.00",
      images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
      amenities: ["wifi", "kitchen", "parking", "gym", "pool"],
      isActive: true
    },
    {
      name: "Cozy Beach House",
      address: "456 Ocean Ave, Malibu, CA 90265",
      description: "Charming 3-bedroom beach house just steps from the sand. Perfect for families with private deck, BBQ area, and ocean views.",
      type: "house",
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      basePrice: "299.00",
      cleaningFee: "100.00",
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
      amenities: ["wifi", "kitchen", "parking", "beach_access", "bbq"],
      isActive: true
    },
    {
      name: "Mountain Cabin Retreat",
      address: "789 Pine Ridge Rd, Big Bear, CA 92315",
      description: "Rustic cabin in the mountains with fireplace, hot tub, and hiking trails nearby. Perfect for a peaceful getaway.",
      type: "cabin",
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      basePrice: "159.00",
      cleaningFee: "60.00",
      images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"],
      amenities: ["wifi", "kitchen", "fireplace", "hot_tub", "hiking"],
      isActive: true
    },
    {
      name: "City Studio Apartment",
      address: "321 Urban Blvd, Los Angeles, CA 90028",
      description: "Modern studio in trendy neighborhood with all amenities. Perfect for business travelers and young professionals.",
      type: "studio",
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      basePrice: "129.00",
      cleaningFee: "45.00",
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
      amenities: ["wifi", "kitchen", "gym", "concierge"],
      isActive: true
    },
    {
      name: "Garden View Villa",
      address: "654 Garden Lane, Beverly Hills, CA 90210",
      description: "Elegant 4-bedroom villa with private garden, pool, and luxury finishes throughout. Ideal for special occasions.",
      type: "villa",
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      basePrice: "449.00",
      cleaningFee: "150.00",
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
      amenities: ["wifi", "kitchen", "parking", "pool", "garden", "luxury"],
      isActive: true
    }
  ]).returning();

  // Sample Users
  const sampleUsers = await db.insert(users).values([
    {
      username: "john_smith",
      email: "john.smith@email.com",
      password: "hashed_password_1",
      firstName: "John",
      lastName: "Smith",
      phone: "+1-555-0123",
      role: "owner"
    },
    {
      username: "sarah_wilson",
      email: "sarah.wilson@email.com", 
      password: "hashed_password_2",
      firstName: "Sarah",
      lastName: "Wilson",
      phone: "+1-555-0124",
      role: "staff"
    },
    {
      username: "admin",
      email: "admin@cloudstay.com",
      password: "hashed_password_3",
      firstName: "Admin",
      lastName: "User",
      phone: "+1-555-0100",
      role: "admin"
    }
  ]).returning();

  // Sample Bookings
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const sampleBookings = await db.insert(bookings).values([
    {
      propertyId: sampleProperties[0].id,
      guestName: "Emily Johnson",
      guestEmail: "emily.johnson@email.com",
      guestPhone: "+1-555-1001",
      checkInDate: today,
      checkOutDate: tomorrow,
      guests: 2,
      totalAmount: "378.00",
      status: "checked_in",
      source: "airbnb"
    },
    {
      propertyId: sampleProperties[1].id,
      guestName: "Michael Brown",
      guestEmail: "michael.brown@email.com",
      guestPhone: "+1-555-1002",
      checkInDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      checkOutDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      guests: 4,
      totalAmount: "997.00",
      status: "confirmed",
      source: "booking_com"
    },
    {
      propertyId: sampleProperties[2].id,
      guestName: "Lisa Davis",
      guestEmail: "lisa.davis@email.com",
      guestPhone: "+1-555-1003",
      checkInDate: nextWeek,
      checkOutDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      guests: 3,
      totalAmount: "537.00",
      status: "confirmed",
      source: "direct"
    },
    {
      propertyId: sampleProperties[3].id,
      guestName: "David Wilson",
      guestEmail: "david.wilson@email.com",
      guestPhone: "+1-555-1004",
      checkInDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      checkOutDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      guests: 1,
      totalAmount: "303.00",
      status: "completed",
      source: "vrbo"
    },
    {
      propertyId: sampleProperties[4].id,
      guestName: "Jennifer Lee",
      guestEmail: "jennifer.lee@email.com",
      guestPhone: "+1-555-1005",
      checkInDate: nextMonth,
      checkOutDate: new Date(nextMonth.getTime() + 4 * 24 * 60 * 60 * 1000),
      guests: 6,
      totalAmount: "1946.00",
      status: "pending",
      source: "airbnb"
    }
  ]).returning();

  // Sample Messages
  await db.insert(messages).values([
    {
      propertyId: sampleProperties[0].id,
      bookingId: sampleBookings[0].id,
      senderName: "Emily Johnson",
      senderEmail: "emily.johnson@email.com",
      message: "Hi! I'm checking in today. What time is check-in available? Also, is there parking available at the property?",
      source: "airbnb",
      isRead: false,
      createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
    },
    {
      propertyId: sampleProperties[1].id,
      bookingId: sampleBookings[1].id,
      senderName: "Michael Brown",
      senderEmail: "michael.brown@email.com",
      message: "Looking forward to our stay! Can you please send the check-in instructions? We'll be arriving around 4 PM.",
      source: "booking_com",
      isRead: true,
      createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      propertyId: sampleProperties[2].id,
      bookingId: sampleBookings[2].id,
      senderName: "Lisa Davis",
      senderEmail: "lisa.davis@email.com",
      message: "Hi there! We're excited about our mountain retreat next week. Are there any hiking recommendations nearby?",
      source: "direct",
      isRead: false,
      createdAt: new Date(today.getTime() - 5 * 60 * 60 * 1000)
    }
  ]);

  // Sample Payments
  await db.insert(payments).values([
    {
      bookingId: sampleBookings[0].id,
      amount: "378.00",
      status: "completed",
      paymentMethod: "card",
      transactionId: "tx_001",
      processingFee: "11.34",
      createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      bookingId: sampleBookings[1].id,
      amount: "997.00",
      status: "completed",
      paymentMethod: "card",
      transactionId: "tx_002",
      processingFee: "29.91",
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      bookingId: sampleBookings[2].id,
      amount: "537.00",
      status: "pending",
      paymentMethod: "card",
      transactionId: "tx_003",
      processingFee: "16.11",
      createdAt: new Date(today.getTime() - 12 * 60 * 60 * 1000)
    },
    {
      bookingId: sampleBookings[3].id,
      amount: "303.00",
      status: "completed",
      paymentMethod: "card",
      transactionId: "tx_004",
      processingFee: "9.09",
      createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Sample Housekeeping Tasks
  await db.insert(housekeepingTasks).values([
    {
      propertyId: sampleProperties[0].id,
      bookingId: sampleBookings[0].id,
      assignedTo: sampleUsers[1].id,
      taskType: "cleaning",
      status: "in_progress",
      dueDate: tomorrow,
      notes: "Deep clean after guest checkout. Pay special attention to kitchen and bathrooms."
    },
    {
      propertyId: sampleProperties[1].id,
      bookingId: sampleBookings[1].id,
      assignedTo: sampleUsers[1].id,
      taskType: "maintenance",
      status: "pending",
      dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
      notes: "Check and replace air filters. Test all appliances before next guest arrival."
    },
    {
      propertyId: sampleProperties[2].id,
      taskType: "inspection",
      status: "completed",
      dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      notes: "Monthly property inspection completed. All systems operational."
    }
  ]);

  // Sample OTA Integrations
  await db.insert(otaIntegrations).values([
    {
      propertyId: sampleProperties[0].id,
      platform: "airbnb",
      externalId: "airbnb_12345",
      isActive: true,
      syncEnabled: true,
      lastSyncAt: new Date(today.getTime() - 1 * 60 * 60 * 1000)
    },
    {
      propertyId: sampleProperties[1].id,
      platform: "booking_com",
      externalId: "booking_67890",
      isActive: true,
      syncEnabled: true,
      lastSyncAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
    },
    {
      propertyId: sampleProperties[2].id,
      platform: "vrbo",
      externalId: "vrbo_54321",
      isActive: true,
      syncEnabled: false,
      lastSyncAt: new Date(today.getTime() - 24 * 60 * 60 * 1000)
    }
  ]);

  // Sample Analytics Data
  const analyticsData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    for (const property of sampleProperties) {
      analyticsData.push({
        propertyId: property.id,
        date: date,
        views: Math.floor(Math.random() * 50) + 10,
        bookings: Math.floor(Math.random() * 3),
        revenue: (Math.random() * 500 + 100).toFixed(2),
        occupancyRate: (Math.random() * 40 + 60).toFixed(1),
        source: ["airbnb", "booking_com", "direct", "vrbo"][Math.floor(Math.random() * 4)]
      });
    }
  }

  await db.insert(analytics).values(analyticsData);

  console.log('Sample data inserted successfully!');
  console.log(`- ${sampleProperties.length} properties`);
  console.log(`- ${sampleBookings.length} bookings`);
  console.log(`- ${sampleUsers.length} users`);
  console.log(`- 3 messages`);
  console.log(`- 4 payments`);
  console.log(`- 3 housekeeping tasks`);
  console.log(`- 3 OTA integrations`);
  console.log(`- ${analyticsData.length} analytics records`);
}

insertSampleData().catch(console.error);