import assert from "node:assert/strict";
import { test } from "node:test";

globalThis.__DEV__ = false;
const { pageFrameOf } = await import("./pageFrame.ts");
const { layout } = await import("../ui/theme.ts");
const { CARD_INSET } = await import("../../lib/windowLayout.ts");
const { TOOLBAR_ROWS } = await import("../../lib/toolbarRow.ts");
const { DEFAULT_SETTINGS, SETTING_SPECS } = await import("../../state/settings/settings.ts");
const { isConfigSettingKey } = await import("../../state/settings/configAllowlist.ts");
const { SYNCED_SETTINGS } = await import("../../state/sync/settingsAdapter.ts");
const { LIGHTS_CENTER, toolbarLightsCenter } = await import("../../state/windows/dockMotion.ts");
const { openingLightsCenter } = await import("../../state/windows/layout.ts");
const { useBrowser } = await import("../../state/browser/store.ts");

const S = () => useBrowser.getState();

test("edge to edge is off until chosen, syncs like the other appearance settings, and ardia config can set it", () => {
  assert.equal(DEFAULT_SETTINGS.edgeToEdge, false);
  assert.equal(SETTING_SPECS.edgeToEdge.valid(true), true);
  assert.equal(SETTING_SPECS.edgeToEdge.valid("yes"), false);
  assert.ok(SYNCED_SETTINGS.includes("edgeToEdge"));
  assert.ok(isConfigSettingKey("edgeToEdge"));
});

test("off, the page keeps Dia's 9 pt frame and rounded corners; on, it has neither", () => {
  assert.deepEqual(pageFrameOf(false), { inset: CARD_INSET, radius: layout.cardRadius, edgeToEdge: false });
  assert.deepEqual(pageFrameOf(true), { inset: 0, radius: 0, edgeToEdge: true });
  assert.equal(layout.cardInset, CARD_INSET, "the sidebar's own padding doesn't move");
  assert.equal(layout.sidebarCardGap, 0, "the page still starts where the sidebar ends");
});

test("the traffic lights rise with the toolbar, staying centred on its row", () => {
  assert.deepEqual(toolbarLightsCenter(false, false), LIGHTS_CENTER);
  for (const compact of [false, true]) {
    const framed = toolbarLightsCenter(compact, false);
    const edge = toolbarLightsCenter(compact, true);
    assert.deepEqual(edge, [framed[0], framed[1] - CARD_INSET], compact ? "compact" : "regular");
    const row = compact ? TOOLBAR_ROWS.compact : TOOLBAR_ROWS.regular;
    assert.ok(Math.abs(edge[1] - row.center) < 0.5, `${edge[1]} on a ${row.center} pt row centre`);
    assert.equal(toolbarLightsCenter(compact, true), edge, "the same array each time, so effects don't rerun");
  }
});

test("a window opens with its lights where edge to edge puts them, and the Arc layout's are unchanged", () => {
  const id = S().createWindow({ url: "https://a.example/" });
  S().updateSettings({ edgeToEdge: true, addressBar: "toolbar", tabLayout: "sidebar" });
  assert.deepEqual(openingLightsCenter(S(), id), [...toolbarLightsCenter(false, true)]);
  S().updateSettings({ addressBar: "sidebar" });
  const arc = openingLightsCenter(S(), id);
  S().updateSettings({ edgeToEdge: false });
  assert.deepEqual(openingLightsCenter(S(), id), arc);
  S().updateSettings({ addressBar: "toolbar" });
  assert.deepEqual(openingLightsCenter(S(), id), [...LIGHTS_CENTER]);
});
