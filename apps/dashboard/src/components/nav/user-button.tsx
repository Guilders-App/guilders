"use client";

import { Avatar, AvatarFallback } from "@guilders/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@guilders/ui/dropdown-menu";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOutAction } from "../../app/actions";

export function UserButton() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          {/* <AvatarImage src="./avatar-80-07.jpg" alt="Kelly King" /> */}
          <AvatarFallback>
            <UserRound
              size={16}
              strokeWidth={2}
              className="opacity-60"
              aria-hidden="true"
            />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOutAction()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
