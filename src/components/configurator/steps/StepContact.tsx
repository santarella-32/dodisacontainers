import { MapPin } from "lucide-react";
import type { ContainerConfig, Timeline } from "../types";
import type { Action } from "../reducer";

const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "imediato", label: "O mais rápido possível" },
  { value: "30dias", label: "Até 30 dias" },
  { value: "30-60dias", label: "30 a 60 dias" },
  { value: "60mais", label: "60+ dias" },
  { value: "pesquisando", label: "Apenas pesquisando" },
];

export default function StepContact({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const { customer, deliveryLocation } = config;

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Seus dados</h3>
      <p className="text-zinc-500 text-xs mb-4">Para enviarmos o orçamento completo pelo WhatsApp</p>
      <p className="text-[10px] font-mono text-zinc-600 mb-6">
        Seus dados não são compartilhados · Resposta em até 15 min
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="cfg-name" className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Nome / Empresa
          </label>
          <input
            id="cfg-name" type="text" value={customer.name}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { name: e.target.value } })}
            placeholder="Ex: João Silva" autoFocus
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="cfg-phone" className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            WhatsApp
          </label>
          <input
            id="cfg-phone" type="tel" value={customer.phone}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { phone: e.target.value } })}
            placeholder="(51) 99999-9999"
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cfg-city" className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">Cidade</label>
            <div className="relative">
              <input
                id="cfg-city" type="text" value={deliveryLocation.city}
                onChange={(e) => dispatch({ type: "SET_LOCATION", location: { city: e.target.value, detected: false } })}
                placeholder="Porto Alegre"
                className="w-full py-3.5 pl-9 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
              />
              <MapPin className="absolute left-3 top-4 w-4 h-4 text-zinc-600" />
            </div>
          </div>
          <div>
            <label htmlFor="cfg-state" className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Estado {deliveryLocation.detected && <span className="text-brand-yellow normal-case font-normal">(GPS)</span>}
            </label>
            <input
              id="cfg-state" type="text" value={deliveryLocation.state}
              onChange={(e) => dispatch({ type: "SET_LOCATION", location: { state: e.target.value, detected: false } })}
              placeholder="RS"
              className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cfg-email" className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            E-mail <span className="text-zinc-700 normal-case font-normal">(opcional)</span>
          </label>
          <input
            id="cfg-email" type="email" value={customer.email}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { email: e.target.value } })}
            placeholder="voce@empresa.com"
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="cfg-obs" className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Observação <span className="text-zinc-700 normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            id="cfg-obs" value={customer.observation} rows={2}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { observation: e.target.value } })}
            placeholder="Algum detalhe importante do seu projeto?"
            className="w-full py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Você precisa deste projeto para quando?
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => dispatch({ type: "SET_CUSTOMER", customer: { timeline: opt.value } })}
                aria-pressed={customer.timeline === opt.value}
                className={`text-left py-2.5 px-3.5 min-h-[40px] rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  customer.timeline === opt.value
                    ? "border-brand-yellow bg-brand-yellow/10 text-white"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
