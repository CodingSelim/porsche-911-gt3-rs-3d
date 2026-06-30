/**
 * Maps the 911 GT3 RS model's ~450 named nodes into a handful of meaningful
 * assemblies. The grouping drives two things:
 *   1. how far each part travels in the exploded view (explodeMul)
 *   2. which assembly the camera flies to during a "teardown" chapter
 *
 * Order matters: more specific patterns are tested first (e.g. the rear wing's
 * node name contains "Body", so "wing" must win before "body").
 */

export type GroupId =
  | "wing"
  | "brake"
  | "wheel"
  | "light"
  | "glass"
  | "interior"
  | "engine"
  | "door"
  | "body";

interface GroupDef {
  id: GroupId;
  label: string;
  test: RegExp;
  /** Multiplier applied to a part's outward travel during disassembly. */
  explodeMul: number;
}

// Evaluated top-to-bottom; first match wins. "body" is the catch-all.
const GROUPS: GroupDef[] = [
  { id: "wing", label: "Aero", explodeMul: 1.35, test: /spoiler|wing|aero|swan|diffuser|splitter|fin|underfloor/i },
  { id: "brake", label: "Brakes", explodeMul: 1.55, test: /brake|caliper|disc|rotor|pccb|\bpad\b/i },
  { id: "wheel", label: "Wheels", explodeMul: 1.45, test: /wheel|rim|tyre|tire|\bhub\b|lug|center.?lock/i },
  { id: "glass", label: "Glazing", explodeMul: 1.3, test: /glass|window|windscreen|windshield/i },
  { id: "interior", label: "Cockpit", explodeMul: 0.72, test: /dial|steer|seat|dash|gauge|cluster|stich|stitch|belt|cinture|harness|pedal|switch|display|tunnel|tag_|cockpit/i },
  { id: "engine", label: "Powertrain", explodeMul: 1.1, test: /engine|exhaust|intake|cylinder|piston|manifold|turbo|radiator|fuel/i },
  { id: "light", label: "Lighting", explodeMul: 1.2, test: /light|lamp|head|tail|drl|\bled\b/i },
  { id: "door", label: "Doors", explodeMul: 1.38, test: /door|handle|mirror/i },
  { id: "body", label: "Monocoque", explodeMul: 1.0, test: /.*/i },
];

export const classifyPart = (name: string): GroupId => {
  for (const g of GROUPS) if (g.test.test(name)) return g.id;
  return "body";
};

export const GROUP_CONFIG: Record<GroupId, { label: string; explodeMul: number }> =
  GROUPS.reduce(
    (acc, g) => {
      acc[g.id] = { label: g.label, explodeMul: g.explodeMul };
      return acc;
    },
    {} as Record<GroupId, { label: string; explodeMul: number }>,
  );
