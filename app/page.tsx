"use client";
import * as React from "react";
import type { Config, Data } from "@puckeditor/core";
import { Studio } from "../src/components/editor/Studio";
import { Text, Type } from "lucide-react";

// Sample Puck config exercising all field types
const config: Config = {
  components: {
    Hero: {
      fields: {
        title: {
          type: "text",
          label: "Title",
          labelIcon: <Type className="w-3 h-3" />,
          ai: {
            instructions: "Always use caps",
          },
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
        <div
          style={{
            paddingTop,
            textAlign: alignment as "left" | "center" | "right",
            background: theme === "dark" ? "#1a1a1a" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            padding: `${paddingTop}px 24px`,
          }}
        >
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
          arrayFields: {
            label: { type: "text", label: "Label" },
          },
          getItemSummary: (item: any) => item.label || "Item",
          label: "Items",
        },
      },
      defaultProps: {
        heading: "Card Title",
        body: "<p>Card body content</p>",
        items: [],
      },
      render: ({ heading, body }) => (
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 16,
            margin: 8,
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: body }} />
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
        onChange={setData}
        aiHost="/api/puck-ai"
        className="flex-1 overflow-hidden"
      />
    </div>
  );
}
