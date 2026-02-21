#!/bin/bash

# Light Theme Conversion Script
# This script converts dark theme classes to light theme across the project

echo "🌓 Converting Dark Theme to Light Theme..."
echo ""

# Define find-replace pairs
declare -A REPLACEMENTS=(
    ["bg-black"]="bg-gray-50"
    ["bg-\[#0a0a0a\]"]="bg-white"
    ["bg-\[#0A0A0A\]"]="bg-white"
    ["bg-\[#050505\]"]="bg-gray-50"
    ["bg-\[#080808\]"]="bg-white"
    ["bg-\[#111111\]"]="bg-white"
    ["bg-\[#111\]"]="bg-white"
    ["bg-\[#0f0f0f\]"]="bg-white"
    ["bg-\[#0a0118\]"]="bg-gradient-to-br from-purple-50 to-white"
    ["bg-zinc-900"]="bg-gray-100"
    ["bg-zinc-900/50"]="bg-gray-100/50"
    ["bg-white/5"]="bg-gray-100"
    ["bg-white/10"]="bg-gray-200"
    ["bg-black/40"]="bg-black/5"
    ["bg-black/50"]="bg-black/10"
    ["bg-black/80"]="bg-black/20"
    ["bg-black/90"]="bg-black/30"
    ["bg-black/95"]="bg-black/40"
    ["bg-black/98"]="bg-black/50"
    ["text-white"]="text-gray-900"
    ["text-white/20"]="text-gray-900/20"
    ["text-white/30"]="text-gray-900/30"
    ["text-white/40"]="text-gray-900/40"
    ["text-white/50"]="text-gray-900/50"
    ["text-white/60"]="text-gray-900/60"
    ["text-white/70"]="text-gray-900/70"
    ["text-slate-500"]="text-gray-500"
    ["text-slate-400"]="text-gray-400"
    ["text-slate-600"]="text-gray-600"
    ["text-zinc-500"]="text-gray-500"
    ["text-zinc-600"]="text-gray-600"
    ["border-white/5"]="border-gray-200"
    ["border-white/10"]="border-gray-300"
    ["border-white/20"]="border-gray-400"
    ["border-white"]="border-gray-300"
)

# Files to process
FILES=(
    "src/app/user/page.tsx"
    "src/app/page.tsx"
    "src/app/login/page.tsx"
    "src/components/CollegeDetail.tsx"
    "src/components/CreateUserModal.tsx"
    "src/components/AddCollegeModal.tsx"
    "src/components/CourseMultiSelect.tsx"
    "src/components/CityManagementClient.tsx"
    "src/components/CollegeManagementClient.tsx"
    "src/components/UserManagementClient.tsx"
    "src/components/FloatingContactButtons.tsx"
)

echo "📝 Processing ${#FILES[@]} files..."
echo ""

# Process each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Processing: $file"
        
        # Apply each replacement
        for find_str in "${!REPLACEMENTS[@]}"; do
            replace_str="${REPLACEMENTS[$find_str]}"
            # Use sed to replace (escape special characters)
            sed -i.bak "s|$find_str|$replace_str|g" "$file" 2>/dev/null
        done
        
        # Remove backup file
        rm -f "$file.bak"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "🎉 Conversion complete!"
echo ""
echo "⚠️  Please review the changes and test thoroughly."
echo "   Some manual adjustments may be needed for optimal appearance."
