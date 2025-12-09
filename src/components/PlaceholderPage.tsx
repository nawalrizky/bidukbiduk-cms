interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        {description && (
          <p className="text-lg text-gray-600 mb-8">{description}</p>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-2">Segera Hadir</h2>
          <p className="text-yellow-700">
            Fitur ini sedang dalam pengembangan dan akan segera tersedia.
          </p>
        </div>
      </div>
    </div>
  )
}
