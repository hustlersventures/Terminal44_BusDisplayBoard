import type { Advertisement } from "@/lib/types";

export default function AdSlide({ ad, onVideoEnded }: { ad: Advertisement; onVideoEnded: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-stone-900">
      {ad.media_type === "video" ? (
        <video
          key={ad.id}
          src={ad.public_url}
          autoPlay
          muted
          playsInline
          onEnded={onVideoEnded}
          className="max-h-full max-w-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={ad.id} src={ad.public_url} alt={ad.title} className="max-h-full max-w-full object-contain" />
      )}
    </div>
  );
}
