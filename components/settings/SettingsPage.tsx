import { Reveal } from "@/components/Reveal";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { LocationSettings } from "@/components/location/LocationSettings";
import { NotificationPrefs } from "@/components/notifications/NotificationPrefs";
import { SettingsChrome } from "@/components/settings/SettingsChrome";
import { EasyModeToggle } from "@/components/easy/EasyModeToggle";

export function SettingsPage() {
  return (
    <div className="settings-page">
      <Reveal className="section">
        <SettingsChrome />
      </Reveal>
      <LanguageSettings />
      <EasyModeToggle />
      <NotificationPrefs />
      <LocationSettings />
    </div>
  );
}
