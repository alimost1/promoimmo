import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search properties, guests..."
              className="w-80 pl-10"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-400 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
