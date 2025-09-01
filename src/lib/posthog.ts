"use client";

import { usePostHog } from "posthog-js/react";
import posthog from "posthog-js";

// Hook to use PostHog in components
export function usePostHogAnalytics() {
  const posthog = usePostHog();
  return posthog;
}

// Utility functions for common analytics events
export const analytics = {
  // Track user sign up
  trackSignUp: (method: string, properties?: Record<string, unknown>) => {
    posthog.capture("user_signed_up", {
      method,
      ...properties,
    });
  },

  // Track user sign in
  trackSignIn: (method: string, properties?: Record<string, unknown>) => {
    posthog.capture("user_signed_in", {
      method,
      ...properties,
    });
  },

  // Track feature usage
  trackFeatureUsage: (
    feature: string,
    properties?: Record<string, unknown>
  ) => {
    posthog.capture("feature_used", {
      feature,
      ...properties,
    });
  },

  // Track button clicks
  trackButtonClick: (
    buttonName: string,
    properties?: Record<string, unknown>
  ) => {
    posthog.capture("button_clicked", {
      button_name: buttonName,
      ...properties,
    });
  },

  // Track form submissions
  trackFormSubmission: (
    formName: string,
    properties?: Record<string, unknown>
  ) => {
    posthog.capture("form_submitted", {
      form_name: formName,
      ...properties,
    });
  },

  // Track errors
  trackError: (error: string, properties?: Record<string, unknown>) => {
    posthog.capture("error_occurred", {
      error,
      ...properties,
    });
  },

  // Set user properties
  setUserProperties: (properties: Record<string, unknown>) => {
    posthog.people.set(properties);
  },

  // Identify user with email
  identify: (
    userId: string,
    email: string,
    properties?: Record<string, unknown>
  ) => {
    posthog.identify(userId, {
      email,
      $email: email, // PostHog specific email property
      ...properties,
    });
  },

  // Identify user by email only (when you don't have a userId)
  identifyByEmail: (email: string, properties?: Record<string, unknown>) => {
    posthog.identify(email, {
      email,
      $email: email,
      ...properties,
    });
  },

  // Set user properties including email
  setUserPropertiesWithEmail: (
    email: string,
    properties: Record<string, unknown>
  ) => {
    posthog.people.set({
      email,
      $email: email,
      ...properties,
    });
  },

  // Reset user (for logout)
  reset: () => {
    posthog.reset();
  },
};

// Custom hook for tracking page views
export function usePageView() {
  const posthog = usePostHog();

  return (pageName: string, properties?: Record<string, unknown>) => {
    posthog.capture("$pageview", {
      page_name: pageName,
      ...properties,
    });
  };
}

// Custom hook for tracking custom events
export function useTrackEvent() {
  const posthog = usePostHog();

  return (eventName: string, properties?: Record<string, unknown>) => {
    posthog.capture(eventName, properties);
  };
}

// Hook for user identification with email
export function useUserIdentification() {
  const posthog = usePostHog();

  return {
    identifyUser: (
      userId: string,
      email: string,
      properties?: Record<string, unknown>
    ) => {
      posthog.identify(userId, {
        email,
        $email: email,
        ...properties,
      });
    },
    identifyByEmail: (email: string, properties?: Record<string, unknown>) => {
      posthog.identify(email, {
        email,
        $email: email,
        ...properties,
      });
    },
    setUserProperties: (email: string, properties: Record<string, unknown>) => {
      posthog.people.set({
        email,
        $email: email,
        ...properties,
      });
    },
  };
}

// Hook for tracking user actions with email context
export function useUserTracking() {
  const posthog = usePostHog();

  return {
    // Track user action with email context
    trackUserAction: (
      action: string,
      email: string,
      properties?: Record<string, unknown>
    ) => {
      posthog.capture(action, {
        email,
        user_email: email,
        ...properties,
      });
    },

    // Track feature usage with email
    trackFeatureUsage: (
      feature: string,
      email: string,
      properties?: Record<string, unknown>
    ) => {
      posthog.capture("feature_used", {
        feature,
        email,
        user_email: email,
        ...properties,
      });
    },

    // Track page view with email
    trackPageView: (
      pageName: string,
      email: string,
      properties?: Record<string, unknown>
    ) => {
      posthog.capture("$pageview", {
        page_name: pageName,
        email,
        user_email: email,
        ...properties,
      });
    },

    // Track integration usage
    trackIntegrationUsage: (
      integration: string,
      dataSource: string,
      email: string,
      properties?: Record<string, unknown>
    ) => {
      posthog.capture("integration_used", {
        integration,
        data_source: dataSource,
        email,
        user_email: email,
        ...properties,
      });
    },

    // Track record operations
    trackRecordOperation: (
      operation: "create" | "update" | "delete",
      appObjectKey: string,
      email: string,
      properties?: Record<string, unknown>
    ) => {
      posthog.capture("record_operation", {
        operation,
        app_object_key: appObjectKey,
        email,
        user_email: email,
        ...properties,
      });
    },
  };
}
