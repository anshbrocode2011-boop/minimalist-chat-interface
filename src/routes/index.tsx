import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baat — Talk simply" },
      { name: "description", content: "A private, focused space for conversations with the people who matter." },
      { property: "og:title", content: "Baat — Talk simply" },
      { property: "og:description", content: "A private, focused space for conversations with the people who matter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BaatApp,
});

type View = "chats" | "people" | "profile";
type Conversation = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  online?: boolean;
  unread?: number;
};

type ChatMessage = { id: number; body: string; mine: boolean; time: string; read?: boolean };

const conversations: Conversation[] = [
  { id: 1, name: "Maya Sharma", handle: "BAAT-28419", initials: "MS", color: "bg-avatar-coral", preview: "That sounds perfect. See you then!", time: "2m", online: true, unread: 2 },
  { id: 2, name: "Arjun Mehta", handle: "BAAT-51720", initials: "AM", color: "bg-avatar-lilac", preview: "Sent you the final notes", time: "24m", online: true },
  { id: 3, name: "Design crew", handle: "4 people", initials: "DC", color: "bg-avatar-mint", preview: "Leena: Love this direction", time: "1h", unread: 4 },
  { id: 4, name: "Kabir Rao", handle: "BAAT-90314", initials: "KR", color: "bg-avatar-sky", preview: "Let’s catch up next week", time: "Tue" },
  { id: 5, name: "Anika Bose", handle: "BAAT-68102", initials: "AB", color: "bg-avatar-gold", preview: "You: Absolutely!", time: "Sun" },
];

const people = [
  { name: "Rhea Kapoor", handle: "BAAT-41127", initials: "RK", color: "bg-avatar-gold", note: "Building quietly" },
  { name: "Dev Malhotra", handle: "BAAT-71208", initials: "DM", color: "bg-avatar-sky", note: "Available" },
  { name: "Ishita Sen", handle: "BAAT-33941", initials: "IS", color: "bg-avatar-coral", note: "Heads down" },
  { name: "Neil Joshi", handle: "BAAT-80822", initials: "NJ", color: "bg-avatar-mint", note: "Around" },
];

const initialMessages: ChatMessage[] = [
  { id: 1, body: "Hey! Are we still on for coffee tomorrow?", mine: false, time: "10:31" },
  { id: 2, body: "Absolutely. How does 11 at the usual place sound?", mine: true, time: "10:34", read: true },
  { id: 3, body: "That sounds perfect. See you then!", mine: false, time: "10:35" },
];

