# Design System

Single source of truth for the Ecomm storefront + admin UI. Read this before
adding a new page, refactoring an existing one, or generating UI with an AI
assistant. Following these rules keeps the product **visually consistent**
without slowing anyone down — every widget is just an `import` away.

> **TL;DR**
> 1. Colours, fonts, radii, spacing live in **`src/styles/globals.css`** as
>    Tailwind v4 `@theme` tokens. Never hard-code hex / px values.
> 2. Page-level patterns (breadcrumb, page header, stat card, empty state,
>    status pill, …) come from **`src/components/ui`**. Always import from
>    the barrel: `import { PageHeader, EmptyState } from '@/components/ui'`.
> 3. Forms use the shared **`inputClass`** helper + **`Field`** wrapper so
>    every input on the site looks identical.
> 4. There is exactly **one** stylesheet (`globals.css`). Do not add
>    per-component or per-page `.css` files.

---

## 1. Tokens

All tokens live in `src/styles/globals.css` inside `@theme { … }`. Tailwind v4
generates utility classes for them automatically:

| Token group   | Source                       | Tailwind utility example         |
| ------------- | ---------------------------- | -------------------------------- |
| `--color-*`   | `--color-brand`, `--color-ink` | `bg-brand`, `text-ink`         |
| `--font-*`    | `--font-sans`, `--font-mono` | `font-sans`, `font-mono`         |
| `--text-*`    | `--text-sm`, `--text-2xl`    | `text-sm`, `text-2xl`            |
| `--radius-*`  | `--radius-md`, `--radius-lg` | `rounded-md`, `rounded-lg`       |
| `--shadow-*`  | `--shadow-sm`, `--shadow-md` | `shadow-sm`, `shadow-md`         |
| `--spacing-*` | `--spacing-1` … `-32`        | `p-4`, `gap-8`                   |

When a colour is referenced in JSX use the `[var(--color-x)]` arbitrary
syntax — that's how Tailwind v4 keeps the colour in the token system rather
than burning a literal value:

```tsx
<div className="bg-[var(--color-brand)] text-white" />
```

### Colour palette (semantic)

| Role                 | Use it for                                   |
| -------------------- | -------------------------------------------- |
| `--color-brand`      | Primary CTA, active nav, links, focus ring   |
| `--color-brand-subtle` | Pill backgrounds, hover tints              |
| `--color-promo`      | Sale price, "Buy now" CTA, % off badges      |
| `--color-promo-subtle` | Sale-card backgrounds                      |
| `--color-success`    | Order placed, "in stock", positive deltas    |
| `--color-warning`    | Low stock, scope-notice banners              |
| `--color-error`      | Form errors, "Out of stock", destructive CTA |
| `--color-info`       | Informational banners (rarely used)          |
| `--color-ink`        | Primary text                                 |
| `--color-ink-secondary` | Secondary text, table cell values         |
| `--color-ink-muted`  | Help / hint / placeholder text               |
| `--color-bg`         | Page background                              |
| `--color-surface`    | Card / panel surface                         |
| `--color-surface-muted` | Toolbar / footer-strip surface            |
| `--color-sidebar*`   | Admin sidebar + dark navy panels (deep navy) |

**Rule of thumb**:
- Money displayed prominently → `text-promo` (red).
- Money in tables / summary lines → `text-ink` (neutral).
- Use `brand` for actions and identity, `promo` for *commerce* signals.

### Typography

- One typeface: **Inter**. `--font-sans = --font-display = --font-serif`
  (the serif alias exists only so legacy pages compile — do not rely on it).
- Headings: `font-extrabold tracking-tight` + sans-serif. **Never** use
  serif fonts; this is a tech ecommerce, not a magazine.
- Numerical columns: add `tabular-nums` so prices line up by digit.
- All-caps "kicker" / section labels:
  `text-[10px] font-bold uppercase tracking-widest`.
  Use `<SectionLabel>` instead of duplicating this incantation.

### Radii

