/* Calculator — main product UI with FIRE, SIP, NPS, Combined */
const { useState: useStateC, useMemo: useMemoC, useEffect: useEffectC } = React;
const { formatINR, fvLumpsum, fvMonthlySIP, fireCorpus, npsProjection } = window.PieFmt;

function ResultNumber({ amount, rupee = true, suffix }) {
  const s = formatINR(amount);
  return (
    <span>
      {rupee && <span className="rupee">₹</span>}{s}{suffix && <span className="unit" style={{marginLeft:8,fontSize:14}}>{suffix}</span>}
    </span>
  );
}

function FIREPanel({ inputs, setInputs }) {
  return (
    <>
      <div className="panel-head">
        <h3>Your FIRE plan</h3>
        <span className="badge">4% rule</span>
      </div>
      <Slider
        label="Current age"
        value={inputs.age} min={22} max={55} step={1}
        onChange={v => setInputs({ ...inputs, age: Math.min(v, inputs.fireAge - 5) })}
        format={v => v} suffix="yrs"
        ticks={["22", "30", "38", "55"]}
      />
      <Slider
        label="Target retirement age"
        help="When you want financial independence"
        value={inputs.fireAge} min={Math.max(inputs.age + 5, 35)} max={70} step={1}
        onChange={v => setInputs({ ...inputs, fireAge: v })}
        format={v => v} suffix="yrs"
      />
      <Slider
        label="Monthly expense today"
        help="Your current lifestyle cost"
        value={inputs.monthlyExpense} min={10000} max={500000} step={5000}
        onChange={v => setInputs({ ...inputs, monthlyExpense: v })}
        format={v => "₹" + formatINR(v)}
      />
      <Slider
        label="Inflation"
        value={inputs.inflation} min={2} max={12} step={0.5}
        onChange={v => setInputs({ ...inputs, inflation: v })}
        format={v => v.toFixed(1)} suffix="%"
      />
      <Slider
        label="Expected portfolio return"
        value={inputs.returnRate} min={6} max={20} step={0.5}
        onChange={v => setInputs({ ...inputs, returnRate: v })}
        format={v => v.toFixed(1)} suffix="%"
      />
    </>
  );
}

function SIPPanel({ inputs, setInputs }) {
  return (
    <>
      <div className="panel-head">
        <h3>SIP contribution</h3>
        <span className="badge">Equity MF</span>
      </div>
      <Slider
        label="Monthly SIP amount"
        help="Systematic investment in equity mutual funds"
        value={inputs.sip} min={500} max={200000} step={500}
        onChange={v => setInputs({ ...inputs, sip: v })}
        format={v => "₹" + formatINR(v)}
      />
      <Slider
        label="Annual step-up"
        help="Increase your SIP as your income grows"
        value={inputs.stepUp} min={0} max={25} step={1}
        onChange={v => setInputs({ ...inputs, stepUp: v })}
        format={v => v} suffix="%"
      />
      <Slider
        label="Existing investments"
        value={inputs.existing} min={0} max={20000000} step={50000}
        onChange={v => setInputs({ ...inputs, existing: v })}
        format={v => "₹" + formatINR(v)}
      />
      <Slider
        label="Equity return (CAGR)"
        value={inputs.returnRate} min={6} max={20} step={0.5}
        onChange={v => setInputs({ ...inputs, returnRate: v })}
        format={v => v.toFixed(1)} suffix="%"
      />
    </>
  );
}

function NPSPanel({ inputs, setInputs }) {
  return (
    <>
      <div className="panel-head">
        <h3>NPS contribution</h3>
        <span className="badge">80CCD(1B)</span>
      </div>
      <Slider
        label="Monthly NPS"
        help="Tier 1, auto choice"
        value={inputs.nps} min={500} max={100000} step={500}
        onChange={v => setInputs({ ...inputs, nps: v })}
        format={v => "₹" + formatINR(v)}
      />
      <Slider
        label="Equity allocation"
        help="Rest goes into corporate bonds & G-sec"
        value={inputs.npsEquity} min={0} max={75} step={5}
        onChange={v => setInputs({ ...inputs, npsEquity: v })}
        format={v => v} suffix="%"
      />
      <Slider
        label="Annuity rate"
        help="Conservative pension from 40% annuity corpus"
        value={inputs.annuityRate} min={3} max={9} step={0.5}
        onChange={v => setInputs({ ...inputs, annuityRate: v })}
        format={v => v.toFixed(1)} suffix="%"
      />
      <Slider
        label="Years to age 60"
        value={Math.max(1, 60 - inputs.age)} min={1} max={38} step={1}
        onChange={() => {}}
        format={v => v} suffix="yrs"
      />
    </>
  );
}

