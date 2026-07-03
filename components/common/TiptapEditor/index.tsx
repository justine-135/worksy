"use client";

import type { Editor, Range } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Mention, { type MentionNodeAttrs } from "@tiptap/extension-mention";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

import uploadTaskImage from "@/lib/task/uploadTaskImage.lib";
import { useSessionStore } from "@/store/session.store";
import type { ProjectMemberTableDTO } from "@/types/projectMember.dto";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
const HEADING_LEVELS = [1, 2, 3] as const;
const TEXT_ALIGNMENTS = ["left", "center", "right", "justify"] as const;

type ImageMimeType = (typeof IMAGE_TYPES)[number];
type HeadingLevel = (typeof HEADING_LEVELS)[number];
type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];

type MentionUser = {
  id: string;
  label: string;
  email: string;
  image?: string | null;
};

type MentionListProps = {
  items: MentionUser[];
  selectedIndex: number;
  onHover: (index: number) => void;
  onSelect: (item: MentionUser) => void;
};

export type TiptapEditorProps = {
  users?: ProjectMemberTableDTO[];
  value?: string;
  onChange?: (value: string) => void;
};

function isAllowedImageType(type: string): type is ImageMimeType {
  return IMAGE_TYPES.some((imageType) => imageType === type);
}

function isHeadingLevel(value: string): value is `${HeadingLevel}` {
  return HEADING_LEVELS.some((level) => String(level) === value);
}

function MentionList({
  items,
  selectedIndex,
  onHover,
  onSelect,
}: MentionListProps) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-default-200 bg-surface px-3 py-2 text-sm text-default-500 shadow-lg">
        No members found
      </div>
    );
  }

  return (
    <div className="w-64 overflow-hidden rounded-xl border border-default-200 bg-surface p-1 shadow-lg">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onMouseEnter={() => onHover(index)}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(item);
          }}
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
            selectedIndex === index
              ? "bg-primary-50 text-primary-700"
              : "text-default-700 hover:bg-default-100"
          }`}
        >
          <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-default-100 text-xs font-semibold">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.label}
                className="size-full object-cover"
              />
            ) : (
              item.label.charAt(0).toUpperCase()
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.label}</span>
            <span className="block truncate text-xs text-default-400">
              {item.email}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function getMentionUsers(users: ProjectMemberTableDTO[]): MentionUser[] {
  return users.map((member) => ({
    id: member.user.id,
    label: member.name,
    email: member.email,
    image: member.user.image,
  }));
}

function moveSuggestionBox(
  element: HTMLDivElement,
  clientRect?: (() => DOMRect | null) | null,
) {
  const rect = clientRect?.();

  if (!rect) return;

  element.style.top = `${rect.bottom + 8}px`;
  element.style.left = `${rect.left}px`;
}

function createMentionSuggestion(
  getUsers: () => MentionUser[],
): Omit<SuggestionOptions<MentionUser, MentionNodeAttrs>, "editor"> {
  return {
    char: "@",
    items: ({ query }) => {
      const searchText = query.toLowerCase();

      return getUsers()
        .filter((user) => {
          return (
            user.label.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText)
          );
        })
        .slice(0, 6);
    },
    command: ({
      editor,
      range,
      props,
    }: {
      editor: Editor;
      range: Range;
      props: MentionNodeAttrs;
    }) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: "mention",
            attrs: {
              id: props.id ?? props.label,
              label: props.label ?? props.id ?? "member",
            },
          },
          {
            type: "text",
            text: " ",
          },
        ])
        .run();
    },
    render: () => {
      let root: Root | null = null;
      let element: HTMLDivElement | null = null;
      let selectedIndex = 0;
      let currentItems: MentionUser[] = [];
      let currentCommand: ((item: MentionNodeAttrs) => void) | null = null;

      const renderList = () => {
        root?.render(
          <MentionList
            items={currentItems}
            selectedIndex={selectedIndex}
            onHover={(index) => {
              selectedIndex = index;
              renderList();
            }}
            onSelect={(item) => currentCommand?.(item)}
          />,
        );
      };

      return {
        onStart: (props: SuggestionProps<MentionUser, MentionNodeAttrs>) => {
          element = document.createElement("div");
          element.style.position = "fixed";
          element.style.zIndex = "60";
          document.body.appendChild(element);

          root = createRoot(element);
          currentItems = props.items;
          currentCommand = props.command;
          moveSuggestionBox(element, props.clientRect);
          renderList();
        },
        onUpdate: (props: SuggestionProps<MentionUser, MentionNodeAttrs>) => {
          selectedIndex = 0;
          currentItems = props.items;
          currentCommand = props.command;
          if (element) moveSuggestionBox(element, props.clientRect);
          renderList();
        },
        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === "Escape") return true;
          if (!currentItems.length) return false;

          if (props.event.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % currentItems.length;
            renderList();
            return true;
          }

          if (props.event.key === "ArrowUp") {
            selectedIndex =
              (selectedIndex + currentItems.length - 1) % currentItems.length;
            renderList();
            return true;
          }

          if (props.event.key === "Enter") {
            currentCommand?.(currentItems[selectedIndex]);
            return true;
          }

          return false;
        },
        onExit: () => {
          root?.unmount();
          element?.remove();
          root = null;
          element = null;
        },
      };
    },
  };
}

function ToolbarButton({
  active,
  children,
  onClick,
  title,
  disabled,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-primary-200 bg-primary-50 text-primary-700"
          : "border-default-200 bg-surface text-default-600 hover:bg-default-100"
      }`}
    >
      {children}
    </button>
  );
}

