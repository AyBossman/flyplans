import { useState, useEffect } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
const LISTINGS = [
  { id: 1, city: "Lagos", country: "Nigeria", region: "Africa", type: "Apartment", title: "Modern Studio in Lekki Phase 1", price: 28, monthly: 620, discount: 25, rating: 4.8, reviews: 34, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", amenities: ["WiFi","AC","Kitchen","Workspace"], host: "Chidi O.", verified: true },
  { id: 2, city: "Nairobi", country: "Kenya", region: "Africa", type: "Private Room", title: "Cozy Room Near CBD with Fast WiFi", price: 18, monthly: 390, discount: 20, rating: 4.6, reviews: 21, img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80", amenities: ["WiFi","AC","Laundry"], host: "Amara K.", verified: true },
  { id: 3, city: "Paris", country: "France", region: "Europe", type: "Apartment", title: "Charming 1BR in Montmartre District", price: 85, monthly: 1800, discount: 30, rating: 4.9, reviews: 67, img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", amenities: ["WiFi","Kitchen","Balcony","Metro Access"], host: "Sophie M.", verified: true },
  { id: 4, city: "Bali", country: "Indonesia", region: "Asia", type: "Shared Housing", title: "Coliving Villa with Pool in Canggu", price: 35, monthly: 750, discount: 35, rating: 4.7, reviews: 89, img: "https://images.unsplash.com/photo-1540541338537-7e3e5c9e1f89?w=600&q=80", amenities: ["WiFi","Pool","Coworking","Kitchen"], host: "Made B.", verified: true },
  { id: 5, city: "Accra", country: "Ghana", region: "Africa", type: "Apartment", title: "Executive Flat in East Legon", price: 45, monthly: 980, discount: 20, rating: 4.5, reviews: 15, img: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&q=80", amenities: ["WiFi","AC","Security","Generator"], host: "Kofi A.", verified: false },
  { id: 6, city: "Lisbon", country: "Portugal", region: "Europe", type: "Apartment", title: "Sunny 2BR in Alfama with River Views", price: 70, monthly: 1500, discount: 28, rating: 4.8, reviews: 44, img: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&q=80", amenities: ["WiFi","Kitchen","Terrace","Washer"], host: "Ana R.", verified: true },
  { id: 7, city: "Medellín", country: "Colombia", region: "South America", type: "Apartment", title: "Modern Flat in El Poblado Neighborhood", price: 32, monthly: 680, discount: 22, rating: 4.7, reviews: 38, img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80", amenities: ["WiFi","Gym","Pool","24/7 Security"], host: "Valentina G.", verified: true },
  { id: 8, city: "Dubai", country: "UAE", region: "Middle East", type: "Private Room", title: "Furnished Room in JVC — Bills Included", price: 50, monthly: 1100, discount: 15, rating: 4.4, reviews: 28, img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80", amenities: ["WiFi","AC","Gym","Metro Access"], host: "Hassan M.", verified: true },
];

const DESTINATIONS = [
  { name: "Africa", emoji: "🌍", count: 284, img: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80", color: "#E8A838" },
  { name: "Europe", emoji: "🏰", count: 512, img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80", color: "#2E75B6" },
  { name: "Asia", emoji: "🏯", count: 376, img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80", color: "#E85E38" },
  { name: "Americas", emoji: "🌎", count: 298, img: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&q=80", color: "#38B86E" },
];

const BUDGET_DATA = {
  "Lagos": { accommodation: 620, food: 180, transport: 80, activities: 60, utilities: 40 },
  "Nairobi": { accommodation: 390, food: 150, transport: 70, activities: 50, utilities: 30 },
  "Bali": { accommodation: 750, food: 200, transport: 90, activities: 120, utilities: 50 },
  "Lisbon": { accommodation: 1500, food: 350, transport: 60, activities: 200, utilities: 80 },
  "Medellín": { accommodation: 680, food: 160, transport: 50, activities: 80, utilities: 40 },
  "Paris": { accommodation: 1800, food: 500, transport: 80, activities: 300, utilities: 100 },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1">
      <span style={{ color: "#F59E0B" }}>★</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{rating}</span>
    </span>
  );
}

function Badge({ text, color = "#2E75B6" }) {
  return (
    <span style={{ background: color + "18", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {text}
    </span>
  );
}

function ListingCard({ listing, onClick }) {
  const savings = Math.round(listing.monthly * (listing.discount / 100));
  return (
    <div onClick={() => onClick(listing)} style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}>
      <div style={{ position: "relative" }}>
        <img src={listing.img} alt={listing.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {listing.verified && <Badge text="✓ Verified" color="#16A34A" />}
          <Badge text={`-${listing.discount}% monthly`} color="#DC2626" />
        </div>
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 600, color: "#1A3C5E" }}>
          {listing.type}
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>{listing.city}, {listing.country}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.3 }}>{listing.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1A3C5E" }}>${listing.monthly}</span>
            <span style={{ fontSize: 12, color: "#6B7280" }}>/mo</span>
            <span style={{ fontSize: 11, color: "#16A34A", marginLeft: 6 }}>Save ${savings}</span>
          </div>
          <StarRating rating={listing.rating} />
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>${listing.price}/night · {listing.reviews} reviews</div>
      </div>
    </div>
  );
}

function SearchBar({ onSearch, compact = false }) {
  const [dest, setDest] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const inputStyle = { border: "1px solid #E5E7EB", borderRadius: 8, padding: compact ? "8px 12px" : "12px 16px", fontSize: 14, outline: "none", background: "#fff" };
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <input placeholder="Where to? City or country…" value={dest} onChange={e => setDest(e.target.value)} style={{ ...inputStyle, flex: 2, minWidth: 180 }} />
      <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }} />
      <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }} />
      <button onClick={() => onSearch(dest)} style={{ background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 8, padding: compact ? "8px 20px" : "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        Search
      </button>
    </div>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function HomePage({ navigate, setSearch }) {
  const [query, setQuery] = useState("");
  const featured = LISTINGS.slice(0, 4);
  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0F2740 0%, #1A3C5E 50%, #2E75B6 100%)", color: "#fff", padding: "80px 24px 100px", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: 3, fontWeight: 600, color: "#93C5FD", marginBottom: 16, textTransform: "uppercase" }}>✈️ Affordable Long-Stay Travel</div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          Find Your Perfect Home<br />
          <span style={{ color: "#60A5FA" }}>Anywhere in the World</span>
        </h1>
        <p style={{ fontSize: 18, color: "#CBD5E1", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Budget-friendly long-stay accommodations in Africa, Europe, Asia, and the Americas. Save up to 60% on monthly rates.
        </p>
        <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 20, maxWidth: 700, margin: "0 auto", border: "1px solid rgba(255,255,255,0.15)" }}>
          <SearchBar onSearch={(q) => { setSearch(q); navigate("search"); }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 48, flexWrap: "wrap" }}>
          {[["500+", "Verified Hosts"], ["45", "Countries"], ["10k+", "Happy Travelers"], ["60%", "Max Savings"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#60A5FA" }}>{n}</div>
              <div style={{ fontSize: 13, color: "#94A3B8" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Destinations */}
        <div style={{ padding: "60px 0 40px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Explore by Region</h2>
          <p style={{ color: "#6B7280", marginBottom: 32 }}>Discover affordable stays across 4 continents</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {DESTINATIONS.map(d => (
              <div key={d.name} onClick={() => { setSearch(d.name); navigate("search"); }} style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", position: "relative", height: 180 }}
                onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.background = "rgba(0,0,0,0.4)"}
                onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.background = "rgba(0,0,0,0.3)"}>
                <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", transition: "background 0.2s" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20, color: "#fff" }}>
                  <div style={{ fontSize: 24 }}>{d.emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{d.count} stays available</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div style={{ padding: "0 0 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Featured Long-Stay Deals</h2>
              <p style={{ color: "#6B7280" }}>Hand-picked budget stays with monthly discounts</p>
            </div>
            <button onClick={() => navigate("search")} style={{ background: "transparent", border: "2px solid #1A3C5E", color: "#1A3C5E", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              View All
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {featured.map(l => <ListingCard key={l.id} listing={l} onClick={l => navigate("listing", l)} />)}
          </div>
        </div>

        {/* Budget Planner CTA */}
        <div style={{ background: "linear-gradient(135deg, #1A3C5E, #2E75B6)", borderRadius: 24, padding: "48px 40px", color: "#fff", marginBottom: 60, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#93C5FD", marginBottom: 12, textTransform: "uppercase", fontWeight: 600 }}>Free Tool</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Plan Your Travel Budget</h3>
            <p style={{ color: "#CBD5E1", maxWidth: 440, lineHeight: 1.6 }}>Calculate your real monthly costs including accommodation, food, transport, and more before you book.</p>
          </div>
          <button onClick={() => navigate("budget")} style={{ background: "#fff", color: "#1A3C5E", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
            Try Budget Planner →
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchPage({ navigate, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [type, setType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [region, setRegion] = useState("All");

  const results = LISTINGS.filter(l => {
    const q = query.toLowerCase();
    const matchQ = !q || l.city.toLowerCase().includes(q) || l.country.toLowerCase().includes(q) || l.region.toLowerCase().includes(q);
    const matchT = type === "All" || l.type === type;
    const matchP = l.monthly <= maxPrice;
    const matchR = region === "All" || l.region === region;
    return matchQ && matchT && matchP && matchR;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #E5E7EB" }}>
        <SearchBar onSearch={setQuery} compact />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content", border: "1px solid #E5E7EB" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: "#111827" }}>Filters</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 10, textTransform: "uppercase" }}>Property Type</div>
            {["All", "Apartment", "Private Room", "Shared Housing"].map(t => (
              <button key={t} onClick={() => setType(t)} style={{ display: "block", width: "100%", textAlign: "left", background: type === t ? "#EBF3FA" : "transparent", color: type === t ? "#1A3C5E" : "#374151", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer", marginBottom: 4, fontWeight: type === t ? 600 : 400 }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 10, textTransform: "uppercase" }}>Region</div>
            {["All", "Africa", "Europe", "Asia", "South America", "Middle East"].map(r => (
              <button key={r} onClick={() => setRegion(r)} style={{ display: "block", width: "100%", textAlign: "left", background: region === r ? "#EBF3FA" : "transparent", color: region === r ? "#1A3C5E" : "#374151", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer", marginBottom: 4, fontWeight: region === r ? 600 : 400 }}>
                {r}
              </button>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 10, textTransform: "uppercase" }}>Max Monthly Budget</div>
            <input type="range" min={200} max={3000} step={50} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={{ width: "100%" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A3C5E", marginTop: 4 }}>Up to ${maxPrice}/mo</div>
          </div>
        </div>
        {/* Results */}
        <div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>{results.length} stays found</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {results.map(l => <ListingCard key={l.id} listing={l} onClick={l => navigate("listing", l)} />)}
            {results.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>No stays found</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters or search a different city</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingPage({ listing, navigate }) {
  const [nights, setNights] = useState(30);
  const [booked, setBooked] = useState(false);
  if (!listing) return <div style={{ padding: 40, textAlign: "center" }}>Listing not found.</div>;
  const total = nights >= 30 ? Math.round(listing.monthly * (nights / 30) * (1 - listing.discount / 100)) : listing.price * nights;
  const savings = nights >= 30 ? Math.round(listing.price * nights - total) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={() => navigate("search")} style={{ background: "transparent", border: "none", color: "#2E75B6", fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 600 }}>← Back to Search</button>
      <img src={listing.img} alt={listing.title} style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 20, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Badge text={listing.type} />
            <Badge text={listing.region} />
            {listing.verified && <Badge text="✓ Host Verified" color="#16A34A" />}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", marginBottom: 8 }}>{listing.title}</h1>
          <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 24 }}>📍 {listing.city}, {listing.country}</div>
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1A3C5E" }}>${listing.price}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>per night</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1A3C5E" }}>${listing.monthly}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>per month</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#DC2626" }}>-{listing.discount}%</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>monthly discount</div>
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Amenities</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
            {listing.amenities.map(a => (
              <span key={a} style={{ background: "#F3F4F6", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 500, color: "#374151" }}>✓ {a}</span>
            ))}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>About this Stay</h3>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>
            A comfortable, well-equipped space ideal for long-term stays. The host is verified and provides reliable WiFi, 
            utilities, and a secure environment. Perfect for digital nomads, students, and remote workers seeking an 
            affordable base in {listing.city}.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, background: "#F8FAFC", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1A3C5E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>
              {listing.host[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>{listing.host}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{listing.verified ? "✓ Verified Host" : "Host"} · {listing.reviews} reviews</div>
            </div>
            <div style={{ marginLeft: "auto" }}><StarRating rating={listing.rating} /></div>
          </div>
        </div>

        {/* Booking Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", border: "1px solid #E5E7EB", height: "fit-content", position: "sticky", top: 100 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1A3C5E", marginBottom: 4 }}>${listing.monthly}<span style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>/month</span></div>
          <div style={{ fontSize: 13, color: "#16A34A", fontWeight: 600, marginBottom: 20 }}>Save {listing.discount}% on monthly stays</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Length of Stay (nights)</label>
            <input type="number" min={1} max={365} value={nights} onChange={e => setNights(+e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 15, outline: "none" }} />
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6B7280" }}>${listing.price} × {nights} nights</span>
              <span style={{ fontSize: 14 }}>${listing.price * nights}</span>
            </div>
            {savings > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: "#16A34A" }}>Long-stay discount ({listing.discount}%)</span>
                <span style={{ fontSize: 14, color: "#16A34A" }}>-${savings}</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#1A3C5E" }}>${total}</span>
            </div>
          </div>
          {!booked ? (
            <button onClick={() => setBooked(true)} style={{ width: "100%", background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Request to Book
            </button>
          ) : (
            <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, color: "#065F46" }}>Booking Request Sent!</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>The host will respond within 24 hours</div>
            </div>
          )}
          <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 12 }}>You won't be charged until the host accepts</div>
        </div>
      </div>
    </div>
  );
}

function BudgetPage() {
  const [dest, setDest] = useState("Lagos");
  const [months, setMonths] = useState(3);
  const cities = Object.keys(BUDGET_DATA);
  const data = BUDGET_DATA[dest];
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const grandTotal = total * months;
  const hotelComparison = Math.round(total * 2.5 * months);
  const colors = { accommodation: "#1A3C5E", food: "#2E75B6", transport: "#60A5FA", activities: "#93C5FD", utilities: "#BFDBFE" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111827", marginBottom: 8 }}>✈️ Travel Budget Planner</h1>
      <p style={{ color: "#6B7280", marginBottom: 40, fontSize: 16 }}>Calculate your real monthly costs before you book</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8, color: "#374151" }}>Destination City</label>
          <select value={dest} onChange={e => setDest(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 15, outline: "none" }}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8, color: "#374151" }}>Duration: {months} month{months > 1 ? "s" : ""}</label>
          <input type="range" min={1} max={12} value={months} onChange={e => setMonths(+e.target.value)} style={{ width: "100%", marginTop: 18 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Monthly Breakdown — {dest}</div>
          {Object.entries(data).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, textTransform: "capitalize", fontWeight: 500 }}>{key}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1A3C5E" }}>${val}</span>
              </div>
              <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3 }}>
                <div style={{ height: 6, background: colors[key], borderRadius: 3, width: `${(val / total) * 100}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: "2px solid #E5E7EB", paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>Monthly Total</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: "#1A3C5E" }}>${total}</span>
          </div>
        </div>
        <div>
          <div style={{ background: "linear-gradient(135deg, #1A3C5E, #2E75B6)", borderRadius: 16, padding: 24, color: "#fff", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#93C5FD", marginBottom: 8 }}>TOTAL FOR {months} MONTH{months > 1 ? "S" : ""}</div>
            <div style={{ fontSize: 42, fontWeight: 900 }}>${grandTotal.toLocaleString()}</div>
            <div style={{ fontSize: 14, color: "#CBD5E1", marginTop: 8 }}>All-inclusive budget estimate</div>
          </div>
          <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#78350F", marginBottom: 8 }}>💡 VS. HOTEL STAY</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#92400E" }}>${hotelComparison.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: "#78350F", marginTop: 4 }}>Estimated hotel cost for same period</div>
            <div style={{ marginTop: 12, background: "#FFF7ED", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 700, color: "#D97706" }}>
              You save ${(hotelComparison - grandTotal).toLocaleString()} with FlyPlans! 🎉
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function FlyPlansApp() {
  const [page, setPage] = useState("home");
  const [selectedListing, setSelectedListing] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = (p, data = null) => { setPage(p); if (data) setSelectedListing(data); window.scrollTo(0, 0); };

  const navLinks = [
    { key: "search", label: "Find Stays" },
    { key: "budget", label: "Budget Planner" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>✈️</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#1A3C5E", letterSpacing: -0.5 }}>FlyPlans</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {navLinks.map(l => (
              <button key={l.key} onClick={() => navigate(l.key)} style={{ background: page === l.key ? "#EBF3FA" : "transparent", color: page === l.key ? "#1A3C5E" : "#374151", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {l.label}
              </button>
            ))}
            <button onClick={() => navigate("host")} style={{ background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginLeft: 8 }}>
              List Your Space
            </button>
          </div>
        </div>
      </nav>

      {/* Pages */}
      {page === "home" && <HomePage navigate={navigate} setSearch={setSearch} />}
      {page === "search" && <SearchPage navigate={navigate} initialQuery={search} />}
      {page === "listing" && <ListingPage listing={selectedListing} navigate={navigate} />}
      {page === "budget" && <BudgetPage />}
      {page === "host" && (
        <div style={{ maxWidth: 700, margin: "60px auto", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 12 }}>List Your Space on FlyPlans</h2>
          <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Join 500+ verified hosts earning consistent income from long-stay travelers. 0% commission for your first 3 months.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
            {[["$1,200", "Avg. monthly earnings"], ["0%", "Commission (first 3mo)"], ["48hrs", "Get your first booking"]].map(([val, label]) => (
              <div key={label} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#1A3C5E" }}>{val}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <button style={{ background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Get Started as a Host →
          </button>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: "#0F2740", color: "#CBD5E1", padding: "48px 24px 32px", marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>✈️</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>FlyPlans</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#94A3B8" }}>Making global travel affordable, safe, and accessible for everyone.</p>
          </div>
          {[["Travelers", ["Search Stays", "Budget Planner", "Long-Stay Deals", "How it Works"]], ["Hosts", ["List Your Space", "Host Dashboard", "Verification", "Pricing"]], ["Company", ["About Us", "Blog", "Press", "Contact"]]].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 15 }}>{title}</div>
              {links.map(l => <div key={l} style={{ fontSize: 13, color: "#94A3B8", marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1E3A5F", marginTop: 32, paddingTop: 24, textAlign: "center", fontSize: 12, color: "#64748B" }}>
          © 2025 FlyPlans. All rights reserved. | Making the world smaller, one long stay at a time.
        </div>
      </footer>
    </div>
  );
}
