import Database from 'better-sqlite3';

const sqlite = new Database('./cloudstay.db');

// Create tables manually for SQLite
const createTables = () => {
  // Create users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create properties table  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      max_guests INTEGER NOT NULL,
      base_price REAL NOT NULL,
      cleaning_fee REAL DEFAULT 0,
      owner_id INTEGER REFERENCES users(id),
      images TEXT,
      amenities TEXT,
      is_active INTEGER DEFAULT 1,
      airbnb_id TEXT,
      booking_com_id TEXT,
      vrbo_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create bookings table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id),
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      check_in_date INTEGER NOT NULL,
      check_out_date INTEGER NOT NULL,
      guests INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'direct',
      external_booking_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      stripe_payment_intent_id TEXT,
      special_requests TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create messages table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      property_id INTEGER REFERENCES properties(id),
      sender TEXT NOT NULL,
      sender_name TEXT,
      sender_email TEXT,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      source TEXT DEFAULT 'direct',
      external_message_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create housekeeping_tasks table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS housekeeping_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id),
      booking_id INTEGER REFERENCES bookings(id),
      assigned_to INTEGER REFERENCES users(id),
      task_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      due_date INTEGER,
      notes TEXT,
      completed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create payments table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      stripe_payment_intent_id TEXT,
      processing_fee REAL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create ota_integrations table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS ota_integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      property_id INTEGER REFERENCES properties(id),
      external_property_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      last_sync_at INTEGER,
      sync_settings TEXT,
      credentials TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create analytics table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER REFERENCES properties(id),
      date INTEGER NOT NULL,
      occupancy_rate REAL,
      revenue REAL,
      bookings_count INTEGER DEFAULT 0,
      average_stay REAL,
      source TEXT
    );
  `);
};

// Insert sample data
const insertSampleData = () => {
  const now = Math.floor(Date.now() / 1000);
  
  // Insert users
  const insertUser = sqlite.prepare(`
    INSERT INTO users (username, email, password, first_name, last_name, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertUser.run('john_smith', 'john.smith@email.com', 'hashed_password_1', 'John', 'Smith', '+1-555-0123', 'owner', now);
  insertUser.run('sarah_wilson', 'sarah.wilson@email.com', 'hashed_password_2', 'Sarah', 'Wilson', '+1-555-0124', 'staff', now);
  insertUser.run('admin', 'admin@cloudstay.com', 'hashed_password_3', 'Admin', 'User', '+1-555-0100', 'admin', now);

  // Insert properties
  const insertProperty = sqlite.prepare(`
    INSERT INTO properties (name, address, description, type, bedrooms, bathrooms, max_guests, base_price, cleaning_fee, images, amenities, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertProperty.run('Downtown Luxury Loft', '123 Main St, Downtown, CA 90210', 'Modern 2-bedroom loft in the heart of downtown with stunning city views, premium amenities, and walking distance to restaurants and entertainment.', 'apartment', 2, 2, 4, 189.00, 75.00, JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800']), JSON.stringify(['wifi', 'kitchen', 'parking', 'gym', 'pool']), 1, now);
  insertProperty.run('Cozy Beach House', '456 Ocean Ave, Malibu, CA 90265', 'Charming 3-bedroom beach house just steps from the sand. Perfect for families with private deck, BBQ area, and ocean views.', 'house', 3, 2, 6, 299.00, 100.00, JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']), JSON.stringify(['wifi', 'kitchen', 'parking', 'beach_access', 'bbq']), 1, now);
  insertProperty.run('Mountain Cabin Retreat', '789 Pine Ridge Rd, Big Bear, CA 92315', 'Rustic cabin in the mountains with fireplace, hot tub, and hiking trails nearby. Perfect for a peaceful getaway.', 'cabin', 2, 1, 4, 159.00, 60.00, JSON.stringify(['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800']), JSON.stringify(['wifi', 'kitchen', 'fireplace', 'hot_tub', 'hiking']), 1, now);
  insertProperty.run('City Studio Apartment', '321 Urban Blvd, Los Angeles, CA 90028', 'Modern studio in trendy neighborhood with all amenities. Perfect for business travelers and young professionals.', 'studio', 1, 1, 2, 129.00, 45.00, JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']), JSON.stringify(['wifi', 'kitchen', 'gym', 'concierge']), 1, now);
  insertProperty.run('Garden View Villa', '654 Garden Lane, Beverly Hills, CA 90210', 'Elegant 4-bedroom villa with private garden, pool, and luxury finishes throughout. Ideal for special occasions.', 'villa', 4, 3, 8, 449.00, 150.00, JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']), JSON.stringify(['wifi', 'kitchen', 'parking', 'pool', 'garden', 'luxury']), 1, now);

  // Insert bookings
  const insertBooking = sqlite.prepare(`
    INSERT INTO bookings (property_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, guests, total_amount, status, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const today = Math.floor(Date.now() / 1000);
  const tomorrow = today + (24 * 60 * 60);
  const nextWeek = today + (7 * 24 * 60 * 60);
  const yesterday = today - (24 * 60 * 60);
  const nextMonth = today + (30 * 24 * 60 * 60);
  
  insertBooking.run(1, 'Emily Johnson', 'emily.johnson@email.com', '+1-555-1001', today, tomorrow, 2, 378.00, 'checked_in', 'airbnb', now);
  insertBooking.run(2, 'Michael Brown', 'michael.brown@email.com', '+1-555-1002', today + (2 * 24 * 60 * 60), today + (5 * 24 * 60 * 60), 4, 997.00, 'confirmed', 'booking_com', now);
  insertBooking.run(3, 'Lisa Davis', 'lisa.davis@email.com', '+1-555-1003', nextWeek, nextWeek + (3 * 24 * 60 * 60), 3, 537.00, 'confirmed', 'direct', now);
  insertBooking.run(4, 'David Wilson', 'david.wilson@email.com', '+1-555-1004', today - (3 * 24 * 60 * 60), yesterday, 1, 303.00, 'completed', 'vrbo', now);
  insertBooking.run(5, 'Jennifer Lee', 'jennifer.lee@email.com', '+1-555-1005', nextMonth, nextMonth + (4 * 24 * 60 * 60), 6, 1946.00, 'pending', 'airbnb', now);

  // Insert messages
  const insertMessage = sqlite.prepare(`
    INSERT INTO messages (property_id, booking_id, sender, sender_name, sender_email, message, source, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertMessage.run(1, 1, 'guest', 'Emily Johnson', 'emily.johnson@email.com', 'Hi! I am checking in today. What time is check-in available? Also, is there parking available at the property?', 'airbnb', 0, now - (2 * 60 * 60));
  insertMessage.run(2, 2, 'guest', 'Michael Brown', 'michael.brown@email.com', 'Looking forward to our stay! Can you please send the check-in instructions? We will be arriving around 4 PM.', 'booking_com', 1, now - (24 * 60 * 60));
  insertMessage.run(3, 3, 'guest', 'Lisa Davis', 'lisa.davis@email.com', 'Hi there! We are excited about our mountain retreat next week. Are there any hiking recommendations nearby?', 'direct', 0, now - (5 * 60 * 60));

  // Insert payments
  const insertPayment = sqlite.prepare(`
    INSERT INTO payments (booking_id, amount, status, payment_method, processing_fee, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertPayment.run(1, 378.00, 'completed', 'card', 11.34, now - (24 * 60 * 60));
  insertPayment.run(2, 997.00, 'completed', 'card', 29.91, now - (2 * 24 * 60 * 60));
  insertPayment.run(3, 537.00, 'pending', 'card', 16.11, now - (12 * 60 * 60));
  insertPayment.run(4, 303.00, 'completed', 'card', 9.09, now - (4 * 24 * 60 * 60));

  // Insert housekeeping tasks
  const insertTask = sqlite.prepare(`
    INSERT INTO housekeeping_tasks (property_id, booking_id, assigned_to, task_type, status, due_date, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertTask.run(1, 1, 2, 'cleaning', 'in_progress', tomorrow, 'Deep clean after guest checkout. Pay special attention to kitchen and bathrooms.', now);
  insertTask.run(2, 2, 2, 'maintenance', 'pending', tomorrow, 'Check and replace air filters. Test all appliances before next guest arrival.', now);
  insertTask.run(3, null, null, 'inspection', 'completed', yesterday, 'Monthly property inspection completed. All systems operational.', now);

  // Insert OTA integrations
  const insertIntegration = sqlite.prepare(`
    INSERT INTO ota_integrations (property_id, platform, external_property_id, is_active, last_sync_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertIntegration.run(1, 'airbnb', 'airbnb_12345', 1, now - (60 * 60), now);
  insertIntegration.run(2, 'booking_com', 'booking_67890', 1, now - (2 * 60 * 60), now);
  insertIntegration.run(3, 'vrbo', 'vrbo_54321', 1, now - (24 * 60 * 60), now);
};

// Run migration
console.log('Creating SQLite database and tables...');
createTables();
console.log('Inserting sample data...');
insertSampleData();
console.log('SQLite migration completed successfully!');

sqlite.close();