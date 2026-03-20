"use client";
import * as React from "react";
import type { Config, Data } from "@puckeditor/core";
import { Studio } from "@anvilkit/puck-studio";
import type {
  CopywritingItem,
  CopywritingProps,
  ImageItem,
  ImagesProps,
} from "@anvilkit/puck-studio";
import { Type } from "lucide-react";

type CardListItem = {
  label?: string;
};

type StatItem = {
  value: string;
  label: string;
};

type DemoImageRecord = ImageItem & {
  searchText: string;
};

type DemoCopyRecord = CopywritingItem & {
  searchText: string;
};

type ImageDemoMode = "seeded" | "paged";

const IMAGE_LIBRARY_PAGE_SIZE = 24;
const COPY_LIBRARY_PAGE_SIZE = 18;
const DEMO_API_DELAY_MS = 450;

const IMAGE_SHOTS = [
  "hero frame",
  "campaign scene",
  "editorial backdrop",
  "lifestyle shot",
];

const IMAGE_GROUPS = [
  {
    slug: "workspace",
    title: "Workspace",
    keywords: ["desk", "team", "office", "saas", "product"],
    variants: ["strategy wall", "focus desk", "planning board", "design review"],
  },
  {
    slug: "travel",
    title: "Travel",
    keywords: ["destination", "booking", "adventure", "tourism", "escape"],
    variants: ["coastal escape", "city guide", "mountain route", "weekend itinerary"],
  },
  {
    slug: "ecommerce",
    title: "Ecommerce",
    keywords: ["checkout", "storefront", "retail", "conversion", "merchandise"],
    variants: ["checkout flow", "product shelf", "package reveal", "shopping moment"],
  },
  {
    slug: "analytics",
    title: "Analytics",
    keywords: ["dashboard", "metrics", "reporting", "insights", "growth"],
    variants: ["dashboard overview", "data screen", "trend snapshot", "growth review"],
  },
  {
    slug: "coffee",
    title: "Coffee",
    keywords: ["lifestyle", "cafe", "hospitality", "morning", "brand"],
    variants: ["barista counter", "morning ritual", "cafe table", "product pour"],
  },
  {
    slug: "wellness",
    title: "Wellness",
    keywords: ["fitness", "self care", "routine", "studio", "health"],
    variants: ["studio stretch", "recovery setup", "ritual moment", "coach session"],
  },
  {
    slug: "food",
    title: "Food",
    keywords: ["menu", "restaurant", "culinary", "kitchen", "dining"],
    variants: ["menu highlight", "chef prep", "table setting", "dish closeup"],
  },
  {
    slug: "education",
    title: "Education",
    keywords: ["course", "learning", "classroom", "students", "lesson"],
    variants: ["learning setup", "class session", "course dashboard", "study desk"],
  },
] as const;

const COPY_TOPICS = [
  {
    slug: "launch",
    title: "product launch",
    keywords: ["launch", "release", "campaign", "announcement"],
  },
  {
    slug: "pricing",
    title: "pricing refresh",
    keywords: ["pricing", "plans", "upgrade", "conversion"],
  },
  {
    slug: "travel",
    title: "travel campaign",
    keywords: ["travel", "destination", "booking", "escape"],
  },
  {
    slug: "analytics",
    title: "analytics report",
    keywords: ["analytics", "dashboard", "metrics", "insights"],
  },
  {
    slug: "ecommerce",
    title: "ecommerce drop",
    keywords: ["ecommerce", "checkout", "storefront", "merch"],
  },
  {
    slug: "onboarding",
    title: "onboarding flow",
    keywords: ["onboarding", "activation", "product", "adoption"],
  },
  {
    slug: "events",
    title: "events landing page",
    keywords: ["event", "summit", "webinar", "registration"],
  },
  {
    slug: "hospitality",
    title: "hospitality promotion",
    keywords: ["hospitality", "hotel", "stay", "guest"],
  },
  {
    slug: "wellness",
    title: "wellness program",
    keywords: ["wellness", "fitness", "health", "routine"],
  },
  {
    slug: "trust",
    title: "trust campaign",
    keywords: ["trust", "proof", "reviews", "credibility"],
  },
  {
    slug: "education",
    title: "education enrollment",
    keywords: ["education", "course", "enrollment", "learning"],
  },
  {
    slug: "restaurant",
    title: "restaurant launch",
    keywords: ["restaurant", "menu", "reservation", "dining"],
  },
] as const;

