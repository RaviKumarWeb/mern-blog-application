import { Link } from "react-router-dom";
import { FaEdit, FaCheck, FaSadCry } from "react-icons/fa";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ColorRing } from "react-loader-spinner";

const UserProfile = () => {
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPasword] = useState("");
  const [isAvatarTouched, setIsAvatarTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = currentUser?.token;

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/users/${currentUser.id}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      const { name, email, avatar } = response?.data;

      setName(name);
      setEmail(email);
      setAvatar(avatar);
    };
    getUser();
  }, []);

  const changeAvatarHandler = async () => {
    setIsAvatarTouched(false);
    setIsLoading(true);
    try {
      const postData = new FormData();
      postData.set("avatar", avatar);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/users/change-avatar`,
        postData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(0);
      console.log(response?.data);
      setAvatar(response?.data.avatar);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      userData.set("name", name);
      userData.set("email", email);
      userData.set("currentPassword", currentPassword);
      userData.set("newPassword", newPassword);
      userData.set("confirmNewPassword", confirmNewPassword);

      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/users/edit-user`,
        userData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status == 200) {
        navigate("/logout");
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

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
    <section className=" profile">
      <div className="container profile_container">
        <Link to={`/myposts/${currentUser.id}`} className=" btn">
          My Posts
        </Link>

        <div className="profile_details">
          <div className="avatar_wrapper">
            <div className="profile_avatar">
              <img src={`${avatar}`} alt="" />
            </div>

            <form className=" avatar_form">
              <input
                type="file"
                name="avatar"
                id="avatar"
                accept="png, jpg,jpeg"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
              <label htmlFor="avatar" onClick={() => setIsAvatarTouched(true)}>
                <FaEdit />
              </label>
            </form>
            {isAvatarTouched && (
              <button
                className=" profile_avatar-btn"
                onClick={changeAvatarHandler}
              >
                <FaCheck />
              </button>
            )}
          </div>
          <h1>{currentUser.name}</h1>

          {/* form to update user details */}
          <form className="form profile_form" onSubmit={updateUserDetails}>
            {error && <p className=" form_error-message">{error}</p>}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPasword(e.target.value)}
            />
            <button type=" submit" className=" btn primary">
              Update Details
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
