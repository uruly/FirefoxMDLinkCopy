from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SIZES = (16, 32, 48, 128)
GRAY = "#5f6368"


def draw_icon(size):
    canvas_size = 512
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    stroke_width = 58
    radius = 72

    draw.rounded_rectangle(
        (74, 174, 314, 338),
        radius=radius,
        outline=GRAY,
        width=stroke_width,
    )
    draw.rounded_rectangle(
        (198, 174, 438, 338),
        radius=radius,
        outline=GRAY,
        width=stroke_width,
    )

    rotated = image.rotate(-35, resample=Image.Resampling.BICUBIC)
    return rotated.resize((size, size), Image.Resampling.LANCZOS)


def main():
    ICON_DIR.mkdir(exist_ok=True)

    for size in SIZES:
        draw_icon(size).save(ICON_DIR / f"chain-{size}.png")


if __name__ == "__main__":
    main()
