from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SIZES = (16, 32, 48, 128)
GRAY = "#5f6368"
LIGHT_GRAY = "#9aa0a6"


def draw_chain(draw, offset_x, offset_y, color, stroke_width):
    radius = 64

    draw.rounded_rectangle(
        (72 + offset_x, 174 + offset_y, 288 + offset_x, 324 + offset_y),
        radius=radius,
        outline=color,
        width=stroke_width,
    )
    draw.rounded_rectangle(
        (188 + offset_x, 174 + offset_y, 404 + offset_x, 324 + offset_y),
        radius=radius,
        outline=color,
        width=stroke_width,
    )


def draw_icon(size):
    canvas_size = 512
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    back_layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    front_layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    draw_chain(ImageDraw.Draw(back_layer), 36, 52, LIGHT_GRAY, 42)
    draw_chain(ImageDraw.Draw(front_layer), 0, 0, GRAY, 56)

    image.alpha_composite(back_layer)
    image.alpha_composite(front_layer)

    rotated = image.rotate(-35, resample=Image.Resampling.BICUBIC)
    return rotated.resize((size, size), Image.Resampling.LANCZOS)


def main():
    ICON_DIR.mkdir(exist_ok=True)

    for size in SIZES:
        draw_icon(size).save(ICON_DIR / f"clipboard-chain-{size}.png")


if __name__ == "__main__":
    main()
