/**
 * Mega-menu panel data for the HomeHero category strip.
 *
 * Data is hardcoded for now.
 * TODO(backend): Replace with a `GET /mega-menu` endpoint that returns
 * category-specific featured brands/models when the catalog supports
 * server-side facets (category + brand columns on the products table).
 *
 * Price-range links:
 *   The backend does NOT have a price-range filter yet. Price range buckets
 *   are linked using `/?category=<slug>&name=<bucket-keyword>` — the keyword
 *   acts as a substring match on product name/description. This is a
 *   best-effort stub. When a proper `min_price`/`max_price` query param lands
 *   on the backend, replace the `to` values here.
 *   Example replacement: `/?category=phones&min_price=300&max_price=700`
 */

export interface MegaMenuBrand {
  slug: string;
  label: string;
  /** Target URL — usually `/?category=<cat>&brand=<slug>` */
  to: string;
}

export interface MegaMenuLink {
  label: string;
  /** Target URL — usually `/?name=<model>` or `/?category=<cat>&name=<bucket>` */
  to: string;
}

export interface MegaMenuColumn {
  /** Section heading displayed inside the panel column. */
  title: string;
  /**
   * Brand pills displayed in a 2-col pill grid.
   * Mutually exclusive with `links` — use one or the other per column.
   */
  brands?: MegaMenuBrand[];
  /**
   * Plain text links displayed as a vertical list.
   * Mutually exclusive with `brands`.
   */
  links?: MegaMenuLink[];
}

export interface MegaMenuFeaturedCard {
  /** Short promo headline. */
  title: string;
  /** Secondary descriptor line. */
  subtitle: string;
  /** Target URL when the user clicks the card CTA. */
  to: string;
}

export interface MegaMenuPanel {
  /** Matches CATEGORIES[].slug exactly. */
  categorySlug: string;
  /** Up to 4 columns shown left-to-right inside the panel. */
  columns: MegaMenuColumn[];
  /** Optional right-side promo card with a gradient background. */
  featuredCard?: MegaMenuFeaturedCard;
}

// ─── Helper: canonical brand links ──────────────────────────────────────────

function brandLink(categorySlug: string, brandSlug: string): string {
  return `/?category=${categorySlug}&brand=${brandSlug}`;
}

/** For brands not in the BRANDS catalog (no backend slug), use name search. */
function brandNameLink(categorySlug: string, brandName: string): string {
  return `/?category=${categorySlug}&name=${encodeURIComponent(brandName)}`;
}

function modelLink(modelName: string): string {
  return `/?name=${encodeURIComponent(modelName)}`;
}

/**
 * Price-range stub links.
 * TODO(backend): replace with `/?category=<cat>&min_price=X&max_price=Y`
 * once the API supports price filter params.
 */
function priceRangeLink(categorySlug: string, bucketKeyword: string): string {
  return `/?category=${categorySlug}&name=${encodeURIComponent(bucketKeyword)}`;
}

// ─── Panel definitions ───────────────────────────────────────────────────────

