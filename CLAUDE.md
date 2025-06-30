# CLAUDE.md

This file provides guidance when working with the NoahQ.ai website codebase.

## Project Overview

NoahQ.ai is a static website for an AI consultancy business that helps companies implement practical AI solutions. The site showcases services, process, solutions, and contact information for the global AI consulting team.

## 🚨 CRITICAL INSTRUCTIONS - ALWAYS START WITH THIS 🚨

**FOR EVERY TASK, YOU MUST:**
> "Ultrathink your way through this. Use parallel agents to investigate these issues. Then come up with a plan to solve them."

- **ALWAYS** use deep analysis before taking any action
- **ALWAYS** launch multiple parallel agents for thorough research
- **ALWAYS** create comprehensive plans before implementation
- **NEVER** skip the investigation phase
- **ALWAYS** use TodoWrite to track all tasks and show progress
- **ALWAYS** use one Opus4 agent as orchestra and at least three sonnet4 agents as sub agent agents

## Project Structure

```
noahq-website/
├── index.html              # Main landing page
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet with CSS custom properties
│   ├── images/            # Company and technology logos
│   │   ├── claude-logo.svg
│   │   ├── elevenlabs-logo.svg
│   │   ├── make-logo.svg
│   │   ├── n8n-logo.svg
│   │   └── openai-logo.svg
│   └── js/
│       └── main.js        # Interactive features and animations
├── CLAUDE.md              # This file (project guidelines)
```

[Rest of the file remains unchanged]