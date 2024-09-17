import { WelcomeDialog } from "@/components/WelcomeDialog";
import { TweetComposer } from "../components/TweetComposer";

export default function Home() {
  return (
    <main className="h-screen">
      <TweetComposer />
      <WelcomeDialog />
    </main>
  );
}
