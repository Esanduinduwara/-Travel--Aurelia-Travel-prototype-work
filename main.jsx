import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate, Link } from 'react-router-dom';
import {
  Menu, X, Search, ArrowUpRight, Compass, Sparkles, MapPin, Send, Camera, MessageCircle,
  CirclePlay, Play, ShieldCheck, Clock3, Globe2, CalendarDays, Plane, Route as RouteIcon,
  Info, Bot, Minimize2, LogIn, LogOut, User, Settings, Trash2, Edit, Plus, Eye, EyeOff,
  Lock, Mail, UserPlus, Shield, ChevronDown, Check, AlertCircle, RefreshCw, List, Grid,
  LayoutDashboard, Filter, CheckCircle2, Archive
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');
const img = (q, w = 1200) => `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=${w}&q=85`;

const DESTINATIONS = {
  1: { id: 1, name: 'Sri Lanka', region: 'Asia', country: 'Sri Lanka', image: img('1586500036706-41963de24d8b'), tag: 'Wild - Soulful - Slow', headline: 'Tea country, wildlife, ancient cities and warm Indian Ocean coastlines in one compact island.', intro: 'Sri Lanka works beautifully for travellers who want variety without long internal flights. A strong first trip can connect the Cultural Triangle, Kandy or tea country, Yala or Wilpattu for safari, Galle Fort, and a southern or east-coast beach stay.', bestTime: 'December to April is usually strongest for the south and west coasts; May to September is better for the east coast. The island has regional monsoons, so the best route depends on the coast you want.', length: '10 to 14 days', highlights: ['Sigiriya and the Cultural Triangle', 'Kandy and the central highlands', 'Tea estates around Nuwara Eliya or Hatton', 'Leopard and elephant safari in Yala or Wilpattu', 'Galle Fort and the southern coast'], experiences: ['Private tea tasting with an estate expert', 'Scenic rail journey through the hill country', 'Dawn climb or guided heritage walk at Sigiriya', 'Wildlife drive with a responsible naturalist', 'A slower beach finish in Tangalle, Weligama, or Trincomalee'], planning: ['Road transfers are scenic but can be slow; avoid packing too many regions into a short stay.', 'For wildlife, choose ethical operators and keep distance from animals.', 'Temple visits require covered shoulders and knees.'], sourceName: 'Sri Lanka Tourism', sourceUrl: 'https://srilanka.travel/what-to-do' },
  2: { id: 2, name: 'Amalfi Coast', region: 'Europe', country: 'Italy', image: img('1533105079780-92b9be482077'), tag: 'Romance - Sea - Culture', headline: 'A dramatic UNESCO-listed coastline of cliffside towns, sea views, history, and southern Italian food.', intro: 'The Amalfi Coast is best experienced slowly. Positano, Amalfi, Ravello, Atrani, and the coastal road are the classic draw, but the strongest journeys balance boat time, village walks, gardens, local dining, and quieter bases away from the busiest hours.', bestTime: 'May, June, September, and early October often give the best balance of warm weather and manageable crowds. July and August are peak season and need careful planning.', length: '4 to 7 days', highlights: ['Positano and its vertical streets', 'Amalfi Cathedral and historic centre', 'Ravello gardens and views', 'Boat day along the coast or to Capri', 'Path of the Gods hiking route'], experiences: ['Private boat charter at golden hour', 'Lemon grove visit and cooking class', 'Ravello music or garden-focused day', 'Driver-guided coastal route with village stops', 'Stay in a quieter town and visit the famous places early'], planning: ['Traffic and parking are difficult in high season; use private transfers, ferries, or planned drivers.', 'Book hotels and restaurants early for summer.', 'The coastline has many stairs, so hotel location matters.'], sourceName: 'Italia.it / Official Italy Tourism', sourceUrl: 'https://www.italia.it/en/campania/costiera-amalfitana' },
  3: { id: 3, name: 'Namibia', region: 'Africa', country: 'Namibia', image: img('1548013146-72479768bada'), tag: 'Desert - Wilderness - Wonder', headline: 'Big-sky desert landscapes, wildlife, remote lodges, and some of Africa\'s most cinematic road journeys.', intro: 'Namibia is ideal for travellers who want space, photography, desert silence, and wildlife without a traditional safari-only itinerary. A refined route can connect Windhoek, Sossusvlei, Swakopmund, Damaraland, and Etosha or a private conservancy.', bestTime: 'May to October is the dry season and generally best for wildlife viewing and cooler desert conditions. November to April can bring greener landscapes, heat, and summer rain.', length: '10 to 14 days', highlights: ['Sossusvlei and Deadvlei dunes', 'Damaraland desert-adapted wildlife', 'Etosha National Park', 'Skeleton Coast flights or remote stays', 'Swakopmund and Walvis Bay marine experiences'], experiences: ['Scenic flight over dunes or the Skeleton Coast', 'Private desert dinner under dark skies', 'Tracking desert-adapted elephant or rhino with guides', 'Hot-air ballooning near Sossusvlei', 'Photographic road journey through Damaraland'], planning: ['Distances are long; fly-in logistics or a careful self-drive plan make a major difference.', 'Desert temperatures swing sharply between day and night.', 'Choose lodges with strong conservation partnerships where possible.'], sourceName: 'Visit Namibia', sourceUrl: 'https://visitnamibia.com.na/namibia-at-a-glance/' },
  4: { id: 4, name: 'Japan', region: 'Asia', country: 'Japan', image: img('1528360983277-13d401cdc186'), tag: 'Ritual - Food - Discovery', headline: 'A layered journey through temples, design, food culture, mountain landscapes, and ultra-efficient cities.', intro: 'Japan rewards both first-time and repeat travellers because each region feels distinct. A strong first journey often combines Tokyo, Kyoto, Kanazawa or Takayama, Hakone or the Japanese Alps, and a carefully chosen food or ryokan stay.', bestTime: 'March to May and October to November are highly popular for spring blossom and autumn colour. Winter is excellent for snow, hot springs, and quieter cultural travel; summer can be humid but festival-rich.', length: '10 to 14 days', highlights: ['Tokyo neighbourhoods and dining', 'Kyoto temples, gardens, and craft traditions', 'Hakone or another onsen region', 'Kanazawa, Takayama, or the Japanese Alps', 'Hiroshima, Naoshima, Hokkaido, or Okinawa as add-ons'], experiences: ['Private food walk in Tokyo or Osaka', 'Tea ceremony or craft studio in Kyoto', 'Ryokan stay with onsen bathing', 'Garden and temple visit before public opening where possible', 'Regional train journey with luggage forwarding'], planning: ['Book standout restaurants, ryokan, and guides early in blossom and autumn seasons.', 'Use luggage forwarding to make train travel easier.', 'Etiquette matters at temples, ryokan, and onsen; a short briefing helps.'], sourceName: 'Japan National Tourism Organization', sourceUrl: 'https://www.japan.travel/en/gc/' },
  5: { id: 5, name: 'Patagonia', region: 'Americas', country: 'Argentina and Chile', image: img('1500530855697-b586d89ba3ee'), tag: 'Wild - Vast - Adventure', headline: 'Glaciers, granite peaks, wind-shaped steppe, and some of the world\'s most memorable trekking landscapes.', intro: 'Patagonia spans southern Argentina and Chile, so the best itinerary depends on whether you want trekking, glaciers, lodges, road journeys, or photography. First trips often include El Calafate, El Chalten, Torres del Paine, or Ushuaia.', bestTime: 'November to March is the main travel season for hiking and longer daylight. October and April can be quieter shoulder months, with more variable conditions.', length: '10 to 16 days', highlights: ['Perito Moreno Glacier near El Calafate', 'Mount Fitz Roy hikes from El Chalten', 'Torres del Paine National Park', 'Ushuaia and Tierra del Fuego', 'Lakes, estancias, and remote lodge stays'], experiences: ['Guided glacier viewing or ice trekking where appropriate', 'Private trekking plan matched to fitness', 'Stay at an estancia for riding and Patagonian food', 'Puma tracking or wildlife photography in Chilean Patagonia', 'Boat navigation among ice and mountain scenery'], planning: ['Weather changes quickly; pack technical layers even in summer.', 'Border crossings and park logistics need careful sequencing.', 'Popular lodges and refugios sell out early for peak hiking months.'], sourceName: 'Visit Argentina / Chile Travel', sourceUrl: 'https://www.argentina.travel/en/news/where-is-patagonia-a-guide-to-discovering-argentine-patagonia' },
  6: { id: 6, name: 'Maldives', region: 'Indian Ocean', country: 'Maldives', image: img('1507525428034-b723cf961d3e'), tag: 'Barefoot - Ocean - Escape', headline: 'Private-island resorts, coral atolls, marine life, water villas, and a calm rhythm built around the sea.', intro: 'The Maldives is strongest when the island choice fits the traveller. Some resorts are best for reef access, others for food, privacy, wellness, family facilities, diving, surfing, or a castaway-style honeymoon.', bestTime: 'December to April is the classic dry season. May to November can bring more rain but also strong value, quieter resorts, and good marine-life periods in selected atolls.', length: '5 to 9 days', highlights: ['House reefs and guided snorkelling', 'Baa Atoll and marine biodiversity', 'North Male and South Ari diving areas', 'Private sandbank or sunset cruises', 'Male heritage stops for longer transits'], experiences: ['Overwater villa or beach pool villa stay', 'Manta ray or whale shark excursion with responsible operators', 'Private dhoni cruise at sunset', 'Wellness retreat with ocean-based treatments', 'Split stay between two resort styles'], planning: ['Choose the island before the room category; transfer type and reef quality shape the whole trip.', 'Seaplane transfers usually operate in daylight hours.', 'Respect local customs when visiting inhabited islands outside resort zones.'], sourceName: 'Visit Maldives', sourceUrl: 'https://visitmaldives.com/en/places' },
  7: { id: 7, name: 'The Aegean', region: 'Europe', country: 'Greece', image: img('1533105079780-92b9be482077'), tag: 'Sailing - Sun - Island Life', headline: 'A private Greek-island journey shaped around clear water, whitewashed villages, harbour dinners, and long unhurried days at sea.', intro: 'An Aegean sailing journey is less about racing through famous islands and more about choosing the right rhythm. A considered route can combine a Cycladic island such as Paros, Naxos, or Serifos with quiet coves, village walks, local food, and a few nights ashore before or after time on the water.', bestTime: 'Late May to June and September to early October usually combine warm seas with gentler crowds. July and August are the busiest months and can bring stronger meltemi winds in the Cyclades.', length: '7 to 10 days', highlights: ['Cycladic island villages and harbours', 'Private sailing between sheltered coves', 'Naxos, Paros, Serifos, or nearby islands', 'Swim stops in clear Aegean water', 'Harbour tavernas and sunset dining'], experiences: ['Private skipper and flexible island route', 'Morning swim before the day boats arrive', 'Market visit and a local Greek cooking experience', 'A slow afternoon in a small Cycladic village', 'Sunset dinner aboard or by a quiet harbour'], planning: ['Wind conditions, ferry schedules, and berth availability shape every route, especially in July and August.', 'Choose islands based on the experience you want: livelier Mykonos differs greatly from quieter islands such as Serifos.', 'A private crewed boat or local skipper gives the most flexibility and avoids self-navigation pressure.'], sourceName: 'Visit Greece', sourceUrl: 'https://www.visitgreece.gr/en/islands/Kykladen/Serifos' }
};

const FALLBACK = Object.values(DESTINATIONS).map(({ id, name, region, country, image, tag }) => ({ id, name, region, country, image, tag }));
const experiences = [
  { title: 'Private desert camp', place: 'Namibia', type: 'Adventure', destinationId: 3, image: img('1548013146-72479768bada') },
  { title: 'Tea country by rail', place: 'Sri Lanka', type: 'Slow travel', destinationId: 1, image: img('1500534623283-312aade485b7') },
  { title: 'After-hours Kyoto', place: 'Japan', type: 'Culture', destinationId: 4, image: img('1493976040374-85c8e12f0c0e') },
  { title: 'Sail the Aegean', place: 'Greece', type: 'Beach', destinationId: 7, image: img('1533105079780-92b9be482077') }
];
const testimonials = [
  ['"The trip felt as if it had been imagined just for us. Every transition was effortless, and every day surprised us."', 'Amelia - London'],
  ['"We gave them a feeling, not an itinerary. They turned it into a journey we will talk about for decades."', 'Daniel - Singapore'],
  ['"Exceptional attention to detail, but never at the expense of spontaneity."', 'Sofia - New York']
];

const STORIES = {
  'art-of-getting-lost': {
    id: 'art-of-getting-lost',
    number: '01',
    eyebrow: 'FIELD NOTES / 01',
    title: 'The art of getting gloriously lost.',
    subtitle: 'Why the best journeys leave just enough room for the unexpected.',
    image: img('1518548419970-58e3b4079ab2'),
    author: 'Elena Vance — Senior Travel Curator',
    readTime: '6 min read',
    intro: 'In an era of hyper-optimized schedules, algorithmic recommendations, and minute-by-minute travel itineraries, the rarest luxury is unplanned discovery. When every turn is foretold by a map, wonder is the first casualty.',
    paragraphs: [
      'True bespoke travel is not simply about exclusivity or fine dining; it is about intentional margin. It is the art of arriving in an ancient coastal hamlet or high-altitude mountain village with world-class accommodations confirmed, yet zero rigid appointments for the afternoon.',
      'One of our clients recently remarked after their journey through Sri Lanka and Kyoto: "We followed your private tea tasting and the sunrise climb, but our favorite morning was when we took a turn off the marked stone pathway and stumbled upon an 80-year-old artisan finishing cedar screens in quiet contemplation." That moment was never on a TripAdvisor list. It belonged purely to them.',
      'When Aurelia crafts your expedition, we ensure the infrastructure—private transfers, sanctuary retreats, guides of immense regional stature—is flawless. But we deliberately preserve empty golden hours. It is in those quiet cracks that memories crystallize.'
    ],
    highlights: [
      'Unstructured afternoons woven into every signature itinerary',
      'Local curators who provide cultural keys rather than rigid tour scripts',
      'Private retreats positioned within walking distance of untouched alleys and secluded viewpoints'
    ],
    relatedDestinationId: 4,
    relatedDestinationName: 'Japan'
  },
  'patagonia-wild': {
    id: 'patagonia-wild',
    number: '02',
    eyebrow: 'FIELD NOTES / 02',
    title: 'A week in the wild: Patagonia',
    subtitle: 'Facing granite spires, roaring glacial winds, and the sublime stillness of the edge of the world.',
    image: img('1500530855697-b586d89ba3ee'),
    author: 'Mateo Rossi — Expedition Designer',
    readTime: '8 min read',
    intro: 'Patagonia is not a place you conquer; it is a raw wilderness that demands you surrender your pace to its glacial rhythms and shifting southern winds.',
    paragraphs: [
      'Stretching across the dramatic frontiers of Argentina and Chile, Patagonia holds some of the planet’s most pristine ecosystems. From the ice towers of the Perito Moreno Glacier to the jagged horn peaks of Torres del Paine, every vista feels larger than life.',
      'Our approach to Patagonia pairs intense physical immersion—private glacier trekking, horseback crossings with local gauchos, and wildlife tracking for the elusive Patagonian puma—with deeply restorative sanctuaries. Imagine returning from a 15-mile granite hike to a glass-walled estancia warmed by native wood fires, sipping a reserve Malbec while watching guanacos graze beneath the Southern Cross.',
      'The sheer contrast between elemental raw power and refined sanctuary comfort is what makes this expedition an unforgettable rite of passage.'
    ],
    highlights: [
      'Private boat navigations through turquoise glacial fjords away from commercial routes',
      'Helicopter transfers that reveal panoramic views of the Southern Patagonian Ice Field',
      'Stays at sustainable luxury estancias dedicated to wildlife conservation and land regeneration'
    ],
    relatedDestinationId: 5,
    relatedDestinationName: 'Patagonia'
  },
  'where-to-disappear': {
    id: 'where-to-disappear',
    number: '03',
    eyebrow: 'FIELD NOTES / 03',
    title: 'Where to go when you want to disappear',
    subtitle: 'From the silence of Namibian dunes to private atolls in the deep Indian Ocean.',
    image: img('1548013146-72479768bada'),
    author: 'Aria Chen — Island & Solitude Specialist',
    readTime: '5 min read',
    intro: 'The modern world is ceaselessly loud. Silence has quietly become the single greatest luxury of our generation.',
    paragraphs: [
      'When our travellers ask for sanctuary—not merely a vacation, but a true reset—we steer them toward landscapes where human presence is swallowed by ancient geography.',
      'In Namibia’s Sossusvlei and Damaraland, silence has a physical weight. The rust-red dunes shift imperceptibly under billion-star skies, interrupted only by the breeze and the tracks of desert-adapted elephants. You can sit on a private deck overlooking endless gravel plains and go days without hearing an engine or an alarm.',
      'For those who find peace in the water, the outer atolls of the Maldives offer an inverse solitude: barefoot wooden decks floating over warm, luminous lagoons where your only morning meeting is with a sea turtle gliding past your reef.'
    ],
    highlights: [
      'Private air charters directly into remote desert airstrips and secluded sandbars',
      'Zero light pollution: unparalleled stargazing opportunities guided by astronomers',
      'Bespoke digital detox wellness programs designed for executive rejuvenation'
    ],
    relatedDestinationId: 3,
    relatedDestinationName: 'Namibia'
  },
  'slow-travel': {
    id: 'slow-travel',
    number: '04',
    eyebrow: 'FIELD NOTES / 04',
    title: 'The new language of slow travel',
    subtitle: 'Why staying longer in fewer places is the pinnacle of sophisticated exploration.',
    image: img('1533105079780-92b9be482077'),
    author: 'Julian Thorne — Mediterranean & European Heritage Lead',
    readTime: '7 min read',
    intro: 'Checking off five cities in six days is tourism. Spending a fortnight understanding one coastline, its fishing families, and its olive harvests is travel.',
    paragraphs: [
      'Slow travel is a philosophy of presence. It means staying in a cliffside Amalfi villa or a quiet Cycladic stone house long enough that the local baker recognizes your morning espresso order.',
      'Instead of rushing between crowded lookouts, slow travel invites you to spend full days on a wooden schooner navigating hidden coves, learning ancestral cooking from a village matriarch, or following forgotten trails where olive trees have stood for three centuries.',
      'By slowing your tempo, you don’t see less of the world; you see beneath its surface.'
    ],
    highlights: [
      'Single-base luxury villa stays with dedicated culinary masters and skippers',
      'Deep community immersion supporting local artisan traditions and seasonal harvests',
      'Zero rush: itineraries designed around natural light, personal bio-rhythms, and leisure'
    ],
    relatedDestinationId: 2,
    relatedDestinationName: 'Amalfi Coast'
  }
};

/* Helper: authFetch */
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('aurelia_token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

/* Auth Context */
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aurelia_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('aurelia_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    fetch(`${API}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${savedToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setToken(savedToken);
      })
      .catch(() => {
        localStorage.removeItem('aurelia_token');
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.detail || 'Invalid email or password');
    }
    localStorage.setItem('aurelia_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (formData) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.detail || 'Could not complete registration');
    }
    return data;
  };

  const adminSignup = async (formData) => {
    const res = await fetch(`${API}/auth/admin-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.detail || 'Administrative registration failed');
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('aurelia_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, adminSignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

/* Component: LoginPage */
function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow auth-eyebrow">WELCOME BACK</p>
        <h1>Sign In</h1>
        <p>Access your personalized travel portfolio and direct correspondence.</p>

        {location.state?.passwordReset && (
          <div className="auth-success"><CheckCircle2 size={17} /><span>Password updated. Sign in with your new password.</span></div>
        )}

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. eleanor@vanderbilt.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-forgot-link"><Link to="/forgot-password">Forgot password?</Link></div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Authenticating...' : <><span>Enter Atelier</span> <ArrowUpRight size={15} /></>}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-link">
          New to Aurelia? <Link to="/signup">Begin your membership</Link>
        </div>

        <div className="auth-link-secondary">
          <Link to="/admin-signup">Staff &amp; Executive Access</Link>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not send the reset email.');
      setSuccess(data.message);
    } catch (err) {
      setError(err.message || 'Could not send the reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow auth-eyebrow">ACCOUNT ACCESS</p>
        <h1>Reset your password</h1>
        <p>Enter the email address on your account and we’ll send you a secure reset link.</p>
        {error && <div className="auth-error"><AlertCircle size={16} /><span>{error}</span></div>}
        {success && <div className="auth-success"><CheckCircle2 size={17} /><span>{success}</span></div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="reset-email">Email Address</label>
            <input id="reset-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Sending...' : <>Send reset link <ArrowUpRight size={15} /></>}
          </button>
        </form>
        <div className="auth-link"><Link to="/login">Return to sign in</Link></div>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must contain at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'This reset link is invalid or expired.');
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setError(err.message || 'Could not reset your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow auth-eyebrow">ACCOUNT ACCESS</p>
        <h1>Choose a new password</h1>
        <p>Your new password must be at least 8 characters long.</p>
        {!token && <div className="auth-error"><AlertCircle size={16} /><span>This reset link is missing its token. Request a new link.</span></div>}
        {error && <div className="auth-error"><AlertCircle size={16} /><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="new-password">New Password</label>
            <input id="new-password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm-new-password">Confirm Password</label>
            <input id="confirm-new-password" type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <button type="submit" className="auth-submit" disabled={submitting || !token}>
            {submitting ? 'Updating...' : <>Update password <ArrowUpRight size={15} /></>}
          </button>
        </form>
        <div className="auth-link"><Link to="/forgot-password">Request another reset link</Link></div>
      </div>
    </div>
  );
}

/* Component: SignupPage */
function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(res.message || 'Account created successfully! You can now sign in.');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow auth-eyebrow">AURELIA PRIVILEGE</p>
        <h1>Create Account</h1>
        <p>Curate tailored journeys, archive bespoke itineraries, and collaborate directly with our travel designers.</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div>
            <div className="auth-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
            <Link to="/login" className="auth-submit" style={{ textDecoration: 'none' }}>
              Proceed to Sign In <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="two">
              <div className="auth-field">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Julian"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Sterling"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. julian@sterling.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password (8+ characters)</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPass ? 'text' : 'password'}
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Creating Membership...' : <><span>Join Aurelia</span> <ArrowUpRight size={15} /></>}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

/* Component: AdminSignupPage */
function AdminSignupPage() {
  const { adminSignup, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    invite_code: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.invite_code.trim()) {
      setError('Administrative invite code is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminSignup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        invite_code: formData.invite_code.trim(),
      });
      setSuccess(res.message || 'Executive credentials verified! You can now log in.');
    } catch (err) {
      setError(err.message || 'Authorization failed. Please verify your invite code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow auth-eyebrow">RESTRICTED PORTAL</p>
        <h1>Admin Onboarding</h1>
        <p>Curator and management authorization portal for Aurelia Atelier.</p>

        <div className="auth-notice">
          <Shield size={18} style={{ color: '#c5a059', flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Authorization Required:</strong> Registration requires an authorized executive invite code issued by Aurelia Atelier.
          </span>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div>
            <div className="auth-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
            <Link to="/login" className="auth-submit" style={{ textDecoration: 'none' }}>
              Proceed to Sign In <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="two">
              <div className="auth-field">
                <label htmlFor="admin_first_name">First Name</label>
                <input
                  id="admin_first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Aurelia"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="admin_last_name">Last Name</label>
                <input
                  id="admin_last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Director"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="admin_email">Staff Email</label>
              <input
                id="admin_email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. director@aureliatravel.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="admin_invite">Invite Code</label>
              <input
                id="admin_invite"
                name="invite_code"
                type="text"
                required
                value={formData.invite_code}
                onChange={handleChange}
                placeholder="Enter secret invite authorization code"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="admin_password">Password (8+ chars)</label>
              <div className="auth-input-wrapper">
                <input
                  id="admin_password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set account password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="admin_confirm_password">Confirm Password</label>
              <input
                id="admin_confirm_password"
                name="confirm_password"
                type={showPass ? 'text' : 'password'}
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat account password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Verifying Authorization...' : <><span>Authorize &amp; Register</span> <ArrowUpRight size={15} /></>}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-link">
          Existing administrator? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

/* Component: CustomerDashboard */
function CustomerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [destinations, setDestinations] = useState(FALLBACK);
  const [fetchingMessages, setFetchingMessages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    subject: '',
    destination: 'Sri Lanka',
    travellers: '1-2',
    how_to_feel: '',
    body: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    } else if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  const loadMessages = async () => {
    try {
      const res = await authFetch(`${API}/messages/mine`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {
      // Keep existing list on network issue
    } finally {
      setFetchingMessages(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      loadMessages();
      fetch(`${API}/destinations`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setDestinations(data);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: '', type: '' });
    setSubmitting(true);

    try {
      const res = await authFetch(`${API}/messages`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to send message');
      }
      setStatusMsg({ text: 'Your travel brief has been submitted to your personal concierge.', type: 'success' });
      setForm({
        subject: '',
        destination: destinations[0]?.name || 'Sri Lanka',
        travellers: '1-2',
        how_to_feel: '',
        body: '',
      });
      loadMessages();
    } catch (err) {
      setStatusMsg({ text: err.message || 'Could not send message. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div className="dashboard" style={{ textAlign: 'center', paddingTop: '180px' }}>Loading your atelier...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">CLIENT ATELIER</p>
          <h1>Welcome, {user.first_name || 'Esteemed Guest'}</h1>
          <p>Communicate privately with your dedicated travel designer and review itinerary developments.</p>
        </div>
        <div>
          <button className="outline-btn" onClick={loadMessages}>
            <RefreshCw size={14} /> Refresh Atelier
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Form */}
        <div className="message-form-container">
          <p className="eyebrow">DESIGN A JOURNEY</p>
          <h2>Direct Message</h2>
          <p className="subtitle">Submit a new journey concept or request assistance for your upcoming travel.</p>

          {statusMsg.text && (
            <div className={statusMsg.type === 'success' ? 'auth-success' : 'auth-error'}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="message-form">
            <label>
              Subject / Journey Title
              <input
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Autumn Retreat in the Highlands"
              />
            </label>

            <div className="two">
              <label>
                Destination of Interest
                <select
                  value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                >
                  {destinations.map(d => (
                    <option key={d.id || d.name} value={d.name}>{d.name} ({d.country || d.region})</option>
                  ))}
                  <option value="Multi-Country / Other">Other / Multi-Country</option>
                </select>
              </label>

              <label>
                Party Size
                <select
                  value={form.travellers}
                  onChange={e => setForm({ ...form, travellers: e.target.value })}
                >
                  <option value="1-2">1-2 Travellers</option>
                  <option value="3-5">3-5 Travellers</option>
                  <option value="6-10">6-10 Travellers</option>
                  <option value="10+">10+ Guests (Private Charter)</option>
                </select>
              </label>
            </div>

            <label>
              How do you want to feel?
              <textarea
                rows={3}
                value={form.how_to_feel}
                onChange={e => setForm({ ...form, how_to_feel: e.target.value })}
                placeholder="e.g. Total seclusion, sensory awakening, effortless luxury, deeply connected to heritage..."
              />
            </label>

            <label>
              Additional Details &amp; Expectations
              <textarea
                rows={4}
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Specific dates, culinary preferences, accommodation styles, or milestones..."
              />
            </label>

            <button type="submit" className="submit-btn" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Transmitting...' : <><span>Send Travel Brief</span> <Send size={15} /></>}
            </button>
          </form>
        </div>

        {/* Right Messages List */}
        <div className="messages-section">
          <div className="messages-header-row">
            <h2>My Messages</h2>
            <span className="messages-count">{messages.length} Correspondence{messages.length === 1 ? '' : 's'}</span>
          </div>

          {fetchingMessages ? (
            <div className="message-empty-state">Loading your correspondence history...</div>
          ) : messages.length === 0 ? (
            <div className="message-empty-state">
              <Sparkles size={28} style={{ color: '#c5a059', marginBottom: 12 }} />
              <p>You have not initiated any journey briefs yet.</p>
              <small>Use the form on the left to brief your personal designer.</small>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((m) => {
                const status = (m.status || 'new').toLowerCase();
                const dateStr = m.created_at ? new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
                return (
                  <div className="message-card" key={m.id || Math.random()}>
                    <div className="message-card-top">
                      <h3>{m.subject}</h3>
                      <span className={`status-badge ${status}`}>
                        {status === 'read' ? <Check size={12} /> : status === 'archived' ? <Archive size={12} /> : <Sparkles size={12} />}
                        {status.toUpperCase()}
                      </span>
                    </div>

                    <div className="message-meta">
                      {m.destination && <span><MapPin size={12} /> {m.destination}</span>}
                      {m.travellers && <span><User size={12} /> {m.travellers}</span>}
                      <span><CalendarDays size={12} /> {dateStr}</span>
                    </div>

                    {m.how_to_feel && (
                      <div className="message-details-block">
                        <small>Atmosphere &amp; Feeling</small>
                        <p>{m.how_to_feel}</p>
                      </div>
                    )}

                    {m.body && (
                      <div className="message-details-block">
                        <small>Journey Notes</small>
                        <p>{m.body}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Component: AdminDashboard */
function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages', 'destinations', 'sections'

  // Messages state
  const [messages, setMessages] = useState([]);
  const [msgFilter, setMsgFilter] = useState('all'); // 'all', 'new', 'read', 'archived'
  const [expandedMsgId, setExpandedMsgId] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Destinations state
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [newDest, setNewDest] = useState({ name: '', region: 'Asia', country: '', image: '', tag: '' });
  const [editingDest, setEditingDest] = useState(null);
  const [deleteDestId, setDeleteDestId] = useState(null);

  // Sections state
  const [selectedDestId, setSelectedDestId] = useState('');
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', content: '', image: '', sort_order: 1 });
  const [editingSection, setEditingSection] = useState(null);
  const [deleteSectionId, setDeleteSectionId] = useState(null);

  // Notification toast/feedback
  const [adminNotice, setAdminNotice] = useState('');

  const triggerNotice = (msg) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(''), 3800);
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Load Admin Messages
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const url = msgFilter === 'all' ? `${API}/admin/messages` : `${API}/admin/messages?status=${msgFilter}`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {
      // Handle error quietly
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load Destinations
  const fetchDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const res = await fetch(`${API}/destinations`);
      if (res.ok) {
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : FALLBACK);
        if (!selectedDestId && Array.isArray(data) && data.length > 0) {
          setSelectedDestId(data[0].id);
        }
      } else {
        setDestinations(FALLBACK);
        if (!selectedDestId) setSelectedDestId(FALLBACK[0].id);
      }
    } catch {
      setDestinations(FALLBACK);
      if (!selectedDestId) setSelectedDestId(FALLBACK[0].id);
    } finally {
      setLoadingDestinations(false);
    }
  };

  // Load Sections for selected destination
  const fetchSections = async (destId) => {
    if (!destId) return;
    setLoadingSections(true);
    try {
      const res = await authFetch(`${API}/admin/sections?destination_id=${destId}`);
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      } else {
        setSections([]);
      }
    } catch {
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMessages();
      fetchDestinations();
    }
  }, [user, msgFilter]);

  useEffect(() => {
    if (selectedDestId && activeTab === 'sections') {
      fetchSections(selectedDestId);
    }
  }, [selectedDestId, activeTab]);

  // Update Message Status
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await authFetch(`${API}/admin/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        triggerNotice(`Message #${id} marked as ${status}`);
        fetchMessages();
      }
    } catch {
      triggerNotice('Failed to update status');
    }
  };

  // Create Destination
  const handleCreateDestination = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API}/admin/destinations`, {
        method: 'POST',
        body: JSON.stringify(newDest),
      });
      if (res.ok) {
        triggerNotice(`Destination "${newDest.name}" added successfully.`);
        setNewDest({ name: '', region: 'Asia', country: '', image: '', tag: '' });
        fetchDestinations();
      }
    } catch {
      triggerNotice('Failed to create destination.');
    }
  };

  // Edit Destination
  const handleSaveDestination = async (e) => {
    e.preventDefault();
    if (!editingDest) return;
    try {
      const res = await authFetch(`${API}/admin/destinations/${editingDest.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingDest),
      });
      if (res.ok) {
        triggerNotice(`Destination updated.`);
        setEditingDest(null);
        fetchDestinations();
      }
    } catch {
      triggerNotice('Failed to update destination.');
    }
  };

  // Delete Destination
  const handleDeleteDestination = async () => {
    if (!deleteDestId) return;
    try {
      const res = await authFetch(`${API}/admin/destinations/${deleteDestId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        triggerNotice('Destination deleted.');
        setDeleteDestId(null);
        fetchDestinations();
      }
    } catch {
      triggerNotice('Failed to delete destination.');
    }
  };

  // Create Section
  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!selectedDestId) {
      triggerNotice('Please select a destination first.');
      return;
    }
    try {
      const res = await authFetch(`${API}/admin/sections`, {
        method: 'POST',
        body: JSON.stringify({
          ...newSection,
          destination_id: Number(selectedDestId),
          sort_order: Number(newSection.sort_order),
        }),
      });
      if (res.ok) {
        triggerNotice('Section created successfully.');
        setNewSection({ title: '', content: '', image: '', sort_order: (sections.length + 2) });
        fetchSections(selectedDestId);
      }
    } catch {
      triggerNotice('Failed to create section.');
    }
  };

  // Edit Section
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!editingSection) return;
    try {
      const res = await authFetch(`${API}/admin/sections/${editingSection.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editingSection,
          sort_order: Number(editingSection.sort_order),
        }),
      });
      if (res.ok) {
        triggerNotice('Section updated.');
        setEditingSection(null);
        fetchSections(selectedDestId);
      }
    } catch {
      triggerNotice('Failed to update section.');
    }
  };

  // Delete Section
  const handleDeleteSection = async () => {
    if (!deleteSectionId) return;
    try {
      const res = await authFetch(`${API}/admin/sections/${deleteSectionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        triggerNotice('Section deleted.');
        setDeleteSectionId(null);
        fetchSections(selectedDestId);
      }
    } catch {
      triggerNotice('Failed to delete section.');
    }
  };

  if (loading || !user) {
    return <div className="admin-page" style={{ textAlign: 'center', paddingTop: '180px' }}>Authenticating Atelier Access...</div>;
  }

  const newMsgCount = messages.filter(m => (m.status || 'new').toLowerCase() === 'new').length;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title-row">
          <div>
            <p className="eyebrow" style={{ color: '#c5a059' }}>CONCIERGE &amp; CURATION MANAGEMENT</p>
            <h1>Admin Atelier</h1>
            <p>Managing {destinations.length} global portfolios, guest communications, and story architecture.</p>
          </div>
          <div>
            <button className="outline-btn" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => { fetchMessages(); fetchDestinations(); }}>
              <RefreshCw size={14} /> Refresh Atelier
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat">
            <div className="admin-stat-label">Total Messages</div>
            <div className="admin-stat-num">{messages.length}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Pending Inquiries</div>
            <div className="admin-stat-num" style={{ color: '#c5a059' }}>{newMsgCount}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Active Destinations</div>
            <div className="admin-stat-num">{destinations.length}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-label">Staff Curator</div>
            <div className="admin-stat-num" style={{ fontSize: '24px', paddingTop: '6px' }}>{user.first_name} {user.last_name}</div>
          </div>
        </div>
      </div>

      {adminNotice && <div className="toast" style={{ background: '#c5a059', color: '#171715', fontWeight: 500 }}>{adminNotice}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <Mail size={15} /> Client Messages ({messages.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'destinations' ? 'active' : ''}`}
          onClick={() => setActiveTab('destinations')}
        >
          <Globe2 size={15} /> Destinations ({destinations.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          <List size={15} /> Destination Sections
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* TAB 1: MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <div className="admin-filter-bar">
              <div className="admin-filter-pills">
                {['all', 'new', 'read', 'archived'].map(f => (
                  <button
                    key={f}
                    className={msgFilter === f ? 'active' : ''}
                    onClick={() => setMsgFilter(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <small style={{ color: '#888' }}>Click any row to reveal feelings, briefing notes, and direct actions.</small>
            </div>

            <div className="admin-table-container">
              {loadingMessages ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Retrieving messages...</div>
              ) : messages.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>No messages found in this filter category.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Client</th>
                      <th>Subject</th>
                      <th>Destination</th>
                      <th>Party</th>
                      <th>Received</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => {
                      const isExpanded = expandedMsgId === m.id;
                      const status = (m.status || 'new').toLowerCase();
                      const dateStr = m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent';
                      const clientName = (m.first_name || m.last_name) ? `${m.first_name || ''} ${m.last_name || ''}`.trim() : (m.sender_name || 'Member');
                      return (
                        <React.Fragment key={m.id}>
                          <tr
                            style={{ cursor: 'pointer' }}
                            onClick={() => setExpandedMsgId(isExpanded ? null : m.id)}
                          >
                            <td>
                              <span className={`status-badge ${status}`}>{status.toUpperCase()}</span>
                            </td>
                            <td>
                              <strong>{clientName}</strong>
                              <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>{m.email || 'No email provided'}</div>
                            </td>
                            <td><strong>{m.subject || 'Untitled Brief'}</strong></td>
                            <td>{m.destination || 'Unspecified'}</td>
                            <td>{m.travellers || '1-2'}</td>
                            <td>{dateStr}</td>
                            <td onClick={e => e.stopPropagation()}>
                              <div className="admin-actions">
                                {status !== 'read' && (
                                  <button
                                    className="admin-btn-action"
                                    title="Mark as Read"
                                    onClick={() => handleUpdateStatus(m.id, 'read')}
                                  >
                                    <Check size={13} /> Read
                                  </button>
                                )}
                                {status !== 'archived' && (
                                  <button
                                    className="admin-btn-action"
                                    title="Archive Brief"
                                    onClick={() => handleUpdateStatus(m.id, 'archived')}
                                  >
                                    <Archive size={13} /> Archive
                                  </button>
                                )}
                                {status !== 'new' && (
                                  <button
                                    className="admin-btn-action"
                                    title="Mark as New"
                                    onClick={() => handleUpdateStatus(m.id, 'new')}
                                  >
                                    <Sparkles size={13} /> New
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="expanded-row">
                              <td colSpan={7}>
                                <div className="admin-detail-box">
                                  <div>
                                    <small>Client Profile</small>
                                    <p><strong>{clientName}</strong> &bull; <a href={`mailto:${m.email}`} style={{ color: '#c5a059', textDecoration: 'underline' }}>{m.email}</a></p>
                                  </div>
                                  <div>
                                    <small>Party &amp; Destination</small>
                                    <p>{m.destination || 'Open to recommendations'} ({m.travellers || '1-2'} travellers)</p>
                                  </div>
                                  <div className="full">
                                    <small>Desired Feeling / Emotional Anchor</small>
                                    <p>{m.how_to_feel || 'No feeling specified by traveller.'}</p>
                                  </div>
                                  <div className="full">
                                    <small>Brief &amp; Itinerary Specifics</small>
                                    <p>{m.body || 'No additional notes provided.'}</p>
                                  </div>
                                  <div className="full" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <a
                                      href={`mailto:${m.email}?subject=Regarding your Aurelia journey: ${encodeURIComponent(m.subject || 'Bespoke Travel')}`}
                                      className="admin-btn-action"
                                      style={{ background: '#c5a059', color: '#171715', borderColor: '#c5a059', fontWeight: 500 }}
                                    >
                                      <Send size={13} /> Reply via Direct Email
                                    </a>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div className="admin-section-grid">
            {/* Add Destination Form */}
            <div className="admin-form-box">
              <h3>Curate Destination</h3>
              <p style={{ fontSize: '12px', color: '#999', margin: '-10px 0 20px' }}>Add a new destination to the portfolio catalog.</p>
              <form onSubmit={handleCreateDestination} className="admin-form">
                <label>
                  Destination Name
                  <input
                    required
                    value={newDest.name}
                    onChange={e => setNewDest({ ...newDest, name: e.target.value })}
                    placeholder="e.g. Kyoto &amp; Naoshima"
                  />
                </label>

                <label>
                  Region
                  <select
                    value={newDest.region}
                    onChange={e => setNewDest({ ...newDest, region: e.target.value })}
                  >
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Africa">Africa</option>
                    <option value="Americas">Americas</option>
                    <option value="Indian Ocean">Indian Ocean</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </label>

                <label>
                  Country
                  <input
                    required
                    value={newDest.country}
                    onChange={e => setNewDest({ ...newDest, country: e.target.value })}
                    placeholder="e.g. Japan"
                  />
                </label>

                <label>
                  Hero Image URL (Unsplash or CDN)
                  <input
                    required
                    value={newDest.image}
                    onChange={e => setNewDest({ ...newDest, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>

                <label>
                  Curator Tag / Vibe
                  <input
                    required
                    value={newDest.tag}
                    onChange={e => setNewDest({ ...newDest, tag: e.target.value })}
                    placeholder="e.g. Ritual - Food - Discovery"
                  />
                </label>

                <button type="submit" className="admin-submit-btn">
                  <Plus size={15} /> Add to Collection
                </button>
              </form>
            </div>

            {/* Destination Items Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ font: '400 24px var(--serif)', margin: 0 }}>Active Destinations ({destinations.length})</h3>
                <small style={{ color: '#888' }}>Live on public site</small>
              </div>

              {loadingDestinations ? (
                <div style={{ color: '#888' }}>Refreshing destinations...</div>
              ) : (
                <div className="admin-items-grid">
                  {destinations.map(d => (
                    <div className="admin-card" key={d.id}>
                      <div className="admin-card-img">
                        <img src={d.image} alt={d.name} />
                      </div>
                      <div className="admin-card-body">
                        <small>{d.region} / {d.country}</small>
                        <h4>{d.name}</h4>
                        <p>{d.tag}</p>
                      </div>
                      <div className="admin-card-footer">
                        <button
                          className="admin-btn-action"
                          onClick={() => setEditingDest(d)}
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          className="admin-btn-action delete"
                          onClick={() => setDeleteDestId(d.id)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SECTIONS */}
        {activeTab === 'sections' && (
          <div className="admin-section-grid">
            {/* Add Section Form */}
            <div className="admin-form-box">
              <h3>Create Story Section</h3>
              <p style={{ fontSize: '12px', color: '#999', margin: '-10px 0 20px' }}>Enrich a destination page with stories and detail modules.</p>

              <form onSubmit={handleCreateSection} className="admin-form">
                <label>
                  Destination
                  <select
                    value={selectedDestId}
                    onChange={e => setSelectedDestId(e.target.value)}
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                    ))}
                  </select>
                </label>

                <label>
                  Section Title
                  <input
                    required
                    value={newSection.title}
                    onChange={e => setNewSection({ ...newSection, title: e.target.value })}
                    placeholder="e.g. Dawn Heritage at Sigiriya"
                  />
                </label>

                <label>
                  Sort Order
                  <input
                    type="number"
                    min="1"
                    value={newSection.sort_order}
                    onChange={e => setNewSection({ ...newSection, sort_order: e.target.value })}
                  />
                </label>

                <label>
                  Image URL (Optional)
                  <input
                    value={newSection.image}
                    onChange={e => setNewSection({ ...newSection, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>

                <label>
                  Story Content
                  <textarea
                    rows={5}
                    required
                    value={newSection.content}
                    onChange={e => setNewSection({ ...newSection, content: e.target.value })}
                    placeholder="Narrative brief, planning recommendations, or signature moments..."
                  />
                </label>

                <button type="submit" className="admin-submit-btn">
                  <Plus size={15} /> Publish Section
                </button>
              </form>
            </div>

            {/* Existing Sections List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ font: '400 24px var(--serif)', margin: 0 }}>
                    Sections for {destinations.find(d => String(d.id) === String(selectedDestId))?.name || 'Selected Destination'}
                  </h3>
                  <small style={{ color: '#888' }}>{sections.length} curated module{sections.length === 1 ? '' : 's'}</small>
                </div>
              </div>

              {loadingSections ? (
                <div style={{ color: '#888' }}>Loading sections...</div>
              ) : sections.length === 0 ? (
                <div style={{ padding: '60px 40px', background: '#242420', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', color: '#888' }}>
                  <List size={26} style={{ color: '#c5a059', marginBottom: 10 }} />
                  <p>No custom editorial sections recorded for this destination yet.</p>
                  <small>Use the builder form on the left to add your first chapter.</small>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {sections.map(s => (
                    <div key={s.id} style={{ background: '#242420', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                      {s.image && (
                        <div style={{ width: 140, height: 100, flexShrink: 0, overflow: 'hidden' }}>
                          <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ font: '400 22px var(--serif)', margin: '0 0 6px', color: '#fff' }}>{s.title}</h4>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#c5a059' }}>Order #{s.sort_order}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#bbb5a9', lineHeight: 1.6, margin: '0 0 16px' }}>{s.content}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="admin-btn-action"
                            onClick={() => setEditingSection(s)}
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            className="admin-btn-action delete"
                            onClick={() => setDeleteSectionId(s.id)}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Destination Modal */}
      {editingDest && (
        <div className="admin-modal" onClick={() => setEditingDest(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Edit Destination: {editingDest.name}</h3>
              <button onClick={() => setEditingDest(null)} style={{ color: '#fff' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveDestination} className="admin-form">
              <label>
                Destination Name
                <input
                  required
                  value={editingDest.name}
                  onChange={e => setEditingDest({ ...editingDest, name: e.target.value })}
                />
              </label>
              <label>
                Region
                <select
                  value={editingDest.region}
                  onChange={e => setEditingDest({ ...editingDest, region: e.target.value })}
                >
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Africa">Africa</option>
                  <option value="Americas">Americas</option>
                  <option value="Indian Ocean">Indian Ocean</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </label>
              <label>
                Country
                <input
                  required
                  value={editingDest.country}
                  onChange={e => setEditingDest({ ...editingDest, country: e.target.value })}
                />
              </label>
              <label>
                Image URL
                <input
                  required
                  value={editingDest.image}
                  onChange={e => setEditingDest({ ...editingDest, image: e.target.value })}
                />
              </label>
              <label>
                Curator Tag
                <input
                  required
                  value={editingDest.tag}
                  onChange={e => setEditingDest({ ...editingDest, tag: e.target.value })}
                />
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="admin-submit-btn" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="confirm-btn-cancel" onClick={() => setEditingDest(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Destination Confirmation */}
      {deleteDestId && (
        <div className="admin-modal" onClick={() => setDeleteDestId(null)}>
          <div className="admin-modal-content confirm-dialog" onClick={e => e.stopPropagation()}>
            <AlertCircle size={36} style={{ color: '#ef4444', margin: '0 auto 15px' }} />
            <h3 style={{ margin: 0, font: '400 24px var(--serif)' }}>Remove Destination?</h3>
            <p>This will permanently delete the destination entry from the Aurelia directory. This action cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="confirm-btn-danger" onClick={handleDeleteDestination}>Confirm Delete</button>
              <button className="confirm-btn-cancel" onClick={() => setDeleteDestId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="admin-modal" onClick={() => setEditingSection(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Edit Section: {editingSection.title}</h3>
              <button onClick={() => setEditingSection(null)} style={{ color: '#fff' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSection} className="admin-form">
              <label>
                Section Title
                <input
                  required
                  value={editingSection.title}
                  onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                />
              </label>
              <label>
                Sort Order
                <input
                  type="number"
                  min="1"
                  value={editingSection.sort_order}
                  onChange={e => setEditingSection({ ...editingSection, sort_order: e.target.value })}
                />
              </label>
              <label>
                Image URL
                <input
                  value={editingSection.image || ''}
                  onChange={e => setEditingSection({ ...editingSection, image: e.target.value })}
                />
              </label>
              <label>
                Content
                <textarea
                  rows={5}
                  required
                  value={editingSection.content}
                  onChange={e => setEditingSection({ ...editingSection, content: e.target.value })}
                />
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="admin-submit-btn" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="confirm-btn-cancel" onClick={() => setEditingSection(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation */}
      {deleteSectionId && (
        <div className="admin-modal" onClick={() => setDeleteSectionId(null)}>
          <div className="admin-modal-content confirm-dialog" onClick={e => e.stopPropagation()}>
            <AlertCircle size={36} style={{ color: '#ef4444', margin: '0 auto 15px' }} />
            <h3 style={{ margin: 0, font: '400 24px var(--serif)' }}>Remove Section?</h3>
            <p>Are you sure you want to delete this storytelling section? It will be removed immediately from the destination brief.</p>
            <div className="confirm-buttons">
              <button className="confirm-btn-danger" onClick={handleDeleteSection}>Confirm Delete</button>
              <button className="confirm-btn-cancel" onClick={() => setDeleteSectionId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Component: DestinationPage (KEEP EXISTING EXACTLY) */
function DestinationPage({ destination, onPlan, onBack }) {
  return (
    <section className="destination-page">
      <div className="destination-hero" style={{ backgroundImage: `url(${destination.image})` }}>
        <div className="destination-hero-shade"></div>
        <div className="destination-hero-copy">
          <button className="back-link" onClick={onBack}>Back to destinations</button>
          <p className="eyebrow">{destination.region} / {destination.country}</p>
          <h1>{destination.name}</h1>
          <p>{destination.headline}</p>
        </div>
      </div>
      <div className="destination-detail-wrap">
        <aside className="destination-facts">
          <div><CalendarDays /><span>Best time</span><strong>{destination.bestTime}</strong></div>
          <div><RouteIcon /><span>Ideal length</span><strong>{destination.length}</strong></div>
          <div><Plane /><span>Travel style</span><strong>{destination.tag}</strong></div>
          <a href={destination.sourceUrl} target="_blank" rel="noreferrer"><Info /><span>Source</span><strong>{destination.sourceName}</strong></a>
        </aside>
        <article className="destination-story">
          <p className="eyebrow">DESTINATION BRIEF</p>
          <h2>Why go to {destination.name}?</h2>
          <p>{destination.intro}</p>
          <div className="detail-columns">
            <div><h3>Signature highlights</h3><ul>{destination.highlights.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h3>Experiences to design around</h3><ul>{destination.experiences.map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="planning-note">
            <h3>Planning notes</h3>
            {destination.planning.map(item => <p key={item}>{item}</p>)}
          </div>
          <button className="submit-btn" onClick={onPlan}>Plan this journey <Send size={17} /></button>
        </article>
      </div>
    </section>
  );
}

/* Destination Route Wrapper */
function DestinationRouteWrapper({ data, onPlan }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const fallbackObj = DESTINATIONS[numericId];
  const dynamicObj = data.find(d => String(d.id) === String(id));
  const destination = fallbackObj || dynamicObj;

  if (!destination) {
    return <Navigate to="/" replace />;
  }

  const handleBack = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return <DestinationPage destination={destination} onPlan={onPlan} onBack={handleBack} />;
}

/* Component: StoryPage (Field Notes Article Detail) */
function StoryPage({ story, onPlan, onBack }) {
  const navigate = useNavigate();
  return (
    <section className="destination-page story-article-page">
      <div className="destination-hero" style={{ backgroundImage: `url(${story.image})` }}>
        <div className="destination-hero-shade"></div>
        <div className="destination-hero-copy">
          <button className="back-link" onClick={onBack}>Back to inspiration</button>
          <p className="eyebrow">{story.eyebrow} · {story.readTime}</p>
          <h1>{story.title}</h1>
          <p>{story.subtitle}</p>
        </div>
      </div>
      <div className="destination-detail-wrap">
        <aside className="destination-facts">
          <div><CalendarDays /><span>Published</span><strong>Field Notes Editorial</strong></div>
          <div><RouteIcon /><span>Curator</span><strong>{story.author}</strong></div>
          <div><Globe2 /><span>Related Region</span><strong>{story.relatedDestinationName}</strong></div>
          <button
            style={{ textAlign: 'left', cursor: 'pointer', padding: '16px 0', border: 0, borderBottom: '1px solid var(--line)', background: 'none', color: 'inherit' }}
            onClick={() => navigate(`/destinations/${story.relatedDestinationId}`)}
          >
            <Plane /><span>Explore Region</span><strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>View {story.relatedDestinationName} <ArrowUpRight size={14} /></strong>
          </button>
        </aside>
        <article className="destination-story">
          <p className="eyebrow">ESSAY & INSIGHT</p>
          <h2>{story.subtitle}</h2>
          <p className="story-intro-lead" style={{ fontSize: '19px', lineHeight: '1.75', fontStyle: 'italic', margin: '24px 0 32px', color: '#333' }}>
            "{story.intro}"
          </p>
          {story.paragraphs.map((p, idx) => (
            <p key={idx} style={{ fontSize: '16px', lineHeight: '1.85', margin: '0 0 22px' }}>{p}</p>
          ))}
          <div className="planning-note" style={{ margin: '40px 0 32px' }}>
            <h3>Aurelia Expedition Notes</h3>
            {story.highlights.map((h, idx) => (
              <p key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--ink)' }}>•</span> {h}
              </p>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '30px' }}>
            <button className="submit-btn" onClick={onPlan}>
              Plan this journey <Send size={17} />
            </button>
            <button
              className="outline-btn"
              style={{ background: '#fff' }}
              onClick={() => navigate(`/destinations/${story.relatedDestinationId}`)}
            >
              Discover {story.relatedDestinationName} <ArrowUpRight size={15} />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

/* Story Route Wrapper */
function StoryRouteWrapper({ onPlan }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const story = STORIES[slug];

  if (!story) {
    return <Navigate to="/" replace />;
  }

  const handleBack = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('inspiration')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return <StoryPage story={story} onPlan={onPlan} onBack={handleBack} />;
}

/* Component: ChatBot (KEEP EXISTING EXACTLY) */
function ChatBot({ onPlan }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hello, I am Aurelia AI. Ask me about destinations, best seasons, services, offers, honeymoons, family trips, or how to start planning.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const quick = ['Best place for honeymoon?', 'Tell me about Japan', 'What services do you offer?', 'Best time for Maldives?'];
  const fallbackReply = 'I can help with Aurelia destinations, services, offers, seasons, and trip planning. Try asking about Japan, Sri Lanka, Amalfi Coast, Namibia, Patagonia, Maldives, honeymoon trips, family travel, or how to start an enquiry.';

  const ask = async (text = input) => {
    const message = text.trim();
    if (!message || loading) return;
    setMessages(items => [...items, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(API + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      if (!res.ok) throw new Error('Chat unavailable');
      const data = await res.json();
      setMessages(items => [...items, { role: 'bot', text: data.reply || fallbackReply }]);
    } catch {
      setMessages(items => [...items, { role: 'bot', text: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-chat ${open ? 'open' : ''}`}>
      {open && (
        <div className="ai-panel">
          <div className="ai-head">
            <div className="ai-avatar"><Bot size={22} /></div>
            <div><strong>Aurelia AI</strong><span>Travel design assistant</span></div>
            <button aria-label="Minimize chat" onClick={() => setOpen(false)}><Minimize2 size={18} /></button>
          </div>
          <div className="ai-messages">
            {messages.map((m, i) => <div className={`ai-message ${m.role}`} key={`${m.role}-${i}`}>{m.text}</div>)}
            {loading && <div className="ai-message bot typing">Thinking...</div>}
          </div>
          <div className="ai-quick">{quick.map(q => <button key={q} onClick={() => ask(q)}>{q}</button>)}</div>
          <form className="ai-form" onSubmit={e => { e.preventDefault(); ask(); }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about offers, services, or destinations" />
            <button aria-label="Send chat message"><Send size={17} /></button>
          </form>
          <button className="ai-plan" onClick={onPlan}>Plan with a human designer <ArrowUpRight size={16} /></button>
        </div>
      )}
      <button className="ai-launch" onClick={() => setOpen(!open)} aria-label="Chat with AI">
        <Bot size={23} /><span>Chat with AI</span>
      </button>
    </div>
  );
}

/* Component: HomePage (all existing sections) */
function HomePage({ data, query, setQuery, selected, setSelected, setShowFinder, planJourney, goSection, submitEnquiry }) {
  const navigate = useNavigate();
  const destinations = Object.values(DESTINATIONS).map(destination => ({
    ...data.find(item => String(item.id) === String(destination.id)),
    ...destination,
  }));
  const filtered = destinations.filter(d => (selected === 'All' || d.region === selected) && d.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <section className="hero">
        <div className="hero-image"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="eyebrow">TRAVEL, DESIGNED AROUND YOU</p>
          <h1>Go somewhere.<br /><i>Feel everything.</i></h1>
          <p className="hero-copy">Bespoke journeys for people who want to experience the world differently.</p>
          <div className="hero-buttons">
            <button className="light-btn" onClick={planJourney}>Create my journey <ArrowUpRight /></button>
            <button className="play-btn"><Play fill="currentColor" size={15} /> Watch our film</button>
          </div>
        </div>
        <div className="hero-bottom">
          <span>01 - 04</span>
          <span>Scroll to explore</span>
        </div>
      </section>

      <section className="manifesto">
        <p className="eyebrow">THE AURELIA APPROACH</p>
        <h2>It isn't about where<br />you go. <i>It's how you feel.</i></h2>
        <p>We design private, tailor-made journeys from the ground up. No templates. No forced itineraries. Just thoughtful places, extraordinary people and moments that could only belong to you.</p>
        <button className="text-link" onClick={() => goSection('about')}>Discover our philosophy <ArrowUpRight /></button>
      </section>

      <section id="destinations" className="section">
        <div className="section-head">
          <div><p className="eyebrow">THE WORLD, YOUR WAY</p><h2>Destinations</h2></div>
          <button className="outline-btn" onClick={() => setShowFinder(true)}>Find my destination <Compass size={17} /></button>
        </div>
        <div className="filter-row">
          <div className="searchbox">
            <Search size={16} />
            <input placeholder="Search destinations" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          {['All', 'Asia', 'Europe', 'Africa', 'Americas', 'Indian Ocean'].map(x => (
            <button className={selected === x ? 'active' : ''} onClick={() => setSelected(x)} key={x}>{x}</button>
          ))}
        </div>
        <div className="destination-grid">
          {filtered.map(d => (
            <article className="destination" key={d.id} onClick={() => navigate(`/destinations/${d.id}`)}>
              <img src={d.image} alt={d.name} />
              <div className="card-gradient"></div>
              <div className="destination-copy">
                <small>{d.region}</small>
                <h3>{d.name}</h3>
                <p>{d.tag}</p>
              </div>
              <span className="circle-arrow"><ArrowUpRight /></span>
            </article>
          ))}
        </div>
      </section>

      <section id="experiences" className="dark-section">
        <div className="section-head">
          <div><p className="eyebrow">THE REMARKABLE</p><h2>Experiences<br /><i>without a template.</i></h2></div>
          <p className="side-copy">Private access, local insight and moments that don't appear in guidebooks. Tell us what moves you and we'll build from there.</p>
        </div>
        <div className="experience-grid">
          {experiences.map(x => (
            <article
              className="experience"
              key={x.title}
              role="link"
              tabIndex="0"
              onClick={() => navigate(`/destinations/${x.destinationId}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/destinations/${x.destinationId}`);
                }
              }}
            >
              <img src={x.image} alt={x.title} />
              <div><span>{x.type}</span><h3>{x.title}</h3><p>{x.place}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="inspiration" className="editorial">
        <div className="editorial-feature">
          <img
            src={img('1518548419970-58e3b4079ab2')}
            alt="Mountain journey"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/stories/art-of-getting-lost')}
          />
          <div>
            <p className="eyebrow">FIELD NOTES / 01</p>
            <h2
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/stories/art-of-getting-lost')}
            >
              The art of getting gloriously lost.
            </h2>
            <p>Why the best journeys leave just enough room for the unexpected.</p>
            <button
              className="text-link"
              onClick={() => navigate('/stories/art-of-getting-lost')}
            >
              Read story <ArrowUpRight />
            </button>
          </div>
        </div>
        <div className="editorial-list">
          <p className="eyebrow">MORE INSPIRATION</p>
          {[
            { title: 'A week in the wild: Patagonia', slug: 'patagonia-wild', num: '02' },
            { title: 'Where to go when you want to disappear', slug: 'where-to-disappear', num: '03' },
            { title: 'The new language of slow travel', slug: 'slow-travel', num: '04' }
          ].map(x => (
            <div
              className="story"
              key={x.slug}
              role="button"
              tabIndex="0"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/stories/${x.slug}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/stories/${x.slug}`);
                }
              }}
            >
              <span>{x.num}</span>
              <h3>{x.title}</h3>
              <ArrowUpRight />
            </div>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <div className="quote-mark">"</div>
        <div className="quote-track">
          {testimonials.map(t => (
            <blockquote key={t[1]}>
              <p>{t[0]}</p>
              <footer>{t[1]}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-image"><img src={img('1530789253388-582c481c54b0')} alt="Luxury travel planning" /></div>
        <div className="about-copy">
          <p className="eyebrow">WHY AURELIA</p>
          <h2>Human expertise.<br /><i>Immaculate detail.</i></h2>
          <div className="pillars">
            <div><ShieldCheck /><h3>Thoughtfully planned</h3><p>Every journey is built around your pace, interests and reason for travelling.</p></div>
            <div><Globe2 /><h3>Local intelligence</h3><p>We work with people who know their places deeply, not just from a map.</p></div>
            <div><Clock3 /><h3>There when it matters</h3><p>Real support before, during and after your trip.</p></div>
          </div>
        </div>
      </section>

      <section id="enquire" className="enquire">
        <div className="enquire-intro">
          <p className="eyebrow">START WITH A CONVERSATION</p>
          <h2>Tell us how<br /><i>you want to feel.</i></h2>
          <p>Give us the spark. We'll take care of the rest.</p>
          <div className="contact-line"><MapPin /> Colombo - London - Everywhere</div>
        </div>
        <form onSubmit={submitEnquiry} className="enquiry-form">
          <div className="two">
            <label>First name<input name="first_name" required /></label>
            <label>Last name<input name="last_name" required /></label>
          </div>
          <label>Email<input type="email" name="email" required /></label>
          <div className="two">
            <label>Dream destination<input name="destination" placeholder="Anywhere in the world" /></label>
            <label>Travellers<select name="travellers"><option>1-2</option><option>3-5</option><option>6-10</option><option>10+</option></select></label>
          </div>
          <label>What are you imagining?<textarea name="message" rows="5" placeholder="A feeling, a place, a celebration, a wild idea..."></textarea></label>
          <button className="submit-btn">Begin the conversation <Send size={17} /></button>
          <small>By submitting, you agree to be contacted about your enquiry.</small>
        </form>
      </section>
    </>
  );
}

/* Component: App (MODIFIED) */
function App() {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [data, setData] = useState(FALLBACK);
  const [selected, setSelected] = useState('All');
  const [query, setQuery] = useState('');
  const [showFinder, setShowFinder] = useState(false);
  const [toast, setToast] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch(API + '/destinations')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const goSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenu(false);
  };

  const planJourney = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenu(false);
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      await fetch(API + '/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {}
    setToast('Thank you. A travel designer will be in touch shortly.');
    e.currentTarget.reset();
    setTimeout(() => setToast(''), 4500);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
    setToast('You have been signed out.');
    setTimeout(() => setToast(''), 3000);
  };

  const isSolidNav = location.pathname !== '/' && !location.pathname.startsWith('/destinations/');

  return (
    <div className="app">
      {/* Header & Navigation */}
      <header className={`nav ${isSolidNav ? 'nav-solid' : ''}`}>
        <a className="brand" onClick={() => navigate('/')}>
          <span>AURELIA</span>
          <small>BESPOKE JOURNEYS</small>
        </a>

        <nav className={menu ? 'mobile open' : ''}>
          <button onClick={() => goSection('destinations')}>Destinations</button>
          <button onClick={() => goSection('experiences')}>Experiences</button>
          <button onClick={() => goSection('inspiration')}>Inspiration</button>
          <button onClick={() => goSection('about')}>Our philosophy</button>
          <button className="nav-enquire" onClick={planJourney}>
            Plan my journey <ArrowUpRight size={16} />
          </button>
        </nav>

        <div className="nav-actions">
          {/* Auth Status & Controls */}
          {!user ? (
            <div className="nav-auth">
              <button className="nav-auth-btn" onClick={() => navigate('/login')}>
                <LogIn size={13} /> Sign In
              </button>
            </div>
          ) : user.role === 'admin' ? (
            <div className="nav-user">
              <span className="nav-user-badge">Curator / Admin</span>
              <button className="nav-btn-link" onClick={() => navigate('/admin')}>
                <LayoutDashboard size={13} /> Admin
              </button>
              <button className="nav-signout-btn" onClick={handleSignOut} title="Sign Out">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <span className="nav-user-greeting">
                <User size={13} /> {user.first_name || 'Member'}
              </span>
              <button className="nav-btn-link" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button className="nav-signout-btn" onClick={handleSignOut} title="Sign Out">
                <LogOut size={13} />
              </button>
            </div>
          )}

          <button aria-label="search" onClick={() => setShowFinder(true)}>
            <Search size={20} />
          </button>
          <button className="menu-btn" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Main Content with React Router */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                data={data}
                query={query}
                setQuery={setQuery}
                selected={selected}
                setSelected={setSelected}
                setShowFinder={setShowFinder}
                planJourney={planJourney}
                goSection={goSection}
                submitEnquiry={submitEnquiry}
              />
            }
          />
          <Route
            path="/destinations/:id"
            element={<DestinationRouteWrapper data={data} onPlan={planJourney} />}
          />
          <Route
            path="/stories/:slug"
            element={<StoryRouteWrapper onPlan={planJourney} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin-signup" element={<AdminSignupPage />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="brand" onClick={() => navigate('/')}>
            <span>AURELIA</span>
            <small>BESPOKE JOURNEYS</small>
          </div>
          <p>Luxury travel, made personal.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <button onClick={() => goSection('destinations')}>Destinations</button>
          <button onClick={() => goSection('experiences')}>Experiences</button>
          <button onClick={() => goSection('inspiration')}>Inspiration</button>
        </div>
        <div>
          <h4>Company</h4>
          <button onClick={() => goSection('about')}>Our philosophy</button>
          <button onClick={planJourney}>Contact</button>
          <a>Privacy</a>
        </div>
        <div>
          <h4>Follow</h4>
          <div className="socials">
            <Camera />
            <MessageCircle />
            <CirclePlay />
          </div>
        </div>
        <div className="copyright">© 2026 Aurelia Travel. Crafted for extraordinary journeys.</div>
      </footer>

      {/* Floating Concierge Chatbot */}
      <ChatBot onPlan={planJourney} />

      {/* Destination Finder Modal */}
      {showFinder && (
        <div className="modal" onClick={() => setShowFinder(false)}>
          <div className="finder" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowFinder(false)}><X /></button>
            <p className="eyebrow">TRIP FINDER</p>
            <h2>What are you looking for?</h2>
            <div className="finder-options">
              {['Adventure', 'Romance', 'Family', 'Slow travel', 'Wildlife', 'Beach', 'Culture', 'Food & wine'].map(x => (
                <button
                  key={x}
                  onClick={() => {
                    setQuery('');
                    setSelected('All');
                    setShowFinder(false);
                    goSection('experiences');
                  }}
                >
                  <Sparkles size={16} />{x}
                </button>
              ))}
            </div>
            <button
              className="dark-btn"
              onClick={() => {
                setShowFinder(false);
                planJourney();
              }}
            >
              I have my own idea <ArrowUpRight />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* Root Render */
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
