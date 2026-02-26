"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Channel } from "@/types";
import Map from "@/components/map";

export default function ChannelPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannel() {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        router.replace("/");
        return;
      }

      setChannel(data as Channel);
      setLoading(false);
    }

    fetchChannel();
  }, [params.slug, router]);

  if (loading || !channel) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-500" />
      </div>
    );
  }

  return (
    <main className="h-screen w-screen">
      <Map channelId={channel.id} channelName={channel.name} channelSlug={channel.slug} initialConversationId={searchParams.get("c") ?? undefined} />
    </main>
  );
}
