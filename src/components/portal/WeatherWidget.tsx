import { useState, useEffect, useCallback } from "react";
import {
  Sun, Cloud, CloudRain, CloudLightning, Wind,
  Droplets, MapPin, RefreshCw, CloudDrizzle, Eye,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Bangladesh city coordinates ───────────────────────────────────────────
const CITIES = [
  { en: "Dhaka",      bn: "ঢাকা",       lat: 23.8103, lon: 90.4125 },
  { en: "Chittagong", bn: "চট্টগ্রাম",  lat: 22.3569, lon: 91.7832 },
  { en: "Sylhet",     bn: "সিলেট",      lat: 24.8949, lon: 91.8687 },
  { en: "Rajshahi",   bn: "রাজশাহী",    lat: 24.3745, lon: 88.6042 },
  { en: "Khulna",     bn: "খুলনা",      lat: 22.8456, lon: 89.5403 },
  { en: "Comilla",    bn: "কুমিল্লা",   lat: 23.4607, lon: 91.1809 },
  { en: "Mymensingh", bn: "ময়মনসিংহ",  lat: 24.7471, lon: 90.4203 },
  { en: "Rangpur",    bn: "রংপুর",      lat: 25.7439, lon: 89.2752 },
];

// ── WMO weather code → display info ──────────────────────────────────────
function decodeWeather(code: number, isBN: boolean) {
  if (code === 0)              return { label: isBN ? "রোদেলা আকাশ"           : "Clear Sky",      icon: <Sun className="w-10 h-10" />,            bg: "from-amber-400 to-orange-400" };
  if (code === 1)              return { label: isBN ? "মূলত পরিষ্কার"          : "Mainly Clear",   icon: <Sun className="w-10 h-10" />,            bg: "from-amber-300 to-yellow-300" };
  if (code === 2)              return { label: isBN ? "আংশিক মেঘলা"            : "Partly Cloudy",  icon: <Cloud className="w-10 h-10" />,          bg: "from-sky-400 to-blue-400" };
  if (code === 3)              return { label: isBN ? "মেঘাচ্ছন্ন"             : "Overcast",       icon: <Cloud className="w-10 h-10" />,          bg: "from-slate-400 to-gray-500" };
  if ([45,48].includes(code)) return { label: isBN ? "কুয়াশাচ্ছন্ন"          : "Foggy",          icon: <Eye className="w-10 h-10" />,            bg: "from-gray-300 to-slate-400" };
  if ([51,53,55].includes(code)) return { label: isBN ? "গুঁড়িগুঁড়ি বৃষ্টি" : "Drizzle",        icon: <CloudDrizzle className="w-10 h-10" />,   bg: "from-blue-300 to-sky-400" };
  if (code === 61)             return { label: isBN ? "হালকা বৃষ্টি"           : "Light Rain",     icon: <CloudRain className="w-10 h-10" />,      bg: "from-blue-400 to-sky-500" };
  if (code === 63)             return { label: isBN ? "মাঝারি বৃষ্টি"          : "Moderate Rain",  icon: <CloudRain className="w-10 h-10" />,      bg: "from-blue-500 to-blue-600" };
  if (code === 65)             return { label: isBN ? "ভারী বৃষ্টি"            : "Heavy Rain",     icon: <CloudRain className="w-10 h-10" />,      bg: "from-indigo-500 to-blue-700" };
  if ([80,81,82].includes(code)) return { label: isBN ? "বৃষ্টির ঝাপটা"      : "Rain Showers",   icon: <CloudRain className="w-10 h-10" />,      bg: "from-blue-500 to-cyan-500" };
  if (code === 95)             return { label: isBN ? "বজ্রঝড়"                : "Thunderstorm",   icon: <CloudLightning className="w-10 h-10" />, bg: "from-gray-700 to-slate-700" };
  if ([96,99].includes(code)) return { label: isBN ? "শিলাবৃষ্টিসহ বজ্র"    : "Hail Storm",     icon: <CloudLightning className="w-10 h-10" />, bg: "from-slate-600 to-gray-800" };
  return                              { label: isBN ? "অজানা আবহাওয়া"         : "Unknown",        icon: <Cloud className="w-10 h-10" />,          bg: "from-gray-300 to-slate-400" };
}

// ── Open-Meteo fetch (free, no API key) ──────────────────────────────────
interface WeatherData {
  temperature:   number;
  feelsLike:     number;
  humidity:      number;
  windSpeed:     number;
  weatherCode:   number;
  precipitation: number;
  hourlyTimes:   string[];
  hourlyTemps:   number[];
  hourlyRain:    number[];
  fetchedAt:     Date;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation` +
    `&hourly=temperature_2m,precipitation_probability` +
    `&timezone=Asia%2FDhaka&forecast_days=1`;

  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch failed");
  const d = await r.json();

  return {
    temperature:   Math.round(d.current.temperature_2m),
    feelsLike:     Math.round(d.current.apparent_temperature),
    humidity:      d.current.relative_humidity_2m,
    windSpeed:     Math.round(d.current.wind_speed_10m),
    weatherCode:   d.current.weather_code,
    precipitation: d.current.precipitation,
    hourlyTimes:   d.hourly.time,
    hourlyTemps:   d.hourly.temperature_2m,
    hourlyRain:    d.hourly.precipitation_probability,
    fetchedAt:     new Date(),
  };
}

// ── Component ─────────────────────────────────────────────────────────────
const WeatherWidget = () => {
  const { language } = useLanguage();
  const isBN = language === "BN";

  const [cityIdx,  setCityIdx]  = useState(0);
  const [weather,  setWeather]  = useState<WeatherData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [showDrop, setShowDrop] = useState(false);

  const city = CITIES[cityIdx];

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setWeather(await fetchWeather(city.lat, city.lon)); }
    catch { setError(isBN ? "আবহাওয়া তথ্য পাওয়া যাচ্ছে না" : "Could not fetch weather"); }
    finally { setLoading(false); }
  }, [city.lat, city.lon, isBN]);

  // Initial fetch + auto-refresh every 10 min
  useEffect(() => {
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  // Hourly slice: current hour → next 5 hours
  const nowH = new Date().getHours();
  const hourSlice = weather
    ? weather.hourlyTimes
        .map((t, i) => ({ h: new Date(t).getHours(), temp: Math.round(weather.hourlyTemps[i]), rain: weather.hourlyRain[i] ?? 0 }))
        .filter(x => x.h >= nowH && x.h < nowH + 6)
        .slice(0, 6)
    : [];
  const minT = hourSlice.length ? Math.min(...hourSlice.map(x => x.temp)) : 0;
  const maxT = hourSlice.length ? Math.max(...hourSlice.map(x => x.temp)) : 1;

  const cond = weather ? decodeWeather(weather.weatherCode, isBN) : null;

  // Hour label in Bangla
  const fmtH = (h: number) => {
    if (!isBN) return h === 0 ? "12AM" : h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h-12}PM`;
    if (h === 0) return "রাত ১২";
    if (h < 12)  return `সকাল ${h}`;
    if (h === 12) return "দুপুর ১২";
    if (h < 17)  return `দুপুর ${h-12}`;
    if (h < 20)  return `বিকাল ${h-12}`;
    return `রাত ${h-12}`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden w-full">

      {/* ── Gradient header ── */}
      <div className={`bg-gradient-to-br ${cond?.bg ?? "from-sky-400 to-blue-500"} p-4 text-white relative`}>

        {/* City dropdown */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowDrop(v => !v)}
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isBN ? city.bn : city.en}</span>
            <span className="text-white/60 text-[10px]">▾</span>
          </button>
          {showDrop && (
            <div className="absolute top-7 left-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
              {CITIES.map((c, i) => (
                <button key={c.en} onClick={() => { setCityIdx(i); setShowDrop(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${i === cityIdx ? "font-bold text-primary" : "text-foreground"}`}>
                  {isBN ? c.bn : c.en}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weather body */}
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <RefreshCw className="w-6 h-6 animate-spin text-white/70" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-white/80 text-sm">{error}</p>
            <button onClick={load} className="mt-2 text-xs underline text-white/70">
              {isBN ? "পুনরায় চেষ্টা করুন" : "Retry"}
            </button>
          </div>
        ) : weather && cond && (
          <>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-start leading-none">
                  <span className="text-5xl font-extrabold">{weather.temperature}</span>
                  <span className="text-2xl font-bold mt-1 ml-0.5">°C</span>
                </div>
                <p className="text-white/90 text-sm mt-1 font-medium">{cond.label}</p>
                <p className="text-white/60 text-xs">
                  {isBN ? "অনুভূত" : "Feels like"} {weather.feelsLike}°C
                </p>
              </div>
              <div className="text-white/90">{cond.icon}</div>
            </div>

            <div className="flex items-center gap-5 mt-3 pt-3 border-t border-white/20 text-xs text-white/80">
              <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />{weather.humidity}%</span>
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" />{weather.windSpeed} km/h</span>
              {weather.precipitation > 0 &&
                <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5" />{weather.precipitation}mm</span>}
            </div>
          </>
        )}
      </div>

      {/* ── Hourly forecast ── */}
      {!loading && !error && hourSlice.length > 0 && (
        <div className="p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isBN ? "ঘণ্টাওয়ারি পূর্বাভাস" : "Hourly Forecast"}
          </p>

          {/* SVG temperature line */}
          <div style={{ height: 44 }} className="mb-1">
            <svg viewBox={`0 0 ${Math.max(hourSlice.length * 40, 1)} 40`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wg-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#60a5fa" />
                  <stop offset="50%"  stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f87171" />
                </linearGradient>
              </defs>
              {hourSlice.length > 1 && (
                <polyline fill="none" stroke="url(#wg-grad)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  points={hourSlice.map((h, i) => {
                    const x = i * 40 + 20;
                    const y = maxT === minT ? 20 : 35 - ((h.temp - minT) / (maxT - minT)) * 28;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              )}
              {hourSlice.map((h, i) => {
                const x = i * 40 + 20;
                const y = maxT === minT ? 20 : 35 - ((h.temp - minT) / (maxT - minT)) * 28;
                return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" />;
              })}
            </svg>
          </div>

          {/* Labels */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${hourSlice.length}, 1fr)` }}>
            {hourSlice.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-bold text-foreground">{h.temp}°</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{fmtH(h.h)}</span>
                {h.rain > 0 && <span className="text-[9px] text-blue-500 font-medium">{h.rain}%</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {weather
            ? (isBN ? "সর্বশেষ: " : "Updated: ") +
              weather.fetchedAt.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })
            : ""}
        </span>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-40">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {isBN ? "রিফ্রেশ" : "Refresh"}
        </button>
      </div>
    </div>
  );
};

export default WeatherWidget;
