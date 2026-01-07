export const MangaSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 rounded-2xl w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8 mb-12">
      <div className="w-full md:w-80 h-[450px] bg-gray-200 rounded-2xl"></div>
      <div className="flex-1 space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  </div>
);