function TiptapEditor({ users = [], value = "", onChange }: TiptapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const mentionUsersRef = useRef<MentionUser[]>([]);
  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const userId = useSessionStore((state) => state.userId);
  const mentionUsers = useMemo(() => getMentionUsers(users), [users]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    mentionUsersRef.current = mentionUsers;
  }, [mentionUsers]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-primary-600 underline underline-offset-2",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class:
            "my-3 max-h-72 rounded-xl border border-default-200 object-contain",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            "rounded-md bg-primary-50 px-1.5 py-0.5 font-medium text-primary-700",
        },
        renderText({ node }) {
          return `@${node.attrs.label}`;
        },
        // Read through the ref so the suggestion always sees the latest user
        // list. `useEditor` runs this config once at mount, so capturing
        // `mentionUsers` directly would freeze it to the first-render value.
        suggestion: createMentionSuggestion(() => mentionUsersRef.current),
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-44 px-3 py-3 text-sm outline-none text-foreground",
      },
    },
    onUpdate({ editor }) {
      if (editor.isDestroyed) return;
      onChangeRef.current?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed || value === editor.getHTML()) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const addLink = () => {
    if (!editor || editor.isDestroyed) return;

    const currentUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Add ticket or external link", currentUrl ?? "");

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const addImage = async (file: File) => {
    if (!editor || editor.isDestroyed) return;

    setImageError("");

    if (!isAllowedImageType(file.type)) {
      setImageError("Upload a JPG, PNG, WEBP, or GIF image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be 2MB or smaller.");
      return;
    }

    if (!userId) {
      setImageError("You must be signed in to upload images.");
      return;
    }

    // Upload to blob storage at insert time so only the URL is stored in the
    // description HTML — never the base64 data of the image itself.
    setIsUploadingImage(true);

    try {
      const blob = await uploadTaskImage({ file, userId });

      if (editor.isDestroyed) return;

      editor
        .chain()
        .focus()
        .setImage({ src: blob.url, alt: file.name })
        .run();
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try another image.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-default-200 bg-surface">
      <div className="flex flex-wrap items-center gap-1 border-b border-default-200 bg-default-50 p-2">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <span className="mx-1 h-6 w-px bg-default-200" />

        <select
          aria-label="Heading level"
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : "paragraph"
          }
          onChange={(event) => {
            const level = event.target.value;

            if (level === "paragraph") {
              editor.chain().focus().setParagraph().run();
              return;
            }

            if (!isHeadingLevel(level)) return;

            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(level) as HeadingLevel })
              .run();
          }}
          className="h-8 rounded-lg border border-default-200 bg-surface px-2 text-sm text-default-700 outline-none"
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <span className="mx-1 h-6 w-px bg-default-200" />

        {TEXT_ALIGNMENTS.map((align: TextAlignment) => (
          <ToolbarButton
            key={align}
            title={`Align ${align}`}
            active={editor.isActive({ textAlign: align })}
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
          >
            {align.charAt(0).toUpperCase()}
          </ToolbarButton>
        ))}

        <span className="mx-1 h-6 w-px bg-default-200" />

        <ToolbarButton
          title="Add link"
          active={editor.isActive("link")}
          onClick={addLink}
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          title="Upload image"
          disabled={isUploadingImage}
          onClick={() => imageInputRef.current?.click()}
        >
          {isUploadingImage ? "Uploading…" : "Image"}
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="max-h-72 overflow-y-auto [&_.ProseMirror_a]:text-primary-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_img]:max-w-full"
      />

      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) addImage(file);
          event.target.value = "";
        }}
      />

      {imageError ? (
        <p className="border-t border-default-200 px-3 py-2 text-xs text-danger-600">
          {imageError}
        </p>
      ) : null}
    </div>
  );
}

export function SimpleEditor() {
  return <TiptapEditor />;
}

export default TiptapEditor;
