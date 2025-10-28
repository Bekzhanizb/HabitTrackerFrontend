import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../slices/userSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [username, setUsername] = useState(user?.username || "");
  const [city, setCity] = useState(user?.city || "");
  const [avatar, setAvatar] = useState(user?.picture || null);
  const [preview, setPreview] = useState(user?.picture || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(file);
      setPreview(imageUrl);
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      username,
      city,
      picture: preview,
    };
    dispatch(updateUser(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Профиль обновлён!");
  };

  if (!user) {
    return <p>Вы не вошли в систему</p>;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Профиль</h2>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src={preview || "/default-avatar.png"}
          alt="avatar"
          style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div>
        <label>Имя пользователя:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <label>Город:</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} />
      </div>

      <div>
        <label>Роль:</label>
        <p>{user.role}</p>
      </div>

      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
};

export default ProfilePage;
