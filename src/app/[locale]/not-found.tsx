import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("description")}</p>
      <Button asChild>
        <Link href="/landing">{t("backHome")}</Link>
      </Button>
    </div>
  );
}