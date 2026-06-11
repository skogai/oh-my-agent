import {
  formatTimestamp,
  renderPattern,
  shortId,
} from "../../utils/run-naming.js";

export {
  formatTimestamp,
  renderPattern,
  shortId,
} from "../../utils/run-naming.js";

export interface VideoRunId {
  timestamp: string;
  shortid: string;
  mode: string;
  value: string;
}

export function makeVideoRunId(mode: string, date = new Date()): VideoRunId {
  const timestamp = formatTimestamp(date);
  const id = { timestamp, shortid: shortId(), mode };
  return { ...id, value: renderPattern("{timestamp}-{shortid}-{mode}", id) };
}
