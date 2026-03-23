import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import * as React from "react";
import { TextField } from "@/core/overrides/fields/types/TextField";

// ─── module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/core/overrides/fields/FieldWrapper", () => ({
  FieldLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/core/overrides/fields/AiButton", () => ({
  AiButton: ({
    onGenerate,
    ai,
  }: {
    ai: { instructions?: string };
    onGenerate: (v: string) => void;
  }) => (
    <button
      type="button"
      aria-label="Generate with AI"
      onClick={() => onGenerate("ai-value")}
      data-instructions={ai.instructions}
    />
  ),
}));

// ─── rendering ────────────────────────────────────────────────────────────────

describe("TextField — rendering", () => {
  it("renders an input with the given value", () => {
    render(<TextField value="hello" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("renders placeholder text", () => {
    render(<TextField value="" onChange={vi.fn()} placeholder="Type here..." />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("does not render AI button when field.ai is not provided", () => {
    render(<TextField value="" onChange={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: "Generate with AI" }),
    ).not.toBeInTheDocument();
  });

  it("renders AI button when field.ai is provided", () => {
    render(<TextField value="" onChange={vi.fn()} field={{ ai: {} }} />);
    expect(
      screen.getByRole("button", { name: "Generate with AI" }),
    ).toBeInTheDocument();
  });

  it("passes AI instructions to AiButton", () => {
    render(
      <TextField
        value=""
        onChange={vi.fn()}
        field={{ ai: { instructions: "write a title" } }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Generate with AI" }),
    ).toHaveAttribute("data-instructions", "write a title");
  });

  it("sets readOnly on the input", () => {
    render(<TextField value="locked" onChange={vi.fn()} readOnly />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });
});

// ─── debounce behavior ────────────────────────────────────────────────────────

describe("TextField — 200ms debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not call onChange immediately after typing", () => {
    const onChange = vi.fn();
    render(<TextField value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "a" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls onChange after 200ms with the latest value", () => {
    const onChange = vi.fn();
    render(<TextField value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "hello" } });

    act(() => { vi.advanceTimersByTime(200); });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("debounces rapid keystrokes into a single call", () => {
    const onChange = vi.fn();
    render(<TextField value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "a" } });
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.change(input, { target: { value: "ab" } });
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.change(input, { target: { value: "abc" } });

    act(() => { vi.advanceTimersByTime(200); });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("does not fire again if value hasn't changed since last commit", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TextField value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "x" } });
    act(() => { vi.advanceTimersByTime(200); });
    expect(onChange).toHaveBeenCalledOnce();

    // Simulate parent syncing back the committed value
    rerender(<TextField value="x" onChange={onChange} />);
    act(() => { vi.advanceTimersByTime(200); });
    expect(onChange).toHaveBeenCalledOnce();
  });
});

// ─── external value sync ──────────────────────────────────────────────────────

describe("TextField — external value sync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates local value when prop changes", () => {
    const { rerender } = render(<TextField value="initial" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("initial");

    rerender(<TextField value="updated" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("updated");
  });

  it("overrides pending local edits when prop changes", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TextField value="original" onChange={onChange} />);
    const input = screen.getByRole("textbox");

    // User starts typing but hasn't committed yet
    fireEvent.change(input, { target: { value: "originalX" } });
    expect(screen.getByRole("textbox")).toHaveValue("originalX");

    // Parent pushes a new value before the debounce fires
    rerender(<TextField value="server-value" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("server-value");

    // Debounce fires — should not emit the stale "originalX" edit
    act(() => { vi.advanceTimersByTime(200); });
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── AI button integration ────────────────────────────────────────────────────

describe("TextField — AI button onGenerate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onChange immediately (bypassing debounce) when AI generates", async () => {
    const onChange = vi.fn();
    render(<TextField value="" onChange={onChange} field={{ ai: {} }} />);
    const aiButton = screen.getByRole("button", { name: "Generate with AI" });

    // Use real-timer-safe click
    await act(async () => {
      aiButton.click();
    });

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("ai-value");
  });

  it("updates the input to show the AI-generated value", async () => {
    render(<TextField value="" onChange={vi.fn()} field={{ ai: {} }} />);
    const aiButton = screen.getByRole("button", { name: "Generate with AI" });

    await act(async () => {
      aiButton.click();
    });

    expect(screen.getByRole("textbox")).toHaveValue("ai-value");
  });

  it("does not fire a second onChange via debounce after AI generate", async () => {
    const onChange = vi.fn();
    render(<TextField value="" onChange={onChange} field={{ ai: {} }} />);
    const aiButton = screen.getByRole("button", { name: "Generate with AI" });

    await act(async () => {
      aiButton.click();
    });
    expect(onChange).toHaveBeenCalledOnce();

    act(() => { vi.advanceTimersByTime(200); });
    // Still only one call — lastCommittedValueRef prevents duplicate emit
    expect(onChange).toHaveBeenCalledOnce();
  });
});
