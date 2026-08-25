from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SOURCE_ICON = ICON_DIR / "source-chatgpt-chain.png"
SIZES = (16, 32, 48, 128)
LINK_BLUE = (0, 76, 170)


def remove_white_background(image):
    image = image.convert("RGBA")
    pixels = image.load()

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            brightness = (red + green + blue) / 3

            if brightness > 238:
                pixels[x, y] = (red, green, blue, 0)
            elif brightness > 218:
                fade = int(alpha * (238 - brightness) / 20)
                pixels[x, y] = (red, green, blue, fade)

    return image


def crop_to_content(image):
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()

    if not bbox:
        return image

    return image.crop(bbox)


def thicken_shadow(image):
    shadow_mask = Image.new("L", image.size, 0)
    source_pixels = image.load()
    mask_pixels = shadow_mask.load()

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = source_pixels[x, y]

            if alpha == 0:
                continue

            brightness = (red + green + blue) / 3

            if brightness > 150:
                mask_pixels[x, y] = min(210, round(alpha * 1.25))

    expanded_mask = shadow_mask.filter(ImageFilter.MaxFilter(15))
    original_alpha = image.getchannel("A")
    extra_mask = ImageChops.lighter(shadow_mask, expanded_mask)

    shadow_layer = Image.new("RGBA", image.size, (155, 160, 165, 0))
    shadow_layer.putalpha(extra_mask)

    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.alpha_composite(shadow_layer)
    result.alpha_composite(image)
    result.putalpha(ImageChops.lighter(result.getchannel("A"), original_alpha))
    return result


def tint_artwork(image):
    image = image.copy()
    pixels = image.load()

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]

            if alpha == 0:
                continue

            shade = min(red, green, blue)
            factor = max(0.52, shade / 255)
            pixels[x, y] = (
                round(LINK_BLUE[0] * factor),
                round(LINK_BLUE[1] * factor),
                round(LINK_BLUE[2] * factor),
                alpha,
            )

    return image


def make_icon(source, size):
    content = tint_artwork(crop_to_content(thicken_shadow(remove_white_background(source))))
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    padding = max(1, round(size * 0.04))
    max_side = size - padding * 2
    content.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    x = (size - content.width) // 2
    y = (size - content.height) // 2
    canvas.alpha_composite(content, (x, y))
    return canvas


def main():
    ICON_DIR.mkdir(exist_ok=True)
    source = Image.open(SOURCE_ICON)

    for size in SIZES:
        make_icon(source, size).save(ICON_DIR / f"chatgpt-chain-{size}.png")


if __name__ == "__main__":
    main()
