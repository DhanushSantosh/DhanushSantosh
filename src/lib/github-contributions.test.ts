import { describe, expect, it } from "vitest";

import { parseContributionHeadlineCount, parseContributionWeeks } from "./github-contributions";

describe("GitHub contribution HTML parsing", () => {
  it("parses comma-separated contribution totals", () => {
    expect(parseContributionHeadlineCount('<h2 class="f4 text-normal mb-2"> 1,234 contributions </h2>')).toBe(1234);
    expect(parseContributionHeadlineCount("<main>No summary</main>")).toBeNull();
  });

  it("groups, sorts, and normalizes contribution cells", () => {
    const html = `
      <tool-tip for="day-b">2 contributions on June 2</tool-tip>
      <tool-tip for="day-a">No contributions on June 1</tool-tip>
      <td data-date="2026-06-02" data-ix="0" data-level="2" id="day-b" class="ContributionCalendar-day"></td>
      <td data-date="2026-06-01" data-ix="0" data-level="0" id="day-a" class="ContributionCalendar-day"></td>
      <td data-date="2026-06-08" data-ix="1" data-level="4" id="day-c" class="ContributionCalendar-day"></td>
      <tool-tip for="day-c">12 contributions on June 8</tool-tip>
    `;

    const weeks = parseContributionWeeks(html);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]?.firstDay).toBe("2026-06-01");
    expect(weeks[0]?.contributionDays.map((day) => day.contributionCount)).toEqual([0, 2]);
    expect(weeks[0]?.contributionDays[1]?.contributionLevel).toBe("SECOND_QUARTILE");
    expect(weeks[1]?.contributionDays[0]).toMatchObject({
      contributionCount: 12,
      contributionLevel: "FOURTH_QUARTILE",
      date: "2026-06-08",
      weekday: 1,
    });
  });

  it("ignores malformed calendar cells", () => {
    expect(parseContributionWeeks('<td class="ContributionCalendar-day"></td>')).toEqual([]);
  });
});
