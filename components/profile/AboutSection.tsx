import Section from "@/components/profile/Section";

type Props = { bio: string | null | undefined; isMe: boolean };

// LinkedIn-style "About" card with the profile's short bio (max 200 characters)
export default function AboutSection({ bio, isMe }: Props) {
  const text = bio?.trim();
  if (!text && !isMe) return null; // nothing to show on other people's profiles

  return (
    <Section title="About">
      {text ? (
        <p className="whitespace-pre-line text-sm">{text}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No bio yet. Use <span className="font-semibold">Edit profile</span> to tell people what you&apos;re
          (not) working on.
        </p>
      )}
    </Section>
  );
}
