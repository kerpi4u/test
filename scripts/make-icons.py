#!/usr/bin/env python3
"""Generate the PWA icon set (192/512) without any third-party dependency.

The icon is a diagonal cyan→violet→pink gradient with a white chevrons mark,
rendered at 3× and box-filtered down for smooth edges.
"""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SUPERSAMPLE = 3

STOPS = [
    (0.0, (0x22, 0xD3, 0xEE)),
    (0.5, (0xA7, 0x8B, 0xFA)),
    (1.0, (0xF4, 0x72, 0xB6)),
]


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def gradient(t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    for i in range(len(STOPS) - 1):
        t0, c0 = STOPS[i]
        t1, c1 = STOPS[i + 1]
        if t <= t1:
            local = (t - t0) / (t1 - t0) if t1 > t0 else 0.0
            return tuple(round(lerp(c0[k], c1[k], local)) for k in range(3))
    return STOPS[-1][1]


def inside_round_rect(x: float, y: float, size: float, radius: float) -> bool:
    if radius <= 0:
        return True
    cx = min(max(x, radius), size - radius)
    cy = min(max(y, radius), size - radius)
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius**2


def make_pixels(size: int) -> list[list[tuple[int, int, int, int]]]:
    big = size * SUPERSAMPLE
    radius = big * 0.24
    pixels = [[(0, 0, 0, 0)] * size for _ in range(size)]

    # Chevron geometry, in supersampled units.
    stroke = big * 0.07
    top, bottom = big * 0.32, big * 0.68
    left_x, right_x = big * 0.42, big * 0.58
    apex_left = big * 0.24
    apex_right = big * 0.76

    def distance_to_segment(px, py, x1, y1, x2, y2):
        dx, dy = x2 - x1, y2 - y1
        length_sq = dx * dx + dy * dy
        t = 0.0 if length_sq == 0 else max(0.0, min(1.0, ((px - x1) * dx + (py - y1) * dy) / length_sq))
        return ((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2) ** 0.5

    for y in range(size):
        for x in range(size):
            red = green = blue = alpha = 0
            for sy in range(SUPERSAMPLE):
                for sx in range(SUPERSAMPLE):
                    px = x * SUPERSAMPLE + sx + 0.5
                    py = y * SUPERSAMPLE + sy + 0.5

                    if not inside_round_rect(px, py, big, radius):
                        continue

                    r, g, b = gradient((px + py) / (2 * big))
                    d = min(
                        distance_to_segment(px, py, apex_left, big * 0.5, left_x, top),
                        distance_to_segment(px, py, apex_left, big * 0.5, left_x, bottom),
                        distance_to_segment(px, py, apex_right, big * 0.5, right_x, top),
                        distance_to_segment(px, py, apex_right, big * 0.5, right_x, bottom),
                    )

                    if d <= stroke / 2:
                        r = g = b = 255

                    red += r
                    green += g
                    blue += b
                    alpha += 255

            samples = SUPERSAMPLE * SUPERSAMPLE
            pixels[y][x] = (red // samples, green // samples, blue // samples, alpha // samples)

    return pixels


def write_png(path: Path, pixels: list[list[tuple[int, int, int, int]]]) -> None:
    height = len(pixels)
    width = len(pixels[0])
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend((r, g, b, a))

    def chunk(tag: bytes, payload: bytes) -> bytes:
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    data = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(data)


def main() -> None:
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    for size in (192, 512):
        pixels = make_pixels(size)
        target = assets / f"icon-{size}.png"
        write_png(target, pixels)
        print(f"wrote {target.relative_to(ROOT)} ({size}×{size})")


if __name__ == "__main__":
    main()
