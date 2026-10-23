import os
from PIL import Image, ImageFilter, ImageEnhance

TARGET_DIRS = [
    'public/images',
    'dist/images',
    'PURI_WEBSITE_READY_TO_UPLOAD/images',
    'website/images',
    'WEBSITE_READY_TO_UPLOAD_ANYWHERE/images'
]

IMAGE_FILES = [
    'bday_kraft_sunflower_rainbow_tulips.jpg',
    'bday_lavender_spikes_lilac_tulips.jpg',
    'bday_magenta_lily_tulip_chic.jpg',
    'bday_noir_wine_gold_lily.jpg',
    'bday_pink_tulip_lily_pearl.jpg',
    'bday_royal_blue_tulip_lily_card.jpg',
    'bday_silent_confession_midnight_blue.jpg',
    'bday_solo_pink_tulip_blush_wrap.jpg',
    'bday_sunflower_pink_lily_fan.jpg',
    'bday_sunflower_topper_gold_bow.jpg',
    'bday_sunshine_card_tulip_lilies.jpg',
    'bday_sunshine_tulips_outdoor.jpg',
    'bday_zenun_card_tulips.jpg'
]

def enhance_image(img_path):
    if not os.path.exists(img_path):
        return
    with Image.open(img_path) as img:
        img = img.convert('RGB')
        w, h = img.size
        orig_w, orig_h = w, h
        
        # Target high resolution: minimum height 1400px or width 1000px
        scale = max(1.0, 1400.0 / h, 1000.0 / w)
        if scale > 1.05:
            new_w = int(round(w * scale))
            new_h = int(round(h * scale))
            # Step 1: Lanczos high-order sinc interpolation
            enhanced = img.resize((new_w, new_h), resample=Image.Resampling.LANCZOS)
        else:
            enhanced = img.copy()

        # Step 2: Unsharp Mask for micro-contrast on petals, velvet, and text
        enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1.6, percent=135, threshold=2))
        
        # Step 3: Gentle sharpness enhancement
        sharpener = ImageEnhance.Sharpness(enhanced)
        enhanced = sharpener.enhance(1.18)
        
        # Step 4: Subtle contrast and color vibrance boost
        contrast = ImageEnhance.Contrast(enhanced)
        enhanced = contrast.enhance(1.04)
        
        color = ImageEnhance.Color(enhanced)
        enhanced = color.enhance(1.05)
        
        # Save back with high quality 94, optimized, progressive
        enhanced.save(img_path, 'JPEG', quality=94, optimize=True, progressive=True)
        print(f"Enhanced: {os.path.basename(img_path)} ({orig_w}x{orig_h} -> {enhanced.width}x{enhanced.height})")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for rel_dir in TARGET_DIRS:
        full_dir = os.path.join(base_dir, rel_dir)
        if not os.path.exists(full_dir):
            continue
        print(f"\nProcessing directory: {rel_dir}")
        for filename in IMAGE_FILES:
            target_path = os.path.join(full_dir, filename)
            enhance_image(target_path)

if __name__ == '__main__':
    main()
