import { del } from "@vercel/blob";
import { getImageProposalPathnames } from "@/lib/product/media-proposals";

export async function deleteImageProposalBlobs(payload: unknown) {
  const pathnames = getImageProposalPathnames(payload);

  if (pathnames.length === 0) {
    return;
  }

  try {
    await del(pathnames);
  } catch (error) {
    console.error("Unable to delete rejected proposal blobs", error);
  }
}
