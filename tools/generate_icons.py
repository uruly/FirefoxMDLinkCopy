from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SIZES = (16, 32, 48, 128)
BLUE = "#1976d2"
WHITE = "#ffffff"


def rounded_rectangle(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def draw_icon(size):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    scale = size / 128

    rounded_rectangle(draw, (0, 0, size, size), int(24 * scale), BLUE)

    box = (
        int(18 * scale),
        int(38 * scale),
        int(110 * scale),
        int(90 * scale),
    )
    rounded_rectangle(draw, box, int(10 * scale), WHITE)

    inner = (
        int(28 * scale),
        int(50 * scale),
        int(100 * scale),
        int(78 * scale),
    )
    rounded_rectangle(draw, inner, int(2 * scale), BLUE)

    if size >= 32:
        font = ImageFont.load_default()
        text = "MD"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        draw.text(
            ((size - text_width) / 2, (size - text_height) / 2 - scale),
            text,
            fill=WHITE,
            font=font,
        )

    return image


def main():
    ICON_DIR.mkdir(exist_ok=True)

    for size in SIZES:
      draw_icon(size).save(ICON_DIR / f"icon-{size}.png")


if __name__ == "__main__":
    main()
