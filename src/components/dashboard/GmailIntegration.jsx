import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Code,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../context/AuthContext";
import {
  initGmailApi,
  isSignedInToGoogle,
  signInToGoogle,
  signOutFromGoogle,
  fetchJobEmails,
} from "../../services/gmail/gmailApi";
import { storeJobApplicationsFromGmail } from "../../services/gmail/gmailFirestore";

const GmailIntegration = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const [isDev, setIsDev] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const hostname = window.location.hostname;
    const isDevEnvironment =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.includes("preview") ||
      hostname.includes("lovable");

    setIsDev(isDevEnvironment);
    setMockMode(window.location.search.includes("mock=true"));
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType(null);

        console.log("Initializing Gmail API...");
        await initGmailApi();
        console.log("Gmail API initialized successfully");

        setInitialized(true);

        const signedIn = isSignedInToGoogle();
        setConnected(signedIn);

        const savedAutoSync = localStorage.getItem("gmail_auto_sync");
        if (savedAutoSync) {
          setAutoSync(savedAutoSync === "true");
        }

        const savedLastSynced = localStorage.getItem("gmail_last_synced");
        if (savedLastSynced) {
          setLastSynced(new Date(savedLastSynced));
        }
      } catch (err) {
        console.error("Error initializing Gmail API:", err);

        if (err.code === "domain-not-authorized") {
          setError(
            "Your domain is not authorized for Google OAuth. This is expected in preview environments."
          );
          setErrorType("domain-not-authorized");
        } else if (err.code === "api-permission-denied") {
          setError(
            "API access denied. The Gmail API may not be enabled for this project."
          );
          setErrorType("api-permission-denied");
        } else {
          setError("Failed to initialize Gmail API. Please try again later.");
          setErrorType("general-error");
        }

        setInitAttempts((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    if (!initialized && initAttempts < 3) {
      initialize();
    }
  }, [initialized, initAttempts]);

  useEffect(() => {
    if (!autoSync || !connected) return;

    const now = new Date();
    const shouldSync =
      !lastSynced || now.getTime() - lastSynced.getTime() > 24 * 60 * 60 * 1000;

    if (shouldSync) {
      handleSyncEmails();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const lastSync = lastSynced || new Date(0);

      if (now.getTime() - lastSync.getTime() > 24 * 60 * 60 * 1000) {
        handleSyncEmails();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSync, connected, lastSynced]);

  const handleToggleAutoSync = (checked) => {
    setAutoSync(checked);
    localStorage.setItem("gmail_auto_sync", checked.toString());
  };

  const handleToggleMockMode = () => {
    const newMockMode = !mockMode;
    setMockMode(newMockMode);

    if (newMockMode) {
      window.location.search = window.location.search
        ? window.location.search + "&mock=true"
        : "?mock=true";
    } else {
      const url = new URL(window.location);
      url.searchParams.delete("mock");
      window.location.href = url.toString();
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!initialized) {
        await initGmailApi();
        setInitialized(true);
      }

      await signInToGoogle();
      setConnected(true);
      toast({
        title: "Gmail account connected",
        description: "Your Gmail account is now linked to JobTrackr.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error connecting to Gmail:", err);
      setError("Failed to connect to Gmail. Please try again.");
      toast({
        title: "Connection failed",
        description: "Could not connect to Gmail. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await signOutFromGoogle();
      setConnected(false);
      toast({
        title: "Gmail account disconnected",
        description: "Your Gmail account has been unlinked from JobTrackr.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error disconnecting from Gmail:", err);
      toast({
        title: "Disconnection failed",
        description: "Could not disconnect from Gmail. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEmails = async () => {
    if (!connected || syncing) return;

    try {
      setSyncing(true);
      setError(null);
      setSyncResults(null);

      const jobEmails = await fetchJobEmails();

      const results = await storeJobApplicationsFromGmail(jobEmails);

      const now = new Date();
      setLastSynced(now);
      localStorage.setItem("gmail_last_synced", now.toISOString());

      setSyncResults(results);

      toast({
        title: "Sync completed",
        description: `Found ${results.total} job applications, added ${results.new} new ones.`,
        duration: 5000,
      });
    } catch (err) {
      console.error("Error syncing emails:", err);
      setError("Failed to sync emails. Please try again.");
      toast({
        title: "Sync failed",
        description:
          "Could not sync your job application emails. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleRetryInitialization = async () => {
    setInitAttempts(0);
    setInitialized(false);
    setError(null);
    setErrorType(null);
  };

  if (!initialized && !error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gmail Integration</CardTitle>
          <CardDescription>
            Automatically import job applications from your Gmail
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Gmail Integration Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>

          {errorType === "domain-not-authorized" && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">
                This is a common issue in development environments:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  The domain you're accessing from isn't authorized in Google
                  Cloud Console
                </li>
                <li>
                  In a production environment, add your domain to the OAuth
                  consent screen
                </li>
                <li>
                  For development, use localhost or authorized domains only
                </li>
              </ol>
              <p className="mt-2">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Go to Google Cloud Console
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>

              {isDev && (
                <div className="mt-4 p-3 bg-primary/10 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Code className="w-4 h-4 mr-1" />
                    Developer Options
                  </h3>
                  <p className="text-xs mb-2">
                    In development environments, you can use mock data to test
                    the Gmail integration without OAuth:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleMockMode}
                  >
                    {mockMode ? "Disable Mock Mode" : "Enable Mock Mode"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {errorType === "api-permission-denied" && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">This may be due to:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Gmail API not enabled in Google Cloud Console</li>
                <li>API key restrictions preventing access</li>
                <li>Missing OAuth scopes or permissions</li>
              </ol>
              <p className="mt-2">
                <a
                  href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Enable Gmail API
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>

              {isDev && (
                <div className="mt-4 p-3 bg-primary/10 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Code className="w-4 h-4 mr-1" />
                    Developer Options
                  </h3>
                  <p className="text-xs mb-2">
                    In development environments, you can use mock data to test
                    the Gmail integration without API keys:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleMockMode}
                  >
                    {mockMode ? "Disable Mock Mode" : "Enable Mock Mode"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            Note: This feature requires proper setup in Google Cloud Console and
            may not work in preview environments.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={handleRetryInitialization} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>

          {mockMode && (
            <Button variant="default" onClick={handleConnect}>
              Use Mock Data
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Gmail Integration{" "}
          {mockMode && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
              Mock Mode
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to automatically import job applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Connection Status</h3>
            <p className="text-sm text-muted-foreground">
              {connected ? "Connected to Gmail" : "Not connected"}
            </p>
          </div>
          {!loading ? (
            connected ? (
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                size="sm"
              >
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect} variant="default" size="sm">
                Connect
              </Button>
            )
          ) : (
            <Button disabled variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
        </div>

        {connected && (
          <>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <h3 className="text-sm font-medium">Auto-Sync Daily</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically sync job applications once per day
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={handleToggleAutoSync}
                disabled={!connected}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <h3 className="text-sm font-medium">Last Synced</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(lastSynced)}
                </p>
              </div>
              <Button
                onClick={handleSyncEmails}
                variant="outline"
                size="sm"
                disabled={syncing || !connected}
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {syncResults && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h3 className="text-sm font-medium mb-2">Last Sync Results</h3>
                <p className="text-sm">
                  Found {syncResults.total} job application emails
                </p>
                <p className="text-sm">
                  Added {syncResults.new} new applications
                </p>
              </div>
            )}
          </>
        )}

        {isDev && (
          <div className="mt-4 p-3 border border-dashed border-muted-foreground/20 rounded-md">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Code className="w-4 h-4 mr-1" />
              Developer Options
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-xs">Mock Mode (for testing without OAuth)</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleMockMode}
              >
                {mockMode ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 text-xs text-muted-foreground align-center p-4 rounded-b-md">
        <p>
          JobTrackr only retrieves job application related emails and stores
          minimal data.
        </p>
      </CardFooter>
    </Card>
  );
};

export default GmailIntegration;
