import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/portal/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, CloudLightning, CloudDrizzle, Sun, Wind, Droplets, Eye, MapPin, RefreshCw } from 'lucide-react';

// ── Bangladesh cities ────────────────────────────────────────────────────
const CITIES = [
  { en: 'Dhaka',       bn: 'ঢাকা',       lat: 23.8103, lon: 90.4125 },
  { en: 'Chittagong',  bn: 'চট্টগ্রাম',  lat: 22.3569, lon: 91.7832 },
  { en: 'Sylhet',      bn: 'সিলেট',      lat: 24.8949, lon: 91.8687 },
  { en: 'Rajshahi',    bn: 'রাজশাহী',    lat: 24.3745, lon: 88.6042 },
  { en: 'Khulna',      bn: 'খুলনা',      lat: 22.8456, lon: 89.5403 },
  { en: 'Comilla',     bn: 'কুমিল্লা',   lat: 23.4607, lon: 91.1809 },
  { en: 'Mymensingh',  bn: 'ময়মনসিংহ',  lat: 24.7471, lon: 90.4203 },
  { en: 'Rangpur',     bn: 'রংপুর',      lat: 25.7439, lon: 89.2752 },
];

// ── WMO code helpers ──────────────────────────────────────────────────────
function wmoLabel(code: number, isBN: boolean): string {
  if (code === 0)               return isBN ? 'রোদেলা আকাশ'          : 'Clear Sky';
  if (code === 1)               return isBN ? 'মূলত পরিষ্কার'         : 'Mainly Clear';
  if (code === 2)               return isBN ? 'আংশিক মেঘলা'           : 'Partly Cloudy';
  if (code === 3)               return isBN ? 'মেঘাচ্ছন্ন'            : 'Overcast';
  if ([45,48].includes(code))  return isBN ? 'কুয়াশাচ্ছন্ন'          : 'Foggy';
  if ([51,53,55].includes(code)) return isBN ? 'গুঁড়িগুঁড়ি বৃষ্টি' : 'Drizzle';
  if (code === 61)              return isBN ? 'হালকা বৃষ্টি'           : 'Light Rain';
  if (code === 63)              return isBN ? 'মাঝারি বৃষ্টি'          : 'Moderate Rain';
  if (code === 65)              return isBN ? 'ভারী বৃষ্টি'            : 'Heavy Rain';
  if ([80,81,82].includes(code)) return isBN ? 'বৃষ্টির ঝাপটা'       : 'Rain Showers';
  if (code === 95)              return isBN ? 'বজ্রঝড়'                : 'Thunderstorm';
  if ([96,99].includes(code))  return isBN ? 'শিলাবৃষ্টিসহ বজ্র'    : 'Hail Storm';
  return isBN ? 'অজানা' : 'Unknown';
}

function wmoIcon(code: number, size = 'h-6 w-6') {
  if (code === 0 || code === 1)              return <Sun         className={`${size} text-yellow-500`} />;
  if (code === 2 || code === 3)              return <Cloud       className={`${size} text-gray-400`} />;
  if ([45,48].includes(code))               return <Eye         className={`${size} text-gray-400`} />;
  if ([51,53,55].includes(code))            return <CloudDrizzle className={`${size} text-blue-400`} />;
  if ([61,63,65,80,81,82].includes(code))   return <CloudRain   className={`${size} text-blue-500`} />;
  if ([95,96,99].includes(code))            return <CloudLightning className={`${size} text-purple-500`} />;
  return <Cloud className={`${size} text-gray-400`} />;
}

function wmoGradient(code: number): string {
  if (code === 0 || code === 1)   return 'from-amber-400 to-orange-500';
  if (code === 2)                 return 'from-sky-400 to-blue-500';
  if (code === 3)                 return 'from-slate-400 to-gray-500';
  if ([45,48].includes(code))    return 'from-gray-300 to-slate-400';
  if ([51,53,55].includes(code)) return 'from-blue-300 to-sky-400';
  if ([61,63,65].includes(code)) return 'from-blue-500 to-blue-700';
  if ([80,81,82].includes(code)) return 'from-blue-500 to-cyan-500';
  if ([95,96,99].includes(code)) return 'from-gray-700 to-slate-800';
  return 'from-blue-500 to-blue-600';
}

