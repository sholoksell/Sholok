import { Inbox } from 'lucide-react';

function EmptyState({ title = 'কোনো ফলাফল পাওয়া যায়নি', subtitle = 'অন্য কিছু খুঁজে দেখুন', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 py-16 text-center dark:border-white/10">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-400 dark:bg-white/5">
        <Icon size={28} />
      </div>
      <p className="font-semibold text-brand-950 dark:text-white">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

export default EmptyState;
