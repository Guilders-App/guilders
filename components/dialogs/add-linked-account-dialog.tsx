import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateConnection } from "@/hooks/useCreateConnection";
import { useProvider } from "@/hooks/useProviders";
import { useToast } from "@/hooks/useToast";
import { Institution } from "@/lib/db/types";
import { useStore } from "@/lib/store";
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
  const { data: provider } = useProvider(institution?.provider_id);
  const { mutateAsync: createConnection, isPending } = useCreateConnection(
    provider?.name.toLocaleLowerCase() ?? ""
  );
  const { toast } = useToast();
  const setRedirectUri = useStore((state) => state.setRedirectUri);
  const setIsProviderDialogOpen = useStore(
    (state) => state.setIsProviderDialogOpen
  );

  if (!isOpen || !provider || !institution) return <></>;

  const onContinue = async () => {
    const { success, data: redirectUrl } = await createConnection(
      institution.id
    );
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
      <DialogDescription className="hidden">
        This connection is provided by {provider.name}. By clicking continue,
        you authorize {provider.name} to establish the connection and access
        your financial data.
      </DialogDescription>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Image
              src={institution.logo_url}
              alt={`${institution.name} logo`}
              width={40}
              height={40}
              className="object-contain w-[40px] h-[40px]"
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
              className="object-contain w-[96px] h-[24px]"
            />
          </div>

          <p className="text-muted-foreground text-sm">
            This connection is provided by {provider.name}. By clicking
            continue, you authorize {provider.name} to establish the connection
            and access your financial data.
          </p>
        </div>

        {isPending ? (
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
