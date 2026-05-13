// Code Component no Framer
// Cole esse arquivo em: Framer → Assets → Code → New File → cole aqui
// Depois aplica o Override `withCalculadoraTracking` por cima dele.

import * as React from "react"
import { useState, useMemo, useRef } from "react"

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

.cakto-calc * { box-sizing: border-box; margin: 0; padding: 0; }
.cakto-calc {
  --bg: #f4faf6;
  --surface: #ffffff;
  --surface-2: #f7fbf9;
  --border: #e6f0ea;
  --text: #0f1a14;
  --text-dim: #5b6b62;
  --text-mute: #8a9c93;
  --green: #1fbc5c;
  --green-bright: #1ed070;
  --green-dim: #15a04b;
  --green-tint: #e8f7ee;
  --green-glow: rgba(31, 188, 92, 0.14);
  font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text);
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: 28px;
  border: 1px solid var(--border);
  box-shadow: 0 24px 60px rgba(31, 188, 92, 0.08), 0 2px 8px rgba(15, 26, 20, 0.04);
  overflow: hidden;
}

.cakto-calc .header { padding: 28px 32px 4px; display: flex; align-items: center; gap: 14px; }
.cakto-calc .header-icon {
  width: 40px; height: 40px; border-radius: 12px; background: var(--green-tint);
  display: flex; align-items: center; justify-content: center;
  color: var(--green-dim); flex-shrink: 0;
}
.cakto-calc .header-title {
  font-size: 13px; font-weight: 700; letter-spacing: 1.4px;
  color: var(--green-dim); text-transform: uppercase;
}

.cakto-calc .inputs { padding: 20px 32px 24px; }
.cakto-calc .field { margin-bottom: 18px; }
.cakto-calc .field label {
  display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.3px;
  color: var(--text-dim); margin-bottom: 10px; text-transform: uppercase;
}
.cakto-calc .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
.cakto-calc .field-row .field { margin-bottom: 0; }

.cakto-calc .input-wrapper {
  position: relative; display: flex; align-items: center;
  background: var(--surface-2); border: 1.5px solid var(--border);
  border-radius: 14px; padding: 16px 18px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.cakto-calc .input-wrapper:focus-within {
  border-color: var(--green); background: var(--surface);
  box-shadow: 0 0 0 4px var(--green-glow);
}
.cakto-calc .input-wrapper .prefix,
.cakto-calc .input-wrapper .suffix {
  color: var(--text-mute); font-size: 20px; font-weight: 500; pointer-events: none;
}
.cakto-calc .input-wrapper .prefix { margin-right: 10px; }
.cakto-calc .input-wrapper .suffix { margin-left: 10px; }
.cakto-calc input[type="number"] {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--text); font-size: 24px; font-weight: 700;
  font-family: inherit; letter-spacing: -0.4px; min-width: 0; width: 100%;
}
.cakto-calc input::placeholder { color: var(--text-mute); font-weight: 600; }
.cakto-calc input[type="number"]::-webkit-outer-spin-button,
.cakto-calc input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cakto-calc input[type="number"] { -moz-appearance: textfield; }

