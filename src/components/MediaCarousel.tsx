import Image from "next/image";
import { useRef, useState } from "react";
import type { Media } from "@prisma/client";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import { cn } from "~/utils/utils";
import {
  BiFastForward,
  BiPause,
  BiPlay,
  BiVolumeFull,
  BiVolumeMute,
} from "react-icons/bi";
import { Slider } from "./ui/slider";

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
  const mediaFormat =
    currentMedia instanceof File
      ? currentMedia.type
      : currentMedia.type.toLowerCase() + "/" + currentMedia.format;
  const mediaType = mediaFormat?.split("/")[0];

  return (
    <>
      <div className={cn("peer relative " + (className ?? ""))} key={mediaId}>
        {mediaType === "image" && (
          <Image
            src={mediaUrl}
            alt={alt}
            fill={true}
            className="pointer-events-none relative mx-auto object-contain"
          />
        )}
        {mediaType === "video" && (
          <VideoPlayer videoUrl={mediaUrl} videoFormat={mediaFormat} />
        )}
      </div>
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
          className="pointer-events-auto absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-none px-2 opacity-0 transition-opacity hover:opacity-100 peer-hover:opacity-100"
        >
          <BsArrowLeftCircle
            size={32}
            className="text-white transition-all hover:h-9 hover:w-9"
          />
        </button>
      )}
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
          className="pointer-events-auto absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-none px-2 text-white opacity-0 transition-opacity hover:opacity-100 peer-hover:opacity-100"
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
    </>
  );
}

type VideoState = {
  playing: boolean;
  progress: number;
  muted: boolean;
  scrubbing: boolean;
  volume: number;
};
function VideoPlayer(props: { videoUrl: string; videoFormat: string }) {
  const { videoUrl, videoFormat } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<VideoState>({
    playing: false,
    progress: 0,
    muted: false,
    scrubbing: false,
    volume: 0.8,
  });
  const progressPercent =
    videoState.progress / (videoRef.current?.duration ?? 0);
  const formatter = new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const formattedDuration = `${Math.floor(
    (videoRef.current?.duration ?? 0) / 60
  )}:${formatter.format(Math.floor((videoRef.current?.duration ?? 0) % 60))}`;
  const formattedCurrentTime = `${Math.floor(
    (videoRef.current?.currentTime ?? 0) / 60
  )}:${formatter.format(
    Math.floor((videoRef.current?.currentTime ?? 0) % 60)
  )}`;

  function updateVideoState(data: Partial<VideoState>) {
    setVideoState((previousData) => ({ ...previousData, ...data }));
  }

  return (
    <>
      <video
        ref={videoRef}
        muted={videoState.muted}
        onTimeUpdate={(e) => {
          updateVideoState({ progress: e.currentTarget.currentTime });
          if (e.currentTarget.currentTime / e.currentTarget.duration === 1)
            updateVideoState({ playing: false });
        }}
        onClick={() => {
          videoRef.current?.paused
            ? void videoRef.current?.play()
            : videoRef.current?.pause();
          updateVideoState({ playing: !videoState.playing });
        }}
        className="peer relative mx-auto object-contain"
      >
        <source src={videoUrl} type={videoFormat} />
      </video>
      <div className="pointer-events-auto absolute -bottom-1 flex w-full flex-col items-center justify-center gap-2 bg-gradient-to-t from-black pb-2 text-white opacity-0 transition-opacity hover:opacity-100 peer-hover:opacity-100">
        <div className="pointer-events-auto z-20 flex w-full items-center justify-between px-4">
          <div className="drop-shadow-md">
            <span>{formattedCurrentTime}</span>
            <span className="whitespace-pre"> / </span>
            <span>{formattedDuration}</span>
          </div>
          <div className="flex gap-2">
            <button
              className="transition-colors hover:text-white/80"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime -= 10;
                }
              }}
            >
              <BiFastForward size={32} className="rotate-180" />
            </button>
            <button
              type="button"
              className="transition-colors hover:text-white/80"
              onClick={() => {
                videoRef.current?.paused
                  ? void videoRef.current?.play()
                  : videoRef.current?.pause();
                updateVideoState({ playing: !videoState.playing });
              }}
            >
              {videoState.playing ? (
                <BiPause size={32} />
              ) : (
                <BiPlay size={32} />
              )}
            </button>
            <button
              className="transition-colors hover:text-white/80"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime += 10;
                }
              }}
            >
              <BiFastForward size={32} />
            </button>
          </div>
          <div className="group relative flex cursor-pointer items-center gap-1">
            {(videoState.muted || videoState.volume === 0) && (
              <BiVolumeMute
                size={24}
                onClick={() => {
                  updateVideoState({ muted: !videoState.muted });
                }}
              />
            )}
            {!videoState.muted && videoState.volume > 0 && (
              <BiVolumeFull
                size={24}
                onClick={() => {
                  updateVideoState({ muted: !videoState.muted });
                }}
              />
            )}
            <Slider
              defaultValue={[0.8]}
              max={1}
              step={0.1}
              onValueCommit={(newVolume) => {
                if (videoRef.current && newVolume[0]) {
                  videoRef.current.volume = newVolume[0];
                  updateVideoState({ volume: newVolume[0] });
                }
              }}
              className="w-12"
            />
          </div>
        </div>
        <Slider
          value={[progressPercent]}
          max={1}
          className="h-1"
          onValueChange={(e) => {
            updateVideoState({ scrubbing: true });
            if (videoRef.current && e[0]) {
              videoRef.current.currentTime = videoRef.current.duration * e[0];
            }
          }}
        />
      </div>
    </>
  );
}
