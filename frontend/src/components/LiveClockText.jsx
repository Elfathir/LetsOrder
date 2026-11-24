import { memo, useEffect, useState } from "react";
import { isThemeAnimating } from "../utils/theme.js";
import { formatLiveClock } from "../utils/format.js";

const LiveClockText = memo(function LiveClockText() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      if (!isThemeAnimating()) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular">{formatLiveClock(now)}</span>;
});

export default LiveClockText;
