import { Song } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const useLoadSongUrl = (song: Song) => {
  const supabase = useSupabaseClient();

  if (!song) {
    return "";
  }

  const { data: songData } = supabase.storage
    .from("songs")
    .getPublicUrl(song.song_path);
  return songData.publicUrl;
};

export default useLoadSongUrl;
