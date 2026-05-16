// src/screens/admin/AdminCatalogues.jsx
import { useState, useEffect, useCallback } from "react";
import {
  // Catégories
  Wrench,
  Home,
  Sparkles,
  HeartPulse,
  Accessibility,
  Car,
  BookOpen,
  // Urgence & dépannage
  Droplets,
  Key,
  Zap,
  WashingMachine,
  Square,
  Smartphone,
  Wind,
  // Services à domicile
  Leaf,
  Waves,
  Droplet,
  Truck,
  Hammer,
  Package,
  // Beauté & bien-être
  Hand,
  Scissors,
  Star,
  Palette,
  Heart,
  Footprints,
  Feather,
  // Santé
  Activity,
  Bone,
  Dumbbell,
  PersonStanding,
  Stethoscope,
  HeartHandshake,
  Mic,
  Salad,
  Brain,
  // PMR
  Users,
  HouseHeart,
  ShieldCheck,
  Pill,
  // Transport
  CarFront,
  Bike,
  // Enseignement
  Lightbulb,
  GraduationCap,
  Camera,
  Pencil,
  // Génériques / fallback
  ChefHat,
  Monitor,
  Building,
  Grid,
  Baby,
  Paintbrush,
  FolderOpen,
  HelpCircle,
} from "lucide-react";
import AdminModal from "../../components/admin/AdminModal";
import "./AdminCatalogues.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────────────────────
// Mapping nom-icône (stocké en base) → composant Lucide
// ─────────────────────────────────────────────────────────
const LUCIDE_MAP = {
  wrench: Wrench,
  home: Home,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  accessibility: Accessibility,
  car: Car,
  "book-open": BookOpen,
  droplets: Droplets,
  key: Key,
  zap: Zap,
  "washing-machine": WashingMachine,
  square: Square,
  smartphone: Smartphone,
  wind: Wind,
  leaf: Leaf,
  waves: Waves,
  droplet: Droplet,
  truck: Truck,
  hammer: Hammer,
  package: Package,
  hand: Hand,
  scissors: Scissors,
  star: Star,
  palette: Palette,
  heart: Heart,
  footprints: Footprints,
  feather: Feather,
  activity: Activity,
  bone: Bone,
  dumbbell: Dumbbell,
  "person-standing": PersonStanding,
  stethoscope: Stethoscope,
  "heart-handshake": HeartHandshake,
  mic: Mic,
  salad: Salad,
  brain: Brain,
  users: Users,
  "house-heart": HouseHeart,
  "shield-check": ShieldCheck,
  pill: Pill,
  "car-front": CarFront,
  bike: Bike,
  lightbulb: Lightbulb,
  "graduation-cap": GraduationCap,
  camera: Camera,
  pencil: Pencil,
  "chef-hat": ChefHat,
  monitor: Monitor,
  building: Building,
  grid: Grid,
  baby: Baby,
  paintbrush: Paintbrush,
};

/**
 * Résout une icône stockée en base :
 * - Nom Lucide connu → composant SVG Lucide
 * - Chaîne inconnue  → texte brut (emoji)
 * - Vide / null      → icône fallback
 */
