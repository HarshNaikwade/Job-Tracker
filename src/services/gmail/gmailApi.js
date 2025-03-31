// Load API key, client ID, and config endpoint from Vite environment variables
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CONFIG_ENDPOINT = import.meta.env.VITE_CONFIG_ENDPOINT;

// Discovery docs remain static
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];

// These variables will be loaded from GCP
let SCOPES = "";
let AUTHORIZED_DOMAINS = [];

// Function to fetch configuration from GCP
const fetchGCPConfig = async () => {
  try {
    const response = await fetch(CONFIG_ENDPOINT);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch config from GCP. Status: ${response.status}`
      );
    }
    const config = await response.json();
    // Expected config format: { SCOPES: "https://www.googleapis.com/auth/gmail.readonly", AUTHORIZED_DOMAINS: ["localhost", "example.com", ...] }
    SCOPES = config.SCOPES;
    AUTHORIZED_DOMAINS = config.AUTHORIZED_DOMAINS;
    console.info("Fetched config from GCP:", config);
    return config;
  } catch (error) {
    console.error("Error fetching GCP config:", error);
    throw error;
  }
};

// Check if we're in development mode
const isDevelopmentMode = () => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("preview") ||
    window.location.hostname.includes("lovable")
  );
};

// Keywords for job application detection
const JOB_KEYWORDS_SUBJECT = [
  "application received",
  "application confirmation",
  "interview",
  "job offer",
  "offer letter",
  "thank you for applying",
  "application status",
  "position",
  "recruitment",
  "hiring process",
];

const JOB_DOMAINS = [
  "linkedin.com",
  "indeed.com",
  "monster.com",
  "glassdoor.com",
  "ziprecruiter.com",
  "dice.com",
  "lever.co",
  "greenhouse.io",
  "workday.com",
  "taleo.net",
  "jobvite.com",
];

// Initialize the Google API client
export const initGmailApi = async () => {
  try {
    // First, load config from GCP to get SCOPES and AUTHORIZED_DOMAINS
    await fetchGCPConfig();

    console.log("Initializing Gmail API...");

    // Check if we're running in a preview/development environment
    const isDevMode = isDevelopmentMode();

    if (isDevMode) {
      console.warn("Running in development/preview environment.");
      console.info("For Gmail integration to work, you must:");
      console.info(
        "1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials"
      );
      console.info(
        '2. Add your current domain to the "Authorized JavaScript origins" in your OAuth client'
      );
      console.info("3. Enable the Gmail API for your project");
      console.info("4. Make sure your API key has proper permissions");
      console.info("Current domain:", window.location.origin);
      console.info(
        "Authorized domains that should be added:",
        AUTHORIZED_DOMAINS.join(", ")
      );
    }

    // If in mock mode for development
    if (isDevMode && window.location.search.includes("mock=true")) {
      console.info("Using mock Gmail API for development");
      return Promise.resolve({ isMock: true });
    }

    // If gapi is already loaded, just initialize the client
    if (window.gapi && window.gapi.client) {
      await initializeGapiClient();
      return window.gapi;
    }

    // Load the Google API client script dynamically
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;

    // Return a promise that resolves when gapi is ready
    return new Promise((resolve, reject) => {
      script.onload = () => {
        window.gapi.load("client:auth2", async () => {
          try {
            await initializeGapiClient();
            resolve(window.gapi);
          } catch (error) {
            handleGapiError(error, reject);
          }
        });
      };
      script.onerror = (error) => {
        console.error("Error loading Gmail API script:", error);
        reject(new Error("Failed to load Google API client script"));
      };
      document.body.appendChild(script);
    });
  } catch (error) {
    console.error("Error during Gmail API initialization:", error);
    throw error;
  }
};

// Helper function to handle GAPI errors
const handleGapiError = (error, reject) => {
  console.error("Error initializing gapi client:", error);

  if (error.error === "idpiframe_initialization_failed") {
    console.error("Domain not authorized for OAuth:", error.details);
    if (reject) {
      reject({
        code: "domain-not-authorized",
        message:
          "This domain is not authorized for Google OAuth. Please add it to your Google Cloud Console.",
        originalError: error,
        helpLink: "https://console.cloud.google.com/apis/credentials",
      });
    }
  } else if (error.status === 403) {
    console.error("API key or permissions issue:", error);
    if (reject) {
      reject({
        code: "api-permission-denied",
        message:
          "API access denied. Check if the Gmail API is enabled and API key restrictions.",
        originalError: error,
        helpLink:
          "https://console.cloud.google.com/apis/library/gmail.googleapis.com",
      });
    }
  } else {
    if (reject) {
      reject(error);
    }
  }
};

// Helper function to initialize the gapi client with the fetched SCOPES value
const initializeGapiClient = async () => {
  try {
    await window.gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
    return window.gapi;
  } catch (error) {
    console.error("Error initializing gapi client:", error);
    throw error;
  }
};

// Check if user is signed in to Google
export const isSignedInToGoogle = () => {
  // For mock mode in development
  if (isDevelopmentMode() && window.location.search.includes("mock=true")) {
    return window.localStorage.getItem("mockGoogleSignIn") === "true";
  }

  if (!window.gapi || !window.gapi.auth2) {
    console.warn("Google API not fully loaded when checking sign-in status");
    return false;
  }

  try {
    return window.gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    console.error("Error checking Google sign-in status:", error);
    return false;
  }
};

// Sign in to Google
export const signInToGoogle = () => {
  // For mock mode in development
  if (isDevelopmentMode() && window.location.search.includes("mock=true")) {
    window.localStorage.setItem("mockGoogleSignIn", "true");
    return Promise.resolve({ id: "mock-user", name: "Mock User" });
  }

  if (!window.gapi || !window.gapi.auth2) {
    return Promise.reject(new Error("Google API not loaded"));
  }

  try {
    return window.gapi.auth2.getAuthInstance().signIn();
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return Promise.reject(error);
  }
};

// Sign out from Google
export const signOutFromGoogle = () => {
  // For mock mode in development
  if (isDevelopmentMode() && window.location.search.includes("mock=true")) {
    window.localStorage.removeItem("mockGoogleSignIn");
    return Promise.resolve();
  }

  if (!window.gapi || !window.gapi.auth2) {
    return Promise.reject(new Error("Google API not loaded"));
  }

  try {
    return window.gapi.auth2.getAuthInstance().signOut();
  } catch (error) {
    console.error("Error during Google sign-out:", error);
    return Promise.reject(error);
  }
};

// Get user's Gmail inbox for job applications
export const fetchJobEmails = async (maxResults = 100) => {
  try {
    // For mock mode in development
    if (isDevelopmentMode() && window.location.search.includes("mock=true")) {
      console.log("Using mock data for fetchJobEmails");
      return getMockJobEmails();
    }

    if (!isSignedInToGoogle()) {
      throw new Error("User not signed in to Google");
    }

    // Get message IDs matching our criteria
    const messageListResponse =
      await window.gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: maxResults,
        q: JOB_KEYWORDS_SUBJECT.map((keyword) => `subject:(${keyword})`).join(
          " OR "
        ),
      });

    const messageIds = messageListResponse.result.messages || [];
    const jobApplications = [];

    // Fetch details for each message
    for (const message of messageIds) {
      const messageResponse = await window.gapi.client.gmail.users.messages.get(
        {
          userId: "me",
          id: message.id,
          format: "full",
        }
      );

      const email = parseEmail(messageResponse.result);

      // Check if this is a job-related email
      if (isJobRelatedEmail(email)) {
        const applicationData = extractJobData(email);
        if (applicationData) {
          jobApplications.push(applicationData);
        }
      }
    }

    return jobApplications;
  } catch (error) {
    console.error("Error fetching job emails:", error);
    throw error;
  }
};

// Generate mock data for development testing
const getMockJobEmails = () => {
  const mockCompanies = [
    "TechCorp",
    "DevInc",
    "CodeMasters",
    "WebSolutions",
    "DataSystems",
  ];
  const mockRoles = [
    "Frontend Developer",
    "React Engineer",
    "Full Stack Developer",
    "UI Engineer",
    "JavaScript Developer",
  ];

  return Array(5)
    .fill()
    .map((_, i) => ({
      companyName: mockCompanies[i % mockCompanies.length],
      jobRole: mockRoles[i % mockRoles.length],
      status: i % 3 === 0 ? "Interviewing" : i % 4 === 0 ? "Offer" : "Applied",
      dateApplied: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
      source: "Gmail",
      emailId: `mock-email-${i}`,
      notes: `This is mock data for development - application ${i + 1}`,
    }));
};

// Parse Gmail API response into a usable email object
const parseEmail = (message) => {
  const headers = message.payload.headers;
  const subject =
    headers.find((header) => header.name === "Subject")?.value || "";
  const from = headers.find((header) => header.name === "From")?.value || "";
  const date = headers.find((header) => header.name === "Date")?.value || "";

  // Extract message body
  let body = "";
  if (message.payload.parts && message.payload.parts.length) {
    // Prefer a text/plain part if available
    const textPart = message.payload.parts.find(
      (part) => part.mimeType === "text/plain"
    );
    if (textPart && textPart.body.data) {
      body = decodeBase64(textPart.body.data);
    } else if (message.payload.parts[0].body.data) {
      // Fallback to the first part
      body = decodeBase64(message.payload.parts[0].body.data);
    }
  } else if (message.payload.body && message.payload.body.data) {
    body = decodeBase64(message.payload.body.data);
  }

  return {
    id: message.id,
    threadId: message.threadId,
    snippet: message.snippet,
    subject,
    from,
    date,
    body,
  };
};

// Decode base64 encoded string (used for email body)
const decodeBase64 = (encoded) => {
  return atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
};

// Check if an email is job-related based on subject, sender, and content
const isJobRelatedEmail = (email) => {
  const subjectLower = email.subject.toLowerCase();
  const hasJobKeyword = JOB_KEYWORDS_SUBJECT.some((keyword) =>
    subjectLower.includes(keyword.toLowerCase())
  );

  const hasJobDomain = JOB_DOMAINS.some((domain) =>
    email.from.toLowerCase().includes(domain)
  );

  const bodyLower = email.body.toLowerCase();
  const hasJobContent =
    bodyLower.includes("job") ||
    bodyLower.includes("position") ||
    bodyLower.includes("application") ||
    bodyLower.includes("interview") ||
    bodyLower.includes("offer");

  return hasJobKeyword || (hasJobDomain && hasJobContent);
};

// Extract job application data from an email
const extractJobData = (email) => {
  let companyName = "";
  const fromMatch =
    email.from.match(/<([^>]+)>/) || email.from.match(/([^<]+)/);
  if (fromMatch && fromMatch[1]) {
    const fromEmail = fromMatch[1].trim();
    companyName = fromEmail.split("@")[1]?.split(".")[0] || "";
    companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  }

  let jobRole = "Unknown Position";
  const subjectLower = email.subject.toLowerCase();
  if (
    subjectLower.includes("application") ||
    subjectLower.includes("applied")
  ) {
    const roleMatches =
      email.subject.match(/for\s+(.+?)\s+position/) ||
      email.subject.match(/for\s+(.+?)\s+role/) ||
      email.subject.match(/for\s+(.+?)\s+job/);
    if (roleMatches && roleMatches[1]) {
      jobRole = roleMatches[1];
    }
  }

  let status = "Applied";
  if (subjectLower.includes("interview")) {
    status = "Interviewing";
  } else if (subjectLower.includes("offer")) {
    status = "Offer";
  } else if (
    subjectLower.includes("rejected") ||
    subjectLower.includes("not proceeding")
  ) {
    status = "Rejected";
  }

  const dateApplied = new Date(email.date);

  return {
    companyName,
    jobRole,
    status,
    dateApplied,
    lastUpdated: new Date(),
    source: "Gmail",
    emailId: email.id,
    notes: `Automatically extracted from email with subject: "${email.subject}"`,
  };
};
