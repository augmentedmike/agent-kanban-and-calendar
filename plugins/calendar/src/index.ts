// Calendar Plugin — public type surface

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  allDay?: boolean;
}

// ---------------------------------------------------------------------------
// Interpretability types
// ---------------------------------------------------------------------------

/** A single factor that influenced the agent's scheduling decision. */
export interface InfluenceFactor {
  /** Human-readable label, e.g. "Focus block at 10am" */
  label: string;
  /** Relative influence in range 0.0–1.0 */
  weight: number;
  /** Whether this factor pushed toward or against the proposal */
  direction: 'positive' | 'negative';
}

/** Interpretability payload attached to every SteeringProposal. */
export interface SteeringInterpretability {
  /** Agent confidence in this proposal, 0.0–1.0 */
  confidence: number;
  /** Influence factors ordered by weight descending */
  factors: InfluenceFactor[];
  /** Up to 3 alternative events the agent considered */
  alternativesConsidered: CalendarEvent[];
  /** Scheduling constraints that were satisfied by this proposal */
  constraintsSatisfied: string[];
  /** Scheduling constraints that could not be satisfied */
  constraintsViolated: string[];
}

// ---------------------------------------------------------------------------
// Steering proposal
// ---------------------------------------------------------------------------

export type ProposalType = 'schedule' | 'reschedule' | 'cancel' | 'conflict';

export interface SteeringProposal {
  id: string;
  type: ProposalType;
  event: CalendarEvent;
  /** Plain-English explanation of why the agent is making this proposal */
  reason: string;
  /** Interpretability data — present on every proposal */
  interpretability?: SteeringInterpretability;
}

// ---------------------------------------------------------------------------
// Steering feedback (human → agent)
// ---------------------------------------------------------------------------

/** Sent to `/api/steering/feedback` after human acts on a SteeringProposal. */
export interface SteeringFeedback {
  proposalId: string;
  decision: 'approved' | 'modified' | 'rejected';
  /** Populated when decision === 'modified'; contains the human-edited event */
  modifiedEvent?: CalendarEvent;
  /** Populated when decision === 'rejected'; human's optional reason */
  rejectionReason?: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Plugin method stubs
// ---------------------------------------------------------------------------

/** Submit a scheduling proposal to the steering panel for human review. */
export async function proposeSchedule(proposal: SteeringProposal): Promise<void> {
  // Implementation provided by the host application via plugin.json endpoint
  void proposal;
}
