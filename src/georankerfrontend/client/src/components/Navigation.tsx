import { Link } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-primary">
          RedoraAI
        </Link>
      </div>
      
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
