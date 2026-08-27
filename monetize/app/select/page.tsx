import type { Metadata } from "next";
import { Suspense } from "react";
import { SELECT_DESCRIPTION, SELECT_TITLE } from "@/rain-select/config";
import { SelectTheme } from "@/rain-select/SelectTheme";
import { SelectLanding } from "@/rain-select/SelectLanding";

export const metadata: Metadata = {
  title: { absolute: SELECT_TITLE },
  description: SELECT_DESCRIPTION,
  applicationName: "RAIN Select",
  alternates: { canonical: "https://rainselect.com" },
  openGraph: {
    type: "website",
    url: "https://rainselect.com",
    siteName: "RAIN Select",
    title: SELECT_TITLE,
    description: SELECT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SELECT_TITLE,
    description: SELECT_DESCRIPTION,
  },
};

export default function SelectPage() {
  return (
    <>
      <SelectTheme />
      <Suspense fallback={null}>
        <SelectLanding />
      </Suspense>
    </>
  );
}
