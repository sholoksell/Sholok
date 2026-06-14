import { createContext, useContext, useState, useEffect } from 'react';

const SavedJobsContext = createContext(null);

export function SavedJobsProvider({ children }) {
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const stored = localStorage.getItem('sholok_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sholok_saved_jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const toggleSave = (job) => {
    const jobId = job._id || job.id;
    setSavedJobs(prev =>
      prev.find(j => (j._id || j.id) === jobId)
        ? prev.filter(j => (j._id || j.id) !== jobId)
        : [...prev, job]
    );
  };

  const isSaved = (jobId) => savedJobs.some(j => (j._id || j.id) === jobId);

  const removeJob = (jobId) => setSavedJobs(prev => prev.filter(j => (j._id || j.id) !== jobId));

  const clearAll = () => setSavedJobs([]);

  return (
    <SavedJobsContext.Provider value={{ savedJobs, toggleSave, isSaved, removeJob, clearAll }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export const useSavedJobs = () => useContext(SavedJobsContext);
