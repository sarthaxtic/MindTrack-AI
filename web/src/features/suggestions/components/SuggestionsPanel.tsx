"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  ExternalLink,
  AlertTriangle,
  Building2,
  HeartPulse,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import { AnalysisResponse } from "@/features/posts/types/post.types";
import { getSeverity, SeverityLevel } from "@/utils/severity";
import { useTranslation } from "@/hooks/useTranslation";
import {
  COUNSELLORS_WITH_LOCATION,
  assignHospitalDistances,
} from "@/features/suggestions/data/suggestionsData";

// ─── Default cities for fallback ────────────────────────────────────────────

  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
];

// ─── Severity badge ──────────────────────────────────────────────────────────
function SeverityBadge({ level }: { level: SeverityLevel }) {
  const { t } = useTranslation();

  const config: Record<
    SeverityLevel,
    { label: string; classes: string; icon: React.ReactNode }
  > = {
    normal: {
      label: t("severityNormal"),
      classes:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      icon: null,
    },
    mild: {
      label: t("severityMild"),
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      icon: null,
    },
    moderate: {
      label: t("severityModerate"),
      classes: "bg-orange-500/10 text-orange-400 border-orange-500/25",
      icon: <AlertTriangle size={11} />,
    },
    severe: {
      label: t("severitySevere"),
      classes: "bg-red-500/10 text-red-400 border-red-500/25",
      icon: <AlertTriangle size={11} />,
    },
    critical: {
      label: t("severityCritical"),
      classes: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: <ShieldAlert size={11} />,
    },
  };

  const { label, classes, icon } = config[level];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Emergency hotlines ──────────────────────────────────────────────────────
function EmergencyHotlines() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[var(--radius-lg)] border border-rose-500/30 bg-rose-500/8 p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
          <ShieldAlert size={13} className="text-rose-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-300">
            {t("emergencyHotline")}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {t("emergencyHotlineDesc")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[t("iCallHotline"), t("vandrevalaHotline"), t("snehi")].map(
          (hotline) => {
            const phone = hotline.split(": ")[1];
            return (
              <a
                key={hotline}
                href={`tel:${phone}`}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium
                           bg-rose-500/10 text-rose-300 border border-rose-500/25
                           hover:bg-rose-500/20 transition-all duration-200"
              >
                <Phone size={11} />
                {hotline}
              </a>
            );
          }
        )}
      </div>
    </motion.div>
  );
}

// ─── Hospital card ───────────────────────────────────────────────────────────
interface HospitalCardProps {
  hospital: ReturnType<typeof assignHospitalDistances>[number];
}

function HospitalCard({ hospital }: HospitalCardProps) {
  const { t } = useTranslation();

  const typeLabel =
    hospital.type === "hospital"
      ? t("hospitalType")
      : hospital.type === "clinic"
      ? t("clinicType")
      : t("wellnessType");

  const typeColor =
    hospital.type === "hospital"
      ? "text-red-400 border-red-500/25 bg-red-500/10"
      : hospital.type === "clinic"
      ? "text-blue-400 border-blue-500/25 bg-blue-500/10"
      : "text-teal-400 border-teal-500/25 bg-teal-500/10";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4
                 hover:border-[var(--border-active)] transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="size-10 rounded-full bg-red-500/10 border border-red-500/25
                      flex items-center justify-center text-xs font-bold text-red-400 shrink-0"
        >
          {hospital.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] leading-tight">
            {hospital.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${typeColor}`}
            >
              <Building2 size={9} />
              {typeLabel}
            </span>
            {hospital.emergency && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-rose-500/10 text-rose-400 border-rose-500/25">
                <HeartPulse size={9} />
                {t("emergency")}
              </span>
            )}
            {hospital.open24h && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                {t("open24h")}
              </span>
            )}
          </div>
        </div>
        {"distance" in hospital && (
          <div className="flex items-center gap-1 shrink-0">
            <MapPin size={10} className="text-[var(--accent)]" />
            <span className="text-xs text-[var(--accent)] font-medium">
              {hospital.distance} {t("kmAway")}
            </span>
          </div>
        )}
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5">
        {hospital.specialization.map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Rating & Hours */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="font-medium text-[var(--text)]">
            {hospital.rating}
          </span>
          <span className="text-[var(--text-muted)]">({hospital.reviews})</span>
        </div>
        <span className="text-[var(--text-muted)] text-[11px]">
          {hospital.hours}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <a
          href={`tel:${hospital.phone}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium
                     bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]
                     hover:opacity-80 transition-all"
        >
          <Phone size={11} />
          {t("callNowShort")}
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.simLat},${hospital.simLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs
                     border border-[var(--border)] text-[var(--text-secondary)]
                     hover:border-[var(--border-active)] hover:text-[var(--text)] transition-all"
        >
          <Navigation size={11} />
          {t("directionsShort")}
        </a>
        <a
          href={hospital.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs
                     border border-[var(--border)] text-[var(--text-secondary)]
                     hover:border-[var(--border-active)] hover:text-[var(--text)] transition-all"
          aria-label={t("visitWebsite")}
        >
          <ExternalLink size={11} />
          {t("visitWebsite")}
        </a>
      </div>
    </motion.div>
  );
}

