import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '@/lib/utils/catalog';
import { getMegaMenuPanel } from '@/lib/utils/megaMenu';
import { CategoryRow } from './CategoryRow';
import { MegaMenuPanel } from './MegaMenuPanel';

/**
 * Vertical category strip with a hover mega-menu panel.
 *
 * Accessibility:
 *   - Strip is a `<nav role="navigation">` containing a `<ul role="menu">`.
 *   - Each row is a `<button role="menuitem">`.
 *   - Arrow Up/Down navigate rows; Escape closes the panel; Tab closes
 *     and moves focus naturally out of the strip.
 *   - The panel region is `aria-label`-ed with the active category name.
 *
 * Hover behaviour:
 *   - 80ms open delay: rapid skimming doesn't trigger flicker.
 *   - 120ms close delay: mouse can travel from strip to panel without closing.
 *   - A single `onMouseLeave` on the shared wrapper closes everything.
 */
export function CategoryMegaMenu() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Delay timers
  const openTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Button refs for programmatic focus (keyboard nav)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current)  clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const openPanel = useCallback((slug: string) => {
    clearTimers();
    openTimerRef.current = setTimeout(() => setActiveSlug(slug), 80);
  }, [clearTimers]);

  const closePanel = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setActiveSlug(null), 120);
  }, [clearTimers]);

  const closePanelImmediate = useCallback(() => {
    clearTimers();
    setActiveSlug(null);
  }, [clearTimers]);

  // Keep panel open when mouse re-enters the panel area
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Keyboard navigation ────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = (index + 1) % CATEGORIES.length;
          buttonRefs.current[next]?.focus();
          clearTimers();
          setActiveSlug(CATEGORIES[next].slug);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
          buttonRefs.current[prev]?.focus();
          clearTimers();
          setActiveSlug(CATEGORIES[prev].slug);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          closePanelImmediate();
          break;
        }
        case 'Enter':
        case ' ': {
          // Open panel on Enter/Space (panel links handle navigation)
          e.preventDefault();
          clearTimers();
          setActiveSlug(CATEGORIES[index].slug);
          break;
        }
        case 'Tab': {
          // Tab naturally moves focus out — close the panel
          closePanelImmediate();
          break;
        }
      }
    },
    [clearTimers, closePanelImmediate],
  );

  // Close panel on link click; react-router Link handles the navigation itself.
  const handleLinkClick = useCallback(() => {
    closePanelImmediate();
  }, [closePanelImmediate]);


  return (
    /*
     * Shared wrapper: single onMouseLeave closes both strip + panel.
     * Using position:relative so the panel can use position:absolute left:100%.
     * No transparent gap between strip and panel — they are siblings inside
     * this wrapper, flush-adjacent.
     */
    <div
      className="relative"
      onMouseLeave={closePanel}
      onMouseEnter={cancelClose}
    >
      {/* ── Category strip ──────────────────────────────────────────── */}
      <nav
        aria-label="Product categories"
        className="w-56 flex-shrink-0 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden"
      >
        <ul role="menu" className="py-1">
          {CATEGORIES.map((cat, index) => (
            <li key={cat.slug} role="none">
              <CategoryRow
                category={cat}
                isActive={activeSlug === cat.slug}
                onMouseEnter={() => openPanel(cat.slug)}
                onFocus={() => {
                  clearTimers();
                  setActiveSlug(cat.slug);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                buttonRef={(el) => {
                  buttonRefs.current[index] = el;
                }}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Mega-menu panel ─────────────────────────────────────────── */}
      {/*
       * Always rendered in the DOM (for CSS transitions to work correctly).
       * Visibility and pointer-events toggled via isVisible prop.
       */}
      {CATEGORIES.map((cat) => {
        const panel = getMegaMenuPanel(cat.slug);
        if (!panel) return null;
        return (
          <MegaMenuPanel
            key={cat.slug}
            panel={panel}
            categoryLabel={cat.label}
            isVisible={activeSlug === cat.slug}
            onLinkClick={handleLinkClick}
          />
        );
      })}

      {/* Invisible bridge: fills any sub-pixel gap between strip right-edge
          and panel left-edge so onMouseLeave doesn't fire mid-transition.
          Height matches the strip height; width is the panel's border radius.
          This only matters if a gap exists — with flush adjacent siblings
          it's a safety net. */}
      {activeSlug && (
        <div
          aria-hidden
          className="absolute top-0 left-[13.75rem] h-full w-2"
          onMouseEnter={cancelClose}
        />
      )}
    </div>
  );
}
