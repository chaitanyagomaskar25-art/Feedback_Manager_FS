import React from "react";
import { useForm } from "react-hook-form";

const Home = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const onSubmit = (data) => {
    const sendFeedbacks = async () => {
      const responce = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      alert("Your Feedback Added");
      reset();
    };
    sendFeedbacks();
  };
  return (
    <div>
      <h1>Welcome</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum quo at
        commodi consequuntur! Eos ab recusandae repellat cumque reprehenderit
        saepe!
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("name", {
            required: "name is required",
          })}
          type="text"
          placeholder="Enter name"
        />
        {errors.name && <p>{errors.name.message}</p>}
        <select
          {...register("rating", {
            required: "You must choose rating",
          })}
        >
          <option value="">Choose the rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        {errors.rating && <p>{errors.rating.message}</p>}
        <input
          {...register("comment", {
            required: "You must add a comment",
          })}
          type="text"
          placeholder="Enter comment"
        />
        {errors.comment && <p>{errors.comment.message}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;
