Add placeholder audio assets here before final render polish:

- `cinematic-bed.mp3` for the main score
- `ui-click.wav` for CTA and apply interactions
- `soft-whoosh.wav` for transitions
- `success-chime.wav` for auth + payout confirmations

The current composition ships with cue markers in `src/remotion/copy.ts` and a null placeholder track in `src/remotion/audio-cues.tsx` so audio can be layered in without changing scene timing.
