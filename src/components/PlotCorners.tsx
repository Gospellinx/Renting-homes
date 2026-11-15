/**
 * Survey-plan corner beacons. Drop inside any `relative` element to frame it
 * the way a plot is marked out on a survey plan.
 */
const PlotCorners = () => (
  <>
    <span aria-hidden className="plot-corner plot-corner-tl" />
    <span aria-hidden className="plot-corner plot-corner-tr" />
    <span aria-hidden className="plot-corner plot-corner-bl" />
    <span aria-hidden className="plot-corner plot-corner-br" />
  </>
);

export default PlotCorners;