// ── Day name helpers ──────────────────────────────────────────────────────
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_BN = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_BN = ['জান','ফেব','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগ','সেপ','অক্টো','নভে','ডিসে'];

function fmtDay(iso: string, isBN: boolean) {
  const d = new Date(iso);
  const day = isBN ? DAYS_BN[d.getDay()] : DAYS_EN[d.getDay()];
  const month = isBN ? MONTHS_BN[d.getMonth()] : MONTHS_EN[d.getMonth()];
  return { day, date: `${month} ${d.getDate()}` };
}

function fmtHour(iso: string, isBN: boolean) {
  const h = new Date(iso).getHours();
  if (!isBN) return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`;
  if (h === 0) return 'রাত ১২';
  if (h < 12)  return `সকাল ${h}`;
  if (h === 12) return 'দুপুর ১২';
  if (h < 17)  return `দুপুর ${h-12}`;
  if (h < 20)  return `বিকাল ${h-12}`;
  return `রাত ${h-12}`;
}

// ── Fetch ────────────────────────────────────────────────────────────────
interface LiveWeather {
  temperature:   number;
  feelsLike:     number;
  humidity:      number;
  windSpeed:     number;
  weatherCode:   number;
  precipitation: number;
  visibility:    number;   // km
  uvIndex:       number;
  hourlyTimes:   string[];
  hourlyTemps:   number[];
  hourlyCodes:   number[];
  hourlyRain:    number[];
  dailyTimes:    string[];
  dailyMax:      number[];
  dailyMin:      number[];
  dailyCodes:    number[];
  dailyRain:     number[];
  fetchedAt:     Date;
}

async function fetchLive(lat: number, lon: number): Promise<LiveWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,visibility` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
    `&timezone=Asia%2FDhaka&forecast_days=7`;

  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch failed');
  const d = await r.json();

  return {
    temperature:   Math.round(d.current.temperature_2m),
    feelsLike:     Math.round(d.current.apparent_temperature),
    humidity:      d.current.relative_humidity_2m,
    windSpeed:     Math.round(d.current.wind_speed_10m),
    weatherCode:   d.current.weather_code,
    precipitation: d.current.precipitation,
    visibility:    Math.round((d.current.visibility ?? 10000) / 1000),
    uvIndex:       d.daily.uv_index_max?.[0] ?? 0,
    hourlyTimes:   d.hourly.time,
    hourlyTemps:   d.hourly.temperature_2m,
    hourlyCodes:   d.hourly.weather_code,
    hourlyRain:    d.hourly.precipitation_probability,
    dailyTimes:    d.daily.time,
    dailyMax:      d.daily.temperature_2m_max,
    dailyMin:      d.daily.temperature_2m_min,
    dailyCodes:    d.daily.weather_code,
    dailyRain:     d.daily.precipitation_probability_max,
    fetchedAt:     new Date(),
  };
}

