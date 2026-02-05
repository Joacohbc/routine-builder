import json
import os

# Extracted from:
# https://fonts.google.com/metadata/icons

def extract_icon_names(input_path, output_path):
    print(f"Reading {input_path}...")
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Remove common non-JSON prefixes found in some Google font/icon responses
            if content.startswith(")]}'"):
                content = content[4:].strip()
            
            data = json.loads(content)
            
            if 'icons' not in data:
                print("Error: 'icons' key not found in JSON.")
                return

            # Extract names and deduplicate
            names = sorted(list(set(icon['name'] for icon in data['icons'])))
            
            print(f"Extracted {len(names)} unique icon names.")
            
            # Save to output file
            with open(output_path, 'w', encoding='utf-8') as out_f:
                json.dump(names, out_f, indent=2)
            
            print(f"Saved to {output_path}")
            
            # Show size comparison
            in_size = os.path.getsize(input_path) / 1024
            out_size = os.path.getsize(output_path) / 1024
            print(f"Size reduced from {in_size:.2f}KB to {out_size:.2f}KB ({(1 - out_size/in_size)*100:.1f}% reduction)")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Using the root icons.json as source
    input_file = 'icons.json'
    # Saving to public for easy access or use during build
    output_file = 'public/icon_names.json'
    
    extract_icon_names(input_file, output_file)
