import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sliders, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Configuration } from "@shared/schema";

const thresholdSchema = z.object({
  low_risk_threshold: z.number().min(0).max(100),
  medium_risk_threshold: z.number().min(0).max(100),
  high_risk_threshold: z.number().min(0).max(100),
});

const fineSchema = z.object({
  base_fine: z.number().min(0),
  freezone_reduction: z.number().min(0).max(1),
});

type ThresholdFormData = z.infer<typeof thresholdSchema>;
type FineFormData = z.infer<typeof fineSchema>;

interface Statistics {
  totalAssessments: number;
  highRiskCompanies: number;
  configuredIndustries: number;
}

export default function ConfigurationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config } = useQuery<Configuration[]>({
    queryKey: ["/api/configuration"],
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const thresholdForm = useForm<ThresholdFormData>({
    resolver: zodResolver(thresholdSchema),
    defaultValues: {
      low_risk_threshold: 25,
      medium_risk_threshold: 50,
      high_risk_threshold: 75,
    },
  });

  const fineForm = useForm<FineFormData>({
    resolver: zodResolver(fineSchema),
    defaultValues: {
      base_fine: 30000,
      freezone_reduction: 0.25,
    },
  });

  // Set form values when config loads
  useState(() => {
    if (config) {
      const configMap = Object.fromEntries(
        config.map(item => [item.key, parseFloat(item.value)])
      );
      
      thresholdForm.reset({
        low_risk_threshold: configMap.low_risk_threshold || 25,
        medium_risk_threshold: configMap.medium_risk_threshold || 50,
        high_risk_threshold: configMap.high_risk_threshold || 75,
      });

      fineForm.reset({
        base_fine: configMap.base_fine || 30000,
        freezone_reduction: configMap.freezone_reduction || 0.25,
      });
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", "/api/configuration", { key, value });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Configuration updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/configuration"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive",
      });
    },
  });

  const onThresholdSubmit = async (data: ThresholdFormData) => {
    try {
      await Promise.all([
        updateConfigMutation.mutateAsync({ 
          key: "low_risk_threshold", 
          value: data.low_risk_threshold.toString() 
        }),
        updateConfigMutation.mutateAsync({ 
          key: "medium_risk_threshold", 
          value: data.medium_risk_threshold.toString() 
        }),
        updateConfigMutation.mutateAsync({ 
          key: "high_risk_threshold", 
          value: data.high_risk_threshold.toString() 
        }),
      ]);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const onFineSubmit = async (data: FineFormData) => {
    try {
      await Promise.all([
        updateConfigMutation.mutateAsync({ 
          key: "base_fine", 
          value: data.base_fine.toString() 
        }),
        updateConfigMutation.mutateAsync({ 
          key: "freezone_reduction", 
          value: data.freezone_reduction.toString() 
        }),
      ]);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Thresholds */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-bold text-gray-900">
            <Sliders className="h-5 w-5 text-primary-500 mr-2" />
            Risk Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...thresholdForm}>
            <form onSubmit={thresholdForm.handleSubmit(onThresholdSubmit)} className="space-y-4">
              <FormField
                control={thresholdForm.control}
                name="low_risk_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Risk (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={thresholdForm.control}
                name="medium_risk_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium Risk (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={thresholdForm.control}
                name="high_risk_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>High Risk (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                disabled={updateConfigMutation.isPending}
              >
                Update Thresholds
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Fine Structure */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-bold text-gray-900">
            <DollarSign className="h-5 w-5 text-primary-500 mr-2" />
            Fine Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...fineForm}>
            <form onSubmit={fineForm.handleSubmit(onFineSubmit)} className="space-y-4">
              <FormField
                control={fineForm.control}
                name="base_fine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Fine (AED)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Mainland Multiplier</span>
                <span className="font-semibold">1.0x</span>
              </div>
              <FormField
                control={fineForm.control}
                name="freezone_reduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freezone Reduction (0-1)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                disabled={updateConfigMutation.isPending}
              >
                Update Structure
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-bold text-gray-900">
            <BarChart3 className="h-5 w-5 text-primary-500 mr-2" />
            System Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Assessments:</span>
              <span className="font-semibold">{statistics?.totalAssessments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High Risk Companies:</span>
              <span className="font-semibold text-error-500">{statistics?.highRiskCompanies || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Configured Industries:</span>
              <span className="font-semibold">{statistics?.configuredIndustries || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
