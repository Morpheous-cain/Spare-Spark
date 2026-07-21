"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Car, Trash2, Edit, ChevronRight, Loader2, X } from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
} from "@/lib/animations"

const supabase = createClient()

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    reg_number: "",
    make: "",
    model: "",
    year: "",
    color: "",
    is_default: false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchVehicles() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userVehicles } = await supabase
        .from("vehicles")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (userVehicles) setVehicles(userVehicles)
      setLoading(false)
    }
    fetchVehicles()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.location.reload()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (formData.is_default) {
      await supabase
        .from("vehicles")
        .update({ is_default: false })
        .eq("owner_id", user.id)
    }

    const { error } = await supabase
      .from("vehicles")
      .insert({ ...formData, owner_id: user.id })

    if (!error) {
      setShowAddForm(false)
      setFormData({ reg_number: "", make: "", model: "", year: "", color: "", is_default: false })
      window.location.reload()
    }
    setSubmitting(false)
  }

  const deleteVehicle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    const { error } = await supabase.from("vehicles").delete().eq("id", id)
    if (!error) {
      setVehicles(prev => prev.filter(v => v.id !== id))
    }
  }

  const setDefaultVehicle = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("vehicles")
      .update({ is_default: false })
      .eq("owner_id", user.id)

    await supabase.from("vehicles").update({ is_default: true }).eq("id", id)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-primary border-t-transparent mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Vehicles</h1>
          <p className="text-slate-400">Manage your registered vehicles</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </motion.div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddForm(false) }}
        >
          <div className="bg-obsidian-surface rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-border shadow-card-elev">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100">Add New Vehicle</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg_number" className="text-slate-300">Registration Number</Label>
                <Input
                  id="reg_number"
                  value={formData.reg_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, reg_number: e.target.value.toUpperCase() }))}
                  placeholder="KCA 123A"
                  required
                  className="border-slate-border bg-obsidian-bg text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                />
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-slate-300">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                    placeholder="Toyota"
                    required
                    className="border-slate-border bg-obsidian-bg text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-slate-300">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Premio"
                    required
                    className="border-slate-border bg-obsidian-bg text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                  />
                </div>
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-slate-300">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2019"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                    className="border-slate-border bg-obsidian-bg text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-slate-300">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Silver"
                    className="border-slate-border bg-obsidian-bg text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="h-4 w-4 text-amber-primary rounded border-slate-border focus:ring-amber-primary/20 bg-obsidian-bg"
                />
                <Label htmlFor="is_default" className="text-sm text-slate-300">Set as default vehicle</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-slate-border text-slate-300 hover:bg-slate-700/40"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Vehicle"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicles.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardEntrance}
            className="col-span-full text-center py-12 bg-obsidian-surface rounded-2xl border border-slate-border shadow-card-elev"
          >
            <Car className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No vehicles added yet</h3>
            <p className="text-slate-400 mb-6">Add your first vehicle to book services faster</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </motion.div>
        ) : (
          vehicles.map((vehicle) => (
            <motion.div key={vehicle.id} variants={cardEntrance} className="relative">
              <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev h-full flex flex-col">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setDefaultVehicle(vehicle.id)}
                    disabled={vehicle.is_default}
                    className={cn(
                      "p-2 rounded-lg text-sm transition-colors",
                      vehicle.is_default
                        ? "bg-emerald-500/15 text-emerald-300 cursor-default"
                        : "bg-slate-700/40 text-slate-300 hover:bg-slate-700"
                    )}
                  >
                    {vehicle.is_default ? "Default ✓" : "Set Default"}
                  </button>
                  <button
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-slate-400">{vehicle.year} • {vehicle.color}</p>
                    </div>
                    {vehicle.is_default && (
                      <Badge className="bg-emerald-500/15 text-emerald-300">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{vehicle.reg_number}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-slate-border text-slate-300 hover:bg-slate-700/40" onClick={() => setShowAddForm(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteVehicle(vehicle.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}