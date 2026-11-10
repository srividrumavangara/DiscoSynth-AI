export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-7 h-7 border-2 border-white/10 border-t-white rounded-full animate-spin mb-3" />
      <p className="text-xs text-[#737373] font-mono">{message}</p>
    </div>
  );
}
