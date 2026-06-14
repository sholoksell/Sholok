import Header from '@/components/portal/Header';

const TV = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col">
        <iframe
          src="http://localhost:5174"
          className="flex-1 w-full border-0"
          style={{ height: 'calc(100vh - 64px)' }}
          title="Video Platform"
          allow="fullscreen; autoplay; encrypted-media"
        />
      </div>
    </div>
  );
};

export default TV;
