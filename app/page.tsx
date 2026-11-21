export default function Home() {
  return (
    <div className="p-8 space-y-4">
      <div className="bg-card border rounded-lg p-4">
        I am a white card on a grey background
      </div>
      <button className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 font-semibold">
        Connect
      </button>
      <p className="text-muted-foreground">3h • Edited</p>
    </div>
  );
}