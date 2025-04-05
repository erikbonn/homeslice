import { api, HydrateClient } from "@/trpc/server";
import ScrollAnimation from "./_components/ScrollAnimation";
import StickyFooter from "./_components/StickyFooter";

export default async function Home() {
  return (
    <HydrateClient>
      <ScrollAnimation />
      <StickyFooter />
    </HydrateClient>
  );
}
