import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Channel, ChannelWithCount } from "@/types";

export interface ChannelDisplay extends Channel {
  conversationCount: number;
}

export function useChannels() {
  const [channels, setChannels] = useState<ChannelDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("channels")
        .select("*, conversations(count)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (fetchError) {
        console.error("Failed to fetch channels:", fetchError);
        setError("errors.loadChannels");
        setLoading(false);
        return;
      }

      const mapped: ChannelDisplay[] = (data as ChannelWithCount[]).map(
        (ch) => ({
          id: ch.id,
          name: ch.name,
          slug: ch.slug,
          description: ch.description,
          icon: ch.icon,
          sort_order: ch.sort_order,
          is_active: ch.is_active,
          created_at: ch.created_at,
          conversationCount: ch.conversations?.[0]?.count ?? 0,
        })
      );

      setChannels(mapped);
      setLoading(false);
    }

    fetchChannels();
  }, []);

  return { channels, loading, error };
}
