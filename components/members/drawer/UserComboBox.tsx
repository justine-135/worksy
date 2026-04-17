"use client";

import { useState } from "react";
import {
  ComboBox,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Label,
  Description,
} from "@heroui/react";

import { useDebounce } from "@/hooks/common/useDebounce";
import { useSearchUser } from "@/hooks/user/useSearchUser";
import { UserResponseDTO } from "@/types/user.dto";
import { useSessionStore } from "@/store/session.store";

interface Props {
  setMember: (user: UserResponseDTO) => void;
}

export function UserComboBox({ setMember }: Props) {
  const [query, setQuery] = useState("");
  const userId = useSessionStore((s) => s.userId);

  const mentionMatch = query.match(/@([^\s@]*)$/);
  const mentionQuery = mentionMatch ? mentionMatch[1] : "";

  const debouncedQuery = useDebounce(mentionQuery, 200);

  const { data } = useSearchUser({ query: debouncedQuery, currentId: userId });

  return (
    <ComboBox menuTrigger="input">
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

                const beforeMention = query.slice(0, mentionMatch.index);

                const newValue = beforeMention + `@${user.name} `;

                setQuery(newValue);
                setMember(user);
              }}
            >
              <Avatar size="sm">
                <AvatarImage src={user.image} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>

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