/* ------- Results panels ------- */

function FIREResults({ inputs, r }) {
  const safeWithdraw = r.targetCorpus * 0.04 / 12;
  return (
    <>
      <div className="result-hero">
        <div className="label">Corpus required at {inputs.fireAge}</div>
        <div className="number"><ResultNumber amount={r.targetCorpus} /></div>
        <div className="sub">
          That's the inflation-adjusted nest egg to generate ₹{formatINR(r.annualExpenseAtFire/12)}/mo
          forever at a 4% safe withdrawal rate — your number to stop trading time for money.
        </div>
      </div>
      <div className="result-grid">
        <div className="result-cell">
          <div className="k">Years to freedom</div>
          <div className="v">{inputs.fireAge - inputs.age}<span className="unit">yrs</span></div>
          <div className="d">From age {inputs.age}</div>
        </div>
        <div className="result-cell">
          <div className="k">Monthly need</div>
          <div className="v">₹{formatINR(r.annualExpenseAtFire/12)}</div>
          <div className="d">At {inputs.inflation}% inflation</div>
        </div>
        <div className="result-cell">
          <div className="k">SIP to hit this</div>
          <div className="v">₹{formatINR(r.requiredSIP)}</div>
          <div className="d">Monthly, alone</div>
        </div>
      </div>
      <div style={{padding: "28px 0 4px"}}>
        <div className="eyebrow" style={{marginBottom: 12}}>Safe monthly withdrawal at FIRE</div>
        <div style={{fontFamily:"var(--serif)", fontSize:36, letterSpacing:"-0.01em"}}>
          <span style={{color:"var(--gold)",fontStyle:"italic"}}>₹</span>{formatINR(safeWithdraw)}
          <span style={{fontFamily:"var(--sans)",fontSize:13,color:"var(--ink-mute)",marginLeft:10,letterSpacing:"0.1em",textTransform:"uppercase"}}>per month, forever</span>
        </div>
      </div>
    </>
  );
}

function SIPResults({ inputs, r }) {
  return (
    <>
      <div className="result-hero">
        <div className="label">Projected corpus at {inputs.fireAge}</div>
        <div className="number"><ResultNumber amount={r.sipCorpus + r.existingFV} /></div>
        <div className="sub">
          ₹{formatINR(inputs.sip)}/mo SIP with {inputs.stepUp}% annual step-up, compounded
          at {inputs.returnRate}% over {inputs.fireAge - inputs.age} years. Step-ups alone add
          ~₹{formatINR(r.stepUpBonus)} to your corpus.
        </div>
      </div>
      <div className="result-grid">
        <div className="result-cell">
          <div className="k">Total invested</div>
          <div className="v">₹{formatINR(r.totalInvested)}</div>
          <div className="d">Your contribution</div>
        </div>
        <div className="result-cell">
          <div className="k">Wealth gained</div>
          <div className="v">₹{formatINR(r.sipCorpus - r.totalInvested + r.existingFV - inputs.existing)}</div>
          <div className="d">The compounding</div>
        </div>
        <div className="result-cell">
          <div className="k">Multiplier</div>
          <div className="v">{(r.sipCorpus / Math.max(r.totalInvested,1)).toFixed(1)}<span className="unit">x</span></div>
          <div className="d">On invested capital</div>
        </div>
      </div>
      <GrowthChart years={inputs.fireAge - inputs.age} sip={inputs.sip} stepUp={inputs.stepUp} rate={inputs.returnRate/100} existing={inputs.existing} />
    </>
  );
}

