import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Trash2, Edit } from "lucide-react";
import styles from "./Petitions.module.css";

const Petitions = () => {

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const backPath = role === "official" ? "/official-dashboard" : "/dashboard";

  const [petitionsData, setPetitionsData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  /* FETCH PETITIONS */

  const fetchPetitions = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/petitions");
      const data = await res.json();
      // backend returns { count, petitions } or array
      setPetitionsData(Array.isArray(data) ? data : (data.petitions || []));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  /* CATEGORY LIST */

  const categories = useMemo(() => {
    return [...new Set(petitionsData.map((p) => p.category))];
  }, [petitionsData]);

  /* CHECK IF USER SIGNED */

  const hasUserSigned = (id) => {

    if (!currentUser) return false;

    const signedKey = `signed_${currentUser.email}`;
    const signedPetitions = JSON.parse(localStorage.getItem(signedKey) || "[]");

    return signedPetitions.includes(id);

  };

  /* SIGN PETITION */

  const handleSign = async (id) => {

    if (!currentUser) {
      alert("Please login to sign petition");
      return;
    }

    const signedKey = `signed_${currentUser.email}`;
    const signedPetitions = JSON.parse(localStorage.getItem(signedKey) || "[]");

    if (signedPetitions.includes(id)) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3000/api/petitions/${id}/sign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      localStorage.setItem(
        signedKey,
        JSON.stringify([...signedPetitions, id])
      );

      fetchPetitions();

    } catch (error) {
      console.log(error);
    }

  };

  /* OPEN DELETE MODAL */

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteInput("");
    setShowModal(true);
  };

  /* CONFIRM DELETE */

  const confirmDelete = async () => {

    if (deleteInput.trim().toUpperCase() !== "DELETE") {
      alert("Please type DELETE correctly");
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3000/api/petitions/${deleteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      setDeleting(false);
      setShowModal(false);
      setDeleteInput("");
      setDeleteId(null);

      /* REFRESH PAGE */

      window.location.reload();

    } catch (error) {
      console.log(error);
      setDeleting(false);
    }

  };

  /* FILTER PETITIONS */

  const filtered = useMemo(() => {

    const statusOrder = { active: 1, pending: 2, closed: 3 };

    return petitionsData
      .filter((p) => {

        const matchSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
          statusFilter === "all" || p.status === statusFilter;

        const matchCategory =
          categoryFilter === "all" || p.category === categoryFilter;

        return matchSearch && matchStatus && matchCategory;

      })
      .sort(
        (a, b) =>
          (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
      );

  }, [search, statusFilter, categoryFilter, petitionsData]);

  const getStatusClass = (status) => {
    if (status === "active")  return styles.active;
    if (status === "pending") return styles.pending;
    if (status === "closed")  return styles.closed;
    return "";
  };

  return (

    <div className={styles.container}>

      {/* HEADER */}

      <div className={styles.headerRow}>

        <h1 className={styles.heading}>Petitions Dashboard</h1>

        <div className={styles.headerActions}>

          <button className={styles.backBtn} onClick={() => navigate(backPath)}>
            ← Back to Dashboard
          </button>          <Link to="/petitions/create">
            <button className={styles.createBtn}>
              + Create Petition
            </button>
          </Link>

        </div>

      </div>

      {/* FILTERS */}

      <div className={styles.filterRow}>

        <input
          type="text"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Categories</option>

          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}

        </select>

      </div>

      {/* PETITION LIST */}

      <div className={styles.list}>

        {filtered.map((p) => {

          const alreadySigned = hasUserSigned(p._id);

          const sigCount = Array.isArray(p.signatures) ? p.signatures.length : (p.signatures || 0);
          const percentage =
            p.target > 0
              ? Math.min(Math.round((sigCount / p.target) * 100), 100)
              : 0;

          return (

            <div key={p._id} className={styles.card}>

              <div className={styles.cardHeader}>

                <h3>{p.title}</h3>

                <span
                  className={`${styles.status} ${getStatusClass(p.status)}`}
                >
                  {p.status}
                </span>

              </div>

              <p>{p.location}</p>

              <span className={styles.category}>
                {p.category}
              </span>

              <div className={styles.progressSection}>

                <p>
                  {sigCount} of {p.target || 1000} signatures
                </p>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p>{percentage}% Complete</p>

              </div>

              <div className={styles.actions}>

                <Link to={`/petitions/${p._id}`}>
                  <button className={styles.viewBtn}>
                    <Eye size={16}/> View
                  </button>
                </Link>

                {(p.status === "active" || p.status === "pending") && (

                  <button
                    onClick={() => handleSign(p._id)}
                    disabled={alreadySigned}
                    className={
                      alreadySigned ? styles.signedBtn : styles.signBtn
                    }
                  >
                    {alreadySigned ? "Signed" : "Sign"}
                  </button>

                )}

                <Link to={`/edit-petition/${p._id}`}>
                  <button className={styles.editBtn}>
                    <Edit size={16}/> Edit
                  </button>
                </Link>

                <button
                  onClick={() => openDeleteModal(p._id)}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={16}/> Delete
                </button>

              </div>

            </div>

          );

        })}

      </div>

      {/* DELETE CONFIRMATION MODAL */}

      {showModal && (

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h3>Confirm Delete</h3>

            <p>Type <b>DELETE</b> to confirm deletion</p>

            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className={styles.modalInput}
            />

            <div className={styles.modalActions}>

              <button
                className={styles.confirmBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default Petitions;

