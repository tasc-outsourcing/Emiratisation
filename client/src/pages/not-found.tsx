export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-tasc-primary mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-8">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-tasc-primary text-white rounded-lg hover:bg-tasc-lightblue transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}