/* Slider component — tactile premium slider with editable value input */
const { useState, useRef, useCallback, useEffect } = React;

// Parse user-typed shorthand: "50L", "1.2cr", "₹40,000", "35%", "5 yrs"
function parseUserInput(str) {
  if (typeof str !== "string") return NaN;
  let s = str.trim().toLowerCase().replace(/[₹,\s]/g, "");
  if (!s) return NaN;
  let mult = 1;
  if (s.endsWith("cr")) { mult = 1e7; s = s.slice(0, -2); }
  else if (s.endsWith("l")) { mult = 1e5; s = s.slice(0, -1); }
  else if (s.endsWith("k")) { mult = 1e3; s = s.slice(0, -1); }
  else if (s.endsWith("%")) { s = s.slice(0, -1); }
  else if (s.endsWith("yrs")) { s = s.slice(0, -3); }
  else if (s.endsWith("yr")) { s = s.slice(0, -2); }
  const n = parseFloat(s);
  if (isNaN(n)) return NaN;
  return n * mult;
}

function Slider({ label, help, value, min, max, step = 1, onChange, format, ticks, suffix }) {
  const trackRef = useRef(null);
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const setFromClientX = useCallback((clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    let v = min + p * (max - min);
    if (step) v = Math.round(v / step) * step;
    v = Math.max(min, Math.min(max, v));
    onChange(v);
  }, [min, max, step, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(x);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, setFromClientX]);

  const onDown = (e) => {
    if (editing) return;
    setDragging(true);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setFromClientX(x);
  };

  const beginEdit = () => {
    setDraft(String(value));
    setEditing(true);
    requestAnimationFrame(() => {
      if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
    });
  };

  const commit = () => {
    const n = parseUserInput(draft);
    if (!isNaN(n)) {
      let v = n;
      if (step) v = Math.round(v / step) * step;
      v = Math.max(min, Math.min(max, v));
      onChange(v);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const onKey = (e) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = parseUserInput(draft);
      if (!isNaN(n)) setDraft(String(Math.min(max, n + (step || 1))));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = parseUserInput(draft);
      if (!isNaN(n)) setDraft(String(Math.max(min, n - (step || 1))));
    }
  };

  return (
    <div className="slider-row">
      <div>
        <div className="slider-label">{label}</div>
        {help && <div className="slider-help">{help}</div>}
      </div>
      <div className={"slider-value" + (editing ? " editing" : "")} onClick={!editing ? beginEdit : undefined}>
        {editing ? (
          <input
            ref={inputRef}
            className="slider-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
          />
        ) : (
          <>
            {format ? format(value) : value}
            {suffix && <span className="unit">{suffix}</span>}
          </>
        )}
      </div>
      <div className="slider-track-wrap">
        <div
          ref={trackRef}
          className="slider-track"
          onMouseDown={onDown}
          onTouchStart={onDown}
        >
          <div className="slider-fill" style={{ width: (pct * 100) + "%" }} />
          <div className="slider-thumb" style={{ left: (pct * 100) + "%" }} />
        </div>
        {ticks && (
          <div className="slider-ticks">
            {ticks.map((t, i) => <span key={i}>{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

window.Slider = Slider;
