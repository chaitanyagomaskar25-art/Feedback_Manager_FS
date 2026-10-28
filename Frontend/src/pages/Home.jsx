import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiRequest } from "../api";
import { useAuth } from "../auth/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name ?? "",
      rating: "",
      category: "Product",
      comment: "",
      anonymous: false,
    },
  });

  const rating = Number(watch("rating", 0));
  const comment = watch("comment", "");
  const anonymous = watch("anonymous", false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");
    setIsSubmitted(false);
    try {
      await apiRequest("/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });

      reset();
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || "We couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> A little note goes a long way</p>
          <h1>Good things grow<br />from <span>good feedback.</span></h1>
          <p className="hero-copy">
            Tell us what made your day, what could be better, or anything in between.
            Every thought helps us make this experience a little more thoughtful.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.75h5.25M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v9a2.25 2.25 0 0 1-2.25 2.25h-4.5l-4.5 3v-3h-1.5A2.25 2.25 0 0 1 4.5 15V6a2.25 2.25 0 0 1 2.25-2.25Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.7 2 .55 1.7L21 4.25l-1.75.55L18.7 6.5l-.55-1.7-1.7-.55 1.7-.55L18.7 2Z" />
            </svg>
          </div>
          <p>Your voice makes a difference</p>
        </div>
      </section>

      <div className="content-grid">
        <section className="panel form-panel" aria-labelledby="feedback-form-title">
          <div className="panel-heading">
            <div>
              <h2 id="feedback-form-title">Share your experience</h2>
              <p>A couple of details, and you’re all set.</p>
            </div>
            <span className="step-pill">✦ &nbsp;Quick & easy</span>
          </div>

          <form className="form-fields" onSubmit={handleSubmit(onSubmit)} noValidate>
            {!anonymous && <div>
              <label className="field-label" htmlFor="feedback-name">Your name</label>
              <input
                id="feedback-name"
                {...register("name", {
                  validate: (value, values) => values.anonymous || value.trim().length > 0 || "Please add your name.",
                })}
                className={`field-input${errors.name ? " has-error" : ""}`}
                type="text"
                placeholder="How should we address you?"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p className="field-error" id="name-error">{errors.name.message}</p>}
            </div>}

            <label className="anonymous-option">
              <input type="checkbox" {...register("anonymous")} />
              <span className="anonymous-check" aria-hidden="true">✓</span>
              <span>
                <strong>Submit anonymously</strong>
                <small>Your name won’t appear with your feedback.</small>
              </span>
            </label>

            <div>
              <span className="field-label" id="rating-label">How was your experience?</span>
              <input
                type="hidden"
                {...register("rating", { required: "Please choose a star rating." })}
              />
              <div className="rating-row" role="group" aria-labelledby="rating-label">
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className={`star-button${value <= rating ? " selected" : ""}`}
                      type="button"
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      aria-pressed={rating === value}
                      onClick={() => setValue("rating", String(value), {
                        shouldValidate: true,
                        shouldDirty: true,
                      })}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="rating-hint">
                  {rating ? ["", "Not great", "Could be better", "It was okay", "Really good", "Loved it"][rating] : "Choose a rating"}
                </span>
              </div>
              {errors.rating && <p className="field-error" role="alert">{errors.rating.message}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="feedback-category">What is your feedback about?</label>
              <select id="feedback-category" className="field-input" {...register("category", { required: true })}>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Teaching">Teaching</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="feedback-comment">Your thoughts</label>
              <textarea
                id="feedback-comment"
                {...register("comment", {
                  required: "Please share a few words with us.",
                  validate: (value) => value.trim().length > 0 || "Please share a few words with us.",
                  maxLength: { value: 500, message: "Please keep your note under 500 characters." },
                })}
                className={`field-textarea${errors.comment ? " has-error" : ""}`}
                rows={5}
                maxLength={500}
                placeholder="What did you enjoy? What could we do a little better?"
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errors.comment ? "comment-error" : "comment-count"}
              />
              <div className="textarea-meta">
                {errors.comment
                  ? <span className="field-error" id="comment-error">{errors.comment.message}</span>
                  : <span>Share as much or as little as you like.</span>}
                <span id="comment-count">{comment.length}/500</span>
              </div>
            </div>

            {submitError && (
              <div className="alert" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                  <path strokeLinecap="round" strokeWidth="1.8" d="M12 8v4m0 4h.01" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {isSubmitted && (
              <div className="alert alert-success" role="status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" />
                </svg>
                <span>Thanks for sharing. Your feedback has been received!</span>
              </div>
            )}

            <button className="primary-button form-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Sending your feedback…</>
              ) : (
                <>
                  Send my feedback
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 12h15m-6-6 6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </section>

        <aside className="side-column" aria-label="About your feedback">
          <section className="panel aside-card promise-card">
            <div className="promise-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 21s8-4 8-11V5l-8-3-8 3v5c0 7 8 11 8 11Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>A safe space to share</h3>
            <p>Your feedback helps us learn and grow. We read every note with care and use your insights to make things better.</p>
          </section>

          <section className="panel aside-card">
            <h3>A small thank you</h3>
            <p>Taking a moment to share your experience means a lot to our team. We appreciate you being here.</p>
            <div className="privacy-note privacy-note-spaced">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 21s8-4 8-11V5l-8-3-8 3v5c0 7 8 11 8 11Z" />
              </svg>
              <p>Only your name, rating, and comment are collected with your note.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Home;
