import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, MoreHorizontal } from "lucide-react";

const WeatherWidget = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-foreground">Weather</h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">Gulshan, Dhaka</span>
        </div>
      </div>

      {/* Main Weather Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Sun className="w-10 h-10 fill-current" />
          </div>
          <div>
            <div className="flex items-start">
              <span className="text-4xl font-bold text-foreground">28°</span>
            </div>
            <span className="text-sm text-muted-foreground">Sunny & Clear</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground">
            <span className="text-blue-500">22°</span> / <span className="text-red-500">30°</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <span>Dust</span>
            <span className="font-bold text-green-600">Good</span>
          </div>
        </div>
      </div>

      {/* Hourly Forecast Graph (Mock) */}
      <div className="relative h-24 mb-2">
        {/* Graph Line */}
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <path
            d="M0,50 C20,45 50,20 100,20 S150,60 200,50 S280,10 350,30"
            fill="none"
            stroke="url(#temp-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="temp-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Points and Labels */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <span className="mb-6">26°</span>
            <span>Now</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="mb-10">29°</span>
            <span>3PM</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="mb-5">27°</span>
            <span>6PM</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="mb-3">25°</span>
            <span>9PM</span>
          </div>
        </div>
      </div>

      <button className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors flex items-center justify-center gap-1">
        View Weekly Forecast <MoreHorizontal className="w-3 h-3" />
      </button>
    </div>
  );
};

export default WeatherWidget;
