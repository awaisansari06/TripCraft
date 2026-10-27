"""Compare audit screenshots and measured geometry without altering reference assets.

Requires Pillow and NumPy. Run from the repository root after both visual runs.
The raw full-image result is retained; the separate below-header metric helps
identify asynchronous authentication placeholders rather than hiding them.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

root = Path("artifacts/production-audit")
results = []
for old in sorted((root / "baseline").glob("*.png")):
    new = root / "after" / old.name
    if not new.exists():
        continue
    before = np.array(Image.open(old).convert("RGB"))
    after = np.array(Image.open(new).convert("RGB"))
    result = {"file": old.name, "sameSize": before.shape == after.shape}
    if result["sameSize"]:
        result["identicalPixels"] = bool(np.array_equal(before, after))
        difference = np.abs(before.astype(np.int16) - after.astype(np.int16))
        changed = difference.max(axis=2) > 8
        result.update(
            meanAbsoluteChannelDifference=round(float(difference.mean()), 5),
            pixelsOver8Ratio=round(float(changed.mean()), 6),
            belowHeaderPixelsOver8Ratio=round(float(changed[100:].mean()), 6),
        )
    results.append(result)

baseline = json.loads((root / "baseline/visual-metrics.json").read_text(encoding="utf-8"))
after_metrics = json.loads((root / "after/visual-metrics.json").read_text(encoding="utf-8"))
geometry_changes = []
for before, after in zip(baseline, after_metrics):
    # Generated CSS-module identifiers may change with compiler versions.
    # Compare the actual coordinates/sizes independently from class names.
    coords = lambda item: [{key: value for key, value in el.items() if key != "element"}
                           for el in item["dimensions"]]
    if coords(before) != coords(after):
        geometry_changes.append({key: before[key] for key in ("route", "theme", "width")})

summary = {
    "pairs": len(results),
    "identicalSizes": all(item["sameSize"] for item in results),
    "geometryDifferences": geometry_changes,
    "exactPixelPairs": sum(item.get("identicalPixels", False) for item in results),
    "pairsWithDifferencesOver8": [item for item in results if item.get("pixelsOver8Ratio", 0) > 0],
    "maxBelowHeaderDifferenceRatio": max(item.get("belowHeaderPixelsOver8Ratio", 0) for item in results),
}
(root / "screenshot-comparison.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
(root / "visual-comparison-summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(json.dumps(summary, indent=2))
