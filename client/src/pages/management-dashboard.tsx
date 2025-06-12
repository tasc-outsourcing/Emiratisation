import IndustryManagementPanel from "@/components/industry-management-panel";
import ConfigurationPanel from "@/components/configuration-panel";

export default function ManagementDashboard() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Management Dashboard</h1>
        <p className="text-gray-600">Configure industry requirements and risk parameters</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <IndustryManagementPanel />
        </div>
        <div className="xl:col-span-1">
          <ConfigurationPanel />
        </div>
      </div>
    </div>
  );
}
