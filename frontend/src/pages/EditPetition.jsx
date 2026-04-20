import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditPetition.module.css";

const EditPetition = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [target, setTarget] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchPetition();
  }, []);

  const fetchPetition = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/petitions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch petition");
      const data = await res.json();
      setTitle(data.title || "");
      setCategory(data.category || "");
      setLocation(data.location || "");
      setTarget(data.target || "");
      setDescription(data.description || "");
    } catch (error) {
      console.error("Error loading petition:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/petitions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, category, location, target, description }),
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Petition Updated Successfully");
      navigate("/petitions");
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating petition");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>✏️</div>
          <div>
            <h2 className={styles.title}>Edit Petition</h2>
            <p className={styles.subtitle}>Update the details of your petition</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Petition title"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <input
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Infrastructure, Environment"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Location</label>
            <input
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or region"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Target Signatures</label>
            <input
              className={styles.input}
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 5000"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your petition..."
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.buttonOutline}
              onClick={() => navigate("/petitions")}
            >
              Cancel
            </button>
            <button type="submit" className={styles.buttonPrimary}>
              Update Petition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPetition;
