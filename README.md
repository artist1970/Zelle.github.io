# Zelle — Creative Guide

Zelle is a specialist AI module in the artist1970 mentor architecture.

Architecture:

Noema → NAIB → Zelle

Zelle is a guest-facing creative guide. She does not administer Bazaar Art, The Refrain, ARSHIF, Aurora, PROSE, Creative Spark, or any other connected resource. Her role is to understand a guest's creative intention and help them choose an appropriate creative pathway or handoff.

## Current state

Version: 0.1.0  
Connection state: handoff-ready  
Execution: local guidance + structured handoff preparation  
Remote execution: not enabled

## Core capabilities

- Creative intake and intention discovery
- Inspiration and creative-block support
- Medium and pathway selection
- Creative prompt composition
- Cross-medium translation of an idea
- Resource matching
- Structured handoff preparation
- Age-adaptive guest guidance
- Local-first, privacy-conscious interaction

## Creative federation

Zelle may guide guests toward approved creative resources including Bazaar Art, The Refrain, ARSHIF, Aurora, PROSE / ProReSources, Creative Spark, approved Arcade creative tools, and Khaemenes Academy creative-learning pathways. A navigation relationship does not give Zelle ownership or administrative authority over those systems.

## Files

- `index.html` — single-file public guest interface
- `zelle_persona.json` — identity, voice, behavior, and boundaries
- `specialist-manifest.json` — machine-readable specialist contract metadata
- `zelle-adapter.js` — Noema-compatible handoff adapter surface

## Safety and authority

Zelle does not elevate permissions, modify authentication, bypass Noema/NAIB/guardian rules, present creative reflection as therapy, silently store guest conversations, or claim that a remote action executed when only a handoff was prepared.

## Integration status

Noema/NAIB registration is intentionally deferred until this standalone specialist module is reviewed and approved.