const COPY_CATEGORY_BUILDERS = [
  {
    category: "Headlines",
    label: (title: string) => `${title} headline`,
    text: (title: string) =>
      `Build a ${title} story that earns attention in the first screenful.`,
  },
  {
    category: "Subheadings",
    label: (title: string) => `${title} subheading`,
    text: (title: string) =>
      `Pair visuals, proof, and clear messaging so your ${title} page feels ready to ship.`,
  },
  {
    category: "Body",
    label: (title: string) => `${title} overview`,
    text: (title: string) =>
      `Use reusable content blocks to explain the value of your ${title} campaign without writing from scratch every time.`,
  },
  {
    category: "CTAs",
    label: (title: string) => `${title} CTA`,
    text: (title: string) => `Launch the ${title} demo`,
  },
  {
    category: "Social Proof",
    label: (title: string) => `${title} trust signal`,
    text: (title: string) =>
      `Trusted by teams shipping ${title} pages with fewer handoffs and faster approvals.`,
  },
  {
    category: "Feature Callouts",
    label: (title: string) => `${title} callout`,
    text: (title: string) =>
      `Drag ready-made ${title} copy into the canvas and refine it in place with your team.`,
  },
] as const;

const config: Config = {
  components: {
    Hero: {
      fields: {
        title: {
          type: "text",
          label: "Title",
          labelIcon: <Type className="w-3 h-3" />,
          ai: { instructions: "Always use caps" },
        },
        subtitle: { type: "textarea", label: "Subtitle" },
        alignment: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        theme: {
          type: "select",
          label: "Theme",
          options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
        },
        paddingTop: { type: "number", label: "Padding Top" },
      },
      defaultProps: {
        title: "Hello World",
        subtitle: "This is a subtitle",
        alignment: "center",
        theme: "light",
        paddingTop: 40,
      },
      render: ({ title, subtitle, alignment, theme, paddingTop }) => (
        <div style={{ textAlign: alignment as React.CSSProperties["textAlign"], background: theme === "dark" ? "#1a1a1a" : "#fff", color: theme === "dark" ? "#fff" : "#000", padding: `${paddingTop}px 24px` }}>
          <h1 style={{ margin: 0, fontSize: 36 }}>{title}</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.7 }}>{subtitle}</p>
        </div>
      ),
    },
    Card: {
      fields: {
        heading: { type: "text", label: "Heading" },
        body: { type: "richtext", label: "Body" },
        items: {
          type: "array",
          arrayFields: { label: { type: "text", label: "Label" } },
          getItemSummary: (item: CardListItem) => item.label || "Item",
          label: "Items",
        },
      },
      defaultProps: { heading: "Card Title", body: "<p>Card body content</p>", items: [] },
      render: ({ heading, body }) => (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, margin: 8 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{heading}</h2>
          {typeof body === "string" ? <div dangerouslySetInnerHTML={{ __html: body }} /> : <div>{body}</div>}
        </div>
      ),
    },
    Banner: {
      fields: {
        text: { type: "text", label: "Text", ai: { instructions: "Write a short promotional message" } },
        color: {
          type: "select",
          label: "Color",
          options: [
            { label: "Blue", value: "#3b82f6" },
            { label: "Green", value: "#22c55e" },
            { label: "Red", value: "#ef4444" },
            { label: "Purple", value: "#a855f7" },
          ],
        },
      },
      defaultProps: { text: "Special announcement goes here", color: "#3b82f6" },
      render: ({ text, color }) => (
        <div style={{ background: color, color: "#fff", padding: "12px 24px", textAlign: "center", fontWeight: 600 }}>
          {text}
        </div>
      ),
    },
    Columns: {
      fields: {
        leftText: { type: "textarea", label: "Left Column" },
        rightText: { type: "textarea", label: "Right Column" },
        gap: { type: "number", label: "Gap (px)" },
      },
      defaultProps: { leftText: "Left column content", rightText: "Right column content", gap: 16 },
      render: ({ leftText, rightText, gap }) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, padding: 16 }}>
          <div style={{ background: "#f8fafc", borderRadius: 6, padding: 12 }}>{leftText}</div>
          <div style={{ background: "#f8fafc", borderRadius: 6, padding: 12 }}>{rightText}</div>
        </div>
      ),
    },
    Image: {
      fields: {
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        caption: { type: "text", label: "Caption" },
        aspectRatio: {
          type: "select",
          label: "Aspect Ratio",
          options: [
            { label: "16:9", value: "56.25%" },
            { label: "4:3", value: "75%" },
            { label: "1:1", value: "100%" },
          ],
        },
      },
      defaultProps: { src: "https://picsum.photos/seed/image/800/450", alt: "Image", caption: "", aspectRatio: "56.25%" },
      render: ({ src, alt, caption, aspectRatio }) => (
        <div style={{ padding: "8px 16px" }}>
          <div style={{ position: "relative", paddingBottom: aspectRatio, overflow: "hidden", borderRadius: 8 }}>
            <img src={src} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {caption && <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 6 }}>{caption}</p>}
        </div>
      ),
    },
    Stats: {
      fields: {
        items: {
          type: "array",
          label: "Stats",
          arrayFields: {
            value: { type: "text", label: "Value" },
            label: { type: "text", label: "Label" },
          },
          getItemSummary: (item: Partial<StatItem>) => item.label || "Stat",
        },
      },
      defaultProps: {
        items: [
          { value: "10K+", label: "Users" },
          { value: "99%", label: "Uptime" },
          { value: "4.9★", label: "Rating" },
        ],
      },
      render: ({ items }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 32, padding: "24px 16px", flexWrap: "wrap" }}>
          {items.map((item: StatItem, i: number) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      ),
    },
    Divider: {
      fields: {
        style: {
          type: "select",
          label: "Style",
          options: [
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
          ],
        },
        color: { type: "text", label: "Color" },
        spacing: { type: "number", label: "Spacing (px)" },
      },
      defaultProps: { style: "solid", color: "#e2e8f0", spacing: 16 },
      render: ({ style, color, spacing }) => (
        <div style={{ padding: `${spacing}px 16px` }}>
          <hr style={{ border: "none", borderTop: `1px ${style} ${color}`, margin: 0 }} />
        </div>
      ),
    },
  },
};

