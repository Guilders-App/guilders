"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDeregisterUser, useGetConnections } from "@/hooks/useConnections";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function ConnectionsPage() {
  const {
    data: connections,
    isLoading,
    isError,
    refetch,
  } = useGetConnections();
  const { mutate: deregisterConnection, isPending: isDeregistering } =
    useDeregisterUser();

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
        <div>Loading...</div>
      ) : isError ? (
        <div>Error</div>
      ) : connections && connections.length === 0 ? (
        <div>No connections found</div>
      ) : (
        <div className="space-y-4">
          {connections?.map((connection) => (
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
                      Connected {format(new Date(connection.created_at), "PPP")}
                    </div>
                  </div>
                </div>
                {isDeregistering ? (
                  <Button variant="destructive" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deregisterConnection(connection.provider.name, {
                        onSuccess: () => {
                          refetch();
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
