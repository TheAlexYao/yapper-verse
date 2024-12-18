import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryView } from "@/components/scenarios/LibraryView";
import { CreateScenarioView } from "@/components/scenarios/CreateScenarioView";
import { PastBookmarkedView } from "@/components/scenarios/PastBookmarkedView";
import { ScenarioDetailPanel } from "@/components/scenarios/ScenarioDetailPanel";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ScenarioHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Sample scenarios for the combobox
  const scenarios = [
    { value: "cafe", label: "Ordering at a Café" },
    { value: "hotel", label: "Hotel Check-in" },
    { value: "meeting", label: "Business Meeting" },
    { value: "shopping", label: "Shopping for Clothes" },
    { value: "friends", label: "Making Friends" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#38b6ff]/10 animate-gradient-shift" />
      <div className="fixed inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Scenarios
            </h1>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full md:w-[300px] justify-between border-2 focus:border-primary transition-colors duration-200 bg-card/50 backdrop-blur-sm"
                >
                  {searchQuery || "Search scenarios..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full md:w-[300px] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search scenarios..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>No scenario found.</CommandEmpty>
                  <CommandGroup>
                    {scenarios.map((scenario) => (
                      <CommandItem
                        key={scenario.value}
                        value={scenario.value}
                        onSelect={(value) => {
                          setSearchQuery(scenarios.find(s => s.value === value)?.label || "");
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            searchQuery === scenario.label ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {scenario.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="bg-background/50 backdrop-blur-sm border rounded-lg shadow-lg">
            <div className="p-6 border-b">
              <CreateScenarioView onScenarioCreated={setSelectedScenario} />
            </div>

            <Tabs defaultValue="library" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
                <TabsTrigger
                  value="library"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Library
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Past & Bookmarked
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="library" className="m-0">
                  <LibraryView
                    searchQuery={searchQuery}
                    onScenarioSelect={setSelectedScenario}
                  />
                </TabsContent>
                <TabsContent value="past" className="m-0">
                  <PastBookmarkedView
                    searchQuery={searchQuery}
                    onScenarioSelect={setSelectedScenario}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {selectedScenario && (
          <ScenarioDetailPanel
            scenario={selectedScenario}
            onClose={() => setSelectedScenario(null)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default ScenarioHub;