.cakto-calc .stepper { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
.cakto-calc .stepper button {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--green-tint); border: none; color: var(--green-dim);
  font-size: 22px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  flex-shrink: 0; line-height: 1;
  font-family: inherit;
}
.cakto-calc .stepper button:hover:not(:disabled) { background: var(--green); color: #ffffff; }
.cakto-calc .stepper button:active:not(:disabled) { transform: scale(0.94); }
.cakto-calc .stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
.cakto-calc .stepper-value {
  flex: 1; text-align: center; font-size: 24px; font-weight: 700;
  color: var(--text); letter-spacing: -0.4px;
}

.cakto-calc .cta-primary, .cakto-calc .cta-activate {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 18px 24px; border: none; border-radius: 999px;
  background: var(--green); color: #ffffff;
  font-size: 16px; font-weight: 700; letter-spacing: -0.1px;
  font-family: inherit; cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease;
  box-shadow: 0 8px 22px rgba(31, 188, 92, 0.28);
}
.cakto-calc .cta-primary { margin-top: 6px; }
.cakto-calc .cta-activate { margin-top: 22px; }
.cakto-calc .cta-primary:hover, .cakto-calc .cta-activate:hover {
  background: var(--green-bright);
  box-shadow: 0 12px 28px rgba(31, 188, 92, 0.36);
}
.cakto-calc .cta-primary:active, .cakto-calc .cta-activate:active { transform: translateY(1px); }
.cakto-calc .arrow { font-size: 18px; line-height: 1; }

.cakto-calc .helper { font-size: 14px; color: var(--text-dim); text-align: center; margin-top: 16px; line-height: 1.5; }
.cakto-calc .divider { height: 1px; background: var(--border); margin: 4px 32px 0; }

.cakto-calc .results {
  padding: 24px 32px 28px;
  background: linear-gradient(180deg, rgba(232, 247, 238, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
}
.cakto-calc .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.cakto-calc .results-header .left { display: flex; align-items: center; gap: 10px; }
.cakto-calc .results-header .bolt { color: var(--green); display: inline-flex; align-items: center; }
.cakto-calc .results-header .title {
  font-size: 13px; font-weight: 700; letter-spacing: 1.4px;
  color: var(--green-dim); text-transform: uppercase;
}
.cakto-calc .refazer-link {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent; border: none; color: var(--text-dim);
  font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
  padding: 6px 10px; margin: -6px -10px; border-radius: 8px;
}
.cakto-calc .refazer-link:hover { color: var(--green-dim); background: var(--green-tint); }

.cakto-calc .result-block { margin-bottom: 22px; }
.cakto-calc .result-label {
  font-size: 11px; font-weight: 700; letter-spacing: 1.3px;
  color: var(--text-dim); margin-bottom: 10px; text-transform: uppercase;
}
.cakto-calc .result-label.green { color: var(--green-dim); }
.cakto-calc .result-value {
  font-size: 38px; font-weight: 700; color: var(--text);
  letter-spacing: -0.8px; line-height: 1.05; font-variant-numeric: tabular-nums;
}
.cakto-calc .result-value.big { font-size: 52px; color: var(--green); letter-spacing: -1.2px; }
.cakto-calc .result-sub { font-size: 14px; color: var(--text-dim); margin-top: 8px; line-height: 1.5; }
.cakto-calc .result-sub strong { color: var(--text); font-weight: 600; }
.cakto-calc .result-divider { height: 1px; background: var(--border); margin: 22px 0; }

@media (max-width: 560px) {
  .cakto-calc { border-radius: 22px; }
  .cakto-calc .header { padding: 22px 22px 4px; gap: 12px; }
  .cakto-calc .header-icon { width: 36px; height: 36px; }
  .cakto-calc .header-title { font-size: 12px; }
  .cakto-calc .inputs { padding: 16px 22px 20px; }
  .cakto-calc .divider { margin: 4px 22px 0; }
  .cakto-calc .results { padding: 20px 22px 22px; }
  .cakto-calc .field-row { grid-template-columns: 1fr; gap: 14px; }
  .cakto-calc .input-wrapper { padding: 14px 16px; }
  .cakto-calc .input-wrapper .prefix, .cakto-calc .input-wrapper .suffix { font-size: 18px; }
  .cakto-calc input[type="number"] { font-size: 20px; }
  .cakto-calc .stepper-value { font-size: 20px; }
  .cakto-calc .stepper button { width: 32px; height: 32px; font-size: 20px; }
  .cakto-calc .result-value { font-size: 30px; }
  .cakto-calc .result-value.big { font-size: 40px; }
  .cakto-calc .cta-primary, .cakto-calc .cta-activate { padding: 16px 22px; font-size: 15px; }
}
`

function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(isFinite(value) ? value : 0)
}

function parse(v: string): number {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 620
 * @framerIntrinsicHeight 760
 */
export default function CalculadoraCakto() {
  const [valor, setValor] = useState("")
  const [parcelas, setParcelas] = useState(10)
  const [taxaAdicional, setTaxaAdicional] = useState("")
  const resultsRef = useRef<HTMLDivElement>(null)

  const { total, parcela, extra } = useMemo(() => {
    const v = parse(valor)
    const ta = parse(taxaAdicional)
    const p = Math.max(1, parseInt(String(parcelas)) || 1)
    const totalCliente = v * (1 + ta / 100)
    return {
      total: totalCliente,
      parcela: totalCliente / p,
      extra: v * (ta / 100),
    }
  }, [valor, parcelas, taxaAdicional])

  const inc = () => setParcelas((p) => Math.min(12, p + 1))
  const dec = () => setParcelas((p) => Math.max(1, p - 1))

  const handleSimular = () => {
    const payload = {
      valor: parse(valor),
      parcelas: Math.max(1, parseInt(String(parcelas)) || 1),
      taxaAdicional: parse(taxaAdicional),
      total,
      extra,
    }
    try {
      window.postMessage({ type: "cakto:simulado", payload }, "*")
    } catch (e) {}
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleRefazer = () => {
    setValor("")
    setParcelas(10)
    setTaxaAdicional("")
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="cakto-calc">
        <div className="header">
          <div className="header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <line x1="8" y1="7" x2="16" y2="7" />
              <line x1="9" y1="12" x2="10" y2="12" />
              <line x1="14" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="10" y2="16" />
              <line x1="14" y1="16" x2="15" y2="16" />
            </svg>
          </div>
          <span className="header-title">Simule seu ganho</span>
        </div>

        <div className="inputs">
          <div className="field">
            <label>Valor da venda</label>
            <div className="input-wrapper">
              <span className="prefix">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="5.000,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Parcelas</label>
              <div className="input-wrapper">
                <div className="stepper">
                  <button type="button" onClick={dec} disabled={parcelas <= 1} aria-label="Diminuir parcelas">−</button>
                  <span className="stepper-value">{parcelas}x</span>
                  <button type="button" onClick={inc} disabled={parcelas >= 12} aria-label="Aumentar parcelas">+</button>
                </div>
              </div>
            </div>
            <div className="field">
              <label>Taxa adicional</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10,00"
                  value={taxaAdicional}
                  onChange={(e) => setTaxaAdicional(e.target.value)}
                />
                <span className="suffix">%</span>
              </div>
            </div>
          </div>

          <button type="button" className="cta-primary" onClick={handleSimular}>
            Simular meu ganho
            <span className="arrow">→</span>
          </button>

          <p className="helper">Veja em tempo real quanto de juros volta pra você em cada venda parcelada.</p>
        </div>

        <div className="divider" />

        <div className="results" ref={resultsRef}>
          <div className="results-header">
            <div className="left">
              <span className="bolt">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z" /></svg>
              </span>
              <span className="title">Resultado da simulação</span>
            </div>
            <button type="button" className="refazer-link" onClick={handleRefazer}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refazer
            </button>
          </div>

          <div className="result-block">
            <div className="result-label">Cliente final paga</div>
            <div className="result-value">{brl(total)}</div>
            <div className="result-sub">em {parcelas}x de <strong>{brl(parcela)}</strong></div>
          </div>

          <div className="result-divider" />

          <div className="result-block">
            <div className="result-label green">Você recebe a mais</div>
            <div className="result-value big">+ {brl(extra)}</div>
            <div className="result-sub">de margem nova pelo repasse da taxa adicional configurada.</div>
          </div>
        </div>
      </div>
    </>
  )
}
