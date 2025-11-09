export const dynamic = "force-dynamic";
export const revalidate = 0;

import SuccessClient from "./SuccessClient";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <SuccessClient sp={searchParams} />;
}
