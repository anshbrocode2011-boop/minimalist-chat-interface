# Baat frontend redesign

## Goal
Rebuild the complete Baat interface as a refined, mobile-first messaging experience with Lovable-inspired restraint, warmth, and precision.

## Screens and interactions
- Create a polished sign-in and account-creation experience.
- Build the main chat workspace with conversation list, people search, profile, and active conversation views.
- Preserve Baat’s Chat ID-first identity and private, focused positioning.
- Make navigation, search, copy ID, profile access, conversation switching, and message sending interactive with realistic sample data.
- Adapt the layout for both the current phone viewport and desktop screens.

## Visual direction
- Soft near-white canvas, crisp charcoal typography, restrained coral accent, fine neutral borders, and subtle shadows.
- Compact typography, generous whitespace, simple icon controls, and minimal rounded surfaces inspired by Lovable’s product interface.
- Avoid gradients, visual clutter, oversized marketing copy, and decorative effects.
- Use small purposeful transitions with reduced-motion support.

## Technical details
- Implement the experience in the existing TanStack Start home route.
- Define all colors, typography, shadows, and reusable visual roles as semantic design tokens in the global stylesheet.
- Use React state for the interactive frontend demo without changing backend behavior.
- Add route-specific page metadata and retain the existing project routing structure.
- Verify compilation and inspect the live page at mobile and desktop sizes.
