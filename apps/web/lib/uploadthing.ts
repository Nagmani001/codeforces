import { generateUploadButton } from "@uploadthing/react";

export const UploadButton: any = generateUploadButton({
  url: "http://localhost:3001/api/profile/api/uploadthing",
});
