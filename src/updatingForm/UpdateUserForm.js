import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./updating.css";

const UpdateUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch user details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://localhost:9004/auth/profile/details",
          {
            params: { token },
          }
        );

        if (response.status === 200) {
          setFormData({
            name: response.data.name || "",
            contact: response.data.contact || "",
            image: response.data.image || "",
          });
        } else {
          setError("Error: Unexpected status code");
        }
      } catch (error) {
        setError(
          "Error fetching profile details: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validate Base64 string format
  const isValidBase64 = (str) => {
    const regex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/;
    return regex.test(str);
  };

  // Handle image drop
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (
      file &&
      file.type.startsWith("image/") &&
      file.size <= 2 * 1024 * 1024
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (isValidBase64(result)) {
          setFormData((prevData) => ({
            ...prevData,
            image: result,
          }));
        } else {
          setError("The file could not be processed as a valid Base64 image.");
        }
      };
      reader.onerror = () => {
        setError("An error occurred while reading the file.");
      };
      reader.readAsDataURL(file);
    } else {
      setError("Invalid file. Please upload an image less than 2MB.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 2 * 1024 * 1024, // 2MB limit
  });

  // Convert Base64 image to Blob
  const dataURItoBlob = (dataURI) => {
    if (!isValidBase64(dataURI)) {
      setError("Invalid Base64 string for the image.");
      return null;
    }

    try {
      const byteString = atob(dataURI.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: "image/jpeg" });
    } catch (e) {
      setError("Failed to convert Base64 to Blob: " + e.message);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    // Create FormData to send both text data and image
    const formDataToSend = new FormData();
    formDataToSend.append("token", token);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("contact", formData.contact);

    if (formData.image) {
      const imageBlob = dataURItoBlob(formData.image);
      if (imageBlob) {
        formDataToSend.append("image", imageBlob, "profile-image.jpg");
      } else {
        setError("Image processing failed. Please try again.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.put(
        "http://localhost:9004/update/data",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        alert("User updated successfully!");
      } else {
        setError("Error updating user: " + response.data.message);
      }
    } catch (error) {
      setError(
        "Failed to update user: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="update-user-form">
      <h2>Update User Information</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Contact:</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Image:</label>
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} disabled={loading} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag and drop an image here, or click to select one</p>
            )}
          </div>
          {formData.image && (
            <div className="preview">
              <img
                src={formData.image}
                alt="Preview"
                className="preview-image"
              />
            </div>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default UpdateUserForm;
