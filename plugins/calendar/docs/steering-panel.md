# Steering Panel — Component Spec

## Overview

The `steering-panel` component renders pending `SteeringProposal` objects as
actionable cards. Humans approve, modify, or reject each proposal before the
agent writes anything to the calendar.

---

## Proposal Card Layout

Each card renders in this top-to-bottom order:

1. **Action badge** — coloured pill at the top-left indicating proposal type.
2. **Event summary** — plain-English title, formatted date/time, and location.
3. **Agent reason** — single sentence from `proposal.reason`.
4. **Interpretability block** — collapsible section (see §Confidence Tiers).
5. **Action row** — three buttons: `Approve`, `Modify`, `Reject`.

### Action Badge Colors

| Proposal type | Color  | Token example     |
|---------------|--------|-------------------|
| `schedule`    | Blue   | `badge-blue`      |
| `reschedule`  | Amber  | `badge-amber`     |
| `cancel`      | Red    | `badge-red`       |
| `conflict`    | Purple | `badge-purple`    |

### Event Summary Format

Display human-readable values — never raw ISO strings:

- **Title** — `proposal.event.title`
- **Time** — formatted in the user's local timezone, e.g. "Thu Apr 3, 10:00–11:00 AM"
- **Location** — `proposal.event.location` (omit row if absent)

### Agent Reason

Render `proposal.reason` verbatim as a single paragraph.

---

## Interpretability Block

The collapsible block reveals `proposal.interpretability` details:

- **Confidence score** — numeric and visual indicator (see §Confidence Tiers).
- **Influence factors** — listed by weight descending; each row shows label,
  direction arrow (↑ positive / ↓ negative), and weight bar.
- **Alternatives considered** — up to 3 `CalendarEvent` summaries (title + time).
- **Constraints satisfied** — green-check list of `constraintsSatisfied` strings.
- **Constraints violated** — red-cross list of `constraintsViolated` strings.

---

## Confidence Tiers

| Confidence range | Color  | Behavior                                                                 |
|------------------|--------|--------------------------------------------------------------------------|
| ≥ 0.85           | Green  | Normal flow; interpretability block collapsed by default.                |
| 0.60 – 0.84      | Amber  | Warning indicator shown; top-2 influence factors visible without expand. |
| < 0.60           | Red    | Interpretability block auto-expanded; explicit approval required.        |

"Explicit approval required" means the `Approve` button is disabled until the
human has scrolled through the interpretability block (implementation detail:
block must be expanded/visible).

---

## Approval Flow

```
Agent
  │
  └─► SteeringProposal emitted
          │
          └─► steering-panel renders card
                    │
          ┌─────────┼──────────┐
          │         │          │
        Approve   Modify    Reject
          │         │          │
          │    event-form   reason prompt
          │    pre-filled   (optional)
          │         │          │
          └────┬────┘          │
               │               │
        SteeringFeedback ◄─────┘
               │
               └─► POST /api/steering/feedback
```

The `SteeringFeedback` object posted to `/api/steering/feedback`:

```ts
{
  proposalId: string;
  decision: 'approved' | 'modified' | 'rejected';
  modifiedEvent?: CalendarEvent;   // present when decision === 'modified'
  rejectionReason?: string;        // present when decision === 'rejected'
  timestamp: Date;
}
```

---

## Modify Path

1. Human clicks `Modify`.
2. The `event-form` component opens, pre-filled with `proposal.event` values.
3. Human edits fields and saves.
4. `SteeringFeedback` is constructed:
   - `decision: 'modified'`
   - `modifiedEvent`: the saved event (contains all edited fields)
5. Feedback is posted to `/api/steering/feedback`.
6. The diff between `proposal.event` and `modifiedEvent` is available to the
   agent for future learning (computed by the host application, not this plugin).

---

## Pending Proposals Queue

- Proposals are queued in **FIFO order** by arrival time.
- **`conflict`-type proposals are promoted to the top** of the queue regardless
  of arrival order (highest urgency).
- Within the same type priority, FIFO ordering is preserved.
- The `steering-panel` tab displays a **count badge** showing the number of
  pending proposals (e.g. `Pending Proposals ③`).
- The badge is hidden when the queue is empty.

---

## Keyboard Shortcuts

These shortcuts are active when the `steering-panel` has focus:

| Key | Action  |
|-----|---------|
| `A` | Approve the currently focused proposal |
| `R` | Reject the currently focused proposal  |
| `M` | Open `Modify` for the focused proposal |

Focus is indicated by a visible outline on the active proposal card.
Tab navigation moves focus between cards in queue order.
