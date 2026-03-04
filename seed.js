// prisma/seed.js — Seeds FlyPlans database with realistic sample data
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FlyPlans database...");

  // ── Users ─────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@flyplans.com" },
    update: {},
    create: { email: "admin@flyplans.com", passwordHash: password, name: "FlyPlans Admin", role: "ADMIN", isVerified: true },
  });

  const hosts = await Promise.all([
    prisma.user.upsert({ where: { email: "chidi@flyplans.com" }, update: {}, create: { email: "chidi@flyplans.com", passwordHash: password, name: "Chidi Okeke", role: "HOST", isVerified: true, bio: "Superhost in Lagos with 3 properties." } }),
    prisma.user.upsert({ where: { email: "sophie@flyplans.com" }, update: {}, create: { email: "sophie@flyplans.com", passwordHash: password, name: "Sophie Martin", role: "HOST", isVerified: true, bio: "Paris-based host, love welcoming travelers." } }),
    prisma.user.upsert({ where: { email: "made@flyplans.com" }, update: {}, create: { email: "made@flyplans.com", passwordHash: password, name: "Made Bagiarta", role: "HOST", isVerified: true, bio: "Bali villa owner. Coworking-friendly space." } }),
    prisma.user.upsert({ where: { email: "valentina@flyplans.com" }, update: {}, create: { email: "valentina@flyplans.com", passwordHash: password, name: "Valentina García", role: "HOST", isVerified: true, bio: "Medellín local hosting remote workers." } }),
  ]);

  const traveler = await prisma.user.upsert({
    where: { email: "traveler@flyplans.com" },
    update: {},
    create: { email: "traveler@flyplans.com", passwordHash: password, name: "Alex Johnson", role: "TRAVELER", bio: "Digital nomad exploring the world." },
  });

  console.log("✅ Users created");

  // ── Listings ──────────────────────────────────────────────────────────────
  const listingsData = [
    { hostId: hosts[0].id, title: "Modern Studio in Lekki Phase 1", description: "A clean, modern studio in one of Lagos's safest and most vibrant neighborhoods. Fast WiFi, 24/7 generator backup, AC, and a fully equipped kitchen. Perfect for remote workers and digital nomads.", type: "STUDIO", address: "Lekki Phase 1, Lagos", city: "Lagos", country: "Nigeria", region: "Africa", latitude: 6.4314, longitude: 3.4699, pricePerNight: 28, pricePerMonth: 620, discountPercent: 25, maxGuests: 2, bedrooms: 1, bathrooms: 1, photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"], amenities: ["WiFi", "AC", "Kitchen", "Workspace", "Generator"], isVerified: true },
    { hostId: hosts[1].id, title: "Charming 1BR in Montmartre District", description: "A beautiful Haussmann-style apartment in the heart of Montmartre. Walking distance to Sacré-Cœur, local cafés, and the Metro. Ideal for long-term stays.", type: "APARTMENT", address: "18th Arrondissement, Paris", city: "Paris", country: "France", region: "Europe", latitude: 48.8867, longitude: 2.3431, pricePerNight: 85, pricePerMonth: 1800, discountPercent: 30, maxGuests: 2, bedrooms: 1, bathrooms: 1, photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"], amenities: ["WiFi", "Kitchen", "Balcony", "Metro Access", "Washer"], isVerified: true },
    { hostId: hosts[2].id, title: "Coliving Villa with Pool in Canggu", description: "Beautiful Balinese villa in the heart of Canggu's digital nomad scene. Shared pool, fast fiber WiFi, and a coworking space on-site. Month-to-month stays welcome.", type: "SHARED_HOUSING", address: "Canggu, Badung Regency", city: "Bali", country: "Indonesia", region: "Asia", latitude: -8.6478, longitude: 115.1385, pricePerNight: 35, pricePerMonth: 750, discountPercent: 35, maxGuests: 1, bedrooms: 1, bathrooms: 1, photos: ["https://images.unsplash.com/photo-1540541338537-7e3e5c9e1f89?w=600"], amenities: ["WiFi", "Pool", "Coworking", "Kitchen", "Laundry"], isVerified: true },
    { hostId: hosts[3].id, title: "Modern Flat in El Poblado Neighborhood", description: "Stylish 2-bedroom apartment in the safest and most walkable neighborhood in Medellín. Gym and pool access included. Great for solo travelers or couples.", type: "APARTMENT", address: "El Poblado, Medellín", city: "Medellín", country: "Colombia", region: "South America", latitude: 6.2089, longitude: -75.5699, pricePerNight: 32, pricePerMonth: 680, discountPercent: 22, maxGuests: 3, bedrooms: 2, bathrooms: 1, photos: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600"], amenities: ["WiFi", "Gym", "Pool", "24/7 Security", "Parking"], isVerified: true },
    { hostId: hosts[0].id, title: "Executive Flat in East Legon, Accra", description: "Spacious 2-bedroom flat in one of Accra's most prestigious neighborhoods. Reliable internet, backup power, and 24-hour security.", type: "APARTMENT", address: "East Legon, Accra", city: "Accra", country: "Ghana", region: "Africa", latitude: 5.6362, longitude: -0.1500, pricePerNight: 45, pricePerMonth: 980, discountPercent: 20, maxGuests: 3, bedrooms: 2, bathrooms: 2, photos: ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600"], amenities: ["WiFi", "AC", "Security", "Generator", "Parking"], isVerified: false },
    { hostId: hosts[1].id, title: "Sunny 2BR in Alfama with River Views", description: "Renovated traditional Lisbon apartment in the historic Alfama district. Stunning Tagus River views, tram access, and a sun-drenched terrace.", type: "APARTMENT", address: "Alfama, Lisbon", city: "Lisbon", country: "Portugal", region: "Europe", latitude: 38.7139, longitude: -9.1334, pricePerNight: 70, pricePerMonth: 1500, discountPercent: 28, maxGuests: 4, bedrooms: 2, bathrooms: 1, photos: ["https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600"], amenities: ["WiFi", "Kitchen", "Terrace", "Washer", "Tram Access"], isVerified: true },
  ];

  const listings = await Promise.all(
    listingsData.map(d => prisma.listing.upsert({
      where: { id: d.title.substring(0, 10) },  // not real — use create in production
      update: {},
      create: d,
    }).catch(() => prisma.listing.create({ data: d }))
    )
  );

  console.log("✅ Listings created");

  // ── Budget Estimates ───────────────────────────────────────────────────────
  const budgetData = [
    { city: "Lagos",     country: "Nigeria",     region: "Africa",        accommodation: 620,  food: 180, transport: 80,  activities: 60,  utilities: 40 },
    { city: "Accra",     country: "Ghana",       region: "Africa",        accommodation: 750,  food: 200, transport: 90,  activities: 70,  utilities: 50 },
    { city: "Nairobi",   country: "Kenya",       region: "Africa",        accommodation: 390,  food: 150, transport: 70,  activities: 50,  utilities: 30 },
    { city: "Cape Town", country: "South Africa",region: "Africa",        accommodation: 900,  food: 250, transport: 100, activities: 150, utilities: 60 },
    { city: "Paris",     country: "France",      region: "Europe",        accommodation: 1800, food: 500, transport: 80,  activities: 300, utilities: 100 },
    { city: "Lisbon",    country: "Portugal",    region: "Europe",        accommodation: 1500, food: 350, transport: 60,  activities: 200, utilities: 80 },
    { city: "Berlin",    country: "Germany",     region: "Europe",        accommodation: 1400, food: 380, transport: 90,  activities: 180, utilities: 90 },
    { city: "Bali",      country: "Indonesia",   region: "Asia",          accommodation: 750,  food: 200, transport: 90,  activities: 120, utilities: 50 },
    { city: "Bangkok",   country: "Thailand",    region: "Asia",          accommodation: 600,  food: 180, transport: 70,  activities: 100, utilities: 40 },
    { city: "Medellín",  country: "Colombia",    region: "South America", accommodation: 680,  food: 160, transport: 50,  activities: 80,  utilities: 40 },
    { city: "Mexico City",country: "Mexico",     region: "South America", accommodation: 800,  food: 200, transport: 60,  activities: 100, utilities: 50 },
    { city: "Dubai",     country: "UAE",         region: "Middle East",   accommodation: 1800, food: 400, transport: 120, activities: 250, utilities: 120 },
  ];

  await Promise.all(budgetData.map(d =>
    prisma.budgetEstimate.upsert({ where: { city: d.city }, update: d, create: d })
  ));

  console.log("✅ Budget estimates seeded");
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📧 Test credentials (password: password123):");
  console.log("  Admin:    admin@flyplans.com");
  console.log("  Host:     chidi@flyplans.com");
  console.log("  Traveler: traveler@flyplans.com");
}

main().catch(console.error).finally(() => prisma.$disconnect());