const IconeRenderer = ({
  icone,
  size = 18,
  fallback: Fallback = FolderOpen,
}) => {
  if (!icone) return <Fallback size={size} />;
  const LucideIcon = LUCIDE_MAP[icone];
  if (LucideIcon) return <LucideIcon size={size} />;
  return (
    <span className="ac-emoji-icon" style={{ fontSize: size * 0.9 }}>
      {icone}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const emptyCategorie = () => ({
  nom: "",
  description: "",
  icone: "",
  ordre: "",
});
const emptyMetier = () => ({
  nom: "",
  description: "",
  icone: "",
  categorieId: "",
});

// ─────────────────────────────────────────────────────────
// Panel Catégories
// ─────────────────────────────────────────────────────────
const CategoriesPanel = ({ categories, onRefresh }) => {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyCategorie());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setForm(emptyCategorie());
    setError("");
    setModal("create");
  };
  const openEdit = (c) => {
    setSelected(c);
    setForm({
      nom: c.nom,
      description: c.description || "",
      icone: c.icone || "",
      ordre: c.ordre ?? "",
    });
    setError("");
    setModal("edit");
  };
  const openDelete = (c) => {
    setSelected(c);
    setError("");
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setError("");
  };
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, ordre: Number(form.ordre) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal();
      onRefresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, ordre: Number(form.ordre) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal();
      onRefresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (c) => {
    try {
      await fetch(`${API_URL}/api/categories/${c._id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      onRefresh();
    } catch {
      console.error("Toggle error");
    }
  };

  const handleDelete = async () => {
    if ((selected?.metiersCount || 0) > 0)
      return setError(
        `Impossible : ${selected.metiersCount} métier(s) rattachés à cette catégorie.`,
      );
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories/${selected._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal();
      onRefresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <>
      {/* Toolbar */}
      <div className="ac-toolbar">
        <div className="ac-toolbar-stats">
          <span className="ac-stat">
            <span className="ac-stat-val">{categories.length}</span> total
          </span>
          <span className="ac-stat-sep">·</span>
          <span className="ac-stat">
            <span className="ac-stat-val ac-green">{activeCount}</span> actives
          </span>
          {inactiveCount > 0 && (
            <>
              <span className="ac-stat-sep">·</span>
              <span className="ac-stat">
                <span className="ac-stat-val ac-red">{inactiveCount}</span>{" "}
                inactives
              </span>
            </>
          )}
        </div>
        <button className="ac-add-btn" onClick={openCreate}>
          + Nouvelle catégorie
        </button>
      </div>

      {/* Liste */}
      <div className="ac-cat-list">
        {categories.map((c) => (
          <div
            key={c._id}
            className={`ac-cat-row${!c.isActive ? " inactive" : ""}`}
          >
            <div className="ac-cat-ordre">{c.ordre ?? 0}</div>

            <div className="ac-cat-icon-wrap">
              <IconeRenderer icone={c.icone} size={20} fallback={FolderOpen} />
            </div>

            <div className="ac-cat-info">
              <div className="ac-cat-nom">{c.nom}</div>
              {c.description && (
                <div className="ac-cat-desc">{c.description}</div>
              )}
            </div>

            <div className="ac-cat-badge" title="Nombre de métiers">
              <span className="ac-badge-val">{c.metiersCount ?? 0}</span>
              <span className="ac-badge-label">
                métier{(c.metiersCount ?? 0) > 1 ? "s" : ""}
              </span>
            </div>

            <div className={`ac-status${c.isActive ? " active" : " inactive"}`}>
              <span className="ac-status-dot" />
              {c.isActive ? "Active" : "Inactive"}
            </div>

            <div className="ac-row-actions">
              <button
                className="ac-btn ac-btn-toggle"
                onClick={() => handleToggle(c)}
                title={c.isActive ? "Désactiver" : "Activer"}
              >
                {c.isActive ? "⏸" : "▶"}
              </button>
              <button
                className="ac-btn"
                onClick={() => openEdit(c)}
                title="Modifier"
              >
                ✏️
              </button>
              <button
                className={`ac-btn${(c.metiersCount ?? 0) > 0 ? " ac-btn-blocked" : " ac-btn-danger"}`}
                onClick={() => openDelete(c)}
                title={
                  (c.metiersCount ?? 0) > 0
                    ? "Suppression impossible : métiers liés"
                    : "Supprimer"
                }
                disabled={(c.metiersCount ?? 0) > 0}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="ac-empty">
            Aucune catégorie. Créez-en une pour commencer.
          </div>
        )}
      </div>

      {/* Modals créer / éditer */}
      {(modal === "create" || modal === "edit") && (
        <AdminModal
          title={
            modal === "create"
              ? "Nouvelle catégorie"
              : `Modifier — ${selected?.nom}`
          }
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button
                className="am-btn am-btn-primary"
                onClick={modal === "create" ? handleCreate : handleEdit}
                disabled={loading}
              >
                {loading ? "…" : modal === "create" ? "Créer" : "Enregistrer"}
              </button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <div className="am-field">
            <label className="am-label">Nom *</label>
            <input
              className="am-input"
              name="nom"
              value={form.nom}
              onChange={onChange}
              placeholder="Ex : Urgence & dépannage"
            />
          </div>
          <div className="am-field">
            <label className="am-label">Description</label>
            <textarea
              className="am-textarea"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Description courte de la catégorie…"
            />
          </div>
          <div className="ac-form-row">
            <div className="am-field ac-flex-1">
              <label className="am-label">Icône (nom Lucide ou emoji)</label>
              <div className="ac-icone-field-wrap">
                <div className="ac-icone-preview">
                  <IconeRenderer
                    icone={form.icone}
                    size={15}
                    fallback={HelpCircle}
                  />
                </div>
                <input
                  className="am-input ac-icone-input"
                  name="icone"
                  value={form.icone}
                  onChange={onChange}
                  placeholder="Ex: wrench, home, 🔧"
                />
              </div>
            </div>
            <div className="am-field ac-field-ordre">
              <label className="am-label">Ordre</label>
              <input
                className="am-input"
                name="ordre"
                type="number"
                min="0"
                value={form.ordre}
                onChange={onChange}
                placeholder="0"
              />
            </div>
          </div>
        </AdminModal>
      )}

      {/* Modal supprimer */}
      {modal === "delete" && (
        <AdminModal
          title="Supprimer la catégorie"
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button
                className="am-btn am-btn-danger"
                onClick={handleDelete}
                disabled={loading || (selected?.metiersCount ?? 0) > 0}
              >
                {loading ? "…" : "Supprimer"}
              </button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <p className="ac-confirm-text">
            Supprimer la catégorie <strong>{selected?.nom}</strong> ?
          </p>
          {(selected?.metiersCount ?? 0) > 0 && (
            <div className="ac-warn-block">
              ⛔ Suppression impossible : {selected.metiersCount} métier(s) sont
              rattachés à cette catégorie. Réassignez-les d'abord.
            </div>
          )}
        </AdminModal>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// Panel Métiers
// ─────────────────────────────────────────────────────────
const MetiersPanel = ({ metiers, categories, users, onRefresh }) => {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyMetier());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const metierCounts = {};
  users.forEach((u) => {
    if (u.role === "prestataire") {
      u.metiers?.forEach((m) => {
        const id = m._id || m;
        metierCounts[id] = (metierCounts[id] || 0) + 1;
      });
    }
  });

  const openCreate = () => {
    setForm(emptyMetier());
    setError("");
    setModal("create");
  };
  const openEdit = (m) => {
    setSelected(m);
    setForm({
      nom: m.nom,
      description: m.description || "",
      icone: m.icone || "",
      categorieId: m.categorie?._id || m.categorie || "",
    });
    setError("");
    setModal("edit");
  };
  const openDelete = (m) => {
    setSelected(m);
    setError("");
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setError("");
  };
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis.");
    if (!form.categorieId) return setError("La catégorie est requise.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/metiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal();
      onRefresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis.");
    if (!form.categorieId) return setError("La catégorie est requise.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/metiers/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal();
      onRefresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (m) => {
    try {
      await fetch(`${API_URL}/api/metiers/${m._id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      onRefresh();
    } catch {
      console.error("Toggle error");
    }
  };

  const handleDelete = async () => {
    const count = metierCounts[selected._id] || 0;
    if (count > 0)
      return setError(
        `Impossible : ${count} prestataire(s) utilisent ce métier.`,
      );
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/metiers/${selected._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal();
      onRefresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // Filtres
  const filtered = metiers.filter((m) => {
    const catId = m.categorie?._id || m.categorie || "";
    if (filterCat !== "all" && catId !== filterCat) return false;
    if (filterStatus === "active" && !m.isActive) return false;
    if (filterStatus === "inactive" && m.isActive) return false;
    if (search && !m.nom.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // Groupement trié par ordre de catégorie
  const grouped = {};
  const ordreMap = {};
  filtered.forEach((m) => {
    const catNom = m.categorie?.nom || "Sans catégorie";
    const catOrdre = m.categorie?.ordre ?? 99;
    ordreMap[catNom] = catOrdre;
    if (!grouped[catNom]) grouped[catNom] = [];
    grouped[catNom].push(m);
  });
  const groupedSorted = Object.entries(grouped).sort(
    (a, b) => (ordreMap[a[0]] ?? 99) - (ordreMap[b[0]] ?? 99),
  );

  const activeMetiers = metiers.filter((m) => m.isActive).length;

  const MetierForm = () => (
    <>
      {error && <div className="am-error">{error}</div>}
      <div className="am-field">
        <label className="am-label">Catégorie *</label>
        <select
          className="am-select"
          name="categorieId"
          value={form.categorieId}
          onChange={onChange}
        >
          <option value="">— Sélectionner une catégorie —</option>
          {categories
            .filter((c) => c.isActive)
            .map((c) => (
              <option key={c._id} value={c._id}>
                {c.nom}
              </option>
            ))}
        </select>
      </div>
      <div className="am-field">
        <label className="am-label">Nom du métier *</label>
        <input
          className="am-input"
          name="nom"
          value={form.nom}
          onChange={onChange}
          placeholder="Ex : Plombier"
        />
      </div>
      <div className="am-field">
        <label className="am-label">Description</label>
        <textarea
          className="am-textarea"
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description courte du métier…"
        />
      </div>
      <div className="am-field">
        <label className="am-label">Icône (nom Lucide ou emoji)</label>
        <div className="ac-icone-field-wrap">
          <div className="ac-icone-preview">
            <IconeRenderer icone={form.icone} size={15} fallback={HelpCircle} />
          </div>
          <input
            className="am-input ac-icone-input"
            name="icone"
            value={form.icone}
            onChange={onChange}
            placeholder="Ex: wrench, droplets, 🔧"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Toolbar */}
      <div className="ac-toolbar">
        <div className="ac-toolbar-stats">
          <span className="ac-stat">
            <span className="ac-stat-val">{metiers.length}</span> total
          </span>
          <span className="ac-stat-sep">·</span>
          <span className="ac-stat">
            <span className="ac-stat-val ac-green">{activeMetiers}</span> actifs
          </span>
        </div>
        <div className="ac-toolbar-right">
          <div className="ac-search-wrap">
            <span className="ac-search-icon">🔍</span>
            <input
              className="ac-search"
              placeholder="Rechercher un métier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="ac-filter-select"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nom}
              </option>
            ))}
          </select>
          <select
            className="ac-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <button className="ac-add-btn" onClick={openCreate}>
            + Nouveau métier
          </button>
        </div>
      </div>

      {/* Grille groupée */}
      <div className="ac-metiers-container">
        {groupedSorted.map(([catNom, items]) => (
          <div key={catNom} className="ac-metier-group">
            <div className="ac-group-header">
              <span className="ac-group-title">{catNom}</span>
              <span className="ac-group-count">
                {items.length} métier{items.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="ac-metiers-grid">
              {items.map((m) => {
                const prestCount = metierCounts[m._id] || 0;
                return (
                  <div
                    key={m._id}
                    className={`ac-metier-card${!m.isActive ? " inactive" : ""}`}
                  >
                    {/* Header — icône + nom, nom tronqué avec ellipsis */}
                    <div className="ac-metier-card-top">
                      <div className="ac-metier-icon">
                        <IconeRenderer
                          icone={m.icone}
                          size={16}
                          fallback={Wrench}
                        />
                      </div>
                      <div className="ac-metier-name" title={m.nom}>
                        {m.nom}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="ac-metier-desc">
                      {m.description || (
                        <em style={{ opacity: 0.3 }}>Aucune description</em>
                      )}
                    </p>

                    {/* Footer */}
                    <div className="ac-metier-card-footer">
                      <div className="ac-metier-footer-left">
                        <span
                          className={`ac-status-pill${m.isActive ? " active" : " inactive"}`}
                        >
                          <span className="ac-status-dot" />
                          {m.isActive ? "Actif" : "Inactif"}
                        </span>
                        <span className="ac-presta-count">
                          {prestCount} prestataire{prestCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="ac-row-actions">
                        <button
                          className="ac-btn ac-btn-toggle"
                          onClick={() => handleToggle(m)}
                          title={m.isActive ? "Désactiver" : "Activer"}
                        >
                          {m.isActive ? "⏸" : "▶"}
                        </button>
                        <button
                          className="ac-btn"
                          onClick={() => openEdit(m)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className={`ac-btn${prestCount > 0 ? " ac-btn-blocked" : " ac-btn-danger"}`}
                          onClick={() => openDelete(m)}
                          title={
                            prestCount > 0
                              ? "Suppression impossible : prestataires liés"
                              : "Supprimer"
                          }
                          disabled={prestCount > 0}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="ac-empty">
            Aucun métier ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "create" && (
        <AdminModal
          title="Nouveau métier"
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button
                className="am-btn am-btn-primary"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "…" : "Créer"}
              </button>
            </>
          }
        >
          <MetierForm />
        </AdminModal>
      )}

      {modal === "edit" && (
        <AdminModal
          title={`Modifier — ${selected?.nom}`}
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button
                className="am-btn am-btn-primary"
                onClick={handleEdit}
                disabled={loading}
              >
                {loading ? "…" : "Enregistrer"}
              </button>
            </>
          }
        >
          <MetierForm />
        </AdminModal>
      )}

      {modal === "delete" && (
        <AdminModal
          title="Supprimer le métier"
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button
                className="am-btn am-btn-danger"
                onClick={handleDelete}
                disabled={loading || (metierCounts[selected?._id] || 0) > 0}
              >
                {loading ? "…" : "Supprimer"}
              </button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <p className="ac-confirm-text">
            Supprimer le métier <strong>{selected?.nom}</strong> ?
          </p>
          {(metierCounts[selected?._id] || 0) > 0 && (
            <div className="ac-warn-block">
              ⛔ Suppression impossible : {metierCounts[selected?._id]}{" "}
              prestataire(s) utilisent ce métier.
            </div>
          )}
        </AdminModal>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────
const AdminCatalogues = ({ users = [] }) => {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, metRes] = await Promise.all([
        fetch(`${API_URL}/api/categories/admin/all`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/metiers/admin/all`, { credentials: "include" }),
      ]);
      const [catData, metData] = await Promise.all([
        catRes.json(),
        metRes.json(),
      ]);
      if (catRes.ok) setCategories(catData);
      if (metRes.ok) setMetiers(metData);
    } catch (e) {
      console.error("AdminCatalogues fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="ac-root">
      {/* Onglets */}
      <div className="ac-tabs">
        <button
          className={`ac-tab${activeTab === "categories" ? " active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          <FolderOpen size={14} />
          Catégories
          <span className="ac-tab-count">{categories.length}</span>
        </button>
        <button
          className={`ac-tab${activeTab === "metiers" ? " active" : ""}`}
          onClick={() => setActiveTab("metiers")}
        >
          <Wrench size={14} />
          Métiers
          <span className="ac-tab-count">{metiers.length}</span>
        </button>

        <div className="ac-tabs-right">
          <button
            className="ac-refresh-btn"
            onClick={fetchData}
            disabled={loading}
            title="Actualiser"
          >
            {loading ? "…" : "🔄"}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="ac-panel">
        {loading ? (
          <div className="ac-loading">Chargement…</div>
        ) : (
          <>
            {activeTab === "categories" && (
              <CategoriesPanel categories={categories} onRefresh={fetchData} />
            )}
            {activeTab === "metiers" && (
              <MetiersPanel
                metiers={metiers}
                categories={categories}
                users={users}
                onRefresh={fetchData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCatalogues;
