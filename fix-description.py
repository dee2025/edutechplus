#!/usr/bin/env python3
import os
import glob

# Find all JS files in app/api
pattern = r'd:\office\articlegrip-next\app\api\**\*.js'
for file in glob.glob(pattern, recursive=True):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'a.description' in content:
        print(f"Found in: {file}")
        # Replace
        new_content = content.replace('a.description, ', '')
        new_content = new_content.replace(', a.description', '')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  Fixed!")

print("Done!")
