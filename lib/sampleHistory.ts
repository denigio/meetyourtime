import type { CalendarEvent } from "@/types";

interface Seed {
  title: string;
  daysAgo: number;
  hour: number;
  minute?: number;
  durationMinutes: number;
  attendees: string[];
  organizer?: string;
  description?: string;
  recurring?: boolean;
}

function buildEvent(seed: Seed, idx: number): CalendarEvent {
  const start = new Date();
  start.setDate(start.getDate() - seed.daysAgo);
  start.setHours(seed.hour, seed.minute ?? 0, 0, 0);
  const end = new Date(start.getTime() + seed.durationMinutes * 60_000);

  return {
    id: `sample-${idx}`,
    title: seed.title,
    start: start.toISOString(),
    end: end.toISOString(),
    durationMinutes: seed.durationMinutes,
    attendeeCount: seed.attendees.length,
    attendees: seed.attendees,
    organizer: seed.organizer,
    description: seed.description,
    recurring: seed.recurring ?? false,
  };
}

const PMS = [
  "Priya Shah",
  "Marco Alvarez",
  "Diane Okafor",
  "Jin Park",
  "Sara Lin",
  "Tomás Riveiro",
  "Maya Chen",
  "Elena Petrova",
  "Devon Wright",
  "Aiden Kapoor",
];

const ENG = ["Ravi Kumar", "Lia Holm", "Sam Ortiz", "Noor Hassan"];
const DESIGN = ["Kira Yamato", "Jules Beaumont"];
const EXEC = ["VP Product", "Head of Eng", "CEO"];

const all = [...PMS, ...ENG, ...DESIGN];

