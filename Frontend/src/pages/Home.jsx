import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Home = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("https://feedback-manager-fs.vercel.app/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        reset();
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Welcome & Share Feedback
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          We value your experience! Leave your feedback below to help us continuously standardise and improve our platform.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
          Submit Your Review
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Your Name
            </label>
            <input
              {...register("name", {
                required: "Name is required",
              })}
              type="text"
              placeholder="e.g. John Doe"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.name ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200 focus:border-blue-600"
              } text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-150 focus:ring-4`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
                <span className="mr-1">⚠️</span> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Rating
            </label>
            <select
              {...register("rating", {
                required: "You must choose a rating",
              })}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.rating ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200 focus:border-blue-600"
              } text-slate-800 text-sm outline-none bg-white transition-all duration-150 focus:ring-4`}
            >
              <option value="">Choose a rating rating (1 to 5 stars)</option>
              <option value="1">1 Star - Very Poor</option>
              <option value="2">2 Stars - Poor</option>
              <option value="3">3 Stars - Average</option>
              <option value="4">4 Stars - Good</option>
              <option value="5">5 Stars - Excellent</option>
            </select>
            {errors.rating && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
                <span className="mr-1">⚠️</span> {errors.rating.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Comment
            </label>
            <textarea
              {...register("comment", {
                required: "You must add a comment",
              })}
              rows="4"
              placeholder="Tell us about your experience..."
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.comment ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:ring-blue-200 focus:border-blue-600"
              } text-slate-800 placeholder-slate-400 text-sm outline-none transition-all duration-150 focus:ring-4 resize-none`}
            ></textarea>
            {errors.comment && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center">
                <span className="mr-1">⚠️</span> {errors.comment.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all duration-150 focus:ring-4 focus:ring-blue-200 outline-none flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
            <p className="text-sm text-slate-500 mb-6">
              Your feedback has been successfully submitted and stored.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors duration-150 outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;