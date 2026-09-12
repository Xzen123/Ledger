import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { triggerParticles } from "../lib/particles.js";
import { playCoinClink, playEquipTheme } from "../lib/sound.js";
import { PaletteIcon, TrophyIcon, AuraIcon, GoldCoinIcon } from "../components/Icons.jsx";

const TYPE_LABEL = { theme: "Theme", badge: "Badge", cosmetic: "Cosmetic" };

function ShopItemIcon({ type, className = "w-4 h-4" }) {
  if (type === "theme") return <PaletteIcon className={`${className} text-indigo`} />;
  if (type === "badge") return <TrophyIcon className={`${className} text-amber`} />;
  return <AuraIcon className={`${className} text-purple-400`} />;
}

export default function Shop() {
  const { character, setCharacter } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const [equippingTheme, setEquippingTheme] = useState(null);

  useEffect(() => {
    api
      .listShopItems()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, []);

  async function handleBuy(item) {
    if (character.gold < item.cost) {
      setError(`Not enough gold — you need ${item.cost - character.gold} more.`);
      return;
    }
    setBuyingId(item.id);
    setError("");

    // Optimistic: mark owned and deduct gold immediately.
    const prevItems = items;
    const prevCharacter = character;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i)));
    setCharacter({ ...character, gold: character.gold - item.cost });

    try {
      const data = await api.buyItem(item.id);
      playCoinClink();
      setCharacter(data.character);
      triggerParticles({ count: 32 });
    } catch (err) {
      setItems(prevItems);
      setCharacter(prevCharacter);
      setError(err.message);
    } finally {
      setBuyingId(null);
    }
  }

  async function handleEquipTheme(themeValue) {
    setEquippingTheme(themeValue);
    setError("");
    try {
      const data = await api.setTheme(themeValue);
      playEquipTheme();
      setCharacter(data.character);
      triggerParticles({ count: 20 });
    } catch (err) {
      setError(err.message);
    } finally {
      setEquippingTheme(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Shop</h1>
        <p className="text-mute text-sm mt-1">Spend gold earned from quests on themes, badges, and cosmetics.</p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {items === null && (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-lg" />
          ))}
        </div>
      )}

      {items && (
        <ul className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => {
            const isTheme = item.type === "theme";
            const isActiveTheme = isTheme && (character?.activeTheme || "default") === item.value;

            return (
              <li key={item.id} className="border border-hairline rounded-lg p-4 bg-surface flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-paper border border-hairline flex items-center justify-center shrink-0">
                      <ShopItemIcon type={item.type} className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium">{item.name}</p>
                  </div>
                  <span className="text-xs text-mute shrink-0">{TYPE_LABEL[item.type]}</span>
                </div>
                <p className="text-xs text-mute mt-2 flex-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-display text-amber tabular-nums flex items-center gap-1">
                    <GoldCoinIcon className="w-3.5 h-3.5 text-amber" />
                    <span>{item.cost === 0 ? "Free" : `${item.cost}g`}</span>
                  </span>

                  {item.owned ? (
                    isTheme ? (
                      isActiveTheme ? (
                        <span className="text-xs px-3 py-1.5 rounded-md bg-moss-soft text-moss font-medium">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEquipTheme(item.value)}
                          disabled={equippingTheme === item.value}
                          className="text-xs px-3 py-1.5 rounded-md bg-indigo text-paper font-medium hover:opacity-90 transition-opacity"
                        >
                          {equippingTheme === item.value ? "Equipping…" : "Equip"}
                        </button>
                      )
                    ) : item.type === "cosmetic" ? (
                      <span className="text-xs px-3 py-1.5 rounded-md bg-amber-soft text-amber font-medium">
                        Active Aura
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1.5 rounded-md bg-moss-soft text-moss font-medium">
                        Unlocked
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={buyingId === item.id}
                      className="text-xs px-3 py-1.5 rounded-md bg-ink text-paper font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
                    >
                      {buyingId === item.id ? "Buying…" : "Buy"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