| Token         | Px  | Use for                                |
| ------------- | --- | -------------------------------------- |
| `--radius-xs` | 4   | Code chips, very small pills           |
| `--radius-sm` | 6   | (Reserved — rarely needed)             |
| `--radius-md` | 10  | **Inputs, buttons, badges**            |
| `--radius-lg` | 14  | **Cards, panels, modals body**         |
| `--radius-xl` | 20  | Modal shell, hero card                 |
| `--radius-2xl`| 28  | Hero/visual cards                      |
| `--radius-full` | ∞ | Avatars, dot indicators, segmented pills |

Don't mix `radius-md` and `radius-lg` randomly — pick one per element family
and stick with it.

### Spacing

Use the Tailwind scale (`p-3`, `gap-4`, `space-y-6`). Don't introduce
arbitrary values like `p-[14px]`. If you find yourself wanting one, the
right answer is almost always `p-3` or `p-4`.

### Shadows

| Token        | Use for                                                 |
| ------------ | ------------------------------------------------------- |
| `shadow-xs`  | Default sticky header / topbar                          |
| `shadow-sm`  | Resting card / segmented active state                   |
| `shadow-md`  | Hover-lifted card                                       |
| `shadow-lg`  | Open dropdown / popover                                 |
| `shadow-xl`  | Modal                                                   |
| `shadow-focus` | Brand-blue focus ring (used by `inputClass`)          |

### Motion

- Durations: `duration-fast` 100ms, `duration-normal` 220ms, `duration-slow` 380ms.
- Easings: `ease-out`, `ease-in-out`, `ease-out-expo`.
- Page enter: add the `page-enter` class on the outermost page wrapper.
- Honour `prefers-reduced-motion` — already wired in `globals.css`.

---

## 2. Layout

| Convention            | Detail                                                     |
| --------------------- | ---------------------------------------------------------- |
| Page max-width        | `--max-width-content` (80rem) — applied via `.container`   |
| Container padding     | `--container-padding` (clamp 1rem → 3rem)                  |
| Storefront page padding | `py-8 md:py-10` on the outer wrapper                     |
| Admin page padding    | `px-4 lg:px-6 py-6 lg:py-8` (already on `<main>`)         |
| Sticky header offset  | Topbar is `h-16` + ~36px announcement = ~100px on storefront. Use `lg:top-32` on sticky sidebars. |
| Form max-width        | `max-w-3xl` on form pages, `max-w-md` on auth columns      |
| Grid breakpoints      | Use Tailwind `sm md lg xl 2xl` only. No custom breakpoints.|

### Z-index ladder

Stick to these tiers — never invent new z-values. Anything that opens "above
everything" (modals, confirmation dialogs) must use **`z-[200]+`**, otherwise
it'll render behind the admin sidebar.

| z-index    | Used by                                                    |
| ---------- | ---------------------------------------------------------- |
| `z-[100]`  | Storefront sticky header                                   |
| `z-[110]`  | Storefront header user dropdown                            |
| `z-[120]`  | Admin sticky topbar                                        |
| `z-[125]`  | Admin topbar user dropdown                                 |
| `z-[130]`  | Admin desktop sidebar                                      |
| `z-[140]`  | Admin mobile drawer backdrop                               |
| `z-[150]`  | Admin mobile drawer panel                                  |
| **`z-[200]`** | **Modals, confirm dialogs, full-screen forms (must cover sidebar)** |

---

## 3. Widget catalogue

All widgets live in `src/components/ui/`. Always import from the barrel:

```ts
import { Card, PageHeader, EmptyState } from '@/components/ui';
```

### `Card`

Generic surface block. Pass `variant="muted" | "sidebar"` for non-default
backgrounds. Use `padding="none"` when you need to put a custom toolbar +
divided content inside.

```tsx
<Card>
  …
</Card>
```

### `Breadcrumb`

```tsx
<Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
```
- Last item is rendered as plain text — do NOT pass `to` on the last entry.
- Truncates long item labels at 40ch.

