import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Settings, BarChart3, Download, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/footer";
import type { Assessment, Configuration } from "@shared/schema";

const authSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const configSchema = z.object({
  emiratisationTargetPercent: z.number().min(1).max(100),
  finePerEmirati: z.number().min(1),
});

type AuthFormData = z.infer<typeof authSchema>;
type ConfigFormData = z.infer<typeof configSchema>;

interface Statistics {
  totalAssessments: number;
  highRiskAssessments: number;
  mediumRiskAssessments: number;
  lowRiskAssessments: number;
  totalFines: number;
  averageRiskScore: number;
  sectorBreakdown: Record<string, number>;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authForm = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { password: "" },
  });

  const configForm = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      emiratisationTargetPercent: 8,
      finePerEmirati: 96000,
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: AuthFormData) => {
      const response = await apiRequest("POST", "/api/admin/auth", data);
      return await response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({ title: "Authentication successful" });
    },
    onError: () => {
      toast({
        title: "Authentication failed",
        description: "Invalid password",
        variant: "destructive",
      });
    },
  });

  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
    enabled: isAuthenticated,
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/admin/statistics"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: config } = useQuery<Configuration[]>({
    queryKey: ["/api/configuration"],
    enabled: isAuthenticated,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", "/api/configuration", { key, value });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Configuration updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/configuration"] });
    },
    onError: () => {
      toast({
        title: "Configuration update failed",
        variant: "destructive",
      });
    },
  });

  const onAuthSubmit = (data: AuthFormData) => {
    authMutation.mutate(data);
  };

  const onConfigSubmit = async (data: ConfigFormData) => {
    try {
      await Promise.all([
        updateConfigMutation.mutateAsync({
          key: "emiratisation_target_percent",
          value: data.emiratisationTargetPercent.toString(),
        }),
        updateConfigMutation.mutateAsync({
          key: "fine_per_emirati",
          value: data.finePerEmirati.toString(),
        }),
      ]);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const exportData = () => {
    if (!assessments) return;

    const csvData = assessments.map(assessment => ({
      id: assessment.id,
      company: assessment.companyName,
      email: assessment.email,
      phone: assessment.phone,
      sector: assessment.industrySector,
      location: assessment.companyLocation,
      totalEmployees: assessment.totalEmployees,
      skilledEmployees: assessment.skilledEmployees,
      emiratiEmployees: assessment.emiratiEmployees,
      requiredEmirates: assessment.requiredEmirates,
      gap: assessment.gap,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      fineEstimate: assessment.fineEstimate,
      createdAt: assessment.createdAt,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emiratisation-assessments-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update form when config loads
  useEffect(() => {
    if (config) {
      const configMap = Object.fromEntries(
        config.map(item => [item.key, parseFloat(item.value)])
      );
      
      configForm.reset({
        emiratisationTargetPercent: configMap.emiratisation_target_percent || 8,
        finePerEmirati: configMap.fine_per_emirati || 96000,
      });
    }
  }, [config, configForm]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md card-tasc">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl font-bold text-tasc-primary">
              <Lock className="h-6 w-6 mr-2" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...authForm}>
              <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                <FormField
                  control={authForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={authMutation.isPending}
                >
                  {authMutation.isPending ? "Authenticating..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-tasc-primary text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">TASC Emiratisation - Admin Panel</h1>
          <p className="text-tasc-lightblue mt-2">Manage system configuration and view analytics</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Cards */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="card-tasc">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-tasc-primary">
                    {statistics?.totalAssessments || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Assessments</p>
                </CardContent>
              </Card>
              
              <Card className="card-tasc">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {statistics?.highRiskAssessments || 0}
                  </div>
                  <p className="text-sm text-gray-600">High Risk</p>
                </CardContent>
              </Card>
              
              <Card className="card-tasc">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-tasc-teal">
                    AED {(statistics?.totalFines || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Potential Fines</p>
                </CardContent>
              </Card>
              
              <Card className="card-tasc">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-tasc-primary">
                    {statistics?.averageRiskScore || 0}
                  </div>
                  <p className="text-sm text-gray-600">Avg Risk Score</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Configuration */}
          <Card className="lg:col-span-2 card-tasc">
            <CardHeader>
              <CardTitle className="flex items-center text-tasc-primary">
                <Settings className="h-5 w-5 mr-2" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-4">
                  <FormField
                    control={configForm.control}
                    name="emiratisationTargetPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emiratisation Target (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={configForm.control}
                    name="finePerEmirati"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine Per Missing Emirati (AED)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 96000)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full btn-primary"
                    disabled={updateConfigMutation.isPending}
                  >
                    {updateConfigMutation.isPending ? "Updating..." : "Update Configuration"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-tasc">
            <CardHeader>
              <CardTitle className="flex items-center text-tasc-primary">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={exportData}
                className="w-full btn-primary"
                disabled={!assessments || assessments.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              
              <div className="text-sm text-gray-600">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Medium Risk:</span>
                    <span className="font-semibold">{statistics?.mediumRiskAssessments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Risk:</span>
                    <span className="font-semibold">{statistics?.lowRiskAssessments || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Assessments */}
          <Card className="lg:col-span-3 card-tasc">
            <CardHeader>
              <CardTitle className="text-tasc-primary">Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Total Employees</TableHead>
                      <TableHead>Skilled Employees</TableHead>
                      <TableHead>Emirati Employees</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Fine Estimate</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments?.slice(0, 10).map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.companyName}</TableCell>
                        <TableCell>
                          <div>
                            <div>{assessment.firstName} {assessment.lastName}</div>
                            <div className="text-sm text-gray-500">{assessment.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{assessment.companyLocation}</span>
                        </TableCell>
                        <TableCell>{assessment.industrySector}</TableCell>
                        <TableCell>{assessment.totalEmployees}</TableCell>
                        <TableCell>{assessment.skilledEmployees}</TableCell>
                        <TableCell>{assessment.emiratiEmployees}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium risk-indicator-${assessment.riskLevel}`}>
                            {assessment.riskLevel.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>{assessment.riskScore}/100</TableCell>
                        <TableCell>AED {assessment.fineEstimate.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}