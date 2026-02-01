import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Home, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouteInfo, type RelatedPage } from "@/hooks/useRouteInfo";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageBreadcrumbProps {
  className?: string;
  showRelated?: boolean;
}

export function PageBreadcrumb({ className, showRelated = true }: PageBreadcrumbProps) {
  const navigate = useNavigate();
  const { breadcrumb, relatedPages, isRoot, label } = useRouteInfo();
  
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleCommandK = () => {
    window.dispatchEvent(new CustomEvent("openClaraFreeChat"));
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 px-4 lg:px-6 py-2 bg-muted/30 border-b border-border",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Back Button - hidden on root */}
        {!isRoot && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Voltar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Voltar à página anterior</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Breadcrumb */}
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              const isFirst = index === 0;
              
              return (
                <BreadcrumbItem key={item.path}>
                  {!isLast ? (
                    <>
                      <BreadcrumbLink 
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.path);
                        }}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isFirst && <Home className="h-3.5 w-3.5" />}
                        <span className="hidden md:inline">{item.label}</span>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </BreadcrumbSeparator>
                    </>
                  ) : (
                    <BreadcrumbPage className="font-medium text-foreground truncate max-w-[200px]">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Mobile: Show only current page */}
        <span className="sm:hidden text-sm font-medium text-foreground truncate">
          {label}
        </span>
      </div>
      
      {/* Right side: Related pages + Command K */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Related Pages - Desktop only */}
        {showRelated && relatedPages.length > 0 && (
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Relacionados:</span>
            {relatedPages.map((page: RelatedPage) => (
              <TooltipProvider key={page.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => navigate(page.path)}
                    >
                      <page.icon className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden xl:inline">{page.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{page.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
        
        {/* Command K shortcut */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1 bg-background"
                onClick={handleCommandK}
              >
                <Command className="h-3 w-3" />
                <span className="hidden sm:inline">K</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Buscar com Clara (⌘K)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
