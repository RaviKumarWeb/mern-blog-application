import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";
const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const getAuthors = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/users`
        );
        setAuthors(response?.data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };

    getAuthors();
  }, []);

  if (isLoading) {
    return (
      <div className="loader">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );
  }

  return (
    <section className="authors">
      {authors.length > 0 ? (
        <div className="container authors_container">
          {authors.map(({ _id: id, avatar, name, posts }) => {
            return (
              <Link key={id} to={`/posts/users/${id}`} className=" author">
                <div className="author_avatar">
                  <img src={`${avatar}`} alt={`Image of ${name}`} />
                </div>
                <div className="author_info">
                  <h4>{name}</h4>
                  <p>{posts}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <h2 className=" center">No Users/Authors found</h2>
      )}
    </section>
  );
};

export default Authors;
