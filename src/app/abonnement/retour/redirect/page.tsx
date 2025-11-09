export const dynamic = "force-dynamic";
export const revalidate = 0;

import RedirectClient from "./RedirectClient";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <RedirectClient sp={searchParams} />;
}
