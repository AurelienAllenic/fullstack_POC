import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./backoffice.scss";
import { MdRemoveRedEye } from "react-icons/md";
import { FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5001/api/login", data, {
        withCredentials: true,
      });
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Nom d'utilisateur ou mot de passe incorrect"
      );
    }
  };

  return (
    <div className="container_backoffice">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>CONNEXION</h1>
        <div>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            {...register("username", {
              required: "Le nom d'utilisateur est requis",
            })}
          />
          {errors.username && <span>{errors.username.message}</span>}

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              {...register("password", {
                required: "Le mot de passe est requis",
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prevState) => !prevState)}
              className="toggle-password"
            >
              {showPassword ? <FaEyeSlash /> : <MdRemoveRedEye />}
            </button>
          </div>
          {errors.password && <span>{errors.password.message}</span>}

          <button type="submit">Valider</button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Login;
