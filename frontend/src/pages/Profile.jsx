import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../api.js";
import { archetypeFromAttributes, ATTRIBUTE_META } from "../lib/attributes.js";
import { triggerParticles } from "../lib/particles.js";
import { playClick, playInscribeQuest } from "../lib/sound.js";
import InviteModal from "../components/InviteModal.jsx";
import {
  ShieldIcon,
  SwordIcon,
  BuildingIcon,
  MapPinIcon,
  MailIcon,
  TrophyIcon,
  SparklesIcon,
  FlameIcon,
  GoldCoinIcon,
  AttributeIcon,
  UserGroupIcon,
} from "../components/Icons.jsx";

const GENDER_OPTIONS = [
  "Select Gender / Pronouns",
  "Male",
  "Female",
  "Non-Binary",
  "Other",
  "Prefer not to say",
];

export default function Profile() {
  const { character, setCharacter } = useAuth();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    place: "",
    college: "",
    age: "",
    gender: "Select Gender / Pronouns",
  });
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // College Guild data
  const [guildData, setGuildData] = useState(null);
  const [loadingGuild, setLoadingGuild] = useState(false);

  useEffect(() => {
    if (character) {
      setForm({
        fullName: character.fullName || "",
        place: character.place || "",
        college: character.college || "",
        age: character.age !== null && character.age !== undefined ? String(character.age) : "",
        gender: character.gender || "Select Gender / Pronouns",
      });
      if (character.college) {
        loadCollegeGuild(character.college);
      }
    }
  }, [character]);

  function loadCollegeGuild(collegeName) {
    if (!collegeName) return;
    setLoadingGuild(true);
    api
      .getCollegeLeaderboard(collegeName)
      .then((data) => setGuildData(data))
      .catch((err) => console.error("Error loading college guild:", err))
      .finally(() => setLoadingGuild(false));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    playClick();

    try {
      const payload = {
        fullName: form.fullName.trim(),
        place: form.place.trim(),
        college: form.college.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender === "Select Gender / Pronouns" ? "" : form.gender,
      };

      const res = await api.updateProfile(payload);
      setCharacter(res.character);
      playInscribeQuest();
      triggerParticles({ count: 24 });
      showSuccess("Profile Updated", "Your adventurer credentials and college guild have been sealed!");
      if (payload.college) {
        loadCollegeGuild(payload.college);
      } else {
        setGuildData(null);
      }
    } catch (err) {
      showError("Update Failed", err.message || "Could not save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!character) return null;

  const archetype = archetypeFromAttributes(character.attributes || {});
  const campusMembers = guildData?.campusMembers || [];
  const myRankInCampus = campusMembers.findIndex((m) => m.id === character.id) + 1;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        character={character}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-6 h-6 text-amber" />
            <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
              Adventurer Dossier & Campus Guild
            </h1>
          </div>
          <p className="text-mute text-sm mt-1">
            Personalize your character credentials, join your campus cohort, and challenge peers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-paper text-xs sm:text-sm font-semibold hover:opacity-90 transition-all shadow-md shrink-0"
        >
          <MailIcon className="w-4 h-4 text-amber" />
          <span>Invite & Share Stats</span>
        </button>
      </div>

      {/* Hero Overview Card */}
      <div className="rpg-glass rounded-2xl border-2 border-hairline p-6 sm:p-7 relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-surface border-2 border-indigo/30 flex items-center justify-center font-display text-2xl font-bold text-indigo shadow-inner">
              L{character.level}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  {character.fullName || character.username}
                </h2>
                {character.fullName && (
                  <span className="text-xs text-mute font-mono">@{character.username}</span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo border border-indigo/20">
                  {archetype.name}
                </span>
              </div>
              <p className="text-xs text-mute flex items-center gap-3 mt-1.5 flex-wrap">
                {character.college && (
                  <span className="flex items-center gap-1 text-ink font-medium">
                    <BuildingIcon className="w-3.5 h-3.5 text-indigo" />
                    <span>{character.college}</span>
                  </span>
                )}
                {character.place && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-mute" />
                    <span>{character.place}</span>
                  </span>
                )}
                {character.age && (
                  <span>• {character.age} years old</span>
                )}
                {character.gender && (
                  <span>• {character.gender}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-hairline pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around sm:justify-start">
            <div className="text-center">
              <p className="text-[10px] uppercase font-mono tracking-wider text-mute">Streak</p>
              <p className="font-display text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <FlameIcon className="w-4 h-4" />
                {character.streak?.current || 0}d
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-mono tracking-wider text-mute">Treasury</p>
              <p className="font-display text-lg font-bold text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-1 mt-0.5">
                <GoldCoinIcon className="w-4 h-4" />
                {character.gold}g
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================================= */}
        {/* 📝 EDITABLE PROFILE CREDENTIALS FORM */}
        {/* ========================================================================= */}
        <div className="rpg-glass rounded-2xl border border-hairline p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-hairline">
            <SparklesIcon className="w-4 h-4 text-amber" />
            <h3 className="font-display text-base sm:text-lg text-ink font-semibold">
              Edit Adventurer Credentials
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-mute mb-1">
                Full Name / Real Identity
              </label>
              <input
                type="text"
                placeholder="e.g. Alok Kumar"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm bg-paper border border-hairline rounded-lg text-ink focus:outline-hidden focus:border-indigo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-mute mb-1 flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  <span>Place / Realm</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, IN"
                  value={form.place}
                  onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-paper border border-hairline rounded-lg text-ink focus:outline-hidden focus:border-indigo"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-mute mb-1 flex items-center gap-1">
                  <BuildingIcon className="w-3 h-3" />
                  <span>College / Academy</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIT Bombay, Stanford"
                  value={form.college}
                  onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-paper border border-hairline rounded-lg text-ink focus:outline-hidden focus:border-indigo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-mute mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 21"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-paper border border-hairline rounded-lg text-ink focus:outline-hidden focus:border-indigo"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-mute mb-1">
                  Gender / Pronouns
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-paper border border-hairline rounded-lg text-ink focus:outline-hidden focus:border-indigo"
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-2 py-2.5 px-4 bg-ink text-paper rounded-lg font-medium text-sm hover:opacity-90 transition-all shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <SwordIcon className="w-4 h-4 text-amber" />
              <span>{saving ? "Inscribing Dossier…" : "Save Character Profile"}</span>
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* 🏛️ CAMPUS GUILD COHORT & CLASSMATES */}
        {/* ========================================================================= */}
        <div className="rpg-glass rounded-2xl border border-hairline p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <BuildingIcon className="w-5 h-5 text-indigo" />
                <h3 className="font-display text-base sm:text-lg text-ink font-semibold">
                  Campus Guild Roster
                </h3>
              </div>
              {character.college && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo border border-indigo/20 truncate max-w-[150px]">
                  {character.college}
                </span>
              )}
            </div>

            {!character.college ? (
              <div className="text-center py-10 px-4 border border-dashed border-hairline rounded-xl bg-surface/40">
                <BuildingIcon className="w-8 h-8 text-mute mx-auto mb-2 opacity-50" />
                <p className="font-display text-sm font-semibold text-ink">No College Guild Joined</p>
                <p className="text-xs text-mute mt-1 max-w-xs mx-auto">
                  Type your college name in the form on the left to unite with classmates and unlock campus rankings!
                </p>
              </div>
            ) : loadingGuild ? (
              <div className="text-center py-8 text-xs text-mute">
                Gathering campus guild intelligence…
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-mute px-1 pb-1">
                  <span>Guild Members: <strong className="text-ink">{campusMembers.length}</strong></span>
                  {myRankInCampus > 0 && (
                    <span>Your Campus Standing: <strong className="text-amber">Rank #{myRankInCampus}</strong></span>
                  )}
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {campusMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        member.id === character.id
                          ? "bg-indigo-500/10 border-indigo/40 font-medium"
                          : "bg-surface border-hairline"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                          member.rank === 1 ? "bg-amber-500 text-ink" : member.rank === 2 ? "bg-slate-300 text-ink" : "bg-hairline text-mute"
                        }`}>
                          {member.rank}
                        </span>
                        <div className="truncate">
                          <p className="text-ink font-semibold truncate">
                            {member.fullName || member.username}
                            {member.id === character.id && " (You)"}
                          </p>
                          <p className="text-[10px] text-mute flex items-center gap-1">
                            <span>Lvl {member.level}</span>
                            <span>•</span>
                            <span className="capitalize">{member.topAttribute}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-ink font-mono font-semibold shrink-0 ml-2">
                        {member.scoreLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="w-full py-2 px-3 rounded-lg border border-hairline bg-surface hover:bg-paper text-ink text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <UserGroupIcon className="w-4 h-4 text-indigo" />
              <span>Summon More Classmates to Guild</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
