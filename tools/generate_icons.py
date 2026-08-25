from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SIZES = (16, 32, 48, 128)
BLUE = "#1976d2"
WHITE = "#ffffff"


def rounded_rectangle(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def draw_icon(size):
    canvas_size = 512
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    rounded_rectangle(draw, (0, 0, canvas_size, canvas_size), 96, BLUE)

    link_layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    link_draw = ImageDraw.Draw(link_layer)
    stroke_width = 42
    radius = 54

    link_draw.rounded_rectangle(
        (92, 190, 304, 322),
        radius=radius,
        outline=WHITE,
        width=stroke_width,
    )
    link_draw.rounded_rectangle(
        (208, 190, 420, 322),
        radius=radius,
        outline=WHITE,
        width=stroke_width,
    )

    # Open the touching sides so the two rounded loops read as chain links.
    link_draw.rectangle((254, 192, 300, 320), fill=(0, 0, 0, 0))
    link_draw.rectangle((212, 192, 258, 320), fill=(0, 0, 0, 0))

    rotated = link_layer.rotate(-35, resample=Image.Resampling.BICUBIC)
    image.alpha_composite(rotated)

    return image.resize((size, size), Image.Resampling.LANCZOS)


def main():
    ICON_DIR.mkdir(exist_ok=True)

    for size in SIZES:
        draw_icon(size).save(ICON_DIR / f"icon-{size}.png")


if __name__ == "__main__":
    main()
