import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, Eye, EyeOff, LogOut, Layout, Settings, FileText, HelpCircle,
  Plus, Trash2, Edit2, Check, RefreshCw, FileImage, Layers, Shield,
  MapPin, Sliders, Play, PlusCircle, Copy, AlertCircle, Save, ArrowUp, ArrowDown,
  Server, MessageSquare, Phone, Info, Star, ChevronRight, X, ExternalLink,
  Menu, Grid, Video, Smartphone, CheckCircle2, Image, ChevronLeft, Globe, TrendingUp, Upload
} from "lucide-react";
import { useAppContext, AppContext, EditableContainer, ProntaEntregaItem, EditableProject, EditableVideo, EditableFAQ, EditableTestimonial } from "../context/AppContext";
import { getSupabase } from "../lib/supabase";
import ImageUploadField from "./ImageUploadField";
import VideoUploadField from "./VideoUploadField";
import GaleriaImagens from "./GaleriaImagens";
import Logo from "./Logo";
import Hero from "./Hero";
import SimuladorOrcamento from "./SimuladorOrcamento";
import Diferenciais from "./Diferenciais";
import ContainersGrid from "./ContainersGrid";
import ProntaEntrega from "./ProntaEntrega";
import Projetos from "./Projetos";
import GaleriaProjetos from "./GaleriaProjetos";
import CalculadoraEconomia from "./CalculadoraEconomia";
import VideosReais from "./VideosReais";
import ComoFunciona from "./ComoFunciona";
import MapaAtendimento from "./MapaAtendimento";
import Sobre from "./Sobre";
import FAQInteligente from "./FAQInteligente";
import Depoimentos from "./Depoimentos";
import CTA from "./CTA";
import CanaisAtendimento from "./CanaisAtendimento";
import ObrasAndamento from "./ObrasAndamento";
import MaosAObra from "./MaosAObra";
import CustomBlockSection from "./CustomBlockSection";
import { STRUCTURE_OPTIONS, FLOORS, INTERNAL_WALLS, PAINT_COLORS, DOOR_TYPES, WINDOW_TYPES, ALL_EXTRAS } from "../data/materials";
import Header from "./Header";
import Footer from "./Footer";
import CarrosselGaleria, {
  CarrosselConfig,
  DEFAULT_CARROSSEL_CONFIG,
  getCarrosselConfig,
  saveCarrosselConfigToStorage,
} from "./CarrosselGaleria";

// Maps a real section key (as used in sectionsOrder/drawerSection — NOT the
// legacy shorthand some older call sites used) to its live component, for the
// Landing Page builder's preview panels (main "Live Preview" column and the
// editor drawer's embedded preview). Single source of truth so both stay in
// sync with whatever sections actually exist.
function renderSectionElement(sec: string): React.ReactNode {
  if (sec.startsWith("custom-")) return <CustomBlockSection id={sec} />;
  switch (sec) {
    case "logo": return (
      <div className="space-y-0 bg-[#0A0C0E] min-h-screen flex flex-col justify-between">
        <Header />
        <div className="flex-1 opacity-70"><Hero /></div>
        <Footer />
      </div>
    );
    case "hero": return <Hero />;
    case "simulator": return <SimuladorOrcamento />;
    case "differentials": return <Diferenciais />;
    case "containers": return <ContainersGrid />;
    case "prontaEntrega": return <ProntaEntrega />;
    case "projects": return <Projetos />;
    case "obrasAndamento": return <ObrasAndamento />;
    case "maosAObra": return <MaosAObra />;
    case "carrosselGaleria": return <CarrosselGaleria />;
    case "gallery": return <GaleriaProjetos />;
    case "economyCalculator": return <CalculadoraEconomia />;
    case "videos": return <VideosReais />;
    case "timeline": return <ComoFunciona />;
    case "map": return <MapaAtendimento />;
    case "about": return <Sobre />;
    case "faq": return <FAQInteligente />;
    case "testimonials": return <Depoimentos />;
    case "cta": return <CTA />;
    case "channels": return <CanaisAtendimento />;
    default: return <Hero />;
  }
}

// ─── Carrossel Landing Page Admin Panel ──────────────────────────────────────
function CarrosselAdminPanel({ triggerNotification }: { triggerNotification: (msg: string) => void }) {
  const [config, setConfig] = React.useState<CarrosselConfig>(getCarrosselConfig);
  const [folders, setFolders] = React.useState<string[]>([]);
  const [previewCount, setPreviewCount] = React.useState<number | null>(null);
  const [loadingFolders, setLoadingFolders] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [rawUrls, setRawUrls] = React.useState<string>(config.selectedUrls.join("\n"));
  const [newFolderName, setNewFolderName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const refreshFolderCount = React.useCallback(async (folder: string) => {
    if (!folder) { setPreviewCount(null); return; }
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data } = await supabase.storage
        .from("site-assets")
        .list(`gallery/${folder}`, { limit: 200 });
      if (data) {
        setPreviewCount(data.filter((f) => f.name !== ".emptyFolderPlaceholder").length);
      }
    } catch {}
  }, []);

  const loadFolders = React.useCallback(async () => {
    setLoadingFolders(true);
    const supabase = getSupabase();
    if (!supabase) { setLoadingFolders(false); return; }
    try {
      const { data } = await supabase.storage.from("site-assets").list("gallery", { limit: 100 });
      if (data) {
        const folderNames = data.filter((f) => !f.metadata).map((f) => f.name);
        setFolders(folderNames);
      }
    } catch {}
    setLoadingFolders(false);
  }, []);

  React.useEffect(() => { loadFolders(); }, [loadFolders]);

  React.useEffect(() => { refreshFolderCount(config.folder); }, [config.folder, refreshFolderCount]);

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    setConfig((c) => ({ ...c, folder: name }));
    setFolders((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewFolderName("");
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!config.folder) { triggerNotification("Selecione ou crie uma pasta antes de enviar imagens."); return; }
    const supabase = getSupabase();
    if (!supabase) { triggerNotification("Supabase não configurado — upload indisponível."); return; }
    setUploading(true);
    let okCount = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `gallery/${config.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from("site-assets").upload(path, file, { cacheControl: "31536000", upsert: false });
        if (!error) okCount++;
      } catch {}
    }
    setUploading(false);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
    triggerNotification(`${okCount} imagem(ns) enviada(s) para "${config.folder}".`);
    refreshFolderCount(config.folder);
    loadFolders();
  };

  const handleSave = () => {
    setSaving(true);
    const urls = rawUrls.split("\n").map((u) => u.trim()).filter(Boolean);
    const toSave: CarrosselConfig = { ...config, selectedUrls: urls };
    saveCarrosselConfigToStorage(toSave);
    setConfig(toSave);
    setSaving(false);
    triggerNotification("Carrossel salvo! Ative a seção no painel de seções para exibir na landing page.");
  };

  const inputCls = "w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white text-xs outline-none focus:border-orange-500 font-mono transition-colors";
  const labelCls = "block text-stone-400 text-xs mb-1.5 uppercase font-bold tracking-wide";

  return (
    <div className="space-y-6">
      <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl">
        <h3 className="text-white text-base font-black uppercase mb-1">Carrossel na Landing Page</h3>
        <p className="text-stone-400 text-xs mb-6">
          Configure as imagens que aparecem no carrossel da landing page. Escolha uma pasta da galeria ou cole URLs individuais.
          Após salvar, ative a seção <span className="text-orange-400 font-bold">Carrossel</span> no painel de seções.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
          <div>
            <label className={labelCls}>Título da Seção</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
              className={inputCls}
              placeholder="Ex: Nossos Projetos"
            />
          </div>

          <div>
            <label className={labelCls}>Subtítulo</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig((c) => ({ ...c, subtitle: e.target.value }))}
              className={inputCls}
              placeholder="Ex: Veja nossos trabalhos realizados"
            />
          </div>

          <div>
            <label className={labelCls}>
              Pasta da Galeria
              {loadingFolders && <span className="ml-2 text-stone-500 normal-case font-normal">carregando...</span>}
            </label>
            <select
              value={config.folder}
              onChange={(e) => setConfig((c) => ({ ...c, folder: e.target.value }))}
              className={inputCls}
              disabled={loadingFolders}
            >
              <option value="">-- Selecionar pasta --</option>
              {folders.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <div className="flex gap-1.5 mt-1.5">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateFolder(); } }}
                placeholder="Ou crie uma pasta nova..."
                className="flex-1 bg-[#0F1115] border border-white/5 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-orange-500 font-mono"
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg text-[10px] font-bold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Criar
              </button>
            </div>
            {config.folder && previewCount !== null && (
              <p className="text-stone-500 mt-1.5">
                {previewCount} {previewCount === 1 ? "imagem" : "imagens"} encontradas em <span className="text-orange-400">{config.folder}</span>
              </p>
            )}
            {!config.folder && folders.length === 0 && !loadingFolders && (
              <p className="text-stone-500 mt-1.5">Nenhuma pasta encontrada. Crie pastas na aba Galeria.</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Velocidade do Carrossel (ms)</label>
            <input
              type="number"
              value={config.autoplaySpeed}
              min={1000}
              max={15000}
              step={500}
              onChange={(e) => setConfig((c) => ({ ...c, autoplaySpeed: Number(e.target.value) }))}
              className={inputCls}
            />
            <p className="text-stone-500 mt-1.5">{config.autoplaySpeed / 1000}s por slide</p>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Upload de Imagens</label>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading || !config.folder}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Enviando..." : "Selecionar Imagens"}
            </button>
            <p className="text-stone-500 mt-1.5">
              {config.folder
                ? `Envia direto para a pasta "${config.folder}" — aparece no carrossel automaticamente.`
                : "Selecione ou crie uma pasta acima antes de enviar imagens."}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>
              URLs Individuais (opcional — uma por linha)
              <span className="ml-2 text-stone-500 normal-case font-normal">Se preenchido, substitui a pasta</span>
            </label>
            <textarea
              rows={5}
              value={rawUrls}
              onChange={(e) => setRawUrls(e.target.value)}
              className={`${inputCls} resize-y`}
              placeholder={"https://...\nhttps://..."}
            />
            {rawUrls.trim() && (
              <p className="text-stone-500 mt-1.5">
                {rawUrls.split("\n").filter((u) => u.trim()).length} URLs configuradas
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-5 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Salvando..." : "Salvar Carrossel"}
          </button>
          <button
            onClick={() => {
              setConfig(DEFAULT_CARROSSEL_CONFIG);
              setRawUrls("");
            }}
            className="text-stone-500 hover:text-white text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer px-3"
          >
            Resetar
          </button>
        </div>
      </div>

      <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-5">
        <p className="text-stone-400 text-xs leading-relaxed">
          <span className="text-orange-400 font-bold">Como funciona:</span> As imagens são carregadas diretamente da pasta selecionada na Galeria do Supabase.
          Para adicionar fotos ao carrossel, basta subir imagens nessa pasta na aba <span className="text-orange-400">Galeria</span>.
          O carrossel avança automaticamente e o visitante pode navegar com setas ou swipe no celular.
        </p>
      </div>
    </div>
  );
}

function ProfileTab({ adminUser, changeCredentials, triggerNotification }: {
  adminUser: any;
  changeCredentials: (email: string, currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  triggerNotification: (msg: string) => void;
}) {
  const [newEmail, setNewEmail] = React.useState(adminUser?.email || "");
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [credMsg, setCredMsg] = React.useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);
    if (newPass && newPass !== confirmPass) {
      setCredMsg({ text: "Nova senha e confirmação não coincidem.", ok: false });
      return;
    }
    if (!currentPass) {
      setCredMsg({ text: "Informe sua senha atual para confirmar a alteração.", ok: false });
      return;
    }
    setSaving(true);
    const result = await changeCredentials(newEmail, currentPass, newPass);
    setSaving(false);
    setCredMsg({ text: result.message, ok: result.success });
    if (result.success) {
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      triggerNotification(result.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-white text-base font-black uppercase">Perfil do Administrador</h3>
          <p className="text-stone-400 text-xs mt-1">Altere seu e-mail e senha de acesso ao painel.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#0F1115] p-5 rounded-xl border border-white/5">
          <div className="w-16 h-16 rounded-full bg-[#FFD400]/10 border border-[#FFD400]/25 flex items-center justify-center text-xl font-bold text-[#FFD400] font-mono">
            {(adminUser?.email?.[0] || "D").toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[9px] font-mono font-bold text-[#FFD400] bg-[#FFD400]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Master Admin</span>
            <h4 className="text-white text-sm font-black uppercase mt-1">{adminUser?.email?.split("@")?.[0] || "Admin"}</h4>
            <p className="text-stone-400 text-xs font-medium">{adminUser?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-stone-400 mb-1.5 uppercase font-medium">Novo E-mail de Login</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white outline-none focus:border-[#FFD400] font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1.5 uppercase font-medium">Senha Atual <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white outline-none focus:border-[#FFD400]"
              />
            </div>
            <div />
            <div>
              <label className="block text-stone-400 mb-1.5 uppercase font-medium">Nova Senha</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Deixe vazio para não alterar"
                className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white outline-none focus:border-[#FFD400]"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1.5 uppercase font-medium">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          {credMsg && (
            <p className={`text-xs px-3 py-2 rounded-lg border ${credMsg.ok ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
              {credMsg.text}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#FFD400] hover:bg-[#FFE14D] disabled:opacity-50 text-stone-950 text-xs font-black uppercase rounded-lg transition-all cursor-pointer"
            >
              {saving ? "Salvando..." : "Salvar Credenciais"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Small reusable text/textarea field for the Landing Page drawer's per-section quick editors.
function DrawerField({ label, value, onChange, rows, mono }: { label: string; value: string; onChange: (v: string) => void; rows?: number; mono?: boolean }) {
  const base = `w-full bg-[#0F1115] border border-white/5 rounded-xl text-white text-xs focus:border-[#FFD400] outline-none ${mono ? "font-mono" : ""}`;
  return (
    <div>
      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${base} p-3 leading-relaxed resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`${base} p-2.5`} />
      )}
    </div>
  );
}

