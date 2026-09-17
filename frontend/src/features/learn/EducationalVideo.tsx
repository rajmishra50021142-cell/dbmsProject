import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Video, Play, Pause, Clock, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';
import { EDUCATIONAL_VIDEO_CONFIG } from '../../config/learningResources';

function parseTimestampToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export const EducationalVideo: React.FC = () => {
  const youTubeId = extractYouTubeId(EDUCATIONAL_VIDEO_CONFIG.source);
  const [startSeconds, setStartSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [activeTimestampIndex, setActiveTimestampIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setVideoError(true);
      });
    }
  };

  const handleSeek = (timeStr: string, idx: number) => {
    setActiveTimestampIndex(idx);
    setCurrentTime(timeStr);
    const secs = parseTimestampToSeconds(timeStr);
    setStartSeconds(secs);
    setIsPlaying(true);

    if (videoRef.current) {
      videoRef.current.currentTime = secs;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {EDUCATIONAL_VIDEO_CONFIG.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {EDUCATIONAL_VIDEO_CONFIG.description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant="accent" size="sm">
                Duration: {EDUCATIONAL_VIDEO_CONFIG.duration}
              </Badge>
              <Badge variant="neutral" size="sm">
                Topic: {EDUCATIONAL_VIDEO_CONFIG.topic}
              </Badge>
              <a
                href={EDUCATIONAL_VIDEO_CONFIG.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors"
              >
                <span>YouTube Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Video Player Canvas with YouTube Embed & Local Fallback */}
          <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center group">
            {youTubeId ? (
              <iframe
                key={`${youTubeId}-${startSeconds}`}
                src={`https://www.youtube-nocookie.com/embed/${youTubeId}?start=${startSeconds}&autoplay=${isPlaying ? 1 : 0}&rel=0`}
                title={EDUCATIONAL_VIDEO_CONFIG.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : !videoError ? (
              <video
                ref={videoRef}
                src={EDUCATIONAL_VIDEO_CONFIG.source}
                className="w-full h-full object-contain"
                onError={() => setVideoError(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={false}
                preload="metadata"
              />
            ) : null}

            {/* Offline / Placeholder Lecture Screen when local MP4 not found and no YouTube ID */}
            {!youTubeId && videoError && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center text-white select-none">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                  <Video className="w-8 h-8 text-indigo-300" />
                </div>
                <h4 className="text-base sm:text-lg font-bold tracking-tight mb-1 text-white">
                  Embedded Multimedia Lecture Module
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-4 leading-relaxed">
                  Interactive lecture stream configured for educational playback.
                </p>

                {/* Animated Simulation Banner */}
                <div className="w-full max-w-md p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-slate-200">
                      Topic #{activeTimestampIndex + 1}: {EDUCATIONAL_VIDEO_CONFIG.keyTimestamps?.[activeTimestampIndex]?.label}
                    </span>
                  </div>
                  <Badge variant="accent" size="sm">
                    {currentTime}
                  </Badge>
                </div>
              </div>
            )}

            {/* In-Video Overlay Play Button for local video */}
            {!youTubeId && !videoError && (
              <div
                onClick={togglePlay}
                className={`absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform">
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </div>
              </div>
            )}
          </div>

          {/* Direct Video Link Callout */}
          <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Video Link:</span>
              <a
                href={EDUCATIONAL_VIDEO_CONFIG.source}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline break-all"
              >
                {EDUCATIONAL_VIDEO_CONFIG.source}
              </a>
            </div>
            <a
              href={EDUCATIONAL_VIDEO_CONFIG.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium shrink-0 transition-colors"
            >
              <span>Open in YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Interactive Chapter Markers / Syllabus Index */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              Syllabus Lecture Chapters & Key Topics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {EDUCATIONAL_VIDEO_CONFIG.keyTimestamps?.map((ts, idx) => (
                <button
                  key={ts.time}
                  onClick={() => handleSeek(ts.time, idx)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs ${
                    activeTimestampIndex === idx
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 font-semibold text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {ts.time}
                  </span>
                  <span className="line-clamp-2">{ts.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Lecture Takeaways */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Pedagogical Video Summary
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              This lecture walks through the relational normalization hierarchy from unnormalized data with repeating groups down through 1NF, 2NF, 3NF, 4NF, and 5NF. Special visual emphasis is placed on identifying 2NF partial key dependencies via candidate keys, recognizing transitive dependency chains in 3NF, isolating multivalued dependencies (MVDs) in 4NF, and understanding join dependencies in 5NF.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 1NF, 2NF, 3NF, 4NF & 5NF coverage
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Interactive syllabus chapter seeking
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Grounded in textbook curriculum
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
