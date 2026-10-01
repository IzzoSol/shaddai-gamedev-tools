"""Licence notes for the model weights and services a backend may use.

This is a reminder system, not legal advice: terms change, so each entry links to the
source of truth and the pipeline repeats the warning in every provenance record.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LicenseTerms:
    id: str
    name: str
    commercial: str      # "yes" | "conditional" | "no" | "service" | "unknown"
    notes: str
    url: str = ""


REGISTRY: dict[str, LicenseTerms] = {t.id: t for t in (
    LicenseTerms(
        "hunyuan-community", "Tencent Hunyuan Community License", "conditional",
        "Typically excludes some territories (EU, UK, South Korea), requires a separate licence "
        "at very large user scale, and limits using outputs to train other AI models. Read the "
        "current text before commercial use.",
        "https://github.com/Tencent-Hunyuan"),
    LicenseTerms(
        "stability-community", "Stability AI Community License", "conditional",
        "Free for non-commercial use and for organisations under an annual-revenue threshold; "
        "above it an enterprise licence is needed. Check the current threshold.",
        "https://stability.ai/license"),
    LicenseTerms(
        "service-terms", "Hosted service terms of use", "service",
        "Rights in outputs are set by the provider's terms and your plan. Keep a copy of the "
        "terms that applied on the generation date.", ""),
    LicenseTerms(
        "permissive", "Permissive open licence (MIT/Apache-2.0/BSD)", "yes",
        "Keep the copyright and licence notices that come with the model.", ""),
    LicenseTerms(
        "own", "Your own model or weights", "yes", "You set the terms.", ""),
)}

UNKNOWN = LicenseTerms("unknown", "Unrecorded licence", "unknown",
                       "No licence was recorded for this backend. Find out before shipping.")


def terms_for(license_id: str) -> LicenseTerms:
    return REGISTRY.get(license_id, UNKNOWN)


def warnings(license_id: str, commercial_use: bool) -> list[str]:
    """Human-readable cautions for using this backend's output the way you said you would."""
    t = terms_for(license_id)
    if t.id == "unknown":
        return [t.notes]
    if commercial_use and t.commercial in ("conditional", "service"):
        return [f"{t.name}: {t.notes}"]
    if commercial_use and t.commercial == "no":
        return [f"{t.name} does not allow commercial use."]
    return []
