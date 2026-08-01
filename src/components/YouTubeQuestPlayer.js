"use client";

import { useEffect, useRef, useCallback } from "react";
import { getClientSiteUrl } from "@/lib/siteUrl";

/**
 * YouTube IFrame API player — keeps quest progress bar in sync with iframe playback.
 */
export default function YouTubeQuestPlayer({
  videoId,
  onReady,
  onTimeUpdate,
  onDurationChange,
  onPlayingChange,
  onEnded,
  className = "",
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(null);
  const callbacksRef = useRef({ onTimeUpdate, onDurationChange, onPlayingChange, onEnded, onReady });

  callbacksRef.current = { onTimeUpdate, onDurationChange, onPlayingChange, onEnded, onReady };

  const pushTime = useCallback((player) => {
    if (!player?.getCurrentTime) return;
    try {
      const t = player.getCurrentTime();
      callbacksRef.current.onTimeUpdate?.(t);
    } catch {
      /* player tearing down */
    }
  }, []);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPoll = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      pushTime(playerRef.current);
    }, 200);
  }, [pushTime]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    let destroyed = false;

    const mountPlayer = () => {
      if (destroyed || !containerRef.current) return;

      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : getClientSiteUrl();

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin,
        },
        events: {
          onReady: (event) => {
            const duration = event.target.getDuration();
            if (duration && Number.isFinite(duration)) {
              callbacksRef.current.onDurationChange?.(duration);
            }
            const api = {
              play: () => event.target.playVideo(),
              pause: () => event.target.pauseVideo(),
              seekTo: (seconds) => event.target.seekTo(seconds, true),
              getCurrentTime: () => event.target.getCurrentTime(),
              getDuration: () => event.target.getDuration(),
            };
            callbacksRef.current.onReady?.(api);
            pushTime(event.target);
            startPoll();
          },
          onStateChange: (event) => {
            const YT = window.YT;
            const state = event.data;
            const playing =
              state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING;
            const ended = state === YT.PlayerState.ENDED;

            callbacksRef.current.onPlayingChange?.(playing);
            pushTime(event.target);

            if (ended) {
              callbacksRef.current.onPlayingChange?.(false);
              callbacksRef.current.onEnded?.();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      mountPlayer();
    } else {
      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevReady?.();
        mountPlayer();
      };
      if (window.YT?.Player) mountPlayer();
    }

    return () => {
      destroyed = true;
      stopPoll();
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          /* ignore */
        }
      }
      playerRef.current = null;
    };
  }, [videoId, pushTime, startPoll, stopPoll]);

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
