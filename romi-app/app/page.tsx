"use client";

import { RomiProvider, useRomi } from "./romi/RomiContext";
import { FindScreen } from "./romi/screens/FindScreen";
import { PlaceDetail } from "./romi/screens/PlaceDetail";
import { ResultsScreen } from "./romi/screens/ResultsScreen";
import { SavedScreen } from "./romi/screens/SavedScreen";
import { ScoutWizard } from "./romi/screens/ScoutWizard";

// Screen flow: Find → Results (map + cards) → Place detail. Saved and Scout live in the tab bar.
function Screens() {
  const r = useRomi();
  if (r.screen === "report") return <ScoutWizard />;
  if (r.screen === "saved") return <SavedScreen />;
  const detail = r.expandedId ? r.allCards().find((c) => c.id === r.expandedId) : null;
  if (detail) return <PlaceDetail place={detail} />;
  if (r.homeView === "results" || r.viewingSavedDay) return <ResultsScreen />;
  return <FindScreen />;
}

export default function Home() {
  return (
    <RomiProvider>
      <Screens />
    </RomiProvider>
  );
}
