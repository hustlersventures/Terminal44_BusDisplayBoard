import type { Advertisement } from "@/lib/types";

export default function AdSlide({ ad, onVideoEnded }: { ad: Advertisement; onVideoEnded: () => void }) {
  // In the default 5s slot, a video that's shorter than 5s loops to fill
  // it rather than ending early — "5 seconds" should mean 5 seconds for
  // every media type. Only a video that opted into its full length ends
  // (and advances the rotation) the moment it actually finishes.
  const playsFullLength = ad.media_type === "video" && ad.play_full_duration;

  return (
    <div className="flex flex-1 items-center justify-center bg-stone-900">
      {ad.media_type === "video" ? (
        <video
          key={ad.id}
          src={ad.public_url}
          autoPlay
          muted
          playsInline
          loop={!playsFullLength}
          onEnded={playsFullLength ? onVideoEnded : undefined}
          className="max-h-full max-w-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={ad.id} src={ad.public_url} alt={ad.title} className="max-h-full max-w-full object-contain" />
      )}
    </div>
  );
}
