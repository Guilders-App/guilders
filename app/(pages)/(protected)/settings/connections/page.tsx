"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeregisterUser,
  useGetConnections,
} from "@/lib/hooks/useConnections";
import { format } from "date-fns";
import { Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function ConnectionsPage() {
  const {
    data: connections,
    isLoading,
    isError,
    refetch,
  } = useGetConnections();
  const { mutate: deregisterConnection } = useDeregisterUser();
  const [deregisteringId, setDeregisteringId] = useState<number | null>(null);
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Connections</h3>
        <p className="text-sm text-muted-foreground">
          Manage your connections.
        </p>
      </div>
      <Separator />
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-24" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-9 w-[77px]" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Failed to load connections</h4>
              <p className="text-sm text-muted-foreground">
                There was an error loading your connections. Please try again
                later.
              </p>
            </div>
          </div>
        </Card>
      ) : connections && connections.length === 0 ? (
        <div>No connections found</div>
      ) : (
        <div className="space-y-4">
          {connections
            ?.filter(
              (connection) => !removedIds.includes(connection.provider_id)
            )
            .map((connection) => (
              <Card key={connection.provider_id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-8 w-24">
                      <Image
                        src={connection.provider.logo_url}
                        alt={`${connection.provider.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {connection.provider.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Connected{" "}
                        {format(new Date(connection.created_at), "PPP")}
                      </div>
                    </div>
                  </div>
                  {deregisteringId === connection.provider_id ? (
                    <Button variant="destructive" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeregisteringId(connection.provider_id);
                        deregisterConnection(connection.provider.name, {
                          onSuccess: () => {
                            setRemovedIds((prev) => [
                              ...prev,
                              connection.provider_id,
                            ]);
                            setDeregisteringId(null);
                            refetch();
                          },
                          onError: () => {
                            setDeregisteringId(null);
                            toast.error("Failed to remove connection", {
                              description: "Please try again later.",
                            });
                          },
                        });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
