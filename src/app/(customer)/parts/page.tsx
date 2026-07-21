"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Truck, Package, CreditCard, ChevronRight, Loader2, Filter } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
} from "@/lib/animations"

const supabase = createClient()

const partsCategories = [
  "All",
  "Brakes",
  "Engine",
  "Suspension",
  "Electrical",
  "Body",
  "Fluids",
  "Filters",
]

const mockParts = [
  { id: "1", name: "Brake Pads (Front)", brand: "Bosch", category: "Brakes", price: 2500, stock: 45, compatible: ["Toyota", "Nissan", "Mazda", "Honda"], image: null },
  { id: "2", name: "Car Battery 12V 60Ah", brand: "VARTA", category: "Electrical", price: 8500, stock: 23, compatible: ["Toyota", "Nissan", "Mazda", "Honda", "Subaru"], image: null },
  { id: "3", name: "Air Filter", brand: "K&N", category: "Filters", price: 1200, stock: 67, compatible: ["Toyota", "Nissan", "Mazda", "Honda"], image: null },
  { id: "4", name: "Engine Oil 5W-30 5L", brand: "Shell Helix", category: "Fluids", price: 3800, stock: 89, compatible: ["All"], image: null },
  { id: "5", name: "Shock Absorber (Rear)", brand: "KYB", category: "Suspension", price: 4500, stock: 12, compatible: ["Toyota", "Nissan"], image: null },
  { id: "6", name: "Spark Plugs (Set of 4)", brand: "NGK", category: "Electrical", price: 1800, stock: 34, compatible: ["Toyota", "Nissan", "Honda"], image: null },
  { id: "7", name: "Brake Disc (Front)", brand: "Brembo", category: "Brakes", price: 5200, stock: 18, compatible: ["Toyota", "Mazda"], image: null },
  { id: "8", name: "Cabin Air Filter", brand: "Mann-Filter", category: "Filters", price: 950, stock: 56, compatible: ["Toyota", "Nissan", "Honda", "Mazda"], image: null },
  { id: "9", name: "Coolant/Antifreeze 5L", brand: "Prestone", category: "Fluids", price: 1500, stock: 78, compatible: ["All"], image: null },
  { id: "10", name: "Wiper Blades (Pair)", brand: "Bosch", category: "Body", price: 1200, stock: 45, compatible: ["All"], image: null },
  { id: "11", name: "Timing Belt Kit", brand: "Gates", category: "Engine", price: 6800, stock: 8, compatible: ["Toyota", "Nissan"], image: null },
  { id: "12", name: "Clutch Kit", brand: "Exedy", category: "Engine", price: 12500, stock: 5, compatible: ["Toyota", "Honda"], image: null },
]

export default function PartsPage() {
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [cart, setCart] = useState<Record<string, number>>({})

  useEffect(() => {
    setParts(mockParts)
    setLoading(false)
  }, [])

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(search.toLowerCase()) ||
      part.brand.toLowerCase().includes(search.toLowerCase()) ||
      part.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "All" || part.category === category
    return matchesSearch && matchesCategory
  })

  const addToCart = (partId: string) => {
    setCart(prev => ({ ...prev, [partId]: (prev[partId] || 0) + 1 }))
  }

  const removeFromCart = (partId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[partId] > 1) {
        newCart[partId] -= 1
      } else {
        delete newCart[partId]
      }
      return newCart
    })
  }

  const getCartCount = () => Object.values(cart).reduce((a, b) => a + b, 0)
  const getCartTotal = () => Object.entries(cart).reduce((sum, [id, qty]) => {
    const part = parts.find(p => p.id === id)
    return sum + (part ? part.price * qty : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-obsidian-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Spare Parts Marketplace</h1>
              <p className="text-slate-400">Genuine parts delivered to your door or mechanic</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-amber-burst text-white shadow-amber-glow hover:opacity-90">
                  <Package className="h-5 w-5" />
                </Button>
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </div>
              {getCartCount() > 0 && (
                <Link href="/customer/cart" className="text-sm font-medium text-amber-glow hover:underline flex items-center gap-1">
                  Cart: {formatCurrency(getCartTotal())} <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search parts by name, brand, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 border-slate-border bg-obsidian-bg text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {partsCategories.map(cat => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-xl",
                    category === cat ? "bg-amber-burst text-white border-slate-border" : "border-slate-border text-slate-300 hover:bg-slate-700/40"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Parts Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-0 bg-obsidian-surface border-slate-border rounded-2xl shadow-card-elev">
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="aspect-square bg-slate-700/40 rounded-xl" />
                    <div className="h-4 bg-slate-700/40 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/40 rounded w-1/2" />
                    <div className="h-5 bg-slate-700/40 rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredParts.length === 0 ? (
          <motion.div initial="hidden" animate="visible" className="text-center py-16 bg-obsidian-surface rounded-2xl border border-slate-border shadow-card-elev">
            <Package className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No parts found</h3>
            <p className="text-slate-400">Try adjusting your search or filter</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredParts.map((part, index) => (
              <motion.div key={part.id} variants={cardEntrance} style={{ transitionDelay: `${index * 0.05}s` }}>
                <Card className="group bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev hover:shadow-amber-glow transition-all duration-200 h-full flex flex-col">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    {/* Part Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-amber-primary/20 to-amber-glow/20 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                      <Package className="h-12 w-12 text-amber-primary" />
                      {part.stock < 10 && (
                        <Badge className="absolute top-2 right-2 bg-amber-primary text-white text-[10px]">Low Stock</Badge>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-700/40 text-slate-300">{part.category}</Badge>
                        <span className="text-xs text-slate-400">{part.brand}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 mb-1 line-clamp-1">{part.name}</h3>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-1">Fits: {part.compatible.join(", ")}</p>

                      <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-border">
                        <span className="text-lg font-bold text-amber-glow tabular-nums">{formatCurrency(part.price)}</span>
                        <Button
                          size="sm"
                          className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 gap-1.5 rounded-xl min-h-[56px]"
                          onClick={() => addToCart(part.id)}
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cart Summary (bottom sheet on mobile) */}
        {getCartCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 md:relative md:static md:opacity-100 md:translate-y-0 bg-obsidian-surface border-t border-slate-border p-4 md:p-0 shadow-lg md:shadow-none z-50"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-burst flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-100">{getCartCount()} item{getCartCount() > 1 ? "s" : ""} in cart</p>
                  <p className="text-sm text-slate-400">Total: <span className="font-bold text-amber-glow">{formatCurrency(getCartTotal())}</span></p>
                </div>
              </div>
              <Link href="/customer/cart">
                <Button className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 w-full md:w-auto rounded-xl min-h-[56px]" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}