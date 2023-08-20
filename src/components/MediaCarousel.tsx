import Image from "next/image";
import { useState } from "react";
import type { Media } from "@prisma/client";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import { cn } from "~/utils/utils";

export default function MediaCarousel(props: {
  media: Media[] | File[];
  alt: string;
  className?: string;
}) {
  const { media, alt, className } = props;
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const currentMedia = media[currentMediaIndex];
  const hasMultipleMedia = media.length > 1;
  if (!currentMedia) return;
  const mediaUrl =
    currentMedia instanceof File
      ? URL.createObjectURL(currentMedia)
      : currentMedia.url;
  const mediaId =
    currentMedia instanceof File ? currentMedia.name : currentMedia.id;

  return (
    <div className={cn("relative " + (className ?? ""))} key={mediaId}>
      {hasMultipleMedia && (
        <button
          type="button"
          onClick={() => {
            if (currentMediaIndex > 0) {
              setCurrentMediaIndex((previousMedia) => previousMedia - 1);
            } else {
              setCurrentMediaIndex(media.length - 1);
            }
          }}
          className="pointer-events-auto absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-none px-2 mix-blend-difference"
        >
          <BsArrowLeftCircle
            size={32}
            className="text-white transition-all hover:h-9 hover:w-9"
          />
        </button>
      )}
      <Image
        src={mediaUrl}
        alt={alt}
        fill={true}
        className="pointer-events-none relative mx-auto object-contain"
      />
      {hasMultipleMedia && (
        <button
          type="button"
          onClick={() => {
            if (currentMediaIndex < media.length - 1) {
              setCurrentMediaIndex((previousMedia) => previousMedia + 1);
            } else {
              setCurrentMediaIndex(0);
            }
          }}
          className="pointer-events-auto absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-none px-2 text-white mix-blend-difference"
        >
          <BsArrowRightCircle
            size={32}
            className="transition-all hover:h-9 hover:w-9"
          />
        </button>
      )}
      {hasMultipleMedia && (
        <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {media.map((mediaItem, index) => {
            return (
              <div
                key={mediaId + index.toString()}
                className={`h-1 w-6 rounded-full ${
                  currentMediaIndex === index ? "bg-foreground" : "bg-muted"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
