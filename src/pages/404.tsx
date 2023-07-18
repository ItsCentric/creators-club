export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center bg-black">
      <svg viewBox="0 0 38 18" className="absolute text-white/10">
        <text x="6" y="15" fill="currentColor">
          404
        </text>
      </svg>
      <div className="z-10 max-w-[80%] rounded-lg bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Wait, where are we?</h1>
        <p className="text-gray-500">
          {
            "It doesn't look like this is the page you are looking for. Please try again."
          }
        </p>
      </div>
    </div>
  );
}
