"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Wrench,
  Calendar,
  User,
  Building2,
  Cpu,
  Globe,
  HardDrive,
  Monitor,
  Smartphone,
  Server,
  Laptop,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"
import { AssetForm } from "@/components/features/assets/AssetForm"
import { AssetQRCode } from "@/components/features/assets/AssetQRCode"

interface AssetDetail {
  id: string
  name: string
  tag: string
  type: string
  brand: string
  model: string
  serialNumber?: string | null
  patrimony?: string | null
  ipAddress?: string | null
  hostname?: string | null
  operatingSystem?: string | null
  status: string
  criticality: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
  } | null
  sector?: {
    id: string
    name: string
  } | null
}

interface Maintenance {
  id: string
  problem: string
  description?: string | null
  status: string
  technician: string
  cost?: number | null
  startDate: string
  endDate?: string | null
}

const getAssetIcon = (type: string) => {
  switch (type) {
    case "Notebook":
      return <Laptop className="h-5 w-5" />
    case "Smartphone":
      return <Smartphone className="h-5 w-5" />
    case "Servidor":
      return <Server className="h-5 w-5" />
    case "Monitor":
      return <Monitor className="h-5 w-5" />
    default:
      return <Monitor className="h-5 w-5 opacity-40" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DISPONIVEL":
      return "success"
    case "EM_USO":
      return "default"
    case "EM_MANUTENCAO":
      return "warning"
    default:
      return "secondary"
  }
}

