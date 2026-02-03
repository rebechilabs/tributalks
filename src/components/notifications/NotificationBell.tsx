import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useClaraInsights, ClaraInsight } from "@/hooks/useClaraInsights";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const typeStyles = {
  info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  success: "bg-green-500/10 border-green-500/30 text-green-400",
  warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  alert: "bg-red-500/10 border-red-500/30 text-red-400",
};

const categoryLabels = {
  geral: "Geral",
  reforma: "Reforma Tributária",
  indicacao: "Indicação",
  sistema: "Sistema",
};

const priorityStyles = {
  urgent: "bg-red-500/10 border-red-500/30 text-red-400",
  high: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  medium: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  low: "bg-muted border-border text-muted-foreground",
};

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "clara">("notifications");
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  
  const {
    insights,
    unreadCount: claraUnreadCount,
    loading: claraLoading,
    dismissInsight,
    markAsActed,
  } = useClaraInsights();

  const totalUnread = unreadCount + claraUnreadCount;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      setOpen(false);
      navigate(notification.action_url);
    }
  };

  const handleInsightClick = (insight: ClaraInsight) => {
    if (!insight.acted_at) {
      markAsActed(insight.id);
    }
    if (insight.action_route) {
      setOpen(false);
      navigate(insight.action_route);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {totalUnread > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center",
              claraUnreadCount > 0 ? "bg-primary animate-pulse" : "bg-destructive"
            )}>
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "notifications" | "clara")}>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications" className="relative text-xs">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="clara" className="relative text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Clara AI
                {claraUnreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full animate-pulse">
                    {claraUnreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="m-0">
            {unreadCount > 0 && (
              <div className="flex justify-end px-3 py-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Marcar todas como lidas
                </Button>
              </div>
            )}
            <ScrollArea className="h-80">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-2 shrink-0",
                            !notification.read ? "bg-primary" : "bg-transparent"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded border",
                                typeStyles[notification.type]
                              )}
                            >
                              {categoryLabels[notification.category]}
                            </span>
                            {notification.action_url && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="clara" className="m-0">
            <ScrollArea className="h-80">
              {claraLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Carregando insights...
                </div>
              ) : insights.length === 0 ? (
                <div className="p-8 text-center">
                  <Sparkles className="h-8 w-8 mx-auto text-primary/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum insight no momento
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A Clara analisará seus dados e trará sugestões
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        "p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
                        !insight.acted_at && "bg-primary/5"
                      )}
                      onClick={() => handleInsightClick(insight)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            !insight.acted_at ? "bg-primary/20" : "bg-muted"
                          )}>
                            <Sparkles className={cn(
                              "w-4 h-4",
                              !insight.acted_at ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded border capitalize",
                                priorityStyles[insight.priority]
                              )}
                            >
                              {insight.priority === 'urgent' ? 'Urgente' : 
                               insight.priority === 'high' ? 'Alta' :
                               insight.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {insight.insight_type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {insight.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                          {insight.action_cta && (
                            <p className="text-xs text-primary font-medium mt-1">
                              {insight.action_cta} →
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(insight.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissInsight(insight.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
