import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Step 1 Schema - Company Profile
const step1Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  location: z.enum(["mainland", "freezone"], {
    required_error: "Please select a location",
  }),
  industrySector: z.string().min(1, "Please select an industry sector"),
  totalEmployees: z.number().min(1, "Total employees must be at least 1"),
  emiratiEmployees: z.number().min(0, "Emirati employees cannot be negative"),
});

// Step 2 Schema - Emirati Workforce Details
const step2Schema = z.object({
  recentDepartures: z.enum(["yes", "no"], {
    required_error: "Please select yes or no",
  }),
  departuresCount: z.number().min(0).optional(),
  monthsSinceDeparture: z.number().min(0).optional(),
  hasRecruitmentPlan: z.enum(["yes", "no"], {
    required_error: "Please select yes or no",
  }),
  isRegulatedSector: z.enum(["yes", "no"], {
    required_error: "Please select yes or no",
  }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export type FormData = Step1Data & Step2Data;

interface TwoStepFormProps {
  onComplete: (data: FormData) => void;
}

export default function TwoStepForm({ onComplete }: TwoStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: "",
      location: undefined,
      industrySector: "",
      totalEmployees: 0,
      emiratiEmployees: 0,
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      recentDepartures: undefined,
      departuresCount: 0,
      monthsSinceDeparture: 0,
      hasRecruitmentPlan: undefined,
      isRegulatedSector: undefined,
    },
  });

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    if (step1Data) {
      onComplete({ ...step1Data, ...data });
    }
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  if (currentStep === 1) {
    return (
      <Card className="card-tasc">
        <CardHeader>
          <CardTitle className="text-tasc-primary flex items-center gap-2">
            <span className="bg-tasc-yellow text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...step1Form}>
            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-6">
              <FormField
                control={step1Form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step1Form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Location</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mainland" id="mainland" />
                          <Label htmlFor="mainland">UAE Mainland</Label>
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
                control={step1Form.control}
                name="industrySector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Sector</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Mining and Quarrying">Mining and Quarrying</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Electricity, Gas and Water">Electricity, Gas and Water</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Wholesale and Retail Trade">Wholesale and Retail Trade</SelectItem>
                        <SelectItem value="Hotels and Restaurants">Hotels and Restaurants</SelectItem>
                        <SelectItem value="Transport and Communications">Transport and Communications</SelectItem>
                        <SelectItem value="Financial Intermediation">Financial Intermediation</SelectItem>
                        <SelectItem value="Real Estate and Business Activities">Real Estate and Business Activities</SelectItem>
                        <SelectItem value="Public Administration and Defence">Public Administration and Defence</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Health and Social Work">Health and Social Work</SelectItem>
                        <SelectItem value="Community, Social and Personal Services">Community, Social and Personal Services</SelectItem>
                        <SelectItem value="Banking">Banking</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={step1Form.control}
                  name="totalEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Employees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="emiratiEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Emirati Employees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="btn-yellow w-full">
                Continue to Workforce Details <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-tasc">
      <CardHeader>
        <CardTitle className="text-tasc-primary flex items-center gap-2">
          <span className="bg-tasc-yellow text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
          Emirati Workforce Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-6">
            <FormField
              control={step2Form.control}
              name="recentDepartures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Have any Emirati employees left your company in the past 12 months?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="departures-yes" />
                        <Label htmlFor="departures-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="departures-no" />
                        <Label htmlFor="departures-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {step2Form.watch("recentDepartures") === "yes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={step2Form.control}
                  name="departuresCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Departures</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step2Form.control}
                  name="monthsSinceDeparture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Months Since Most Recent Departure</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={step2Form.control}
              name="hasRecruitmentPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have an active Emirati recruitment plan?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="recruitment-yes" />
                        <Label htmlFor="recruitment-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="recruitment-no" />
                        <Label htmlFor="recruitment-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={step2Form.control}
              name="isRegulatedSector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is your company in a regulated sector (Banking, Insurance, Government)?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="regulated-yes" />
                        <Label htmlFor="regulated-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="regulated-no" />
                        <Label htmlFor="regulated-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="btn-yellow flex-1">
                Complete Assessment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}