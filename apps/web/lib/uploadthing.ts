import { generateUploadButton } from "@uploadthing/react";

export const UploadButton: any = generateUploadButton({
  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/api/uploadthing`,
});
