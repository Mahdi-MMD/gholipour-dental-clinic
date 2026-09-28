"""
Article Agent Script (Google Antigravity SDK Implementation)
Shahid Gholipour Dental Clinic Platform

This script provides an autonomous agent for researching, drafting, and updating dental
article subpages based on scientific sources, conversational Persian tone, SEO topic
clustering (anti-cannibalization), MiniSearch compatibility, and automated Git push.

Requirements:
    pip install google-antigravity

Usage:
    python scripts/article_agent.py "مراقبت‌های لازم پس از جراحی دندان عقل"
"""

import os
import sys
import json
import re
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any, List

# Target workspace paths
WORKSPACE_DIR = Path(__file__).resolve().parent.parent
ARTICLES_DATA_PATH = WORKSPACE_DIR / "src" / "data" / "articlesData.ts"


def load_existing_articles() -> List[Dict[str, Any]]:
    """Parses existing articles from src/data/articlesData.ts."""
    if not ARTICLES_DATA_PATH.exists():
        return []
    
    content = ARTICLES_DATA_PATH.read_text(encoding="utf-8")
    # Extract the JSON-like array inside ARTICLES_DATA
    match = re.search(r"export const ARTICLES_DATA: ArticleItem\[\] = (\[[\s\S]*?\]);\s*$", content)
    if not match:
        return []
    
    raw_array = match.group(1)
    # Convert TypeScript object format to valid JSON
    # Replace single quotes with double quotes, remove trailing commas
    json_compatible = re.sub(r"'([^']*)'", r'"\1"', raw_array)
    json_compatible = re.sub(r",\s*([\]}])", r"\1", json_compatible)
    json_compatible = re.sub(r"(\w+):", r'"\1":', json_compatible)
    
    try:
        return json.loads(json_compatible)
    except Exception:
        # Fallback regex extraction for title and slug
        items = []
        slugs = re.findall(r"slug:\s*'([^']*)'", content)
        titles = re.findall(r"title:\s*'([^']*)'", content)
        for s, t in zip(slugs, titles):
            items.append({"slug": s, "title": t})
        return items


def check_cannibalization(topic: str, existing_articles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Checks if a given topic overlaps substantially with existing articles.
    Returns recommendation: 'UPDATE' existing or 'CREATE' new subpage.
    """
    topic_tokens = set(re.findall(r"\w+", topic.lower()))
    
    best_match = None
    highest_score = 0.0
    
    for art in existing_articles:
        title = art.get("title", "")
        summary = art.get("summary", "")
        keywords = " ".join(art.get("keywords", []))
        art_tokens = set(re.findall(r"\w+", f"{title} {summary} {keywords}".lower()))
        
        if not topic_tokens:
            continue
            
        common = topic_tokens.intersection(art_tokens)
        score = len(common) / len(topic_tokens)
        
        if score > highest_score:
            highest_score = score
            best_match = art

    if highest_score >= 0.6 and best_match:
        return {
            "action": "UPDATE",
            "reason": f"Topic has {highest_score:.0%} overlap with existing article: '{best_match.get('title')}'. Enriched update recommended to avoid SEO cannibalization.",
            "target_slug": best_match.get("slug"),
            "target_title": best_match.get("title"),
        }
    
    return {
        "action": "CREATE",
        "reason": "Topic has distinct search intent. Creating a new dedicated subpage.",
        "highest_overlap": highest_score,
    }


def git_commit_and_push(commit_message: str) -> bool:
    """Stages articles data, routes, and skills, commits, and pushes to origin main."""
    try:
        subprocess.run(["git", "add", "src/data/articlesData.ts", "src/app/articles/", ".agents/skills/article/"], cwd=WORKSPACE_DIR, check=True)
        subprocess.run(["git", "commit", "-m", commit_message], cwd=WORKSPACE_DIR, check=True)
        subprocess.run(["git", "push", "origin", "main"], cwd=WORKSPACE_DIR, check=True)
        print(" Successfully committed and pushed to git.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Git error: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/article_agent.py <topic_or_title>")
        sys.exit(1)
        
    topic = sys.argv[1]
    print(f"\n==================================================")
    print(f"🦷 Shahid Gholipour Dental Clinic - Article Agent")
    print(f"Topic: {topic}")
    print(f"==================================================\n")

    articles = load_existing_articles()
    cannibal_check = check_cannibalization(topic, articles)
    print(f"🔍 Anti-Cannibalization Audit:")
    print(f"Action: {cannibal_check['action']}")
    print(f"Reason: {cannibal_check['reason']}\n")

    print(f"ℹ️ In the Antigravity IDE, this workflow is fully automated via the /article slash command.")
    print(f"Try running in chat: /article {topic}")


if __name__ == "__main__":
    main()
