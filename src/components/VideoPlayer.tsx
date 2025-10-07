"use client";
import React from "react";

type Props =
  | { youtubeId: string; src?: never; poster?: string; title?: string }
  | { src: string; poster?: string; youtubeId?: never; title?: string };

export default function VideoPlayer(props: Props) {
  if ("youtubeId" in props) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg aspect-video">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${props.youtubeId}`}
          title={props.title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      className="w-full rounded-lg"
      controls
      poster={props.poster}
      preload="metadata"
    >
      <source src={props.src} type="video/mp4" />
      Votre navigateur ne supporte pas la vidéo HTML5.
    </video>
  );
}