const getMaintenanceStatusColor = (status: string) => {
  switch (status) {
    case "CONCLUIDO":
      return "success"
    case "EM_PROGRESSO":
      return "default"
    case "PENDENTE":
      return "warning"
    case "CANCELADO":
      return "destructive"
    default:
      return "secondary"
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const quickAction = searchParams.get("quick")
  const isMaintenance = quickAction === "maintenance"

  const [asset, setAsset] = React.useState<AssetDetail | null>(null)
  const [maintenances, setMaintenances] = React.useState<Maintenance[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = React.useState(isMaintenance)
  const [sectors, setSectors] = React.useState<any[]>([])

  const fetchAssetDetail = React.useCallback(async () => {
    try {
      const [assetRes, maintenanceRes, sectorsRes] = await Promise.all([
        fetch(`/api/assets/${assetId}`),
        fetch(`/api/maintenances?assetId=${assetId}`),
        fetch(`/api/sectors`),
      ])

      if (assetRes.ok) {
        const assetData = await assetRes.json()
        setAsset(assetData)
      }

      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json()
        setMaintenances(Array.isArray(maintenanceData) ? maintenanceData : [])
      }

      if (sectorsRes.ok) {
        const sectorsData = await sectorsRes.json()
        setSectors(Array.isArray(sectorsData) ? sectorsData : [])
      }
    } catch (error) {
      console.error("Error fetching asset details:", error)
    } finally {
      setLoading(false)
    }
  }, [assetId])

  React.useEffect(() => {
    fetchAssetDetail()
  }, [fetchAssetDetail])

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este ativo?")) return

    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/assets")
      }
    } catch (error) {
      console.error("Error deleting asset:", error)
    }
  }

  const handleUpdate = async (data: any) => {
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        setIsEditModalOpen(false)
        fetchAssetDetail()
      }
    } catch (error) {
      console.error("Error updating asset:", error)
    }
  }

  const handleCreateMaintenance = async (data: any) => {
    try {
      const res = await fetch("/api/maintenances", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          assetId,
        }),
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        setIsMaintenanceModalOpen(false)
        fetchAssetDetail()
      }
    } catch (error) {
      console.error("Error creating maintenance:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-lg" style={{ color: "var(--text-tertiary)" }}>
          Ativo não encontrado
        </p>
        <Button onClick={() => router.push("/assets")} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos Ativos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/assets")}
          className="w-fit"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="p-4 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--bg-tertiary)" }}
            >
              {getAssetIcon(asset.type)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                {asset.name}
              </h1>
              <div className="flex flex-col gap-2 mt-3">
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {asset.type} • {asset.brand} {asset.model}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={getStatusColor(asset.status) as any} className="text-xs font-semibold">
                    {asset.status === "DISPONIVEL"
                      ? "Disponível"
                      : asset.status === "EM_USO"
                        ? "Em Uso"
                        : asset.status === "EM_MANUTENCAO"
                          ? "Em Manutenção"
                          : asset.status}
                  </Badge>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: "rgba(37, 99, 235, 0.15)", color: "#3b82f6" }}>
                    {asset.tag}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setIsEditModalOpen(true)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button onClick={() => setIsMaintenanceModalOpen(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Manutenção
            </Button>
            <Button onClick={handleDelete} variant="outline" size="sm" style={{ color: "var(--status-error)" }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Informações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Marca
              </p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {asset.brand}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Modelo
              </p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {asset.model}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Número de Série
              </p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {asset.serialNumber || "—"}
              </p>
            </div>

            {asset.ipAddress && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Endereço IP
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {asset.ipAddress}
                  </p>
                  <button
                    onClick={() => copyToClipboard(asset.ipAddress!)}
                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Copy className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                  </button>
                </div>
              </div>
            )}

            {asset.hostname && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Hostname
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {asset.hostname}
                  </p>
                  <button
                    onClick={() => copyToClipboard(asset.hostname!)}
                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Copy className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                  </button>
                </div>
              </div>
            )}

            {asset.operatingSystem && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Sistema Operacional
                </p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {asset.operatingSystem}
                </p>
              </div>
            )}

            {asset.sector && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Setor
                </p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {asset.sector.name}
                </p>
              </div>
            )}

            {asset.user && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Responsável
                </p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {asset.user.name}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Criticidade
              </p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                {asset.criticality}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Data de Criação
              </p>
              <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                {new Date(asset.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Última Atualização
              </p>
              <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                {new Date(asset.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {asset.notes && (
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-primary)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>
                Observações
              </p>
              <p style={{ color: "var(--text-secondary)" }}>{asset.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code */}
      <AssetQRCode
        assetId={asset.id}
        assetName={asset.name}
        assetTag={asset.tag}
      />

      {/* Maintenance History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Histórico de Manutenção
            </CardTitle>
            <CardDescription style={{ color: "var(--text-tertiary)" }}>
              {maintenances.length} {maintenances.length === 1 ? "registro" : "registros"}
            </CardDescription>
          </div>
          <Button onClick={() => setIsMaintenanceModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Manutenção
          </Button>
        </CardHeader>
        <CardContent>
          {maintenances.length > 0 ? (
            <div className="space-y-3">
              {maintenances.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="p-4 rounded-lg border"
                  style={{ background: "var(--bg-muted)", borderColor: "var(--border-primary)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {maintenance.problem}
                        </p>
                        <Badge
                          variant={getMaintenanceStatusColor(maintenance.status) as any}
                          className="text-xs font-semibold"
                        >
                          {maintenance.status === "CONCLUIDO"
                            ? "Concluído"
                            : maintenance.status === "EM_PROGRESSO"
                              ? "Em Progresso"
                              : maintenance.status === "PENDENTE"
                                ? "Pendente"
                                : "Cancelado"}
                        </Badge>
                      </div>
                      {maintenance.description && (
                        <p className="text-sm mb-3" style={{ color: "var(--text-tertiary)" }}>
                          {maintenance.description}
                        </p>
                      )}
                      <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          <span>Técnico: {maintenance.technician}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Início: {new Date(maintenance.startDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {maintenance.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              Conclusão: {new Date(maintenance.endDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}
                        {maintenance.cost && (
                          <div className="flex items-center gap-2">
                            <span>Custo: R$ {maintenance.cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: "var(--text-tertiary)" }}>
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma manutenção registrada</p>
              <Button
                onClick={() => setIsMaintenanceModalOpen(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar Manutenção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Ativo"
      >
        <AssetForm
          initialData={asset}
          sectors={sectors}
          onCancel={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdate}
        />
      </Modal>

      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Nova Manutenção"
      >
        <MaintenanceForm
          onCancel={() => setIsMaintenanceModalOpen(false)}
          onSubmit={handleCreateMaintenance}
        />
      </Modal>
    </div>
  )
}

function MaintenanceForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = React.useState({
    problem: "",
    description: "",
    status: "PENDENTE",
    technician: "",
    cost: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Problema
        </label>
        <input
          type="text"
          required
          value={formData.problem}
          onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--input-text)",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border"
          rows={3}
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--input-text)",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--input-text)",
          }}
        >
          <option value="PENDENTE">Pendente</option>
          <option value="EM_PROGRESSO">Em Progresso</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Técnico Responsável
        </label>
        <input
          type="text"
          required
          value={formData.technician}
          onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--input-text)",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Custo (opcional)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--input-text)",
          }}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Manutenção</Button>
      </div>
    </form>
  )
}
