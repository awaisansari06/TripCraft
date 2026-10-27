/** A stable card-shaped placeholder shared by trip and saved-place lists. */
export default function TripCardSkeleton() {
  return (
    <div className="dashboard-loading-card" aria-hidden="true">
      <div className="dashboard-loading-image" />
      <div className="dashboard-loading-body"><span /><span /><span /></div>
    </div>
  );
}
