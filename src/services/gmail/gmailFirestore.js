import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { APPLICATION_STATUS } from "../firebase";

export const storeJobApplicationsFromGmail = async (
  jobApplications,
  userId
) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to store applications");
    }

    const applicationsRef = collection(db, "applications");

    // Get existing applications
    const existingQuery = query(
      applicationsRef,
      where("userId", "==", userId),
      where("source", "==", "Gmail")
    );

    const existingDocs = await getDocs(existingQuery);
    const existingEmailIds = new Set();

    existingDocs.forEach((doc) => {
      const data = doc.data();
      // Only consider emailId as unique identifier
      if (data.emailId) {
        existingEmailIds.add(data.emailId);
      }
    });

    // Filter and store new applications
    const results = [];
    for (const application of jobApplications) {
      // Only check emailId uniqueness, not company+role
      if (existingEmailIds.has(application.emailId)) {
        continue;
      }

      const applicationData = {
        userId,
        companyName: application.companyName,
        jobRole: application.jobRole,
        status: mapGmailStatusToApplicationStatus(application.status),
        dateApplied: application.dateApplied,
        source: "Gmail",
        notes: application.notes,
        emailId: application.emailId, // Store email ID for future deduplication
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(applicationsRef, applicationData);
        results.push({ id: docRef.id, ...applicationData });
      } catch (error) {
        console.error(
          `Failed to store application for ${application.companyName}:`,
          error
        );
      }
    }

    return {
      total: jobApplications.length,
      new: results.length,
      stored: results.length,
      applications: results,
    };
  } catch (error) {
    console.error("Error storing job applications:", error);
    throw error;
  }
};

const mapGmailStatusToApplicationStatus = (gmailStatus) => {
  switch (gmailStatus) {
    case "Interviewing":
      return APPLICATION_STATUS.IN_PROGRESS;
    case "Offer":
      return APPLICATION_STATUS.APPROVED;
    case "Rejected":
      return APPLICATION_STATUS.REJECTED;
    case "Waiting":
      return APPLICATION_STATUS.WAITING;
    default:
      return APPLICATION_STATUS.APPLIED;
  }
};
