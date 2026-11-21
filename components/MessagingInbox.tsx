"use client";

import { useState } from "react";
import { Lock, Search } from "lucide-react";
import Avatar from "@/components/Avatar";

// Fake conversations: messaging is a joke page, nothing here touches the database
type Message = { fromMe: boolean; text: string; time: string };
type Conversation = { id: string; name: string; subtitle: string; time: string; unread: boolean; messages: Message[] };

const CONVERSATIONS: Conversation[] = [
  {
    id: "mom",
    name: "Mom",
    subtitle: "Founder & CEO of Worrying",
    time: "9:41 AM",
    unread: true,
    messages: [
      { fromMe: false, text: "Did you go to class today?", time: "8:02 AM" },
      { fromMe: false, text: "Your father and I found your LinkedOut profile.", time: "9:40 AM" },
      { fromMe: false, text: "What is a 'Founder at Gerts'??", time: "9:41 AM" },
    ],
  },
  {
    id: "group",
    name: "CHEM 110 Group Project",
    subtitle: "4 members · 1 contributor",
    time: "Yesterday",
    unread: true,
    messages: [
      { fromMe: false, text: "Hey has anyone started the report?", time: "Mon" },
      { fromMe: false, text: "It's due in 2 hours", time: "Yesterday" },
      { fromMe: false, text: "Hello??", time: "Yesterday" },
    ],
  },
  {
    id: "landlord",
    name: "Landlord",
    subtitle: "Plateau Property Mgmt",
    time: "Tue",
    unread: false,
    messages: [
      { fromMe: false, text: "Rent was due on the 1st.", time: "Tue" },
      { fromMe: true, text: "Sorry, I'm humbled to announce I've been on a growth journey 🙏", time: "Tue" },
      { fromMe: false, text: "That is not a currency.", time: "Tue" },
    ],
  },
  {
    id: "advisor",
    name: "Academic Advisor",
    subtitle: "Faculty of Arts",
    time: "Nov 12",
    unread: false,
    messages: [
      { fromMe: false, text: "Following up on our meeting about your MATH 240 grade.", time: "Nov 10" },
      { fromMe: false, text: "And the one before that.", time: "Nov 12" },
    ],
  },
  {
    id: "recruiter",
    name: "Totally Real Recruiter",
    subtitle: "Talent Acquisition at Gerts",
    time: "Oct 30",
    unread: false,
    messages: [
      {
        fromMe: false,
        text: "Hi! I came across your profile and I think you'd be a GREAT fit for our Thursday night shift (unpaid).",
        time: "Oct 30",
      },
    ],
  },
];

export default function MessagingInbox() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const selected = CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0];

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-base font-semibold">Messaging</h1>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search messages you'll never answer"
            className="h-8 w-72 rounded bg-[#EDF3F8] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid min-h-[560px] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
        {/* Conversation list */}
        <ul className="divide-y border-b md:border-r md:border-b-0">
          {CONVERSATIONS.map((c) => {
            const active = c.id === selected.id;
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-accent ${
                    active ? "border-l-2 border-l-[var(--success)] bg-[#EBF4FD]" : "border-l-2 border-l-transparent"
                  }`}
                >
                  <Avatar name={c.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`truncate text-sm ${c.unread ? "font-semibold" : ""}`}>{c.name}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className={`truncate text-xs ${c.unread ? "font-semibold" : "text-muted-foreground"}`}>
                      {last.fromMe ? "You: " : ""}
                      {last.text}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Thread */}
        <section className="flex flex-col">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">{selected.name}</p>
            <p className="text-xs text-muted-foreground">{selected.subtitle}</p>
          </div>

          <ul className="flex-1 space-y-4 px-4 py-4">
            {selected.messages.map((m, i) => (
              <li key={i} className="flex gap-3">
                <Avatar name={m.fromMe ? "You" : selected.name} size={40} />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{m.fromMe ? "You" : selected.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">· {m.time}</span>
                  </p>
                  <p className="whitespace-pre-line text-sm">{m.text}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Disabled composer: the punchline */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 shrink-0" />
              Replying is disabled for your own protection. Your mom has read receipts on.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
