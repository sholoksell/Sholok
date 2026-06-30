import Breadcrumb from '../components/Breadcrumb';
import Tabs from '../components/Tabs';
import NovelCard from '../components/NovelCard';
import EmptyState from '../components/EmptyState';
import { novels } from '../data/novels';

const TABS = [
  { value: 'popular', label: 'জনপ্রিয়' },
  { value: 'ongoing', label: 'চলমান' },
  { value: 'completed', label: 'সম্পূর্ণ' },
  { value: 'new', label: 'নতুন অধ্যায়' },
];

function NovelsPage() {
  function getList(tab) {
    switch (tab) {
      case 'ongoing':
        return novels.filter((n) => n.status === 'চলমান');
      case 'completed':
        return novels.filter((n) => n.status === 'সম্পূর্ণ');
      case 'new':
        return [...novels].sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
      default:
        return [...novels].sort((a, b) => b.views - a.views);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'ওয়েব নভেল' }]} />
      <h1 className="mb-2 text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">ওয়েব নভেল</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">প্রতি সপ্তাহে নতুন অধ্যায় সহ জনপ্রিয় ওয়েব নভেলসমূহ</p>

      <Tabs tabs={TABS} defaultTab="popular">
        {(active) => {
          const list = getList(active);
          return list.length === 0 ? (
            <EmptyState title="কোনো নভেল পাওয়া যায়নি" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {list.map((n) => (
                <NovelCard key={n.id} novel={n} />
              ))}
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}

export default NovelsPage;
