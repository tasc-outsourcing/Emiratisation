import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building, GraduationCap, User, Calculator } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Industry, Assessment } from "@shared/schema";

const formSchema = z.object({
  industryId: z.number({
    required_error: "Please select an industry",
  }),
  jurisdiction: z.enum(["mainland", "freezone"], {
    required_error: "Please select a jurisdiction",
  }),
  skilledEmployees: z.number().min(0, "Must be 0 or greater"),
  unskilledEmployees: z.number().min(0, "Must be 0 or greater"),
  currentEmirates: z.number().min(0, "Must be 0 or greater").default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CompanyDetailsFormProps {
  onAssessmentComplete: (assessment: Assessment) => void;
}

export default function CompanyDetailsForm({ onAssessmentComplete }: CompanyDetailsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skilledEmployees: 0,
      unskilledEmployees: 0,
      currentEmirates: 0,
    },
  });

  const { data: industries, isLoading: industriesLoading } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return await response.json();
    },
    onSuccess: (assessment: Assessment) => {
      toast({
        title: "Assessment Complete",
        description: "Risk assessment has been calculated successfully.",
      });
      onAssessmentComplete(assessment);
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to calculate risk assessment.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (data.skilledEmployees + data.unskilledEmployees === 0) {
      toast({
        title: "Validation Error",
        description: "Total number of employees must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    createAssessmentMutation.mutate(data);
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
          <Building className="h-6 w-6 text-primary-500 mr-3" />
          Company Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="industryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Sector</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={industriesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries?.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id.toString()}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select jurisdiction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mainland">UAE Mainland</SelectItem>
                        <SelectItem value="freezone">Free Zone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="skilledEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Skilled Employees</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>Professionals, managers, specialists</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unskilledEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Unskilled Employees</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>Support staff, manual workers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currentEmirates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Number of Emirati Employees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Current Emirati nationals in your workforce</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createAssessmentMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 font-medium"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {createAssessmentMutation.isPending ? "Calculating..." : "Calculate Risk Level"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
