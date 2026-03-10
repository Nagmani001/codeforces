import { ResetPasswordForm } from "./reset-password-form"

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  // Next.js 16: dynamic APIs like `params`/`searchParams` can be Promises.
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const slugToken = typeof resolvedParams?.slug === "string" ? safeDecodeURIComponent(resolvedParams.slug) : ""
  const queryTokenRaw = resolvedSearchParams?.token
  const queryToken =
    typeof queryTokenRaw === "string"
      ? safeDecodeURIComponent(queryTokenRaw)
      : Array.isArray(queryTokenRaw) && typeof queryTokenRaw[0] === "string"
        ? safeDecodeURIComponent(queryTokenRaw[0])
        : ""

  const token = slugToken || queryToken

  return <ResetPasswordForm token={token} />
}
