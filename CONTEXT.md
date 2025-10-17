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

---

## CURRENT PROJECT STATUS (RNA-seq Platform)

### Project Overview
A professional RNA-seq analysis platform with both demo and live discovery modes, deployed on Vercel (frontend) and Render (backend).

### Architecture
- **Frontend**: React + TypeScript + Material-UI (web-new/)
- **Backend**: FastAPI + Python (api/)
- **Deployment**: Vercel (frontend), Render (backend)
- **Data Sources**: Demo data (PRJNA397172), Live ENA discovery

### Current Status (as of last session)
**✅ COMPLETED:**
- Full demo mode with PRJNA397172 data working
- PCA visualization (Expression page) - fixed Plotly errors
- GSEA analysis with pathway enrichment table
- Live discovery mode implementation
- ENA API integration (currently working but finding 0 pancreas samples)

**🔧 CURRENT ISSUE:**
- ENA API is working (no more 500 errors) but finding 0 pancreas-related samples
- This is likely because:
  1. Very few new pancreas RNA-seq studies published in last 7 days
  2. Search query might need refinement
  3. Pancreas samples might be labeled differently in ENA

**📁 KEY FILES:**
- `api/app/live_discovery.py` - ENA discovery service
- `api/app/main.py` - API endpoints including `/discovery/trigger`
- `web-new/src/components/LiveDiscoveryStatus.tsx` - Live mode UI
- `web-new/src/pages/GSEA.tsx` - Pathway analysis page

**🎯 IMMEDIATE NEXT STEPS:**
1. **Debug ENA search** - Check why 0 pancreas samples found
2. **Expand search criteria** - Maybe search longer time period or different keywords
3. **Add fallback data** - Generate some mock pancreas samples if ENA is empty
4. **Test live mode** - Ensure live discovery works end-to-end

**🔍 TECHNICAL DETAILS:**
- ENA API URL: `https://www.ebi.ac.uk/ena/portal/api/search`
- Current query: `tax_eq(9606) AND library_strategy="RNA-Seq" AND first_public>=2025-10-10`
- Search keywords: ['pancreas', 'pancreatic', 'islet', 'beta cell']
- Backend logs show: "ENA returned 50 total samples" but "Found 0 pancreas-related samples"

**🚀 DEPLOYMENT STATUS:**
- Frontend: Deployed on Vercel, working
- Backend: Deployed on Render, working
- Live discovery: Running but not finding pancreas samples

**💡 SUGGESTED DEBUGGING:**
1. Check ENA response format - maybe samples are labeled differently
2. Try broader search terms or longer time period
3. Add more pancreas-related keywords
4. Consider searching for diabetes/insulin studies that might include pancreas
5. Add debug logging to see what sample titles are actually returned

**📊 PLATFORM FEATURES WORKING:**
- Demo mode with 2 samples (SRR5896247, SRR5896248)
- PCA plots, GSEA analysis, QC metrics
- Mode switching between Demo/Live
- Professional UI with Material-UI theming
- Real-time discovery status panel

**🎨 UI COMPONENTS:**
- AnalysisLayout with mode switching
- LiveDiscoveryStatus with trigger button
- GSEATable with color-coded results
- PCAPlot with Plotly integration
- DataModeSelector with enhanced Live mode styling