// ─── Counselor card (compact, reused from nearby page pattern) ───────────────
interface CounselorCardProps {
  counselor: (typeof COUNSELLORS_WITH_LOCATION)[number] & {
    distance: number;
    simLat: number;
    simLng: number;
  };
}

function CounselorCard({ counselor }: CounselorCardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4
                 hover:border-[var(--border-active)] transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-[var(--accent-dim)] border border-[var(--border-active)] flex items-center justify-center text-sm font-bold text-[var(--accent)] shrink-0">
          {counselor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {counselor.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={10} className="text-[var(--accent)] shrink-0" />
            <span className="text-xs text-[var(--accent)] font-medium">
              {counselor.distance} {t("kmAway")}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border
            ${
              counselor.available
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border)]"
            }`}
        >
          <span
            className={`size-1 rounded-full ${counselor.available ? "bg-green-400" : "bg-[var(--text-muted)]"}`}
          />
          {counselor.available ? t("available") : t("unavailable")}
        </span>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {counselor.specialty.map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Rating & Fee */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="font-medium text-[var(--text)]">
            {counselor.rating}
          </span>
          <span className="text-[var(--text-muted)]">({counselor.reviews})</span>
        </div>
        <span className="font-semibold text-[var(--accent)]">
          {counselor.fee}
          {t("perSession")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${counselor.simLat},${counselor.simLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs
                     bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]
                     hover:opacity-80 transition-all"
        >
          <Navigation size={11} />
          {t("getDirections")}
        </a>
        <a
          href={`https://www.openstreetmap.org/?mlat=${counselor.simLat}&mlon=${counselor.simLng}&zoom=15`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-3 py-2 rounded-[var(--radius-md)] text-xs
                     border border-[var(--border)] text-[var(--text-secondary)]
                     hover:border-[var(--border-active)] hover:text-[var(--text)] transition-all"
          aria-label={t("showOnMap")}
        >
          <ExternalLink size={11} />
        </a>
      </div>
    </motion.div>
  );
}

// ─── Location permission bar ─────────────────────────────────────────────────
interface LocationBarProps {
  status: "idle" | "loading" | "granted" | "denied" | "error";
  onRequest: () => void;
  selectedCity: number;
  onCityChange: (i: number) => void;
}

