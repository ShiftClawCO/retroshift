"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Loader2 } from "lucide-react";

export default function PricingPage() {
  const t = useTranslations();
  const { user, isPro, isLoading } = useUser();
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);

  const handleUpgrade = async () => {
    setLoading("checkout");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to open billing portal. Please try again.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("home.pricingTitle")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-muted-foreground" />
                {t("home.pricingFreeTitle")}
              </CardTitle>
              <CardDescription>{t("home.pricingFreeDesc")}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-muted-foreground ml-2">
                  {t("home.pricingFreePeriod")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingFree1")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingFree2")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingFree3")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingFree4")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingFree5")}
                </li>
              </ul>
              {!user && (
                <Button asChild className="w-full mt-6">
                  <Link href="/create">{t("home.pricingFreeCta")}</Link>
                </Button>
              )}
              {user && !isPro && (
                <Button variant="outline" className="w-full mt-6" disabled>
                  {t("pricing.currentPlan")}
                </Button>
              )}
              {user && isPro && (
                <Button asChild variant="outline" className="w-full mt-6">
                  <Link href="/create">{t("home.pricingFreeCta")}</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary/50 relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="gap-1">
                <Crown className="w-3 h-3" />
                {t("home.pricingPopular")}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                {t("home.pricingProTitle")}
              </CardTitle>
              <CardDescription>{t("home.pricingProDesc")}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€9</span>
                <span className="text-muted-foreground ml-1">
                  {t("home.pricingProPeriod")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingPro1")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingPro2")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingPro3")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingPro4")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  {t("home.pricingPro5")}
                </li>
              </ul>
              
              {isLoading && (
                <Button className="w-full mt-6" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </Button>
              )}
              
              {!isLoading && !user && (
                <Button asChild className="w-full mt-6">
                  <Link href="/login?redirect=/pricing">
                    {t("pricing.loginToUpgrade")}
                  </Link>
                </Button>
              )}
              
              {!isLoading && user && !isPro && (
                <Button
                  className="w-full mt-6"
                  onClick={handleUpgrade}
                  disabled={loading === "checkout"}
                >
                  {loading === "checkout" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t("pricing.upgradeToPro")}
                </Button>
              )}
              
              {!isLoading && user && isPro && (
                <Button
                  variant="outline"
                  className="w-full mt-6"
                  onClick={handleManage}
                  disabled={loading === "portal"}
                >
                  {loading === "portal" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t("pricing.manageSubscription")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center text-muted-foreground">
          <p>{t("pricing.cancelAnytime")}</p>
        </div>
      </section>
    </div>
  );
}
