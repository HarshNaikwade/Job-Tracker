
import { db, getCurrentUser } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { APPLICATION_STATUS } from '../firebase';

// Check if we're in development mode
const isDevelopmentMode = () => {
  return (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('preview') || 
    window.location.hostname.includes('lovable')
  );
};

// Store job application data from Gmail in Firestore
export const storeJobApplicationsFromGmail = async (jobApplications) => {
  try {
    // For mock mode in development, skip Firestore and return mock results
    if (isDevelopmentMode() && window.location.search.includes('mock=true')) {
      console.log('Using mock data for storeJobApplicationsFromGmail');
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        total: jobApplications.length,
        new: jobApplications.length,
        stored: jobApplications.length,
        applications: jobApplications.map((app, i) => ({
          id: `mock-id-${i}`,
          ...app
        }))
      };
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to store job applications');
    }
    
    const userId = currentUser.uid;
    const applicationsRef = collection(db, 'applications');
    
    // Get existing applications to avoid duplicates
    const existingApplicationsQuery = query(
      applicationsRef,
      where('userId', '==', userId),
      where('source', '==', 'Gmail')
    );
    
    const existingApplicationsSnapshot = await getDocs(existingApplicationsQuery);
    const existingEmailIds = new Set();
    
    existingApplicationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.emailId) {
        existingEmailIds.add(data.emailId);
      }
    });
    
    // Filter out applications that have already been stored
    const newApplications = jobApplications.filter(app => !existingEmailIds.has(app.emailId));
    
    // Store new applications
    const results = [];
    for (const application of newApplications) {
      // Map the Gmail status to our application status
      let status = APPLICATION_STATUS.APPLIED;
      switch (application.status) {
        case 'Interviewing':
          status = APPLICATION_STATUS.IN_PROGRESS;
          break;
        case 'Offer':
          status = APPLICATION_STATUS.APPROVED;
          break;
        case 'Rejected':
          status = APPLICATION_STATUS.REJECTED;
          break;
        case 'Waiting':
          status = APPLICATION_STATUS.WAITING;
          break;
      }
      
      const applicationData = {
        userId,
        companyName: application.companyName || 'Unknown Company',
        jobRole: application.jobRole || 'Unknown Position',
        status,
        dateApplied: application.dateApplied,
        notes: application.notes,
        source: 'Gmail',
        emailId: application.emailId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(applicationsRef, applicationData);
      results.push({
        id: docRef.id,
        ...applicationData
      });
    }
    
    return {
      total: jobApplications.length,
      new: newApplications.length,
      stored: results.length,
      applications: results
    };
  } catch (error) {
    console.error('Error storing job applications from Gmail:', error);
    throw error;
  }
};
