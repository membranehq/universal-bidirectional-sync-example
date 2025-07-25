import { Button } from "@/components/ui/button";

interface FilterBarProps {
  integrations: string[];
  selectedIntegration: string | null;
  onIntegrationSelect: (integration: string | null) => void;
}

export function FilterBar({ integrations, selectedIntegration, onIntegrationSelect }: FilterBarProps) {
  const handleTabClick = (integration: string) => {
    if (selectedIntegration === integration) {
      // If clicking the same tab, deselect it
      onIntegrationSelect(null);
    } else {
      // Select the new tab
      onIntegrationSelect(integration);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {integrations.map((integration) => (
          <Button
            key={integration}
            variant={selectedIntegration === integration ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabClick(integration)}
            className="text-sm"
          >
            {integration}
          </Button>
        ))}
      </div>
    </div>
  );
} 