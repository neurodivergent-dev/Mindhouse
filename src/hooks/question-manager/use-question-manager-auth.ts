import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { errorLogger } from "@/lib/error-logger";

export const useQuestionManagerAuth = (
  isAuthenticated: boolean | null,
  setIsAuthenticated: (value: boolean) => void,
) => {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Check if there's a real session
        const hasSession = Boolean(session?.access_token);

        // If session exists, test if it's actually working
        if (hasSession) {
          try {
            // Test: Try to fetch simple data from Supabase
            const testResult = await supabase.from("subjects").select("count").limit(1);

            // If there's an error or data is null, there's no real authentication
            if (testResult.error || testResult.data === null) {
              errorLogger.logError("Supabase authentication test failed", testResult.error, {
                context: "checkAuth",
                hasSession,
              });
              setIsAuthenticated(false);
              return;
            }

            setIsAuthenticated(true);
          } catch (error) {
            errorLogger.logError("Supabase connection test error", error, {
              context: "checkAuth",
              hasSession,
            });
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        errorLogger.logError("Authentication check error", error, {
          context: "checkAuth",
        });
        setIsAuthenticated(false);
      }
    };

    // Only run auth check if authentication status is null (initial load)
    if (isAuthenticated === null) {
      checkAuth();
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Test authentication when signed in
        try {
          const testResult = await supabase.from("subjects").select("count").limit(1);
          if (testResult.error || testResult.data === null) {
            errorLogger.logError("Authentication test failed after sign in", testResult.error, {
              context: "authStateChange",
              event,
            });
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          errorLogger.logError("Authentication test error after sign in", error, {
            context: "authStateChange",
            event,
          });
          setIsAuthenticated(false);
        }
      } else if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated, setIsAuthenticated]);

  return { isAuthenticated };
};