const initialData: Data = {
  content: [
    {
      type: "Hero",
      props: {
        id: "hero-1",
        title: "Welcome to Pagix",
        subtitle: "Use Pagix",
        alignment: "center",
        theme: "light",
        paddingTop: 60,
      },
    },
  ],
  root: { props: {
    title: "Pagix"
  } },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function demoPicsumUrl(seed: string, width = 960, height = 960): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; hasMore: boolean } {
  const start = page * pageSize;
  const nextItems = items.slice(start, start + pageSize);

  return {
    items: nextItems,
    hasMore: start + pageSize < items.length,
  };
}

function createDemoImageCatalog(): DemoImageRecord[] {
  return IMAGE_GROUPS.flatMap((group, groupIndex) =>
    Array.from({ length: 12 }, (_, index) => {
      const variant = group.variants[index % group.variants.length];
      const shot = IMAGE_SHOTS[(groupIndex + index) % IMAGE_SHOTS.length];
      const itemNumber = index + 1;
      const alt = `${group.title} ${variant} ${shot}`;

      return {
        id: `${group.slug}-${itemNumber}`,
        src: demoPicsumUrl(`${group.slug}-${itemNumber}`),
        alt,
        searchText: [
          group.slug,
          group.title,
          variant,
          shot,
          ...group.keywords,
        ].join(" ").toLowerCase(),
      };
    }),
  );
}

