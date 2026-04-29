import { Anime } from "../types";

export async function fetchAnimes(): Promise<Anime[]> {
  const res = await fetch("/api/animes");
  if (!res.ok) throw new Error("Failed to fetch animes");
  return res.json();
}

export async function fetchAnimeById(id: string): Promise<Anime> {
  const res = await fetch(`/api/animes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch anime");
  return res.json();
}
