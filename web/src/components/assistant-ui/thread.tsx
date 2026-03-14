import {
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { AgentIndicator } from "@/components/chat/agent-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantRuntime,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  Globe,
  LinkedinIcon,
  Magnet,
  Mail,
  MessageSquare,
  Mic,
  MoreHorizontalIcon,
  Paperclip,
  PencilIcon,
  Phone,
  RefreshCwIcon,
  SquareIcon,
  Trash2,
  Video,
} from "lucide-react";
import { type FC, useRef, useState, useEffect } from "react";

export const Thread: FC<{ onStartNewSession?: () => void }> = ({
  onStartNewSession,
}) => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container relative flex h-full min-h-0 flex-col bg-background"
      style={{
        ["--thread-max-width" as string]: "44rem",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="bottom"
        autoScroll
        className="aui-thread-viewport scrollbar-hidden relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth px-4"
      >
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <div className="mx-auto my-auto w-full max-w-(--thread-max-width)">
            <div className="flex flex-col gap-3">
              <Composer onStartNewSession={onStartNewSession} />
              <WelcomeSuggestions />
            </div>
          </div>
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage,
          }}
        />

      </ThreadPrimitive.Viewport>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <div className="aui-thread-footer relative z-20 bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-4">
            <ThreadScrollToBottom />
            <Composer onStartNewSession={onStartNewSession} />
          </div>
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const suggestions = [
  { label: "Personal website", icon: Globe },
  { label: "Customer support email", icon: Mail },
  { label: "Outbound sales calls", icon: Phone },
  { label: "Lead gen", icon: Magnet },
  { label: "Meeting recorder", icon: Video },
  { label: "LinkedIn outreach", icon: LinkedinIcon },
  { label: "Support chatbot", icon: MessageSquare },
];

const WelcomeSuggestions: FC = () => {
  return (
    <div className="flex max-w-2xl flex-wrap justify-center gap-2 px-2">
      {suggestions.map((s) => (
        <button
          key={s.label}
          type="button"
          className="flex items-center gap-1.5 border border-screamin-green-200 bg-screamin-green-50 px-3 py-1.5 text-sm text-black/60 hover:bg-screamin-green-100 hover:text-black"
        >
          <s.icon size={14} strokeWidth={1.5} className="text-black" />
          {s.label}
        </button>
      ))}
    </div>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const Composer: FC<{ onStartNewSession?: () => void }> = ({
  onStartNewSession,
}) => {
  const runtime = useAssistantRuntime();

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      <div className="w-full border border-screamin-green-200 bg-screamin-green-50 p-4 shadow-md">
        <ComposerPrimitive.Input
          placeholder="Build an agent or perform a task"
          className="aui-composer-input w-full min-h-[3.5rem] max-h-40 resize-none bg-transparent placeholder-screamin-green-700/40 outline-none text-foreground"
          rows={2}
          autoFocus
          aria-label="Message input"
        />
        <div className="flex items-center justify-between">
          <ModelSelector />
          <div className="flex items-center gap-2">
            <AuiIf condition={(s) => !s.thread.isEmpty}>
              <button
                type="button"
                aria-label="Clear conversation"
                className="flex h-8 w-8 items-center justify-center border border-screamin-green-200 text-screamin-green-700/40 hover:text-screamin-green-800"
                onClick={() => {
                  if (onStartNewSession) {
                    onStartNewSession();
                    return;
                  }

                  runtime.thread.reset();
                }}
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </AuiIf>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center border border-screamin-green-200 text-screamin-green-700/40 hover:text-screamin-green-800"
            >
              <Paperclip size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center border border-screamin-green-200 text-screamin-green-700/40 hover:text-screamin-green-800"
            >
              <Mic size={16} strokeWidth={1.5} />
            </button>
            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center bg-screamin-green-800 text-white hover:bg-screamin-green-700"
                >
                  <ArrowUpIcon size={16} strokeWidth={1.5} />
                </button>
              </ComposerPrimitive.Send>
            </AuiIf>
            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center bg-screamin-green-800 text-white hover:bg-screamin-green-700"
                >
                  <SquareIcon size={14} strokeWidth={1.5} className="fill-current" />
                </button>
              </ComposerPrimitive.Cancel>
            </AuiIf>
          </div>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};

const models = [
  { label: "Auto", value: "auto" },
  { label: "Opus 4.6", value: "claude-4.6-opus" },
  { label: "Sonnet 4.6", value: "claude-4.6-sonnet" },
  { label: "Sonnet 4.5", value: "claude-4.5-sonnet" },
  { label: "Haiku 4.5", value: "claude-4.5-haiku" },
];

const ModelSelector: FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(models[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-[5.75rem] items-center justify-between rounded border border-screamin-green-400 px-2 text-xs font-medium text-screamin-green-700/60 hover:text-screamin-green-800 hover:bg-screamin-green-100/50"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {models.map((model) => (
            <button
              key={model.value}
              type="button"
              onClick={() => {
                setSelected(model);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs ${
                selected.value === model.value
                  ? "bg-screamin-green-50 font-medium text-screamin-green-800"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-assistant-message-root fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-(--thread-max-width) animate-in py-3 duration-150"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground leading-relaxed">
        <AgentIndicator />
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
            tools: { Fallback: ToolFallback },
          }}
        />
        <MessageError />
      </div>

      <div className="aui-assistant-message-footer mt-1 ml-2 flex min-h-6 items-center">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton
            tooltip="More"
            className="data-[state=open]:bg-accent"
          >
            <MoreHorizontalIcon />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          className="aui-action-bar-more-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <DownloadIcon className="size-4" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-user-message-root fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-(--thread-max-width) animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-3 duration-150 [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content wrap-break-word rounded-2xl bg-muted px-4 py-2.5 text-foreground">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-edit-composer-wrapper mx-auto flex w-full max-w-(--thread-max-width) flex-col px-2 py-3">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-[85%] flex-col rounded-2xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-foreground text-sm outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
