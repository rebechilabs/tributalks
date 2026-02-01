import { useAdminPresence } from "@/hooks/useAdminPresence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Globe, 
  Activity, 
  Loader2,
  Circle,
  MapPin,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function LivePresenceCard() {
  const { users, stats, loading } = useAdminPresence();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Circle className="w-4 h-4 fill-green-500 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Agora</p>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ausente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.away}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ativos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Países</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byCountry).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Users Online List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário online no momento
                </p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.nome?.charAt(0) || user.email?.charAt(0) || "?"}
                            </span>
                          </div>
                          <Circle
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                              user.status === "online"
                                ? "fill-green-500 text-green-500"
                                : "fill-yellow-500 text-yellow-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {user.nome || user.email?.split("@")[0] || "Usuário"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {user.country_code && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {user.country_name || user.country_code}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(user.last_active_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {user.plano || "FREE"}
                        </Badge>
                        {user.page_path && (
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {user.page_path}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Distribution Cards */}
        <div className="space-y-4">
          {/* By Country */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" />
                Por País
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.byCountry).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Sem dados de localização ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.byCountry)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div
                        key={country}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <span className="text-sm">{country}</span>
                        <Badge>{count}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Plan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                Por Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byPlan)
                  .sort(([, a], [, b]) => b - a)
                  .map(([plan, count]) => (
                    <div
                      key={plan}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="text-sm">{plan}</span>
                      <Badge
                        variant={
                          plan === "ENTERPRISE"
                            ? "default"
                            : plan === "PROFESSIONAL"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
