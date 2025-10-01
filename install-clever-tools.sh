#!/bin/bash

# Installation de clever-tools pour Ubuntu/WSL
# Documentation: https://github.com/CleverCloud/clever-tools

echo "🔧 Installation de clever-tools..."

# Méthode 1: Via npm (recommandée)
if command -v npm &> /dev/null; then
    echo "Installation via npm..."
    npm install -g clever-tools
    
    if command -v clever &> /dev/null; then
        echo "✅ clever-tools installé avec succès via npm"
        clever version
        exit 0
    fi
fi

# Méthode 2: Via curl (alternative)
if command -v curl &> /dev/null; then
    echo "Installation via curl..."
    curl -O https://clever-tools.cellar.services.clever-cloud.com/releases/latest/clever-tools-latest_linux.tar.gz
    tar xvzf clever-tools-latest_linux.tar.gz
    sudo mv clever-tools-latest_linux/clever /usr/local/bin/
    rm -rf clever-tools-latest_linux*
    
    if command -v clever &> /dev/null; then
        echo "✅ clever-tools installé avec succès via curl"
        clever version
        exit 0
    fi
fi

echo "❌ Impossible d'installer clever-tools automatiquement"
echo "Installez manuellement avec:"
echo "  npm install -g clever-tools"
echo "ou visitez: https://github.com/CleverCloud/clever-tools"
