import DashboardHero from "./_components/DashboardHero";
import QuickActions from "./_components/QuickActions";
import UserTrips from "./_components/UserTrips";
import SavedPlacesList from "./_components/SavedPlacesList";
import SiteFooter from "../_components/SiteFooter";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <main className="tc-page tc-dashboard">
      <div className="dashboard-shell">
        <DashboardHero />
        <QuickActions />
        <UserTrips />
        <SavedPlacesList />
      </div>
      <SiteFooter />
    </main>
  );
}
