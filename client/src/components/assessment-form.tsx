import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Users, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MOHRE_SECTORS, REGULATED_SECTORS, type AssessmentInput } from "@shared/schema";

const formSchema = z.object({
  companyLocation: z.enum(["mainland", "freezone"]),
  industrySector: z.string().min(1, "Please select an industry sector"),
  totalEmployees: z.number().min(1, "Must have at least 1 employee"),
  skilledEmployees: z.number().min(1, "Must have at least 1 skilled employee"),
  partOfGroup: z.boolean(),
  groupOperatesMainland: z.boolean().optional(),
  emiratiEmployees: z.number().min(0, "Cannot be negative"),
  emiratisInSkilledRoles: z.boolean(),
  wpsGpssaCompliant: z.boolean(),
  emiratiLeftRecently: z.boolean(),
  departureDaysAgo: z.number().min(0).max(365).optional(),
}).refine((data) => {
  return data.skilledEmployees <= data.totalEmployees;
}, {
  message: "Skilled employees cannot exceed total employees",
  path: ["skilledEmployees"],
}).refine((data) => {
  return !data.partOfGroup || data.groupOperatesMainland !== undefined;
}, {
  message: "Please specify if group operates in mainland",
  path: ["groupOperatesMainland"],
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
      totalEmployees: 1,
      skilledEmployees: 1,
      emiratiEmployees: 0,
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
    <div className="space-y-6">
      {/* Regulated Sector Warning */}
      {isRegulatedSector && (
        <Card className="border-tasc-yellow bg-yellow-50 card-tasc">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-tasc-primary mb-2">
                ⚠️ Regulated Industry Notice
              </h3>
              <p className="text-gray-700 mb-4">
                Are you in a regulated industry? Emiratisation targets may differ from MoHRE rules.
              </p>
              <Button className="btn-cta">
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Company Location
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mainland" id="mainland" />
                            <Label htmlFor="mainland">Mainland</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="freezone" id="freezone" />
                            <Label htmlFor="freezone">Free Zone</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industrySector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Sector</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
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
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Total Employees
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Total number of employees"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skilledEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skilled Employees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Number of skilled employees"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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

              <FormField
                control={form.control}
                name="partOfGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part of a Group?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="group-yes" />
                          <Label htmlFor="group-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="group-no" />
                          <Label htmlFor="group-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedValues.partOfGroup && (
                <FormField
                  control={form.control}
                  name="groupOperatesMainland"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do any group companies operate in Mainland?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="mainland-yes" />
                            <Label htmlFor="mainland-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="mainland-no" />
                            <Label htmlFor="mainland-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emiratiEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Emiratis</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Current number of Emirati employees"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  <FormItem>
                    <FormLabel>Are Emiratis in skilled roles?</FormLabel>
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
                  <FormItem>
                    <FormLabel>Are Emiratis WPS + GPSSA Compliant?</FormLabel>
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
                    <FormDescription>
                      Workplace Protection Scheme + General Pension and Social Security Authority
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emiratiLeftRecently"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Did any Emirati leave recently?</FormLabel>
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
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        How many days ago did they leave?
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="365"
                          placeholder="Number of days"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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

          <div className="text-center">
            <Button type="submit" className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold px-8 py-3 text-lg">
              Calculate Risk Assessment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}