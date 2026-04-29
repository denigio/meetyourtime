interface ParsedCost {
  perMeeting: number | null;
  monthly: number | null;
  oneOff: boolean;
}

export function parseCost(text: string): ParsedCost {
  const line = text.match(/\*\*Cost:\*\*([^\n]+)/);
  if (!line) return { perMeeting: null, monthly: null, oneOff: false };

  const perMatch = line[1].match(/([\d.]+)\s*person-hours? this meeting/i);
  const monthlyMatch = line[1].match(/([\d.]+)\s*person-hours?\/month/i);
  const oneOff = /one-off|non-recurring/i.test(line[1]);

  return {
    perMeeting: perMatch ? Number(perMatch[1]) : null,
    monthly: monthlyMatch ? Number(monthlyMatch[1]) : null,
    oneOff,
  };
}

export function CostCounter({ text }: { text: string }) {
  const { perMeeting, monthly, oneOff } = parseCost(text);
  if (perMeeting === null) return null;

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-amber-900/40 border-l-4 border-l-amber-500/70 bg-amber-950/10 p-4">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-amber-300/80">
          This meeting
        </div>
        <div className="mt-1 text-2xl font-semibold text-amber-100 tabular-nums">
          {perMeeting}
          <span className="ml-1 text-sm font-normal text-amber-300/60">
            person-hours
          </span>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-amber-300/80">
          If recurring
        </div>
        <div className="mt-1 text-2xl font-semibold text-amber-100 tabular-nums">
          {oneOff || monthly === null ? "—" : monthly}
          {!oneOff && monthly !== null && (
            <span className="ml-1 text-sm font-normal text-amber-300/60">
              person-hours/month
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
