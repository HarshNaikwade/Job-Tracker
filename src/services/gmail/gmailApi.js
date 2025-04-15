// Constants for OAuth and API
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

// Keywords for better job application detection
const JOB_KEYWORDS = {
  SUBJECT: [
    "application received",
    "application confirmation",
    "thank you for applying",
    "application status",
    "interview invitation",
    "job offer",
    "offer letter",
    "position",
    "recruitment",
    "hiring process",
    "application submitted",
    "we received your application",
  ],
  BODY: [
    "thank you for your interest",
    "we have received your application",
    "we are reviewing your application",
    "position you applied for",
    "job opportunity",
    "interview process",
    "next steps",
  ],
};

const JOB_DOMAINS = [
  "linkedin.com",
  "indeed.com",
  "monster.com",
  "glassdoor.com",
  "ziprecruiter.com",
  "lever.co",
  "greenhouse.io",
  "workday.com",
  "taleo.net",
  "jobvite.com",
  "smartrecruiters.com",
  "myworkdayjobs.com",
  "hire.lever.co",
];

// Initialize Google API client
export const initGmailApi = async () => {
  try {
    await loadGoogleIdentityScript();
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: API_SCOPE,
      callback: (response) => {
        if (response.error) {
          throw new Error(response.error);
        }
        localStorage.setItem("gmail_token", response.access_token);
      },
    });

    return tokenClient;
  } catch (error) {
    console.error("Gmail API initialization error:", error);
    throw error;
  }
};

const loadGoogleIdentityScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = resolve;
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
};

export const isSignedInToGoogle = () => {
  return !!localStorage.getItem("gmail_token");
};

export const signInToGoogle = async () => {
  try {
    const tokenClient = await initGmailApi();
    return new Promise((resolve) => {
      tokenClient.requestAccessToken({ prompt: "consent" });
      resolve();
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signOutFromGoogle = async () => {
  try {
    const token = localStorage.getItem("gmail_token");
    if (token) {
      google.accounts.oauth2.revoke(token);
      localStorage.removeItem("gmail_token");
    }
  } catch (error) {
    console.error("Google sign-out error:", error);
    throw error;
  }
};

export const fetchJobEmails = async (maxResults = 500) => {
  try {
    const token = localStorage.getItem("gmail_token");
    if (!token) {
      throw new Error("Not authenticated with Gmail");
    }

    // Fetch messages matching job-related criteria
    const searchQuery = buildSearchQuery();
    const messages = await fetchMessages(token, searchQuery, maxResults);
    const jobApplications = await processMessages(token, messages);

    return jobApplications;
  } catch (error) {
    console.error("Error fetching job emails:", error);
    throw error;
  }
};

const buildSearchQuery = () => {
  const subjectQueries = JOB_KEYWORDS.SUBJECT.map(
    (keyword) => `subject:(${keyword})`
  );
  const bodyQueries = JOB_KEYWORDS.BODY.map((keyword) => `"${keyword}"`);
  const domainQueries = JOB_DOMAINS.map((domain) => `from:*@${domain}`);

  return `{${subjectQueries.join(" OR ")}} OR {${bodyQueries.join(
    " OR "
  )}} OR {${domainQueries.join(" OR ")}}`;
};

const fetchMessages = async (token, query, maxResults) => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`);
  }

  const data = await response.json();
  return data.messages || [];
};

const processMessages = async (token, messages) => {
  const jobApplications = [];
  console.log(`Processing ${messages.length} emails...`);

  for (const message of messages) {
    console.log(`Analyzing email ID: ${message.id}`);
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) continue;

    const emailData = await response.json();
    const parsedEmail = parseEmailData(emailData);

    if (isJobApplication(parsedEmail)) {
      console.log(`Found job application email: ${parsedEmail.subject}`);
      const applicationData = extractJobData(parsedEmail);
      if (applicationData) {
        console.log(
          `Extracted data for ${applicationData.companyName}: ${applicationData.jobRole}`
        );
        jobApplications.push(applicationData);
      }
    }
  }

  return jobApplications;
};

const parseEmailData = (emailData) => {
  const headers = emailData.payload.headers;
  const getHeader = (name) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
    "";

  let body = "";
  const parts = emailData.payload.parts || [emailData.payload];

  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body.data) {
      body += atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    }
  }

  return {
    id: emailData.id,
    threadId: emailData.threadId,
    subject: getHeader("subject"),
    from: getHeader("from"),
    date: getHeader("date"),
    body: body,
    snippet: emailData.snippet,
  };
};

const isJobApplication = (email) => {
  const subjectLower = email.subject.toLowerCase();
  const bodyLower = email.body.toLowerCase();
  const fromLower = email.from.toLowerCase();

  const hasJobKeywordInSubject = JOB_KEYWORDS.SUBJECT.some((keyword) =>
    subjectLower.includes(keyword.toLowerCase())
  );

  const hasJobKeywordInBody = JOB_KEYWORDS.BODY.some((keyword) =>
    bodyLower.includes(keyword.toLowerCase())
  );

  const isFromJobDomain = JOB_DOMAINS.some((domain) =>
    fromLower.includes(domain)
  );

  return hasJobKeywordInSubject || (hasJobKeywordInBody && isFromJobDomain);
};

const extractJobData = (email) => {
  const fromParts = email.from.match(/([^<]+)<([^>]+)>/) || [
    null,
    email.from,
    "",
  ];
  const companyName = extractCompanyName(
    fromParts[1].trim(),
    fromParts[2].trim()
  );
  const jobRole = extractJobRole(email.subject, email.body);
  const status = determineApplicationStatus(email.subject, email.body);

  return {
    companyName,
    jobRole,
    status,
    dateApplied: new Date(email.date),
    source: "Gmail",
    emailId: email.id, // This is the unique Gmail message ID
    notes: `Extracted from email: ${email.snippet}`,
  };
};

const extractCompanyName = (displayName, emailAddress) => {
  // Try to extract from display name first
  let companyName = displayName.split("@")[0].trim();

  // If display name looks like a person's name, try email domain
  if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(companyName)) {
    companyName = emailAddress.split("@")[1].split(".")[0];
  }

  return companyName
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const extractJobRole = (subject, body) => {
  const patterns = [
    /position:\s*([^,\n]+)/i,
    /role:\s*([^,\n]+)/i,
    /job title:\s*([^,\n]+)/i,
    /position of\s*([^,\n]+)/i,
    /application for\s*([^,\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = subject.match(pattern) || body.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "Position Not Specified";
};

const determineApplicationStatus = (subject, body) => {
  const textToCheck = (subject + " " + body).toLowerCase();

  if (
    textToCheck.includes("offer letter") ||
    textToCheck.includes("job offer")
  ) {
    return "Offer";
  } else if (textToCheck.includes("interview")) {
    return "Interviewing";
  } else if (
    textToCheck.includes("rejected") ||
    textToCheck.includes("not moving forward")
  ) {
    return "Rejected";
  } else if (
    textToCheck.includes("received") ||
    textToCheck.includes("confirmed")
  ) {
    return "Applied";
  }

  return "Applied";
};
