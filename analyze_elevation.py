#!/usr/bin/env python3
# Copyright (C) 2026 Jonas Immanuel Frey - Licensed under GPLv2. See LICENSE file for details

import sys
import time

n_ts__start = time.time()

# --- dependency guard ---
try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install Pillow numpy")
    print("(recommend using a venv)")
    sys.exit(1)

# --- argument parsing ---
import argparse

o_parser = argparse.ArgumentParser(description="Analyze a grayscale elevation PNG")
o_parser.add_argument("s_path", help="Path to the elevation image")
o_arg = o_parser.parse_args()

print(f"{'Argument':<20} {'Value'}")
print(f"{'--------':<20} {'-----'}")
print(f"{'s_path':<20} {o_arg.s_path}")
print()

# --- processing ---
o_img = Image.open(o_arg.s_path)
a_n__pixel = np.array(o_img)

n_scl_x = a_n__pixel.shape[1]
n_scl_y = a_n__pixel.shape[0]
n_cnt__channel = a_n__pixel.shape[2] if a_n__pixel.ndim == 3 else 1

# use first channel (R) for grayscale analysis
a_n__gray = a_n__pixel[:, :, 0] if n_cnt__channel > 1 else a_n__pixel

n_val__min = int(np.min(a_n__gray))
n_val__max = int(np.max(a_n__gray))
n_val__mean = float(np.mean(a_n__gray))
n_val__median = float(np.median(a_n__gray))

n_cnt__pixel_at_0 = int(np.sum(a_n__gray == 0))
n_cnt__pixel_at_255 = int(np.sum(a_n__gray == 255))
n_cnt__pixel_total = n_scl_x * n_scl_y

# histogram buckets (0-51, 51-102, 102-153, 153-204, 204-255)
a_n__edge = [0, 51, 102, 153, 204, 256]
a_n__hist, _ = np.histogram(a_n__gray, bins=a_n__edge)

n_elapsed = time.time() - n_ts__start

print(f"Image:       {o_arg.s_path}")
print(f"Size:        {n_scl_x} x {n_scl_y} ({n_cnt__pixel_total} pixels)")
print(f"Channels:    {n_cnt__channel}")
print()
print(f"Min value:   {n_val__min}")
print(f"Max value:   {n_val__max}")
print(f"Mean:        {n_val__mean:.1f}")
print(f"Median:      {n_val__median:.1f}")
print()
print(f"Pixels at 0 (black):   {n_cnt__pixel_at_0} ({100*n_cnt__pixel_at_0/n_cnt__pixel_total:.1f}%)")
print(f"Pixels at 255 (white): {n_cnt__pixel_at_255} ({100*n_cnt__pixel_at_255/n_cnt__pixel_total:.1f}%)")
print()
print("Distribution:")
for n_i in range(len(a_n__hist)):
    n_lo = a_n__edge[n_i]
    n_hi = a_n__edge[n_i + 1] - 1
    n_cnt = int(a_n__hist[n_i])
    n_pct = 100 * n_cnt / n_cnt__pixel_total
    n_bar = int(n_pct / 2)
    print(f"  {n_lo:>3}-{n_hi:<3}  {'#' * n_bar:<50} {n_cnt:>8} ({n_pct:.1f}%)")
print()
print(f"[{n_elapsed:.3f}s]")