export const MEGA_MENU: MegaMenuPanel[] = [
  // ── Phones ──────────────────────────────────────────────────────────────
  {
    categorySlug: 'phones',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'apple',   label: 'Apple',   to: brandLink('phones', 'apple') },
          { slug: 'samsung', label: 'Samsung',  to: brandLink('phones', 'samsung') },
          { slug: 'sony',    label: 'Sony',     to: brandLink('phones', 'sony') },
          // Xiaomi / Oppo / Vivo have no catalog slug — use name search
          { slug: 'xiaomi',  label: 'Xiaomi',   to: brandNameLink('phones', 'Xiaomi') },
          { slug: 'oppo',    label: 'Oppo',     to: brandNameLink('phones', 'Oppo') },
          { slug: 'vivo',    label: 'Vivo',     to: brandNameLink('phones', 'Vivo') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'iPhone 16 Pro',  to: modelLink('iPhone 16 Pro') },
          { label: 'iPhone 16',      to: modelLink('iPhone 16') },
          { label: 'Galaxy S25 Ultra', to: modelLink('Galaxy S25 Ultra') },
          { label: 'Galaxy S25',     to: modelLink('Galaxy S25') },
          { label: 'Pixel 9 Pro',    to: modelLink('Pixel 9 Pro') },
          { label: 'Xperia 1 VI',    to: modelLink('Xperia 1') },
        ],
      },
      {
        title: 'Price ranges',
        links: [
          // TODO(backend): Replace with min_price/max_price params when available.
          { label: 'Under $300',      to: priceRangeLink('phones', 'budget') },
          { label: '$300 – $700',     to: priceRangeLink('phones', 'mid-range') },
          { label: '$700 – $1,200',   to: priceRangeLink('phones', 'premium') },
          { label: 'Over $1,200',     to: priceRangeLink('phones', 'flagship') },
        ],
      },
    ],
    featuredCard: {
      title: 'iPhone 16 Pro',
      subtitle: 'Save up to $200 · Free shipping',
      to: modelLink('iPhone 16 Pro'),
    },
  },

  // ── Laptops ─────────────────────────────────────────────────────────────
  {
    categorySlug: 'laptops',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'apple',  label: 'Apple',  to: brandLink('laptops', 'apple') },
          { slug: 'dell',   label: 'Dell',   to: brandLink('laptops', 'dell') },
          { slug: 'hp',     label: 'HP',     to: brandLink('laptops', 'hp') },
          { slug: 'lenovo', label: 'Lenovo', to: brandLink('laptops', 'lenovo') },
          { slug: 'asus',   label: 'Asus',   to: brandLink('laptops', 'asus') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'MacBook Pro 14"',  to: modelLink('MacBook Pro') },
          { label: 'MacBook Air M3',   to: modelLink('MacBook Air') },
          { label: 'ThinkPad X1 Carbon', to: modelLink('ThinkPad X1') },
          { label: 'Dell XPS 15',      to: modelLink('XPS 15') },
          { label: 'HP Spectre x360',  to: modelLink('Spectre') },
          { label: 'Asus ZenBook',     to: modelLink('ZenBook') },
        ],
      },
      {
        title: 'Price ranges',
        links: [
          // TODO(backend): Replace with price filter params when available.
          { label: 'Under $800',       to: priceRangeLink('laptops', 'budget') },
          { label: '$800 – $1,500',    to: priceRangeLink('laptops', 'mid-range') },
          { label: 'Over $1,500',      to: priceRangeLink('laptops', 'flagship') },
        ],
      },
    ],
    featuredCard: {
      title: 'MacBook Pro M4',
      subtitle: 'Up to 24-core GPU · In stock now',
      to: modelLink('MacBook Pro'),
    },
  },

  // ── Tablets ─────────────────────────────────────────────────────────────
  {
    categorySlug: 'tablets',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'apple',   label: 'Apple',   to: brandLink('tablets', 'apple') },
          { slug: 'samsung', label: 'Samsung',  to: brandLink('tablets', 'samsung') },
          { slug: 'lenovo',  label: 'Lenovo',  to: brandLink('tablets', 'lenovo') },
          { slug: 'huawei',  label: 'Huawei',  to: brandNameLink('tablets', 'Huawei') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'iPad Air M2',      to: modelLink('iPad Air') },
          { label: 'iPad Pro M4',      to: modelLink('iPad Pro') },
          { label: 'Galaxy Tab S10',   to: modelLink('Galaxy Tab S10') },
          { label: 'Galaxy Tab S10+',  to: modelLink('Galaxy Tab S10+') },
          { label: 'Lenovo Tab P12',   to: modelLink('Lenovo Tab') },
        ],
      },
      {
        title: 'Price ranges',
        links: [
          // TODO(backend): Replace with price filter params when available.
          { label: 'Under $400',      to: priceRangeLink('tablets', 'budget') },
          { label: '$400 – $800',     to: priceRangeLink('tablets', 'mid-range') },
          { label: 'Over $800',       to: priceRangeLink('tablets', 'premium') },
        ],
      },
    ],
    featuredCard: {
      title: 'iPad Pro M4',
      subtitle: 'Ultra Retina XDR · OLED display',
      to: modelLink('iPad Pro'),
    },
  },

  // ── Watches ─────────────────────────────────────────────────────────────
  {
    categorySlug: 'watches',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'apple',   label: 'Apple',   to: brandLink('watches', 'apple') },
          { slug: 'samsung', label: 'Samsung',  to: brandLink('watches', 'samsung') },
          { slug: 'garmin',  label: 'Garmin',  to: brandNameLink('watches', 'Garmin') },
          { slug: 'fitbit',  label: 'Fitbit',  to: brandNameLink('watches', 'Fitbit') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'Apple Watch Ultra 2',  to: modelLink('Apple Watch Ultra') },
          { label: 'Apple Watch Series 10', to: modelLink('Apple Watch Series') },
          { label: 'Galaxy Watch 7',       to: modelLink('Galaxy Watch') },
          { label: 'Garmin Fenix 8',       to: modelLink('Garmin Fenix') },
          { label: 'Garmin Venu 3',        to: modelLink('Garmin Venu') },
        ],
      },
      {
        title: 'Price ranges',
        links: [
          // TODO(backend): Replace with price filter params when available.
          { label: 'Under $250',      to: priceRangeLink('watches', 'budget') },
          { label: '$250 – $600',     to: priceRangeLink('watches', 'mid-range') },
          { label: 'Over $600',       to: priceRangeLink('watches', 'premium') },
        ],
      },
    ],
    featuredCard: {
      title: 'Apple Watch Ultra 2',
      subtitle: 'Titanium case · 60h battery',
      to: modelLink('Apple Watch Ultra'),
    },
  },

  // ── Audio ────────────────────────────────────────────────────────────────
  {
    categorySlug: 'audio',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'apple', label: 'Apple', to: brandLink('audio', 'apple') },
          { slug: 'sony',  label: 'Sony',  to: brandLink('audio', 'sony') },
          { slug: 'bose',  label: 'Bose',  to: brandLink('audio', 'bose') },
          { slug: 'jbl',   label: 'JBL',   to: brandLink('audio', 'jbl') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'AirPods Pro 2',     to: modelLink('AirPods Pro') },
          { label: 'AirPods Max',       to: modelLink('AirPods Max') },
          { label: 'Sony WH-1000XM5',   to: modelLink('WH-1000XM5') },
          { label: 'Bose QC Ultra',     to: modelLink('QuietComfort') },
          { label: 'JBL Flip 7',        to: modelLink('JBL Flip') },
          { label: 'JBL Charge 5',      to: modelLink('JBL Charge') },
        ],
      },
      {
        title: 'By type',
        links: [
          { label: 'Headphones',        to: `/?category=audio&name=${encodeURIComponent('headphone')}` },
          { label: 'Earbuds',           to: `/?category=audio&name=${encodeURIComponent('earbud')}` },
          { label: 'Speakers',          to: `/?category=audio&name=${encodeURIComponent('speaker')}` },
          { label: 'Soundbars',         to: `/?category=audio&name=${encodeURIComponent('soundbar')}` },
        ],
      },
    ],
    featuredCard: {
      title: 'AirPods Pro 2',
      subtitle: 'Active Noise Cancellation · H2 chip',
      to: modelLink('AirPods Pro'),
    },
  },

  // ── Cameras ──────────────────────────────────────────────────────────────
  {
    categorySlug: 'cameras',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'sony',     label: 'Sony',     to: brandLink('cameras', 'sony') },
          { slug: 'canon',    label: 'Canon',    to: brandNameLink('cameras', 'Canon') },
          { slug: 'nikon',    label: 'Nikon',    to: brandNameLink('cameras', 'Nikon') },
          { slug: 'fujifilm', label: 'Fujifilm', to: brandNameLink('cameras', 'Fujifilm') },
          { slug: 'gopro',    label: 'GoPro',    to: brandNameLink('cameras', 'GoPro') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'Sony A7 IV',         to: modelLink('Sony A7') },
          { label: 'Sony ZV-E10 II',     to: modelLink('Sony ZV') },
          { label: 'Canon EOS R6 Mark II', to: modelLink('Canon R6') },
          { label: 'Nikon Z6 III',       to: modelLink('Nikon Z6') },
          { label: 'GoPro Hero 12',      to: modelLink('GoPro Hero') },
        ],
      },
      {
        title: 'By type',
        links: [
          { label: 'Mirrorless',  to: `/?category=cameras&name=${encodeURIComponent('mirrorless')}` },
          { label: 'DSLR',        to: `/?category=cameras&name=${encodeURIComponent('dslr')}` },
          { label: 'Action cams', to: `/?category=cameras&name=${encodeURIComponent('gopro')}` },
          { label: 'Lenses',      to: `/?category=cameras&name=${encodeURIComponent('lens')}` },
        ],
      },
    ],
    featuredCard: {
      title: 'Sony A7 IV',
      subtitle: '33MP full-frame · 4K video',
      to: modelLink('Sony A7'),
    },
  },

  // ── Monitors ─────────────────────────────────────────────────────────────
  {
    categorySlug: 'monitors',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'dell',    label: 'Dell',    to: brandLink('monitors', 'dell') },
          { slug: 'samsung', label: 'Samsung', to: brandLink('monitors', 'samsung') },
          { slug: 'asus',    label: 'Asus',    to: brandLink('monitors', 'asus') },
          { slug: 'lg',      label: 'LG',      to: brandNameLink('monitors', 'LG') },
        ],
      },
      {
        title: 'Popular models',
        links: [
          { label: 'Dell UltraSharp 4K',  to: modelLink('UltraSharp') },
          { label: 'Dell UltraFine 27"',  to: modelLink('UltraFine') },
          { label: 'Samsung Odyssey G7',  to: modelLink('Odyssey') },
          { label: 'LG UltraFine OLED',   to: modelLink('LG OLED') },
          { label: 'Asus ProArt 32"',     to: modelLink('ProArt') },
        ],
      },
      {
        title: 'By resolution',
        links: [
          { label: '1080p Full HD',  to: `/?category=monitors&name=${encodeURIComponent('1080')}` },
          { label: '1440p QHD',      to: `/?category=monitors&name=${encodeURIComponent('1440')}` },
          { label: '4K UHD',         to: `/?category=monitors&name=${encodeURIComponent('4K')}` },
        ],
      },
    ],
    featuredCard: {
      title: 'Dell UltraSharp',
      subtitle: '4K OLED · 60Hz · USB-C 90W',
      to: modelLink('UltraSharp'),
    },
  },

  // ── Accessories ──────────────────────────────────────────────────────────
  {
    categorySlug: 'accessories',
    columns: [
      {
        title: 'Brands',
        brands: [
          { slug: 'logitech', label: 'Logitech', to: brandLink('accessories', 'logitech') },
          { slug: 'apple',    label: 'Apple',    to: brandLink('accessories', 'apple') },
          { slug: 'anker',    label: 'Anker',    to: brandNameLink('accessories', 'Anker') },
          { slug: 'samsung',  label: 'Samsung',  to: brandLink('accessories', 'samsung') },
        ],
      },
      {
        title: 'By type',
        links: [
          { label: 'Cables',          to: `/?category=accessories&name=${encodeURIComponent('cable')}` },
          { label: 'Chargers',        to: `/?category=accessories&name=${encodeURIComponent('charger')}` },
          { label: 'Mice',            to: `/?category=accessories&name=${encodeURIComponent('mouse')}` },
          { label: 'Keyboards',       to: `/?category=accessories&name=${encodeURIComponent('keyboard')}` },
          { label: 'Stands & Docks',  to: `/?category=accessories&name=${encodeURIComponent('stand')}` },
          { label: 'Phone cases',     to: `/?category=accessories&name=${encodeURIComponent('case')}` },
        ],
      },
      {
        title: 'Popular picks',
        links: [
          { label: 'Logitech MX Master 3S', to: modelLink('MX Master') },
          { label: 'Logitech MX Keys',      to: modelLink('MX Keys') },
          { label: 'Anker 65W Charger',     to: modelLink('Anker') },
          { label: 'Apple MagSafe',         to: modelLink('MagSafe') },
        ],
      },
    ],
    featuredCard: {
      title: 'Logitech MX Series',
      subtitle: 'Master your workflow',
      to: brandLink('accessories', 'logitech'),
    },
  },
];

/** Look up a panel by category slug. Returns undefined if not found. */
export function getMegaMenuPanel(categorySlug: string): MegaMenuPanel | undefined {
  return MEGA_MENU.find((p) => p.categorySlug === categorySlug);
}
