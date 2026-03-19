"use client";
import * as React from "react";
import type { Config, Data } from "@puckeditor/core";
import { Studio } from "../src";
import { Type } from "lucide-react";

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
        <div style={{ textAlign: alignment as any, background: theme === "dark" ? "#1a1a1a" : "#fff", color: theme === "dark" ? "#fff" : "#000", padding: `${paddingTop}px 24px` }}>
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
          getItemSummary: (item: any) => item.label || "Item",
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
          getItemSummary: (item: any) => item.label || "Stat",
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
          {items.map((item: any, i: number) => (
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

export default function EditorPage() {
  const [data, setData] = React.useState<Data>(initialData);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Studio
        config={config}
        data={data}
        onPublish={(d) => {
          setData(d);
          console.log("Published:", d);
        }}
        onBack={() => console.log("back")}
        onChange={setData}
        aiHost="/api/puck-ai"
        className="flex-1 overflow-hidden"
      />
    </div>
  );
}
