# Context Preservation Guide

## How to Use This Progress Tracking System

This system helps maintain context between different Cursor chat sessions when you run out of tokens.

### Files Created
1. **PROGRESS.md** - Main progress tracking file with current status
2. **update_progress.py** - Script to easily update progress from command line
3. **CONTEXT.md** - This guide (how to use the system)

### Quick Commands

```bash
# Mark work as completed
python update_progress.py completed "Implemented user authentication"

# Update current focus
python update_progress.py current "Working on data visualization improvements"

# Add next step
python update_progress.py next "Integrate new plotting library"

# Log an issue
python update_progress.py issue "API rate limiting causing timeouts"
```

### Manual Updates
You can also directly edit `PROGRESS.md` to:
- Update the "Current Focus" section
- Add completed work to "Recent Work Completed"
- Modify "Next Steps" as priorities change
- Update "Issues & Blockers" as they arise

### Starting a New Chat Session
When starting a new Cursor chat, simply:
1. Read `PROGRESS.md` to understand current status
2. Continue from where you left off
3. Update progress as you work

### Best Practices
- Update progress frequently (every major task completion)
- Be specific in your progress descriptions
- Include technical details that will help in future sessions
- Note any important decisions or discoveries
- Keep the "Current Focus" section up-to-date

This system ensures you never lose context and can seamlessly continue development across multiple chat sessions.
