import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ALL_TOOLS, canAccessTool, filterTools, CommandTool } from '@/data/commandPaletteTools';
import { ICON_MAP, IconKey } from '@/lib/iconMap';
import { Lock, Search, ArrowRight, Command, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Check if a string is an emoji (starts with emoji character)
const isEmoji = (str: string): boolean => {
  const emojiRegex = /^[\p{Emoji}]/u;
  return emojiRegex.test(str);
};

// Legacy plan mapping
const LEGACY_PLAN_MAP: Record<string, string> = {
  'STARTER': 'starter',
  'NAVIGATOR': 'navigator',
  'BASICO': 'navigator',
  'PROFESSIONAL': 'professional',
  'PROFISSIONAL': 'professional',
  'PREMIUM': 'professional',
  'ENTERPRISE': 'professional',
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize user plan
  const userPlan = LEGACY_PLAN_MAP[profile?.plano?.toUpperCase() || 'STARTER'] || 'starter';

  // Filter tools based on search
  const filteredTools = filterTools(ALL_TOOLS, search);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredTools.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, filteredTools.length]);

  // Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Also listen for custom event from useClaraShortcut (fallback)
  useEffect(() => {
    const handleOpenFromEvent = () => {
      setOpen(true);
    };
    
    window.addEventListener('openCommandPalette', handleOpenFromEvent);
    return () => window.removeEventListener('openCommandPalette', handleOpenFromEvent);
  }, []);

  // Handle tool selection
  const handleSelect = useCallback((tool: CommandTool) => {
    setOpen(false);
    setSearch('');
    
    // Special action for Clara
    if (tool.action === 'openClara') {
      window.dispatchEvent(new CustomEvent('openClaraFreeChat'));
      return;
    }
    
    // Check access
    const hasAccess = canAccessTool(tool, userPlan);
    
    if (!hasAccess) {
      navigate(`/upgrade?feature=${tool.id}`);
      return;
    }
    
    // Navigate to tool
    if (tool.path) {
      navigate(tool.path);
    }
  }, [navigate, userPlan]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (filteredTools.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
        break;
      case 'Enter':
        e.preventDefault();
        handleSelect(filteredTools[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  }, [filteredTools, selectedIndex, handleSelect]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      // Focus input after dialog animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-[600px] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ferramenta ou abrir Clara..."
            className="border-0 focus-visible:ring-0 text-base bg-transparent placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[400px] overflow-y-auto py-2"
        >
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhuma ferramenta encontrada</p>
              <p className="text-xs mt-1 opacity-70">Tente outro termo de busca</p>
            </div>
          ) : (
            filteredTools.map((tool, index) => {
              const hasAccess = canAccessTool(tool, userPlan);
              const isSelected = index === selectedIndex;
              const isEmojiIcon = isEmoji(tool.icon);
              const IconComponent = !isEmojiIcon ? ICON_MAP[tool.icon as IconKey] : null;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3",
                    "text-left transition-all duration-150",
                    "hover:bg-accent/50",
                    isSelected && "bg-accent",
                    !hasAccess && "opacity-60"
                  )}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {isEmojiIcon ? (
                      <span className="text-lg">{tool.icon}</span>
                    ) : IconComponent ? (
                      <IconComponent className="w-4 h-4 text-primary" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium truncate",
                        isSelected && "text-foreground"
                      )}>
                        {tool.name}
                      </span>
                      {!hasAccess && (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                  
                  {/* Action hint */}
                  <ArrowRight className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0"
                  )} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border bg-background text-[10px]">↑</kbd>
              <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border bg-background text-[10px]">↓</kbd>
              <span className="ml-1">navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 px-1.5 items-center justify-center rounded border bg-background text-[10px]">↵</kbd>
              <span className="ml-1">selecionar</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K para abrir</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