function NPSResults({ inputs, r }) {
  return (
    <>
      <div className="result-hero">
        <div className="label">NPS corpus at 60</div>
        <div className="number"><ResultNumber amount={r.nps.corpus} /></div>
        <div className="sub">
          60% withdrawable as lumpsum, 40% mandatory annuity. Plus an extra ₹50,000/yr tax
          deduction under 80CCD(1B) on top of 80C — effectively a ~30% return in year one.
        </div>
      </div>
      <div className="result-grid">
        <div className="result-cell">
          <div className="k">Tax-free lumpsum</div>
          <div className="v">₹{formatINR(r.nps.lumpsum)}</div>
          <div className="d">60% at age 60</div>
        </div>
        <div className="result-cell">
          <div className="k">Monthly pension</div>
          <div className="v">₹{formatINR(r.nps.monthlyPension)}</div>
          <div className="d">From annuity</div>
        </div>
        <div className="result-cell">
          <div className="k">Tax saved / yr</div>
          <div className="v">₹{formatINR(Math.min(inputs.nps*12, 50000) * 0.3)}</div>
          <div className="d">At 30% slab</div>
        </div>
      </div>
      <div style={{padding: "28px 0 4px"}}>
        <div className="eyebrow" style={{marginBottom: 14}}>Contribution vs. growth</div>
        <Stack total={r.nps.corpus} segments={[
          { label: "Invested", val: inputs.nps * 12 * (60 - inputs.age), color: "#8A7A66" },
          { label: "Compounded", val: r.nps.corpus - inputs.nps * 12 * (60 - inputs.age), color: "#D4A574" },
        ]} />
      </div>
    </>
  );
}

