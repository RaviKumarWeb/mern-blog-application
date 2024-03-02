import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostAuthor from "../components/PostAuthor";
import { ColorRing } from "react-loader-spinner";
import { UserContext } from "../context/userContext";
import DeletePost from "../pages/DeletePost";
import axios from "axios";
const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/posts/${id}`
        );
        setPost(response?.data);
      } catch (error) {
        setError(error);
      }
      setIsLoading(false);
    };
    getPost();
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
    <section className="post-detail">
      {error && <p className=" error">{error}</p>}
      {post && (
        <div className="container post-detail_container">
          <div className="post-detail_header">
            <PostAuthor authorID={post?.creator} createdAt={post?.createdAt} />
            {currentUser?.id == post?.creator && (
              <div className="post-detail_buttons">
                <Link
                  to={`/posts/${post?._id}/edit`}
                  className=" btn sm primary"
                >
                  Edit
                </Link>
                <DeletePost postId={id} />
              </div>
            )}
          </div>
          <h1>{post?.title}</h1>
          <div className="post-detail_thumbnail">
            <img src={`${post?.thumbnail}`} alt="thumb" />
          </div>
          <p dangerouslySetInnerHTML={{ __html: post?.description }}>{}</p>
        </div>
      )}
    </section>
  );
};

export default PostDetail;