### `PageHeader`

Use this on **every** route view. Standardises the kicker + h1 + subtitle +
right-aligned actions layout.

```tsx
<PageHeader
  kicker="New product"          // optional brand-blue uppercase eyebrow
  title="Create a new product"
  subtitle="Fill out the catalog details. SKU must be unique."
  actions={<Link to="…">+ New</Link>}
/>
```

### `EmptyState`

```tsx
<EmptyState
  Icon={IconCart}
  title="Your cart is empty"
  description="Browse our latest phones, laptops, and accessories."
  actions={<Link to="/">Start shopping</Link>}
/>
```

- Default `dashed` border + `lg` size. Pass `dashed={false}` inside a card.
- Always pass an icon — the visual is incomplete without one.

### `StatusPill`

```tsx
<StatusPill tone="success">Placed</StatusPill>
<StatusPill tone="error" dot>Out of stock</StatusPill>
<StatusPill tone="brand" solid>NEW</StatusPill>
```

| Tone     | Use for                                    |
| -------- | ------------------------------------------ |
| success  | Order placed, "in stock", confirmed        |
| warning  | Low stock, partial scope, draft            |
| error    | Out of stock, failed, destructive          |
| info     | Generic informational                      |
| brand    | "NEW", "Active", brand-aligned states      |
| neutral  | Default / fallback                         |

`solid` variant: filled background — only use on dark contexts.

### `StatCard`

Three variants:

```tsx
// Dashboard KPI tile
<StatCard
  icon={<IconBox width={20} height={20} />}
  label="Products"
  value="124"
  delta={{ direction: 'up', text: '+5 this week' }}
/>

// Headline / accent KPI (one per row max)
<StatCard variant="accent" icon={…} label="Revenue" value={formatPrice(x)} />

// Compact toolbar mini-stat
<StatCard variant="mini" label="Out of stock" value="3" valueColor="error" />
```

### `SegmentedControl`

```tsx
<SegmentedControl
  value={filter}
  onChange={setFilter}
  options={[{ value: 'all', label: 'All' }, … ]}
  variant="solid"  // or "subtle" (default — toolbar usage)
/>
```
- ≤ 5 options. For more, use a `<select>`.
- `subtle` — inside toolbars; `solid` — primary filter row.

### `SearchInput`

Search with magnifier icon prefixed inside the box, focus jump from
`surface-muted` → `surface-raised`.

```tsx
<SearchInput
  placeholder="Search products by name…"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  className="flex-1 min-w-[14rem]"
/>
```

### `Field` + `inputClass`

The combo every form on the site uses.

```tsx
import { Field, inputClass } from '@/components/ui';

<Field id="email" label="Email" required error={errors.email?.message}>
  <input id="email" type="email" className={inputClass(!!errors.email)} {...register('email')} />
</Field>
```

- For a textarea reuse `inputClass(...)` and add `h-auto py-3 resize-y`.
- For a "Forgot?" link: pass `rightSlot`.

### `SectionLabel`

```tsx
<SectionLabel>Basics</SectionLabel>
```
Use to divide a long form into bands. One short word; uppercase; never
followed by punctuation.

### `Avatar`

Letter avatar — first character of `name`, brand-blue background by default.

```tsx
<Avatar name={user?.name} size="md" />
```

### `GradientThumbnail`

Deterministic placeholder until the backend ships product images. The hue is
seeded from `id`, so the same product always gets the same colour.

```tsx
<GradientThumbnail id={product.id} name={product.name} size="lg" />
<GradientThumbnail id={item.product_id} name={item.product?.name} size="md" shape="round" />
```

