import { Anime } from "../types";

export async function getFavorites(): Promise<Anime[]> {
  const response = await fetch("/api/favorites");
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
}

export async function addToFavorites(anime: Anime): Promise<void> {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(anime),
  });
  if (!response.ok) throw new Error("Failed to add favorite");
}

export async function removeFromFavorites(id: string): Promise<void> {
  const response = await fetch(`/api/favorites/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove favorite");
}

export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((a) => a.id === id);
}
