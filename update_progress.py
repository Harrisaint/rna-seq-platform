#!/usr/bin/env python3
"""
Progress Update Script for RNA-Seq Platform
Updates PROGRESS.md with current work status and context
"""

import os
import sys
from datetime import datetime
import argparse

def update_progress(section, content, status="in_progress"):
    """Update a specific section in PROGRESS.md"""
    
    progress_file = "PROGRESS.md"
    
    # Read current content
    if os.path.exists(progress_file):
        with open(progress_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    else:
        print(f"Error: {progress_file} not found!")
        return False
    
    # Update timestamp
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Find and update the last updated timestamp
    for i, line in enumerate(lines):
        if line.startswith("**Last Updated:**"):
            lines[i] = f"**Last Updated:** {current_time}\n"
            break
    
    # Update specific sections based on section parameter
    if section == "completed":
        # Add to completed work
        for i, line in enumerate(lines):
            if line.strip() == "## Recent Work Completed":
                # Find the end of the completed section
                j = i + 1
                while j < len(lines) and not lines[j].startswith("##"):
                    j += 1
                
                # Insert new completed item
                new_item = f"- [x] {content}\n"
                lines.insert(j - 1, new_item)
                break
    
    elif section == "current":
        # Update current focus
        for i, line in enumerate(lines):
            if line.strip() == "## Current Focus":
                # Replace the next few lines until next section
                j = i + 1
                while j < len(lines) and not lines[j].startswith("##"):
                    j += 1
                
                # Replace current focus content
                new_content = f"- {content}\n"
                lines[i+1:j] = [new_content]
                break
    
    elif section == "next":
        # Add to next steps
        for i, line in enumerate(lines):
            if line.strip() == "## Next Steps":
                # Find the end of next steps
                j = i + 1
                while j < len(lines) and not lines[j].startswith("##"):
                    j += 1
                
                # Insert new next step
                new_item = f"{j-i}. {content}\n"
                lines.insert(j - 1, new_item)
                break
    
    elif section == "issue":
        # Add to issues
        for i, line in enumerate(lines):
            if line.strip() == "## Issues & Blockers":
                # Find the end of issues section
                j = i + 1
                while j < len(lines) and not lines[j].startswith("##"):
                    j += 1
                
                # Insert new issue
                new_item = f"- {content}\n"
                lines.insert(j - 1, new_item)
                break
    
    # Write updated content back
    with open(progress_file, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"Progress updated: {section} - {content}")
    return True

def main():
    parser = argparse.ArgumentParser(description="Update RNA-Seq Platform Progress")
    parser.add_argument("section", choices=["completed", "current", "next", "issue"], 
                       help="Section to update")
    parser.add_argument("content", help="Content to add/update")
    
    args = parser.parse_args()
    
    success = update_progress(args.section, args.content)
    if success:
        print("Progress file updated successfully!")
    else:
        print("Failed to update progress file.")
        sys.exit(1)

if __name__ == "__main__":
    main()
