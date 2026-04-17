"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface AssetFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  sectors: any[]
}

export function AssetForm({ initialData, onSubmit, onCancel, sectors }: AssetFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    tag: initialData?.tag || "",
    name: initialData?.name || "",
    type: initialData?.type || "Notebook",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    status: initialData?.status || "DISPONIVEL",
    criticality: initialData?.criticality || "MEDIA",
    sectorId: initialData?.sectorId || "",
    notes: initialData?.notes || ""
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const selectClassName = "flex h-9 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Tag</label>
          <Input
            placeholder="Ex: TI-001"
            required
            value={formData.tag}
            onChange={e => setFormData({...formData, tag: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Nome</label>
          <Input
            placeholder="Ex: Notebook Dell Inspiron"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Tipo</label>
          <select
            className={selectClassName}
            style={{background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)"}}
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="Notebook">Notebook</option>
            <option value="Desktop">Desktop</option>
            <option value="Servidor">Servidor</option>
            <option value="Monitor">Monitor</option>
            <option value="Smartphone">Smartphone</option>
            <option value="Switch">Switch</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Marca</label>
          <Input
            placeholder="Ex: Dell"
            required
            value={formData.brand}
            onChange={e => setFormData({...formData, brand: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Modelo</label>
          <Input
            placeholder="Ex: Inspiron 15 3000"
            required
            value={formData.model}
            onChange={e => setFormData({...formData, model: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Setor</label>
          <select
            className={selectClassName}
            style={{background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)"}}
            value={formData.sectorId}
            onChange={e => setFormData({...formData, sectorId: e.target.value})}
            required
          >
            <option value="">Selecione um setor...</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Status</label>
          <select
            className={selectClassName}
            style={{background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)"}}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="DISPONIVEL">Disponível</option>
            <option value="EM_USO">Em Uso</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="DESCARTADO">Descartado</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Criticidade</label>
          <select
            className={selectClassName}
            style={{background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)"}}
            value={formData.criticality}
            onChange={e => setFormData({...formData, criticality: e.target.value})}
          >
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Observações</label>
        <textarea
          placeholder="Notas e observações sobre o ativo..."
          className="flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 placeholder:text-[var(--input-placeholder)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 resize-none"
          style={{background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--input-text)"}}
          onFocus={(e) => {
            e.currentTarget.style.background = "var(--input-bg-focus)"
            e.currentTarget.style.borderColor = "var(--input-border-focus)"
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = "var(--input-bg)"
            e.currentTarget.style.borderColor = "var(--input-border)"
          }}
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/50">
        <Button variant="ghost" type="button" onClick={onCancel} className="text-zinc-400 hover:text-zinc-200">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {initialData ? "Atualizar" : "Criar"} Ativo
        </Button>
      </div>
    </form>
  )
}