function CombinedResults({ inputs, r }) {
  const total = r.sipCorpus + r.existingFV + r.nps.lumpsum;
  const gap = Math.max(0, r.targetCorpus - total);
  const pct = Math.min(100, (total / r.targetCorpus) * 100);
  const surplus = total - r.targetCorpus;

  return (
    <>
      <div className="result-hero">
        <div className="label">Progress toward your FIRE number</div>
        <div className="radial-wrap">
          <RadialGauge value={pct} />
          <div className="labels">
            <div className="pct">{pct.toFixed(1)}<span style={{fontSize:28,color:"var(--ink-mute)"}}>%</span></div>
            <div className="status">
              {pct >= 100
                ? <>You'll overshoot by <b style={{color:"var(--gold)"}}>₹{formatINR(surplus)}</b>. Consider retiring 2–3 years earlier, or upgrading your lifestyle target.</>
                : <>You're on track for <b style={{color:"var(--ink)"}}>₹{formatINR(total)}</b> against a target of <b>₹{formatINR(r.targetCorpus)}</b>. Close the gap or slide your FIRE age.</>
              }
            </div>
          </div>
        </div>
      </div>

      <div style={{padding: "28px 0 4px"}}>
        <div className="eyebrow" style={{marginBottom: 14}}>How you get there</div>
        <Stack total={Math.max(total, 1)} segments={[
          { label: "SIP", val: r.sipCorpus, color: "#D4A574" },
          { label: "Existing", val: r.existingFV, color: "#A47846" },
          { label: "NPS", val: r.nps.lumpsum, color: "#6B4F32" },
        ]} showLegend />
      </div>

      <div style={{padding: "28px 0 0", borderTop:"1px solid var(--line)", marginTop: 24}}>
        <div className="eyebrow" style={{marginBottom: 14}}>Gap analysis</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div>
            <div style={{fontFamily:"var(--serif)",fontSize:40,letterSpacing:"-0.02em",color: gap>0 ? "var(--ink)" : "var(--gold)"}}>
              {gap > 0 ? "₹" + formatINR(gap) : "Covered"}
            </div>
            <div style={{fontSize:12,color:"var(--ink-mute)",letterSpacing:"0.15em",textTransform:"uppercase",marginTop:6}}>
              {gap > 0 ? "Shortfall at target age" : "You're past the number"}
            </div>
          </div>
          {gap > 0 && (
            <div>
              <div style={{fontFamily:"var(--serif)",fontSize:40,letterSpacing:"-0.02em"}}>
                +₹{formatINR(gapToMonthly(gap, inputs.returnRate/100, inputs.fireAge - inputs.age))}
              </div>
              <div style={{fontSize:12,color:"var(--ink-mute)",letterSpacing:"0.15em",textTransform:"uppercase",marginTop:6}}>
                Extra monthly SIP needed
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function gapToMonthly(gap, r, years) {
  const m = r/12; const n = years*12;
  if (m === 0) return gap/n;
  return gap / (((Math.pow(1+m,n)-1)/m) * (1+m));
}

/* ------- Small chart primitives ------- */

function Stack({ total, segments, showLegend }) {
  return (
    <>
      <div className="stack">
        {segments.map((s, i) => (
          <div key={i} className="stack-seg" style={{ flex: Math.max(0.0001, s.val), background: s.color }}>
            {(s.val / total) >= 0.12 ? s.label : ""}
          </div>
        ))}
      </div>
      {showLegend && (
        <div className="stack-legend">
          {segments.map((s, i) => (
            <div key={i} className="item">
              <div className="k"><span className="dot" style={{background:s.color}}></span>{s.label}</div>
              <div className="v">₹{formatINR(s.val)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function RadialGauge({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  const R = 90, C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A47846"/>
          <stop offset="100%" stopColor="#E9C99A"/>
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(245,240,232,0.08)" strokeWidth="2"/>
      <circle cx="100" cy="100" r={R} fill="none"
        stroke="url(#gold-grad)" strokeWidth="2.5"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round"
        filter="url(#glow)"
        transform="rotate(-90 100 100)"
        style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }}
      />
      {[0,25,50,75].map(t => {
        const a = (t/100) * Math.PI * 2 - Math.PI/2;
        const x1 = 100 + Math.cos(a) * (R + 10);
        const y1 = 100 + Math.sin(a) * (R + 10);
        return <circle key={t} cx={x1} cy={y1} r="1" fill="rgba(245,240,232,0.3)"/>;
      })}
    </svg>
  );
}

function GrowthChart({ years, sip, stepUp, rate, existing }) {
  const data = useMemoC(() => {
    const out = [];
    let invested = existing;
    let corpus = existing;
    let m = sip;
    for (let y = 0; y <= years; y++) {
      out.push({ y, corpus, invested });
      const monthlyRate = rate/12;
      for (let mo = 0; mo < 12; mo++) {
        corpus = corpus * (1 + monthlyRate) + m;
        invested += m;
      }
      m *= 1 + stepUp/100;
    }
    return out;
  }, [years, sip, stepUp, rate, existing]);

  const maxY = Math.max(...data.map(d => d.corpus));
  const W = 800, H = 240, PAD_L = 0, PAD_R = 0, PAD_T = 16, PAD_B = 28;

  const xFor = (i) => PAD_L + (i / years) * (W - PAD_L - PAD_R);
  const yFor = (v) => PAD_T + (1 - v/maxY) * (H - PAD_T - PAD_B);

  const pathCorpus = data.map((d,i) => `${i===0?"M":"L"} ${xFor(i)} ${yFor(d.corpus)}`).join(" ");
  const pathInvested = data.map((d,i) => `${i===0?"M":"L"} ${xFor(i)} ${yFor(d.invested)}`).join(" ");
  const areaCorpus = `${pathCorpus} L ${xFor(years)} ${H-PAD_B} L ${xFor(0)} ${H-PAD_B} Z`;

  return (
    <div className="chart">
      <div className="eyebrow" style={{marginBottom: 14}}>Wealth timeline</div>
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,165,116,0.25)"/>
            <stop offset="100%" stopColor="rgba(212,165,116,0)"/>
          </linearGradient>
        </defs>
        {[0.25,0.5,0.75].map(g => (
          <line key={g} x1="0" x2={W} y1={PAD_T + g*(H-PAD_T-PAD_B)} y2={PAD_T + g*(H-PAD_T-PAD_B)}
            stroke="rgba(245,240,232,0.05)" strokeDasharray="2 4"/>
        ))}
        <path d={areaCorpus} fill="url(#area-grad)"/>
        <path d={pathInvested} fill="none" stroke="rgba(245,240,232,0.25)" strokeWidth="1.5" strokeDasharray="3 4"/>
        <path d={pathCorpus} fill="none" stroke="#D4A574" strokeWidth="2"/>
        <circle cx={xFor(years)} cy={yFor(data[data.length-1].corpus)} r="4" fill="#D4A574"/>
        <circle cx={xFor(years)} cy={yFor(data[data.length-1].corpus)} r="10" fill="#D4A574" opacity="0.2"/>
        {[0, Math.floor(years/2), years].map(y => (
          <text key={y} x={xFor(y)} y={H - 8} fontSize="10" fontFamily="JetBrains Mono, monospace"
            fill="rgba(245,240,232,0.4)" letterSpacing="1.5"
            textAnchor={y===0 ? "start" : y===years ? "end" : "middle"}>
            YR {y}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        <div className="item"><div className="swatch" style={{background:"#D4A574"}}/>Corpus</div>
        <div className="item"><div className="swatch" style={{background:"rgba(245,240,232,0.25)", borderTop:"1px dashed rgba(245,240,232,0.5)"}}/>Invested</div>
      </div>
    </div>
  );
}

window.PieCalc = { FIREPanel, SIPPanel, NPSPanel, FIREResults, SIPResults, NPSResults, CombinedResults };
