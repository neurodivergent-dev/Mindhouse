"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { CloudSyncService } from "@/services/cloud-sync-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Cloud,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Database,
  Upload,
  Download,
  TestTube,
} from "lucide-react";

interface SyncStatus {
  hasLocalData: boolean;
  hasCloudData: boolean;
  localCounts: {
    subjects: number;
    questions: number;
  };
  cloudCounts: {
    subjects: number;
    questions: number;
  };
}

type SyncAction = "upload" | "download" | "fullSync" | "connectionTest" | "";

interface SyncState {
  isLoading: boolean;
  error: string | null;
  lastAction: SyncAction;
  syncStatus: SyncStatus | null;
}

export function CloudSyncManager() {
  const t = useTranslations("CloudSync");
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<SyncState>({
    isLoading: false,
    error: null,
    lastAction: "",
    syncStatus: null,
  });

  const updateState = (updates: Partial<SyncState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const checkSyncStatus = async () => {
    updateState({ isLoading: true, error: null });

    try {
      const status = await CloudSyncService.getSyncStatus();
      updateState({
        isLoading: false,
        syncStatus: status,
        error: null,
      });
    } catch (error) {
      updateState({
        isLoading: false,
        error: t("syncStatusCheckFailed", { error: String(error) }),
      });
    }
  };

  // Silent version for refresh after sync operations
  const checkSyncStatusSilently = async () => {
    try {
      const status = await CloudSyncService.getSyncStatus();
      updateState({
        syncStatus: status,
        error: null,
      });
    } catch {
      // Silent error handling - don't show errors or loading states
    }
  };

  const handleSyncAction = async (
    action: () => Promise<{ success: boolean; message?: string }>,
    actionKey: SyncAction,
    actionLabel: string,
  ) => {
    updateState({ lastAction: actionKey, isLoading: true, error: null });

    try {
      const result = await action();

      if (result.success) {
        updateState({
          isLoading: false,
          error: null,
        });

        // Refresh status silently after sync action
        setTimeout(() => {
          checkSyncStatusSilently();
        }, 1000);
      } else {
        updateState({
          isLoading: false,
          error: result.message || null,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = t("actionError", { action: actionLabel, error: String(error) });
      updateState({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, message: errorMessage };
    }
  };

  const syncLocalToCloud = () => {
    void handleSyncAction(CloudSyncService.syncLocalToCloud, "upload", t("uploadAction"));
  };
  const syncCloudToLocal = () => {
    void handleSyncAction(CloudSyncService.syncCloudToLocal, "download", t("downloadAction"));
  };
  const fullSync = () => {
    void handleSyncAction(CloudSyncService.fullSync, "fullSync", t("fullSyncAction"));
  };
  const testConnection = () => {
    void handleSyncAction(
      CloudSyncService.testCloudConnection,
      "connectionTest",
      t("connectionTestAction"),
    );
  };

  const clearError = () => {
    updateState({ error: null });
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("loginRequiredDesc")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { syncStatus, isLoading, error, lastAction } = state;
  const hasLocalData = syncStatus?.hasLocalData || false;
  const hasCloudData = syncStatus?.hasCloudData || false;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("accountSyncDesc", { email: user?.email ?? "" })}</CardDescription>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              {t("clear")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Check Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t("dataStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => void checkSyncStatus()} disabled={isLoading} variant="outline">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {t("checkStatus")}
            </Button>

            {syncStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local Data */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-medium">{t("localData")}</span>
                    <Badge variant={hasLocalData ? "default" : "secondary"}>
                      {hasLocalData ? t("available") : t("notAvailable")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      📚 {t("subjects")}: {syncStatus.localCounts.subjects}
                    </div>
                    <div>
                      ❓ {t("questions")}: {syncStatus.localCounts.questions}
                    </div>
                  </div>
                </div>

                {/* Cloud Data */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <span className="font-medium">{t("cloudData")}</span>
                    <Badge variant={hasCloudData ? "default" : "secondary"}>
                      {hasCloudData ? t("available") : t("notAvailable")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      📚 {t("subjects")}: {syncStatus.cloudCounts.subjects}
                    </div>
                    <div>
                      ❓ {t("questions")}: {syncStatus.cloudCounts.questions}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {t("syncOperations")}
          </CardTitle>
          <CardDescription>{t("syncDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload to Cloud */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="font-medium">{t("uploadToCloud")}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("uploadDesc")}</p>
              <Button
                onClick={syncLocalToCloud}
                disabled={isLoading || !hasLocalData}
                variant="outline"
                className="w-full"
              >
                {isLoading && lastAction === "upload" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {t("localToCloud")}
              </Button>
            </div>

            {/* Download from Cloud */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">{t("downloadFromCloud")}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("downloadDesc")}</p>
              <Button
                onClick={syncCloudToLocal}
                disabled={isLoading || !hasCloudData}
                variant="outline"
                className="w-full"
              >
                {isLoading && lastAction === "download" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {t("cloudToLocal")}
              </Button>
            </div>

            {/* Full Sync */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">{t("fullSync")}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("fullSyncDesc")}</p>
              <Button
                onClick={fullSync}
                disabled={isLoading || (!hasLocalData && !hasCloudData)}
                className="w-full"
              >
                {isLoading && lastAction === "fullSync" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t("fullSync")}
              </Button>
            </div>

            {/* Test Connection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span className="font-medium">{t("connectionTest")}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("connectionTestDesc")}</p>
              <Button
                onClick={testConnection}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading && lastAction === "connectionTest" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                {t("testConnection")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {syncStatus && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("recommendations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!hasLocalData && !hasCloudData && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t("noDataYet")}</AlertDescription>
                </Alert>
              )}

              {hasLocalData && !hasCloudData && (
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>{t("localOnly")}</AlertDescription>
                </Alert>
              )}

              {!hasLocalData && hasCloudData && (
                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertDescription>{t("cloudOnly")}</AlertDescription>
                </Alert>
              )}

              {hasLocalData && hasCloudData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{t("bothData")}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
