"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createService, updateService } from "@/lib/queries";
import type { Service } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a positive number"),
  duration: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 5, "Minimum 5 minutes"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  businessId: string;
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ businessId, service, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description || "",
          price: String(service.price),
          duration: String(service.duration),
        }
      : { price: "0", duration: "30" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
      };
      if (service) {
        await updateService(service.id, payload);
        toast.success("Service updated");
      } else {
        await createService({ ...payload, business_id: businessId, is_available: true });
        toast.success("Service created");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save service");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" placeholder="e.g. Haircut & Style" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Describe the service..." rows={3} {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" type="number" min="5" step="5" {...register("duration")} />
          {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : service ? "Update Service" : "Create Service"}
        </Button>
      </div>
    </form>
  );
}