function LocationBar({
  status,
  onRequest,
  selectedCity,
  onCityChange,
}: LocationBarProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)]">
            {status === "granted"
              ? t("usingCurrentLocation")
              : status === "denied"
              ? t("locationDenied")
              : t("allowLocationPrompt")}
          </p>
        </div>
        <button
          onClick={onRequest}
          disabled={status === "loading" || status === "granted"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium
                     bg-[var(--accent)] text-[#080c10] hover:opacity-90 disabled:opacity-60
                     transition-all duration-200"
        >
          {status === "loading" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Navigation size={12} />
          )}
          {status === "loading" ? t("locating") : t("findNearby")}
        </button>
      </div>

      {status !== "granted" && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">
            {t("browseByCity")}:
          </span>
          <div className="flex gap-1.5">
            {DEFAULT_LOCATIONS.map((loc, i) => (
              <button
                key={loc.name}
                onClick={() => onCityChange(i)}
                className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] transition-all border
                  ${
                    selectedCity === i
                      ? "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--border-active)]"
                      : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-active)]"
                  }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Map embed ───────────────────────────────────────────────────────────────
function MapEmbed({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] h-[320px]">
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.12}%2C${lat - 0.12}%2C${lng + 0.12}%2C${lat + 0.12}&layer=mapnik`}
        className="w-full h-full"
        title="Nearby support locations map"
        loading="lazy"
      />
    </div>
  );
}

// ─── Main SuggestionsPanel ───────────────────────────────────────────────────
interface SuggestionsPanelProps {
  analysis: AnalysisResponse | null;
}

export default function SuggestionsPanel({ analysis }: SuggestionsPanelProps) {
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "error"
  >("idle");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedCity, setSelectedCity] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const [showAllCounselors, setShowAllCounselors] = useState(false);

  const severity = useMemo(
    () => (analysis ? getSeverity(analysis) : null),
    [analysis]
  );

  const activeLoc = userCoords ?? DEFAULT_LOCATIONS[selectedCity];

  const hospitalsWithDist = useMemo(
    () => assignHospitalDistances(activeLoc.lat, activeLoc.lng),
    [activeLoc.lat, activeLoc.lng]
  );

  // Counselors with simulated distances (deterministic, no Math.random)
  const counselorsWithDist = useMemo(() => {
    const offsets = [
      { dlat: 0.02, dlng: 0.03, base: 2.8, extra: 0.5 },
      { dlat: -0.05, dlng: 0.01, base: 5.4, extra: 1.1 },
      { dlat: 0.08, dlng: -0.04, base: 8.7, extra: 0.9 },
      { dlat: -0.01, dlng: 0.07, base: 7.2, extra: 0.7 },
      { dlat: 0.12, dlng: 0.09, base: 14.3, extra: 0.4 },
      { dlat: -0.09, dlng: -0.06, base: 10.8, extra: 1.3 },
    ];
    return COUNSELLORS_WITH_LOCATION.map((c, i) => {
      const off = offsets[i % offsets.length];
      return {
        ...c,
        distance: parseFloat((off.base + off.extra).toFixed(1)),
        simLat: activeLoc.lat + off.dlat,
        simLng: activeLoc.lng + off.dlng,
      };
    }).sort((a, b) => a.distance - b.distance);
  }, [activeLoc.lat, activeLoc.lng]);

  const requestLocation = () => {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted");
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 10000 }
    );
  };

  // Don't render if no analysis or result is normal
  if (!analysis || !severity || !severity.showSuggestions) return null;

  const displayedHospitals = showAllHospitals
    ? hospitalsWithDist
    : hospitalsWithDist.slice(0, 3);
  const displayedCounselors = showAllCounselors
    ? counselorsWithDist
    : counselorsWithDist.slice(0, 3);

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6 scroll-mt-20"
        aria-label={t("suggestionsTitle")}
      >
        {/* ── Section header ── */}
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="size-1.5 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden />
              <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
                {t("suggestionsTitle")}
              </h2>
              <SeverityBadge level={severity.level} />
            </div>
            <p className="text-xs text-[var(--text-muted)] ml-3.5">
              {t("suggestionsSubtitle")}
            </p>
          </div>
          {/* Map toggle */}
          <button
            onClick={() => setShowMap((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs
                       border border-[var(--border)] text-[var(--text-muted)]
                       hover:border-[var(--border-active)] hover:text-[var(--text)] transition-all"
          >
            <MapPin size={12} />
            {t("mapView")}
            {showMap ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>
        </div>

        {/* ── Emergency hotlines (critical only) ── */}
        {severity.showEmergency && <EmergencyHotlines />}

        {/* ── Location bar ── */}
        <LocationBar
          status={locationStatus}
          onRequest={requestLocation}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />

        {/* ── Map ── */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              key="map"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MapEmbed lat={activeLoc.lat} lng={activeLoc.lng} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hospitals (shown for severe / critical) ── */}
        {severity.showHospitals && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}>
              {t("nearbyHospitals")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedHospitals.map((h) => (
                <HospitalCard key={h.id} hospital={h} />
              ))}
            </div>
            {hospitalsWithDist.length > 3 && (
              <button
                onClick={() => setShowAllHospitals((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
              >
                {showAllHospitals ? (
                  <>
                    <ChevronUp size={13} /> {t("showAllHospitals")}
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} /> {t("showAllHospitals")} ({hospitalsWithDist.length})
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Counselors (shown for all non-normal) ── */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>
            {t("nearbyCounselors")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedCounselors.map((c) => (
              <CounselorCard key={c.id} counselor={c} />
            ))}
          </div>
          {counselorsWithDist.length > 3 && (
            <button
              onClick={() => setShowAllCounselors((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
            >
              {showAllCounselors ? (
                <>
                  <ChevronUp size={13} /> {t("showAllCounselors")}
                </>
              ) : (
                <>
                  <ChevronDown size={13} /> {t("showAllCounselors")} ({counselorsWithDist.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-[11px] text-[var(--text-muted)] italic">
          {t("suggestionsDisclaimer")}
        </p>
      </motion.section>
    </AnimatePresence>
  );
}