// ── Page ─────────────────────────────────────────────────────────────────
const Weather = () => {
  const { t, language } = useLanguage();
  const isBN = language === 'BN';

  const [cityIdx,  setCityIdx]  = useState(0);
  const [data,     setData]     = useState<LiveWeather | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const city = CITIES[cityIdx];

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchLive(city.lat, city.lon)); }
    catch { setError(isBN ? 'আবহাওয়া তথ্য পাওয়া যাচ্ছে না' : 'Could not fetch weather data'); }
    finally { setLoading(false); }
  }, [city.lat, city.lon, isBN]);

  useEffect(() => {
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  // Hourly slice: current hour → next 5 hours
  const nowH = new Date().getHours();
  const hourSlice = data
    ? data.hourlyTimes
        .map((t, i) => ({ h: new Date(t).getHours(), time: fmtHour(t, isBN), temp: Math.round(data.hourlyTemps[i]), code: data.hourlyCodes[i], rain: data.hourlyRain[i] }))
        .filter(x => x.h >= nowH && x.h < nowH + 6)
        .slice(0, 6)
    : [];

  const gradient = data ? wmoGradient(data.weatherCode) : 'from-blue-500 to-blue-600';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title + city selector */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('weather')}</h1>
            <p className="text-muted-foreground">{t('forecast')} {(t('today') || 'today').toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CITIES.map((c, i) => (
              <button key={c.en} onClick={() => setCityIdx(i)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === cityIdx ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}>
                {isBN ? c.bn : c.en}
              </button>
            ))}
            <button onClick={load} disabled={loading}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p>{isBN ? 'আবহাওয়া তথ্য লোড হচ্ছে...' : 'Loading weather data...'}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-destructive font-medium">{error}</p>
              <button onClick={load} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                {isBN ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: current + hourly ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Current weather card */}
              <Card className={`bg-gradient-to-br ${gradient} text-white border-0`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {isBN ? city.bn : city.en}, {isBN ? 'বাংলাদেশ' : 'Bangladesh'}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {isBN ? 'আজ' : 'Today'} • {wmoLabel(data.weatherCode, isBN)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-6xl font-bold mb-2">{data.temperature}°C</div>
                      <p className="text-white/80">{isBN ? 'অনুভূত' : 'Feels like'} {data.feelsLike}°C</p>
                    </div>
                    <div className="text-white/80">{wmoIcon(data.weatherCode, 'h-24 w-24')}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <Droplets className="h-6 w-6 mx-auto mb-2 text-white/70" />
                      <p className="text-sm text-white/70">{t('humidity')}</p>
                      <p className="font-bold">{data.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-6 w-6 mx-auto mb-2 text-white/70" />
                      <p className="text-sm text-white/70">{t('wind')}</p>
                      <p className="font-bold">{data.windSpeed} km/h</p>
                    </div>
                    <div className="text-center">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-white/70" />
                      <p className="text-sm text-white/70">{t('visibility')}</p>
                      <p className="font-bold">{data.visibility} km</p>
                    </div>
                    <div className="text-center">
                      <Sun className="h-6 w-6 mx-auto mb-2 text-white/70" />
                      <p className="text-sm text-white/70">{t('uvIndex')}</p>
                      <p className="font-bold">{Math.round(data.uvIndex)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hourly forecast */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('hourlyForecast')}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {isBN
                      ? `সর্বশেষ আপডেট: ${data.fetchedAt.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}`
                      : `Last updated: ${data.fetchedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {hourSlice.map((hour, i) => (
                      <div key={i} className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">{hour.time}</p>
                        <div className="flex justify-center mb-2">{wmoIcon(hour.code, 'h-6 w-6')}</div>
                        <p className="font-bold text-sm">{hour.temp}°C</p>
                        {hour.rain > 0 && <p className="text-xs text-blue-500 mt-0.5">{hour.rain}%</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right: weekly forecast ── */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t('weeklyForecast')}</CardTitle>
                  <CardDescription>{t('next7Days')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {data.dailyTimes.map((iso, i) => {
                      const { day, date } = fmtDay(iso, isBN);
                      return (
                        <div key={i}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            i === 0 ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
                          }`}>
                          <div className="flex items-center gap-3">
                            {wmoIcon(data.dailyCodes[i], 'h-7 w-7')}
                            <div>
                              <p className="font-semibold text-sm">
                                {i === 0 ? (isBN ? 'আজ' : 'Today') : day}
                              </p>
                              <p className="text-xs text-muted-foreground">{date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold">{Math.round(data.dailyMax[i])}°</span>
                            <span className="text-muted-foreground">{Math.round(data.dailyMin[i])}°</span>
                            {data.dailyRain[i] > 20 && (
                              <span className="text-blue-500 text-xs">{data.dailyRain[i]}%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
