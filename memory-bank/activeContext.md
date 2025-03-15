# Active Context - PlanetByte Design Changes

## Current Work Focus
- Implementing infrastructure migration from Vercel/DigitalOcean to Hetzner Server with Coolify
- Refocusing on MVP development with prioritized core features
- Creating developer art system for placeholder visuals
- Converting ASCII diagrams to mermaid flowcharts for better documentation

## Recent Changes
1. Updated infrastructure approach to use containerization on a single Hetzner server
2. Reprioritized development tasks to focus on core MVP features
3. Designed developer art strategy using simple shapes and colors
4. Updated documentation standards to use mermaid flowcharts
5. Updated .clinerules with new documentation standards

## Next Steps
- Set up Hetzner server with Docker and Coolify
- Implement containerization for all components
- Self-host Supabase on Hetzner
- Create developer art system for entities and tiles
- Implement core MVP features based on new priorities

## Key Decisions

### Infrastructure Migration
Moving from distributed managed services (Vercel, DigitalOcean, hosted Supabase) to a consolidated approach:
- Single Hetzner server running all components
- Docker containers for isolation and management
- Coolify for container orchestration
- Self-hosted Supabase for authentication, database, and storage
- Nginx reverse proxy for routing

### MVP Prioritization Framework
```mermaid
flowchart TD
    A[All Tasks] --> B{Essential for MVP?}
    B -->|Yes| C[Implement Now]
    B -->|No| D{Easy to implement\nor necessary for\ncore functionality?}
    D -->|Yes| C
    D -->|No| E[Defer to Future]
    
    C --> F[MVP Release]
    E --> G[Post-MVP Roadmap]
```

### Developer Art Implementation
Creating a placeholder art system that can be easily replaced later:
- Simple geometric shapes for entities
- Color-coding for factions and item types
- Grid-based tiles with color differentiation
- Consistent naming conventions for future replacement

### Documentation Standards
- All diagrams now use mermaid flowchart syntax
- Consistent styling across documentation
- Better visualization of system relationships
- Improved readability and maintainability

## Open Questions
- What are the specific hardware requirements for the Hetzner server?
- How will the containerization affect development workflow?
- What is the timeline for implementing these changes?
- How will the developer art system integrate with the existing codebase?

## Blockers
- Need to determine optimal Hetzner server specifications
- Docker expertise required for proper containerization
- Self-hosting Supabase requires additional configuration