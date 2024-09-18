import { WelcomeDialog } from "@/components/WelcomeDialog";
import { TweetComposer } from "../components/TweetComposer";
import { Rules } from "@/components/Rules";

export default function Home() {
  return (
    <main className="h-screen">
      <TweetComposer />
      <WelcomeDialog />
      <Rules />
    </main>
  );
}
