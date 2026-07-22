import os
from PIL import Image

public_dir = r"g:\Vibe coding\IG website V2\public"

image_files = [
    "mascot-clock.png",
    "mascot-footer.png",
    "mascot-how-it-works.png",
    "mascot-timeline.png",
    "world-map.png",
    "mascot-chat.png",
    "mascot-cta.png",
    "mascot-hero.png",
    "mascot.png",
    "logo.png"
]

print("Starting Image Optimization...")

for filename in image_files:
    filepath = os.path.join(public_dir, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename} (not found)")
        continue
    
    orig_size = os.path.getsize(filepath)
    with Image.open(filepath) as img:
        # Resize if dimensions are larger than max_size
        max_dim = 800
        w, h = img.size
        if w > max_dim or h > max_dim:
            if w > h:
                new_w = max_dim
                new_h = int(h * (max_dim / w))
            else:
                new_h = max_dim
                new_w = int(w * (max_dim / h))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Save optimized PNG
        img.save(filepath, format="PNG", optimize=True)
        new_png_size = os.path.getsize(filepath)
        
        # Save WebP version
        webp_filename = os.path.splitext(filename)[0] + ".webp"
        webp_filepath = os.path.join(public_dir, webp_filename)
        img.save(webp_filepath, format="WEBP", quality=82, optimize=True)
        webp_size = os.path.getsize(webp_filepath)
        
        print(f"Optimized {filename}: Orig={orig_size//1024}KB -> PNG={new_png_size//1024}KB -> WEBP={webp_size//1024}KB")

print("Image Optimization Complete!")
