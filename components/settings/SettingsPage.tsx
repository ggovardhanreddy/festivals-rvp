import { Reveal } from "@/components/Reveal";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { LocationSettings } from "@/components/location/LocationSettings";
import { NotificationPrefs } from "@/components/notifications/NotificationPrefs";
import { SettingsChrome } from "@/components/settings/SettingsChrome";

export function SettingsPage() {
  return (
    <div className="settings-page">
      <Reveal className="section">
        <SettingsChrome />
      </Reveal>
      <LanguageSettings />
      <NotificationPrefs />
      <LocationSettings />
    </div>
  );
}
