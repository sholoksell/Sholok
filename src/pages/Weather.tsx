import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/portal/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react';

const Weather = () => {
  const { t } = useLanguage();

  const currentWeather = {
    location: 'Dhaka, Bangladesh',
    temperature: 28,
    condition: 'Partly Cloudy',
    feelsLike: 31,
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    uvIndex: 6,
  };

  const hourlyForecast = [
    { time: '12 PM', temp: 28, icon: <Sun className="h-6 w-6 text-yellow-500" /> },
    { time: '1 PM', temp: 29, icon: <Sun className="h-6 w-6 text-yellow-500" /> },
    { time: '2 PM', temp: 30, icon: <Cloud className="h-6 w-6 text-gray-500" /> },
    { time: '3 PM', temp: 29, icon: <Cloud className="h-6 w-6 text-gray-500" /> },
    { time: '4 PM', temp: 28, icon: <CloudRain className="h-6 w-6 text-blue-500" /> },
    { time: '5 PM', temp: 27, icon: <CloudRain className="h-6 w-6 text-blue-500" /> },
  ];

  const weeklyForecast = [
    { day: 'Monday', date: 'Feb 4', high: 30, low: 22, condition: 'Partly Cloudy', icon: <Cloud className="h-8 w-8 text-gray-500" /> },
    { day: 'Tuesday', date: 'Feb 5', high: 31, low: 23, condition: 'Sunny', icon: <Sun className="h-8 w-8 text-yellow-500" /> },
    { day: 'Wednesday', date: 'Feb 6', high: 29, low: 21, condition: 'Rainy', icon: <CloudRain className="h-8 w-8 text-blue-500" /> },
    { day: 'Thursday', date: 'Feb 7', high: 28, low: 20, condition: 'Cloudy', icon: <Cloud className="h-8 w-8 text-gray-500" /> },
    { day: 'Friday', date: 'Feb 8', high: 30, low: 22, condition: 'Sunny', icon: <Sun className="h-8 w-8 text-yellow-500" /> },
    { day: 'Saturday', date: 'Feb 9', high: 32, low: 24, condition: 'Sunny', icon: <Sun className="h-8 w-8 text-yellow-500" /> },
    { day: 'Sunday', date: 'Feb 10', high: 31, low: 23, condition: 'Partly Cloudy', icon: <Cloud className="h-8 w-8 text-gray-500" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('weather')}</h1>
          <p className="text-muted-foreground">
            {t('forecast')} and current conditions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-white">{currentWeather.location}</CardTitle>
                <CardDescription className="text-blue-100">
                  {t('today')} • {currentWeather.condition}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-6xl font-bold mb-2">{currentWeather.temperature}°C</div>
                    <p className="text-blue-100">Feels like {currentWeather.feelsLike}°C</p>
                  </div>
                  <Cloud className="h-24 w-24 text-white/50" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-400/30">
                  <div className="text-center">
                    <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-100" />
                    <p className="text-sm text-blue-100">{t('humidity')}</p>
                    <p className="font-bold">{currentWeather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Wind className="h-6 w-6 mx-auto mb-2 text-blue-100" />
                    <p className="text-sm text-blue-100">Wind</p>
                    <p className="font-bold">{currentWeather.windSpeed} km/h</p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-100" />
                    <p className="text-sm text-blue-100">Visibility</p>
                    <p className="font-bold">{currentWeather.visibility} km</p>
                  </div>
                  <div className="text-center">
                    <Sun className="h-6 w-6 mx-auto mb-2 text-blue-100" />
                    <p className="text-sm text-blue-100">UV Index</p>
                    <p className="font-bold">{currentWeather.uvIndex}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hourly Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly {t('forecast')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">{hour.time}</p>
                      <div className="flex justify-center mb-2">{hour.icon}</div>
                      <p className="font-bold">{hour.temp}°C</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Forecast */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('weekly')} {t('forecast')}</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyForecast.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {day.icon}
                        <div>
                          <p className="font-semibold">{day.day}</p>
                          <p className="text-xs text-muted-foreground">{day.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{day.high}°</span>
                          <span className="text-muted-foreground">{day.low}°</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
