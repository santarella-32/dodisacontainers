// The gallery folders (site-assets/gallery/<folder>) hold both images and videos.
// Anything that renders a folder as <img> (Mãos à Obra, the landing carousel, the
// image picker) has to skip the videos, so this checks by file name — the storage
// listing doesn't reliably carry a mimetype for every object.
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|mkv|avi)$/i;

export function isVideoFile(name: string): boolean {
  return VIDEO_EXT.test(name);
}

// Supabase Free plan rejects any single upload over 50MB.
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
