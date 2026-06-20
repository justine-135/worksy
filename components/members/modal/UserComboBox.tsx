"use client";

import { ComboBox, Description,Input, Label } from "@heroui/react";
import { useState } from "react";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { useDebounce } from "@/hooks/common/useDebounce";
import { useSearchUser } from "@/hooks/user/useSearchUser";
import { useSessionStore } from "@/store/session.store";
import { UserResponseDTO } from "@/types/user.dto";

interface Props {
  setMember: (user: UserResponseDTO) => void;
}

export function UserComboBox({ setMember }: Props) {
  const [query, setQuery] = useState("");
  const userId = useSessionStore((s) => s.userId);

  const mentionMatch = query.match(/@([^\s@]*)$/);
  const mentionQuery = mentionMatch ? mentionMatch[1] : "";

  const debouncedQuery = useDebounce(mentionQuery, 100);

  const { data } = useSearchUser({ query: debouncedQuery, currentId: userId });

  return (
    <ComboBox aria-label="search for users to invite" menuTrigger="input">
      <ComboBox.InputGroup>
        <Input
          placeholder="Type @ to mention someone..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </ComboBox.InputGroup>

      <div className="shadow-sm mt-2 rounded-xl">
        {data?.map((user) => {
          return (
            <div
              key={user.id}
              className="
            flex items-center gap-3
            px-3 py-2
            rounded-xl
            cursor-pointer
            hover:bg-gray-50
          "
              onClick={() => {
                if (!mentionMatch) return;
                setQuery("");
                setMember(user);
              }}
            >
              <CustomAvatar
                avatarProps={{ size: "sm" }}
                avatarImageProps={{
                  src: user?.image || "",
                  alt: user?.name || "User",
                }}
                avatarFallbackProps={{ className: "text-xs" }}
                fallback={user?.name || ""}
              />
              <div className="flex flex-col">
                <Label className="text-sm font-medium">{user.name}</Label>
                <Description className="text-xs text-default-500">
                  {user.email}
                </Description>
              </div>
            </div>
          );
        })}
      </div>
    </ComboBox>
  );
}
