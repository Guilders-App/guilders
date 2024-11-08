import { H2 } from "@/components/common/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "./_tabs/account-tab";
import { ConnectionsTab } from "./_tabs/connections-tab";
import { SecurityTab } from "./_tabs/security-tab";

export default function ProtectedPage() {
  return (
    <div>
      <H2>Settings</H2>
      <Tabs defaultValue="account" className="p-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="connections">
          <ConnectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
