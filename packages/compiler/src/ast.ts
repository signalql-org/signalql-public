export type TimeWindow =
  | { kind: "last_days"; days: number }
  | { kind: "between"; start: string; end: string };

export type Predicate = {
  field: string[];
  value: string;
};

export type Query =
  | {
      kind: "count";
      target: "events" | "users";
      distinct: boolean;
      source: string;
      where: Predicate[];
      during: TimeWindow;
      groupBy: "day" | null;
    }
  | {
      kind: "funnel";
      source: string;
      steps: string[];
      during: TimeWindow;
    };
