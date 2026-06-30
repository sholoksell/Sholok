import { useState } from 'react';

function Tabs({ tabs, defaultTab, onChange, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.value);

  function handleClick(value) {
    setActive(value);
    onChange?.(value);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 rounded-full bg-brand-50 p-1.5 dark:bg-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleClick(tab.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active === tab.value
                ? 'bg-brand-600 text-white shadow-soft'
                : 'text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}

export default Tabs;
