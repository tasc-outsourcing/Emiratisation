import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Factory, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Industry } from "@shared/schema";

const industrySchema = z.object({
  name: z.string().min(1, "Industry name is required"),
  emiratisationRate: z.number().min(0).max(1, "Rate must be between 0 and 100%"),
  riskMultiplier: z.number().min(0.1, "Risk multiplier must be at least 0.1"),
});

type IndustryFormData = z.infer<typeof industrySchema>;

export default function IndustryManagementPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<IndustryFormData>({
    resolver: zodResolver(industrySchema),
    defaultValues: {
      name: "",
      emiratisationRate: 0,
      riskMultiplier: 1.0,
    },
  });

  const { data: industries, isLoading } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const createIndustryMutation = useMutation({
    mutationFn: async (data: IndustryFormData) => {
      const response = await apiRequest("POST", "/api/industries", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/industries"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create industry.",
        variant: "destructive",
      });
    },
  });

  const updateIndustryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: IndustryFormData }) => {
      const response = await apiRequest("PUT", `/api/industries/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/industries"] });
      setIsDialogOpen(false);
      setEditingIndustry(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update industry.",
        variant: "destructive",
      });
    },
  });

  const deleteIndustryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/industries/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/industries"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete industry.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IndustryFormData) => {
    if (editingIndustry) {
      updateIndustryMutation.mutate({ id: editingIndustry.id, data });
    } else {
      createIndustryMutation.mutate(data);
    }
  };

  const handleEdit = (industry: Industry) => {
    setEditingIndustry(industry);
    form.reset({
      name: industry.name,
      emiratisationRate: industry.emiratisationRate,
      riskMultiplier: industry.riskMultiplier,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this industry?")) {
      deleteIndustryMutation.mutate(id);
    }
  };

  const getRateBadgeColor = (rate: number) => {
    if (rate >= 0.04) return "bg-error-50 text-error-600";
    if (rate >= 0.02) return "bg-warning-50 text-warning-600";
    return "bg-success-50 text-success-600";
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl font-bold text-gray-900">
            <Factory className="h-5 w-5 text-primary-500 mr-3" />
            Industry Configuration
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingIndustry(null);
                  form.reset({
                    name: "",
                    emiratisationRate: 0,
                    riskMultiplier: 1.0,
                  });
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Industry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIndustry ? "Edit Industry" : "Add New Industry"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Banking & Finance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emiratisationRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emiratisation Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0.04"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="riskMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Multiplier</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createIndustryMutation.isPending || updateIndustryMutation.isPending}
                    >
                      {editingIndustry ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading industries...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Industry</TableHead>
                  <TableHead>Emiratisation %</TableHead>
                  <TableHead>Risk Multiplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {industries?.map((industry) => (
                  <TableRow key={industry.id}>
                    <TableCell>{industry.name}</TableCell>
                    <TableCell>
                      <Badge className={`${getRateBadgeColor(industry.emiratisationRate)}`}>
                        {(industry.emiratisationRate * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{industry.riskMultiplier}x</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(industry)}
                          className="text-primary-500 hover:text-primary-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(industry.id)}
                          className="text-error-500 hover:text-error-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