function createDemoCopyCatalog(): DemoCopyRecord[] {
  return COPY_TOPICS.flatMap((topic) =>
    COPY_CATEGORY_BUILDERS.map((builder) => {
      const label = builder.label(topic.title);
      const text = builder.text(topic.title);

      return {
        category: builder.category,
        label,
        text,
        searchText: [
          topic.slug,
          topic.title,
          ...topic.keywords,
          builder.category,
          label,
          text,
        ].join(" ").toLowerCase(),
      };
    }),
  );
}

const demoImageCatalog = createDemoImageCatalog();
const demoImageSeeds = demoImageCatalog.map((image) => image.alt);
const demoCopyCatalog = createDemoCopyCatalog();

function filterDemoImages(query: string): DemoImageRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return demoImageCatalog;

  return demoImageCatalog.filter(
    (image) =>
      image.alt.toLowerCase().includes(normalizedQuery) ||
      image.searchText.includes(normalizedQuery),
  );
}

function filterDemoCopy(query: string): DemoCopyRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return demoCopyCatalog;

  return demoCopyCatalog.filter(
    (item) =>
      item.category.toLowerCase().includes(normalizedQuery) ||
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.text.toLowerCase().includes(normalizedQuery) ||
      item.searchText.includes(normalizedQuery),
  );
}

async function loadDemoImagesPage(
  query: string,
  page: number,
  pageSize: number,
): Promise<{ items: ImageItem[]; hasMore: boolean }> {
  await delay(DEMO_API_DELAY_MS + page * 120);
  return paginateItems(filterDemoImages(query), page, pageSize);
}

async function loadDemoCopyPage(
  query: string,
  page: number,
  pageSize: number,
): Promise<{ items: CopywritingItem[]; hasMore: boolean }> {
  await delay(DEMO_API_DELAY_MS + page * 140);
  return paginateItems(filterDemoCopy(query), page, pageSize);
}

const seededImageDemo: ImagesProps = {
  seeds: demoImageSeeds,
  pageSize: IMAGE_LIBRARY_PAGE_SIZE,
};

const pagedImageDemo: ImagesProps = {
  pageSize: IMAGE_LIBRARY_PAGE_SIZE,
  loadPage: loadDemoImagesPage,
};

const pagedCopyDemo: CopywritingProps = {
  pageSize: COPY_LIBRARY_PAGE_SIZE,
  loadPage: loadDemoCopyPage,
};

export default function EditorPage() {
  const [data, setData] = React.useState<Data>(initialData);
  const [imageDemoMode, setImageDemoMode] = React.useState<ImageDemoMode>("paged");
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | undefined>();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              Library showcase demo
            </div>
            <div style={{ fontSize: 12, color: "#64748b", maxWidth: 880 }}>
              Image tab: switch between a long seeded list and async paged loading,
              then search for terms like workspace, travel, ecommerce, or coffee.
              Copy tab: search launch, pricing, trust, or education, scroll to load
              more, and drag snippets into text-friendly canvas fields.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Image demo mode
            </span>
            {([
              ["seeded", "Seeded list"],
              ["paged", "Paged loader"],
            ] as const).map(([mode, label]) => {
              const isActive = imageDemoMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setImageDemoMode(mode)}
                  style={{
                    border: "1px solid",
                    borderColor: isActive ? "#2563eb" : "#cbd5e1",
                    background: isActive ? "#eff6ff" : "#ffffff",
                    color: isActive ? "#1d4ed8" : "#334155",
                    borderRadius: 999,
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Studio
        config={config}
        data={data}
        onSaveDraft={async (d) => {
          setIsSavingDraft(true);

          await new Promise((resolve) => {
            setTimeout(resolve, 400);
          });

          setData(d);
          setLastSavedAt(Date.now());
          setIsSavingDraft(false);
          console.log("Draft saved:", d);
        }}
        isSavingDraft={isSavingDraft}
        lastSavedAt={lastSavedAt}
        onPublish={(d) => {
          setData(d);
          console.log("Published:", d);
        }}
        onBack={() => console.log("back")}
        onChange={setData}
        aiHost="/api/puck-ai"
        className="flex-1 overflow-hidden"
        images={imageDemoMode === "seeded" ? seededImageDemo : pagedImageDemo}
        copywritings={pagedCopyDemo}
      />
    </div>
  );
}