const SEEDS: Seed[] = [
  // ── REPLACE: habit / recurring status (4 weeks of standup) ──
  {
    title: "Daily product standup",
    daysAgo: 27,
    hour: 9,
    minute: 30,
    durationMinutes: 30,
    attendees: all.slice(0, 9),
    organizer: "Priya Shah",
    description: "Standing meeting. Round-robin updates from each PM.",
    recurring: true,
  },
  {
    title: "Daily product standup",
    daysAgo: 20,
    hour: 9,
    minute: 30,
    durationMinutes: 30,
    attendees: all.slice(0, 9),
    organizer: "Priya Shah",
    description: "Standing meeting. Round-robin updates from each PM.",
    recurring: true,
  },
  {
    title: "Daily product standup",
    daysAgo: 13,
    hour: 9,
    minute: 30,
    durationMinutes: 30,
    attendees: all.slice(0, 9),
    organizer: "Priya Shah",
    description: "Standing meeting. Round-robin updates from each PM.",
    recurring: true,
  },
  {
    title: "Daily product standup",
    daysAgo: 6,
    hour: 9,
    minute: 30,
    durationMinutes: 30,
    attendees: all.slice(0, 9),
    organizer: "Priya Shah",
    description: "Standing meeting. Round-robin updates from each PM.",
    recurring: true,
  },

  // ── REPLACE: CYA — big tents with no decision ──
  {
    title: "Q2 OKR roundtable",
    daysAgo: 25,
    hour: 14,
    durationMinutes: 60,
    attendees: [...PMS, ...EXEC, "Lia Holm"],
    organizer: "VP Product",
    description: "Discuss Q2 priorities and make sure everyone is aligned.",
  },
  {
    title: "Cross-team roadmap sync",
    daysAgo: 18,
    hour: 11,
    durationMinutes: 60,
    attendees: [...PMS, "Head of Eng", "Jules Beaumont"],
    organizer: "Marco Alvarez",
    description: "Walk through each team's roadmap for the next quarter.",
  },

  // ── REPLACE: broadcast (info one-way) ──
  {
    title: "Launch retro readout",
    daysAgo: 22,
    hour: 15,
    durationMinutes: 60,
    attendees: [...PMS.slice(0, 7), ...ENG, "Kira Yamato"],
    organizer: "Diane Okafor",
    description:
      "Diane will walk through what we learned from the v3 launch. Q&A at the end if time.",
    recurring: false,
  },
  {
    title: "All-hands prep walk-through",
    daysAgo: 14,
    hour: 16,
    durationMinutes: 45,
    attendees: [...PMS.slice(0, 6), ...EXEC, "Kira Yamato"],
    organizer: "CEO",
    description:
      "Review the final all-hands deck before Friday. Mostly listen — flag any concerns.",
  },

  // ── REPLACE: buy-in theater (decision made, gathering nods) ──
  {
    title: "Pricing strategy alignment",
    daysAgo: 19,
    hour: 13,
    durationMinutes: 60,
    attendees: [...PMS.slice(0, 6), ...EXEC],
    organizer: "VP Product",
    description:
      "We've landed on the new pricing model. Want everyone in the room so we can ship the announcement on Monday.",
  },
  {
    title: "Mobile redesign FYI",
    daysAgo: 11,
    hour: 10,
    durationMinutes: 45,
    attendees: [...PMS.slice(0, 5), ...DESIGN, "Lia Holm"],
    organizer: "Kira Yamato",
    description:
      "Walk the team through the new mobile direction. Decision is made, just want to make sure nobody is surprised.",
  },

  // ── REPLACE: weekly status habit ──
  {
    title: "Weekly product ↔ eng sync",
    daysAgo: 24,
    hour: 11,
    durationMinutes: 45,
    attendees: [...PMS.slice(0, 4), ...ENG],
    organizer: "Marco Alvarez",
    description: "Standing weekly check-in. Updates from both sides.",
    recurring: true,
  },
  {
    title: "Weekly product ↔ eng sync",
    daysAgo: 10,
    hour: 11,
    durationMinutes: 45,
    attendees: [...PMS.slice(0, 4), ...ENG],
    organizer: "Marco Alvarez",
    description: "Standing weekly check-in. Updates from both sides.",
    recurring: true,
  },

  // ── FIX: legitimate work, under-specified ──
  {
    title: "PRD review: notifications v2",
    daysAgo: 21,
    hour: 14,
    durationMinutes: 60,
    attendees: [
      "Priya Shah",
      "Ravi Kumar",
      "Kira Yamato",
      "Jin Park",
      "Lia Holm",
    ],
    organizer: "Priya Shah",
    description: "Review the notifications v2 PRD. Feedback welcome.",
  },
  {
    title: "Customer feedback readout",
    daysAgo: 17,
    hour: 13,
    durationMinutes: 45,
    attendees: [...PMS.slice(0, 5), "Kira Yamato"],
    organizer: "Sara Lin",
    description: "Share the latest themes from customer interviews.",
    recurring: true,
  },
  {
    title: "Sprint planning",
    daysAgo: 14,
    hour: 10,
    durationMinutes: 90,
    attendees: [
      "Marco Alvarez",
      "Ravi Kumar",
      "Lia Holm",
      "Sam Ortiz",
      "Noor Hassan",
      "Jin Park",
      "Maya Chen",
    ],
    organizer: "Marco Alvarez",
    description: "Plan the next sprint.",
    recurring: true,
  },
  {
    title: "Roadmap prioritization",
    daysAgo: 9,
    hour: 15,
    durationMinutes: 60,
    attendees: ["Priya Shah", "Marco Alvarez", "Diane Okafor", "Jin Park"],
    organizer: "Priya Shah",
    description: "Sort the backlog for the next two months.",
  },
  {
    title: "1:1 Marco / Priya",
    daysAgo: 7,
    hour: 16,
    durationMinutes: 30,
    attendees: ["Marco Alvarez", "Priya Shah"],
    organizer: "Priya Shah",
    description: "",
    recurring: true,
  },
  {
    title: "Stakeholder update prep",
    daysAgo: 5,
    hour: 14,
    durationMinutes: 45,
    attendees: [
      "Priya Shah",
      "Diane Okafor",
      "Marco Alvarez",
      "VP Product",
      "Sara Lin",
    ],
    organizer: "Diane Okafor",
    description: "Prep for Friday's stakeholder update.",
  },
  {
    title: "Pricing experiment debrief",
    daysAgo: 12,
    hour: 11,
    durationMinutes: 45,
    attendees: [
      "Tomás Riveiro",
      "Maya Chen",
      "Elena Petrova",
      "Devon Wright",
      "Aiden Kapoor",
      "Lia Holm",
    ],
    organizer: "Tomás Riveiro",
    description: "Discuss results of last month's pricing test.",
  },
  {
    title: "Biweekly retro",
    daysAgo: 8,
    hour: 16,
    durationMinutes: 60,
    attendees: [...PMS.slice(0, 6), ...ENG.slice(0, 2)],
    organizer: "Diane Okafor",
    description: "What went well, what didn't.",
    recurring: true,
  },

  // ── KEEP: clear decision, small group ──
  {
    title: "Decide: tier-2 region launch order",
    daysAgo: 23,
    hour: 10,
    durationMinutes: 30,
    attendees: ["Priya Shah", "VP Product", "Head of Eng"],
    organizer: "Priya Shah",
    description:
      "Decide which two tier-2 regions go first in the rollout. Options doc attached. Need a final call before EOD so legal can start contracts.",
  },
  {
    title: "Approve final pricing for SMB tier",
    daysAgo: 16,
    hour: 11,
    durationMinutes: 30,
    attendees: ["VP Product", "Marco Alvarez", "CEO"],
    organizer: "Marco Alvarez",
    description:
      "Approve the SMB pricing recommendation in the attached memo so we can publish Monday.",
  },
  {
    title: "1:1 Priya / VP Product",
    daysAgo: 21,
    hour: 9,
    durationMinutes: 30,
    attendees: ["Priya Shah", "VP Product"],
    organizer: "VP Product",
    description: "Career + current quarter.",
    recurring: true,
  },
  {
    title: "1:1 Marco / Diane",
    daysAgo: 4,
    hour: 9,
    durationMinutes: 30,
    attendees: ["Marco Alvarez", "Diane Okafor"],
    organizer: "Diane Okafor",
    description: "Weekly 1:1.",
    recurring: true,
  },
  {
    title: "1:1 Jin / Marco",
    daysAgo: 2,
    hour: 9,
    durationMinutes: 30,
    attendees: ["Jin Park", "Marco Alvarez"],
    organizer: "Marco Alvarez",
    description: "Weekly 1:1.",
    recurring: true,
  },
  {
    title: "Resolve: notification frequency cap",
    daysAgo: 6,
    hour: 14,
    durationMinutes: 30,
    attendees: ["Priya Shah", "Ravi Kumar", "Kira Yamato", "Sara Lin"],
    organizer: "Priya Shah",
    description:
      "Pick a daily cap for push notifications. Three options in the doc. We exit with one number we ship next week.",
  },
  {
    title: "Sign off: Q2 launch readiness checklist",
    daysAgo: 3,
    hour: 11,
    durationMinutes: 30,
    attendees: ["Diane Okafor", "Head of Eng", "VP Product", "Lia Holm"],
    organizer: "Diane Okafor",
    description:
      "Walk the readiness checklist line-by-line. Each owner says go / no-go. Exit with a single ship/hold call.",
  },
  {
    title: "Customer interview: Acme Corp",
    daysAgo: 15,
    hour: 13,
    durationMinutes: 45,
    attendees: ["Sara Lin", "Maya Chen", "Kira Yamato"],
    organizer: "Sara Lin",
    description:
      "Interview Acme's head of ops about onboarding pain. Notes will go to the research repo.",
  },
  {
    title: "Decide: deprecate v1 API timeline",
    daysAgo: 1,
    hour: 15,
    durationMinutes: 30,
    attendees: ["Marco Alvarez", "Head of Eng", "Ravi Kumar"],
    organizer: "Marco Alvarez",
    description:
      "Pick the v1 API sunset date. Customer impact memo + migration plan in the doc. Exit with a date.",
  },
  {
    title: "Kickoff: experimentation platform v2",
    daysAgo: 0,
    hour: 10,
    durationMinutes: 45,
    attendees: ["Tomás Riveiro", "Lia Holm", "Sam Ortiz", "Maya Chen"],
    organizer: "Tomás Riveiro",
    description:
      "Project kickoff. Charter doc attached — cover scope, owners, milestones, and the first decision we owe by end of week.",
  },
];

export const SAMPLE_HISTORY: CalendarEvent[] = SEEDS.map((s, i) =>
  buildEvent(s, i),
);

export const SAMPLE_TEAM_NAME = "Helix · Product team";
