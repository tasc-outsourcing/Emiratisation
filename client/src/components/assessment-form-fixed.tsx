import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Users, MapPin, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MOHRE_SECTORS, REGULATED_SECTORS, type AssessmentInput } from "@shared/schema";

const formSchema = z.object({
  companyLocation: z.enum(["mainland", "freezone"]),
  industrySector: z.string().min(1, "Please select an industry sector"),
  totalEmployees: z.coerce.number().min(1, "Must have at least 1 employee"),
  skilledEmployees: z.coerce.number().min(1, "Must have at least 1 skilled employee"),
  emiratiEmployees: z.coerce.number().min(0, "Cannot be negative"),
  wpsGpssaCompliant: z.boolean(),
  emiratiLeftRecently: z.boolean(),
  departureDaysAgo: z.coerce.number().min(0).max(365).optional(),
}).refine((data) => {
  return data.skilledEmployees <= data.totalEmployees;
}, {
  message: "Skilled employees cannot exceed total employees",
  path: ["skilledEmployees"],
}).refine((data) => {
  return !data.emiratiLeftRecently || data.departureDaysAgo !== undefined;
}, {
  message: "Please specify when the Emirati left",
  path: ["departureDaysAgo"],
});

type FormData = z.infer<typeof formSchema>;

interface AssessmentFormProps {
  onComplete: (data: FormData) => void;
}

export default function AssessmentForm({ onComplete }: AssessmentFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyLocation: undefined,
      industrySector: "",
      partOfGroup: false,
      emiratisInSkilledRoles: false,
      wpsGpssaCompliant: false,
      emiratiLeftRecently: false,
    },
  });

  const watchedValues = form.watch();
  const isRegulatedSector = watchedValues.industrySector && REGULATED_SECTORS.includes(watchedValues.industrySector as any);

  const onSubmit = (data: FormData) => {
    onComplete(data);
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-6 md:p-6 px-4 space-y-8">
        {isRegulatedSector && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                ⚠️ Regulated Industry Notice
              </h3>
              <p className="text-gray-700 mb-4">
                Are you in a regulated industry? Emiratisation targets may differ from MoHRE rules.
              </p>
              <Button className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold">
                📞 Book a Compliance Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Company Profile Section */}
          <Card className="card-tasc">
            <CardHeader className="header-company-blue">
              <CardTitle className="flex items-center text-white">
                <Building className="h-5 w-5 mr-2" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyLocation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center text-sm font-medium">
                        <MapPin className="h-4 w-4 mr-2" />
                        Company Location
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Is your company registered on the UAE mainland or in a Free Zone (like DMCC, DIFC, JAFZA, etc.)? Only mainland companies are subject to mandatory Emiratisation quotas.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mainland">UAE Mainland</SelectItem>
                          <SelectItem value="freezone">Free Zone (DMCC, DIFC, JAFZA, etc.)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Only mainland companies are subject to Emiratisation requirements
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industrySector"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center text-sm font-medium">
                        Industry Sector
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Select the main industry your company operates in. Certain sectors have specific Emiratisation requirements if you have fewer than 50 employees.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOHRE_SECTORS.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the main industry your company operates in
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="totalEmployees"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center text-sm font-medium">
                        <Users className="h-4 w-4 mr-2" />
                        Total Employees
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Enter your company's total headcount across all roles and departments, including both skilled and unskilled workers.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your company's total headcount across all departments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skilledEmployees"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center text-sm font-medium">
                        Number of Skilled Employees
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Only skilled roles are counted when calculating Emiratisation targets. Skilled jobs include managers, professionals, sales, clerical, and technical roles.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                        />
                      </FormControl>
                      <FormDescription>
                        Professionals, managers, specialists
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


            </CardContent>
          </Card>

          {/* Emirati Workforce Section */}
          <Card className="card-tasc">
            <CardHeader className="header-company-blue">
              <CardTitle className="flex items-center text-white">
                <Users className="h-5 w-5 mr-2" />
                Emirati Workforce
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <FormField
                control={form.control}
                name="emiratiEmployees"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center text-sm font-medium">
                      Number of Emiratis
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>How many UAE Nationals are currently employed in your company?</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emiratisInSkilledRoles"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center text-sm font-medium">
                      Are Emiratis in skilled roles?
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Emiratisation quotas only count Emiratis working in skilled positions like managers, sales, tech, or admin.</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="skilled-yes" />
                          <Label htmlFor="skilled-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="skilled-no" />
                          <Label htmlFor="skilled-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wpsGpssaCompliant"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center text-sm font-medium">
                      WPS & GPSSA Compliant?
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This means the Emiratis are paid via the official Wages Protection System and registered for pension under GPSSA. Both are required for compliance.</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="compliant-yes" />
                          <Label htmlFor="compliant-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="compliant-no" />
                          <Label htmlFor="compliant-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emiratiLeftRecently"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center text-sm font-medium">
                      Has any Emirati left recently?
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>If an Emirati employee left recently, you may still be within MoHRE's grace period to replace them without penalty. Enter the most recent date of departure.</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="left-yes" />
                          <Label htmlFor="left-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="left-no" />
                          <Label htmlFor="left-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedValues.emiratiLeftRecently && (
                <FormField
                  control={form.control}
                  name="departureDaysAgo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center text-sm font-medium">
                        <Calendar className="h-4 w-4 mr-2" />
                        How many days ago did they leave?
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="365"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                        />
                      </FormControl>
                      <FormDescription>
                        90-day grace period applies for recent departures
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button type="submit" className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold px-8 py-3 text-lg">
              Calculate Risk Assessment
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </TooltipProvider>
  );
}