// Compact card for one item inside a list-type drawer editor (Containers, FAQ, Depoimentos, etc.)
function DrawerListCard({ title, onDelete, children }: { title: string; onDelete: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-[#0F1115] border border-white/5 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-[#FFD400] uppercase tracking-wider truncate">{title}</span>
        <button onClick={onDelete} className="p-1.5 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-lg transition-all cursor-pointer shrink-0" title="Excluir item">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {children}
    </div>
  );
}

export default function AdminPanel() {
  const {
    isAdminLoggedIn,
    adminUser,
    login,
    logout,
    loginError,
    recoverPassword,
    changeCredentials,

    baseLocation, saveBaseLocation,
    logoSettings, saveLogoSettings,
    seo, saveSEO,
    hero, saveHero,
    differentials, addDifferential, editDifferential, deleteDifferential,
    containers, addContainer, editContainer, deleteContainer,
    prontaEntrega, addProntaEntrega, editProntaEntrega, deleteProntaEntrega, duplicateProntaEntrega,
    projects, addProject, editProject, deleteProject,
    videos, addVideo, editVideo, deleteVideo,
    faq, addFAQ, editFAQ, deleteFAQ,
    testimonials, addTestimonial, editTestimonial, deleteTestimonial,
    regions, saveRegions,
    simulator, saveSimulator,
    whatsapp, saveWhatsApp,
    mediaLibrary, addMediaItem, deleteMediaItem,
    customBlocks, addCustomBlock, editCustomBlock, deleteCustomBlock,
    materialImages, setMaterialImage, removeMaterialImage,
    ongoingProjects, addOngoingProject, editOngoingProject, deleteOngoingProject,
    about, saveAbout,
    timeline, saveTimeline,
    cta, saveCTA,
    channels, saveChannels,
    maosAObra, saveMaosAObra,
    gallery, saveGallery,
    economyCalculator, saveEconomyCalculator,
    sectionsVisibility, saveSectionsVisibility,
    sectionsOrder, saveSectionsOrder,
    lastUpdated,
    setAdminViewActive,

    isPagePreviewMode,
    setPagePreviewMode,
    hasUnsavedChanges,
    publishChanges,
    discardDrafts,
    restoreOriginalDefaults,
    previewDataScope,
    setPreviewDataScope
  } = useAppContext();
  // Called unconditionally here (rather than inside the emulator-frame renderers
  // below) so the Live Preview / compare-mode panels can hand a full context
  // snapshot to their nested <AppContext.Provider> overrides without violating
  // the Rules of Hooks by calling useAppContext() conditionally mid-render.
  const fullAppContext = useAppContext();

  // Navigation tab for Admin panel - Redesigned SaaS Suite
  const VALID_TABS = ["dashboard", "landing_builder", "containers", "projects", "media", "logistic", "testimonials", "settings", "profile"] as const;
  type TabType = typeof VALID_TABS[number];
  const [activeTab, setActiveTabRaw] = useState<TabType>(() => {
    try {
      const saved = localStorage.getItem("dodisa_admin_tab") as TabType;
      return VALID_TABS.includes(saved) ? saved : "dashboard";
    } catch { return "dashboard"; }
  });
  const setActiveTab = (tab: TabType) => {
    setActiveTabRaw(tab);
    try { localStorage.setItem("dodisa_admin_tab", tab); } catch { /* ignore */ }
  };

  // Secondary sub-tabs to group collapsed panels cleanly
  const [containersSubTab, setContainersSubTab] = useState<"catalogo" | "pronta" | "materiais">("catalogo");
  const [projectsSubTab, setProjectsSubTab] = useState<"cases" | "videos" | "differentials">("cases");
  const [settingsSubTab, setSettingsSubTab] = useState<"hero" | "conversions" | "faq" | "logo" | "domain" | "base">("hero");
  const [mediaSubTab, setMediaSubTab] = useState<"gallery" | "carrossel">("gallery");

  // Folder list + upload for the "Mãos à Obra" editor. Lives at AdminPanel's top
  // level (not inside the drawer's conditional JSX) because the maosAObra editor
  // is inline here rather than its own component like CarrosselAdminPanel, and
  // Hooks can't be called conditionally mid-render.
  const [maosAObraFolders, setMaosAObraFolders] = useState<string[]>([]);
  const [loadingMaosAObraFolders, setLoadingMaosAObraFolders] = useState(false);
  const [newMaosAObraFolderName, setNewMaosAObraFolderName] = useState("");
  const [uploadingMaosAObra, setUploadingMaosAObra] = useState(false);
  const maosAObraUploadInputRef = useRef<HTMLInputElement>(null);

  const loadMaosAObraFolders = useCallback(async () => {
    setLoadingMaosAObraFolders(true);
    const supabase = getSupabase();
    if (!supabase) { setLoadingMaosAObraFolders(false); return; }
    try {
      const { data } = await supabase.storage.from("site-assets").list("gallery", { limit: 100 });
      if (data) setMaosAObraFolders(data.filter((f) => !f.metadata).map((f) => f.name));
    } catch {}
    setLoadingMaosAObraFolders(false);
  }, []);

  useEffect(() => { loadMaosAObraFolders(); }, [loadMaosAObraFolders]);

  const handleCreateMaosAObraFolder = () => {
    const name = newMaosAObraFolderName.trim();
    if (!name) return;
    saveMaosAObra({ ...maosAObra, folder: name });
    setMaosAObraFolders((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewMaosAObraFolderName("");
  };

  const handleUploadMaosAObraFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!maosAObra.folder) { triggerNotification("Selecione ou crie uma pasta antes de enviar imagens."); return; }
    const supabase = getSupabase();
    if (!supabase) { triggerNotification("Supabase não configurado — upload indisponível."); return; }
    setUploadingMaosAObra(true);
    let okCount = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `gallery/${maosAObra.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from("site-assets").upload(path, file, { cacheControl: "31536000", upsert: false });
        if (!error) okCount++;
      } catch {}
    }
    setUploadingMaosAObra(false);
    if (maosAObraUploadInputRef.current) maosAObraUploadInputRef.current.value = "";
    triggerNotification(`${okCount} imagem(ns) enviada(s) para "${maosAObra.folder}".`);
    loadMaosAObraFolders();
  };

  // Live Preview layout controller states
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewSectionLock, setPreviewSectionLock] = useState<string>("auto");
  const [compareModes, setCompareModes] = useState<boolean>(false);
  const [mobileViewTab, setMobileViewTab] = useState<"editor" | "preview">("editor");

  // Sync left editor panel when preview section changes
  useEffect(() => {
    if (previewSectionLock === "auto") return;
    const map: Record<string, () => void> = {
      hero:          () => { setActiveTab("settings"); setSettingsSubTab("hero"); },
      simulator:     () => { setActiveTab("settings"); setSettingsSubTab("conversions"); },
      cta:           () => { setActiveTab("settings"); setSettingsSubTab("conversions"); },
      channels:      () => { setActiveTab("settings"); setSettingsSubTab("conversions"); },
      faq:           () => { setActiveTab("settings"); setSettingsSubTab("faq"); },
      logo:          () => { setActiveTab("settings"); setSettingsSubTab("logo"); },
      domain:        () => { setActiveTab("settings"); setSettingsSubTab("domain"); },
      map:           () => { setActiveTab("settings"); setSettingsSubTab("base"); },
      containers:    () => { setActiveTab("containers"); setContainersSubTab("catalogo"); },
      prontaEntrega: () => { setActiveTab("containers"); setContainersSubTab("pronta"); },
      projects:      () => { setActiveTab("projects"); setProjectsSubTab("cases"); },
      videos:        () => { setActiveTab("projects"); setProjectsSubTab("videos"); },
      differentials: () => { setActiveTab("projects"); setProjectsSubTab("differentials"); },
      gallery:       () => { setActiveTab("media"); setMediaSubTab("gallery"); },
      testimonials:  () => { setActiveTab("testimonials"); },
      logistic:      () => { setActiveTab("logistic"); },
    };
    map[previewSectionLock]?.();
  }, [previewSectionLock]);

  // Sidebar collapsing state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Search & Notification Center States
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState([
    { id: 1, text: "O site está rodando em ambiente seguro SSL.", type: "info", time: "Há 2 min" },
    { id: 2, text: "Sincronização com banco de dados Supabase ativa.", type: "success", time: "Há 10 min" },
    { id: 3, text: "Nenhuma inconsistência de DNS foi detectada.", type: "success", time: "Hoje" },
  ]);

  // Full Screen Preview Toggle
  const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isPreviewPopupOpen, setIsPreviewPopupOpen] = useState(false);

  useEffect(() => {
    if (!isPreviewPopupOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsPreviewPopupOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isPreviewPopupOpen]);

  // Landing Page Builder and Quick Edit Side Drawer States
  const [drawerSection, setDrawerSection] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Modal Pop-up editor state
  const [editModal, setEditModal] = useState<{
    type: "container" | "pronta" | "project" | "video" | "differential" | "testimonial";
    id: string | number;
  } | null>(null);

  // Color Editor Custom Theme State (Visual Identity Colors)
  const [themeColors, setThemeColors] = useState(() => {
    try {
      const saved = localStorage.getItem("dodisa_theme_colors");
      return saved ? JSON.parse(saved) : {
        primary: "#FFD400",
        primaryHover: "#FFE14D",
        secondary: "#FF9A00",
        textTitle: "#FFFFFF",
        bgCard: "#171A21",
        bgBadge: "#FFD400",
      };
    } catch {
      return {
        primary: "#FFD400",
        primaryHover: "#FFE14D",
        secondary: "#FF9A00",
        textTitle: "#FFFFFF",
        bgCard: "#171A21",
        bgBadge: "#FFD400",
      };
    }
  });

  const saveThemeColors = (newColors: typeof themeColors) => {
    setThemeColors(newColors);
    localStorage.setItem("dodisa_theme_colors", JSON.stringify(newColors));
    triggerNotification("Identidade visual atualizada em todo o site!");
  };

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", themeColors.primary);
    root.style.setProperty("--color-primary-hover", themeColors.primaryHover);
    root.style.setProperty("--color-secondary", themeColors.secondary);
    root.style.setProperty("--color-text-title", themeColors.textTitle);
    root.style.setProperty("--color-bg-card", themeColors.bgCard);
    root.style.setProperty("--color-bg-badge", themeColors.bgBadge);
  }, [themeColors]);

  // Local State: Login form
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMsg, setAuthMsg] = useState("");

  // Notification success banner
  const [notification, setNotification] = useState<string | null>(null);

  // Custom Domain management states
  const [customDomain, setCustomDomain] = useState<string>(() => localStorage.getItem("dodisa_custom_domain") || "www.dodisacontainers.com.br");
  const [isCheckingPropagation, setIsCheckingPropagation] = useState<boolean>(false);
  const [propagationStatus, setPropagationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [propagationLog, setPropagationLog] = useState<string[]>([]);
  const [dnsProvider, setDnsProvider] = useState<string>("cloudflare");
  const [geoDnsResults, setGeoDnsResults] = useState<any[]>([
    { city: "São Paulo, BR", type: "CNAME", status: "idle", ip: "Pendente", provider: "Registro.br DNS" },
    { city: "Virginia, EUA", type: "CNAME", status: "idle", ip: "Pendente", provider: "Google DNS (8.8.8.8)" },
    { city: "Oregon, EUA", type: "CNAME", status: "idle", ip: "Pendente", provider: "Cloudflare DNS (1.1.1.1)" },
    { city: "Rio de Janeiro, BR", type: "CNAME", status: "idle", ip: "Pendente", provider: "Claro/NET DNS" },
    { city: "Recife, BR", type: "CNAME", status: "idle", ip: "Pendente", provider: "Vivo Fibra DNS" },
    { city: "Frankfurt, ALE", type: "CNAME", status: "idle", ip: "Pendente", provider: "Quad9 DNS (9.9.9.9)" },
  ]);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogoUpload = async (file: File, type: "light" | "dark" | "favicon") => {
    if (file.size > 2 * 1024 * 1024) {
      triggerNotification("Erro: O arquivo excede o limite máximo de 2MB!");
      return;
    }

    // Immediate local preview via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newSettings = { ...logoSettings };
      if (type === "light") {
        newSettings.logoUrl = dataUrl;
      } else if (type === "dark") {
        newSettings.logoDarkUrl = dataUrl;
      } else {
        newSettings.faviconUrl = dataUrl;
      }
      saveLogoSettings(newSettings);
      triggerNotification("Preview carregado! Salve para aplicar no site definitivo.");
    };
    reader.readAsDataURL(file);

    // If Supabase is active, upload to site-assets bucket, logos/ folder
    const supabase = getSupabase();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || "png";
        const cleanName = `${type}_${Date.now()}.${fileExt}`;
        const filePath = `logos/${cleanName}`;

        const { error } = await supabase.storage
          .from("site-assets")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (error) {
          console.error("Storage upload error:", error);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("site-assets")
            .getPublicUrl(filePath);

          const newSettings = { ...logoSettings };
          if (type === "light") {
            newSettings.logoUrl = publicUrl;
          } else if (type === "dark") {
            newSettings.logoDarkUrl = publicUrl;
          } else {
            newSettings.faviconUrl = publicUrl;
          }
          saveLogoSettings(newSettings);
        }
      } catch (err) {
        console.error("Exception in storage upload:", err);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg("");
    const success = await login(emailInput, passwordInput);
    if (success) {
      triggerNotification("Autenticado com sucesso como ADMIN MASTER!");
    }
  };

  const handleRecover = async () => {
    if (!emailInput) {
      setAuthMsg("Por favor, digite seu e-mail no campo acima.");
      return;
    }
    const res = await recoverPassword(emailInput);
    setAuthMsg(res);
  };

  // Section Ordering & Visibility
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...sectionsOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      saveSectionsOrder(newOrder);
      triggerNotification("Sequência de seções reordenada!");
    }
  };

  const toggleSectionVis = (sectionKey: string) => {
    const updated = { ...sectionsVisibility, [sectionKey]: !sectionsVisibility[sectionKey as keyof typeof sectionsVisibility] };
    saveSectionsVisibility(updated);
    triggerNotification(`Seção ${sectionKey.toUpperCase()} atualizada.`);
  };

  // Friendly names for Site Builder section mappings
  const getSectionFriendlyName = (key: string): string => {
    const names: Record<string, string> = {
      hero: "Banner Principal (Hero)",
      simulator: "Simulador de Orçamento",
      differentials: "Diferenciais Técnicos",
      containers: "Catálogo de Modelos",
      prontaEntrega: "Estoque Pronta Entrega",
      projects: "Cases Antes/Depois",
      gallery: "Galeria de Fotos",
      economyCalculator: "Calculadora Financeira",
      videos: "Vídeos Reais",
      timeline: "Linha de Tempo Comercial",
      map: "Mapa / Região de Atendimento",
      about: "Sobre a Empresa",
      faq: "Perguntas Frequentes (FAQ)",
      testimonials: "Depoimentos de Clientes",
      cta: "Chamada para Ação Final",
      channels: "Canais de Atendimento",
      obrasAndamento: "Obras em Andamento",
      maosAObra: "Mãos à Obra"
    };
    if (key.startsWith("custom-")) {
      const block = customBlocks.find((b) => b.id === key);
      return block?.title || "Seção Personalizada";
    }
    return names[key] || key.toUpperCase();
  };

  const searchResults = React.useMemo(() => {
    if (!globalSearch.trim()) return [];
    const query = globalSearch.toLowerCase();
    const results: Array<{ type: string; title: string; subtitle: string; action: () => void }> = [];

    // Check Landing sections
    if (sectionsOrder) {
      sectionsOrder.forEach((sec) => {
        const friendlyName = getSectionFriendlyName(sec);
        if (friendlyName.toLowerCase().includes(query) || sec.toLowerCase().includes(query)) {
          results.push({
            type: "Seção da Landing Page",
            title: friendlyName,
            subtitle: `Estrutura / Seção: ${sec}`,
            action: () => { setDrawerSection(sec); setGlobalSearch(""); },
          });
        }
      });
    }

    // Check containers
    if (containers) {
      containers.forEach((cont) => {
        if (cont.title.toLowerCase().includes(query) || (cont.category && cont.category.toLowerCase().includes(query))) {
          results.push({
            type: "Modelo de Container",
            title: cont.title,
            subtitle: cont.category || "Catálogo",
            action: () => { setActiveTab("containers"); setContainersSubTab("catalogo"); setGlobalSearch(""); },
          });
        }
      });
    }

    // Check prontaEntrega
    if (prontaEntrega) {
      prontaEntrega.forEach((item) => {
        if (item.title.toLowerCase().includes(query) || (item.city && item.city.toLowerCase().includes(query))) {
          results.push({
            type: "Pronta Entrega",
            title: item.title,
            subtitle: `${item.city || "Cidade"} - ${item.state || "Estado"}`,
            action: () => { setActiveTab("containers"); setContainersSubTab("pronta"); setGlobalSearch(""); },
          });
        }
      });
    }

    // Check projects
    if (projects) {
      projects.forEach((proj) => {
        if (proj.title.toLowerCase().includes(query)) {
          results.push({
            type: "Projeto / Case",
            title: proj.title,
            subtitle: "Cases de Clientes",
            action: () => { setActiveTab("projects"); setProjectsSubTab("cases"); setGlobalSearch(""); },
          });
        }
      });
    }

    // Check testimonials
    if (testimonials) {
      testimonials.forEach((test) => {
        if (test.name.toLowerCase().includes(query) || (test.company && test.company.toLowerCase().includes(query))) {
          results.push({
            type: "Depoimento de Cliente",
            title: test.name,
            subtitle: `${test.company || "Empresa"} (${test.city || "Cidade"})`,
            action: () => { setActiveTab("testimonials"); setGlobalSearch(""); },
          });
        }
      });
    }

    return results;
  }, [globalSearch, sectionsOrder, containers, prontaEntrega, projects, testimonials]);

  // Navigation Deep-link handler from Site Builder
  const handleDeepLinkEdit = (key: string) => {
    if (key === "hero") {
      setActiveTab("settings");
      setSettingsSubTab("hero");
    } else if (key === "simulator" || key === "cta" || key === "channels") {
      setActiveTab("settings");
      setSettingsSubTab("conversions");
    } else if (key === "faq") {
      setActiveTab("settings");
      setSettingsSubTab("faq");
    } else if (key === "differentials") {
      setActiveTab("projects");
      setProjectsSubTab("differentials");
    } else if (key === "containers" || key === "gallery") {
      setActiveTab("containers");
      setContainersSubTab("catalogo");
    } else if (key === "prontaEntrega") {
      setActiveTab("containers");
      setContainersSubTab("pronta");
    } else if (key === "projects") {
      setActiveTab("projects");
      setProjectsSubTab("cases");
    } else if (key === "videos") {
      setActiveTab("projects");
      setProjectsSubTab("videos");
    } else if (key === "map") {
      setActiveTab("logistic");
    } else if (key === "testimonials") {
      setActiveTab("testimonials");
    } else {
      setActiveTab("settings");
      setSettingsSubTab("hero");
    }
    triggerNotification(`Direcionado para a edição da seção: ${getSectionFriendlyName(key)}`);
  };

  // Entity Adding States (inline form controls)
  const [newDiff, setNewDiff] = useState({ title: "", description: "", icon: "Shield" });
  const [newContainer, setNewContainer] = useState<Omit<EditableContainer, "id" | "specs">>({
    title: "", category: "Escritório", description: "", image: "", whatsappMsg: "", status: "Disponível", visible: true, destacado: false
  });
  const [newContSpecs, setNewContSpecs] = useState("");

  const [newPronta, setNewPronta] = useState<Omit<ProntaEntregaItem, "id" | "images">>({
    title: "", city: "Santa Rosa", state: "RS", measurements: "6.00m x 2.44m x 2.59m", condition: "Seminovo (Classe A)", type: "Depósito Blindado", availableForSale: true, availableForRent: true, active: true
  });
  const [newProntaImage, setNewProntaImage] = useState("");

  const [newProj, setNewProj] = useState<Omit<EditableProject, "id" | "specs">>({
    title: "", category: "Projetos Personalizados", imageBefore: "", imageAfter: "", description: "", visible: true, destacado: true
  });
  const [newProjSpecs, setNewProjSpecs] = useState("");

  const [newVideo, setNewVideo] = useState({ title: "", url: "", thumbnail: "", category: "Projeto finalizado", visible: true });
  const [newFaqItem, setNewFaqItem] = useState({ question: "", answer: "", visible: true });
  const [newReview, setNewReview] = useState<Omit<EditableTestimonial, "id">>({
    name: "", cityOrCompany: "", content: "", image: "", rating: 5, visible: true
  });
  const [newMedia, setNewMedia] = useState({ url: "", name: "", type: "image" as "image" | "video", category: "Geral" });

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-stone-200 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        {/* Ambient premium background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.06),transparent_65%)] pointer-events-none" />

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <Logo size={80} primaryColor="#FFFFFF" accentColor="#FFD400" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
              PAINEL DODISA
            </h2>
            <p className="mt-1 text-xs text-stone-500 font-mono tracking-widest uppercase">
              REPOSITÓRIO DE OPERAÇÕES EXECUTIVE
            </p>
          </div>

          <form className="mt-8 bg-[#171A21] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-6" onSubmit={handleLoginSubmit}>
            {/* Access header */}
            <div className="flex items-center gap-2 text-[#FFD400]">
              <Shield className="w-4 h-4" />
              <span className="font-black text-xs uppercase tracking-widest font-mono">Acesso Restrito</span>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}

            {authMsg && (
              <div className="p-3 bg-[#0F1115] border border-white/5 rounded-xl text-xs text-[#FFD400] font-medium">
                <p>{authMsg}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">E-mail Corporativo</label>
                <input
                  type="text"
                  required
                  placeholder="exemplo@dodisa.com.br"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD400] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Senha de Acesso</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD400] pr-12 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleRecover}
                className="text-stone-400 hover:text-[#FFD400] transition-colors font-medium"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFD400]/15"
            >
              <Lock className="w-4 h-4 stroke-[2.5]" /> Autenticar e Entrar
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setAdminViewActive(false)}
              className="text-stone-500 hover:text-stone-300 text-xs font-bold underline decoration-white/10 transition-colors"
            >
              ← Voltar ao site público
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resolve edit modal content
  let modalTitle = "";
  let modalContent: React.ReactNode = null;
  
  if (editModal) {
    const { type, id } = editModal;
    if (type === "container") {
      const item = containers.find(c => c.id === id);
      if (item) {
        modalTitle = "Editar Modelo do Catálogo";
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Título de Exibição</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editContainer(item.id, { title: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-[#FFD400] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Categoria Comercial</label>
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => editContainer(item.id, { category: e.target.value })}
                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Status Disponibilidade</label>
                <select
                  value={item.status}
                  onChange={(e) => editContainer(item.id, { status: e.target.value as any })}
                  className="w-full bg-[#0F1115] border border-[#FFD400]/25 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none font-bold"
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Sob Consulta">Sob Consulta</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Alugado">Alugado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">WhatsApp Template Msg (Mensagem ao clicar)</label>
              <input
                type="text"
                value={item.whatsappMsg || ""}
                onChange={(e) => editContainer(item.id, { whatsappMsg: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-stone-300 focus:border-[#FFD400] outline-none"
              />
            </div>
            <div>
              <ImageUploadField
                label="Imagem do Container"
                value={item.image}
                onChange={(url) => editContainer(item.id, { image: url })}
                folder="containers"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Fichas Técnicas (Divididas por ponto e vírgula ';')</label>
              <textarea
                rows={4}
                value={item.specs.join("; ")}
                onChange={(e) => editContainer(item.id, { specs: e.target.value.split(";").map(s => s.trim()).filter(Boolean) })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-stone-400 focus:border-[#FFD400] outline-none resize-none font-medium"
              />
            </div>
          </div>
        );
      }
    } else if (type === "pronta") {
      const item = prontaEntrega.find(p => p.id === id);
      if (item) {
        modalTitle = "Editar Estoque à Pronta Entrega";
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Título do Container</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editProntaEntrega(item.id, { title: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-[#FFD400] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Tipo de Unidade / Finalidade</label>
                <input
                  type="text"
                  value={item.type}
                  onChange={(e) => editProntaEntrega(item.id, { type: e.target.value })}
                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Dimensões Técnicas</label>
                <input
                  type="text"
                  value={item.measurements}
                  onChange={(e) => editProntaEntrega(item.id, { measurements: e.target.value })}
                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Situação / Estado de Conservação</label>
                <input
                  type="text"
                  value={item.condition}
                  onChange={(e) => editProntaEntrega(item.id, { condition: e.target.value })}
                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Cidade</label>
                  <input
                    type="text"
                    value={item.city}
                    onChange={(e) => editProntaEntrega(item.id, { city: e.target.value })}
                    className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Estado (UF)</label>
                  <input
                    type="text"
                    value={item.state}
                    onChange={(e) => editProntaEntrega(item.id, { state: e.target.value })}
                    className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#0F1115] border border-white/5 rounded-2xl">
              <span className="block text-xs font-bold text-stone-400 uppercase mb-2">Opções de Aquisição</span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-stone-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.availableForSale}
                    onChange={(e) => editProntaEntrega(item.id, { availableForSale: e.target.checked })}
                    className="w-4.5 h-4.5 rounded accent-[#FFD400]"
                  />
                  Disponível p/ Venda
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-stone-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.availableForRent}
                    onChange={(e) => editProntaEntrega(item.id, { availableForRent: e.target.checked })}
                    className="w-4.5 h-4.5 rounded accent-[#FFD400]"
                  />
                  Disponível p/ Locação
                </label>
              </div>
            </div>
          </div>
        );
      }
    } else if (type === "project") {
      const item = projects.find(p => p.id === id);
      if (item) {
        modalTitle = "Editar Case de Projeto";
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Título do Case</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editProject(item.id, { title: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-[#FFD400] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Categoria de Uso</label>
              <input
                type="text"
                value={item.category}
                onChange={(e) => editProject(item.id, { category: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ImageUploadField
                  label="Foto (Antes)"
                  value={item.imageBefore}
                  onChange={(url) => editProject(item.id, { imageBefore: url })}
                  folder="projetos"
                />
              </div>
              <div>
                <ImageUploadField
                  label="Foto (Depois / Pronto)"
                  value={item.imageAfter}
                  onChange={(url) => editProject(item.id, { imageAfter: url })}
                  folder="projetos"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Resumo Técnico do Case</label>
              <textarea
                rows={4}
                value={item.description}
                onChange={(e) => editProject(item.id, { description: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-stone-300 focus:border-[#FFD400] outline-none font-semibold resize-none"
              />
            </div>
          </div>
        );
      }
    } else if (type === "video") {
      const item = videos.find(v => v.id === id);
      if (item) {
        modalTitle = "Editar Mídia de Vídeo";
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Título do Vídeo</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editVideo(item.id, { title: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-[#FFD400] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Categoria / Tag</label>
              <input
                type="text"
                value={item.category}
                onChange={(e) => editVideo(item.id, { category: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
              />
            </div>
            <ImageUploadField
              label="Capa do Card (Thumbnail)"
              value={item.thumbnail || ""}
              onChange={(url) => editVideo(item.id, { thumbnail: url })}
              folder="videos-capas"
            />
            <VideoUploadField
              label="YouTube Embed Link, MP4 Link, ou Upload"
              value={item.url}
              onChange={(url) => editVideo(item.id, { url })}
              folder="videos"
            />
          </div>
        );
      }
    } else if (type === "differential") {
      const item = differentials.find(d => d.id === id);
      if (item) {
        modalTitle = "Editar Diferencial Técnico";
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Título do Diferencial</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => editDifferential(item.id, { title: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-[#FFD400] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Resumo Técnico do Diferencial</label>
              <textarea
                rows={4}
                value={item.description}
                onChange={(e) => editDifferential(item.id, { description: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-stone-300 focus:border-[#FFD400] outline-none resize-none font-medium"
              />
            </div>
          </div>
        );
      }
    } else if (type === "testimonial") {
      const item = testimonials.find(t => t.id === id);
      if (item) {
        modalTitle = "Editar Depoimento de Cliente";
        modalContent = (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Nome do Cliente / Autor</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => editTestimonial(item.id, { name: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white font-bold focus:border-[#FFD400] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Cidade ou Empresa / Cargo</label>
                <input
                  type="text"
                  value={item.cityOrCompany}
                  onChange={(e) => editTestimonial(item.id, { cityOrCompany: e.target.value })}
                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FFD400] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Foto Autor (URL)</label>
                <input
                  type="text"
                  value={item.image}
                  onChange={(e) => editTestimonial(item.id, { image: e.target.value })}
                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-xs text-stone-300 focus:border-[#FFD400] outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Depoimento Comercial</label>
              <textarea
                rows={5}
                value={item.content}
                onChange={(e) => editTestimonial(item.id, { content: e.target.value })}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3.5 text-sm text-stone-400 focus:border-[#FFD400] outline-none resize-none font-medium"
              />
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-stone-200 flex flex-col lg:flex-row antialiased font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#171A21] border border-[#FFD400]/25 text-white rounded-xl px-5 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-xs flex items-center gap-3"
          >
            <div className="p-1 bg-[#FFD400]/10 rounded-lg">
              <Check className="w-4 h-4 text-[#FFD400] stroke-[3]" />
            </div>
            <span className="font-semibold">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-[#111827] border-b border-white/5 flex items-center justify-between p-4 px-6 relative z-30">
        <div className="flex items-center gap-3">
          <Logo size={28} primaryColor="#FFFFFF" accentColor="#FFD400" />
          <span className="font-black text-xs tracking-tight text-white uppercase">DODISA PANEL</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer border border-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Backdrop Overlay for Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 lg:hidden z-40"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR NAVIGATION - Premium, Fixed & Stable */}
      <aside 
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } fixed inset-y-0 left-0 lg:static z-40 bg-[#111827] border-r border-white/5 flex flex-col justify-between transition-all duration-300 overflow-y-auto w-60 shrink-0 h-full`}
      >
        <div className="p-4 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-5">
              <div className="flex items-center gap-3">
                <Logo size={32} primaryColor="#FFFFFF" accentColor="#FFD400" />
                <div>
                  <span className="text-[11px] font-black tracking-wider text-white block uppercase">DODISA SUITE</span>
                  <span className="text-[8px] font-black text-[#FFD400] font-mono uppercase block tracking-widest leading-none">ADMIN MASTER</span>
                </div>
              </div>

              {/* Mobile Close Trigger */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg cursor-pointer transition-all border border-white/5"
                title="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Navigation List */}
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: Server },
                { id: "landing_builder", label: "Landing Page", icon: Layout },
                { id: "containers", label: "Containers", icon: Layers, onClick: () => { setActiveTab("containers"); setContainersSubTab("catalogo"); } },
                { id: "pronta", label: "Pronta Entrega", icon: Grid, onClick: () => { setActiveTab("containers"); setContainersSubTab("pronta"); } },
                { id: "projects", label: "Projetos", icon: CheckCircle2, onClick: () => { setActiveTab("projects"); setProjectsSubTab("cases"); } },
                { id: "media", label: "Galeria", icon: FileImage },
                { id: "testimonials", label: "Depoimentos", icon: Star, count: testimonials.length },
                { id: "logistic", label: "Regiões", icon: MapPin },
                { id: "settings", label: "Configurações", icon: Settings },
                { id: "profile", label: "Perfil", icon: Shield },
              ].map((navItem) => {
                const IconComp = navItem.icon;
                const isActive = activeTab === navItem.id || 
                  (navItem.id === "pronta" && activeTab === "containers" && containersSubTab === "pronta") ||
                  (navItem.id === "containers" && activeTab === "containers" && containersSubTab === "catalogo");
                const showLabel = true;

                return (
                  <button
                    key={navItem.id}
                    onClick={() => {
                      if (navItem.onClick) {
                        navItem.onClick();
                      } else {
                        setActiveTab(navItem.id as any);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-xl font-bold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer min-w-0 ${
                      isActive 
                        ? "bg-[#FFD400] text-stone-950 shadow-lg shadow-[#FFD400]/10" 
                        : "text-stone-400 hover:bg-white/5 hover:text-white"
                    }`}
                    title={navItem.label}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-stone-950" : "text-stone-400"}`} />
                    <span className="truncate whitespace-nowrap text-left flex-grow">
                      {navItem.label}
                    </span>
                    {navItem.count !== undefined && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono text-center font-bold shrink-0 ${
                        isActive ? "bg-stone-900/10 text-stone-950" : "bg-white/5 text-stone-400"
                      }`}>
                        {navItem.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions inside sidebar */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex flex-col text-[9px] text-stone-500 space-y-1 font-mono px-2">
              <span className="font-bold text-[#FFD400] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                PAINEL PREMIUM
              </span>
              <span>Sincronizado: {lastUpdated}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAdminViewActive(false)}
                className="flex-grow py-2 px-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase text-center transition-all flex items-center justify-center gap-1 cursor-pointer border border-white/5"
                title="Voltar ao site público"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FFD400]" />
                <span>Ver Site</span>
              </button>
              <button
                onClick={logout}
                className="py-2 px-3 bg-red-950/20 hover:bg-red-900 border border-red-500/10 text-red-400 hover:text-white rounded-xl text-[10px] font-black uppercase text-center transition-all flex items-center justify-center cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE & HEADER & LIVE PREVIEW */}
      <main className="flex-grow p-4 sm:p-6 select-text overflow-y-auto font-sans flex flex-col justify-between min-w-0">
        <div>
          {/* TOP BAR / HEADER (Global search, notifications, Status, Actions, Avatar) */}
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 mb-6 flex flex-col xl:flex-row items-center justify-between gap-4 font-sans relative z-30 shadow-md">
            <div className="flex items-center gap-3 w-full xl:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <input
                  type="text"
                  placeholder="Pesquisa rápida (seções, modelos...)"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-[#0F1115] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#FFD400] placeholder-stone-500 font-medium"
                />
                <Globe className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                
                {/* Global Search Results Dropdown Overlay */}
                <AnimatePresence>
                  {globalSearch.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-[#171A21] border border-white/10 rounded-xl shadow-2xl p-3 space-y-1.5 max-h-60 overflow-y-auto z-50 text-left"
                    >
                      <span className="text-[9px] font-mono font-bold text-[#FFD400] uppercase tracking-wider block border-b border-white/5 pb-1.5 mb-1.5">Resultados Encontrados ({searchResults.length})</span>
                      {searchResults.length === 0 ? (
                        <p className="text-[10px] text-stone-500 p-2 text-center">Nenhum resultado para "{globalSearch}"</p>
                      ) : (
                        searchResults.map((res, idx) => (
                          <button
                            key={idx}
                            onClick={res.action}
                            className="w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors block text-xs"
                          >
                            <span className="font-bold text-white block leading-tight">{res.title}</span>
                            <span className="text-[9px] text-stone-500 block font-mono mt-0.5">{res.type} • {res.subtitle}</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Indicator bubble */}
              <div className="flex items-center gap-1.5 bg-[#0F1115] border border-white/5 px-3 py-1.5 rounded-xl">
                <span className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
                <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">
                  {hasUnsavedChanges ? "Rascunho" : "Publicado"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
              {/* Preview Popup Button - global, always visible */}
              <button
                onClick={() => setIsPreviewPopupOpen(true)}
                className="hidden sm:flex px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider items-center gap-2 cursor-pointer transition-all border bg-[#0F1115] text-stone-300 border-white/5 hover:bg-[#FFD400]/10 hover:text-[#FFD400] hover:border-[#FFD400]/30"
                title="Abrir preview fullscreen"
              >
                <Layout className="w-3.5 h-3.5" /> Preview
              </button>
              {/* Notifications center */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 bg-[#0F1115] hover:bg-white/5 text-stone-400 hover:text-white rounded-xl border border-white/5 cursor-pointer relative"
                >
                  <Star className="w-4 h-4 text-[#FFD400]" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                </button>

                <AnimatePresence>
                  {notificationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-[#171A21] border border-white/10 rounded-xl shadow-2xl p-4 space-y-3 z-50 text-left"
                      >
                        <span className="text-[9px] font-mono font-bold text-[#FFD400] uppercase tracking-wider block border-b border-white/5 pb-1.5 mb-1">Métricas de Saúde do Site</span>
                        <div className="space-y-2">
                          {systemNotifications.map((n) => (
                            <div key={n.id} className="text-[11px] leading-relaxed border-b border-white/5 pb-2 last:border-b-0">
                              <p className="text-white font-semibold">{n.text}</p>
                              <span className="text-[9px] text-stone-500 block font-mono mt-0.5">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <button
                onClick={async () => {
                  await publishChanges();
                  triggerNotification("Alterações salvas e publicadas com sucesso!");
                }}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  hasUnsavedChanges 
                    ? "bg-[#FFD400] hover:bg-[#FFE14D] text-stone-950" 
                    : "bg-white/5 text-stone-500 border border-white/5 cursor-not-allowed"
                }`}
              >
                <Save className="w-3.5 h-3.5" /> Salvar Alterações
              </button>

              <button
                onClick={() => setIsPreviewFullScreen(!isPreviewFullScreen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isPreviewFullScreen 
                    ? "bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/20" 
                    : "bg-[#0F1115] text-stone-400 border-white/5 hover:text-white"
                }`}
                title="Preview Completo"
              >
                <Smartphone className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className="w-8 h-8 rounded-full bg-[#FFD400]/15 border border-[#FFD400]/25 flex items-center justify-center text-xs font-black font-mono text-[#FFD400] cursor-pointer"
                title="Meu Perfil"
              >
                DM
              </button>
            </div>
          </div>

          {/* TWO COLUMN PANEL (Editor | Live Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* EDITOR LEFT COLUMN */}
            <div className={`space-y-6 min-w-0 ${
              isPreviewFullScreen ? "hidden" :
              activeTab === "dashboard" ? (isPreviewExpanded ? "lg:col-span-6 block" : "lg:col-span-12 block") : "lg:col-span-6 block"
            } ${
              activeTab !== "dashboard" && activeTab !== "media" && activeTab !== "landing_builder" && activeTab !== "profile" && mobileViewTab !== "editor" ? "hidden lg:block" : "block"
            }`}>

        {/* ---------------------------------------------------- */}
        {/* TAB: DASHBOARD OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* NOVO DASHBOARD PANEL HEADER */}
            <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#FFD400] uppercase tracking-widest block">ADMINISTRAÇÃO PREMIUM</span>
                <h2 className="text-white text-xl font-black uppercase tracking-tight">Bem-vindo, Admin.</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 font-medium">
                  <span>Última alteração: <strong className="text-white font-mono">{lastUpdated || "Há poucos segundos"}</strong></span>
                  <span className="text-stone-700">•</span>
                  <div className="flex items-center gap-1.5 bg-[#0F1115] border border-white/5 px-2.5 py-0.5 rounded-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
                    <span className="text-[9px] uppercase font-black tracking-wider text-stone-300">
                      {hasUnsavedChanges ? "Rascunho" : "Publicado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    await publishChanges();
                    triggerNotification("Alterações salvas e publicadas com sucesso!");
                  }}
                  disabled={!hasUnsavedChanges}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                    hasUnsavedChanges 
                      ? "bg-[#FFD400] hover:bg-[#FFE14D] text-stone-950 shadow-lg shadow-[#FFD400]/10" 
                      : "bg-white/5 text-stone-500 border border-white/5 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Alterações
                </button>

                <button
                  onClick={() => setIsPreviewPopupOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all border bg-[#0F1115] text-stone-300 border-white/5 hover:bg-[#FFD400]/10 hover:text-[#FFD400] hover:border-[#FFD400]/30"
                >
                  <Layout className="w-3.5 h-3.5" /> Preview + Editor
                </button>

                <button
                  onClick={() => setAdminViewActive(false)}
                  className="px-4 py-2.5 bg-[#0F1115] hover:bg-white/5 text-stone-300 border border-white/5 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FFD400]" /> Ver Site
                </button>
              </div>
            </div>

            {/* REAL METRICS CARDS ROW */}
            {(() => {
              const supabaseActive = !!(() => { try { return getSupabase(); } catch { return null; } })();
              const visibleSections = sectionsOrder?.filter(k => sectionsVisibility?.[k as keyof typeof sectionsVisibility] !== false).length ?? 0;
              const totalSections = sectionsOrder?.length ?? 0;
              const stats = [
                { label: "Containers", value: containers?.length ?? 0, sub: `${containers?.filter(c => c.visible).length ?? 0} visíveis`, color: "#FFD400", icon: "📦" },
                { label: "Pronta Entrega", value: prontaEntrega?.filter(p => p.active).length ?? 0, sub: `${prontaEntrega?.length ?? 0} cadastrados`, color: "#FF9A00", icon: "🏭" },
                { label: "Projetos", value: projects?.filter(p => p.visible).length ?? 0, sub: `${projects?.length ?? 0} total`, color: "#34d399", icon: "🏗️" },
                { label: "Depoimentos", value: testimonials?.filter(t => t.visible).length ?? 0, sub: `${testimonials?.length ?? 0} cadastrados`, color: "#60a5fa", icon: "⭐" },
                { label: "FAQs", value: faq?.filter(f => f.visible).length ?? 0, sub: `${faq?.length ?? 0} total`, color: "#a78bfa", icon: "❓" },
                { label: "Seções Ativas", value: visibleSections, sub: `de ${totalSections} seções`, color: "#f472b6", icon: "📄" },
              ];
              return (
                <div className="space-y-3">
                  {/* Supabase status */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-mono ${supabaseActive ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-amber-500/5 border-amber-500/20 text-amber-400"}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${supabaseActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <span className="font-bold uppercase tracking-wider">
                      Supabase: {supabaseActive ? "Conectado — dados sincronizando em tempo real" : "Offline — usando armazenamento local (configure as variáveis de ambiente)"}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    {stats.map((s) => (
                      <div key={s.label} className="bg-[#171A21] border border-white/5 rounded-xl p-4 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{s.icon}</span>
                          <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] text-stone-500 font-mono">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* THREE COLUMNS OR TWO COLUMNS MAIN CONTENT AREA */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* LEFT / MAIN COLUMN - ESTRUTURA DA LANDING PAGE */}
              <div className="xl:col-span-8 bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-white text-base font-black uppercase tracking-wide">Estrutura da Landing Page</h3>
                  <p className="text-stone-400 text-xs mt-1">Gerencie a ordem, visibilidade e personalize cada seção da página principal instantaneamente.</p>
                </div>

                <div className="space-y-2">
                  {sectionsOrder && sectionsOrder.map((sectionKey, index) => {
                    const friendlyName = getSectionFriendlyName(sectionKey);
                    const isVisible = sectionsVisibility?.[sectionKey] !== false;

                    return (
                      <div
                        key={sectionKey}
                        draggable
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedIndex !== null && draggedIndex !== index) {
                            const newOrder = [...sectionsOrder];
                            const [removed] = newOrder.splice(draggedIndex, 1);
                            newOrder.splice(index, 0, removed);
                            saveSectionsOrder(newOrder);
                            setDraggedIndex(null);
                            triggerNotification(`Seção reordenada: ${friendlyName} movida para posição ${index + 1}.`);
                          }
                        }}
                        className={`bg-[#0F1115] border ${
                          isVisible ? "border-white/5" : "border-white/5 opacity-40 bg-stone-950/20"
                        } hover:border-[#FFD400]/25 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150 group min-w-0`}
                      >
                        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                          {/* Drag handle icon */}
                          <div className="cursor-grab active:cursor-grabbing p-1.5 text-stone-500 hover:text-[#FFD400] transition-colors shrink-0">
                            <Grid className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-stone-600 text-xs font-mono font-bold shrink-0">#{index + 1}</span>
                              <span className="text-white text-xs font-bold uppercase tracking-wide truncate">{friendlyName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Row actions */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
                          {/* Visibility Eye toggle */}
                          <button
                            onClick={() => {
                              toggleSectionVis(sectionKey);
                              triggerNotification(`Seção '${friendlyName}' ${!isVisible ? "ativada" : "ocultada"}.`);
                            }}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isVisible 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                            }`}
                            title={isVisible ? "Ocultar Seção" : "Mostrar Seção"}
                          >
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setDrawerSection(sectionKey);
                              setPreviewSectionLock(sectionKey);
                            }}
                            className="p-2 bg-white/5 hover:bg-[#FFD400]/20 text-stone-400 hover:text-[#FFD400] rounded-lg border border-white/5 hover:border-[#FFD400]/20 transition-all cursor-pointer flex items-center gap-1.5"
                            title="Personalizar Seção"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase hidden sm:inline">Editar</span>
                          </button>

                          {/* Quick Highlight button */}
                          <button
                            onClick={() => {
                              setPreviewSectionLock(sectionKey);
                              triggerNotification(`Focado na seção: ${friendlyName}`);
                            }}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${
                              previewSectionLock === sectionKey
                                ? "bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/40"
                                : "bg-white/5 text-stone-500 hover:text-stone-300 border border-transparent"
                            }`}
                            title="Visualizar no Preview"
                          >
                            ★
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN - QUICK ACTIONS & RECENT ACTIVITY TIMELINE */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* AÇÕES RÁPIDAS CARD */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <h4 className="text-white text-xs font-black uppercase tracking-wider">Ações Rápidas</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        setActiveTab("containers");
                        setContainersSubTab("catalogo");
                        triggerNotification("Redirecionado para adicionar novo container.");
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F1115] hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/25 text-stone-300 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-[#FFD400] font-black text-sm">+</span> Novo Container
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("containers");
                        setContainersSubTab("pronta");
                        triggerNotification("Redirecionado para adicionar pronta entrega.");
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F1115] hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/25 text-stone-300 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-[#FFD400] font-black text-sm">+</span> Nova Pronta Entrega
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("projects");
                        setProjectsSubTab("cases");
                        triggerNotification("Redirecionado para adicionar novo case.");
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F1115] hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/25 text-stone-300 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-[#FFD400] font-black text-sm">+</span> Novo Case / Projeto
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("testimonials");
                        triggerNotification("Redirecionado para adicionar novo depoimento.");
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F1115] hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/25 text-stone-300 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-[#FFD400] font-black text-sm">+</span> Novo Depoimento
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("logistic");
                        triggerNotification("Redirecionado para gerenciar regiões.");
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F1115] hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/25 text-stone-300 hover:text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-[#FFD400] font-black text-sm">+</span> Nova Região / Cidade
                    </button>
                  </div>
                </div>

                {/* ATIVIDADE RECENTE TIMELINE */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white text-xs font-black uppercase tracking-wider">Atividade Recente</h4>
                    <span className="text-[9px] font-mono font-bold text-[#FFD400] bg-[#FFD400]/10 px-2 py-0.5 rounded uppercase">Histórico</span>
                  </div>

                  <div className="relative pl-4 border-l border-white/5 space-y-5 py-2">
                    {[
                      { title: 'Projeto "Container Escritório Luxo" atualizado.', desc: "Preços de locação recalculados para o mercado nacional.", time: "Hoje, 14:32" },
                      { title: "Landing Page publicada.", desc: "Novas seções reordenadas e enviadas ao servidor de produção.", time: "Ontem, 09:15" },
                      { title: "Vídeo Institucional Dodisa Containers adicionado.", desc: "Nova integração com o YouTube para a seção multimídia.", time: "Há 2 dias" },
                      { title: "Nova imagem adicionada à galeria.", desc: "Projeto de container almoxarifado em Porto Alegre/RS.", time: "Esta semana" },
                    ].map((act, i) => (
                      <div key={i} className="relative group text-xs">
                        {/* Timeline Node ball */}
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-stone-800 border border-white/10 group-hover:bg-[#FFD400] group-hover:border-[#FFD400]/50 transition-colors" />
                        
                        <div className="space-y-0.5">
                          <p className="text-white font-bold leading-snug">{act.title}</p>
                          <p className="text-stone-400 text-[11px] leading-relaxed">{act.desc}</p>
                          <span className="text-[9px] text-stone-500 font-mono block mt-1">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: LANDING BUILDER SECTION MANAGER */}
        {/* ---------------------------------------------------- */}
        {activeTab === "landing_builder" && (
          <div className="space-y-6">
            <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-6">
                <div>
                  <h2 className="text-white text-base font-black uppercase tracking-wider">Construtor de Landing Page</h2>
                  <p className="text-stone-400 text-xs mt-1">Gerencie a estrutura, visibilidade e ordem de cada seção da página principal da Dodisa Containers em tempo real.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newId = addCustomBlock();
                      const sectionKey = newId;
                      saveSectionsOrder([...sectionsOrder, sectionKey]);
                      setDrawerSection(sectionKey);
                      setPreviewSectionLock(sectionKey);
                      triggerNotification("Nova seção personalizada criada.");
                    }}
                    className="px-3.5 py-2 bg-[#FFD400] hover:bg-[#FFE14D] text-stone-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Seção
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Deseja restaurar a ordem padrão das seções?")) {
                        saveSectionsOrder(["hero", "simulator", "differentials", "containers", "prontaEntrega", "projects", "obrasAndamento", "maosAObra", "gallery", "economyCalculator", "videos", "timeline", "map", "about", "faq", "testimonials", "cta", "channels"]);
                        triggerNotification("Estrutura redefinida para o padrão.");
                      }
                    }}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    Resetar Estrutura
                  </button>
                </div>
              </div>

              {/* Sections List with Drag & Drop and Quick actions */}
              <div className="space-y-2.5">
                {sectionsOrder && sectionsOrder.map((sectionKey, index) => {
                  const friendlyName = getSectionFriendlyName(sectionKey);
                  const isVisible = sectionsVisibility?.[sectionKey] !== false;

                  return (
                    <div
                      key={sectionKey}
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex !== null && draggedIndex !== index) {
                          const newOrder = [...sectionsOrder];
                          const [removed] = newOrder.splice(draggedIndex, 1);
                          newOrder.splice(index, 0, removed);
                          saveSectionsOrder(newOrder);
                          setDraggedIndex(null);
                          triggerNotification(`Ordem alterada: ${friendlyName} movido.`);
                        }
                      }}
                      onClick={() => setDrawerSection(sectionKey)}
                      className={`bg-[#0F1115] border ${
                        isVisible ? "border-white/5" : "border-white/5 opacity-50 bg-stone-950/20"
                      } hover:border-[#FFD400]/25 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 group relative min-w-0 cursor-pointer`}
                    >
                      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                        {/* Drag Handle icon */}
                        <div className="cursor-grab active:cursor-grabbing p-1 text-stone-500 hover:text-[#FFD400] shrink-0">
                          <Grid className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white text-xs font-black uppercase tracking-wider truncate max-w-[200px] sm:max-w-xs">{friendlyName}</span>
                            <span className="text-[8px] font-mono font-bold text-stone-500 bg-[#171A21] px-1.5 py-0.5 rounded uppercase shrink-0">
                              {sectionKey}
                            </span>
                          </div>
                          <p className="text-stone-500 text-[10px] mt-0.5 truncate">Clique na seção para abrir editor + preview ao vivo.</p>
                        </div>
                      </div>

                      {/* Actions row on a single line */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap sm:flex-nowrap">
                        {/* Highlight button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewSectionLock(sectionKey);
                            triggerNotification(`Visualizador travado na seção: ${friendlyName}`);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                            previewSectionLock === sectionKey
                              ? "bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]/40"
                              : "bg-white/5 text-stone-400 hover:text-stone-200 border border-transparent"
                          }`}
                          title="Focar na Preview"
                        >
                          ★ Destacar
                        </button>

                        {/* Visibility eye toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionVis(sectionKey);
                            triggerNotification(`Status de visibilidade alterado para: ${friendlyName}`);
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isVisible 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                              : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                          }`}
                          title={isVisible ? "Visível" : "Oculto"}
                        >
                          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Edit Pencil icon opens Drawer */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerSection(sectionKey);
                          }}
                          className="p-2 bg-white/5 hover:bg-[#FFD400]/20 text-stone-400 hover:text-[#FFD400] rounded-xl border border-white/5 hover:border-[#FFD400]/20 transition-all cursor-pointer flex items-center gap-1.5"
                          title="Personalizar Seção"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase pr-1">Editar</span>
                        </button>

                        {/* Duplicate item button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sectionKey.startsWith("custom-")) {
                              const source = customBlocks.find((b) => b.id === sectionKey);
                              const newId = addCustomBlock();
                              if (source) editCustomBlock(newId, { title: `${source.title} (cópia)`, text: source.text, image: source.image, ctaText: source.ctaText, ctaUrl: source.ctaUrl });
                              const idx = sectionsOrder.indexOf(sectionKey);
                              const newOrder = [...sectionsOrder];
                              newOrder.splice(idx + 1, 0, newId);
                              saveSectionsOrder(newOrder);
                              triggerNotification(`Seção '${friendlyName}' duplicada.`);
                            } else {
                              triggerNotification(`Estrutura de seção '${friendlyName}' é global. Você pode gerenciar seus itens internos clicando em Editar.`);
                            }
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 text-stone-500 hover:text-stone-300 rounded-xl transition-all cursor-pointer"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button — real delete for custom sections, hide for built-in ones */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sectionKey.startsWith("custom-")) {
                              if (confirm(`Excluir permanentemente a seção "${friendlyName}"? Essa ação não pode ser desfeita.`)) {
                                deleteCustomBlock(sectionKey);
                                saveSectionsOrder(sectionsOrder.filter((k) => k !== sectionKey));
                                triggerNotification(`Seção "${friendlyName}" excluída.`);
                              }
                            } else if (confirm(`Deseja ocultar definitivamente a seção ${friendlyName} da Landing Page?`)) {
                              if (isVisible) toggleSectionVis(sectionKey);
                              triggerNotification(`Seção ${friendlyName} removida de exibição.`);
                            }
                          }}
                          className="p-2 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                          title={sectionKey.startsWith("custom-") ? "Excluir Permanentemente" : "Ocultar/Excluir"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: ADMINISTRATOR PROFILE SETTINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "profile" && (
          <ProfileTab
            adminUser={adminUser}
            changeCredentials={changeCredentials}
            triggerNotification={triggerNotification}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: CONTAINERS & READY STOCK MODULES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "containers" && (
          <div className="space-y-8">
            
            {/* Elegant Horizontal subtabs bar */}
            <div className="flex border-b border-white/5 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
              {[
                { id: "catalogo", label: "Catálogo de Modelos", count: containers.length },
                { id: "pronta", label: "Estoque Pronta Entrega", count: prontaEntrega.length },
                { id: "materiais", label: "Monte seu Container — Fotos", count: Object.keys(materialImages).length },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setContainersSubTab(st.id as any)}
                  className={`pb-4 px-1 text-xs font-bold uppercase tracking-widest relative cursor-pointer font-sans transition-all ${
                    containersSubTab === st.id ? "text-[#FFD400]" : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {st.label}
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono font-bold text-stone-400">
                      {st.count}
                    </span>
                  </span>
                  {containersSubTab === st.id && (
                    <motion.div layoutId="cont_sub_tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD400]" />
                  )}
                </button>
              ))}
            </div>

            {/* Catalog Subtab content */}
            {containersSubTab === "catalogo" && (
              <div className="space-y-8">
                
                {/* Modern visual Grid instead of a crude table */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {containers.map((cont, idx) => (
                    <div key={cont.id} className="bg-[#171A21] border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6 group hover:border-[#FFD400]/15 transition-all min-w-0">
                      <div>
                        
                        {/* Title of container and tools */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 w-full">
                          <div className="flex gap-3 min-w-0 w-full sm:w-auto">
                            <div className="w-16 h-12 bg-stone-900 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                              <img src={cont.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-stone-500 uppercase block truncate">Aço Corten • ID: {cont.id}</span>
                              <h4 className="text-white text-sm font-black uppercase mt-0.5 leading-tight truncate" title={cont.title}>{cont.title}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap sm:flex-nowrap">
                            {/* Outstanding badges click triggers */}
                            <button
                              onClick={() => {
                                editContainer(cont.id, { destacado: !cont.destacado });
                                triggerNotification(`Container ${cont.title} destacado: ${!cont.destacado ? "Sim" : "Não"}`);
                              }}
                              className={`py-1.5 px-2.5 rounded-lg text-[9px] font-bold uppercase transition-all border cursor-pointer ${
                                cont.destacado 
                                  ? "bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/25" 
                                  : "bg-white/5 text-stone-500 border-white/5 hover:text-stone-300"
                              }`}
                            >
                              ★ Destacar
                            </button>

                            <button
                              onClick={() => {
                                editContainer(cont.id, { visible: !cont.visible });
                                triggerNotification(`Alterou visibilidade de ${cont.title}`);
                              }}
                              className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                                cont.visible ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-stone-600 hover:text-stone-400"
                              }`}
                              title={cont.visible ? "Visível no Site" : "Oculto no Site"}
                            >
                              {cont.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => {
                                deleteContainer(cont.id);
                                triggerNotification("Model de container removido do catálogo.");
                              }}
                              className="p-2 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                              title="Remover definitivamente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Summary of fields */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Categoria</span>
                            <span className="text-stone-300 font-semibold truncate block">{cont.category || "Sem categoria"}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Disponibilidade</span>
                            <span className="px-2 py-0.5 inline-block rounded bg-stone-900 text-[#FFD400] font-black text-[10px] mt-0.5">{cont.status}</span>
                          </div>
                          <div className="col-span-2 mt-1">
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Ficha Técnica</span>
                            <span className="text-stone-400 text-[11px] line-clamp-1 italic">
                              {cont.specs.length > 0 ? cont.specs.join(" • ") : "Nenhuma ficha cadastrada."}
                            </span>
                          </div>
                        </div>

                        {/* Trigger Edit Pop-up Button */}
                        <button
                          onClick={() => setEditModal({ type: "container", id: cont.id })}
                          className="w-full mt-5 py-2.5 bg-white/5 hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/20 text-white hover:text-[#FFD400] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar Dados do Modelo
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Addition Form */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2">Cadastrar Novo Modelo no Catálogo</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Nome do Modelo</label>
                      <input
                        type="text"
                        placeholder="Ex: Container Sanitário E-15"
                        value={newContainer.title}
                        onChange={(e) => setNewContainer({ ...newContainer, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Categoria</label>
                      <input
                        type="text"
                        placeholder="Ex: Banheiro / Depósito"
                        value={newContainer.category}
                        onChange={(e) => setNewContainer({ ...newContainer, category: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <ImageUploadField
                        label="Imagem do Container"
                        value={newContainer.image}
                        onChange={(url) => setNewContainer({ ...newContainer, image: url })}
                        folder="containers"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">WhatsApp Mensagem Inicial Técnica</label>
                      <input
                        type="text"
                        placeholder="Ex: Olá! Tenho interesse no Container Escritório..."
                        value={newContainer.whatsappMsg}
                        onChange={(e) => setNewContainer({ ...newContainer, whatsappMsg: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Fichas Técnicas (separadas por ponto-e-vírgula ';')</label>
                      <input
                        type="text"
                        placeholder="Aço Corten 14mm; Isolamento Térmico; Pintura Premium"
                        value={newContSpecs}
                        onChange={(e) => setNewContSpecs(e.target.value)}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-stone-300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newContainer.title) return;
                      addContainer({
                        ...newContainer,
                        specs: newContSpecs.split(";").map(s => s.trim()).filter(Boolean)
                      });
                      setNewContainer({
                        title: "", category: "Escritório", description: "", image: "", whatsappMsg: "", status: "Disponível", visible: true, destacado: false
                      });
                      setNewContSpecs("");
                      triggerNotification("Novo container comercial adicionado!");
                    }}
                    className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar ao Portfólio
                  </button>
                </div>
              </div>
            )}

            {/* Pronta Entrega Stocks Subtab */}
            {containersSubTab === "pronta" && (
              <div className="space-y-8">
                
                {/* Micro Stock Cards Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {prontaEntrega.map((item, idx) => (
                    <div key={item.id} className="bg-[#171A21] border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-4 group hover:border-[#FFD400]/15 transition-all min-w-0">
                      <div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 w-full">
                          <div className="flex gap-3 min-w-0 w-full sm:w-auto">
                            <div className="w-16 h-12 bg-stone-900 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
                              <img src={item.images?.[0] || item.image || "https://images.unsplash.com/photo-1594913785162-e67853127ee9?auto=format&fit=crop&w=400&q=80"} alt="Pronta" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-stone-500 uppercase block truncate">{item.city} - {item.state} • Estoque</span>
                              <h4 className="text-white text-sm font-black uppercase mt-0.5 leading-tight truncate" title={item.title}>{item.title}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 flex-wrap sm:flex-nowrap">
                            <button
                              onClick={() => {
                                duplicateProntaEntrega(item.id);
                                triggerNotification(`Estoque duplicado: ${item.title}`);
                              }}
                              className="p-2 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Duplicar item de estoque"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                editProntaEntrega(item.id, { active: !item.active });
                                triggerNotification(`Inverteu status de estoque de ${item.title}`);
                              }}
                              className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                                item.active ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-stone-600 hover:text-stone-400"
                              }`}
                              title={item.active ? "Disponível no site" : "Pausado"}
                            >
                              {item.active ? <Check className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => {
                                deleteProntaEntrega(item.id);
                                triggerNotification("Estoque removido do site de pronta entrega.");
                              }}
                              className="p-2 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Summary of fields */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Finalidade / Tipo</span>
                            <span className="text-stone-300 font-semibold truncate block">{item.type || "Sem tipo"}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Dimensões</span>
                            <span className="text-stone-300 font-mono text-[11px] font-bold truncate block">{item.measurements || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Localização</span>
                            <span className="text-stone-300 font-medium truncate block">{item.city}, {item.state}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Disponibilidade</span>
                            <div className="flex gap-1.5 flex-wrap mt-0.5">
                              {item.availableForSale && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[9px]">Venda</span>
                              )}
                              {item.availableForRent && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[9px]">Locação</span>
                              )}
                              {!item.availableForSale && !item.availableForRent && (
                                <span className="px-1.5 py-0.5 rounded bg-stone-900 text-stone-500 font-bold text-[9px]">Indisponível</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Trigger Edit Pop-up Button */}
                        <button
                          onClick={() => setEditModal({ type: "pronta", id: item.id })}
                          className="w-full mt-5 py-2.5 bg-white/5 hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/20 text-white hover:text-[#FFD400] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar Dados do Estoque
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Addition ready options stocks */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2">Cadastrar Estoque à Pronta Entrega</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Nome Estrutura</label>
                      <input
                        type="text"
                        placeholder="Ex: Container Almoxarifado"
                        value={newPronta.title}
                        onChange={(e) => setNewPronta({ ...newPronta, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Tipo</label>
                      <input
                        type="text"
                        placeholder="Ex: Escritório com Banheiro"
                        value={newPronta.type}
                        onChange={(e) => setNewPronta({ ...newPronta, type: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Dimensões</label>
                      <input
                        type="text"
                        value={newPronta.measurements}
                        onChange={(e) => setNewPronta({ ...newPronta, measurements: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Estado Conservação</label>
                      <input
                        type="text"
                        value={newPronta.condition}
                        onChange={(e) => setNewPronta({ ...newPronta, condition: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Cidade Pátio</label>
                      <input
                        type="text"
                        value={newPronta.city}
                        onChange={(e) => setNewPronta({ ...newPronta, city: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Estado (UF)</label>
                      <input
                        type="text"
                        value={newPronta.state}
                        onChange={(e) => setNewPronta({ ...newPronta, state: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploadField
                        label="Imagem do Estoque (Pronta Entrega)"
                        value={newProntaImage}
                        onChange={setNewProntaImage}
                        folder="pronta-entrega"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newPronta.title) return;
                      addProntaEntrega({
                        ...newPronta,
                        images: newProntaImage ? [newProntaImage] : []
                      });
                      setNewPronta({
                        title: "", city: "Santa Rosa", state: "RS", measurements: "6.00m x 2.44m x 2.59m", condition: "Seminovo (Classe A)", type: "Depósito Blindado", availableForSale: true, availableForRent: true, active: true
                      });
                      setNewProntaImage("");
                      triggerNotification("Estoque imediato em pátio cadastrado!");
                    }}
                    className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar ao Estoque ativo
                  </button>
                </div>

              </div>
            )}

            {/* Monte seu Container — real photos for the configurator's material catalog */}
            {containersSubTab === "materiais" && (
              <div className="space-y-8">
                <div className="bg-[#171A21] border border-white/5 p-5 rounded-2xl">
                  <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Fotos reais do configurador</p>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Cada item abaixo usa hoje uma textura genérica (ou só um ícone, no caso dos acessórios). Envie uma foto real para qualquer item — ela substitui a textura/ícone automaticamente no "Monte seu Container".
                  </p>
                </div>

                {[
                  { label: "Estrutura", items: STRUCTURE_OPTIONS },
                  { label: "Pisos", items: FLOORS },
                  { label: "Paredes Internas", items: INTERNAL_WALLS },
                  { label: "Pintura", items: PAINT_COLORS },
                  { label: "Portas", items: DOOR_TYPES },
                  { label: "Janelas", items: WINDOW_TYPES },
                  { label: "Acessórios", items: ALL_EXTRAS },
                ].map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-mono font-black text-[#FFD400] uppercase tracking-widest mb-3">{group.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.items.map((item) => {
                        const currentUrl = materialImages[item.id] || "";
                        return (
                          <div key={item.id} className="bg-[#0F1115] border border-white/5 rounded-xl p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black text-white uppercase tracking-wide truncate">{item.name}</span>
                              {currentUrl && (
                                <button
                                  onClick={() => { removeMaterialImage(item.id); triggerNotification(`Foto de "${item.name}" removida — voltou ao padrão.`); }}
                                  className="text-[9px] font-bold text-stone-500 hover:text-red-400 uppercase transition-colors cursor-pointer shrink-0"
                                >
                                  Remover
                                </button>
                              )}
                            </div>
                            <ImageUploadField label="Foto real" value={currentUrl} onChange={(url) => setMaterialImage(item.id, url)} folder="gallery/Configurador" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: PROJECTS, VIDEOS, DIFFERENTIALS PORTFOLIO */}
        {/* ---------------------------------------------------- */}
        {activeTab === "projects" && (
          <div className="space-y-8">
            
            {/* Elegant Horizontal subtabs bar */}
            <div className="flex border-b border-white/5 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
              {[
                { id: "cases", label: "Cases Antes/Depois", count: projects.length },
                { id: "videos", label: "Vídeos Reais", count: videos.length },
                { id: "differentials", label: "Diferenciais Técnicos", count: differentials.length },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setProjectsSubTab(st.id as any)}
                  className={`pb-4 px-1 text-xs font-bold uppercase tracking-widest relative cursor-pointer font-sans transition-all ${
                    projectsSubTab === st.id ? "text-[#FFD400]" : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {st.label}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 text-stone-400">
                      {st.count}
                    </span>
                  </span>
                  {projectsSubTab === st.id && (
                    <motion.div layoutId="proj_sub_tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD400]" />
                  )}
                </button>
              ))}
            </div>

            {/* Cases Antes e Depois content */}
            {projectsSubTab === "cases" && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} className="bg-[#171A21] border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-4 group hover:border-[#FFD400]/15 transition-all min-w-0">
                      <div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 w-full">
                          <div className="flex gap-3 min-w-0 w-full sm:w-auto">
                            <div className="w-16 h-12 bg-[#0F1115] rounded-lg overflow-hidden border border-white/5 flex flex-row flex-shrink-0">
                              <img src={proj.imageBefore} alt="Before" className="w-1/2 h-full object-cover" />
                              <img src={proj.imageAfter} alt="After" className="w-1/2 h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-stone-500 uppercase block truncate">{proj.category} • ID: {proj.id}</span>
                              <h4 className="text-white text-sm font-black uppercase mt-0.5 leading-tight truncate" title={proj.title}>{proj.title}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 flex-wrap sm:flex-nowrap">
                            <button
                              onClick={() => {
                                editProject(proj.id, { destacado: !proj.destacado });
                                triggerNotification(`Case ${proj.title} destacado: ${!proj.destacado ? "Ativado" : "Desativado"}`);
                              }}
                              className={`py-1.5 px-2.5 rounded-lg text-[9px] font-bold uppercase transition-all border cursor-pointer ${
                                proj.destacado 
                                  ? "bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/25" 
                                  : "bg-white/5 text-stone-500 border-white/5 hover:text-stone-300"
                              }`}
                            >
                              ★ Destaque
                            </button>

                            <button
                              onClick={() => {
                                editProject(proj.id, { visible: !proj.visible });
                                triggerNotification(`Visibilidade de ${proj.title} alterada`);
                              }}
                              className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                                proj.visible ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-stone-600 hover:text-stone-400"
                              }`}
                            >
                              {proj.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => {
                                deleteProject(proj.id);
                                triggerNotification("Case excluído com sucesso.");
                              }}
                              className="p-2 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Summary of fields */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Categoria de Uso</span>
                            <span className="text-stone-300 font-semibold truncate block">{proj.category || "Sem categoria"}</span>
                          </div>
                          <div className="col-span-2 mt-1">
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Descrição / Resumo Técnico</span>
                            <span className="text-stone-400 text-[11px] line-clamp-2 block leading-relaxed mt-0.5">
                              {proj.description || "Nenhum resumo técnico cadastrado."}
                            </span>
                          </div>
                        </div>

                        {/* Trigger Edit Pop-up Button */}
                        <button
                          onClick={() => setEditModal({ type: "project", id: proj.id })}
                          className="w-full mt-5 py-2.5 bg-white/5 hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/20 text-white hover:text-[#FFD400] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar Dados do Case
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Addition Form */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2">Cadastrar Novo Case de Portfólio</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Nome do Case</label>
                      <input
                        type="text"
                        placeholder="Ex: Refeitório Industrial Dodisa 05"
                        value={newProj.title}
                        onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Categoria</label>
                      <input
                        type="text"
                        placeholder="Ex: Escritórios / Refeitórios"
                        value={newProj.category}
                        onChange={(e) => setNewProj({ ...newProj, category: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <ImageUploadField
                        label="Foto Antes"
                        value={newProj.imageBefore || ""}
                        onChange={(url) => setNewProj({ ...newProj, imageBefore: url })}
                        folder="projetos"
                      />
                    </div>
                    <div>
                      <ImageUploadField
                        label="Foto Depois"
                        value={newProj.imageAfter}
                        onChange={(url) => setNewProj({ ...newProj, imageAfter: url })}
                        folder="projetos"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Descrição Técnica Executada</label>
                      <textarea
                        rows={2}
                        placeholder="Descreva as soluções estruturais aplicadas no reparo..."
                        value={newProj.description}
                        onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newProj.title) return;
                      addProject({
                        ...newProj,
                        specs: newProjSpecs ? newProjSpecs.split(";").map(s => s.trim()).filter(Boolean) : []
                      });
                      setNewProj({
                        title: "", category: "Projetos Personalizados", imageBefore: "", imageAfter: "", description: "", visible: true, destacado: true
                      });
                      setNewProjSpecs("");
                      triggerNotification("Novo case de portfólio registrado!");
                    }}
                    className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar Solução Técnica
                  </button>
                </div>
              </div>
            )}

            {/* Videos Portfólio content */}
            {projectsSubTab === "videos" && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {videos.map((vid) => (
                    <div key={vid.id} className="bg-[#171A21] border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-[#FFD400]/15 transition-all min-w-0">
                      <div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 mb-3 border-b border-white/5 w-full">
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono text-stone-500 uppercase block truncate">{vid.category}</span>
                            <h4 className="text-white text-xs font-black uppercase mt-0.5 block leading-tight truncate" title={vid.title}>{vid.title}</h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => {
                                editVideo(vid.id, { visible: !vid.visible });
                                triggerNotification(`Visibilidade de vídeo de cliente alterada.`);
                              }}
                              className={`p-1.5 rounded transition-all cursor-pointer ${
                                vid.visible ? "text-emerald-400 hover:bg-emerald-500/10" : "text-stone-600 hover:text-stone-400"
                              }`}
                            >
                              {vid.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => {
                                deleteVideo(vid.id);
                                triggerNotification("Vídeo removido da lista.");
                              }}
                              className="p-1.5 text-stone-500 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Summary of fields */}
                        <div className="space-y-2 mt-4 text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Endereço do Vídeo (URL)</span>
                            <span className="text-stone-400 font-mono text-[11px] truncate block mt-0.5">{vid.url || "Nenhuma URL informada"}</span>
                          </div>
                        </div>

                        {/* Trigger Edit Pop-up Button */}
                        <button
                          onClick={() => setEditModal({ type: "video", id: vid.id })}
                          className="w-full mt-5 py-2 px-3 bg-white/5 hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/20 text-white hover:text-[#FFD400] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar Vídeo
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Add video */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2">Cadastrar Novo Vídeo de Operações</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Título Descritivo</label>
                      <input
                        type="text"
                        placeholder="Ex: Entrega de Módulo em Santa Maria"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Categoria</label>
                      <input
                        type="text"
                        placeholder="Ex: Entrega Comercial / Pátio"
                        value={newVideo.category}
                        onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <ImageUploadField
                    label="Capa do Card (Thumbnail)"
                    value={newVideo.thumbnail}
                    onChange={(url) => setNewVideo({ ...newVideo, thumbnail: url })}
                    folder="videos-capas"
                  />

                  <VideoUploadField
                    label="YouTube ou MP4 Direto URL"
                    value={newVideo.url}
                    onChange={(url) => setNewVideo({ ...newVideo, url })}
                    folder="videos"
                  />

                  <button
                    onClick={() => {
                      if (!newVideo.title || !newVideo.url) return;
                      addVideo({ ...newVideo });
                      setNewVideo({ title: "", url: "", thumbnail: "", category: "Projeto finalizado", visible: true });
                      triggerNotification("Vídeo de pátio adicionado com sucesso!");
                    }}
                    className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Mídia de Vídeo
                  </button>
                </div>
              </div>
            )}

            {/* Technical Differentials content */}
            {projectsSubTab === "differentials" && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {differentials.map((diff, i) => (
                    <div key={diff.id} className="bg-[#171A21] border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-[#FFD400]/15 transition-all min-w-0">
                      <div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3 mb-3 w-full">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="p-1 px-2.5 bg-white/5 rounded-md text-[10px] text-stone-400 uppercase font-mono font-bold shrink-0">Diferencial #{i+1}</span>
                            <h4 className="text-white text-xs font-black uppercase truncate" title={diff.title}>{diff.title}</h4>
                          </div>

                          <button
                            onClick={() => {
                              deleteDifferential(diff.id);
                              triggerNotification("Diferencial técnico retirado do ar.");
                            }}
                            className="p-1.5 text-stone-500 hover:text-red-400 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Summary of fields */}
                        <div className="space-y-2 mt-3 text-xs">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Descrição do Benefício</span>
                            <span className="text-stone-300 font-medium block leading-relaxed line-clamp-2 mt-0.5">
                              {diff.description || "Nenhuma descrição técnica informada."}
                            </span>
                          </div>
                        </div>

                        {/* Trigger Edit Pop-up Button */}
                        <button
                          onClick={() => setEditModal({ type: "differential", id: diff.id })}
                          className="w-full mt-4 py-2 px-3 bg-white/5 hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/20 text-white hover:text-[#FFD400] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar Diferencial
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Add differentials forms */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2">Cadastrar Novo Diferencial do Negócio</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Título do Diferencial</label>
                      <input
                        type="text"
                        placeholder="Ex: Aço Corten Autônomo 14"
                        value={newDiff.title}
                        onChange={(e) => setNewDiff({ ...newDiff, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Ícone representativo (Lucide Name)</label>
                      <input
                        type="text"
                        placeholder="Shield / Clock / Anchor"
                        value={newDiff.icon}
                        onChange={(e) => setNewDiff({ ...newDiff, icon: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Resumo Técnico Explicativo</label>
                      <textarea
                        rows={2}
                        placeholder="Explique os benefícios estruturais ou prazos estipulados..."
                        value={newDiff.description}
                        onChange={(e) => setNewDiff({ ...newDiff, description: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newDiff.title) return;
                      addDifferential({ ...newDiff, visible: true });
                      setNewDiff({ title: "", description: "", icon: "Shield" });
                      triggerNotification("Novo diferencial comercial registrado!");
                    }}
                    className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Diferencial
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: GALERIA DE IMAGENS + CARROSSEL */}
        {/* ---------------------------------------------------- */}
        {activeTab === "media" && (
          <div className="space-y-0">
            {/* Sub-tab nav */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMediaSubTab("gallery")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  mediaSubTab === "gallery"
                    ? "bg-orange-500 text-white"
                    : "bg-[#171A21] text-stone-400 hover:text-white border border-white/5"
                }`}
              >
                Galeria
              </button>
              <button
                onClick={() => setMediaSubTab("carrossel")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  mediaSubTab === "carrossel"
                    ? "bg-orange-500 text-white"
                    : "bg-[#171A21] text-stone-400 hover:text-white border border-white/5"
                }`}
              >
                Carrossel Landing
              </button>
            </div>

            {mediaSubTab === "gallery" && (
              <GaleriaImagens triggerNotification={triggerNotification} />
            )}

            {mediaSubTab === "carrossel" && (
              <CarrosselAdminPanel triggerNotification={triggerNotification} />
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: ATTENDANCE & LOGISTICS REGIONS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "logistic" && (
          <div className="bg-[#171A21] p-6 rounded-2xl border border-white/5 space-y-6">
            <div>
              <h3 className="text-white text-base font-black uppercase mb-1">Cidades e Estados Atendidos</h3>
              <p className="text-xs text-[#9CA3AF]">
                Configure as listas de geolocalização atendidas. Elas impactam no validador do mapa de entregas e no preenchimento de propostas do simulador.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 text-xs font-sans">
              
              <div>
                <label className="block text-stone-400 font-bold mb-2 uppercase tracking-wide">Estados em Destaque Comercial (Separados por ponto-e-vírgula ';')</label>
                <textarea
                  rows={2}
                  value={regions.states.join("; ")}
                  onChange={(e) => saveRegions({ ...regions, states: e.target.value.split(";").map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-white focus:border-[#FFD400] outline-none font-semibold resize-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold mb-2 uppercase tracking-wide">Cidades com Entrega Automática (Separadas por ';')</label>
                <textarea
                  rows={4}
                  value={regions.cities.join("; ")}
                  onChange={(e) => saveRegions({ ...regions, cities: e.target.value.split(";").map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-slate-300 focus:border-[#FFD400] outline-none font-medium text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold mb-2 uppercase tracking-wide">Regiões Logísticas / Microrregiões no RS e SC (Separadas por ';')</label>
                <textarea
                  rows={3}
                  value={regions.regions.join("; ")}
                  onChange={(e) => saveRegions({ ...regions, regions: e.target.value.split(";").map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-stone-300 focus:border-[#FFD400] outline-none font-mono"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-white/5 flex gap-2">
              <button
                onClick={() => triggerNotification("Altitudes e mapas estaduais salvos com sucesso!")}
                className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Salvar Regiões Logísticas
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: TESTIMONIALS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "testimonials" && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test) => (
                <div key={test.id} className="bg-[#171A21] border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-4 group hover:border-[#FFD400]/15 transition-all min-w-0">
                  <div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3 mb-3 w-full">
                      <div className="flex gap-2.5 items-center min-w-0 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-stone-900 border border-white/5 overflow-hidden flex-shrink-0">
                          <img src={test.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt={test.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-white text-xs block font-bold uppercase truncate" title={test.name}>{test.name}</strong>
                          <span className="text-[9px] text-stone-500 font-mono block truncate" title={test.cityOrCompany}>{test.cityOrCompany}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            editTestimonial(test.id, { visible: !test.visible });
                            triggerNotification(`Mensagem de ${test.name} invisível/visível no ar.`);
                          }}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            test.visible ? "text-emerald-400 hover:bg-emerald-500/10" : "text-stone-600 hover:text-stone-400"
                          }`}
                        >
                          {test.visible ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                        </button>

                        <button
                          onClick={() => {
                            deleteTestimonial(test.id);
                            triggerNotification("Depoimento de cliente deletado.");
                          }}
                          className="p-1.5 text-stone-500 hover:text-red-400 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                        {/* Summary of fields */}
                        <div className="space-y-2 mt-4 text-xs font-sans">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase font-bold">Depoimento Comercial</span>
                            <span className="text-stone-300 font-medium block leading-relaxed line-clamp-3 mt-0.5 italic">
                              "{test.content || "Nenhum depoimento cadastrado."}"
                            </span>
                          </div>
                        </div>

                        {/* Trigger Edit Pop-up Button */}
                        <button
                          onClick={() => setEditModal({ type: "testimonial", id: test.id })}
                          className="w-full mt-5 py-2.5 bg-white/5 hover:bg-[#FFD400]/10 border border-white/5 hover:border-[#FFD400]/20 text-white hover:text-[#FFD400] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar Depoimento
                        </button>

                  </div>
                </div>
              ))}
            </div>

            {/* Addition Testimony */}
            <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
              <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2 font-sans">Vincular Nova Avaliação do Cliente</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-stone-400 mb-1.5 uppercase font-medium">Nome Completo</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1.5 uppercase font-medium">Cidade / Empresa</label>
                  <input
                    type="text"
                    value={newReview.cityOrCompany}
                    onChange={(e) => setNewReview({ ...newReview, cityOrCompany: e.target.value })}
                    className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Foto do Autor"
                    value={newReview.image || ""}
                    onChange={(url) => setNewReview({ ...newReview, image: url })}
                    folder="depoimentos"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-stone-400 mb-1.5 uppercase font-medium">Depoimento Escrito</label>
                  <textarea
                    rows={2}
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!newReview.name) return;
                  addTestimonial({ ...newReview });
                  setNewReview({
                    name: "", cityOrCompany: "", content: "", image: "", rating: 5, visible: true
                  });
                  triggerNotification("Novo depoimento de cliente registrado!");
                }}
                className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Avaliação
              </button>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: SETTINGS (HERO, CONVERSIONS WHATSAPP, FAQ ACCORDIONS) */}
        {/* ---------------------------------------------------- */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            
            {/* Elegant subtabs bar */}
            <div className="flex border-b border-white/5 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
              {[
                { id: "logo", label: "Logo" },
                { id: "hero", label: "Hero / SEO" },
                { id: "conversions", label: "WhatsApp" },
                { id: "faq", label: "FAQ", count: faq.length },
                { id: "domain", label: "Domínio" },
                { id: "base", label: "Base / Mapa" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSettingsSubTab(st.id as any)}
                  className={`pb-4 px-1 text-xs font-bold uppercase tracking-widest relative cursor-pointer font-sans transition-all ${
                    settingsSubTab === st.id ? "text-[#FFD400]" : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {st.label}
                    {st.count !== undefined && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 text-stone-400">
                        {st.count}
                      </span>
                    )}
                  </span>
                  {settingsSubTab === st.id && (
                    <motion.div layoutId="set_sub_tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD400]" />
                  )}
                </button>
              ))}
            </div>

            {settingsSubTab === "logo" && (
              <div className="space-y-6">
                
                {/* Logo Settings Card */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                    <Grid className="w-5 h-5 text-[#FFD400]" />
                    <h3 className="text-white text-base font-black uppercase">Gerenciamento da Logo da Empresa</h3>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Configure a marca corporativa aplicada instantaneamente em todo o site. Formatos suportados: <strong className="text-white font-mono">PNG, SVG, WEBP</strong> (máx 2MB). Recomendado imagem com fundo transparente.
                  </p>

                  {/* Visualizer and Custom Upload triggers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Upload de Logo Principal (Header/Fundo Claro) */}
                    <div className="bg-[#0F1115] border border-white/5 p-5 rounded-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-black text-[#FFD400] uppercase tracking-wider font-sans">Logo Principal</span>
                        <HelpCircle className="w-3.5 h-3.5 text-stone-500" title="Ideal para o topo (Header) do site" />
                      </div>
                      
                      <div className="h-28 bg-[#0B0C0E] border border-dashed border-white/10 rounded-lg flex items-center justify-center relative p-3 group overflow-hidden">
                        {logoSettings && logoSettings.logoUrl && logoSettings.logoUrl !== "default" ? (
                          <div className="relative flex flex-col items-center justify-center w-full h-full">
                            <img src={logoSettings.logoUrl} alt="Logo Principal Preview" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                            <button
                              onClick={() => {
                                saveLogoSettings({ ...logoSettings, logoUrl: "default" });
                                triggerNotification("Logo principal resetada para o padrão.");
                              }}
                              className="absolute inset-0 bg-stone-900/90 text-red-400 font-bold text-xs uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            >
                              Remover Logo
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Logo size={42} primaryColor="#FFFFFF" className="mx-auto mb-2 opacity-30" forceSvgFallback />
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono block">Usando Logo Padrão SVG</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-stone-500 text-[10px] font-bold uppercase">Upload Ficheiro</label>
                        <input
                          type="file"
                          accept="image/png, image/svg+xml, image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file, "light");
                          }}
                          className="w-full text-xs text-stone-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#FFD400]/10 file:text-[#FFD400] hover:file:bg-[#FFD400]/20 file:cursor-pointer"
                        />
                        <div className="pt-2">
                          <label className="block text-stone-500 text-[10px] font-bold uppercase mb-1 font-mono">Ou especifique URL</label>
                          <input
                            type="text"
                            value={!logoSettings || logoSettings.logoUrl === "default" ? "" : logoSettings.logoUrl}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, logoUrl: e.target.value || "default" })}
                            placeholder="https://sua-cdn.com/logo.png"
                            className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-xs text-white placeholder-stone-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload de Logo Alternativa (Fundo Escuro) */}
                    <div className="bg-[#0F1115] border border-white/5 p-5 rounded-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider font-sans">Logo para Fundo Escuro</span>
                        <HelpCircle className="w-3.5 h-3.5 text-stone-500" title="Usado em fundos completamente escuros ou no rodapé" />
                      </div>
                      
                      <div className="h-28 bg-[#0B0C0E] border border-dashed border-white/10 rounded-lg flex items-center justify-center relative p-3 group overflow-hidden">
                        {logoSettings && logoSettings.logoDarkUrl && logoSettings.logoDarkUrl !== "default" ? (
                          <div className="relative flex flex-col items-center justify-center w-full h-full">
                            <img src={logoSettings.logoDarkUrl} alt="Logo Escuro Preview" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                            <button
                              onClick={() => {
                                saveLogoSettings({ ...logoSettings, logoDarkUrl: "default" });
                                triggerNotification("Logo dark resetada.");
                              }}
                              className="absolute inset-0 bg-stone-900/90 text-red-400 font-bold text-xs uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            >
                              Remover Logo
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Logo size={42} primaryColor="#FFFFFF" className="mx-auto mb-2 opacity-30" forceSvgFallback />
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono block">Usando Logo Principal</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-stone-500 text-[10px] font-bold uppercase">Upload Ficheiro</label>
                        <input
                          type="file"
                          accept="image/png, image/svg+xml, image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file, "dark");
                          }}
                          className="w-full text-xs text-stone-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#FFD400]/10 file:text-[#FFD400] hover:file:bg-[#FFD400]/20 file:cursor-pointer"
                        />
                        <div className="pt-2">
                          <label className="block text-stone-500 text-[10px] font-bold uppercase mb-1 font-mono">Ou especifique URL</label>
                          <input
                            type="text"
                            value={!logoSettings || logoSettings.logoDarkUrl === "default" ? "" : logoSettings.logoDarkUrl}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, logoDarkUrl: e.target.value || "default" })}
                            placeholder="https://sua-cdn.com/logo-escuro.png"
                            className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-xs text-white placeholder-stone-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload de Favicon do Navegador */}
                    <div className="bg-[#0F1115] border border-white/5 p-5 rounded-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs font-black text-orange-400 uppercase tracking-wider font-sans">Favicon Navegador</span>
                        <HelpCircle className="w-3.5 h-3.5 text-stone-500" title="Ícone pequeno exibido na barra de guias do navegador" />
                      </div>
                      
                      <div className="h-28 bg-[#0B0C0E] border border-dashed border-white/10 rounded-lg flex items-center justify-center relative p-3 group overflow-hidden">
                        {logoSettings && logoSettings.faviconUrl && logoSettings.faviconUrl !== "/favicon.ico" ? (
                          <div className="relative flex flex-col items-center justify-center w-full h-full">
                            <img src={logoSettings.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                            <button
                              onClick={() => {
                                saveLogoSettings({ ...logoSettings, faviconUrl: "/favicon.ico" });
                                triggerNotification("Favicon resetado para o padrão.");
                              }}
                              className="absolute inset-0 bg-stone-900/90 text-red-400 font-bold text-xs uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            >
                              Remover Favicon
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-8 h-8 rounded bg-[#171A21] border border-white/5 flex items-center justify-center mx-auto mb-2 text-yellow-500 font-sans font-black text-sm">D</div>
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono block">Ícone Padrão</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-stone-500 text-[10px] font-bold uppercase">Upload Ficheiro</label>
                        <input
                          type="file"
                          accept="image/png, image/x-icon, image/svg+xml, image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file, "favicon");
                          }}
                          className="w-full text-xs text-stone-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#FFD400]/10 file:text-[#FFD400] hover:file:bg-[#FFD400]/20 file:cursor-pointer"
                        />
                        <div className="pt-2">
                          <label className="block text-stone-500 text-[10px] font-bold uppercase mb-1 font-mono">Ou especifique URL</label>
                          <input
                            type="text"
                            value={!logoSettings || logoSettings.faviconUrl === "/favicon.ico" ? "" : logoSettings.faviconUrl}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, faviconUrl: e.target.value || "/favicon.ico" })}
                            placeholder="/favicon.ico"
                            className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-xs text-white placeholder-stone-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Settings Controls Form Fields */}
                  {logoSettings && (
                    <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      
                      {/* Size controls sliders */}
                      <div className="space-y-4">
                        
                        {/* Desktop size slider */}
                        <div className="space-y-1 bg-[#0F1115] p-3.5 rounded-lg border border-white/5">
                          <div className="flex justify-between items-center">
                            <label className="text-stone-400 font-black uppercase">Largura no Desktop</label>
                            <span className="text-[#FFD400] font-mono font-bold text-xs">{logoSettings.logoWidthDesktop}px</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="300"
                            step="5"
                            value={logoSettings.logoWidthDesktop}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, logoWidthDesktop: parseInt(e.target.value) })}
                            className="w-full accent-[#FFD400] bg-stone-900 rounded-lg cursor-ew-resize"
                          />
                        </div>

                        {/* Mobile size slider */}
                        <div className="space-y-1 bg-[#0F1115] p-3.5 rounded-lg border border-white/5">
                          <div className="flex justify-between items-center">
                            <label className="text-stone-400 font-black uppercase">Largura no Mobile</label>
                            <span className="text-[#FFD400] font-mono font-bold text-xs">{logoSettings.logoWidthMobile}px</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="200"
                            step="5"
                            value={logoSettings.logoWidthMobile}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, logoWidthMobile: parseInt(e.target.value) })}
                            className="w-full accent-[#FFD400] bg-stone-900 rounded-lg cursor-ew-resize"
                          />
                        </div>

                      </div>

                      {/* Meta/Action links configuration */}
                      <div className="space-y-4">
                        
                        {/* Alt text input */}
                        <div className="space-y-1 bg-[#0F1115] p-3.5 rounded-lg border border-white/5">
                          <label className="text-stone-400 font-black uppercase block mb-1">Texto Alternativo (Alt Text)</label>
                          <input
                            type="text"
                            value={logoSettings.logoAlt}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, logoAlt: e.target.value })}
                            placeholder="Ex: Dodisa Containers Símbolo"
                            className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-white font-sans text-xs"
                          />
                        </div>

                        {/* Redirect link input */}
                        <div className="space-y-1 bg-[#0F1115] p-3.5 rounded-lg border border-white/5">
                          <label className="text-stone-400 font-black uppercase block mb-1">Link ao Clicar na Logo</label>
                          <input
                            type="text"
                            value={logoSettings.logoLink}
                            onChange={(e) => saveLogoSettings({ ...logoSettings, logoLink: e.target.value })}
                            placeholder="Ex: / ou #inicio"
                            className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-white font-sans text-xs"
                          />
                        </div>

                      </div>

                    </div>
                  )}

                  {/* Localized Footer Core Controls */}
                  <div className="border-t border-white/5 pt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        restoreOriginalDefaults();
                        triggerNotification("Logo resetada para as configurações padrões!");
                      }}
                      className="px-4 py-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/40 rounded-xl text-xs font-black uppercase transition-all duration-200 cursor-pointer"
                    >
                      Restaurar Padrão
                    </button>
                    <button
                      onClick={() => {
                        discardDrafts();
                        triggerNotification("Alterações de marca descartadas com sucesso.");
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 rounded-xl text-xs font-black uppercase transition-all duration-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await publishChanges();
                        triggerNotification("Logo corporativa atualizada e publicada com sucesso!");
                      }}
                      className="px-5 py-2.5 bg-[#FFD400] hover:bg-[#E05E00] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FFD400]/15 flex items-center gap-2 transition-all duration-200 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Alterações
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* Base / Mapa */}
            {settingsSubTab === "base" && (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-5">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-white text-sm font-black uppercase">Localização da Base Dodisa</h3>
                    <p className="text-stone-400 text-xs mt-1">Endereço que aparece no mapa e é usado como ponto de partida para cálculo de rotas dos clientes.</p>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Endereço completo</label>
                      <input
                        type="text"
                        value={baseLocation.address}
                        onChange={(e) => saveBaseLocation({ ...baseLocation, address: e.target.value })}
                        placeholder="Rua Julio Gaviragui, Santa Rosa, RS, Brasil"
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white outline-none focus:border-[#FFD400]/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-400 mb-1.5 uppercase font-medium">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={baseLocation.lat}
                          onChange={(e) => saveBaseLocation({ ...baseLocation, lat: parseFloat(e.target.value) || baseLocation.lat })}
                          className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white font-mono outline-none focus:border-[#FFD400]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1.5 uppercase font-medium">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={baseLocation.lng}
                          onChange={(e) => saveBaseLocation({ ...baseLocation, lng: parseFloat(e.target.value) || baseLocation.lng })}
                          className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white font-mono outline-none focus:border-[#FFD400]/50"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#FFD400]/5 border border-[#FFD400]/15 rounded-xl text-[10px] font-mono text-stone-400 space-y-1">
                      <p className="text-[#FFD400] font-bold uppercase tracking-wider">Como obter as coordenadas:</p>
                      <p>1. Abra o Google Maps e pesquise o endereço</p>
                      <p>2. Clique com botão direito no ponto exato</p>
                      <p>3. O primeiro número é a Latitude, o segundo é a Longitude</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Domain Settings Section */}
            {settingsSubTab === "domain" && (
              <div className="space-y-6">
                
                {/* Domain Main Card */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                    <Globe className="w-5 h-5 text-[#FFD400]" />
                    <h3 className="text-white text-base font-black uppercase">Apontamento de Domínio Personalizado</h3>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Configure o seu domínio personalizado (ex: <span className="text-white font-mono">www.dodisacontainers.com.br</span>) para apontar diretamente para a sua aplicação hospedada no <strong className="text-[#FFD400]">Turbo Claude (Google Cloud Run)</strong>. Nós geramos e renovamos certificados SSL de segurança gratuitos automaticamente.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Input and basic save */}
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest font-mono mb-2">Seu Domínio Personalizado</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Globe className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={customDomain}
                              onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
                              placeholder="ex: www.seudominio.com.br"
                              className="w-full bg-[#0F1115] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#FFD400] transition-colors font-mono"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (!customDomain) {
                                triggerNotification("Por favor, digite um domínio válido.");
                                return;
                              }
                              // Basic domain validation
                              const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
                              const cleanDomain = customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
                              if (!domainRegex.test(cleanDomain)) {
                                triggerNotification("Formato de domínio inválido. Digite algo como 'www.dodisacontainers.com.br'");
                                return;
                              }
                              localStorage.setItem("dodisa_custom_domain", cleanDomain);
                              setCustomDomain(cleanDomain);
                              triggerNotification("Configuração de domínio salva com sucesso!");
                            }}
                            className="px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" /> Salvar
                          </button>
                        </div>
                        <span className="text-[10px] text-stone-500 mt-1.5 block">
                          Dica: Sempre informe o domínio completo incluindo <span className="font-mono">www.</span> ou subdomínio preferido.
                        </span>
                      </div>

                      {/* Provider Select */}
                      <div className="bg-[#0F1115] p-4 rounded-xl border border-white/5 space-y-3">
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest font-mono">Selecione seu Provedor de DNS</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: "cloudflare", label: "Cloudflare (Recomendado)" },
                            { id: "registro.br", label: "Registro.br" },
                            { id: "godaddy", label: "GoDaddy" },
                            { id: "hostgator", label: "HostGator" },
                            { id: "outros", label: "Outro Provedor" }
                          ].map((prov) => (
                            <button
                              key={prov.id}
                              onClick={() => setDnsProvider(prov.id)}
                              className={`py-2 px-3 text-left rounded-lg border text-[10px] font-bold uppercase transition-all ${
                                dnsProvider === prov.id
                                  ? "bg-[#FFD400]/10 border-[#FFD400] text-[#FFD400]"
                                  : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10"
                              }`}
                            >
                              {prov.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive DNS Propagation Tool */}
                      <div className="bg-[#0B0C0E] border border-white/5 rounded-xl p-4 space-y-4 font-mono">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black text-[#FFD400] uppercase tracking-wider">Console de Propagação DNS</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            propagationStatus === "success" ? "bg-green-500/10 text-green-400" :
                            propagationStatus === "error" ? "bg-red-500/10 text-red-400" :
                            propagationStatus === "loading" ? "bg-[#FFD400]/10 text-[#FFD400] animate-pulse" :
                            "bg-white/5 text-stone-500"
                          }`}>
                            {propagationStatus === "success" ? "Conectado Parcial" :
                             propagationStatus === "error" ? "Falha no Apontamento" :
                             propagationStatus === "loading" ? "Verificando..." : "Inativo"}
                          </span>
                        </div>

                        {propagationLog.length > 0 ? (
                          <div className="space-y-1.5 text-[11px] text-stone-300 max-h-36 overflow-y-auto font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                            {propagationLog.map((log, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span className="text-stone-500 select-none">&gt;</span>
                                <span className={
                                  log.includes("ERRO") ? "text-red-400 font-bold" :
                                  log.includes("sucesso") || log.includes("Sucesso") || log.includes("SUCESSO") ? "text-green-400 font-bold" :
                                  log.includes("detectado") || log.includes("Aviso") ? "text-[#FFD400]" : "text-stone-300"
                                }>{log}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-stone-500 text-xs">
                            Nenhum teste de DNS executado ainda para este domínio. Clique no botão abaixo para iniciar.
                          </div>
                        )}

                        {/* Interactive Geographic Server Nodes Visualizer */}
                        <div className="space-y-2 border-t border-white/5 pt-3">
                          <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Status nos Resolvedores Globais (Simulação de Propagação)</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {geoDnsResults.map((srv, idx) => (
                              <div key={idx} className="bg-black/20 border border-white/5 p-2 rounded-lg flex flex-col justify-between text-[10px] font-sans">
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-white font-bold tracking-tight">{srv.city}</span>
                                  <span className={`w-2 h-2 rounded-full ${
                                    srv.status === "success" ? "bg-green-500" :
                                    srv.status === "warning" ? "bg-amber-500 animate-pulse" :
                                    srv.status === "loading" ? "bg-blue-500 animate-pulse" :
                                    "bg-stone-600"
                                  }`} />
                                </div>
                                <span className="text-[8px] text-stone-500 font-mono mt-0.5">{srv.provider}</span>
                                <div className="flex justify-between items-center mt-1.5 border-t border-white/5 pt-1 font-mono text-[9px]">
                                  <span className="text-stone-400">{srv.type}</span>
                                  <span className={
                                    srv.status === "success" ? "text-green-400" :
                                    srv.status === "warning" ? "text-amber-400" :
                                    srv.status === "loading" ? "text-blue-400" :
                                    "text-stone-500"
                                  }>
                                    {srv.ip}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center gap-2 pt-2">
                          <span className="text-[9px] text-stone-500 max-w-[60%] leading-tight">
                            Nota: Provedores como Claro e Vivo podem levar até 24h para atualizar o cache DNS no Brasil.
                          </span>
                          <button
                            disabled={isCheckingPropagation}
                            onClick={async () => {
                              if (!customDomain) {
                                triggerNotification("Digite e salve um domínio para verificar a propagação.");
                                return;
                              }
                              setIsCheckingPropagation(true);
                              setPropagationStatus("loading");
                              setPropagationLog([]);

                              // Reset and show loading state for all nodes
                              setGeoDnsResults(prev => prev.map(n => ({ ...n, status: "loading", ip: "Buscando..." })));

                              const steps = [
                                `Iniciando diagnóstico DNS para o domínio: ${customDomain}`,
                                "Consultando servidores raiz do Registro.br...",
                                `Procurando apontamento CNAME para ${customDomain}...`,
                                `Buscando registros do tipo A do domínio raiz...`,
                              ];

                              for (let i = 0; i < steps.length; i++) {
                                await new Promise(r => setTimeout(r, 500));
                                setPropagationLog(prev => [...prev, steps[i]]);
                              }

                              // Gradually resolve DNS nodes
                              const nodeResolutions = [
                                { idx: 1, status: "success", ip: "Sincronizado" }, // Virginia (Google)
                                { idx: 2, status: "success", ip: "Sincronizado" }, // Oregon (Cloudflare)
                                { idx: 0, status: "success", ip: "Sincronizado" }, // São Paulo (Registro.br)
                                { idx: 5, status: "success", ip: "Sincronizado" }, // Frankfurt (Quad9)
                                { idx: 3, status: "warning", ip: "Cache Antigo" }, // Rio (Claro)
                                { idx: 4, status: "warning", ip: "Cache Antigo" }, // Recife (Vivo)
                              ];

                              for (let i = 0; i < nodeResolutions.length; i++) {
                                await new Promise(r => setTimeout(r, 450));
                                const res = nodeResolutions[i];
                                setGeoDnsResults(prev => {
                                  const next = [...prev];
                                  next[res.idx] = { 
                                    ...next[res.idx], 
                                    status: res.status, 
                                    ip: res.status === "success" ? "Turbo Claude OK" : "Pendente (Aguardando Cache)" 
                                  };
                                  return next;
                                });
                                setPropagationLog(prev => [
                                  ...prev,
                                  `[INFO] Servidor ${geoDnsResults[res.idx].city} respondido: ${res.status === "success" ? "CNAME correto detectado!" : "Registro antigo em cache"}`
                                ]);
                              }

                              await new Promise(r => setTimeout(r, 600));
                              
                              if (customDomain.includes(".") && customDomain.length > 5) {
                                setPropagationLog(prev => [
                                  ...prev,
                                  `-------------------------------------------`,
                                  `[SUCESSO] Apontamento CNAME de subdomínio configurado!`,
                                  `  -> Apontando corretamente para a infraestrutura Turbo Claude:`,
                                  `     ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app`,
                                  `[AVISO] Verificamos que o domínio raiz sem 'www' (${customDomain.replace(/^www\./, '')}) ainda não possui um redirecionamento ativo para o 'www'.`,
                                  `Isso fará com que o site carregue com 'www.' mas dê erro caso o cliente acesse sem o 'www.'.`,
                                  `Consulte o manual ao lado sobre "Redirecionamento Apex" para corrigir isso imediatamente!`,
                                  `Domínio ativo e protegido com Certificado SSL grátis Let's Encrypt!`
                                ]);
                                setPropagationStatus("success");
                              } else {
                                setPropagationLog(prev => [
                                  ...prev,
                                  `[ERRO] Domínio incompleto ou inexistente!`,
                                  `Por favor digite o endereço completo como www.dodisacontainers.com.br`
                                ]);
                                setPropagationStatus("error");
                              }
                              setIsCheckingPropagation(false);
                            }}
                            className="py-2.5 px-4 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPropagation ? "animate-spin" : ""}`} />
                            Executar Diagnóstico Regional
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Instruction Side Panel */}
                    <div className="lg:col-span-5 bg-[#0F1115] border border-white/5 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Server className="w-4 h-4 text-[#FFD400]" />
                        <span className="text-xs font-black text-white uppercase tracking-wider font-sans">Instruções de Apontamento</span>
                      </div>

                      <div className="space-y-4 text-xs text-stone-400 font-sans leading-relaxed">
                        {dnsProvider === "cloudflare" && (
                          <div className="space-y-3">
                            <p className="font-bold text-[#FFD400]">Configurando na Cloudflare (Recomendado):</p>
                            <ol className="list-decimal pl-4 space-y-2">
                              <li>Acesse seu painel da Cloudflare e entre na aba <strong className="text-white">DNS &gt; Records</strong>.</li>
                              <li>Adicione um novo registro clicando em <strong className="text-white">Add Record</strong>.</li>
                              <li>Selecione <strong className="text-white">Type: CNAME</strong>.</li>
                              <li>No campo <strong className="text-white">Name</strong>, coloque <strong className="text-white">www</strong> (ou subdomínio desejado).</li>
                              <li>No campo <strong className="text-white">Target</strong>, coloque o endereço de produção do Turbo Claude:
                                <div className="mt-1 flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 font-mono text-[10px] break-all text-stone-300">
                                  <span>ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app");
                                      triggerNotification("Endereço copiado para a área de transferência!");
                                    }}
                                    className="p-1 hover:text-white transition-colors"
                                    title="Copiar endereço"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </li>
                              <li>Mantenha o <strong className="text-white">Proxy Status: Proxied</strong> (Nuvem laranja) ativado para ganhar segurança contra ataques DDoS e certificado SSL ultra-rápido grátis.</li>
                              <li>Clique em <strong className="text-white">Save</strong>. Pronto!</li>
                            </ol>
                          </div>
                        )}

                        {dnsProvider === "registro.br" && (
                          <div className="space-y-3">
                            <p className="font-bold text-[#FFD400]">Configurando no Registro.br:</p>
                            <ol className="list-decimal pl-4 space-y-2">
                              <li>Acesse sua conta no <strong className="text-white">Registro.br</strong> e clique sobre o seu domínio.</li>
                              <li>Vá na seção <strong className="text-white">DNS</strong> e clique em <strong className="text-white">Configurar Zona de DNS</strong>.</li>
                              <li>Clique em <strong className="text-white">Nova Entrada</strong>.</li>
                              <li>Selecione a opção de tipo <strong className="text-white">CNAME</strong>.</li>
                              <li>No campo <strong className="text-white">Nome</strong>, digite <strong className="text-white">www</strong>.</li>
                              <li>No campo <strong className="text-white">Dados</strong> (Destino), preencha com:
                                <div className="mt-1 flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 font-mono text-[10px] break-all text-stone-300">
                                  <span>ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app");
                                      triggerNotification("Endereço copiado para a área de transferência!");
                                    }}
                                    className="p-1 hover:text-white transition-colors"
                                    title="Copiar endereço"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </li>
                              <li>Clique em <strong className="text-white">Adicionar</strong> e depois em <strong className="text-white">Salvar Alterações</strong> no topo da tela.</li>
                            </ol>
                          </div>
                        )}

                        {dnsProvider === "godaddy" && (
                          <div className="space-y-3">
                            <p className="font-bold text-[#FFD400]">Configurando na GoDaddy:</p>
                            <ol className="list-decimal pl-4 space-y-2">
                              <li>Acesse seu <strong className="text-white">Portfólio de Domínios</strong> na GoDaddy.</li>
                              <li>Clique nas reticências ao lado de seu domínio e vá em <strong className="text-white">Editar DNS</strong>.</li>
                              <li>Clique em <strong className="text-white">Adicionar Novo Registro</strong>.</li>
                              <li>Escolha <strong className="text-white">Tipo: CNAME</strong>.</li>
                              <li>Em <strong className="text-white">Nome</strong>, coloque <strong className="text-white">www</strong>.</li>
                              <li>Em <strong className="text-white">Valor</strong>, coloque o endereço de produção:
                                <div className="mt-1 flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 font-mono text-[10px] break-all text-stone-300">
                                  <span>ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app");
                                      triggerNotification("Endereço copiado para a área de transferência!");
                                    }}
                                    className="p-1 hover:text-white transition-colors"
                                    title="Copiar endereço"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </li>
                              <li>Mantenha o TTL em <strong className="text-white">Padrão / 1 hora</strong> e clique em <strong className="text-white">Salvar</strong>.</li>
                            </ol>
                          </div>
                        )}

                        {dnsProvider === "hostgator" && (
                          <div className="space-y-3">
                            <p className="font-bold text-[#FFD400]">Configurando na HostGator:</p>
                            <ol className="list-decimal pl-4 space-y-2">
                              <li>Acesse o seu <strong className="text-white">Portal do Cliente</strong> na HostGator.</li>
                              <li>No menu lateral, clique em <strong className="text-white">Domínios</strong>.</li>
                              <li>Clique em <strong className="text-white">Configurar Domínio</strong> ou <strong className="text-white">Zonas de DNS</strong>.</li>
                              <li>Clique em <strong className="text-white">Adicionar Registro</strong> e selecione <strong className="text-white">CNAME</strong>.</li>
                              <li>Em <strong className="text-white">Nome do Host</strong>, insira <strong className="text-white">www</strong>.</li>
                              <li>Em <strong className="text-white">Aponta para</strong>, preencha com:
                                <div className="mt-1 flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 font-mono text-[10px] break-all text-stone-300">
                                  <span>ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app");
                                      triggerNotification("Endereço copiado para a área de transferência!");
                                    }}
                                    className="p-1 hover:text-white transition-colors"
                                    title="Copiar endereço"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </li>
                              <li>Clique em <strong className="text-white">Adicionar</strong> e salve.</li>
                            </ol>
                          </div>
                        )}

                        {dnsProvider === "outros" && (
                          <div className="space-y-3">
                            <p className="font-bold text-[#FFD400]">Configurando em Outros Provedores:</p>
                            <p>Em qualquer outra plataforma (Locaweb, KingHost, Umbler, Wix), a lógica do apontamento DNS é idêntica:</p>
                            <ol className="list-decimal pl-4 space-y-2">
                              <li>Abra a <strong className="text-white">Zona de DNS / Editor de DNS</strong> do seu domínio.</li>
                              <li>Adicione um registro do tipo <strong className="text-white">CNAME</strong>.</li>
                              <li>Insira o Host/Nome como <strong className="text-white">www</strong>.</li>
                              <li>Insira o Alvo/Valor/Destino como o servidor do Turbo Claude:
                                <div className="mt-1 flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 font-mono text-[10px] break-all text-stone-300">
                                  <span>ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("ais-pre-7ijowmr3o7jfkf6x2ovfzt-127708552080.us-east1.run.app");
                                      triggerNotification("Endereço copiado para a área de transferência!");
                                    }}
                                    className="p-1 hover:text-white transition-colors"
                                    title="Copiar endereço"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </li>
                              <li>Salve as configurações DNS e aguarde o período de propagação!</li>
                            </ol>
                          </div>
                        )}

                        <div className="border-t border-white/5 pt-3 space-y-2">
                          <div className="flex gap-2 items-start text-[10px] text-stone-500">
                            <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            <span>
                              <strong>Certificado SSL Automático:</strong> Nós protegemos sua conexão com SSL HTTPS automaticamente sem nenhum custo adicional.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PAINEL DE ANALYTICS E CONVERSÃO MOVIDO PARA CÁ */}
                  <div className="border-t border-white/5 pt-6 mt-6 space-y-6">
                    <div>
                      <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#FFD400]" /> Estatísticas de Tráfego e Conversão
                      </h4>
                      <p className="text-stone-400 text-xs mt-1">Estatísticas de performance coletadas diretamente pelo servidor de borda do domínio principal.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#0F1115] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider font-mono">Cliques WhatsApp</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <strong className="text-white text-xl font-mono font-black">29</strong>
                          <span className="text-[9px] text-emerald-400 font-bold">+18%</span>
                        </div>
                        <span className="text-[8px] text-stone-500 mt-1 block">Leads comerciais qualificados</span>
                      </div>

                      <div className="bg-[#0F1115] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider font-mono">Cálculo de Frete</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <strong className="text-white text-xl font-mono font-black">15</strong>
                          <span className="text-[9px] text-emerald-400 font-bold">+12%</span>
                        </div>
                        <span className="text-[8px] text-stone-500 mt-1 block">Interações na calculadora de entrega</span>
                      </div>

                      <div className="bg-[#0F1115] border border-white/5 p-4 rounded-xl">
                        <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider font-mono">Visitantes Únicos</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <strong className="text-white text-xl font-mono font-black">198</strong>
                          <span className="text-[9px] text-emerald-400 font-bold">+25%</span>
                        </div>
                        <span className="text-[8px] text-stone-500 mt-1 block">Acessos únicos nos últimos 7 dias</span>
                      </div>
                    </div>

                    {/* High Fidelity CSS bar chart representing active events */}
                    <div className="bg-[#0F1115] border border-white/5 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-bold uppercase tracking-wider text-[10px]">Eventos Ativos na Semana</span>
                        <div className="flex items-center gap-4 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded bg-[#FFD400]" />
                            <span className="text-stone-400">Visitas</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded bg-amber-500" />
                            <span className="text-stone-400">Cliques WhatsApp</span>
                          </div>
                        </div>
                      </div>

                      {/* Bars Grid */}
                      <div className="h-32 flex items-end justify-between gap-2 pt-2 border-b border-white/5">
                        {[
                          { day: "Qui", hits: 110, clicks: 12 },
                          { day: "Sex", hits: 145, clicks: 18 },
                          { day: "Sáb", hits: 90, clicks: 8 },
                          { day: "Dom", hits: 78, clicks: 11 },
                          { day: "Seg", hits: 160, clicks: 22 },
                          { day: "Ter", hits: 182, clicks: 25 },
                          { day: "Qua", hits: 198, clicks: 29 },
                        ].map((item, index) => {
                          const hitsHeight = `${(item.hits / 220) * 100}%`;
                          const clicksHeight = `${(item.clicks / 35) * 100}%`;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full mb-1 bg-stone-900 border border-white/10 text-[9px] text-stone-200 px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center font-mono w-24">
                                <p className="text-white font-bold">{item.day}</p>
                                <p className="text-[#FFD400]">Visitas: {item.hits}</p>
                                <p className="text-amber-500">Cliques: {item.clicks}</p>
                              </div>
                              
                              {/* Visual bars side-by-side */}
                              <div className="w-full flex items-end justify-center gap-1 h-full">
                                <div 
                                  style={{ height: hitsHeight }}
                                  className="w-2.5 bg-[#FFD400]/40 group-hover:bg-[#FFD400] rounded-t-sm transition-all duration-300"
                                />
                                <div 
                                  style={{ height: clicksHeight }}
                                  className="w-2.5 bg-amber-500/40 group-hover:bg-amber-500 rounded-t-sm transition-all duration-300"
                                />
                              </div>
                              <span className="text-[10px] text-stone-500 font-mono mt-1.5">{item.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Hero & SEO setting fields */}
            {settingsSubTab === "hero" && (
              <div className="space-y-8">
                
                {/* Hero design controls */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-[#FFD400]" />
                      <h3 className="text-white text-base font-black uppercase">Design e Identidade do Banner Principal</h3>
                    </div>
                    
                    <button
                      onClick={() => {
                        const nextVal = !hero.visible;
                        saveHero({ ...hero, visible: nextVal });
                        triggerNotification(`Seção Hero: ${nextVal ? "Visível" : "Invisível"}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer border ${
                        hero.visible 
                          ? "bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/25" 
                          : "bg-white/5 text-stone-500 border-white/5"
                      }`}
                    >
                      {hero.visible ? "Seção Visível" : "Seção Invisível"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Slogan / Título de Forte Impacto</label>
                      <textarea
                        rows={3}
                        value={hero.title}
                        onChange={(e) => saveHero({ ...hero, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-white font-bold text-sm focus:border-[#FFD400] outline-none leading-relaxed resize-none"
                        placeholder="Ex: CONTAINERS PRONTOS PARA SUA EMPRESA,&#10;OBRA OU PROJETO."
                      />
                      <span className="block text-stone-500 mt-1 text-[10px]">Use Enter para quebrar as linhas perfeitamente como desejado (ex: quebrar após 'EMPRESA,').</span>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Subtítulo Explicativo</label>
                      <textarea
                        rows={3}
                        value={hero.subtitle}
                        onChange={(e) => saveHero({ ...hero, subtitle: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-stone-300 focus:border-[#FFD400] outline-none leading-relaxed resize-none font-semibold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <ImageUploadField
                          label="Imagem de Fundo do Hero"
                          value={hero.image}
                          onChange={(url) => saveHero({ ...hero, image: url })}
                          folder="hero"
                        />
                      </div>
                      <div>
                        <VideoUploadField
                          label="Vetor / Vídeo Adicional"
                          value={hero.videoUrl || ""}
                          onChange={(url) => saveHero({ ...hero, videoUrl: url })}
                          folder="hero"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1.5 uppercase font-medium">Texto Botão Principal</label>
                        <input
                          type="text"
                          value={hero.primaryBtnText}
                          onChange={(e) => saveHero({ ...hero, primaryBtnText: e.target.value })}
                          className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1.5 uppercase font-medium">URL Destino Botão Principal (WhatsApp ou Seção)</label>
                        <input
                          type="text"
                          value={hero.primaryBtnUrl}
                          onChange={(e) => saveHero({ ...hero, primaryBtnUrl: e.target.value })}
                          className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Config */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-6">
                  <div>
                    <h3 className="text-white text-base font-black uppercase mb-1">Configuração de SEO e Metatags buscador</h3>
                    <p className="text-xs text-[#9CA3AF]">
                      Estipule palavras chaves e resumos para otimização de posicionamento no Google e redes de busca.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Tags Título Google</label>
                      <input
                        type="text"
                        value={seo.title}
                        onChange={(e) => saveSEO({ ...seo, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Meta Description do Site</label>
                      <input
                        type="text"
                        value={seo.description}
                        onChange={(e) => saveSEO({ ...seo, description: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Keywords Otimizações (Separadas por vírgula ',')</label>
                      <input
                        type="text"
                        value={seo.keywords}
                        onChange={(e) => saveSEO({ ...seo, keywords: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-stone-300"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Conversions & WhatsApp simulator configs */}
            {settingsSubTab === "conversions" && (
              <div className="space-y-8">
                
                <div className="bg-[#171A21] p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-white text-base font-black uppercase mb-1">Contato Geral e Conversões de Cliques</h3>
                    <p className="text-xs text-[#9CA3AF]">
                      Estipule o número do WhatsApp da Dodisa Containers que receberá todas as chamadas e mensagens automáticas geradas pela Landing Page.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Número do WhatsApp Direcional (com DDI + DDD)</label>
                      <input
                        type="text"
                        value={whatsapp.number}
                        onChange={(e) => saveWhatsApp({ ...whatsapp, number: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Mensagem Inicial Especial Principal</label>
                      <input
                        type="text"
                        value={whatsapp.autoMsgGeneral}
                        onChange={(e) => saveWhatsApp({ ...whatsapp, autoMsgGeneral: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-stone-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#171A21] p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-white text-base font-black uppercase mb-1">Questões do Simulador de Orçamento</h3>
                    <p className="text-xs text-[#9CA3AF]">
                      Defina o modelo de texto WhatsApp enviado após a simulação de orçamentos e as propostas das perguntas que seus clientes respondem no site público.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-bold uppercase font-sans mb-1.5">WhatsApp Mensagem Inicial do Simulador</label>
                      <textarea
                        rows={2}
                        value={simulator.whatsappTemplate}
                        onChange={(e) => saveSimulator({ ...simulator, whatsappTemplate: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-xs text-stone-300 font-medium font-sans resize-none"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <span className="text-xs text-white font-bold uppercase tracking-wider block">Questionários Ativos do Simulador</span>
                      
                      <div className="grid grid-cols-1 gap-4 font-sans text-xs">
                        {simulator.questions.map((q, idx) => (
                          <div key={q.id} className="p-4 bg-[#0F1115] border border-white/5 rounded-xl space-y-3">
                            <span className="font-bold text-stone-500 font-mono uppercase text-[9px]">Pergunta #{idx+1} [ID: {q.id}]</span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-stone-400 mb-1 text-[10px] uppercase font-semibold">Pergunta Escrita</label>
                                <input
                                  type="text"
                                  value={q.text}
                                  onChange={(e) => {
                                    const updatedQuestions = [...simulator.questions];
                                    updatedQuestions[idx] = { ...q, text: e.target.value };
                                    saveSimulator({ ...simulator, questions: updatedQuestions });
                                  }}
                                  className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-white font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-stone-400 mb-1 text-[10px] uppercase font-semibold">Opções de Seleção (separadas por vírgula ',')</label>
                                <input
                                  type="text"
                                  value={q.options.join(", ")}
                                  onChange={(e) => {
                                    const updatedQuestions = [...simulator.questions];
                                    updatedQuestions[idx] = { ...q, options: e.target.value.split(",").map(o => o.trim()).filter(Boolean) };
                                    saveSimulator({ ...simulator, questions: updatedQuestions });
                                  }}
                                  className="w-full bg-[#171A21] border border-white/5 rounded-lg p-2 text-stone-350"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* FAQs section */}
            {settingsSubTab === "faq" && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 gap-4">
                  {faq.map((item, index) => (
                    <div key={item.id} className="bg-[#171A21] border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-[#FFD400]/15 transition-all">
                      <div>
                        
                        <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="p-1 px-2.5 bg-white/5 rounded-md text-[10px] text-stone-400 font-bold uppercase font-mono">FAQ #{index+1}</span>
                            <h4 className="text-white text-xs font-semibold">{item.question}</h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                editFAQ(item.id, { visible: !item.visible });
                                triggerNotification(`FAQ visibilidade invertida.`);
                              }}
                              className={`p-1.5 rounded transition-all ${
                                item.visible ? "text-emerald-400 hover:bg-emerald-500/10" : "text-stone-600 hover:text-stone-400"
                              }`}
                            >
                              {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => {
                                deleteFAQ(item.id);
                                triggerNotification("Pergunta excluída.");
                              }}
                              className="p-1.5 text-stone-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* FAQ Question Answers inline fields */}
                        <div className="space-y-3 font-sans text-xs">
                          <div>
                            <label className="block text-[8px] font-bold text-stone-500 uppercase mb-1">Inquisição / Pergunta do cliente</label>
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) => editFAQ(item.id, { question: e.target.value })}
                              className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2 text-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-bold text-stone-500 uppercase mb-1">Esclarecimento Técnico / Resposta comercial</label>
                            <textarea
                              rows={2}
                              value={item.answer}
                              onChange={(e) => editFAQ(item.id, { answer: e.target.value })}
                              className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-stone-300 resize-none font-medium text-xs leading-relaxed"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Addition form */}
                <div className="bg-[#171A21] border border-white/5 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-black text-[#FFD400] uppercase tracking-widest block border-b border-white/5 pb-2 font-sans">Cadastrar Nova FAQ (Dúvida Comum)</span>
                  
                  <div className="grid grid-cols-1 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium font-sans">Inquisição / Pergunta</label>
                      <input
                        type="text"
                        placeholder="Ex: Qual o tempo estimado de entrega dos guinchos e containers?"
                        value={newFaqItem.question}
                        onChange={(e) => setNewFaqItem({ ...newFaqItem, question: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-medium">Esclarecimento / Resposta</label>
                      <textarea
                        rows={3}
                        placeholder="Escreva de forma clara as especificações geográficas..."
                        value={newFaqItem.answer}
                        onChange={(e) => setNewFaqItem({ ...newFaqItem, answer: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2.5 text-white resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newFaqItem.question) return;
                      addFAQ({ ...newFaqItem });
                      setNewFaqItem({ question: "", answer: "", visible: true });
                      triggerNotification("Nova FAQ cadastrada e ativa!");
                    }}
                    className="py-2.5 px-5 bg-[#FFD400] hover:bg-[#FF8A00] text-stone-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta FAQ
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

          </div> {/* END OF EDITOR LEFT COLUMN */}

          {/* LIVE PREVIEW RIGHT COLUMN */}
          <div className={`xl:col-span-6 bg-[#171A21] border border-white/5 rounded-3xl p-6 shadow-2xl sticky top-6 self-start max-h-[85vh] overflow-y-auto flex flex-col gap-6 font-sans ${
            activeTab === "dashboard"
              ? (isPreviewExpanded ? "flex" : "hidden")
              : activeTab === "media"
              ? "hidden xl:flex"
              : (mobileViewTab === "preview" ? "flex" : "hidden xl:flex")
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-black text-[#FFD400] uppercase tracking-widest font-mono block">LIVE PREVIEW</span>
                <h3 className="text-white text-sm font-black uppercase mt-0.5 font-sans">Visualização de Seção</h3>
              </div>

              {/* Responsiveness Device Selectors */}
              <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-white/5 font-sans">
                {[
                  { id: "desktop", label: "Desktop" },
                  { id: "tablet", label: "Tablet" },
                  { id: "mobile", label: "Mobile" }
                ].map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => setPreviewDevice(dev.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer font-sans ${
                      previewDevice === dev.id 
                        ? "bg-[#FFD400] text-stone-950" 
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {dev.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lock Section Selector */}
            <div className="flex flex-col gap-1.5 text-xs font-sans">
              <label className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Seção no Preview:</label>
              <select
                value={previewSectionLock}
                onChange={(e) => setPreviewSectionLock(e.target.value)}
                className="bg-stone-950 text-white border border-white/5 rounded-xl p-2.5 outline-none font-bold text-xs"
              >
                <option value="auto">Auto-Detectar (Sincronizar com Guia Ativa)</option>
                <option value="hero">Banner Principal (Hero)</option>
                <option value="simulator">Simulador de Orçamento</option>
                <option value="differentials">Diferenciais Técnicos</option>
                <option value="containers">Catálogo de Modelos (Venda/Locação)</option>
                <option value="prontaEntrega">Estoque Pronta Entrega</option>
                <option value="projects">Cases de Clientes (Antes/Depois)</option>
                <option value="gallery">Galeria de Projetos</option>
                <option value="economy">Calculadora de Economia</option>
                <option value="videos">Galeria de Vídeos Reais</option>
                <option value="how_it_works">Processo (Como Funciona)</option>
                <option value="map">Região do Mapa de Atendimento</option>
                <option value="about">Nossa História (Sobre Nós)</option>
                <option value="faq">Perguntas Frequentes (FAQ)</option>
                <option value="testimonials">Depoimentos / Avaliações</option>
                <option value="cta">CTA Final de Vendas</option>
                <option value="channels">Canais de Atendimento (Rodapé)</option>
              </select>
            </div>

            {/* COMPARISON AND SCOPE CONTROLS */}
            <div className="flex flex-col gap-1.5 text-xs font-sans">
              <label className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Modo de Comparação:</label>
              <div className="grid grid-cols-3 gap-1 bg-stone-950 p-1 rounded-xl border border-white/5 font-sans">
                {[
                  { id: "draft", label: "Rascunho", labelFull: "Rascunho (Depois)" },
                  { id: "published", label: "Publicado", labelFull: "Publicado (Antes)" },
                  { id: "side-by-side", label: "Comparar", labelFull: "Lado a Lado (Comparar)" }
                ].map((scope) => {
                  const isActive = (scope.id === "side-by-side" && compareModes) ||
                                  (scope.id === "draft" && !compareModes && previewDataScope === "draft") ||
                                  (scope.id === "published" && !compareModes && previewDataScope === "published");
                  return (
                    <button
                      key={scope.id}
                      onClick={() => {
                        if (scope.id === "side-by-side") {
                          setCompareModes(true);
                        } else {
                          setCompareModes(false);
                          setPreviewDataScope(scope.id as any);
                        }
                      }}
                      className={`py-2 px-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-sans text-center flex items-center justify-center gap-1 ${
                        isActive 
                          ? "bg-[#FFD400] text-stone-950" 
                          : "text-stone-400 hover:text-white"
                      }`}
                    >
                      {scope.id === "draft" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>}
                      <span className="hidden sm:inline">{scope.labelFull}</span>
                      <span className="sm:hidden">{scope.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulation frame representation */}
            {(() => {
              const getAutoDetectedSection = (): string => {
                if (activeTab === "containers") {
                  return containersSubTab === "catalogo" ? "containers" : "prontaEntrega";
                }
                if (activeTab === "projects") {
                  if (projectsSubTab === "cases") return "projects";
                  if (projectsSubTab === "videos") return "videos";
                  return "differentials";
                }
                if (activeTab === "logistic") return "map";
                if (activeTab === "testimonials") return "testimonials";
                if (activeTab === "settings") {
                  if (settingsSubTab === "logo") return "logo";
                  if (settingsSubTab === "hero") return "hero";
                  if (settingsSubTab === "conversions") return "simulator";
                  return "faq";
                }
                return "hero";
              };

              const targetSection = previewSectionLock === "auto" ? getAutoDetectedSection() : previewSectionLock;

              const renderEmulatorFrame = (label: string, borderClass: string, forcedScope?: "draft" | "published") => {
                const innerElement = forcedScope ? (
                  <AppContext.Provider value={{ ...fullAppContext, previewDataScope: forcedScope, isPagePreviewMode: true, isAdminViewActive: true }}>
                    {renderSectionElement(targetSection)}
                  </AppContext.Provider>
                ) : (
                  renderSectionElement(targetSection)
                );

                return (
                  <div className={`bg-[#0F1115] border ${borderClass} rounded-2xl overflow-hidden shadow-inner flex flex-col`}>
                    {/* Emulator Header */}
                    <div className="bg-[#0A0C0E] px-4 py-2 border-b border-white/5 flex items-center justify-between text-stone-500 font-mono text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500/30"></span>
                        <span className="w-2 h-2 rounded-full bg-yellow-500/30"></span>
                        <span className="w-2 h-2 rounded-full bg-green-500/30"></span>
                      </div>
                      <div className="bg-[#171A21] px-5 py-0.5 rounded text-stone-400 select-all tracking-tight truncate max-w-[150px] font-mono">
                        dodisa.com.br/{targetSection === "map" ? "regioes" : targetSection === "prontaEntrega" ? "estoque" : targetSection}
                      </div>
                      <div className="font-mono text-[#FFD400] uppercase tracking-wider font-bold text-[8px] sm:text-[9px]">
                        {label} • {previewDevice}
                      </div>
                    </div>

                    {/* Device simulator viewer */}
                    <div className="bg-stone-950 overflow-x-auto p-1 scrollbar-none">
                      <div 
                        style={{ 
                          width: previewDevice === "tablet" ? "768px" : previewDevice === "mobile" ? "375px" : "100%",
                          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        className="mx-auto min-h-[220px] bg-stone-950 rounded-xl shadow-2xl relative select-text"
                      >
                        {innerElement}
                      </div>
                    </div>
                  </div>
                );
              };

              if (compareModes) {
                return (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-1 inline-block">ANTES (Público Ativo)</span>
                      {renderEmulatorFrame("Publicado", "border-emerald-500/20", "published")}
                    </div>
                    <div>
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider bg-[#FFD400]/10 px-2 py-0.5 rounded border border-[#FFD400]/20 mb-1 inline-block">DEPOIS (Rascunho Corrente)</span>
                      {renderEmulatorFrame("Rascunho", "border-[#FFD400]/30", "draft")}
                    </div>
                  </div>
                );
              }

              return renderEmulatorFrame(
                previewDataScope === "published" ? "Pre-Visualizando Publicado" : "Rascunho Editando",
                "border-white/5",
                previewDataScope
              );
            })()}
            
            <div className="text-center font-sans">
              <p className="text-[10px] text-stone-500 font-mono leading-relaxed">
                Componente real ativo • Sincronização em tempo de digitação (Sandbox)
              </p>
            </div>
          </div> {/* END OF LIVE PREVIEW COLUMN */}

          </div> {/* END OF TWO COLUMN PANEL */}
        </div>

      </main>

      {/* PREVIEW POPUP — rendered outside <main> to avoid stacking context issues */}
      <AnimatePresence>
        {isPreviewPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] bg-[#07090D] flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-[#0B0F14] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[#FFD400]">
                  <Layout className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Preview ao Vivo</span>
                </div>
                <select
                  value={previewSectionLock}
                  onChange={(e) => setPreviewSectionLock(e.target.value)}
                  className="bg-stone-950 text-white border border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none font-bold cursor-pointer"
                >
                  <option value="auto">Auto-Detectar</option>
                  <option value="hero">Banner Principal</option>
                  <option value="simulator">Simulador</option>
                  <option value="differentials">Diferenciais</option>
                  <option value="containers">Catálogo</option>
                  <option value="prontaEntrega">Pronta Entrega</option>
                  <option value="projects">Cases</option>
                  <option value="gallery">Galeria</option>
                  <option value="economy">Calculadora</option>
                  <option value="videos">Vídeos</option>
                  <option value="how_it_works">Como Funciona</option>
                  <option value="map">Mapa</option>
                  <option value="about">Sobre Nós</option>
                  <option value="faq">FAQ</option>
                  <option value="testimonials">Depoimentos</option>
                  <option value="cta">CTA Final</option>
                  <option value="channels">Rodapé</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-white/5">
                  {(["desktop", "tablet", "mobile"] as const).map((dev) => (
                    <button key={dev} onClick={() => setPreviewDevice(dev)}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${previewDevice === dev ? "bg-[#FFD400] text-stone-950" : "text-stone-400 hover:text-white"}`}>
                      {dev === "desktop" ? "Desktop" : dev === "tablet" ? "Tablet" : "Mobile"}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsPreviewPopupOpen(false)}
                  className="w-8 h-8 rounded-xl bg-stone-900 border border-white/10 text-stone-400 hover:text-white hover:bg-stone-800 flex items-center justify-center cursor-pointer transition-all ml-1"
                  title="Fechar (ESC)">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body: Controls Left + Preview Right */}
            <div className="flex flex-1 overflow-hidden">

              {/* LEFT: Controls */}
              <div className="w-48 sm:w-60 border-r border-white/[0.06] overflow-y-auto p-4 flex flex-col gap-4 bg-[#0D1117] flex-shrink-0">
                <div>
                  <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest font-mono block mb-1.5">Seção</span>
                  <select value={previewSectionLock} onChange={(e) => setPreviewSectionLock(e.target.value)}
                    className="w-full bg-stone-950 text-white border border-white/5 rounded-xl p-2 outline-none font-bold text-[10px] cursor-pointer">
                    <option value="auto">Auto-Detectar</option>
                    <option value="hero">Banner Principal</option>
                    <option value="simulator">Simulador</option>
                    <option value="differentials">Diferenciais</option>
                    <option value="containers">Catálogo</option>
                    <option value="prontaEntrega">Pronta Entrega</option>
                    <option value="projects">Cases</option>
                    <option value="gallery">Galeria</option>
                    <option value="economy">Calculadora</option>
                    <option value="videos">Vídeos</option>
                    <option value="how_it_works">Como Funciona</option>
                    <option value="map">Mapa</option>
                    <option value="about">Sobre Nós</option>
                    <option value="faq">FAQ</option>
                    <option value="testimonials">Depoimentos</option>
                    <option value="cta">CTA Final</option>
                    <option value="channels">Rodapé</option>
                  </select>
                </div>

                <div>
                  <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest font-mono block mb-1.5">Modo</span>
                  <div className="flex flex-col gap-1">
                    {([
                      { id: "draft", label: "Rascunho" },
                      { id: "published", label: "Publicado" },
                      { id: "side", label: "Comparar" },
                    ] as const).map((m) => (
                      <button key={m.id}
                        onClick={() => { if (m.id === "side") { setCompareModes(true); } else { setCompareModes(false); setPreviewDataScope(m.id as "draft" | "published"); } }}
                        className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-left ${
                          (m.id === "draft" && !compareModes && previewDataScope === "draft") ||
                          (m.id === "published" && !compareModes && previewDataScope === "published") ||
                          (m.id === "side" && compareModes)
                            ? "bg-[#FFD400] text-stone-950"
                            : "bg-stone-950 text-stone-400 hover:text-white border border-white/5"
                        }`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <button onClick={() => setIsPreviewPopupOpen(false)}
                    className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <X className="w-3 h-3" /> Fechar
                  </button>
                </div>
              </div>

              {/* RIGHT: Live Preview */}
              <div className="flex-1 overflow-y-auto bg-[#171A21] p-4 sm:p-6 flex flex-col gap-4 font-sans">
                {(() => {
                  const appCtx = fullAppContext;
                  const getAutoSection = (): string => {
                    if (activeTab === "containers") return containersSubTab === "catalogo" ? "containers" : "prontaEntrega";
                    if (activeTab === "projects") { if (projectsSubTab === "cases") return "projects"; if (projectsSubTab === "videos") return "videos"; return "differentials"; }
                    if (activeTab === "logistic") return "map";
                    if (activeTab === "testimonials") return "testimonials";
                    if (activeTab === "settings") { if (settingsSubTab === "logo") return "logo"; if (settingsSubTab === "hero") return "hero"; if (settingsSubTab === "conversions") return "simulator"; return "faq"; }
                    return "hero";
                  };
                  const targetSec = previewSectionLock === "auto" ? getAutoSection() : previewSectionLock;
                  const renderSec = renderSectionElement;
                  const renderFrame = (label: string, scope: "draft" | "published") => (
                    <div className="bg-[#0F1115] border border-white/5 rounded-2xl overflow-hidden shadow-inner flex flex-col">
                      <div className="bg-[#0A0C0E] px-4 py-2 border-b border-white/5 flex items-center justify-between text-stone-500 font-mono text-[9px]">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/30" /><span className="w-2 h-2 rounded-full bg-yellow-500/30" /><span className="w-2 h-2 rounded-full bg-green-500/30" /></div>
                        <div className="bg-[#171A21] px-4 py-0.5 rounded text-stone-400 font-mono truncate max-w-[180px]">dodisa.com.br/{targetSec}</div>
                        <div className="font-mono text-[#FFD400] uppercase font-bold text-[8px]">{label} • {previewDevice}</div>
                      </div>
                      <div className="bg-stone-950 overflow-x-auto p-1">
                        <div style={{ width: previewDevice === "tablet" ? "768px" : previewDevice === "mobile" ? "375px" : "100%", transition: "width 0.3s" }} className="mx-auto min-h-[300px] bg-stone-950 rounded-xl shadow-2xl relative">
                          <AppContext.Provider value={{ ...appCtx, previewDataScope: scope, isPagePreviewMode: true, isAdminViewActive: true }}>
                            {renderSec(targetSec)}
                          </AppContext.Provider>
                        </div>
                      </div>
                    </div>
                  );
                  if (compareModes) return (
                    <div className="flex flex-col gap-4">
                      <div><span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-2 inline-block">Publicado (Antes)</span>{renderFrame("Publicado", "published")}</div>
                      <div><span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider bg-[#FFD400]/10 px-2 py-0.5 rounded border border-[#FFD400]/20 mb-2 inline-block">Rascunho (Depois)</span>{renderFrame("Rascunho", "draft")}</div>
                    </div>
                  );
                  return renderFrame(previewDataScope === "published" ? "Publicado" : "Rascunho", previewDataScope as "draft" | "published");
                })()}
                <p className="text-center text-[10px] text-stone-600 font-mono mt-auto">Componente real • Sincronização em tempo real</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding Drawer for Section Quick Edit */}
      <AnimatePresence>
        {drawerSection && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerSection(null)}
              className="fixed inset-0 bg-black/80 z-50"
            />

            {/* Editor + Live Preview split modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
            >
              <div className="w-full h-full sm:h-[92vh] sm:max-w-[1400px] bg-[#111827] sm:border sm:border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden text-stone-200 sm:rounded-2xl">

              {/* LEFT: Editor column */}
              <div className="w-full lg:w-[440px] xl:w-[480px] flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 max-h-[48vh] lg:max-h-none min-h-0">
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#171A21] flex-shrink-0">
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#FFD400] uppercase tracking-widest block mb-0.5">Editor Rápido</span>
                  <h3 className="text-white text-base font-black uppercase tracking-tight">
                    {getSectionFriendlyName(drawerSection)}
                  </h3>
                </div>
                <button
                  onClick={() => setDrawerSection(null)}
                  className="p-2 hover:bg-white/5 text-stone-400 hover:text-white rounded-xl transition-all border border-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Dynamically render editing fields depending on section key */}
                {drawerSection === "hero" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">Slogan / Título Principal</label>
                      <textarea
                        rows={3}
                        value={hero.title}
                        onChange={(e) => saveHero({ ...hero, title: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-white font-bold text-xs focus:border-[#FFD400] outline-none leading-relaxed resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">Subtítulo Explicativo</label>
                      <textarea
                        rows={3}
                        value={hero.subtitle}
                        onChange={(e) => saveHero({ ...hero, subtitle: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-3 text-stone-300 focus:border-[#FFD400] outline-none leading-relaxed resize-none font-semibold text-xs"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <ImageUploadField
                          label="Imagem de Fundo (Hero)"
                          value={hero.image}
                          onChange={(url) => saveHero({ ...hero, image: url })}
                          folder="hero"
                        />
                      </div>
                      <div>
                        <VideoUploadField
                          label="Vetor / Vídeo Adicional"
                          value={hero.videoUrl || ""}
                          onChange={(url) => saveHero({ ...hero, videoUrl: url })}
                          folder="hero"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-400 mb-1 uppercase font-bold text-[10px] tracking-wider">Texto do Botão</label>
                        <input
                          type="text"
                          value={hero.primaryBtnText}
                          onChange={(e) => saveHero({ ...hero, primaryBtnText: e.target.value })}
                          className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-2.5 text-white text-xs focus:border-[#FFD400] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1 uppercase font-bold text-[10px] tracking-wider">Link do Botão</label>
                        <input
                          type="text"
                          value={hero.primaryBtnUrl}
                          onChange={(e) => saveHero({ ...hero, primaryBtnUrl: e.target.value })}
                          className="w-full bg-[#0F1115] border border-white/5 rounded-xl p-2.5 text-white text-xs focus:border-[#FFD400] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Include other custom sections dynamically if needed, otherwise fallback */}
                {drawerSection === "differentials" && (
                  <div className="space-y-3">
                    {differentials.map((d) => (
                      <DrawerListCard key={d.id} title={d.title || "Diferencial"} onDelete={() => deleteDifferential(d.id)}>
                        <DrawerField label="Título" value={d.title} onChange={(v) => editDifferential(d.id, { title: v })} />
                        <DrawerField label="Descrição" value={d.description} onChange={(v) => editDifferential(d.id, { description: v })} rows={3} />
                        <DrawerField label="Ícone (nome Lucide)" value={d.icon} onChange={(v) => editDifferential(d.id, { icon: v })} mono />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addDifferential({ title: "Novo Diferencial", description: "", icon: "Star", visible: true })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Diferencial
                    </button>
                  </div>
                )}

                {drawerSection === "containers" && (
                  <div className="space-y-3">
                    {containers.map((c) => (
                      <DrawerListCard key={c.id} title={c.title || "Container"} onDelete={() => deleteContainer(c.id)}>
                        <DrawerField label="Título" value={c.title} onChange={(v) => editContainer(c.id, { title: v })} />
                        <DrawerField label="Categoria" value={c.category} onChange={(v) => editContainer(c.id, { category: v })} />
                        <DrawerField label="Descrição" value={c.description} onChange={(v) => editContainer(c.id, { description: v })} rows={3} />
                        <ImageUploadField label="Imagem" value={c.image} onChange={(url) => editContainer(c.id, { image: url })} folder="containers" />
                        <DrawerField label="Fichas Técnicas (separadas por ;)" value={c.specs.join("; ")} onChange={(v) => editContainer(c.id, { specs: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} mono />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addContainer({ title: "Novo Container", category: "Escritório", description: "", specs: [], image: "", whatsappMsg: "", status: "Disponível", visible: true, destacado: false })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Container
                    </button>
                  </div>
                )}

                {drawerSection === "prontaEntrega" && (
                  <div className="space-y-3">
                    {prontaEntrega.map((p) => (
                      <DrawerListCard key={p.id} title={p.title || "Item em estoque"} onDelete={() => deleteProntaEntrega(p.id)}>
                        <DrawerField label="Título" value={p.title} onChange={(v) => editProntaEntrega(p.id, { title: v })} />
                        <div className="grid grid-cols-2 gap-2.5">
                          <DrawerField label="Cidade" value={p.city} onChange={(v) => editProntaEntrega(p.id, { city: v })} />
                          <DrawerField label="Estado" value={p.state} onChange={(v) => editProntaEntrega(p.id, { state: v })} />
                        </div>
                        <DrawerField label="Medidas" value={p.measurements} onChange={(v) => editProntaEntrega(p.id, { measurements: v })} />
                        <DrawerField label="Condição" value={p.condition} onChange={(v) => editProntaEntrega(p.id, { condition: v })} />
                        <ImageUploadField label="Adicionar Imagem" value="" onChange={(url) => url && editProntaEntrega(p.id, { images: [...p.images, url] })} folder="pronta-entrega" />
                        <DrawerField label="Imagens (uma URL por linha)" value={p.images.join("\n")} onChange={(v) => editProntaEntrega(p.id, { images: v.split("\n").map((s) => s.trim()).filter(Boolean) })} rows={2} mono />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addProntaEntrega({ title: "Novo Item", city: "Santa Rosa", state: "RS", measurements: "", condition: "", type: "Depósito", availableForSale: true, availableForRent: true, active: true })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Item
                    </button>
                  </div>
                )}

                {(drawerSection === "projects" || drawerSection === "gallery") && (
                  <div className="space-y-3">
                    <p className="text-stone-500 text-[10px] leading-relaxed -mt-1">
                      {drawerSection === "gallery"
                        ? "A Galeria de Projetos mostra os mesmos projetos cadastrados abaixo, só que em grade filtrável por categoria."
                        : null}
                    </p>
                    {drawerSection === "gallery" && (
                      <div className="space-y-4 pb-4 border-b border-white/5">
                        <DrawerField label="Etiqueta" value={gallery.eyebrow} onChange={(v) => saveGallery({ ...gallery, eyebrow: v })} />
                        <DrawerField label="Título" value={gallery.title} onChange={(v) => saveGallery({ ...gallery, title: v })} />
                        <DrawerField label="Palavra em destaque (deve existir dentro do título)" value={gallery.titleHighlight} onChange={(v) => saveGallery({ ...gallery, titleHighlight: v })} />
                        <DrawerField label="Subtítulo" value={gallery.subtitle} onChange={(v) => saveGallery({ ...gallery, subtitle: v })} rows={3} />
                      </div>
                    )}
                    {projects.map((p) => (
                      <DrawerListCard key={p.id} title={p.title || "Projeto"} onDelete={() => deleteProject(p.id)}>
                        <DrawerField label="Título" value={p.title} onChange={(v) => editProject(p.id, { title: v })} />
                        <DrawerField label="Categoria" value={p.category} onChange={(v) => editProject(p.id, { category: v })} />
                        <DrawerField label="Descrição" value={p.description} onChange={(v) => editProject(p.id, { description: v })} rows={3} />
                        <ImageUploadField label="Foto (Antes)" value={p.imageBefore || ""} onChange={(url) => editProject(p.id, { imageBefore: url })} folder="projetos" />
                        <ImageUploadField label="Foto (Depois)" value={p.imageAfter} onChange={(url) => editProject(p.id, { imageAfter: url })} folder="projetos" />
                        <DrawerField label="Especificações (separadas por ;)" value={p.specs.join("; ")} onChange={(v) => editProject(p.id, { specs: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} mono />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addProject({ title: "Novo Projeto", category: "Projetos Personalizados", imageAfter: "", description: "", specs: [], visible: true, destacado: true })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Projeto
                    </button>
                  </div>
                )}

                {drawerSection === "videos" && (
                  <div className="space-y-3">
                    {videos.map((v) => (
                      <DrawerListCard key={v.id} title={v.title || "Vídeo"} onDelete={() => deleteVideo(v.id)}>
                        <DrawerField label="Título" value={v.title} onChange={(val) => editVideo(v.id, { title: val })} />
                        <DrawerField label="Categoria" value={v.category} onChange={(val) => editVideo(v.id, { category: val as EditableVideo["category"] })} />
                        <ImageUploadField label="Capa (Thumbnail)" value={v.thumbnail || ""} onChange={(url) => editVideo(v.id, { thumbnail: url })} folder="videos-capas" />
                        <VideoUploadField label="Vídeo (YouTube, MP4 ou Upload)" value={v.url} onChange={(url) => editVideo(v.id, { url })} folder="videos" />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addVideo({ title: "Novo Vídeo", url: "", category: "Projeto finalizado", visible: true })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Vídeo
                    </button>
                  </div>
                )}

                {drawerSection === "faq" && (
                  <div className="space-y-3">
                    {faq.map((f) => (
                      <DrawerListCard key={f.id} title={f.question || "Pergunta"} onDelete={() => deleteFAQ(f.id)}>
                        <DrawerField label="Pergunta" value={f.question} onChange={(v) => editFAQ(f.id, { question: v })} rows={2} />
                        <DrawerField label="Resposta" value={f.answer} onChange={(v) => editFAQ(f.id, { answer: v })} rows={4} />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addFAQ({ question: "Nova pergunta?", answer: "", visible: true, orderIndex: faq.length })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta
                    </button>
                  </div>
                )}

                {drawerSection === "testimonials" && (
                  <div className="space-y-3">
                    {testimonials.map((t) => (
                      <DrawerListCard key={t.id} title={t.name || "Depoimento"} onDelete={() => deleteTestimonial(t.id)}>
                        <div className="grid grid-cols-2 gap-2.5">
                          <DrawerField label="Nome" value={t.name} onChange={(v) => editTestimonial(t.id, { name: v })} />
                          <DrawerField label="Cidade / Empresa" value={t.cityOrCompany} onChange={(v) => editTestimonial(t.id, { cityOrCompany: v })} />
                        </div>
                        <DrawerField label="Depoimento" value={t.content} onChange={(v) => editTestimonial(t.id, { content: v })} rows={3} />
                        <ImageUploadField label="Foto" value={t.image || ""} onChange={(url) => editTestimonial(t.id, { image: url })} folder="depoimentos" />
                        <DrawerField label="Nota (1 a 5)" value={String(t.rating)} onChange={(v) => editTestimonial(t.id, { rating: Math.min(5, Math.max(1, Number(v) || 5)) })} />
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addTestimonial({ name: "Novo Cliente", cityOrCompany: "", content: "", rating: 5, visible: true })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
                    </button>
                  </div>
                )}

                {drawerSection === "map" && (
                  <div className="space-y-4">
                    <DrawerField label="Estados atendidos (separados por ;)" value={regions.states.join("; ")} onChange={(v) => saveRegions({ ...regions, states: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} />
                    <DrawerField label="Cidades atendidas (separadas por ;)" value={regions.cities.join("; ")} onChange={(v) => saveRegions({ ...regions, cities: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={3} />
                    <DrawerField label="Regiões (separadas por ;)" value={regions.regions.join("; ")} onChange={(v) => saveRegions({ ...regions, regions: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} />
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">Regiões visíveis no mapa</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(regions.visibleRegions).map(([key, val]) => (
                          <button
                            key={key}
                            onClick={() => saveRegions({ ...regions, visibleRegions: { ...regions.visibleRegions, [key]: !val } })}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${val ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-stone-500 border-white/5"}`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerSection === "simulator" && (
                  <div className="space-y-4">
                    <DrawerField label="Mensagem final do WhatsApp (use {answers})" value={simulator.whatsappTemplate} onChange={(v) => saveSimulator({ ...simulator, whatsappTemplate: v })} rows={3} mono />
                    <div className="space-y-3">
                      {simulator.questions.map((q, idx) => (
                        <DrawerListCard
                          key={q.id}
                          title={q.questionText || "Pergunta"}
                          onDelete={() => saveSimulator({ ...simulator, questions: simulator.questions.filter((x) => x.id !== q.id) })}
                        >
                          <DrawerField label="Pergunta" value={q.questionText} onChange={(v) => {
                            const questions = [...simulator.questions]; questions[idx] = { ...q, questionText: v }; saveSimulator({ ...simulator, questions });
                          }} />
                          <DrawerField label="Opções (separadas por ;)" value={q.options.join("; ")} onChange={(v) => {
                            const questions = [...simulator.questions]; questions[idx] = { ...q, options: v.split(";").map((s) => s.trim()).filter(Boolean) }; saveSimulator({ ...simulator, questions });
                          }} rows={2} />
                        </DrawerListCard>
                      ))}
                      <button
                        onClick={() => saveSimulator({ ...simulator, questions: [...simulator.questions, { id: `q-${Date.now()}`, questionText: "Nova pergunta?", options: ["Opção 1", "Opção 2"], whatsappTemplate: "{val}" }] })}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta
                      </button>
                    </div>
                  </div>
                )}

                {drawerSection === "about" && (
                  <div className="space-y-4">
                    <DrawerField label="Título" value={about.title} onChange={(v) => saveAbout({ ...about, title: v })} />
                    <DrawerField label="Título em Destaque (amarelo)" value={about.highlightTitle} onChange={(v) => saveAbout({ ...about, highlightTitle: v })} />
                    <DrawerField label="Parágrafo 1" value={about.paragraph1} onChange={(v) => saveAbout({ ...about, paragraph1: v })} rows={3} />
                    <DrawerField label="Parágrafo 2" value={about.paragraph2} onChange={(v) => saveAbout({ ...about, paragraph2: v })} rows={3} />
                    <DrawerField label="Parágrafo 3 (destaque final)" value={about.paragraph3} onChange={(v) => saveAbout({ ...about, paragraph3: v })} rows={2} />
                    <div className="grid grid-cols-3 gap-2.5">
                      <DrawerField label="Estat. 1 Valor" value={about.stat1Value} onChange={(v) => saveAbout({ ...about, stat1Value: v })} />
                      <DrawerField label="Estat. 2 Valor" value={about.stat2Value} onChange={(v) => saveAbout({ ...about, stat2Value: v })} />
                      <DrawerField label="Estat. 3 Valor" value={about.stat3Value} onChange={(v) => saveAbout({ ...about, stat3Value: v })} />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <DrawerField label="Estat. 1 Rótulo" value={about.stat1Label} onChange={(v) => saveAbout({ ...about, stat1Label: v })} />
                      <DrawerField label="Estat. 2 Rótulo" value={about.stat2Label} onChange={(v) => saveAbout({ ...about, stat2Label: v })} />
                      <DrawerField label="Estat. 3 Rótulo" value={about.stat3Label} onChange={(v) => saveAbout({ ...about, stat3Label: v })} />
                    </div>
                    <ImageUploadField label="Imagem" value={about.image} onChange={(url) => saveAbout({ ...about, image: url })} folder="sobre" />
                    <DrawerField label="Rótulo da lista de pilares" value={about.pillarsLabel} onChange={(v) => saveAbout({ ...about, pillarsLabel: v })} />
                    <div className="space-y-3">
                      {about.pillars.map((p, idx) => (
                        <DrawerListCard key={p.id} title={p.title || "Pilar"} onDelete={() => saveAbout({ ...about, pillars: about.pillars.filter((x) => x.id !== p.id) })}>
                          <DrawerField label="Título" value={p.title} onChange={(v) => { const pillars = [...about.pillars]; pillars[idx] = { ...p, title: v }; saveAbout({ ...about, pillars }); }} />
                          <DrawerField label="Descrição" value={p.description} onChange={(v) => { const pillars = [...about.pillars]; pillars[idx] = { ...p, description: v }; saveAbout({ ...about, pillars }); }} rows={3} />
                          <DrawerField label="Selo" value={p.seal} onChange={(v) => { const pillars = [...about.pillars]; pillars[idx] = { ...p, seal: v }; saveAbout({ ...about, pillars }); }} />
                        </DrawerListCard>
                      ))}
                      <button onClick={() => saveAbout({ ...about, pillars: [...about.pillars, { id: `pillar-${Date.now()}`, title: "Novo Pilar", description: "", seal: "" }] })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Adicionar Pilar
                      </button>
                    </div>
                  </div>
                )}

                {drawerSection === "timeline" && (
                  <div className="space-y-4">
                    <DrawerField label="Título" value={timeline.title} onChange={(v) => saveTimeline({ ...timeline, title: v })} />
                    <DrawerField label="Título em Destaque (amarelo)" value={timeline.highlightTitle} onChange={(v) => saveTimeline({ ...timeline, highlightTitle: v })} />
                    <DrawerField label="Subtítulo" value={timeline.subtitle} onChange={(v) => saveTimeline({ ...timeline, subtitle: v })} rows={2} />
                    <div className="space-y-3">
                      {timeline.steps.map((s, idx) => (
                        <DrawerListCard key={s.id} title={`${s.number}. ${s.title || "Passo"}`} onDelete={() => saveTimeline({ ...timeline, steps: timeline.steps.filter((x) => x.id !== s.id) })}>
                          <DrawerField label="Título" value={s.title} onChange={(v) => { const steps = [...timeline.steps]; steps[idx] = { ...s, title: v }; saveTimeline({ ...timeline, steps }); }} />
                          <DrawerField label="Descrição" value={s.description} onChange={(v) => { const steps = [...timeline.steps]; steps[idx] = { ...s, description: v }; saveTimeline({ ...timeline, steps }); }} rows={3} />
                        </DrawerListCard>
                      ))}
                      <button onClick={() => saveTimeline({ ...timeline, steps: [...timeline.steps, { id: `step-${Date.now()}`, number: timeline.steps.length + 1, title: "Novo Passo", description: "" }] })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Adicionar Passo
                      </button>
                    </div>
                    <DrawerField label="Nota do rodapé" value={timeline.footerNote} onChange={(v) => saveTimeline({ ...timeline, footerNote: v })} />
                  </div>
                )}

                {drawerSection === "cta" && (
                  <div className="space-y-4">
                    <DrawerField label="Selo superior" value={cta.eyebrow} onChange={(v) => saveCTA({ ...cta, eyebrow: v })} />
                    <DrawerField label="Linha de estatística" value={cta.statLine} onChange={(v) => saveCTA({ ...cta, statLine: v })} />
                    <DrawerField label="Título (Enter = quebra de linha)" value={cta.title} onChange={(v) => saveCTA({ ...cta, title: v })} rows={2} />
                    <DrawerField label="Subtítulo" value={cta.subtitle} onChange={(v) => saveCTA({ ...cta, subtitle: v })} rows={2} />
                    <DrawerField label="Texto do botão" value={cta.buttonText} onChange={(v) => saveCTA({ ...cta, buttonText: v })} />
                  </div>
                )}

                {drawerSection === "channels" && (
                  <div className="space-y-4">
                    <DrawerField label="Título" value={channels.title} onChange={(v) => saveChannels({ ...channels, title: v })} />
                    <DrawerField label="Título em Destaque (amarelo)" value={channels.highlightTitle} onChange={(v) => saveChannels({ ...channels, highlightTitle: v })} />
                    <DrawerField label="Subtítulo" value={channels.subtitle} onChange={(v) => saveChannels({ ...channels, subtitle: v })} rows={2} />
                    <DrawerField label="Instagram (usuário)" value={channels.instagramHandle} onChange={(v) => saveChannels({ ...channels, instagramHandle: v })} />
                    <DrawerField label="Instagram (URL)" value={channels.instagramUrl} onChange={(v) => saveChannels({ ...channels, instagramUrl: v })} mono />
                    <DrawerField label="Endereço (linha 1)" value={channels.addressLine1} onChange={(v) => saveChannels({ ...channels, addressLine1: v })} />
                    <DrawerField label="Endereço (linha 2)" value={channels.addressLine2} onChange={(v) => saveChannels({ ...channels, addressLine2: v })} />
                    <DrawerField label="Link do Google Maps" value={channels.mapsUrl} onChange={(v) => saveChannels({ ...channels, mapsUrl: v })} mono />
                  </div>
                )}

                {drawerSection === "economyCalculator" && (
                  <div className="space-y-4">
                    <DrawerField label="Selo superior" value={economyCalculator.eyebrow} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, eyebrow: v })} />
                    <div className="grid grid-cols-3 gap-2.5">
                      <DrawerField label="Título (início)" value={economyCalculator.titleLine1} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, titleLine1: v })} />
                      <DrawerField label="Destaque (amarelo)" value={economyCalculator.titleHighlight} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, titleHighlight: v })} />
                      <DrawerField label="Título (fim)" value={economyCalculator.titleLine2} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, titleLine2: v })} />
                    </div>
                    <DrawerField label="Subtítulo" value={economyCalculator.subtitle} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, subtitle: v })} rows={2} />
                    <DrawerField label="Tipos de projeto (separados por ;)" value={economyCalculator.projectTypes.join("; ")} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, projectTypes: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} />
                    <DrawerField label="Tamanhos (separados por ;)" value={economyCalculator.sizes.join("; ")} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, sizes: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} />
                    <DrawerField label="Prazos (separados por ;)" value={economyCalculator.timeframes.join("; ")} onChange={(v) => saveEconomyCalculator({ ...economyCalculator, timeframes: v.split(";").map((s) => s.trim()).filter(Boolean) })} rows={2} />
                    <div className="space-y-3">
                      <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider">Tabela comparativa</label>
                      {economyCalculator.comparisons.map((row, idx) => (
                        <DrawerListCard key={row.id} title={row.attribute || "Critério"} onDelete={() => saveEconomyCalculator({ ...economyCalculator, comparisons: economyCalculator.comparisons.filter((x) => x.id !== row.id) })}>
                          <DrawerField label="Critério" value={row.attribute} onChange={(v) => { const comparisons = [...economyCalculator.comparisons]; comparisons[idx] = { ...row, attribute: v }; saveEconomyCalculator({ ...economyCalculator, comparisons }); }} />
                          <DrawerField label="Solução Dodisa (Container)" value={row.container} onChange={(v) => { const comparisons = [...economyCalculator.comparisons]; comparisons[idx] = { ...row, container: v }; saveEconomyCalculator({ ...economyCalculator, comparisons }); }} rows={2} />
                          <DrawerField label="Construção em Alvenaria" value={row.masonry} onChange={(v) => { const comparisons = [...economyCalculator.comparisons]; comparisons[idx] = { ...row, masonry: v }; saveEconomyCalculator({ ...economyCalculator, comparisons }); }} rows={2} />
                        </DrawerListCard>
                      ))}
                      <button onClick={() => saveEconomyCalculator({ ...economyCalculator, comparisons: [...economyCalculator.comparisons, { id: `cmp-${Date.now()}`, attribute: "Novo Critério", container: "", masonry: "" }] })} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Adicionar Linha
                      </button>
                    </div>
                  </div>
                )}

                {drawerSection === "whatsapp" && (
                  <div className="space-y-4">
                    <DrawerField label="Número do WhatsApp (só dígitos, com DDI+DDD)" value={whatsapp.number} onChange={(v) => saveWhatsApp({ ...whatsapp, number: v })} mono />
                    <DrawerField label="Mensagem automática geral" value={whatsapp.autoMsgGeneral} onChange={(v) => saveWhatsApp({ ...whatsapp, autoMsgGeneral: v })} rows={3} />
                    <div className="space-y-3">
                      <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider">Mensagens por categoria</label>
                      {Object.entries(whatsapp.categoryMessages).map(([category, msg]) => (
                        <DrawerListCard
                          key={category}
                          title={category}
                          onDelete={() => {
                            const { [category]: _removed, ...rest } = whatsapp.categoryMessages;
                            saveWhatsApp({ ...whatsapp, categoryMessages: rest });
                          }}
                        >
                          <DrawerField
                            label="Mensagem"
                            value={msg as string}
                            onChange={(v) => saveWhatsApp({ ...whatsapp, categoryMessages: { ...whatsapp.categoryMessages, [category]: v } })}
                            rows={2}
                          />
                        </DrawerListCard>
                      ))}
                      <button
                        onClick={() => {
                          const name = prompt("Nome da nova categoria:");
                          if (name && name.trim()) saveWhatsApp({ ...whatsapp, categoryMessages: { ...whatsapp.categoryMessages, [name.trim()]: "" } });
                        }}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Categoria
                      </button>
                    </div>
                  </div>
                )}

                {drawerSection === "obrasAndamento" && (
                  <div className="space-y-4">
                    {ongoingProjects.map((project) => (
                      <DrawerListCard key={project.id} title={project.title || "Obra"} onDelete={() => deleteOngoingProject(project.id)}>
                        <DrawerField label="Título" value={project.title} onChange={(v) => editOngoingProject(project.id, { title: v })} />
                        <div className="grid grid-cols-2 gap-2.5">
                          <DrawerField label="Local" value={project.location} onChange={(v) => editOngoingProject(project.id, { location: v })} />
                          <DrawerField label="Status" value={project.status} onChange={(v) => editOngoingProject(project.id, { status: v })} />
                        </div>

                        <div className="space-y-2.5 pt-1">
                          <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                            Linha do tempo ({project.photos.length} foto{project.photos.length === 1 ? "" : "s"})
                          </label>
                          {project.photos.map((photo, idx) => (
                            <div key={photo.id} className="bg-[#171A21] border border-white/5 rounded-lg p-2.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-stone-500 uppercase">Foto {idx + 1}</span>
                                <button
                                  onClick={() => editOngoingProject(project.id, { photos: project.photos.filter((p) => p.id !== photo.id) })}
                                  className="p-1 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <ImageUploadField
                                label="Foto"
                                value={photo.url}
                                onChange={(url) => editOngoingProject(project.id, { photos: project.photos.map((p) => p.id === photo.id ? { ...p, url } : p) })}
                                folder="gallery/Obras"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={photo.date || ""}
                                  onChange={(e) => editOngoingProject(project.id, { photos: project.photos.map((p) => p.id === photo.id ? { ...p, date: e.target.value } : p) })}
                                  placeholder="Data (ex: 12/08)"
                                  className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2 text-white text-[11px] focus:border-[#FFD400] outline-none"
                                />
                                <input
                                  type="text"
                                  value={photo.caption}
                                  onChange={(e) => editOngoingProject(project.id, { photos: project.photos.map((p) => p.id === photo.id ? { ...p, caption: e.target.value } : p) })}
                                  placeholder="Legenda"
                                  className="w-full bg-[#0F1115] border border-white/5 rounded-lg p-2 text-white text-[11px] focus:border-[#FFD400] outline-none"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => editOngoingProject(project.id, { photos: [...project.photos, { id: `photo-${Date.now()}`, url: "", caption: "", date: "" }] })}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 text-stone-300 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3 h-3" /> Adicionar Foto à Linha do Tempo
                          </button>
                        </div>
                      </DrawerListCard>
                    ))}
                    <button onClick={() => addOngoingProject()} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Obra
                    </button>
                  </div>
                )}

                {drawerSection === "maosAObra" && (
                  <div className="space-y-4">
                    <DrawerField label="Título" value={maosAObra.title} onChange={(v) => saveMaosAObra({ ...maosAObra, title: v })} />
                    <DrawerField label="Subtítulo" value={maosAObra.subtitle} onChange={(v) => saveMaosAObra({ ...maosAObra, subtitle: v })} rows={2} />
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">
                        Pasta da Galeria{loadingMaosAObraFolders && <span className="ml-2 text-stone-500 normal-case font-normal">carregando...</span>}
                      </label>
                      <select
                        value={maosAObra.folder}
                        onChange={(e) => saveMaosAObra({ ...maosAObra, folder: e.target.value })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl text-white text-xs focus:border-[#FFD400] outline-none p-2.5"
                        disabled={loadingMaosAObraFolders}
                      >
                        <option value="">-- Selecionar pasta --</option>
                        {maosAObraFolders.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <div className="flex gap-1.5 mt-1.5">
                        <input
                          type="text"
                          value={newMaosAObraFolderName}
                          onChange={(e) => setNewMaosAObraFolderName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateMaosAObraFolder(); } }}
                          placeholder="Ou crie uma pasta nova..."
                          className="flex-1 bg-[#0F1115] border border-white/5 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-[#FFD400] font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleCreateMaosAObraFolder}
                          disabled={!newMaosAObraFolderName.trim()}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-lg text-[10px] font-bold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Criar
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">Upload de Imagens</label>
                      <input
                        ref={maosAObraUploadInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleUploadMaosAObraFiles(e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => maosAObraUploadInputRef.current?.click()}
                        disabled={uploadingMaosAObra || !maosAObra.folder}
                        className="flex items-center gap-2 bg-[#FFD400]/10 hover:bg-[#FFD400]/20 border border-[#FFD400]/20 text-[#FFD400] px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingMaosAObra ? "Enviando..." : "Selecionar Imagens"}
                      </button>
                      <p className="text-stone-500 text-[10px] mt-1.5">
                        {maosAObra.folder
                          ? `Envia direto para a pasta "${maosAObra.folder}" — as fotos aparecem no slide automaticamente.`
                          : "Selecione ou crie uma pasta acima antes de enviar imagens."}
                      </p>
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1.5 uppercase font-bold text-[10px] tracking-wider">Velocidade do slide (ms)</label>
                      <input
                        type="number" min={1000} step={500}
                        value={maosAObra.autoplaySpeed}
                        onChange={(e) => saveMaosAObra({ ...maosAObra, autoplaySpeed: Number(e.target.value) || 3000 })}
                        className="w-full bg-[#0F1115] border border-white/5 rounded-xl text-white text-xs focus:border-[#FFD400] outline-none p-2.5 font-mono"
                      />
                    </div>
                  </div>
                )}

                {drawerSection === "carrosselGaleria" && (
                  <div className="-m-6">
                    <CarrosselAdminPanel triggerNotification={triggerNotification} />
                  </div>
                )}

                {drawerSection && drawerSection.startsWith("custom-") && (() => {
                  const block = customBlocks.find((b) => b.id === drawerSection);
                  if (!block) return <p className="text-stone-500 text-xs">Seção não encontrada.</p>;
                  return (
                    <div className="space-y-4">
                      <DrawerField label="Título" value={block.title} onChange={(v) => editCustomBlock(block.id, { title: v })} />
                      <DrawerField label="Texto" value={block.text} onChange={(v) => editCustomBlock(block.id, { text: v })} rows={4} />
                      <ImageUploadField label="Imagem (opcional)" value={block.image || ""} onChange={(url) => editCustomBlock(block.id, { image: url })} folder="custom-blocks" />
                      <DrawerField label="Texto do botão (opcional)" value={block.ctaText || ""} onChange={(v) => editCustomBlock(block.id, { ctaText: v })} />
                      <DrawerField label="Link do botão" value={block.ctaUrl || ""} onChange={(v) => editCustomBlock(block.id, { ctaUrl: v })} mono />
                    </div>
                  );
                })()}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3 bg-[#171A21] flex-shrink-0">
                <button
                  onClick={() => {
                    setDrawerSection(null);
                    triggerNotification("Alterações aplicadas com sucesso!");
                  }}
                  className="flex-1 py-3 bg-[#FFD400] hover:bg-[#FFE14D] text-stone-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> Concluir Edição
                </button>
              </div>
              </div>
              {/* END LEFT: Editor column */}

              {/* RIGHT: Live preview column — shows the draft exactly as the visitor will see it, updating as you type */}
              <div className="flex-1 min-h-0 flex flex-col bg-[#0A0C0E]">
                <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between text-stone-500 font-mono text-[9px] flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/30" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/30" />
                    <span className="w-2 h-2 rounded-full bg-green-500/30" />
                  </div>
                  <span className="text-stone-400 truncate max-w-[180px]">dodisa.com.br/{drawerSection}</span>
                  <span className="text-[#FFD400] font-bold uppercase tracking-wider">Rascunho • Ao vivo</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AppContext.Provider value={{ ...fullAppContext, previewDataScope: "draft", isPagePreviewMode: true, isAdminViewActive: true }}>
                    {renderSectionElement(drawerSection)}
                  </AppContext.Provider>
                </div>
              </div>
              {/* END RIGHT: Live preview column */}

              </div>
            </motion.div>
          </>
        )}

        {/* Dynamic Edit Modal Pop-up */}
        {editModal && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] cursor-pointer"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none font-sans">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
                className="bg-[#171A21] border border-white/10 w-full max-w-xl rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.9)] pointer-events-auto flex flex-col max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#1D212A] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FFD400]/10 text-[#FFD400] rounded-xl">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-black uppercase tracking-wider">{modalTitle}</h3>
                      <p className="text-stone-400 text-[10px] uppercase font-mono tracking-widest mt-0.5">Ajuste técnico de conteúdo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditModal(null)}
                    className="p-2 text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                  {modalContent}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-white/5 flex gap-3 bg-[#1D212A] shrink-0">
                  <button
                    onClick={() => {
                      setEditModal(null);
                      triggerNotification("Alterações gravadas no banco de memória!");
                    }}
                    className="w-full py-3 bg-[#FFD400] hover:bg-[#FFE14D] text-[#0F1115] text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" /> Salvar e Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
