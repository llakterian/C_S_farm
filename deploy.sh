#!/bin/bash

# Quick Deploy Script for C. Sambu Farm Manager
# This script commits all changes and pushes to GitHub, triggering Netlify deployment

echo "🚀 C. Sambu Farm Manager - Quick Deploy"
echo "========================================"
echo ""

# Check if there are changes to commit
if [[ -z $(git status -s) ]]; then
    echo "✅ No changes to commit. Repository is clean."
    echo ""
    echo "Pushing to GitHub to trigger Netlify rebuild..."
    git push origin main
else
    echo "📝 Changes detected. Committing..."
    git add .
    
    # Prompt for commit message or use default
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update: Deploy to Netlify"
    fi
    
    git commit -m "$commit_msg"
    echo ""
    echo "✅ Changes committed!"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔄 Netlify will automatically:"
    echo "   1. Detect the new commit"
    echo "   2. Build the frontend (npm run build)"
    echo "   3. Deploy to your site"
    echo ""
    echo "⏱️  Build typically takes 2-3 minutes"
    echo "🌐 Check your Netlify dashboard for deployment status"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "Please check your internet connection and GitHub credentials"
fi