function Avatar({ initials, color, online, size = "md" }: { initials: string; color: string; online?: boolean | undefined; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="relative shrink-0">
      <div className={cn("grid place-items-center rounded-xl font-bold text-avatar-foreground", color, size === "sm" && "size-9 text-xs", size === "md" && "size-11 text-xs", size === "lg" && "size-20 rounded-2xl text-xl")}>{initials}</div>
      {online && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-online" />}
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={cn("font-display font-bold text-foreground", compact ? "text-lg" : "text-2xl")}>b<span className="text-primary">aa</span>t<span className="text-primary">.</span></div>;
}

function BaatApp() {
  const [signedIn, setSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  if (!signedIn) return <AuthScreen mode={authMode} setMode={setAuthMode} onEnter={() => setSignedIn(true)} />;
  return <Workspace onLogout={() => setSignedIn(false)} />;
}

function AuthScreen({ mode, setMode, onEnter }: { mode: "login" | "register"; setMode: (mode: "login" | "register") => void; onEnter: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onEnter(); };
  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md animate-rise sm:py-10">
        <div className="mb-14 flex items-center justify-between sm:mb-16"><Logo /><span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><span className="size-1.5 rounded-full bg-online" /> Private by design</span></div>
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your people, your space</p>
          <h1 className="max-w-sm font-display text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl">Talk without<br />the noise.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">A calm, private place for conversations with the people who matter.</p>
        </div>
        <div className="border-t border-border pt-6">
          <div className="mb-6 flex gap-6" role="tablist">
            <button onClick={() => setMode("login")} className={cn("border-b-2 pb-2 text-sm font-semibold transition-colors", mode === "login" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>Sign in</button>
            <button onClick={() => setMode("register")} className={cn("border-b-2 pb-2 text-sm font-semibold transition-colors", mode === "register" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>Create account</button>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-foreground">{mode === "login" ? "Chat ID" : "Username"}</span><input className="h-12 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15" placeholder={mode === "login" ? "BAAT-48291" : "your_name"} required /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-foreground">Password</span><input type="password" className="h-12 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15" placeholder="At least 8 characters" minLength={8} required /></label>
            <Button type="submit" className="mt-2 h-12 w-full">{mode === "login" ? "Enter Baat" : "Create my ID"}<ChevronRight className="size-4" /></Button>
          </form>
          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">No feeds. No followers. Just conversations.</p>
        </div>
      </section>
    </main>
  );
}

function Workspace({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("chats");
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredPeople = useMemo(() => people.filter((person) => `${person.name} ${person.handle}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const switchView = (next: View) => { setView(next); setActive(null); };
  const send = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setMessages((current) => [...current, { id: Date.now(), body, mine: true, time: "now", read: true }]);
    setDraft("");
  };
  const copyId = async () => {
    await navigator.clipboard?.writeText("BAAT-48291");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-app-canvas text-foreground lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-background lg:flex lg:min-h-screen lg:flex-col lg:p-5">
        <div className="flex items-center justify-between px-2"><Logo compact /><Button size="icon" variant="ghost" aria-label="Settings"><Settings className="size-4" /></Button></div>
        <nav className="mt-10 space-y-1" aria-label="Main navigation">
          <NavItem active={view === "chats"} icon={MessageCircle} label="Chats" count="6" onClick={() => switchView("chats")} />
          <NavItem active={view === "people"} icon={UsersRound} label="People" onClick={() => switchView("people")} />
          <NavItem active={view === "profile"} icon={UserRound} label="Profile" onClick={() => switchView("profile")} />
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <button onClick={() => switchView("profile")} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"><Avatar initials="AB" color="bg-avatar-coral" size="sm" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">Ansh Bro</strong><small className="block truncate text-xs text-muted-foreground">BAAT-48291</small></span><MoreHorizontal className="size-4 text-muted-foreground" /></button>
        </div>
      </aside>

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-background lg:my-5 lg:min-h-[calc(100vh-2.5rem)] lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:shadow-soft">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 lg:h-18">
          <div className="lg:hidden"><Logo compact /></div>
          <div className="hidden lg:block"><p className="text-xs font-medium text-muted-foreground">Good afternoon</p><h1 className="font-display text-lg font-semibold">Ansh Bro</h1></div>
          <div className="flex items-center gap-2">
            {view === "chats" && !active && <Button size="sm" onClick={() => switchView("people")}><Plus className="size-4" />New chat</Button>}
            <Button className="lg:hidden" size="icon" variant="ghost" aria-label="Open profile" onClick={() => switchView("profile")}><Avatar initials="AB" color="bg-avatar-coral" size="sm" /></Button>
          </div>
        </header>

        <div className="min-h-0 flex-1">
          {active ? (
            <ConversationView person={active} messages={messages} draft={draft} setDraft={setDraft} onBack={() => setActive(null)} onSend={send} />
          ) : view === "chats" ? (
            <ChatsView onOpen={setActive} onNew={() => switchView("people")} />
          ) : view === "people" ? (
            <PeopleView query={query} setQuery={setQuery} results={filteredPeople} onOpen={(person) => setActive({ id: 20, preview: "", time: "", online: true, ...person })} />
          ) : (
            <ProfileView copied={copied} onCopy={copyId} onLogout={onLogout} />
          )}
        </div>
        {!active && <MobileNav view={view} onChange={switchView} />}
      </section>
    </main>
  );
}

function NavItem({ active, icon: Icon, label, count, onClick }: { active: boolean; icon: typeof MessageCircle; label: string; count?: string; onClick: () => void }) {
  return <button onClick={onClick} className={cn("flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-4" /><span>{label}</span>{count && <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">{count}</span>}</button>;
}

function ChatsView({ onOpen, onNew }: { onOpen: (person: Conversation) => void; onNew: () => void }) {
  const [search, setSearch] = useState("");
  const visible = conversations.filter((chat) => chat.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="animate-rise px-4 py-6 sm:px-7 sm:py-8">
      <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Your space</p><h2 className="mt-1 font-display text-2xl font-semibold">Conversations</h2></div><span className="text-xs text-muted-foreground">5 active</span></div>
      <div className="relative mb-5"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:bg-background" placeholder="Search conversations" /></div>
      <div className="divide-y divide-border">
        {visible.map((chat) => <button key={chat.id} onClick={() => onOpen(chat)} className="group flex w-full items-center gap-3 py-3.5 text-left sm:gap-4"><Avatar initials={chat.initials} color={chat.color} online={chat.online} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><strong className="truncate text-sm font-semibold">{chat.name}</strong><small className="shrink-0 text-[11px] text-muted-foreground">{chat.time}</small></span><span className="mt-1 flex items-center justify-between gap-3"><span className={cn("truncate text-xs", chat.unread ? "font-medium text-foreground" : "text-muted-foreground")}>{chat.preview}</span>{chat.unread && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{chat.unread}</span>}</span></span><ChevronRight className="hidden size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 sm:block" /></button>)}
      </div>
      {visible.length === 0 && <div className="py-16 text-center"><MessageCircle className="mx-auto mb-3 size-5 text-muted-foreground" /><p className="text-sm font-medium">No conversations found</p></div>}
      <button onClick={onNew} className="mt-6 flex w-full items-center gap-3 rounded-lg border border-dashed border-border p-4 text-left text-sm text-muted-foreground transition hover:border-ring hover:text-foreground"><span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary"><Plus className="size-4" /></span><span><strong className="block text-sm font-semibold text-foreground">Start a conversation</strong><small>Find someone with their Chat ID</small></span></button>
    </div>
  );
}

function PeopleView({ query, setQuery, results, onOpen }: { query: string; setQuery: (value: string) => void; results: typeof people; onOpen: (person: typeof people[number]) => void }) {
  return <div className="animate-rise px-4 py-6 sm:px-7 sm:py-8"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">People</p><h2 className="mt-1 font-display text-2xl font-semibold">Find your people</h2><p className="mt-2 text-sm text-muted-foreground">Search by name or a permanent Chat ID.</p></div><div className="relative mb-7"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm shadow-subtle outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/10" placeholder="Name or BAAT-00000" /></div><p className="mb-2 text-xs font-semibold text-muted-foreground">{query ? "Search results" : "Suggested people"}</p><div className="divide-y divide-border">{results.map((person) => <button key={person.handle} onClick={() => onOpen(person)} className="group flex w-full items-center gap-3 py-4 text-left"><Avatar initials={person.initials} color={person.color} /><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold">{person.name}</strong><small className="mt-1 block text-xs text-muted-foreground">{person.handle} · {person.note}</small></span><span className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition group-hover:border-primary group-hover:text-primary"><Plus className="size-4" /></span></button>)}</div>{results.length === 0 && <div className="py-16 text-center"><UsersRound className="mx-auto mb-3 size-5 text-muted-foreground" /><p className="text-sm font-medium">No people found</p><p className="mt-1 text-xs text-muted-foreground">Check the Chat ID and try again.</p></div>}</div>;
}

function ConversationView({ person, messages, draft, setDraft, onBack, onSend }: { person: Conversation; messages: ChatMessage[]; draft: string; setDraft: (value: string) => void; onBack: () => void; onSend: (event: FormEvent) => void }) {
  return <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col lg:h-[calc(100vh-7rem)]"><div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6"><Button size="icon" variant="ghost" aria-label="Back to chats" onClick={onBack}><ArrowLeft className="size-4" /></Button><Avatar initials={person.initials} color={person.color} online={person.online} size="sm" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{person.name}</strong><small className="block text-[11px] text-muted-foreground">{person.online ? "Online now" : person.handle}</small></span><Button size="icon" variant="ghost" aria-label="More conversation options"><MoreHorizontal className="size-5" /></Button></div><div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 sm:px-8"><div className="mb-3 text-center"><span className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">Today</span></div>{messages.map((message) => <div key={message.id} className={cn("max-w-[82%] sm:max-w-[68%]", message.mine && "ml-auto")}><div className={cn("rounded-xl px-3.5 py-2.5 text-sm leading-5", message.mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary text-secondary-foreground")}>{message.body}</div><div className={cn("mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground", message.mine && "justify-end")}>{message.time}{message.read && <><span>·</span><Check className="size-3" /></>}</div></div>)}</div><form onSubmit={onSend} className="shrink-0 border-t border-border bg-background p-3 sm:p-4"><div className="flex items-end gap-2 rounded-xl border border-input bg-muted/40 p-1.5 pl-3 focus-within:border-ring focus-within:bg-background"><input value={draft} onChange={(e) => setDraft(e.target.value)} className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Write a message…" /><Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message"><Send className="size-4" /></Button></div></form></div>;
}

function ProfileView({ copied, onCopy, onLogout }: { copied: boolean; onCopy: () => void; onLogout: () => void }) {
  return <div className="animate-rise px-4 py-6 sm:px-7 sm:py-8"><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Profile</p><h2 className="mt-1 font-display text-2xl font-semibold">Your identity</h2></div><div className="flex flex-col items-center border-b border-border pb-8 text-center"><Avatar initials="AB" color="bg-avatar-coral" size="lg" /><h3 className="mt-4 font-display text-xl font-semibold">Ansh Bro</h3><p className="mt-1 text-sm text-muted-foreground">Here when it matters.</p><Button variant="outline" size="sm" className="mt-4" onClick={onCopy}>{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "BAAT-48291"}</Button></div><div className="divide-y divide-border"><ProfileRow icon={Sparkles} label="Status" value="Available" /><ProfileRow icon={UserRound} label="Username" value="anshbro" /><ProfileRow icon={Settings} label="Preferences" value="Manage" /></div><Button variant="ghost" className="mt-8 w-full justify-start text-destructive hover:text-destructive" onClick={onLogout}><LogOut className="size-4" />Sign out</Button><p className="mt-10 text-center text-[11px] text-muted-foreground">Your Chat ID is permanent and uniquely yours.</p></div>;
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return <button className="flex w-full items-center gap-3 py-4 text-left"><span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span><span className="flex-1 text-sm font-medium">{label}</span><span className="text-xs text-muted-foreground">{value}</span><ChevronRight className="size-4 text-muted-foreground" /></button>;
}

function MobileNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return <nav className="grid h-17 shrink-0 grid-cols-3 border-t border-border bg-background px-3 pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Main navigation"><MobileNavItem active={view === "chats"} icon={MessageCircle} label="Chats" onClick={() => onChange("chats")} /><MobileNavItem active={view === "people"} icon={Search} label="People" onClick={() => onChange("people")} /><MobileNavItem active={view === "profile"} icon={UserRound} label="Profile" onClick={() => onChange("profile")} /></nav>;
}
function MobileNavItem({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof MessageCircle; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={cn("flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}><Icon className="size-4" /><span>{label}</span></button>;
}
