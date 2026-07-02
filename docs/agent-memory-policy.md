# Agent memory policy

This document mirrors the active global Codex agent policy for Hubicx. The canonical project knowledge remains readable Markdown in `memory-vault`; Graphiti is an optional temporal relationship index.

## Memory layers

1. Verified code, Git, database/API and runtime state.
2. Canonical current-state notes: `overview`, `architecture`, `services`, `repository`, `server`, `tasks`.
3. Graphiti temporal graph for entities, relationships, changes and multi-hop retrieval.
4. Archived changelog, decisions, sessions and Graphify code reports.

Graphify and Graphiti are different systems. Graphify describes static code structure. Graphiti describes evolving facts and relationships.

## Ownership

- Project Router decides whether memory is needed.
- `memory-manager` is the only normal writer to canonical memory and Graphiti.
- `architect`, `developer` and `qa-release` use memory read-only and return confirmed facts to `memory-manager`.
- Graphiti is optional. Its absence must never block coding, QA or deployment.

## Conflict handling

When graph and canonical notes disagree, verify code/runtime. Update Markdown first, then add a new time-stamped Graphiti fact that invalidates the old relationship. Never allow an extracted graph fact to overwrite canonical notes automatically.

## Graph write requirements

Every graph episode/fact must include project, timestamp and source. Add commit for code facts and environment for deployment facts. Do not store secrets, `.env` contents, raw logs, personal data or trivial edits.

## Recommended Graphiti entity types

- Project
- Service
- Domain
- Repository
- Module
- DatabaseTable
- Provider
- Model
- Deployment
- Commit
- Decision
- Incident
- Task
- Environment

Useful relations include `DEPENDS_ON`, `SERVED_BY`, `DEPLOYED_TO`, `IMPLEMENTED_IN`, `USES_PROVIDER`, `INTRODUCED_BY`, `FIXED_BY`, `REPLACED`, `AFFECTS` and `VERIFIED_BY`.
