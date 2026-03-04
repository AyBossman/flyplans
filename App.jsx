import { useState, useEffect, useCallback } from "react";

// ─── API CLIENT ──────────────────────────────────────────────────────────────
// Paste your backend URL here after deploying, or use localhost for development
const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:4000/api";

const api = {
  async request(method, path, body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    const storedToken = token || localStorage.getItem("flyplans_token");
    if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  },
  get:    (path)        => api.request("GET",    path),
  post:   (path, body)  => api.request("POST",   path, body),
  put:    (path, body)  => api.request("PUT",    path, body),
  delete: (path)        => api.request("DELETE", path),
};

// ─── STATIC FALLBACK DATA (used when API is offline) ─────────────────────────
const FALLBACK_LISTINGS = [
  { id: "1", city: "Lagos", country: "Nigeria", region: "Africa", type: "STUDIO", title: "Modern Studio in Lekki Phase 1", pricePerNight: 28, pricePerMonth: 620, discountPercent: 25, avgRating: 4.8, _count: { reviews: 34 }, photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"], amenities: ["WiFi","AC","Kitchen","Workspace"], host: { name: "Chidi O.", isVerified: true } },
  { id: "2", city: "Paris", country: "France", region: "Europe", type: "APARTMENT", title: "Charming 1BR in Montmartre District", pricePerNight: 85, pricePerMonth: 1800, discountPercent: 30, avgRating: 4.9, _count: { reviews: 67 }, photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"], amenities: ["WiFi","Kitchen","Balcony","Metro"], host: { name: "Sophie M.", isVerified: true } },
  { id: "3", city: "Bali", country: "Indonesia", region: "Asia", type: "SHARED_HOUSING", title: "Coliving Villa with Pool in Canggu", pricePerNight: 35, pricePerMonth: 750, discountPercent: 35, avgRating: 4.7, _count: { reviews: 89 }, photos: ["https://images.unsplash.com/photo-1540541338537-7e3e5c9e1f89?w=600&q=80"], amenities: ["WiFi","Pool","Coworking","Kitchen"], host: { name: "Made B.", isVerified: true } },
  { id: "4", city: "Medellín", country: "Colombia", region: "South America", type: "APARTMENT", title: "Modern Flat in El Poblado", pricePerNight: 32, pricePerMonth: 680, discountPercent: 22, avgRating: 4.7, _count: { reviews: 38 }, photos: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80"], amenities: ["WiFi","Gym","Pool","Security"], host: { name: "Valentina G.", isVerified: true } },
  { id: "5", city: "Lisbon", country: "Portugal", region: "Europe", type: "APARTMENT", title: "Sunny 2BR in Alfama with River Views", pricePerNight: 70, pricePerMonth: 1500, discountPercent: 28, avgRating: 4.8, _count: { reviews: 44 }, photos: ["https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&q=80"], amenities: ["WiFi","Kitchen","Terrace","Washer"], host: { name: "Ana R.", isVerified: true } },
  { id: "6", city: "Accra", country: "Ghana", region: "Africa", type: "APARTMENT", title: "Executive Flat in East Legon", pricePerNight: 45, pricePerMonth: 980, discountPercent: 20, avgRating: 4.5, _count: { reviews: 15 }, photos: ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&q=80"], amenities: ["WiFi","AC","Security","Generator"], host: { name: "Kofi A.", isVerified: false } },
];

const FALLBACK_BUDGET = {
  Lagos:    { accommodation: 620,  food: 180, transport: 80,  activities: 60,  utilities: 40 },
  Paris:    { accommodation: 1800, food: 500, transport: 80,  activities: 300, utilities: 100 },
  Bali:     { accommodation: 750,  food: 200, transport: 90,  activities: 120, utilities: 50 },
  Lisbon:   { accommodation: 1500, food: 350, transport: 60,  activities: 200, utilities: 80 },
  Medellín: { accommodation: 680,  food: 160, transport: 50,  activities: 80,  utilities: 40 },
  Nairobi:  { accommodation: 390,  food: 150, transport: 70,  activities: 50,  utilities: 30 },
};

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
const Badge = ({ text, color = "#2E75B6" }) => (
  <span style={{ background: color + "18", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{text}</span>
);

const Stars = ({ rating }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <span style={{ color: "#F59E0B" }}>★</span>
    <span style={{ fontSize: 13, fontWeight: 600 }}>{rating ?? "New"}</span>
  </span>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
    <div style={{ width: 36, height: 36, border: "4px solid #E5E7EB", borderTopColor: "#1A3C5E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const Toast = ({ msg, type = "success" }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? "#065F46" : "#991B1B", color: "#fff", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "slideUp 0.3s ease" }}>
    <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    {type === "success" ? "✅ " : "❌ "}{msg}
  </div>
);

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({ listing, onClick }) {
  const savings = Math.round(listing.pricePerMonth * (listing.discountPercent / 100));
  const photo = listing.photos?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80";
  const typeLabel = listing.type?.replace("_", " ") || "Listing";
  return (
    <div onClick={() => onClick(listing)} style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}>
      <div style={{ position: "relative" }}>
        <img src={photo} alt={listing.title} style={{ width: "100%", height: 200, objectFit: "cover" }} onError={e => e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {listing.host?.isVerified && <Badge text="✓ Verified" color="#16A34A" />}
          {listing.discountPercent > 0 && <Badge text={`-${listing.discountPercent}% monthly`} color="#DC2626" />}
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 600, color: "#1A3C5E" }}>{typeLabel}</div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>{listing.city}, {listing.country}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8, lineHeight: 1.3 }}>{listing.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1A3C5E" }}>${listing.pricePerMonth}</span>
            <span style={{ fontSize: 12, color: "#6B7280" }}>/mo</span>
            {savings > 0 && <span style={{ fontSize: 11, color: "#16A34A", marginLeft: 6 }}>Save ${savings}</span>}
          </div>
          <Stars rating={listing.avgRating} />
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>${listing.pricePerNight}/night · {listing._count?.reviews || 0} reviews</div>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "TRAVELER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const data = await api.post(endpoint, body);
      localStorage.setItem("flyplans_token", data.token);
      onSuccess(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: 400, maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1A3C5E", marginBottom: 4 }}>✈️ FlyPlans</div>
        <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 24 }}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
        {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        {mode === "register" && (
          <input placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} />
        )}
        <input placeholder="Email" value={form.email} onChange={e => set("email", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} />
        <input type="password" placeholder="Password" value={form.password} onChange={e => set("password", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} />
        {mode === "register" && (
          <select value={form.role} onChange={e => set("role", e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", marginBottom: 12, fontSize: 14, boxSizing: "border-box" }}>
            <option value="TRAVELER">I'm a Traveler</option>
            <option value="HOST">I'm a Host</option>
          </select>
        )}
        <button onClick={submit} disabled={loading}
          style={{ width: "100%", background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
          {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
        </button>
        <div style={{ textAlign: "center", fontSize: 14, color: "#6B7280" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "#2E75B6", cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Sign up" : "Log in"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ navigate, setSearchQuery, user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/listings?limit=4").then(d => setListings(d.data)).catch(() => setListings(FALLBACK_LISTINGS.slice(0, 4))).finally(() => setLoading(false));
  }, []);

  const DESTINATIONS = [
    { name: "Africa", emoji: "🌍", img: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80" },
    { name: "Europe", emoji: "🏰", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80" },
    { name: "Asia",   emoji: "🏯", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80" },
    { name: "South America", emoji: "🌎", img: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&q=80" },
  ];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0F2740 0%, #1A3C5E 50%, #2E75B6 100%)", color: "#fff", padding: "80px 24px 100px", textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: "#93C5FD", marginBottom: 16, textTransform: "uppercase", fontWeight: 600 }}>✈️ Affordable Long-Stay Travel</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 54px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          Find Your Perfect Home<br /><span style={{ color: "#60A5FA" }}>Anywhere in the World</span>
        </h1>
        <p style={{ fontSize: 17, color: "#CBD5E1", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Budget-friendly long-stay accommodations in Africa, Europe, Asia & the Americas. Save up to 60%.
        </p>
        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 20, maxWidth: 640, margin: "0 auto", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input placeholder="City or country…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && (setSearchQuery(query), navigate("search"))}
              style={{ flex: 2, minWidth: 160, padding: "12px 16px", borderRadius: 10, border: "none", fontSize: 14, outline: "none" }} />
            <button onClick={() => { setSearchQuery(query); navigate("search"); }}
              style={{ background: "#2E75B6", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Search
            </button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 48, flexWrap: "wrap" }}>
          {[["500+","Verified Hosts"],["45","Countries"],["10k+","Travelers"],["60%","Max Savings"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#60A5FA" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ padding: "56px 0 32px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 24 }}>Explore by Region</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {DESTINATIONS.map(d => (
              <div key={d.name} onClick={() => { setSearchQuery(d.name); navigate("search"); }} style={{ cursor: "pointer", borderRadius: 14, overflow: "hidden", position: "relative", height: 170 }}>
                <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
                <div style={{ position: "absolute", bottom: 16, left: 16, color: "#fff" }}>
                  <div style={{ fontSize: 22 }}>{d.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{d.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>Featured Long-Stay Deals</h2>
            <button onClick={() => navigate("search")} style={{ background: "transparent", border: "2px solid #1A3C5E", color: "#1A3C5E", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View All</button>
          </div>
          {loading ? <Spinner /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
              {listings.map(l => <ListingCard key={l.id} listing={l} onClick={l => navigate("listing", l)} />)}
            </div>
          )}
        </div>

        <div style={{ background: "linear-gradient(135deg, #1A3C5E, #2E75B6)", borderRadius: 20, padding: "44px 36px", color: "#fff", marginBottom: 56, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#93C5FD", marginBottom: 10, textTransform: "uppercase", fontWeight: 600 }}>Free Tool</div>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Plan Your Travel Budget</h3>
            <p style={{ color: "#CBD5E1", maxWidth: 400, lineHeight: 1.6, fontSize: 15 }}>Calculate real monthly costs before you book — accommodation, food, transport & more.</p>
          </div>
          <button onClick={() => navigate("budget")} style={{ background: "#fff", color: "#1A3C5E", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>Try Budget Planner →</button>
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH PAGE ─────────────────────────────────────────────────────────────
function SearchPage({ navigate, initialQuery }) {
  const [query, setQuery]     = useState(initialQuery || "");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType]       = useState("All");
  const [region, setRegion]   = useState("All");
  const [maxPrice, setMaxPrice] = useState(3000);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20 });
      if (query)            params.append("city", query);
      if (type !== "All")   params.append("type", type.toUpperCase().replace(/ /g, "_"));
      if (region !== "All") params.append("region", region);
      if (maxPrice < 3000)  params.append("maxPrice", maxPrice);
      const data = await api.get(`/listings?${params}`);
      setListings(data.data);
    } catch {
      // fallback
      setListings(FALLBACK_LISTINGS.filter(l => {
        const q = query.toLowerCase();
        return (!q || l.city.toLowerCase().includes(q) || l.region?.toLowerCase().includes(q))
          && (type === "All" || l.type === type.toUpperCase().replace(/ /g, "_"))
          && (region === "All" || l.region === region)
          && l.pricePerMonth <= maxPrice;
      }));
    } finally {
      setLoading(false);
    }
  }, [query, type, region, maxPrice]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #E5E7EB", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input placeholder="Search city or region…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchListings()}
          style={{ flex: 2, minWidth: 160, padding: "9px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, outline: "none" }} />
        <button onClick={fetchListings} style={{ background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Search</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content", border: "1px solid #E5E7EB" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "#111827" }}>Filters</div>
          {[["Property Type", ["All","Apartment","Private Room","Shared Housing","Studio"], type, setType],
            ["Region", ["All","Africa","Europe","Asia","South America","Middle East"], region, setRegion]
          ].map(([label, opts, val, setter]) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
              {opts.map(o => (
                <button key={o} onClick={() => setter(o)} style={{ display: "block", width: "100%", textAlign: "left", background: val === o ? "#EBF3FA" : "transparent", color: val === o ? "#1A3C5E" : "#374151", border: "none", borderRadius: 6, padding: "7px 10px", fontSize: 13, cursor: "pointer", fontWeight: val === o ? 600 : 400, marginBottom: 2 }}>{o}</button>
              ))}
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase" }}>Max Monthly Budget</div>
            <input type="range" min={200} max={3000} step={50} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={{ width: "100%" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A3C5E", marginTop: 4 }}>Up to ${maxPrice}/mo</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>{listings.length} stays found</div>
          {loading ? <Spinner /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {listings.map(l => <ListingCard key={l.id} listing={l} onClick={l => navigate("listing", l)} />)}
              {listings.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#9CA3AF" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>No stays found</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>Try adjusting your filters</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LISTING DETAIL PAGE ─────────────────────────────────────────────────────
function ListingPage({ listing: initial, navigate, user, showAuth }) {
  const [listing, setListing] = useState(initial);
  const [nights, setNights]   = useState(30);
  const [booked, setBooked]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    if (initial?.id) {
      api.get(`/listings/${initial.id}`).then(setListing).catch(() => {});
    }
  }, [initial?.id]);

  if (!listing) return <div style={{ padding: 40, textAlign: "center" }}>Listing not found.</div>;

  const nights30 = nights >= 30;
  const total    = nights30 ? +(listing.pricePerMonth * (nights / 30) * (1 - listing.discountPercent / 100)).toFixed(2) : +(listing.pricePerNight * nights).toFixed(2);
  const savings  = nights30 ? +((listing.pricePerNight * nights) - total).toFixed(2) : 0;
  const photo    = listing.photos?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80";

  const handleBook = async () => {
    if (!user) { showAuth(); return; }
    setLoading(true);
    try {
      const checkIn  = new Date();
      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + nights);
      await api.post("/bookings", { listingId: listing.id, checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), guests: 1 });
      setBooked(true);
      setToast({ msg: "Booking request sent!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <button onClick={() => navigate("search")} style={{ background: "transparent", border: "none", color: "#2E75B6", fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 600 }}>← Back to Search</button>
      <img src={photo} alt={listing.title} style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 18, marginBottom: 28 }} onError={e => e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 36 }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {listing.type && <Badge text={listing.type.replace("_", " ")} />}
            {listing.region && <Badge text={listing.region} />}
            {listing.host?.isVerified && <Badge text="✓ Host Verified" color="#16A34A" />}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 8 }}>{listing.title}</h1>
          <div style={{ color: "#6B7280", marginBottom: 20 }}>📍 {listing.city}, {listing.country}</div>
          <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
            {[["$" + listing.pricePerNight, "per night"],["$" + listing.pricePerMonth, "per month"],["-" + listing.discountPercent + "%", "monthly off"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: label === "monthly off" ? "#DC2626" : "#1A3C5E" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
              </div>
            ))}
          </div>
          {listing.amenities?.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Amenities</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {listing.amenities.map(a => <span key={a} style={{ background: "#F3F4F6", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: "#374151" }}>✓ {a}</span>)}
              </div>
            </>
          )}
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>About this Stay</h3>
          <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}>{listing.description || `A comfortable, well-equipped space ideal for long-term stays in ${listing.city}. Perfect for digital nomads, students, and remote workers.`}</p>
          {listing.host && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, background: "#F8FAFC", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1A3C5E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>{listing.host.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{listing.host.name}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{listing.host.isVerified ? "✓ Verified Host" : "Host"}</div>
              </div>
              <div style={{ marginLeft: "auto" }}><Stars rating={listing.avgRating} /></div>
            </div>
          )}
          {listing.reviews?.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Reviews ({listing._count?.reviews})</h3>
              {listing.reviews.slice(0, 3).map(r => (
                <div key={r.id} style={{ background: "#F8FAFC", borderRadius: 10, padding: 14, marginBottom: 10, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.author?.name}</span>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ fontSize: 13, color: "#4B5563", margin: 0 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Card */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "1px solid #E5E7EB", height: "fit-content", position: "sticky", top: 90 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#1A3C5E", marginBottom: 4 }}>${listing.pricePerMonth}<span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400 }}>/month</span></div>
          {listing.discountPercent > 0 && <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 600, marginBottom: 16 }}>Save {listing.discountPercent}% on monthly stays</div>}
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Length of Stay (nights)</label>
          <input type="number" min={1} max={365} value={nights} onChange={e => setNights(Math.max(1, +e.target.value))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>${listing.pricePerNight} × {nights} nights</span>
              <span style={{ fontSize: 13 }}>${(listing.pricePerNight * nights).toFixed(0)}</span>
            </div>
            {savings > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#16A34A" }}>Long-stay discount</span>
                <span style={{ fontSize: 13, color: "#16A34A" }}>-${savings}</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#1A3C5E" }}>${total}</span>
            </div>
          </div>
          {!booked ? (
            <button onClick={handleBook} disabled={loading}
              style={{ width: "100%", background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {loading ? "Sending…" : user ? "Request to Book" : "Sign In to Book"}
            </button>
          ) : (
            <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
              <div style={{ fontWeight: 700, color: "#065F46" }}>Request Sent!</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Host responds within 24 hrs</div>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 10 }}>Not charged until host accepts</div>
        </div>
      </div>
    </div>
  );
}

// ─── BUDGET PAGE ──────────────────────────────────────────────────────────────
function BudgetPage() {
  const [city, setCity]     = useState("Lagos");
  const [months, setMonths] = useState(3);
  const [data, setData]     = useState(null);
  const [cities, setCities] = useState(Object.keys(FALLBACK_BUDGET));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/budget/cities").then(d => setCities(d.map(c => c.city))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`/budget?city=${city}&months=${months}`)
      .then(setData)
      .catch(() => {
        const fb = FALLBACK_BUDGET[city];
        if (fb) {
          const monthly = Object.values(fb).reduce((a, b) => a + b, 0);
          setData({ city, months, breakdown: Object.fromEntries(Object.entries(fb).map(([k,v]) => [k, v * months])), monthlyTotal: monthly, grandTotal: monthly * months, hotelComparison: +(monthly * 2.5 * months).toFixed(0), savings: +((monthly * 2.5 - monthly) * months).toFixed(0) });
        }
      }).finally(() => setLoading(false));
  }, [city, months]);

  const colors = { accommodation: "#1A3C5E", food: "#2E75B6", transport: "#60A5FA", activities: "#93C5FD", utilities: "#BFDBFE" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, color: "#111827", marginBottom: 6 }}>✈️ Travel Budget Planner</h1>
      <p style={{ color: "#6B7280", marginBottom: 36, fontSize: 15 }}>Calculate your real monthly costs before you book</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Destination City</label>
          <select value={city} onChange={e => setCity(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14, outline: "none" }}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Duration: {months} month{months > 1 ? "s" : ""}</label>
          <input type="range" min={1} max={12} value={months} onChange={e => setMonths(+e.target.value)} style={{ width: "100%", marginTop: 18 }} />
        </div>
      </div>
      {loading ? <Spinner /> : data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Breakdown — {data.city}</div>
            {data.breakdown && Object.entries(data.breakdown).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, textTransform: "capitalize", fontWeight: 500 }}>{key}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A3C5E" }}>${val}</span>
                </div>
                <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3 }}>
                  <div style={{ height: 5, background: colors[key] || "#1A3C5E", borderRadius: 3, width: `${(val / data.grandTotal) * 100}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: "2px solid #E5E7EB", paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 19, color: "#1A3C5E" }}>${data.grandTotal}</span>
            </div>
          </div>
          <div>
            <div style={{ background: "linear-gradient(135deg, #1A3C5E, #2E75B6)", borderRadius: 16, padding: 22, color: "#fff", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#93C5FD", marginBottom: 6 }}>TOTAL FOR {months} MONTH{months > 1 ? "S" : ""}</div>
              <div style={{ fontSize: 40, fontWeight: 900 }}>${data.grandTotal?.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: "#CBD5E1", marginTop: 6 }}>All-inclusive estimate</div>
            </div>
            <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>💡 VS. HOTEL STAY</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#92400E" }}>${data.hotelComparison?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#78350F", marginTop: 4 }}>Estimated hotel cost</div>
              <div style={{ marginTop: 10, background: "#FFF7ED", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#D97706" }}>
                You save ${data.savings?.toLocaleString()} with FlyPlans! 🎉
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, navigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const endpoint = user.role === "HOST" ? "/bookings/host" : "/bookings/traveler";
    api.get(endpoint).then(setBookings).catch(() => setBookings([])).finally(() => setLoading(false));
  }, [user.role]);

  const statusColor = { PENDING: "#D97706", CONFIRMED: "#16A34A", CANCELLED: "#DC2626", COMPLETED: "#6B7280" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 4 }}>Welcome back, {user.name} 👋</h1>
      <p style={{ color: "#6B7280", marginBottom: 32 }}>{user.role === "HOST" ? "Manage your listings and bookings" : "Track your stays and bookings"}</p>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{user.role === "HOST" ? "Incoming Booking Requests" : "My Bookings"}</h2>
      {loading ? <Spinner /> : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9CA3AF", background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600 }}>No bookings yet</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map(b => (
            <div key={b.id} style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.listing?.title}</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                  {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()} · {b.totalNights} nights
                </div>
                {user.role === "HOST" && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>From: {b.traveler?.name}</div>}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontWeight: 800, color: "#1A3C5E" }}>${b.totalPrice}</span>
                <span style={{ background: (statusColor[b.status] || "#6B7280") + "18", color: statusColor[b.status] || "#6B7280", border: `1px solid ${statusColor[b.status] || "#6B7280"}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function FlyPlansApp() {
  const [page, setPage]           = useState("home");
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser]           = useState(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [toast, setToast]         = useState(null);

  // Restore session on load
  useEffect(() => {
    const token = localStorage.getItem("flyplans_token");
    if (token) api.get("/auth/me").then(setUser).catch(() => localStorage.removeItem("flyplans_token"));
  }, []);

  const navigate = (p, data = null) => { setPage(p); if (data) setSelectedListing(data); window.scrollTo(0, 0); };
  const logout   = () => { localStorage.removeItem("flyplans_token"); setUser(null); navigate("home"); };
  const onAuth   = (u) => { setUser(u); setShowAuth(false); setToast({ msg: `Welcome, ${u.name}!`, type: "success" }); setTimeout(() => setToast(null), 3000); };

  const navItems = [{ key: "search", label: "Find Stays" }, { key: "budget", label: "Budget Planner" }];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={onAuth} />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>✈️</span>
            <span style={{ fontSize: 19, fontWeight: 900, color: "#1A3C5E", letterSpacing: -0.5 }}>FlyPlans</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {navItems.map(l => (
              <button key={l.key} onClick={() => navigate(l.key)} style={{ background: page === l.key ? "#EBF3FA" : "transparent", color: page === l.key ? "#1A3C5E" : "#374151", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l.label}</button>
            ))}
            {user ? (
              <>
                <button onClick={() => navigate("dashboard")} style={{ background: page === "dashboard" ? "#EBF3FA" : "transparent", color: "#374151", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Dashboard</button>
                <button onClick={logout} style={{ background: "transparent", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Log out</button>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1A3C5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, marginLeft: 4 }}>{user.name?.[0]}</div>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} style={{ background: "transparent", border: "1px solid #D1D5DB", color: "#374151", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Log in</button>
                <button onClick={() => setShowAuth(true)} style={{ background: "#1A3C5E", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Sign up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {page === "home"      && <HomePage navigate={navigate} setSearchQuery={setSearchQuery} user={user} />}
      {page === "search"    && <SearchPage navigate={navigate} initialQuery={searchQuery} />}
      {page === "listing"   && <ListingPage listing={selectedListing} navigate={navigate} user={user} showAuth={() => setShowAuth(true)} />}
      {page === "budget"    && <BudgetPage />}
      {page === "dashboard" && user && <Dashboard user={user} navigate={navigate} />}

      <footer style={{ background: "#0F2740", color: "#CBD5E1", padding: "44px 24px 28px", marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>✈️</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>FlyPlans</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: "#94A3B8" }}>Making global travel affordable, safe, and accessible for everyone.</p>
          </div>
          {[["Travelers", ["Find Stays","Budget Planner","Long-Stay Deals"]],["Hosts", ["List Your Space","Host Dashboard","Verification"]],["Company", ["About Us","Blog","Contact"]]].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 10, fontSize: 14 }}>{title}</div>
              {links.map(l => <div key={l} style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1E3A5F", marginTop: 28, paddingTop: 20, textAlign: "center", fontSize: 11, color: "#64748B" }}>
          © 2025 FlyPlans · Making the world smaller, one long stay at a time.
        </div>
      </footer>
    </div>
  );
}
