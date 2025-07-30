#!/bin/bash

echo "🚀 Deploying Ordna Game..."
echo ""

# Check if there are changes to commit
if [[ -z $(git status --porcelain) ]]; then
    echo "ℹ️  No changes to deploy"
    exit 0
fi

# Show what will be committed
echo "📝 Changes to deploy:"
git status --short
echo ""

# Get commit message from user
read -p "💬 Enter commit message (or press Enter for default): " commit_msg

# Use default message if none provided
if [[ -z "$commit_msg" ]]; then
    commit_msg="Deploy: $(date +'%Y-%m-%d %H:%M')"
fi

# Add, commit and push
echo "📦 Adding files..."
git add .

echo "💾 Committing changes..."
git commit -m "$commit_msg"

echo "🌐 Pushing to GitHub..."
git push

echo ""
echo "✅ Deploy complete! Check your Netlify site in 1-2 minutes."
echo "🔗 Your repo: https://github.com/fraganar/ordna-game"