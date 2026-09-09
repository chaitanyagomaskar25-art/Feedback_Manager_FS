import React, { useEffect, useState } from "react";

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  useEffect(() => {
    const getFeedbacks = async () => {
      const responce = await fetch("https://feedback-manager-fs.vercel.app/feedback");
      const data = await responce.json();
      setFeedback(data);
    };
    getFeedbacks();
  }, []);
  const handleDelete = async (id) => {
    try {
      const responce = await fetch(`https://feedback-manager-fs.vercel.app/feedback/${id}`, {
        method: "DELETE",
      });
      if (responce.ok) {
        alert("Deleted successfully....")
        console.log("Deleted from database successfully");
        setFeedback((prev) => prev.filter((f) => f._id !== id));
      } else {
        const errorData = await response.json();
        console.error("Failed to delete:", errorData.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>Feedbacks</h1>
      <div>
        <label htmlFor="">Delete by Dates: </label>
        <input type="date" />
      </div>
      <div>
        {feedback.map((f) => (
          <div key={f._id}>
            <h3>{f.name}</h3>
            <p>{f.comment}</p>
            <p>
              {f.rating},{" "}
              {new Date(f.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <button onClick={() => handleDelete(f._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
