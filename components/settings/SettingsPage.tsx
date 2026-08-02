import { Reveal } from "@/components/Reveal";
import { LocationSettings } from "@/components/location/LocationSettings";
import { NotificationPrefs } from "@/components/notifications/NotificationPrefs";
import { SITE_NAME } from "@/lib/site";

export function SettingsPage() {
  return (
    <div className="settings-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">{SITE_NAME}</p>
            <h1>Settings</h1>
            <p className="lede">
              Manage privacy and alert preferences for this device. Changes stay
              in your browser and are never required to use the site.
            </p>
          </div>
        </div>
      </Reveal>
      <NotificationPrefs />
      <LocationSettings />
    </div>
  );
}
