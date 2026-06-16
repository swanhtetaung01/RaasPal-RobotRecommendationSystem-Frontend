import { ToolsClient } from '../tools/ToolsClient';

/**
 * Legacy /cvte route — CVTE monitoring now lives under the consolidated Tools
 * page. Kept so existing links/bookmarks open straight on the monitor tab.
 */
export default function CvtePage() {
  return <ToolsClient initialTab="monitor" />;
}
