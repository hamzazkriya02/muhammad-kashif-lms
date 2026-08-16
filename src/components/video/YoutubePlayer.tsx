interface YoutubePlayerProps {
  youtubeId: string;
  title: string;
}

export default function YoutubePlayer({ youtubeId, title }: YoutubePlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
