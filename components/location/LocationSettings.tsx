"use client";

import { useLocation } from "./LocationProvider";
import { relationLabel } from "@/lib/location";
import { VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

export function LocationSettings() {
  const {
    supported,
    preference,
    status,
    location,
    error,
    refreshLocation,
    revokeLocation,
  } = useLocation();

  return (
    <section className="section location-settings" id="location">
      <div className="section-head">
        <div>
          <p className="eyebrow">Privacy</p>
          <h2>Location</h2>
          <p className="lede">
            Approximate location stays on this device and is only used to relate
            you to {VILLAGE_ALSO_KNOWN_AS}. We never require it to browse the
            site.
          </p>
        </div>
      </div>

      <div className="location-settings-card">
        {!supported ? (
          <p className="muted">
            This browser does not support geolocation. Location features are
            skipped.
          </p>
        ) : (
          <>
            <dl className="location-settings-meta">
              <div>
                <dt>Preference</dt>
                <dd>
                  {preference === "granted"
                    ? "Allowed"
                    : preference === "denied"
                      ? "Blocked"
                      : preference === "dismissed"
                        ? "Skipped for now"
                        : "Not asked yet"}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  {status === "requesting"
                    ? "Updating…"
                    : status === "ready" && location
                      ? "Active"
                      : status === "timeout"
                        ? "Timed out"
                        : status === "error"
                          ? "Unavailable"
                          : "Idle"}
                </dd>
              </div>
              {location ? (
                <>
                  <div>
                    <dt>Summary</dt>
                    <dd>{relationLabel(location)}</dd>
                  </div>
                  <div>
                    <dt>Stored coords</dt>
                    <dd>
                      {location.lat.toFixed(2)}, {location.lng.toFixed(2)}{" "}
                      <span className="muted">(rounded ~1 km)</span>
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>

            {error ? (
              <p className="location-settings-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="location-settings-actions">
              <button
                type="button"
                className="btn"
                onClick={() => void refreshLocation()}
                disabled={status === "requesting"}
              >
                {preference === "granted" ? "Update location" : "Allow location"}
              </button>
              {preference === "granted" || location ? (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={revokeLocation}
                >
                  Clear &amp; revoke
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
