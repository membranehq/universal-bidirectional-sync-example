import { useState } from "react";
import { useDataSourceAppliedIntegrations } from "@/hooks/use-applied-integrations";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Integration } from '@membranehq/sdk'


interface IntegrationSelectProps {
  value: Integration | null;
  onValueChange: (integration: Integration) => void;
  label?: string;
  dataSourceKey?: string;
}

export function IntegrationSelect({ value, onValueChange, label, dataSourceKey }: IntegrationSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { integrations, loading: integrationsLoading } = useDataSourceAppliedIntegrations(
    dataSourceKey ? dataSourceKey : null
  );

  const filteredIntegrations = integrations.filter((integration) =>
    integration.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>}
      {integrationsLoading ? (
        <Skeleton className="h-10 w-full min-w-[200px]" />
      ) : (
        <Select
          value={value?.key || ""}
          onValueChange={(key) => {
            const integration = integrations.find((i) => i.key === key);
            if (integration) onValueChange(integration);
          }}
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setSearch("");
          }}
        >
          <SelectTrigger id="integration-select" className="min-w-[200px]">
            <SelectValue placeholder="Choose an integration">
              {value && (
                <span className="flex items-center gap-2">
                  {value.logoUri ? (
                    <Image
                      src={value.logoUri}
                      alt={value.name + " logo"}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center font-bold">
                      {value.name[0]}
                    </div>
                  )}
                  <span>{value.name}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-2 sticky top-0 z-10 bg-white">
              <Input
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs"
                autoFocus
              />
            </div>
            {
              filteredIntegrations.map((integration) => (
                <SelectItem value={integration.key!} key={integration.key!}>
                  <span className="flex items-center gap-2">
                    {integration.logoUri ? (
                      <Image
                        src={integration.logoUri}
                        alt={integration.name + " logo"}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center font-bold">
                        {integration.name[0]}
                      </div>
                    )}
                    <span>{integration.name}</span>
                  </span>
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 