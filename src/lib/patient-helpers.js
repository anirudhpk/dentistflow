export const lifecycleStages = [
  "New patient",
  "Diagnosis shared",
  "Treatment ongoing",
  "Post procedure",
  "Recovery",
  "Recall due",
];

const followUpRules = {
  "New patient": {
    days: 7,
    note: "Call to confirm consultation findings and proposed treatment plan.",
  },
  "Diagnosis shared": {
    days: 3,
    note: "Follow up on diagnosis discussion and treatment acceptance.",
  },
  "Treatment ongoing": {
    days: 14,
    note: "Check treatment progress and confirm the next chairside session.",
  },
  "Post procedure": {
    days: 2,
    note: "Assess comfort, swelling, pain level, and post-procedure recovery.",
  },
  Recovery: {
    days: 7,
    note: "Review healing progress and reinforce care instructions.",
  },
  "Recall due": {
    days: 180,
    note: "Schedule preventive cleaning, hygiene review, or long-term recall.",
  },
};

export function getFollowUpSuggestion(stage) {
  const rule = followUpRules[stage] || followUpRules["New patient"];
  const date = new Date();
  date.setDate(date.getDate() + rule.days);

  return {
    nextFollowUpDate: date.toISOString().slice(0, 10),
    followUpNote: rule.note,
  };
}
