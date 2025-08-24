import React, { useMemo, useRef, useState } from "react";

type Field =
  | { type: "text" | "date" | "file"; name: string; label: string; required?: boolean; placeholder?: string }
  | { type: "radio"; name: string; label: string; options: string[]; required?: boolean }
  | { type: "signature"; name: string; label: string; required?: boolean };

type Page =
  | { id: string; title?: string; fields: Field[]; next: string | { if: { when: string; go: string }[]; else: string } }
  | { id: string; type: "review"; title?: string; next: string };

type Schema = {
  id: string;
  title?: string;
  pages: Page[];
};

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...p }) => (
  <button {...p} className="btn">{children}</button>
);

const InputField: React.FC<{ f: Extract<Field, { type: "text" | "date" | "file" }>; v?: any; onChange: (v: any) => void }> = ({ f, v, onChange }) => (
  <label>
    {f.label}
    <input
      type={f.type}
      required={f.required}
      name={f.name}
      value={f.type === "file" ? undefined : v || ""}
      onChange={(e) => onChange(f.type === "file" ? (e.target as HTMLInputElement).files?.[0] : e.target.value)}
      className="input"
      placeholder={f.placeholder}
    />
  </label>
);

const RadioField: React.FC<{ f: Extract<Field, { type: "radio" }>; v?: any; onChange: (v: any) => void }> = ({ f, v, onChange }) => (
  <fieldset>
    <legend>{f.label}</legend>
    {f.options.map((opt) => (
      <label key={opt}>
        <input type="radio" name={f.name} value={opt} checked={v === opt} onChange={() => onChange(opt)} required={f.required} />
        {opt}
      </label>
    ))}
  </fieldset>
);

const SignatureField: React.FC<{ f: Extract<Field, { type: "signature" }>; v?: string; onChange: (v: string) => void }> = ({ f, v, onChange }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const draw = (x: number, y: number) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const start = (x: number, y: number) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };

  const stop = () => {
    drawing.current = false;
    if (ref.current) onChange(ref.current.toDataURL("image/png"));
  };

  return (
    <label>
      {f.label}
      <canvas
        ref={ref}
        width={320}
        height={120}
        className="sig"
        onMouseDown={(e) => start(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
        onMouseMove={(e) => drawing.current && draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
        onMouseUp={stop}
        onMouseLeave={stop}
        aria-label={f.label}
      />
      {v ? <img alt="signature preview" src={v} /> : null}
      <Btn type="button" onClick={() => { const ctx = ref.current?.getContext("2d"); if (ctx && ref.current) { ctx.clearRect(0,0,ref.current.width, ref.current.height); onChange(""); }}}>Clear</Btn>
    </label>
  );
};

const evaluate = (expr: string, data: Record<string, any>, pageId: string) => {
  // extremely small, safe-ish eval (string equality & page)
  try {
    const sanitized = expr
      .replaceAll("==", "===")
      .replaceAll("page", JSON.stringify(pageId))
      .replaceAll(/\b([a-zA-Z_]\w*)\b/g, (_, k) => JSON.stringify(data[k] ?? ""));
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${sanitized});`)();
  } catch { return false; }
};

export default function Wizard({ schema }: { schema: Schema }) {
  const [data, setData] = useState<Record<string, any>>({});
  const [pageId, setPageId] = useState(schema.pages[0].id);

  const page = useMemo(() => schema.pages.find(p => p.id === pageId)!, [schema, pageId]);

  const setField = (name: string, value: any) => setData(d => ({ ...d, [name]: value }));

  const goNext = () => {
    if ("type" in page && page.type === "review") {
      // submit event hooks here
      setPageId((page as any).next);
      return;
    }
    const next = (page as any).next;
    if (typeof next === "string") return setPageId(next);
    for (const rule of next.if) {
      if (evaluate(rule.when, data, page.id)) return setPageId(rule.go);
    }
    setPageId(next.else);
  };

  const goBack = () => {
    // minimal back: go to previous in array
    const idx = schema.pages.findIndex(p => p.id === pageId);
    if (idx > 0) setPageId(schema.pages[idx - 1].id);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); goNext(); }}>
      {("type" in page && page.type === "review")
        ? (
          <>
            <h2>{page.title || "Review"}</h2>
            <dl>
              {Object.entries(data).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{typeof v === "string" ? v : "[object]"}</dd></div>
              ))}
            </dl>
          </>
        )
        : (
          <>
            {page.title ? <h2>{page.title}</h2> : null}
            {("fields" in page ? page.fields : []).map((f: Field) => {
              const v = data[(f as any).name];
              if (f.type === "text" || f.type === "date" || f.type === "file")
                return <InputField key={(f as any).name} f={f as any} v={v} onChange={(nv) => setField((f as any).name, nv)} />;
              if (f.type === "radio")
                return <RadioField key={f.name} f={f as any} v={v} onChange={(nv) => setField(f.name, nv)} />;
              if (f.type === "signature")
                return <SignatureField key={f.name} f={f as any} v={v} onChange={(nv) => setField(f.name, nv)} />;
              return null;
            })}
          </>
        )
      }
      <nav>
        <Btn type="button" onClick={goBack}>Back</Btn>
        <Btn type="submit">Next</Btn>
      </nav>
    </form>
  );
}

/* Minimal CSS (1 class per component)
.btn { padding: .5rem 1rem; background:#005eb8; color:#fff; border:0; border-radius:.25rem; }
.input { display:block; margin:.5rem 0; padding:.5rem; border:1px solid #ccc; border-radius:.25rem; }
.sig { display:block; border:1px dashed #666; margin:.5rem 0; background:#fff; }
*/
