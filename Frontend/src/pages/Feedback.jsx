import React, { useEffect, useState } from "react";

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const getFeedbacks = async () => {
      try {
        const responce = await fetch(
          "https://feedback-manager-fs.vercel.app/feedback"
        );
        const data = await responce.json();
        setFeedback(data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getFeedbacks();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const responce = await fetch(
        `https://feedback-manager-fs.vercel.app/feedback/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      if (responce.ok) {
        setFeedback((prev) => prev.filter((f) => f._id !== deleteId));
        setDeleteId(null);
        setShowSuccessModal(true);
      } else {
        const errorData = await responce.json();
        console.error("Failed to delete:", errorData.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            User Feedback
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and manage incoming community comments and ratings.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <label htmlFor="date-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap uppercase tracking-wider">
            Filter by Date:
          </label>
          <input
            id="date-filter"
            type="date"
            className="text-sm text-slate-700 bg-transparent outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No feedback items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedback.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">
                    {f.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                    ★ {f.rating}
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  "{f.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {new Date(f.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <button
                  onClick={() => setDeleteId(f._id)}
                  className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-150 focus:ring-2 focus:ring-red-500/20 outline-none cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Feedback?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete this feedback item? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors duration-150 outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium text-sm rounded-xl shadow-md shadow-red-500/20 transition-colors duration-150 outline-none flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Successfully Deleted</h3>
            <p className="text-sm text-slate-500 mb-6">
              The selected feedback record has been removed.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors duration-150 outline-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;