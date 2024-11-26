import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Institution } from "@/lib/db/types";
import { useToast } from "@/lib/hooks/useToast";
import { useStore } from "@/lib/store";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface AddLinkedAccountDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  institution: Institution | null;
}

export function AddLinkedAccountDialog({
  isOpen,
  setIsOpen,
  institution,
}: AddLinkedAccountDialogProps) {
  const { data: provider } = trpc.provider.getById.useQuery(
    institution?.provider_id ?? -1
  );
  const { mutateAsync: createConnection, isLoading } =
    trpc.connection.connect.useMutation();
  const { toast } = useToast();
  const setRedirectUri = useStore((state) => state.setRedirectUri);
  const setIsProviderDialogOpen = useStore(
    (state) => state.setIsProviderDialogOpen
  );

  if (!isOpen || !provider || !institution) return <></>;

  const onContinue = async () => {
    const { success, data: redirectUrl } = await createConnection({
      providerName: provider.name.toLocaleLowerCase(),
      institutionId: institution.id,
    });
    if (success) {
      setRedirectUri(redirectUrl);
      setIsOpen(false);
      setTimeout(() => setIsProviderDialogOpen(true), 40);
    } else {
      setIsOpen(false);
      toast({
        title: "Failed to create connection",
        description: "Unable to create connection. Please try again later.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="hidden">Add Linked Account</DialogTitle>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Image
              src={institution.logo_url}
              alt={`${institution.name} logo`}
              width={40}
              height={40}
              className="object-contain"
            />
            <h2 className="text-2xl font-semibold">{institution.name}</h2>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <Image
              src={provider.logo_url}
              alt={`${provider.name} logo`}
              width={96}
              height={24}
              className="object-contain"
            />
          </div>

          <p className="text-muted-foreground text-sm">
            This connection is provided by {provider.name}. By clicking
            continue, you authorize {provider.name} to establish the connection
            and access your financial data.
          </p>
        </div>

        {isLoading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button onClick={onContinue}>Continue</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
