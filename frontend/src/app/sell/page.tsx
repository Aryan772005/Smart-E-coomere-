"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tag, Package, DollarSign, MapPin, ArrowRight, CheckCircle2, ImagePlus, X, Upload } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/config/env";
import { tokenStorage } from "@/services/http";

interface Category { id: number; name: string; slug: string; }

const CONDITIONS = [
  { value: "new", label: "New", desc: "Never used, original packaging" },
  { value: "like-new", label: "Like New", desc: "Used a few times, no visible wear" },
  { value: "excellent", label: "Excellent", desc: "Minor signs of use, works perfectly" },
  { value: "good", label: "Good", desc: "Some visible wear, fully functional" },
  { value: "fair", label: "Fair", desc: "Noticeable wear, works as expected" },
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function SellPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    original_price: "",
    condition: "excellent",
    listing_type: "fixed",
    category_id: "",
    brand: "",
    model: "",
    year: "",
    city: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/sell");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(apiUrl("/api/v1/marketplace/categories/"));
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const items = data.results || data;
        if (Array.isArray(items) && items.length > 0) {
          setCategories(items);
        } else {
          throw new Error("Empty categories");
        }
      } catch {
        setCategories([
          { id: 1, name: "Smartphones", slug: "smartphones" },
          { id: 2, name: "Laptops", slug: "laptops" },
          { id: 3, name: "Gaming", slug: "gaming" },
          { id: 4, name: "Audio", slug: "audio" },
          { id: 5, name: "Cameras", slug: "cameras" },
          { id: 6, name: "Wearables", slug: "wearables" },
          { id: 7, name: "Tablets", slug: "tablets" },
          { id: 8, name: "Appliances", slug: "appliances" },
        ]);
      }
    }
    fetchCategories();
  }, []);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Image handling
  const addImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of fileArray) {
      if (selectedImages.length + validFiles.length >= MAX_IMAGES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addImages(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description || !form.price || !form.condition || !form.category_id) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = tokenStorage.getAccess();

      // Step 1: Create the product listing
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        condition: form.condition,
        listing_type: form.listing_type,
        category_id: parseInt(form.category_id),
      };
      if (form.original_price) payload.original_price = parseFloat(form.original_price);
      if (form.brand) payload.brand = form.brand;
      if (form.model) payload.model = form.model;
      if (form.year) payload.year = parseInt(form.year);
      if (form.city) payload.city = form.city;

      setUploadProgress("Creating listing...");

      const res = await fetch(apiUrl("/api/v1/marketplace/products/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = Object.values(err).flat().join(", ") as string;
        throw new Error(msg || "Failed to create listing.");
      }

      const data = await res.json();

      // Step 2: Upload images if any
      if (selectedImages.length > 0) {
        setUploadProgress(`Uploading ${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""}...`);

        const formData = new FormData();
        selectedImages.forEach((file) => {
          formData.append("images", file);
        });

        const imgRes = await fetch(apiUrl(`/api/v1/marketplace/products/${data.slug}/images/`), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!imgRes.ok) {
          // Product created but images failed — still proceed
          console.warn("Image upload failed, but product was created.");
        }
      }

      setUploadProgress("");
      setSuccess(true);
      setTimeout(() => router.push(`/products/${data.slug}`), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle2 className="h-20 w-20 text-success" />
          </motion.div>
          <h2 className="mt-6 text-2xl font-extrabold">Listing created!</h2>
          <p className="mt-2 text-muted-foreground">Redirecting you to your product page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-page py-8 max-w-4xl">
        {/* Seller Hero Banner with Storefront Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 overflow-hidden rounded-3xl bg-amber-400 p-6 md:p-8 shadow-lg border border-amber-500/50"
        >
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <span className="inline-block rounded-full bg-slate-950 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300 shadow-sm">
                Tariani Verified Seller Hub
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                Open Your Store & Sell Instantly
              </h1>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                List pre-owned phones, laptops, and gadgets to thousands of buyers across India. Enjoy zero listing fees and secure Escrow payouts!
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-slate-900 shadow-sm">
                  ⚡ Instant Valuation
                </span>
                <span className="rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-amber-300">
                  🔒 Doorstep Pickup & Escrow Protection
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-2 shadow-2xl border-2 border-slate-950 transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/seller_hero_banner.jpg"
                  alt="Tariani Sellers Open Your Store Showcase"
                  className="h-auto w-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Photo Upload Section */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <ImagePlus className="h-4 w-4 text-brand" /> Product Photos
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (up to {MAX_IMAGES} images, max 5MB each)
              </span>
            </h2>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all ${
                isDragging
                  ? "border-brand bg-brand-soft scale-[1.02]"
                  : "border-border hover:border-brand/50 hover:bg-muted/50"
              } ${selectedImages.length >= MAX_IMAGES ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground">
                {isDragging ? "Drop your images here" : "Click or drag images here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP • Max 5MB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) addImages(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted"
                  >
                    <img
                      src={preview}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-brand-foreground uppercase">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-danger/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Basic Info */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Tag className="h-4 w-4 text-brand" /> Basic Information
            </h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Title <span className="text-danger">*</span></label>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. iPhone 14 Pro Max 256GB"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Category <span className="text-danger">*</span></label>
              <select
                name="category_id"
                required
                value={form.category_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Description <span className="text-danger">*</span></label>
              <textarea
                name="description"
                required
                rows={5}
                placeholder="Describe your item — age, usage, included accessories, any defects..."
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
              />
            </div>
          </section>

          {/* Condition */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Package className="h-4 w-4 text-brand" /> Condition <span className="text-danger text-sm">*</span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {CONDITIONS.map((c) => (
                <label
                  key={c.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all ${
                    form.condition === c.value
                      ? "border-brand bg-brand-soft"
                      : "border-border hover:border-brand/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c.value}
                    checked={form.condition === c.value}
                    onChange={handleChange}
                    className="mt-0.5 accent-brand"
                  />
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <DollarSign className="h-4 w-4 text-brand" /> Pricing
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Asking Price (₹) <span className="text-danger">*</span></label>
                <input
                  name="price"
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 35000"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Original Price (₹) <span className="text-muted-foreground text-xs">(optional)</span></label>
                <input
                  name="original_price"
                  type="number"
                  min="1"
                  placeholder="e.g. 79900"
                  value={form.original_price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Listing Type</label>
              <div className="flex gap-3">
                {[
                  { value: "fixed", label: "Fixed Price" },
                  { value: "negotiable", label: "Negotiable" },
                ].map((lt) => (
                  <label
                    key={lt.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm transition-all ${
                      form.listing_type === lt.value ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/30"
                    }`}
                  >
                    <input type="radio" name="listing_type" value={lt.value} checked={form.listing_type === lt.value} onChange={handleChange} className="hidden" />
                    {lt.label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Extra Details */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4 text-brand" /> Additional Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Brand</label>
                <input name="brand" type="text" placeholder="Apple, Samsung..." value={form.brand} onChange={handleChange} className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Model</label>
                <input name="model" type="text" placeholder="iPhone 14, Galaxy S23..." value={form.model} onChange={handleChange} className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Year</label>
                <input name="year" type="number" min="2000" max={new Date().getFullYear()} placeholder="2023" value={form.year} onChange={handleChange} className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">City</label>
                <input name="city" type="text" placeholder="Mumbai, Delhi..." value={form.city} onChange={handleChange} className="w-full rounded-xl border border-input bg-background py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
            </div>
          </section>

          {uploadProgress && (
            <div className="rounded-xl bg-brand-soft border border-brand/30 px-4 py-3 text-sm font-semibold text-brand flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              {uploadProgress}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            loadingText="Publishing..."
            rightIcon={<ArrowRight className="h-5 w-5" />}
          >
            Publish Listing
          </Button>
        </form>
      </div>
    </div>
  );
}