Sizes: `xs` (32px), `sm` (40px), `md` (48px), `lg` (80px), `xl` (96px).
For a hero-sized aspect-square thumbnail, render the gradient inline (the
hero needs custom letter sizing the widget doesn't expose).

### Existing primitives (re-exported)

`Button`, `Badge`, `Pagination`, `PageLoader`, `LoadingSpinner`,
`ErrorMessage`, `InlineError`, `ConfirmDialog`, `FormField`, `Input`,
`Textarea`, `SocialButton`, `SocialDivider` — all exported from
`@/components/ui`. Prefer these over rolling your own.

---

## 4. Page patterns

Compose pages with widgets in this order:

```tsx
<div className="py-8 md:py-10 page-enter">
  <div className="container">
    <Breadcrumb items={[…]} className="mb-5" />
    <PageHeader title="…" subtitle="…" actions={…} className="mb-6" />

    {/* optional stat strip */}
    <ul className="grid gap-3 grid-cols-1 sm:grid-cols-3">
      <StatCard variant="mini" … />
      <StatCard variant="mini" … />
      <StatCard variant="mini" … />
    </ul>

    {/* optional toolbar */}
    <Card padding="sm" className="flex flex-wrap items-center gap-3">
      <SearchInput … className="flex-1 min-w-[14rem]" />
      <SegmentedControl … />
    </Card>

    {/* loading / error / empty / data */}
    {isLoading && <PageLoader />}
    {isError && <ErrorMessage … />}
    {data?.length === 0 && <EmptyState … />}
    {data?.length > 0 && <ContentBlock … />}
  </div>
</div>
```

Status pills go in `actions` slot of a `PageHeader` or in table rows.

---

## 5. Anti-patterns (don't do this)

| ✘ Don't                                              | ✓ Do                                              |
| ---------------------------------------------------- | -------------------------------------------------- |
| Hard-coded hex colour `#0066D6`                      | `var(--color-brand)` or `bg-brand`                 |
| Inline `<nav>` + `<ol>` for breadcrumbs              | `<Breadcrumb items={…} />`                         |
| `<h1 className="text-2xl …">` then duplicated paragraphs | `<PageHeader title="…" subtitle="…" />`        |
| Per-page `.css` file or `<style jsx>`                | Tailwind utilities + token vars                    |
| Re-implementing a status pill                        | `<StatusPill tone="error">Out of stock</StatusPill>` |
| Importing widgets from individual file paths         | Always import from `@/components/ui`               |
| `text-[#0a0a0a]` style "creative" hex                | Pick the closest token (`text-ink` etc.)           |
| Heading in serif font                                | Sans-serif Inter, `font-extrabold tracking-tight`  |
| Putting body content inside the StorefrontLayout footer | The footer is for marketing/links only          |

---

## 6. Adding a new widget

1. Drop a single-purpose file in `src/components/ui/`.
2. Use existing tokens — never hard-code colours/spacing.
3. Export it from `src/components/ui/index.ts` (the barrel).
4. Add a section to this doc with the API and "when to use".
5. If two pages already implement the same pattern inline, **extract** —
   don't add a third inline copy.

If you're unsure whether something deserves a widget, the rule is:

> **Three or more occurrences** of a visual pattern → extract.
> Less than three → keep inline.

---

## 7. AI agent guidance

When generating new pages with an AI assistant, paste this checklist into
the prompt:

> - Import widgets from `@/components/ui` (`PageHeader`, `Breadcrumb`,
>   `EmptyState`, `StatusPill`, `StatCard`, `SegmentedControl`,
>   `SearchInput`, `Field`, `GradientThumbnail`, `Avatar`).
> - Use Tailwind v4 utilities and CSS variables only — never hex literals.
> - Money: prominent prices use `text-[var(--color-promo)]`; table totals
>   use `text-[var(--color-ink)]`. Always add `tabular-nums`.
> - Follow the page-pattern skeleton in `DESIGN-SYSTEM.md §4`.
> - Do not create per-component `.css` files. The single stylesheet is
>   `src/styles/globals.css`.

That's all you need. If a question isn't answered here, check the existing
implementations in `src/pages/admin/AdminProductsPage.tsx` (table-heavy) or
`src/pages/storefront/CartPage.tsx` (split layout) — both are intended as
reference implementations of these patterns.
