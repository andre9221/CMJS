import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { FieldDef } from "@/lib/supabase-helpers";

interface DynamicFormProps {
  fields: FieldDef[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  title: string;
  loading?: boolean;
}

export function DynamicForm({ fields, onSubmit, title, loading }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Clean up empty strings to null
      const cleaned: Record<string, any> = {};
      for (const [k, v] of Object.entries(formData)) {
        cleaned[k] = v === '' ? null : v;
      }
      await onSubmit(cleaned);
      setFormData({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-indigo-200">
          <Plus className="h-6 w-6 text-indigo-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <Label htmlFor={field.name} className="text-base font-semibold mb-2 block text-zinc-300">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.type === 'select' ? (
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(v) => handleChange(field.name, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder || ''}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  placeholder={field.placeholder || ''}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="md:col-span-2 flex justify-end pt-2">
            <Button type="submit" disabled={submitting || loading} className="font-semibold tracking-wide px-8">
              {submitting ? 'Adding...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
