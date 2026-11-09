import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Heart, CalendarPlus, Navigation, SkipForward, RotateCcw, Music, VolumeX } from 'lucide-react';
import { weddingMusic } from './weddingMusic';

const INTRO_VIDEO = encodeURI('/gemini_generated_video_385fd4f4 (online-video-cutter.com).mp4');
const EVENT_DATE = new Date('2026-12-07T09:57:00+05:30');
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Hotel Aknara, Panadura');
const CALENDAR_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=' + encodeURIComponent('Wedding of Viranga & Umesha') +
  '&dates=20261207T042700Z/20261207T103000Z' +
  '&location=' + encodeURIComponent('Hotel Aknara, No. 51/9 Sri Gnanasena Mawatha, Gorakapola - Panadura Rd, Panadura');

type Stage = 'cover' | 'video' | 'details';

export default function App() {
  const [stage, setStage] = useState<Stage>('cover');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [musicOn, setMusicOn] = useState(false);

  const openInvitation = () => {
    weddingMusic.unlock(); // unlock audio during the tap
    setStage('video');
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.muted = false;
      // Called inside the click so the browser allows playback with sound
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => setStage('details'));
      });
    }
  };

  const showDetails = () => {
    videoRef.current?.pause();
    setStage('details');
    window.scrollTo({ top: 0 });
    weddingMusic.start();
    setMusicOn(true);
  };

  const replay = () => {
    weddingMusic.stop();
    setMusicOn(false);
    setStage('cover');
  };

  return (
    <div className="min-h-screen bg-[#1a140c] text-[#2b2118] overflow-x-hidden">
      {/* STAGE 1: Cover */}
      {stage === 'cover' && <Cover onOpen={openInvitation} />}

      {/* STAGE 2: Intro video (kept mounted so play() can run inside the click) */}
      <div
        className={`fixed inset-0 z-40 bg-black flex items-center justify-center transition-opacity duration-700 ${
          stage === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <video
          ref={videoRef}
          src={INTRO_VIDEO}
          playsInline
          preload="auto"
          onEnded={showDetails}
          className="w-full h-full object-contain"
        />
        {stage === 'video' && (
          <button
            onClick={showDetails}
            className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white text-xs tracking-[0.2em] uppercase font-sans-modern"
          >
            Skip <SkipForward className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* STAGE 3: Details */}
      {stage === 'details' && <Details onReplay={replay} />}

      {/* Music toggle */}
      {stage === 'details' && (
        <button
          onClick={() => setMusicOn(weddingMusic.toggle())}
          aria-label={musicOn ? 'Pause music' : 'Play music'}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-[#2b2118] text-[#f3e6cc] shadow-lg flex items-center justify-center hover:bg-[#3d2f20] transition-colors"
        >
          {musicOn ? <Music className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

function Cover({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="kraft-paper min-h-screen flex flex-col items-center justify-center text-center px-6 animate-fadeIn">
      <div className="max-w-md w-full">
        <Rule />
        <p className="font-script text-3xl sm:text-4xl text-[#2b2118] mt-4">Wedding of</p>
        <h1 className="font-script text-5xl sm:text-7xl leading-tight text-[#2b2118] mt-1">
          Viranga &amp; Umesha
        </h1>
        <p className="font-serif-luxury text-lg sm:text-xl font-semibold tracking-[0.3em] mt-4 text-[#4a3826]">
          07 . 12 . 2026
        </p>
        <Rule className="mt-6" />

        <button
          onClick={onOpen}
          className="mt-10 inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[#2b2118] text-[#f3e6cc] font-serif-luxury text-lg tracking-[0.2em] uppercase shadow-lg hover:bg-[#3d2f20] hover:-translate-y-0.5 transition-all"
        >
          <Heart className="w-5 h-5" />
          View Invitation
        </button>
        <p className="mt-4 text-xs text-[#6b5640] font-sans-modern">Tap to open · sound on 🔊</p>
      </div>
    </section>
  );
}

function Details({ onReplay }: { onReplay: () => void }) {
  const t = useCountdown(EVENT_DATE);

  return (
    <section className="kraft-paper min-h-screen flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="w-full max-w-xl text-center">
        {/* Heading */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-[#2b2118]/70" />
          <span className="font-script text-3xl sm:text-4xl">Wedding of</span>
          <span className="flex-1 h-px bg-[#2b2118]/70" />
        </div>
        <h1 className="font-script text-5xl sm:text-7xl leading-tight mt-1">Viranga &amp; Umesha</h1>

        <HeartRule className="mt-4" />

        {/* Date plaque */}
        <div className="mt-4 mx-auto max-w-sm border-2 border-[#2b2118] rounded-[18px] p-1">
          <div className="border border-[#2b2118] rounded-[14px] py-3">
            <p className="font-serif-luxury font-bold text-4xl sm:text-5xl tracking-wider">07.12.2026</p>
          </div>
        </div>
        <p className="mt-2 font-serif-luxury italic text-lg text-[#4a3826]">Monday</p>

        {/* Venue */}
        <div className="mt-6">
          <p className="flex items-center justify-center gap-2 font-serif-luxury font-bold text-3xl sm:text-4xl">
            <MapPin className="w-7 h-7 fill-[#2b2118] text-[#e8d9b8]" />
            Hotel Aknara
          </p>
          <p className="font-serif-luxury text-2xl">Panadura</p>
          <p className="mt-3 font-serif-luxury text-base sm:text-lg leading-snug text-[#3a2c1e]">
            No. 51/9 Sri Gnanasena Mawatha,
            <br />
            Gorakapola - Panadura Rd, Panadura.
          </p>
          <p className="mt-3 font-serif-luxury font-bold text-xl sm:text-2xl">From 9.57 a.m. Onwards</p>
        </div>

        <HeartRule className="mt-5" />

        {/* Countdown */}
        <div className="mt-6 grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {[
            ['Days', t.days],
            ['Hours', t.hours],
            ['Mins', t.minutes],
            ['Secs', t.seconds],
          ].map(([label, val]) => (
            <div key={label} className="rounded-xl border border-[#2b2118]/40 bg-[#2b2118]/5 py-2">
              <p className="font-serif-luxury font-bold text-2xl">{String(val).padStart(2, '0')}</p>
              <p className="text-[10px] uppercase tracking-widest font-sans-modern text-[#6b5640]">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2b2118] text-[#f3e6cc] font-sans-modern text-sm tracking-wider hover:bg-[#3d2f20] transition-colors"
          >
            <Navigation className="w-4 h-4" /> Get Directions
          </a>
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#2b2118] font-sans-modern text-sm tracking-wider hover:bg-[#2b2118]/10 transition-colors"
          >
            <CalendarPlus className="w-4 h-4" /> Add to Calendar
          </a>
        </div>

        <button
          onClick={onReplay}
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-sans-modern text-[#6b5640] hover:text-[#2b2118]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Watch the intro again
        </button>
      </div>
    </section>
  );
}

function Rule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex-1 h-px bg-[#2b2118]/60" />
      <Heart className="w-4 h-4 text-[#2b2118]" />
      <span className="flex-1 h-px bg-[#2b2118]/60" />
    </div>
  );
}

function HeartRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="w-24 sm:w-32 h-[3px] border-y border-[#2b2118]/80" />
      <Heart className="w-5 h-5 text-[#2b2118]" />
      <span className="w-24 sm:w-32 h-[3px] border-y border-[#2b2118]/80" />
    </div>
  );
}

function useCountdown(target: Date) {
  const calc = () => {
    const d = Math.max(0, +target - Date.now());
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d / 3600000) % 24),
      minutes: Math.floor((d / 60000) % 60),
      seconds: Math.floor((d / 1000) % 60),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}
