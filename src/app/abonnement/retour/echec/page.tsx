export const dynamic = "force-dynamic";
export const revalidate = 0;

import EchecClient from "./EchecClient";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <EchecClient sp={searchParams} />;
}
