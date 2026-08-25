from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SOURCE_ICON = ICON_DIR / "source-chatgpt-chain.png"
SIZES = (16, 32, 48, 128)
LINK_BLUE = (9, 105, 218)


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
    content = tint_artwork(crop_to_content(remove_white_background(source)))
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
