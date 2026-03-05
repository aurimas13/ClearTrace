# ClearTrace Intelligence: Agentic AML Investigation Platform

ClearTrace Intelligence is a proof-of-concept AI architecture designed to accelerate Financial Crime (FinCrime) operations. It bridges the gap between raw transaction data pipelines and human compliance officers by utilizing Large Language Models to orchestrate initial investigations and visualize money movement.

## System Architecture
* Frontend: React, Tailwind CSS, React Flow (for complex node-based network visualizations).
* Backend & Data Storage: Supabase (PostgreSQL) handling structured transaction data and state management.
* AI Orchestration: LLM integration for automated Suspicious Activity Report (SAR) generation and contextual risk scoring.
* Hosting: Vercel (CI/CD pipeline integrated with GitHub Actions).

## Business Impact Hypothesis
* Reduces manual transaction review time via automated, plain-English context summaries.
* Improves false-positive resolution by visualizing multi-hop transaction networks (circular funding, smurfing).
* Maintains a "Human-in-the-Loop" standard for regulatory compliance, acting as an intelligent co-pilot rather than an autonomous decision-maker.