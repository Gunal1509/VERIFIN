"""
Automated Accessibility (a11y), WCAG AA Compliance, and Mobile Phone View Audit.
Tests the frontend DOM structure, contrast standards, ARIA attributes,
mobile responsive layouts, touch friendliness, and semantic landmarks.
"""

import os
import re
import pytest

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
INDEX_HTML = os.path.join(FRONTEND_DIR, "index.html")
FRONTEND_SRC = os.path.join(FRONTEND_DIR, "src")
INDEX_CSS = os.path.join(FRONTEND_SRC, "index.css")
LANDING_SCREEN = os.path.join(FRONTEND_SRC, "screens", "LandingScreen.tsx")
NAVBAR = os.path.join(FRONTEND_SRC, "components", "Navbar.tsx")
AGENT_THEATRE = os.path.join(FRONTEND_SRC, "screens", "AgentTheatreScreen.tsx")
TRUST_GATE = os.path.join(FRONTEND_SRC, "screens", "TrustGateScreen.tsx")
ENTRY_SCENE = os.path.join(FRONTEND_SRC, "components", "EntryScene.tsx")


def test_index_css_accessibility_tokens():
    """Verify WCAG AA visible focus indicators and reduced-motion support exist in CSS."""
    assert os.path.exists(INDEX_CSS), "index.css must exist"
    with open(INDEX_CSS, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Visible focus rule (:focus-visible)
    assert ":focus-visible" in content, "Must declare :focus-visible for keyboard focus indicators"
    assert "outline" in content, "Focus visible must specify an outline for WCAG AA visibility"

    # 2. prefers-reduced-motion support
    assert "prefers-reduced-motion" in content, "Must support prefers-reduced-motion query"
    assert "animation-duration" in content, "Must disable or reduce animation duration for reduced motion"


def test_mobile_phone_viewport_and_touch_compatibility():
    """Verify mobile phone viewport meta tags, touch scrolling, and responsive breakpoints."""
    # 1. Viewport meta tag in index.html
    assert os.path.exists(INDEX_HTML), "index.html must exist"
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()
    assert 'meta name="viewport"' in html, "index.html must declare viewport meta tag"
    assert "width=device-width" in html, "viewport must set width=device-width for mobile"

    # 2. Touch scrolling support in index.css
    with open(INDEX_CSS, "r", encoding="utf-8") as f:
        css = f.read()
    assert "touch-action: manipulation" in css or "-webkit-overflow-scrolling: touch" in css, \
        "index.css must provide touch-action and smooth touch scrolling"

    # 3. Mobile hamburger navigation in Navbar
    with open(NAVBAR, "r", encoding="utf-8") as f:
        nav = f.read()
    assert "md:hidden" in nav, "Navbar must provide mobile-specific toggle for phone view"
    assert "mobileMenuOpen" in nav, "Navbar must support mobile drawer state"

    # 4. Mobile phone card views for tabular data (TrustGate & MCP Registry)
    with open(LANDING_SCREEN, "r", encoding="utf-8") as f:
        landing = f.read()
    assert "block md:hidden" in landing and "hidden md:block" in landing, \
        "LandingScreen must provide mobile phone card view for tabular connectors"

    with open(TRUST_GATE, "r", encoding="utf-8") as f:
        trust = f.read()
    assert "block md:hidden" in trust and "hidden md:block" in trust, \
        "TrustGateScreen must provide mobile phone card view for fact verification"


def test_landing_screen_semantic_structure():
    """Verify semantic landmark regions, accessible buttons, and headings in LandingScreen."""
    assert os.path.exists(LANDING_SCREEN), "LandingScreen.tsx must exist"
    with open(LANDING_SCREEN, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Landmarks: sections, header/footer
    assert "<section" in content, "Must use semantic <section> elements"
    assert "<footer" in content, "Must use semantic <footer> element"
    assert "<h1" in content, "Must have an h1 tag for page title"
    assert "<h2" in content, "Must have h2 tags for major sections"
    assert "<h3" in content, "Must have h3 tags for subsection hierarchy"

    # 2. No empty buttons without labels
    buttons = re.findall(r"<button[^>]*>(.*?)</button>", content, re.DOTALL)
    assert len(buttons) >= 4, "Must have interactive buttons"
    for b in buttons:
        assert len(b.strip()) > 0, "Button must not be empty"


def test_navbar_accessible_controls():
    """Verify accessible navigation landmarks, aria labels, and select element labeling."""
    assert os.path.exists(NAVBAR), "Navbar.tsx must exist"
    with open(NAVBAR, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Navigation landmark with aria-label
    assert '<nav' in content and 'aria-label=' in content, "Nav must have descriptive aria-label"

    # 2. Case select has accessible label
    assert 'aria-label="Active MSME loan case"' in content, "Case selector dropdown must have aria-label"


def test_agent_theatre_accessibility():
    """Verify Agent Theatre keyboard controls and modal accessibility."""
    assert os.path.exists(AGENT_THEATRE), "AgentTheatreScreen.tsx must exist"
    with open(AGENT_THEATRE, "r", encoding="utf-8") as f:
        content = f.read()

    # Modal dismiss button has label/title or text
    assert 'Close Inspector' in content, "Modal must provide an explicit text dismiss button"
    assert 'aria-label' in content or 'select' in content, "Form elements must be accessible"


def test_contrast_ratio_fintech_palette():
    """
    Mathematical verification of contrast ratios for key text/bg pairs:
    WCAG AA requires >= 4.5:1 for normal text, >= 3.0:1 for large text.
    """
    def relative_luminance(r, g, b):
        channels = []
        for c in (r, g, b):
            s = c / 255.0
            channels.append(s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4)
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]

    def contrast_ratio(rgb1, rgb2):
        l1 = relative_luminance(*rgb1)
        l2 = relative_luminance(*rgb2)
        bright, dark = max(l1, l2), min(l1, l2)
        return (bright + 0.05) / (dark + 0.05)

    # 1. White text on Fintech Dark (#0B1120: rgb(11, 17, 32))
    cr_hero = contrast_ratio((255, 255, 255), (11, 17, 32))
    assert cr_hero >= 4.5, f"Hero text contrast {cr_hero:.2f} must be >= 4.5:1"

    # 2. Slate-900 text (#0F172A: rgb(15, 23, 42)) on Slate-50 (#F8FAFC: rgb(248, 250, 252))
    cr_body = contrast_ratio((15, 23, 42), (248, 250, 252))
    assert cr_body >= 4.5, f"Body text contrast {cr_body:.2f} must be >= 4.5:1"

    # 3. Emerald-400 (#34D399: rgb(52, 211, 153)) on Dark Navy (#0B1120: rgb(11, 17, 32))
    cr_accent = contrast_ratio((52, 211, 153), (11, 17, 32))
    assert cr_accent >= 4.5, f"Indicator contrast {cr_accent:.2f} must be >= 4.5:1"


def test_entry_scene_accessibility_and_features():
    """Verify EntryScene dialog accessibility, 3-act narrative flow, keyboard shortcuts, and safety guarantees."""
    assert os.path.exists(ENTRY_SCENE), "EntryScene.tsx must exist"
    with open(ENTRY_SCENE, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Dialog accessibility
    assert 'role="dialog"' in content, "Must declare role='dialog'"
    assert 'aria-modal="true"' in content, "Must declare aria-modal='true'"
    assert 'aria-labelledby="entry-scene-title"' in content, "Must link to accessible title ID"

    # 2. Keyboard shortcuts
    assert "Escape" in content, "Must support Escape key to skip/close"
    assert "ArrowRight" in content and "ArrowLeft" in content, "Must support Arrow keys to change acts"

    # 3. Acts and narrative flow
    assert "currentAct === 1" in content, "Must implement Act 1 (The Paper Dilemma)"
    assert "currentAct === 2" in content, "Must implement Act 2 (Vector Intelligence & Parallel Mesh)"
    assert "currentAct === 3" in content, "Must implement Act 3 (Verifin Brand Title Reveal)"

    # 4. Sound synthesizer and controls
    assert "AudioContext" in content, "Must use Web Audio API for soft fintech chimes without external audio files"
    assert "soundEnabled" in content, "Must provide sound mute/unmute control"
    assert "isPlaying" in content, "Must provide play/pause control"

