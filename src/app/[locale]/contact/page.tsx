"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  Globe,
  MessageSquare,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaGithub, FaTiktok, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import MobileNav from "@/components/mobile-nav";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const tCommon = useTranslations("Common");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const faqItems = useMemo(
    () => [
      { question: t("faq1Question"), answer: t("faq1Answer") },
      { question: t("faq2Question"), answer: t("faq2Answer") },
      { question: t("faq3Question"), answer: t("faq3Answer") },
      { question: t("faq4Question"), answer: t("faq4Answer") },
    ],
    [t],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xblkaqka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-transparent dark:!bg-none">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {t("formTitle")}
                </CardTitle>
                <CardDescription>
                  {t("formDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("nameLabel")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t("namePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{tCommon("email")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={tCommon("emailPlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">{t("subjectLabel")}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t("subjectPlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">{t("messageLabel")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t("messagePlaceholder")}
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {t("submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t("submit")}
                      </>
                    )}
                  </Button>
                </form>

                {submitStatus === "success" && (
                  <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("successMessage")}
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("errorMessage")}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {tCommon("appName")}
                </CardTitle>
                <CardDescription>
                  {t("companyTagline")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">info@mindhouse.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">+90 (212) 555-0123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{t("location")}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">{t("workingHours")}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {t("supportChannelsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("technicalSupport")}</span>
                  <Badge variant="info">
                    {t("badgeFast")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("sales")}</span>
                  <Badge variant="success">
                    {t("badgeActive")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("partnership")}</span>
                  <Badge variant="purple">
                    {t("badgeOpen")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t("socialMediaTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <FaFacebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-colors"
                >
                  <FaInstagram className="h-4 w-4 mr-2 text-pink-600" />
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-black hover:border-black hover:text-white transition-colors"
                >
                  <FaXTwitter className="h-4 w-4 mr-2 text-black" />
                  X
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <FaLinkedin className="h-4 w-4 mr-2 text-blue-600" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                >
                  <FaYoutube className="h-4 w-4 mr-2 text-red-600" />
                  YouTube
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-colors"
                >
                  <FaGithub className="h-4 w-4 mr-2 text-gray-600" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-black hover:border-black hover:text-white transition-colors"
                >
                  <FaTiktok className="h-4 w-4 mr-2 text-black" />
                  TikTok
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("faqTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqItems.map((faq) => (
              <Card key={faq.question} className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}